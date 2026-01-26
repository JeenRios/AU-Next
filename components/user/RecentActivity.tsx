'use client';

export function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          <div className="flex-1">
            <div className="w-24 h-4 bg-gray-200 rounded mb-2" />
            <div className="w-32 h-3 bg-gray-200 rounded" />
          </div>
          <div className="text-right">
            <div className="w-16 h-4 bg-gray-200 rounded mb-2" />
            <div className="w-12 h-3 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface Trade {
  id: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
  profit?: number;
  created_at: string;
}

interface RecentActivityProps {
  trades: Trade[];
  loading?: boolean;
}

export default function RecentActivity({ trades, loading }: RecentActivityProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="w-32 h-5 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="p-6">
          <ActivitySkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h3 className="font-bold text-[#1a1a1d] flex items-center gap-2">
          <svg className="w-5 h-5 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Activity
        </h3>
      </div>
      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        {trades.slice(0, 5).map((trade) => (
          <div
            key={trade.id}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors focus-within:ring-2 focus-within:ring-[#c9a227]"
            tabIndex={0}
            role="listitem"
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                trade.type === 'BUY' ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={trade.type === 'BUY' ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'}
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-[#1a1a1d]">
                {trade.type} {trade.symbol}
              </div>
              <div className="text-xs text-gray-600 truncate">
                ${parseFloat(String(trade.amount || 0)).toFixed(2)} @ ${parseFloat(String(trade.price || 0)).toFixed(4)}
              </div>
            </div>
            <div className="text-right">
              <div
                className={`text-sm font-semibold ${
                  Number(trade.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {Number(trade.profit || 0) >= 0 ? '+' : ''}
                {trade.profit != null ? `$${parseFloat(String(trade.profit)).toFixed(2)}` : '-'}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(trade.created_at || Date.now()).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
        {trades.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p>No recent trades</p>
            <p className="text-sm mt-1">Connect your MT5 account to start trading</p>
          </div>
        )}
      </div>
    </div>
  );
}
