import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

interface MigrationResult {
  name: string;
  success: boolean;
  error?: string;
}

async function runMigration(name: string, sql: string): Promise<MigrationResult> {
  try {
    await query(sql);
    console.log(`✅ Migration applied: ${name}`);
    return { name, success: true };
  } catch (error: any) {
    console.error(`❌ Migration failed: ${name}`, error.message);
    return { name, success: false, error: error.message };
  }
}

export async function GET() {
  try {
    const results: MigrationResult[] = [];

    // Migration: Add two_factor_enabled to users table
    results.push(await runMigration(
      'Add two_factor_enabled to users',
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false`
    ));

    // Migration: Add preferred_currency to user_profiles table
    results.push(await runMigration(
      'Add preferred_currency to user_profiles',
      `ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(10) DEFAULT 'USD'`
    ));

    // Migration: Add notes to trades table
    results.push(await runMigration(
      'Add notes to trades',
      `ALTER TABLE trades ADD COLUMN IF NOT EXISTS notes TEXT`
    ));

    // Add more migrations here as needed

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return NextResponse.json({
      success: failed.length === 0,
      message: `Applied ${successful.length} migration(s), ${failed.length} failed`,
      results
    });

  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
