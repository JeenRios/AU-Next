import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await requireAuth();
    const isAdmin = session.user.role === 'admin';

    let queryText = `
      SELECT 
        t.*,
        u.email as user_email,
        p.first_name,
        p.last_name
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
    `;

    const params: any[] = [];
    if (!isAdmin) {
      queryText += ` WHERE t.user_id = $1`;
      params.push(session.user.id);
    }

    queryText += ` ORDER BY t.created_at DESC LIMIT 100`;

    const result = await query(queryText, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
