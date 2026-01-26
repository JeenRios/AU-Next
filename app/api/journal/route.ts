import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET: Fetch all journal entries for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const result = await query(
      'SELECT * FROM trading_journal WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching journal entries:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create a new journal entry
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const { title, content, emotion, tags } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO trading_journal (user_id, title, content, emotion, tags)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, title, content, emotion || null, tags || []]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Journal entry created successfully',
    }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating journal entry:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Update an existing journal entry
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const { id, title, content, emotion, tags } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const checkResult = await query(
      'SELECT id FROM trading_journal WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Entry not found or unauthorized' },
        { status: 404 }
      );
    }

    const result = await query(
      `UPDATE trading_journal
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           emotion = COALESCE($3, emotion),
           tags = COALESCE($4, tags),
           updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [title, content, emotion, tags, id, userId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Journal entry updated successfully',
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating journal entry:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove a journal entry
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM trading_journal WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Entry not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Journal entry deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error deleting journal entry:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
