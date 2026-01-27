import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Get follow status or list of followers/following
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('user_id');
    const type = searchParams.get('type'); // 'followers', 'following', or 'check'

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (type === 'check') {
      const result = await query(
        'SELECT id FROM user_follows WHERE follower_id = $1 AND following_id = $2',
        [session.user.id, targetUserId]
      );
      return NextResponse.json({
        success: true,
        following: (result.rowCount ?? 0) > 0
      });
    }

    if (type === 'followers') {
      const result = await query(`
        SELECT
          u.id,
          u.email,
          COALESCE(up.first_name || ' ' || up.last_name, u.email) as name,
          COALESCE(UPPER(LEFT(up.first_name, 1)), UPPER(LEFT(u.email, 1))) as avatar
        FROM user_follows f
        JOIN users u ON f.follower_id = u.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE f.following_id = $1
      `, [targetUserId]);
      return NextResponse.json({ success: true, data: result.rows });
    }

    if (type === 'following') {
      const result = await query(`
        SELECT
          u.id,
          u.email,
          COALESCE(up.first_name || ' ' || up.last_name, u.email) as name,
          COALESCE(UPPER(LEFT(up.first_name, 1)), UPPER(LEFT(u.email, 1))) as avatar
        FROM user_follows f
        JOIN users u ON f.following_id = u.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE f.follower_id = $1
      `, [targetUserId]);
      return NextResponse.json({ success: true, data: result.rows });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type' },
      { status: 400 }
    );

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Follow GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Follow/Unfollow
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { target_user_id, action } = await request.json();

    if (!target_user_id || !action) {
      return NextResponse.json(
        { success: false, error: 'Target User ID and action are required' },
        { status: 400 }
      );
    }

    if (parseInt(target_user_id) === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'You cannot follow yourself' },
        { status: 400 }
      );
    }

    if (action === 'follow') {
      await query(
        'INSERT INTO user_follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [session.user.id, target_user_id]
      );
    } else if (action === 'unfollow') {
      await query(
        'DELETE FROM user_follows WHERE follower_id = $1 AND following_id = $2',
        [session.user.id, target_user_id]
      );
    }

    return NextResponse.json({
      success: true,
      message: `${action === 'follow' ? 'Followed' : 'Unfollowed'} successfully`
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Follow POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
