import { Pool } from 'pg';

async function checkDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Checking PostgreSQL Database...\n');

    // Check connection
    const connResult = await pool.query('SELECT NOW()');
    console.log('✅ Connection successful at:', connResult.rows[0].now);
    console.log('');

    // List all tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📋 Tables in database:');
    console.log('─────────────────────');
    tablesResult.rows.forEach(row => {
      console.log(`  • ${row.table_name}`);
    });
    console.log('');

    // Count rows in each table
    for (const table of tablesResult.rows) {
      const countResult = await pool.query(`SELECT COUNT(*) FROM ${table.table_name}`);
      console.log(`📊 ${table.table_name}: ${countResult.rows[0].count} rows`);
    }
    console.log('');

    // Show users table structure
    const usersStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    if (usersStructure.rows.length > 0) {
      console.log('👤 Users table structure:');
      console.log('─────────────────────────');
      usersStructure.rows.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      console.log('');
    }

    // Show sample data from users (without passwords)
    const usersData = await pool.query(`
      SELECT id, email, role, created_at 
      FROM users 
      LIMIT 5
    `);

    if (usersData.rows.length > 0) {
      console.log('📝 Sample users:');
      console.log('─────────────────────────');
      usersData.rows.forEach(user => {
        console.log(`  ID: ${user.id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Created: ${user.created_at}`);
        console.log('  ---');
      });
    }

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await pool.end();
  }
}

checkDatabase();
