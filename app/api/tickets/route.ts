import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        st.*,
        u.email as user_email,
        p.first_name,
        p.last_name,
        a.email as assigned_email
      FROM support_tickets st
      LEFT JOIN users u ON st.user_id = u.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      LEFT JOIN users a ON st.assigned_to = a.id
      ORDER BY 
        CASE st.status 
          WHEN 'open' THEN 1 
          ELSE 2 
        END,
        st.created_at DESC
      LIMIT 100
    `);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
    });
  } catch (error: any) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
