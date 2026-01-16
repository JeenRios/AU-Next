import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { deleteCachedData } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        t.*,
        u.email as user_email,
        p.first_name,
        p.last_name,
        p.account_number
      FROM trades t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      ORDER BY t.opened_at DESC 
      LIMIT 100
    `);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
    });
  } catch (error: any) {
    console.error('Error fetching trades:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, symbol, type, amount, price, open_price, status = 'open' } = body;

    // Validation
    if (!user_id || !symbol || !type || !amount) {
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
      [user_id, tradeNumber, symbol, type, amount, actualPrice, actualPrice, status]
    );

    // Invalidate stats cache
    await deleteCachedData('stats');

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Trade created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating trade:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Trade ID is required' },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM trades WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Trade not found' },
        { status: 404 }
      );
    }

    // Invalidate stats cache
    await deleteCachedData('stats');

    return NextResponse.json({
      success: true,
      message: 'Trade deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting trade:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}