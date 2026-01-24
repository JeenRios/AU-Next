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
          WHEN COUNT(*) FILTER (WHERE status = 'closed') = 0 THEN 0
          ELSE ROUND((COUNT(*) FILTER (WHERE status = 'closed' AND profit_loss > 0)::numeric / COUNT(*) FILTER (WHERE status = 'closed')::numeric) * 100, 1)
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

    // Get balance from user_profiles.account_balance or MT5 accounts
    let totalBalance = 0;
    if (!isAdmin) {
      // For regular users, get their account balance from user_profiles or sum of MT5 accounts
      const balanceResult = await query(
        `SELECT
          COALESCE(up.account_balance, 0) as profile_balance,
          COALESCE(SUM(mt5.balance), 0) as mt5_balance
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN mt5_accounts mt5 ON u.id = mt5.user_id AND mt5.status = 'approved'
        WHERE u.id = $1
        GROUP BY up.account_balance`,
        [userId]
      );
      if (balanceResult.rows.length > 0) {
        const row = balanceResult.rows[0];
        // Use MT5 balance if available, otherwise use profile balance
        totalBalance = Number(row.mt5_balance) > 0
          ? Number(row.mt5_balance)
          : Number(row.profile_balance);
      }
    } else {
      // For admin, show total platform balance from all approved MT5 accounts
      const balanceResult = await query(
        `SELECT COALESCE(SUM(balance), 0) as total_balance FROM mt5_accounts WHERE status = 'approved'`
      );
      totalBalance = Number(balanceResult.rows[0]?.total_balance || 0);
    }

    // Convert BigInt to Number for JSON serialization
    const formattedStats = {
      totalTrades: Number(stats.total_trades || 0),
      buyTrades: Number(stats.buy_trades || 0),
      sellTrades: Number(stats.sell_trades || 0),
      avgAmount: Number(stats.avg_amount || 0),
      avgPrice: Number(stats.avg_price || 0),
      uniqueSymbols: Number(stats.unique_symbols || 0),
      winRate: Number(stats.win_rate || 0),
      totalBalance,
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
