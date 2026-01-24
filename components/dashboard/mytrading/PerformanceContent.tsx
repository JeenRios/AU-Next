'use client';

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

interface PerformanceContentProps {
  trades: Trade[];
  performanceFilter: 'all' | 'profit' | 'loss';
  setPerformanceFilter: (filter: 'all' | 'profit' | 'loss') => void;
  dateRange: 'week' | 'month' | 'year';
  setDateRange: (range: 'week' | 'month' | 'year') => void;
}

export default function PerformanceContent({
  trades,
  performanceFilter,
  setPerformanceFilter,
  dateRange,
  setDateRange,
}: PerformanceContentProps) {
  const filteredTrades = trades.filter((trade) => {
    if (performanceFilter === 'all') return true;
    if (performanceFilter === 'profit') return trade.profit > 0;
    if (performanceFilter === 'loss') return trade.profit < 0;
    return true;
  });

  // Calculate summary stats
  const totalProfitLoss = filteredTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
  const profitableTrades = filteredTrades.filter(t => t.profit > 0).length;
  const winRate = filteredTrades.length > 0 ? ((profitableTrades / filteredTrades.length) * 100).toFixed(1) : '0';
  const avgTrade = filteredTrades.length > 0
    ? (totalProfitLoss / filteredTrades.length).toFixed(2)
    : '0.00';

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Filter:</span>
          <button
            onClick={() => setPerformanceFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              performanceFilter === 'all'
                ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Trades
          </button>
          <button
            onClick={() => setPerformanceFilter('profit')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              performanceFilter === 'profit'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Profitable
          </button>
          <button
            onClick={() => setPerformanceFilter('loss')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              performanceFilter === 'loss'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Loss
          </button>
        </div>
        <div className="border-l border-gray-300 pl-4 flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Period:</span>
          <button
            onClick={() => setDateRange('week')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              dateRange === 'week'
                ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              dateRange === 'month'
                ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setDateRange('year')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              dateRange === 'year'
                ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Total Profit/Loss</div>
          <div className={`text-3xl font-bold ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalProfitLoss >= 0 ? '+' : ''}${totalProfitLoss.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">This period</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Win Rate</div>
          <div className="text-3xl font-bold text-[#1a1a1d]">{winRate}%</div>
          <div className={`text-xs mt-1 ${parseFloat(winRate) > 50 ? 'text-green-600' : 'text-gray-500'}`}>
            {parseFloat(winRate) > 50 ? 'Above average' : 'Below average'}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Total Trades</div>
          <div className="text-3xl font-bold text-[#1a1a1d]">{filteredTrades.length}</div>
          <div className="text-xs text-gray-500 mt-1">This period</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Avg Trade</div>
          <div className={`text-3xl font-bold ${parseFloat(avgTrade) >= 0 ? 'text-[#1a1a1d]' : 'text-red-600'}`}>
            ${avgTrade}
          </div>
          <div className="text-xs text-gray-500 mt-1">Per trade</div>
        </div>
      </div>

      {/* Trades Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredTrades.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No trades found</h3>
            <p className="text-sm text-gray-500">No trades match your current filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-6 text-gray-600 font-semibold">Trade ID</th>
                  <th className="text-left py-4 px-6 text-gray-600 font-semibold">Symbol</th>
                  <th className="text-left py-4 px-6 text-gray-600 font-semibold">Type</th>
                  <th className="text-left py-4 px-6 text-gray-600 font-semibold">Amount</th>
                  <th className="text-left py-4 px-6 text-gray-600 font-semibold">Price</th>
                  <th className="text-left py-4 px-6 text-gray-600 font-semibold">Profit/Loss</th>
                  <th className="text-left py-4 px-6 text-gray-600 font-semibold">Status</th>
                  <th className="text-left py-4 px-6 text-gray-600 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-mono text-sm text-gray-600">#{trade.id}</td>
                    <td className="py-4 px-6 font-semibold text-[#1a1a1d]">{trade.symbol}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        trade.type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-[#1a1a1d]">${parseFloat(trade.amount).toFixed(2)}</td>
                    <td className="py-4 px-6 text-gray-600">${parseFloat(trade.price).toFixed(4)}</td>
                    <td className="py-4 px-6">
                      <span className={`font-semibold ${trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trade.profit >= 0 ? '+' : ''}{trade.profit ? `$${parseFloat(String(trade.profit)).toFixed(2)}` : '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        trade.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {trade.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{new Date(trade.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
