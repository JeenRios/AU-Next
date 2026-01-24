import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin, encrypt } from '@/lib/auth';
import { notifyUser, NotificationTemplates } from '@/lib/notifications';
import {
  getVultrClient,
  isVultrConfigured,
  RECOMMENDED_PLANS,
  RECOMMENDED_REGIONS,
  WINDOWS_OS,
} from '@/lib/vultr';

export const dynamic = 'force-dynamic';

/**
 * GET - Get Vultr provisioning options (plans, regions, OS)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    // Check if Vultr is configured
    if (!isVultrConfigured()) {
      return NextResponse.json({
        success: true,
        configured: false,
        message: 'Vultr API key not configured',
        recommendedPlans: RECOMMENDED_PLANS,
        recommendedRegions: RECOMMENDED_REGIONS,
        windowsOS: WINDOWS_OS,
      });
    }

    const vultr = getVultrClient();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Get Vultr account info
    if (action === 'account') {
      const account = await vultr.getAccount();
      return NextResponse.json({
        success: true,
        configured: true,
        data: account,
      });
    }

    // Get available regions
    if (action === 'regions') {
      const { regions } = await vultr.listRegions();
      return NextResponse.json({
        success: true,
        configured: true,
        data: regions,
        recommended: RECOMMENDED_REGIONS,
      });
    }

    // Get available plans
    if (action === 'plans') {
      const { plans } = await vultr.listPlans('all');
      // Filter Windows-compatible plans (need at least 2GB RAM for Windows)
      const windowsPlans = plans.filter(p => p.ram >= 2048);
      return NextResponse.json({
        success: true,
        configured: true,
        data: windowsPlans,
        recommended: RECOMMENDED_PLANS,
      });
    }

    // Get available OS
    if (action === 'os') {
      const windowsOS = await vultr.getWindowsOS();
      return NextResponse.json({
        success: true,
        configured: true,
        data: windowsOS,
        recommended: WINDOWS_OS,
      });
    }

    // Get instance status
    const instanceId = searchParams.get('instance_id');
    if (action === 'status' && instanceId) {
      const { instance } = await vultr.getInstance(instanceId);
      return NextResponse.json({
        success: true,
        configured: true,
        data: instance,
      });
    }

    // Default: return configuration status and options
    return NextResponse.json({
      success: true,
      configured: true,
      recommendedPlans: RECOMMENDED_PLANS,
      recommendedRegions: RECOMMENDED_REGIONS,
      windowsOS: WINDOWS_OS,
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    console.error('Vultr provision GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new Vultr VPS instance
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();

    if (!isVultrConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Vultr API key not configured. Add VULTR_API_KEY to environment variables.' },
        { status: 400 }
      );
    }

    const {
      mt5_account_id,
      vps_name,
      region = 'ewr',  // Default to New Jersey
      plan = 'vc2-1c-2gb',  // Default to basic Windows plan
      os_id = WINDOWS_OS['windows-2022'],  // Default to Windows Server 2022
    } = await request.json();

    // Validate required fields
    if (!mt5_account_id) {
      return NextResponse.json(
        { success: false, error: 'mt5_account_id is required' },
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

    // Get MT5 account details
    const mt5Account = await query(
      `SELECT m.account_number, m.user_id, u.email FROM mt5_accounts m
       LEFT JOIN users u ON m.user_id = u.id
       WHERE m.id = $1`,
      [mt5_account_id]
    );

    if (mt5Account.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'MT5 account not found' },
        { status: 404 }
      );
    }

    const { account_number, user_id } = mt5Account.rows[0];
    const instanceLabel = vps_name || `MT5-${account_number}`;
    const hostname = `mt5-${account_number}`.toLowerCase().replace(/[^a-z0-9-]/g, '');

    // Create Vultr instance
    const vultr = getVultrClient();
    const { instance } = await vultr.createInstance({
      region,
      plan,
      os_id,
      label: instanceLabel,
      hostname,
      enable_ipv6: false,
      backups: 'disabled',  // Can enable later if needed
      ddos_protection: false,
      activation_email: false,
    });

    // Create VPS record in database with pending status
    const vpsResult = await query(
      `INSERT INTO vps_instances
       (mt5_account_id, name, ip_address, ssh_port, ssh_username, encrypted_ssh_password, os_type, status, provider, provider_instance_id, provider_region, provider_plan, provider_metadata, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING id`,
      [
        mt5_account_id,
        instanceLabel,
        instance.main_ip || null,  // May not be assigned yet
        3389,  // RDP port for Windows
        'Administrator',
        instance.default_password ? encrypt(instance.default_password) : null,
        'windows',
        'provisioning',
        'vultr',  // Provider name
        instance.id,
        region,
        plan,
        JSON.stringify({ os_id, hostname, created_at: new Date().toISOString() }),
        `Vultr instance created. ID: ${instance.id}`,
        session.user.id
      ]
    );

    // Update MT5 account automation status
    await query(
      `UPDATE mt5_accounts SET automation_status = 'vps_provisioning', updated_at = NOW() WHERE id = $1`,
      [mt5_account_id]
    );

    // Notify user
    if (user_id) {
      const notification = NotificationTemplates.vpsProvisioning(account_number);
      await notifyUser(user_id, notification.type, notification.title, notification.message);
    }

    return NextResponse.json({
      success: true,
      message: 'VPS provisioning started',
      data: {
        vps_id: vpsResult.rows[0].id,
        vultr_instance_id: instance.id,
        status: instance.status,
        power_status: instance.power_status,
        main_ip: instance.main_ip,
        default_password: instance.default_password,  // Only returned on creation
        label: instance.label,
        region,
        plan,
      }
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    console.error('Vultr provision error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update VPS from Vultr (sync status, get IP when ready)
 */
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();

    if (!isVultrConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Vultr API key not configured' },
        { status: 400 }
      );
    }

    const { vps_id } = await request.json();

    if (!vps_id) {
      return NextResponse.json(
        { success: false, error: 'vps_id is required' },
        { status: 400 }
      );
    }

    // Get VPS record
    const vpsRecord = await query(
      `SELECT v.*, m.account_number, m.user_id FROM vps_instances v
       LEFT JOIN mt5_accounts m ON v.mt5_account_id = m.id
       WHERE v.id = $1`,
      [vps_id]
    );

    if (vpsRecord.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'VPS instance not found' },
        { status: 404 }
      );
    }

    const vps = vpsRecord.rows[0];
    if (!vps.provider_instance_id) {
      return NextResponse.json(
        { success: false, error: 'No provider instance ID associated with this VPS' },
        { status: 400 }
      );
    }

    // Currently only supports Vultr - can add other providers here
    if (vps.provider !== 'vultr') {
      return NextResponse.json(
        { success: false, error: `Provider '${vps.provider}' sync not implemented` },
        { status: 400 }
      );
    }

    // Get Vultr instance status
    const vultr = getVultrClient();
    const { instance } = await vultr.getInstance(vps.provider_instance_id);

    // Determine new status
    let newStatus = vps.status;
    if (instance.status === 'active' && instance.power_status === 'running' && instance.server_status === 'ok') {
      newStatus = 'active';
    } else if (instance.status === 'pending') {
      newStatus = 'provisioning';
    }

    // Update VPS record
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (instance.main_ip && instance.main_ip !== '0.0.0.0') {
      updates.push(`ip_address = $${paramIndex++}`);
      values.push(instance.main_ip);
    }

    updates.push(`status = $${paramIndex++}`);
    values.push(newStatus);

    updates.push(`notes = $${paramIndex++}`);
    values.push(`Vultr status: ${instance.status}, power: ${instance.power_status}, server: ${instance.server_status}`);

    updates.push(`updated_at = NOW()`);
    values.push(vps_id);

    await query(
      `UPDATE vps_instances SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    // If VPS is now active, notify user and update MT5 account
    if (newStatus === 'active' && vps.status !== 'active') {
      // Update MT5 account
      await query(
        `UPDATE mt5_accounts SET automation_status = 'vps_ready', updated_at = NOW() WHERE id = $1`,
        [vps.mt5_account_id]
      );

      // Notify user
      if (vps.user_id) {
        const notification = NotificationTemplates.vpsReady(vps.account_number, vps.name);
        await notifyUser(vps.user_id, notification.type, notification.title, notification.message);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        vps_id: vps.id,
        vultr_instance_id: instance.id,
        status: newStatus,
        vultr_status: instance.status,
        power_status: instance.power_status,
        server_status: instance.server_status,
        main_ip: instance.main_ip,
      }
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    console.error('Vultr sync error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete Vultr instance
 */
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();

    if (!isVultrConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Vultr API key not configured' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const vpsId = searchParams.get('vps_id');

    if (!vpsId) {
      return NextResponse.json(
        { success: false, error: 'vps_id is required' },
        { status: 400 }
      );
    }

    // Get VPS record
    const vpsRecord = await query(
      `SELECT provider, provider_instance_id, mt5_account_id FROM vps_instances WHERE id = $1`,
      [vpsId]
    );

    if (vpsRecord.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'VPS instance not found' },
        { status: 404 }
      );
    }

    const { provider, provider_instance_id, mt5_account_id } = vpsRecord.rows[0];

    // Delete from provider if instance ID exists
    if (provider_instance_id) {
      if (provider === 'vultr') {
        const vultr = getVultrClient();
        try {
          await vultr.deleteInstance(provider_instance_id);
        } catch (err: any) {
          // Instance might already be deleted
          console.warn('Vultr delete warning:', err.message);
        }
      }
      // Add other providers here in the future:
      // else if (provider === 'digitalocean') { ... }
      // else if (provider === 'linode') { ... }
    }

    // Delete from database
    await query(`DELETE FROM vps_instances WHERE id = $1`, [vpsId]);

    // Reset MT5 account automation status
    if (mt5_account_id) {
      await query(
        `UPDATE mt5_accounts SET automation_status = 'none', updated_at = NOW() WHERE id = $1`,
        [mt5_account_id]
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
    console.error('Vultr delete error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
