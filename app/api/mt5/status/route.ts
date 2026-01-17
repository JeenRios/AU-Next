import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const MT5_SERVICE_URL = process.env.MT5_SERVICE_URL || 'http://localhost:5000';

// GET - Fetch on-demand MT5 account status
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('account_id');

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'account_id is required' },
        { status: 400 }
      );
    }

    // Get MT5 account details
    let accountQuery = `
      SELECT m.*, v.status as vps_status, v.health_status as vps_health,
             v.name as vps_name, v.ip_address as vps_ip
      FROM mt5_accounts m
      LEFT JOIN vps_instances v ON v.mt5_account_id = m.id
      WHERE m.id = $1
    `;
    const params: any[] = [accountId];

    // Non-admin users can only see their own accounts
    if (session.user.role !== 'admin') {
      accountQuery += ` AND m.user_id = $2`;
      params.push(session.user.id);
    }

    const accountResult = await query(accountQuery, params);

    if (accountResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'MT5 account not found or access denied' },
        { status: 404 }
      );
    }

    const account = accountResult.rows[0];

    // If account is not active, return current stored data
    if (account.status !== 'active') {
      return NextResponse.json({
        success: true,
        data: {
          id: account.id,
          account_number: account.account_number,
          server: account.server,
          platform: account.platform,
          status: account.status,
          ea_status: account.ea_status,
          automation_status: account.automation_status,
          balance: parseFloat(account.balance) || 0,
          equity: parseFloat(account.equity) || 0,
          profit: parseFloat(account.profit) || 0,
          gain_percentage: parseFloat(account.gain_percentage) || 0,
          current_lot_size: parseFloat(account.current_lot_size) || 0,
          open_positions_count: account.open_positions_count || 0,
          last_sync_at: account.last_sync_at,
          last_trade_at: account.last_trade_at,
          vps: account.vps_status ? {
            status: account.vps_status,
            health: account.vps_health,
            name: account.vps_name,
            ip: account.vps_ip
          } : null,
          live_data: false
        }
      });
    }

    // Try to fetch live data from MT5 service
    let liveData = null;
    let eaStatus = null;

    try {
      // Fetch account info from MT5 service
      const accountResponse = await fetch(`${MT5_SERVICE_URL}/account/extended`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account: account.account_number,
          server: account.server
        }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (accountResponse.ok) {
        const accountData = await accountResponse.json();
        if (accountData.success) {
          liveData = accountData;
        }
      }

      // Fetch EA status
      const eaResponse = await fetch(`${MT5_SERVICE_URL}/ea/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account: account.account_number,
          server: account.server
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (eaResponse.ok) {
        const eaData = await eaResponse.json();
        if (eaData.success) {
          eaStatus = eaData;
        }
      }
    } catch (fetchError) {
      console.log('MT5 service not available, returning stored data:', fetchError);
    }

    // If we got live data, update the database
    if (liveData) {
      const balance = liveData.balance || account.balance;
      const equity = liveData.equity || account.equity;
      const profit = liveData.profit || account.profit;
      const openPositionsCount = liveData.open_positions_count || 0;
      const currentLotSize = liveData.total_lot_size || account.current_lot_size;

      // Calculate gain percentage (profit / balance * 100)
      const gainPercentage = balance > 0 ? (profit / balance) * 100 : 0;

      // Update MT5 account with fresh data
      await query(
        `UPDATE mt5_accounts SET
           balance = $2,
           equity = $3,
           profit = $4,
           gain_percentage = $5,
           current_lot_size = $6,
           open_positions_count = $7,
           ea_status = $8,
           last_sync_at = NOW(),
           updated_at = NOW()
         WHERE id = $1`,
        [
          accountId,
          balance,
          equity,
          profit,
          gainPercentage,
          currentLotSize,
          openPositionsCount,
          eaStatus?.ea_active ? 'active' : account.ea_status
        ]
      );

      return NextResponse.json({
        success: true,
        data: {
          id: account.id,
          account_number: account.account_number,
          server: account.server,
          platform: account.platform,
          status: account.status,
          ea_status: eaStatus?.ea_active ? 'active' : account.ea_status,
          automation_status: account.automation_status,
          balance: parseFloat(balance.toString()),
          equity: parseFloat(equity.toString()),
          profit: parseFloat(profit.toString()),
          gain_percentage: parseFloat(gainPercentage.toFixed(2)),
          current_lot_size: parseFloat(currentLotSize.toString()),
          open_positions_count: openPositionsCount,
          last_sync_at: new Date().toISOString(),
          last_trade_at: account.last_trade_at,
          vps: account.vps_status ? {
            status: account.vps_status,
            health: account.vps_health,
            name: account.vps_name,
            ip: account.vps_ip
          } : null,
          live_data: true,
          positions: liveData.positions || [],
          ea_positions_count: eaStatus?.ea_positions_count || 0
        }
      });
    }

    // Return stored data if live data not available
    return NextResponse.json({
      success: true,
      data: {
        id: account.id,
        account_number: account.account_number,
        server: account.server,
        platform: account.platform,
        status: account.status,
        ea_status: account.ea_status,
        automation_status: account.automation_status,
        balance: parseFloat(account.balance) || 0,
        equity: parseFloat(account.equity) || 0,
        profit: parseFloat(account.profit) || 0,
        gain_percentage: parseFloat(account.gain_percentage) || 0,
        current_lot_size: parseFloat(account.current_lot_size) || 0,
        open_positions_count: account.open_positions_count || 0,
        last_sync_at: account.last_sync_at,
        last_trade_at: account.last_trade_at,
        vps: account.vps_status ? {
          status: account.vps_status,
          health: account.vps_health,
          name: account.vps_name,
          ip: account.vps_ip
        } : null,
        live_data: false,
        message: 'MT5 service unavailable, showing cached data'
      }
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('MT5 status fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Bulk status refresh for all active accounts (admin only - background job)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Only admins can trigger bulk refresh
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get all active MT5 accounts
    const accountsResult = await query(
      `SELECT id, account_number, server FROM mt5_accounts WHERE status = 'active'`
    );

    if (accountsResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active accounts to refresh',
        data: { refreshed: 0 }
      });
    }

    let refreshed = 0;
    const errors: string[] = [];

    // Refresh each account (in practice, this could be a background job)
    for (const account of accountsResult.rows) {
      try {
        const response = await fetch(`${MT5_SERVICE_URL}/account/extended`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account: account.account_number,
            server: account.server
          }),
          signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const gainPercentage = data.balance > 0 ? (data.profit / data.balance) * 100 : 0;

            await query(
              `UPDATE mt5_accounts SET
                 balance = $2,
                 equity = $3,
                 profit = $4,
                 gain_percentage = $5,
                 open_positions_count = $6,
                 last_sync_at = NOW(),
                 updated_at = NOW()
               WHERE id = $1`,
              [
                account.id,
                data.balance || 0,
                data.equity || 0,
                data.profit || 0,
                gainPercentage,
                data.open_positions_count || 0
              ]
            );
            refreshed++;
          }
        }
      } catch (err: any) {
        errors.push(`Account ${account.account_number}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Refreshed ${refreshed} of ${accountsResult.rows.length} accounts`,
      data: {
        total: accountsResult.rows.length,
        refreshed,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('MT5 bulk status refresh error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
