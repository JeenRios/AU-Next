import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Get total users count
    const usersResult = await query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(usersResult.rows[0]?.count || '0');

    // Get total trades count
    const tradesResult = await query('SELECT COUNT(*) as count FROM trades');
    const totalTrades = parseInt(tradesResult.rows[0]?.count || '0');

    // Get trades from today
    const todayTradesResult = await query(`
      SELECT COUNT(*) as count FROM trades
      WHERE created_at >= CURRENT_DATE
    `);
    const tradesToday = parseInt(todayTradesResult.rows[0]?.count || '0');

    // Get average win rate (trades with positive profit_loss)
    const winRateResult = await query(`
      SELECT
        CASE
          WHEN COUNT(*) = 0 THEN 0
          ELSE ROUND((COUNT(*) FILTER (WHERE profit_loss > 0)::numeric / COUNT(*)::numeric) * 100, 1)
        END as win_rate
      FROM trades
      WHERE status = 'closed'
    `);
    const avgWinRate = parseFloat(winRateResult.rows[0]?.win_rate || '0');

    // Get active MT5 connections from mt5_accounts table
    const mt5Result = await query(`
      SELECT COUNT(*) as count FROM mt5_accounts
      WHERE status = 'active' AND ea_status = 'active'
    `);
    const activeConnections = parseInt(mt5Result.rows[0]?.count || '0');

    // Calculate uptime (simulated - would need health monitoring)
    const uptime = 99.9;

    // Get recent trades for the live feed (last 10, anonymized)
    const recentTradesResult = await query(`
      SELECT
        symbol,
        type,
        amount,
        profit_loss as profit,
        created_at
      FROM trades
      ORDER BY created_at DESC
      LIMIT 10
    `);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalTrades,
        tradesToday,
        avgWinRate,
        activeConnections,
        uptime,
        recentTrades: recentTradesResult.rows.map(trade => ({
          symbol: trade.symbol,
          type: trade.type,
          amount: parseFloat(trade.amount),
          profit: trade.profit ? parseFloat(trade.profit) : null,
          time: trade.created_at
        }))
      }
    });
  } catch (error) {
    console.error('Landing stats error:', error);
    // Return error response with fallback indicator
    return NextResponse.json({
      success: false,
      error: 'Database unavailable',
      fallback: true,
      data: {
        totalUsers: 0,
        totalTrades: 0,
        tradesToday: 0,
        avgWinRate: 0,
        activeConnections: 0,
        uptime: 99.9,
        recentTrades: []
      }
    }, { status: 503 });
  }
}
