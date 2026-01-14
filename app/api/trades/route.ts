import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { deleteCachedData } from '@/lib/redis';

export async function GET() {
  try {
    const result = await query(
      'SELECT * FROM trades ORDER BY created_at DESC LIMIT 100'
    );

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
    const { symbol, type, amount, price, status = 'PENDING' } = body;

    // Validation
    if (!symbol || !type || !amount || !price) {
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

    const result = await query(
      'INSERT INTO trades (symbol, type, amount, price, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [symbol, type, amount, price, status]
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
