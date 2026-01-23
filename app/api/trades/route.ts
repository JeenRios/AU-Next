import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { deleteCachedData } from '@/lib/redis';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await requireAuth();
    const isAdmin = session.user.role === 'admin';

    let queryText = `
      SELECT
        t.*,
        t.profit_loss as profit,
        u.email as user_email,
        p.first_name,
        p.last_name,
        p.account_number
      FROM trades t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
    `;

    const params: any[] = [];
    if (!isAdmin) {
      queryText += ` WHERE t.user_id = $1`;
      params.push(session.user.id);
    }

    queryText += ` ORDER BY t.opened_at DESC LIMIT 100`;

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
    console.error('Error fetching trades:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { user_id, symbol, type, amount, price, open_price, status = 'open' } = body;

    // Use session user_id unless requester is admin
    const targetUserId = session.user.role === 'admin' ? (user_id || session.user.id) : session.user.id;

    // Validation
    if (!symbol || !type || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['BUY', 'SELL'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type must be BUY or SELL' },
        { status: 400 }
      );
    }

    const tradeNumber = `T${Date.now()}`;
    const actualPrice = price || open_price;

    const result = await query(
      'INSERT INTO trades (user_id, trade_number, symbol, type, amount, price, open_price, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [targetUserId, tradeNumber, symbol, type, amount, actualPrice, actualPrice, status]
    );

    // Invalidate stats cache for the user and admin
    await deleteCachedData(`stats:${targetUserId}`);
    await deleteCachedData('stats:admin');

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Trade created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating trade:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Trade ID is required' },
        { status: 400 }
      );
    }

    let result;
    if (session.user.role === 'admin') {
      result = await query(
        'DELETE FROM trades WHERE id = $1 RETURNING id, user_id',
        [id]
      );
    } else {
      result = await query(
        'DELETE FROM trades WHERE id = $1 AND user_id = $2 RETURNING id, user_id',
        [id, session.user.id]
      );
    }

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Trade not found or access denied' },
        { status: 404 }
      );
    }

    const deletedTrade = result.rows[0];

    // Invalidate stats cache for the user and admin
    await deleteCachedData(`stats:${deletedTrade.user_id}`);
    await deleteCachedData('stats:admin');

    return NextResponse.json({
      success: true,
      message: 'Trade deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error deleting trade:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}