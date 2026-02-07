import { NextResponse } from 'next/server';
import { getPool, ALL_TABLES, COLUMN_MIGRATIONS, INDEX_MIGRATIONS } from '@/lib/db';

export async function POST() {
  try {
    const pool = getPool();
    
    // Step 1: Create all tables in dependency order
    for (const table of ALL_TABLES) {
      await pool.query(table.sql);
    }

    // Step 2: Add any missing columns to existing tables
    for (const migration of COLUMN_MIGRATIONS) {
      for (const col of migration.columns) {
        try {
          await pool.query(`ALTER TABLE ${migration.table} ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
        } catch (e) {
          // Column might already exist, ignore
        }
      }
    }

    // Step 3: Create indexes for migrated columns
    for (const indexSql of INDEX_MIGRATIONS) {
      try {
        await pool.query(indexSql);
      } catch (e) {
        // Index might already exist, ignore
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
    });
  } catch (error: any) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
