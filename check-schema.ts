import { query } from './lib/db';

async function checkSchema() {
  try {
    const result = await query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'user_profiles'
    `);
    console.log('Columns in user_profiles:');
    result.rows.forEach(row => console.log(`- ${row.column_name}`));
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    process.exit();
  }
}

checkSchema();
