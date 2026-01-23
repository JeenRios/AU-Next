import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Get comments for a post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id');

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const result = await query(`
      SELECT
        c.id,
        c.content,
        c.created_at,
        u.email,
        COALESCE(up.first_name || ' ' || up.last_name, u.email) as user_name,
        COALESCE(UPPER(LEFT(up.first_name, 1)), UPPER(LEFT(u.email, 1))) as avatar
      FROM community_comments c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
    `, [postId]);

    return NextResponse.json({
      success: true,
      data: result.rows
    });

  } catch (error: any) {
    console.error('Fetch comments error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Add a comment
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { post_id, content } = await request.json();

    if (!post_id || !content) {
      return NextResponse.json(
        { success: false, error: 'Post ID and content are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO community_comments (post_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [post_id, session.user.id, content]
    );

    // Update comments count on the post
    await query(
      `UPDATE community_posts
       SET comments_count = (SELECT COUNT(*) FROM community_comments WHERE post_id = $1)
       WHERE id = $1`,
      [post_id]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Comment added successfully'
    }, { status: 201 });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Add comment error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Delete a comment
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    // Get post_id first to update count later
    const commentRes = await query(
      'SELECT post_id FROM community_comments WHERE id = $1 AND user_id = $2',
      [id, session.user.id]
    );

    if (commentRes.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Comment not found or access denied' },
        { status: 404 }
      );
    }

    const postId = commentRes.rows[0].post_id;

    await query(
      'DELETE FROM community_comments WHERE id = $1 AND user_id = $2',
      [id, session.user.id]
    );

    // Update comments count
    await query(
      `UPDATE community_posts
       SET comments_count = (SELECT COUNT(*) FROM community_comments WHERE post_id = $1)
       WHERE id = $1`,
      [postId]
    );

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Delete comment error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
