import { Pool } from 'pg';
import { NextResponse } from 'next/server';

export async function GET() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const migrations = [];

    // Example: Add new column to users table
    try {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false
      `);
      migrations.push('Added two_factor_enabled to users');
    } catch (e) {}

    // Example: Add new column to user_profiles table
    try {
      await pool.query(`
        ALTER TABLE user_profiles 
        ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(10) DEFAULT 'USD'
      `);
      migrations.push('Added preferred_currency to user_profiles');
    } catch (e) {}

    // Example: Add new column to trades table
    try {
      await pool.query(`
        ALTER TABLE trades 
        ADD COLUMN IF NOT EXISTS notes TEXT
      `);
      migrations.push('Added notes to trades');
    } catch (e) {}

    // Add more migrations here as needed
    // Just copy the pattern above for any new columns

    await pool.end();

    return NextResponse.json({ 
      success: true, 
      message: migrations.length > 0 
        ? `Applied ${migrations.length} migration(s)` 
        : 'No new migrations to apply',
      migrations 
    });

  } catch (error: any) {
    await pool.end();
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
