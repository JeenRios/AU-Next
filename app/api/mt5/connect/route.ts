import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { user_id, account_number, server, platform = 'MT5' } = await request.json();

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

    // Insert new MT5 account connection request
    const result = await query(
      `INSERT INTO mt5_accounts (user_id, account_number, server, platform, status, ea_status)
       VALUES ($1, $2, $3, $4, 'pending', 'inactive')
       RETURNING id, account_number, server, platform, status, ea_status, balance, equity, profit, created_at`,
      [user_id || null, account_number, server, platform]
    );

    const newAccount = result.rows[0];

    return NextResponse.json({
      success: true,
      message: 'MT5 account connection request submitted. Admin will review shortly.',
      data: newAccount
    });

  } catch (error: any) {
    console.error('MT5 connect error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to connect MT5 account' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    let result;
    if (userId) {
      result = await query(
        `SELECT id, account_number, server, platform, status, ea_status, balance, equity, profit, created_at
         FROM mt5_accounts
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      );
    } else {
      result = await query(
        `SELECT m.*, u.email as user_email
         FROM mt5_accounts m
         LEFT JOIN users u ON m.user_id = u.id
         ORDER BY m.created_at DESC
         LIMIT 100`
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });

  } catch (error: any) {
    console.error('MT5 fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch MT5 accounts' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status, ea_status } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Account ID is required' },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (status) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
      if (status === 'active') {
        updates.push(`approved_at = NOW()`);
      }
    }

    if (ea_status) {
      updates.push(`ea_status = $${paramIndex++}`);
      values.push(ea_status);
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

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'MT5 account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error: any) {
    console.error('MT5 update error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update MT5 account' },
      { status: 500 }
    );
  }
}
