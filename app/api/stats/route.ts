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
        COUNT(DISTINCT symbol) as unique_symbols,
        CASE
          WHEN COUNT(*) = 0 THEN 0
          ELSE ROUND((COUNT(*) FILTER (WHERE status = 'COMPLETED')::numeric / COUNT(*)::numeric) * 100, 1)
        END as win_rate
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
      totalTrades: Number(stats.total_trades || 0),
      buyTrades: Number(stats.buy_trades || 0),
      sellTrades: Number(stats.sell_trades || 0),
      avgAmount: Number(stats.avg_amount || 0),
      avgPrice: Number(stats.avg_price || 0),
      uniqueSymbols: Number(stats.unique_symbols || 0),
      winRate: Number(stats.win_rate || 0),
      totalBalance: 12450.50, // Mocked for now as no balance table exists
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
