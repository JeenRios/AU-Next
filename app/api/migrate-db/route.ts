import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

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
    // Require admin role for migrations
    await requireAdmin();

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

    // Migration: Add encrypted_password to mt5_accounts table
    results.push(await runMigration(
      'Add encrypted_password to mt5_accounts',
      `ALTER TABLE mt5_accounts ADD COLUMN IF NOT EXISTS encrypted_password TEXT`
    ));

    // Migration: Add approved_by and approved_at to mt5_accounts table
    results.push(await runMigration(
      'Add approved_by to mt5_accounts',
      `ALTER TABLE mt5_accounts ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES users(id)`
    ));
    results.push(await runMigration(
      'Add approved_at to mt5_accounts',
      `ALTER TABLE mt5_accounts ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP`
    ));

    // Migration: Add automation fields to mt5_accounts table
    results.push(await runMigration(
      'Add automation_status to mt5_accounts',
      `ALTER TABLE mt5_accounts ADD COLUMN IF NOT EXISTS automation_status VARCHAR(50) DEFAULT 'none'`
    ));
    results.push(await runMigration(
      'Add automation_notes to mt5_accounts',
      `ALTER TABLE mt5_accounts ADD COLUMN IF NOT EXISTS automation_notes TEXT`
    ));
    results.push(await runMigration(
      'Add last_sync_at to mt5_accounts',
      `ALTER TABLE mt5_accounts ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP`
    ));
    results.push(await runMigration(
      'Add gain_percentage to mt5_accounts',
      `ALTER TABLE mt5_accounts ADD COLUMN IF NOT EXISTS gain_percentage DECIMAL(10, 2) DEFAULT 0.00`
    ));
    results.push(await runMigration(
      'Add current_lot_size to mt5_accounts',
      `ALTER TABLE mt5_accounts ADD COLUMN IF NOT EXISTS current_lot_size DECIMAL(10, 4) DEFAULT 0.00`
    ));
    results.push(await runMigration(
      'Add open_positions_count to mt5_accounts',
      `ALTER TABLE mt5_accounts ADD COLUMN IF NOT EXISTS open_positions_count INTEGER DEFAULT 0`
    ));
    results.push(await runMigration(
      'Add last_trade_at to mt5_accounts',
      `ALTER TABLE mt5_accounts ADD COLUMN IF NOT EXISTS last_trade_at TIMESTAMP`
    ));

    // Migration: Create vps_instances table
    results.push(await runMigration(
      'Create vps_instances table',
      `CREATE TABLE IF NOT EXISTS vps_instances (
        id SERIAL PRIMARY KEY,
        mt5_account_id INTEGER REFERENCES mt5_accounts(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        ip_address VARCHAR(45),
        ssh_port INTEGER DEFAULT 22,
        ssh_username VARCHAR(100),
        encrypted_ssh_password TEXT,
        encrypted_ssh_key TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        os_type VARCHAR(50) DEFAULT 'windows',
        mt5_path TEXT,
        ea_path TEXT,
        last_health_check TIMESTAMP,
        health_status VARCHAR(50),
        notes TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(mt5_account_id)
      )`
    ));

    // Migration: Create automation_jobs table
    results.push(await runMigration(
      'Create automation_jobs table',
      `CREATE TABLE IF NOT EXISTS automation_jobs (
        id SERIAL PRIMARY KEY,
        mt5_account_id INTEGER REFERENCES mt5_accounts(id) ON DELETE CASCADE,
        vps_instance_id INTEGER REFERENCES vps_instances(id) ON DELETE CASCADE,
        job_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        progress INTEGER DEFAULT 0,
        message TEXT,
        error_message TEXT,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        metadata JSONB
      )`
    ));

    // Migration: Create indexes for new tables
    results.push(await runMigration(
      'Create vps_instances indexes',
      `CREATE INDEX IF NOT EXISTS idx_vps_instances_mt5_account_id ON vps_instances(mt5_account_id);
       CREATE INDEX IF NOT EXISTS idx_vps_instances_status ON vps_instances(status)`
    ));
    results.push(await runMigration(
      'Create automation_jobs indexes',
      `CREATE INDEX IF NOT EXISTS idx_automation_jobs_mt5_account ON automation_jobs(mt5_account_id);
       CREATE INDEX IF NOT EXISTS idx_automation_jobs_status ON automation_jobs(status)`
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
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
