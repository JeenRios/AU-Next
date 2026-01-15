import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Demo accounts
    const demoAccounts = [
      { email: 'admin@au.com', password: 'admin', role: 'admin', name: 'Admin User' },
      { email: 'user@au.com', password: 'user', role: 'user', name: 'Demo User' }
    ];

    // Check demo accounts first
    const demoAccount = demoAccounts.find(
      acc => acc.email === email && acc.password === password
    );

    if (demoAccount) {
      return NextResponse.json({
        user: {
          email: demoAccount.email,
          role: demoAccount.role,
          name: demoAccount.name
        }
      });
    }

    // If not a demo account, check database
    const result = await query(
      'SELECT id, email, role, name FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
