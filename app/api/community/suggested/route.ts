import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Suggest users that current user is NOT following
    // Priority to users with high win rates or verified status
    const result = await query(`
      SELECT
        u.id,
        COALESCE(up.first_name || ' ' || up.last_name, u.email) as name,
        COALESCE(UPPER(LEFT(up.first_name, 1)), UPPER(LEFT(u.email, 1))) as avatar,
        (SELECT COUNT(*) FROM user_follows WHERE following_id = u.id) as followers_count,
        CASE WHEN up.kyc_status = 'verified' THEN true ELSE false END as verified
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id != $1
      AND u.id NOT IN (SELECT following_id FROM user_follows WHERE follower_id = $1)
      ORDER BY followers_count DESC, verified DESC
      LIMIT 5
    `, [session.user.id]);

    return NextResponse.json({
      success: true,
      data: result.rows
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Suggested users error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
