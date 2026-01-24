import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { trade_id, notes, tags } = await request.json();

    if (!trade_id) {
      return NextResponse.json(
        { success: false, error: 'Trade ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const tradeCheck = await query(
      'SELECT id FROM trades WHERE id = $1 AND user_id = $2',
      [trade_id, session.user.id]
    );

    if (tradeCheck.rowCount === 0 && session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Trade not found or access denied' },
        { status: 404 }
      );
    }

    // Update trade
    const result = await query(
      'UPDATE trades SET notes = $1, tags = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [notes, tags, trade_id]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Trading journal updated successfully'
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Journal update error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
