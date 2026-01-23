import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await query(`
      SELECT
        p.id,
        p.content,
        p.image_url,
        p.profit_amount,
        p.likes_count,
        p.comments_count,
        p.created_at,
        u.email,
        COALESCE(up.first_name || ' ' || up.last_name, u.email) as user_name,
        COALESCE(UPPER(LEFT(up.first_name, 1)), UPPER(LEFT(u.email, 1))) as avatar,
        CASE WHEN up.kyc_status = 'verified' THEN true ELSE false END as verified,
        CASE WHEN pl.id IS NOT NULL THEN true ELSE false END as liked
      FROM community_posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN community_post_likes pl ON p.id = pl.post_id AND pl.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `, [session.user.id, limit, offset]);

    // Format the response
    const posts = result.rows.map(post => ({
      id: post.id,
      user: {
        name: post.user_name,
        avatar: post.avatar,
        verified: post.verified
      },
      content: post.content,
      image: post.image_url,
      profit: post.profit_amount ? `${post.profit_amount >= 0 ? '+' : ''}$${Math.abs(post.profit_amount).toFixed(2)}` : null,
      likes: post.likes_count,
      comments: post.comments_count,
      liked: post.liked,
      timestamp: formatTimestamp(post.created_at)
    }));

    return NextResponse.json({
      success: true,
      data: posts,
      count: result.rowCount
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Community fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { content, image_url, profit_amount } = await request.json();

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Content must be 500 characters or less' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO community_posts (user_id, content, image_url, profit_amount)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [session.user.id, content, image_url || null, profit_amount || null]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Post created successfully'
    }, { status: 201 });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Community post error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Like/unlike a post
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { post_id, action } = await request.json();
    const userId = session.user.id;

    if (!post_id || !action) {
      return NextResponse.json(
        { success: false, error: 'Post ID and action are required' },
        { status: 400 }
      );
    }

    if (action === 'like') {
      // Add like
      await query(
        `INSERT INTO community_post_likes (post_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [post_id, userId]
      );

      // Update likes count
      await query(
        `UPDATE community_posts
         SET likes_count = (SELECT COUNT(*) FROM community_post_likes WHERE post_id = $1)
         WHERE id = $1`,
        [post_id]
      );
    } else if (action === 'unlike') {
      // Remove like
      await query(
        `DELETE FROM community_post_likes WHERE post_id = $1 AND user_id = $2`,
        [post_id, userId]
      );

      // Update likes count
      await query(
        `UPDATE community_posts
         SET likes_count = (SELECT COUNT(*) FROM community_post_likes WHERE post_id = $1)
         WHERE id = $1`,
        [post_id]
      );
    }

    // Get updated post
    const result = await query(
      `SELECT likes_count FROM community_posts WHERE id = $1`,
      [post_id]
    );

    return NextResponse.json({
      success: true,
      likes: result.rows[0]?.likes_count || 0
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Community like error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

  return new Date(date).toLocaleDateString();
}
