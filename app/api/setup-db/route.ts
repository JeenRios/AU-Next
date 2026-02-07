import { Pool } from 'pg';
import { NextResponse } from 'next/server';
import { ALL_TABLES, COLUMN_MIGRATIONS, INDEX_MIGRATIONS } from '@/lib/db/schema';

export async function GET() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Step 1: Create all tables in dependency order
    for (const table of ALL_TABLES) {
      await pool.query(table.sql);
      console.log(`✅ Created/verified table: ${table.name}`);
    }

    // Step 2: Add any missing columns to existing tables
    for (const migration of COLUMN_MIGRATIONS) {
      for (const col of migration.columns) {
        try {
          await pool.query(`ALTER TABLE ${migration.table} ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
        } catch (e) {
          // Column might already exist with different constraints, ignore
        }
      }
      console.log(`✅ Verified columns for: ${migration.table}`);
    }

    // Step 3: Create indexes for migrated columns (after columns exist)
    for (const indexSql of INDEX_MIGRATIONS) {
      try {
        await pool.query(indexSql);
      } catch (e) {
        // Index might already exist, ignore
      }
    }
    console.log(`✅ Verified indexes`);

    await pool.end();

    const tableNames = ALL_TABLES.map(t => t.name).join(', ');
    return NextResponse.json({
      success: true,
      message: `Database schema created successfully! Tables: ${tableNames}`
    });

  } catch (error: any) {
    console.error('Setup DB Error:', error);
    try { await pool.end(); } catch (e) {}
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}
