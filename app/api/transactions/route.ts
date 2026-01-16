import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        t.*,
        u.email as user_email,
        p.first_name,
        p.last_name
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      ORDER BY t.created_at DESC 
      LIMIT 100
    `);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
