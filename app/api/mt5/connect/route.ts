import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth, requireAdmin, encrypt } from '@/lib/auth';
import { notifyUser, notifyAdmins, NotificationTemplates } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

// POST - Create new MT5 account connection (requires auth)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { account_number, server, platform = 'MT5', password } = await request.json();

    // Validate required fields
    if (!account_number || !server) {
      return NextResponse.json(
        { success: false, error: 'Account number and server are required' },
        { status: 400 }
      );
    }

    // Validate platform
    if (!['MT4', 'MT5'].includes(platform)) {
      return NextResponse.json(
        { success: false, error: 'Platform must be MT4 or MT5' },
        { status: 400 }
      );
    }

    // Check if account already exists for this user
    const existingAccount = await query(
      `SELECT id FROM mt5_accounts WHERE account_number = $1 AND server = $2`,
      [account_number, server]
    );

    if (existingAccount.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'This MT5 account is already connected' },
        { status: 409 }
      );
    }

    // Encrypt password if provided
    const encryptedPassword = password ? encrypt(password) : null;

    // Insert new MT5 account connection request
    const result = await query(
      `INSERT INTO mt5_accounts (user_id, account_number, server, platform, status, ea_status, encrypted_password)
       VALUES ($1, $2, $3, $4, 'pending', 'inactive', $5)
       RETURNING id, account_number, server, platform, status, ea_status, balance, equity, profit, created_at`,
      [session.user.id, account_number, server, platform, encryptedPassword]
    );

    const newAccount = result.rows[0];

    // Notify admins about new MT5 connection request
    const notification = NotificationTemplates.mt5RequestSubmitted(account_number, session.user.email);
    await notifyAdmins(notification.type, notification.title, notification.message);

    return NextResponse.json({
      success: true,
      message: 'MT5 account connection request submitted. Admin will review shortly.',
      data: newAccount
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('MT5 connect error:', error);
    // Log to audit for admin visibility
    await logMT5Error('connect', error.message, null);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to connect MT5 account' },
      { status: 500 }
    );
  }
}

// GET - Fetch MT5 accounts (user sees own, admin sees all)
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('user_id');

    let result;

    // Admin can fetch any user's accounts or all accounts
    if (session.user.role === 'admin') {
      if (requestedUserId) {
        result = await query(
          `SELECT id, account_number, server, platform, status, ea_status, balance, equity, profit, created_at, updated_at
           FROM mt5_accounts
           WHERE user_id = $1
           ORDER BY created_at DESC`,
          [requestedUserId]
        );
      } else {
        result = await query(
          `SELECT m.id, m.account_number, m.server, m.platform, m.status, m.ea_status,
                  m.balance, m.equity, m.profit, m.created_at, m.updated_at,
                  u.email as user_email
           FROM mt5_accounts m
           LEFT JOIN users u ON m.user_id = u.id
           ORDER BY m.created_at DESC
           LIMIT 100`
        );
      }
    } else {
      // Regular users can only see their own accounts
      result = await query(
        `SELECT id, account_number, server, platform, status, ea_status, balance, equity, profit, created_at
         FROM mt5_accounts
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [session.user.id]
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('MT5 fetch error:', error);
    await logMT5Error('fetch', error.message, null);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch MT5 accounts' },
      { status: 500 }
    );
  }
}

// PATCH - Update MT5 account status (Admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const { id, status, ea_status, rejection_reason, automation_status, automation_notes } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Get current account state for notifications
    const currentAccount = await query(
      `SELECT m.*, u.email as user_email FROM mt5_accounts m
       LEFT JOIN users u ON m.user_id = u.id WHERE m.id = $1`,
      [id]
    );

    if (currentAccount.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'MT5 account not found' },
        { status: 404 }
      );
    }

    const oldAccount = currentAccount.rows[0];

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (status) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
      if (status === 'active') {
        updates.push(`approved_at = NOW()`);
        updates.push(`approved_by = $${paramIndex++}`);
        values.push(session.user.id);
      }
    }

    if (ea_status) {
      updates.push(`ea_status = $${paramIndex++}`);
      values.push(ea_status);
    }

    if (automation_status !== undefined) {
      updates.push(`automation_status = $${paramIndex++}`);
      values.push(automation_status);
    }

    if (automation_notes !== undefined) {
      updates.push(`automation_notes = $${paramIndex++}`);
      values.push(automation_notes);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No updates provided' },
        { status: 400 }
      );
    }

    updates.push('updated_at = NOW()');
    values.push(id);

    const result = await query(
      `UPDATE mt5_accounts SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    // Don't return encrypted password
    const account = result.rows[0];
    delete account.encrypted_password;

    // Send notifications based on status change
    if (status && status !== oldAccount.status) {
      if (status === 'active') {
        // Notify user of approval
        const notification = NotificationTemplates.mt5Approved(oldAccount.account_number);
        await notifyUser(oldAccount.user_id, notification.type, notification.title, notification.message);
      } else if (status === 'rejected') {
        // Notify user of rejection
        const notification = NotificationTemplates.mt5Rejected(oldAccount.account_number, rejection_reason);
        await notifyUser(oldAccount.user_id, notification.type, notification.title, notification.message);
      }
    }

    return NextResponse.json({
      success: true,
      data: account
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    console.error('MT5 update error:', error);
    await logMT5Error('update', error.message, null);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update MT5 account' },
      { status: 500 }
    );
  }
}

// Helper function to log MT5 errors for admin visibility
async function logMT5Error(operation: string, message: string, accountId: number | null) {
  try {
    await query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4)`,
      [
        `mt5_sync_error`,
        'mt5_account',
        accountId,
        JSON.stringify({ operation, message, timestamp: new Date().toISOString() })
      ]
    );
  } catch (logError) {
    console.error('Failed to log MT5 error:', logError);
  }
}
