import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCachedData, setCachedData } from '@/lib/redis';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await requireAuth();
    const isAdmin = session.user.role === 'admin';
    const userId = session.user.id;
    const cacheKey = isAdmin ? 'stats:admin' : `stats:${userId}`;

    // Try to get from cache first
    const cached = await getCachedData<any>(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    // Query database if not cached
    let queryText = `
      SELECT 
        COUNT(*) as total_trades,
        SUM(CASE WHEN type = 'BUY' THEN 1 ELSE 0 END) as buy_trades,
        SUM(CASE WHEN type = 'SELL' THEN 1 ELSE 0 END) as sell_trades,
        ROUND(AVG(amount)::numeric, 4) as avg_amount,
        ROUND(AVG(price)::numeric, 4) as avg_price,
        COUNT(DISTINCT symbol) as unique_symbols
      FROM trades
    `;

    const params: any[] = [];
    if (!isAdmin) {
      queryText += ` WHERE user_id = $1`;
      params.push(userId);
    }

    const result = await query(queryText, params);

    const stats = result.rows[0];

    // Convert BigInt to Number for JSON serialization
    const formattedStats = {
      total_trades: Number(stats.total_trades || 0),
      buy_trades: Number(stats.buy_trades || 0),
      sell_trades: Number(stats.sell_trades || 0),
      avg_amount: Number(stats.avg_amount || 0),
      avg_price: Number(stats.avg_price || 0),
      unique_symbols: Number(stats.unique_symbols || 0),
    };

    // Cache for 60 seconds
    await setCachedData(cacheKey, formattedStats, 60);

    return NextResponse.json({
      success: true,
      data: formattedStats,
      cached: false,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
