import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET all users with their profiles (Admin only)
export async function GET() {
  try {
    // Require admin role
    await requireAdmin();

    const result = await query(`
      SELECT
        u.id,
        u.email,
        u.role,
        u.status,
        u.email_verified,
        u.last_login,
        u.created_at,
        p.first_name,
        p.last_name,
        p.phone,
        p.country,
        p.account_number,
        p.account_type,
        p.account_balance,
        p.account_currency,
        p.kyc_status
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      ORDER BY u.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create new user with profile (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Require admin role
    await requireAdmin();

    const body = await request.json();
    const { email, password, role = 'user', first_name, last_name, phone, country } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!['admin', 'user'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Role must be admin or user' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password before storing
    const hashedPassword = await hashPassword(password);

    // Insert new user
    const userResult = await query(
      'INSERT INTO users (email, password, role, status, email_verified) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role, created_at',
      [email, hashedPassword, role, 'active', true]
    );

    const userId = userResult.rows[0].id;

    // Create user profile if role is user
    if (role === 'user' && (first_name || last_name)) {
      const accountNumber = `AU${String(userId).padStart(8, '0')}`;
      await query(
        'INSERT INTO user_profiles (user_id, first_name, last_name, phone, country, account_number) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, first_name, last_name, phone, country, accountNumber]
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: userResult.rows[0],
        message: 'User created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE user (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Require admin role
    const session = await requireAdmin();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prevent admin from deleting themselves
    if (parseInt(id) === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
