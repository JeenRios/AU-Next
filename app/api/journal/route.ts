import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const result = await query(
      'SELECT * FROM trading_journal WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

const VALID_EMOTIONS = ['happy', 'confident', 'neutral', 'anxious', 'frustrated', 'fearful', 'greedy', 'disciplined'];

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const { title, content, emotion, tags } = await request.json();

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    if (title.length > 255) {
      return NextResponse.json({ success: false, error: 'Title must be 255 characters or less' }, { status: 400 });
    }

    if (content && typeof content !== 'string') {
      return NextResponse.json({ success: false, error: 'Content must be a string' }, { status: 400 });
    }

    if (content && content.length > 10000) {
      return NextResponse.json({ success: false, error: 'Content must be 10000 characters or less' }, { status: 400 });
    }

    if (emotion && !VALID_EMOTIONS.includes(emotion)) {
      return NextResponse.json({ success: false, error: `Invalid emotion. Must be one of: ${VALID_EMOTIONS.join(', ')}` }, { status: 400 });
    }

    if (tags && !Array.isArray(tags)) {
      return NextResponse.json({ success: false, error: 'Tags must be an array' }, { status: 400 });
    }

    if (tags && tags.length > 10) {
      return NextResponse.json({ success: false, error: 'Maximum 10 tags allowed' }, { status: 400 });
    }

    const result = await query(
      'INSERT INTO trading_journal (user_id, title, content, emotion, tags) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, title, content, emotion, tags]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Journal entry created'
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const { id, title, content, emotion, tags } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const entryId = parseInt(id, 10);
    if (isNaN(entryId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID format' }, { status: 400 });
    }

    // Verify ownership
    const checkResult = await query(
      'SELECT id FROM trading_journal WHERE id = $1 AND user_id = $2',
      [entryId, userId]
    );

    if (checkResult.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Entry not found or unauthorized' }, { status: 404 });
    }

    const result = await query(
      'UPDATE trading_journal SET title = $1, content = $2, emotion = $3, tags = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [title, content, emotion, tags, entryId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Journal entry updated'
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const entryId = parseInt(id, 10);
    if (isNaN(entryId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID format' }, { status: 400 });
    }

    const result = await query(
      'DELETE FROM trading_journal WHERE id = $1 AND user_id = $2 RETURNING id',
      [entryId, userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Entry not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Journal entry deleted'
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
