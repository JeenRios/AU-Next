import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCachedData, setCachedData } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Try to get from cache first
    const cached = await getCachedData<any>('stats');
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    // Query database if not cached
    const result = await query(`
      SELECT 
        COUNT(*) as total_trades,
        SUM(CASE WHEN type = 'BUY' THEN 1 ELSE 0 END) as buy_trades,
        SUM(CASE WHEN type = 'SELL' THEN 1 ELSE 0 END) as sell_trades,
        ROUND(AVG(amount)::numeric, 4) as avg_amount,
        ROUND(AVG(price)::numeric, 4) as avg_price,
        COUNT(DISTINCT symbol) as unique_symbols
      FROM trades
    `);

    const stats = result.rows[0];

    // Convert BigInt to Number for JSON serialization
    const formattedStats = {
      total_trades: Number(stats.total_trades),
      buy_trades: Number(stats.buy_trades),
      sell_trades: Number(stats.sell_trades),
      avg_amount: Number(stats.avg_amount),
      avg_price: Number(stats.avg_price),
      unique_symbols: Number(stats.unique_symbols),
    };

    // Cache for 60 seconds
    await setCachedData('stats', formattedStats, 60);

    return NextResponse.json({
      success: true,
      data: formattedStats,
      cached: false,
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
