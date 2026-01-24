import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin, encrypt } from '@/lib/auth';
import { notifyUser, NotificationTemplates } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

// GET - List VPS instances (admin only)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const mt5AccountId = searchParams.get('mt5_account_id');

    let queryText = `
      SELECT
        v.*,
        m.account_number,
        m.server as mt5_server,
        m.platform,
        m.status as mt5_status,
        m.user_id,
        u.email as user_email,
        p.first_name,
        p.last_name
      FROM vps_instances v
      LEFT JOIN mt5_accounts m ON v.mt5_account_id = m.id
      LEFT JOIN users u ON m.user_id = u.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      queryText += ` AND v.status = $${paramIndex++}`;
      params.push(status);
    }

    if (mt5AccountId) {
      queryText += ` AND v.mt5_account_id = $${paramIndex++}`;
      params.push(mt5AccountId);
    }

    queryText += ` ORDER BY v.created_at DESC LIMIT 100`;

    const result = await query(queryText, params);

    // Remove encrypted fields from response
    const data = result.rows.map(row => {
      const { encrypted_ssh_password, encrypted_ssh_key, ...rest } = row;
      return {
        ...rest,
        has_ssh_password: !!encrypted_ssh_password,
        has_ssh_key: !!encrypted_ssh_key
      };
    });

    return NextResponse.json({
      success: true,
      data,
      count: result.rowCount
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    console.error('VPS fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create VPS instance (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const {
      mt5_account_id,
      name,
      ip_address,
      ssh_port = 22,
      ssh_username,
      ssh_password,
      ssh_key,
      os_type = 'windows',
      mt5_path,
      ea_path,
      notes,
      provider,
      provider_instance_id,
      provider_region,
      provider_plan,
    } = await request.json();

    // Validate required fields
    if (!mt5_account_id || !name) {
      return NextResponse.json(
        { success: false, error: 'mt5_account_id and name are required' },
        { status: 400 }
      );
    }

    // Check if VPS already exists for this MT5 account
    const existingVps = await query(
      `SELECT id FROM vps_instances WHERE mt5_account_id = $1`,
      [mt5_account_id]
    );

    if (existingVps.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'VPS instance already exists for this MT5 account' },
        { status: 409 }
      );
    }

    // Encrypt SSH credentials if provided
    const encryptedPassword = ssh_password ? encrypt(ssh_password) : null;
    const encryptedKey = ssh_key ? encrypt(ssh_key) : null;

    // Create VPS instance
    const result = await query(
      `INSERT INTO vps_instances
       (mt5_account_id, name, ip_address, ssh_port, ssh_username, encrypted_ssh_password, encrypted_ssh_key, os_type, mt5_path, ea_path, notes, created_by, status, provider, provider_instance_id, provider_region, provider_plan)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending', $13, $14, $15, $16)
       RETURNING id, mt5_account_id, name, ip_address, ssh_port, ssh_username, os_type, mt5_path, ea_path, notes, status, provider, provider_instance_id, provider_region, provider_plan, created_at`,
      [mt5_account_id, name, ip_address, ssh_port, ssh_username, encryptedPassword, encryptedKey, os_type, mt5_path, ea_path, notes, session.user.id, provider || null, provider_instance_id || null, provider_region || null, provider_plan || null]
    );

    // Get MT5 account details for notification
    const mt5Account = await query(
      `SELECT m.account_number, m.user_id FROM mt5_accounts m WHERE m.id = $1`,
      [mt5_account_id]
    );

    // Notify user that VPS provisioning has started
    if (mt5Account.rows.length > 0) {
      const { account_number, user_id } = mt5Account.rows[0];
      const notification = NotificationTemplates.vpsProvisioning(account_number);
      await notifyUser(user_id, notification.type, notification.title, notification.message);

      // Update MT5 account automation status
      await query(
        `UPDATE mt5_accounts SET automation_status = 'vps_provisioning', updated_at = NOW() WHERE id = $1`,
        [mt5_account_id]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'VPS instance created successfully',
      data: result.rows[0]
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    console.error('VPS create error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update VPS instance (admin only)
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const {
      id,
      name,
      ip_address,
      ssh_port,
      ssh_username,
      ssh_password,
      ssh_key,
      status,
      mt5_path,
      ea_path,
      notes,
      health_status,
      provider,
      provider_instance_id,
      provider_region,
      provider_plan,
    } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'VPS instance ID is required' },
        { status: 400 }
      );
    }

    // Get existing VPS to check for MT5 account
    const existingVps = await query(
      `SELECT v.*, m.account_number, m.user_id FROM vps_instances v
       LEFT JOIN mt5_accounts m ON v.mt5_account_id = m.id
       WHERE v.id = $1`,
      [id]
    );

    if (existingVps.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'VPS instance not found' },
        { status: 404 }
      );
    }

    const oldVps = existingVps.rows[0];

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) { updates.push(`name = $${paramIndex++}`); values.push(name); }
    if (ip_address !== undefined) { updates.push(`ip_address = $${paramIndex++}`); values.push(ip_address); }
    if (ssh_port !== undefined) { updates.push(`ssh_port = $${paramIndex++}`); values.push(ssh_port); }
    if (ssh_username !== undefined) { updates.push(`ssh_username = $${paramIndex++}`); values.push(ssh_username); }
    if (ssh_password !== undefined) { updates.push(`encrypted_ssh_password = $${paramIndex++}`); values.push(encrypt(ssh_password)); }
    if (ssh_key !== undefined) { updates.push(`encrypted_ssh_key = $${paramIndex++}`); values.push(encrypt(ssh_key)); }
    if (status !== undefined) { updates.push(`status = $${paramIndex++}`); values.push(status); }
    if (mt5_path !== undefined) { updates.push(`mt5_path = $${paramIndex++}`); values.push(mt5_path); }
    if (ea_path !== undefined) { updates.push(`ea_path = $${paramIndex++}`); values.push(ea_path); }
    if (notes !== undefined) { updates.push(`notes = $${paramIndex++}`); values.push(notes); }
    if (health_status !== undefined) {
      updates.push(`health_status = $${paramIndex++}`);
      values.push(health_status);
      updates.push(`last_health_check = NOW()`);
    }
    if (provider !== undefined) { updates.push(`provider = $${paramIndex++}`); values.push(provider || null); }
    if (provider_instance_id !== undefined) { updates.push(`provider_instance_id = $${paramIndex++}`); values.push(provider_instance_id || null); }
    if (provider_region !== undefined) { updates.push(`provider_region = $${paramIndex++}`); values.push(provider_region || null); }
    if (provider_plan !== undefined) { updates.push(`provider_plan = $${paramIndex++}`); values.push(provider_plan || null); }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No updates provided' },
        { status: 400 }
      );
    }

    updates.push('updated_at = NOW()');
    values.push(id);

    const result = await query(
      `UPDATE vps_instances SET ${updates.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, mt5_account_id, name, ip_address, ssh_port, ssh_username, os_type, mt5_path, ea_path, notes, status, health_status, last_health_check, provider, provider_instance_id, provider_region, provider_plan, updated_at`,
      values
    );

    // Send notification if status changed to 'active' (VPS is ready)
    if (status === 'active' && oldVps.status !== 'active' && oldVps.user_id) {
      const notification = NotificationTemplates.vpsReady(oldVps.account_number, name || oldVps.name);
      await notifyUser(oldVps.user_id, notification.type, notification.title, notification.message);

      // Update MT5 account automation status
      await query(
        `UPDATE mt5_accounts SET automation_status = 'vps_ready', updated_at = NOW() WHERE id = $1`,
        [oldVps.mt5_account_id]
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    console.error('VPS update error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove VPS instance (admin only)
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'VPS instance ID is required' },
        { status: 400 }
      );
    }

    // Get VPS info before deletion
    const vpsInfo = await query(
      `SELECT v.mt5_account_id FROM vps_instances v WHERE v.id = $1`,
      [id]
    );

    if (vpsInfo.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'VPS instance not found' },
        { status: 404 }
      );
    }

    // Delete VPS instance
    await query(`DELETE FROM vps_instances WHERE id = $1`, [id]);

    // Reset MT5 account automation status
    if (vpsInfo.rows[0].mt5_account_id) {
      await query(
        `UPDATE mt5_accounts SET automation_status = 'none', updated_at = NOW() WHERE id = $1`,
        [vpsInfo.rows[0].mt5_account_id]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'VPS instance deleted successfully'
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    console.error('VPS delete error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
