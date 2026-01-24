'use client';

interface MT5Account {
  id: number;
  account_number: string;
  server: string;
  platform: string;
  status: string;
  balance?: number;
  equity?: number;
  profit?: number;
  ea_status?: string;
}

interface Trade {
  id: number;
  symbol: string;
  type: string;
  amount: string;
  price: string;
  profit: number;
  status: string;
  created_at: string;
}

interface OverviewContentProps {
  mt5Accounts: MT5Account[];
  trades: Trade[];
  stats: {
    totalBalance?: string;
    totalTrades?: number;
    winRate?: number;
  } | null;
  onNavigate: (tab: string) => void;
}

export default function OverviewContent({
  mt5Accounts,
  trades,
  stats,
  onNavigate,
}: OverviewContentProps) {
  const activeAccounts = mt5Accounts.filter(a => a.status === 'active');
  const pendingAccounts = mt5Accounts.filter(a => a.status !== 'active');
  const recentTrades = trades.slice(0, 5);

  // Calculate quick stats
  const totalProfit = trades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
  const profitableTrades = trades.filter(t => t.profit > 0).length;
  const winRate = trades.length > 0 ? ((profitableTrades / trades.length) * 100).toFixed(1) : '0';

  return (
    <div className="p-6 space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-xl p-6 text-[#1a1a1d]">
          <div className="text-sm opacity-80 mb-1">Total Balance</div>
          <div className="text-3xl font-bold">${stats?.totalBalance || '0.00'}</div>
          <div className="text-xs opacity-70 mt-1">Across all accounts</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-1">Active Accounts</div>
          <div className="text-3xl font-bold text-[#1a1a1d]">{activeAccounts.length}</div>
          <div className="text-xs text-gray-500 mt-1">{pendingAccounts.length} pending</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-1">Win Rate</div>
          <div className="text-3xl font-bold text-[#1a1a1d]">{stats?.winRate || winRate}%</div>
          <div className={`text-xs mt-1 ${parseFloat(winRate) > 50 ? 'text-green-600' : 'text-gray-500'}`}>
            {parseFloat(winRate) > 50 ? 'Above average' : 'Below average'}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-1">Total P/L</div>
          <div className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">All time</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate('accounts')}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:border-[#c9a227] transition-all group text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-[#1a1a1d] group-hover:text-[#c9a227] transition-colors">
                Manage Accounts
              </h4>
              <p className="text-sm text-gray-500">Connect or manage your MT5 accounts</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-[#c9a227] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        <button
          onClick={() => onNavigate('performance')}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:border-[#c9a227] transition-all group text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-400 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-[#1a1a1d] group-hover:text-[#c9a227] transition-colors">
                View Performance
              </h4>
              <p className="text-sm text-gray-500">Analyze your trading history</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-[#c9a227] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      {/* Active Accounts Summary */}
      {activeAccounts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-[#1a1a1d]">Active Accounts</h3>
            <button
              onClick={() => onNavigate('accounts')}
              className="text-sm text-[#c9a227] hover:underline"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {activeAccounts.slice(0, 3).map((account) => (
              <div key={account.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{account.platform}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a1a1d]">#{account.account_number}</p>
                    <p className="text-xs text-gray-500">{account.server}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#1a1a1d]">${(account.balance || 0).toFixed(2)}</p>
                  <p className={`text-xs ${(account.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(account.profit || 0) >= 0 ? '+' : ''}${(account.profit || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Trades */}
      {recentTrades.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-[#1a1a1d]">Recent Trades</h3>
            <button
              onClick={() => onNavigate('performance')}
              className="text-sm text-[#c9a227] hover:underline"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {recentTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">#{trade.id}</td>
                    <td className="py-3 px-4 font-semibold text-[#1a1a1d]">{trade.symbol}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        trade.type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-semibold ${trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trade.profit >= 0 ? '+' : ''}${(trade.profit || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-gray-500">
                      {new Date(trade.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {mt5Accounts.length === 0 && trades.length === 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-dashed border-[#f0d78c] p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-[#1a1a1d] mb-3">Get Started with Trading</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Connect your MetaTrader 5 account to start tracking your trades and performance.
          </p>
          <button
            onClick={() => onNavigate('accounts')}
            className="px-8 py-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Connect MT5 Account
          </button>
        </div>
      )}
    </div>
  );
}
