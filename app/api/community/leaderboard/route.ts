import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    // Calculate leaderboard based on trade history
    // We'll look at top 10 traders by total profit
    const result = await query(`
      SELECT
        u.id,
        COALESCE(up.first_name || ' ' || up.last_name, u.email) as name,
        COALESCE(UPPER(LEFT(up.first_name, 1)), UPPER(LEFT(u.email, 1))) as avatar,
        SUM(t.profit_loss) as total_profit,
        COUNT(t.id) as total_trades,
        ROUND((COUNT(t.id) FILTER (WHERE t.profit_loss > 0)::numeric / NULLIF(COUNT(t.id), 0)::numeric) * 100, 1) as win_rate
      FROM users u
      JOIN trades t ON u.id = t.user_id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE t.status = 'closed'
      GROUP BY u.id, up.first_name, up.last_name, u.email
      HAVING COUNT(t.id) > 5
      ORDER BY total_profit DESC
      LIMIT 10
    `);

    const leaderboard = result.rows.map((row, index) => ({
      rank: index + 1,
      id: row.id,
      name: row.name,
      avatar: row.avatar,
      profit: `${row.total_profit >= 0 ? '+' : ''}$${Math.abs(row.total_profit).toFixed(2)}`,
      winRate: `${row.win_rate || 0}%`,
      trades: row.total_trades
    }));

    return NextResponse.json({
      success: true,
      data: leaderboard
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
