'use client';

import { useEffect, useState } from 'react';

interface Trade {
  symbol: string;
  type: string;
  amount: number;
  profit: number | null;
  time: string;
}

interface LiveFeedProps {
  initialTrades?: Trade[];
}

export default function LiveFeed({ initialTrades = [] }: LiveFeedProps) {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [isVisible, setIsVisible] = useState(true);

  // Simulated live updates (in production, use WebSocket)
  useEffect(() => {
    const symbols = ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD'];
    const types = ['BUY', 'SELL'];

    const addRandomTrade = () => {
      const newTrade: Trade = {
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        type: types[Math.floor(Math.random() * types.length)],
        amount: parseFloat((Math.random() * 10000 + 100).toFixed(2)),
        profit: Math.random() > 0.3 ? parseFloat((Math.random() * 500 - 100).toFixed(2)) : null,
        time: new Date().toISOString()
      };

      setTrades(prev => [newTrade, ...prev.slice(0, 9)]);
    };

    // Add initial trades if empty
    if (trades.length === 0) {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => addRandomTrade(), i * 200);
      }
    }

    // Add new trades periodically
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        addRandomTrade();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 hidden lg:block">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-semibold text-[#1a1a1d] text-sm">Live Trading Feed</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-[#1a1a1d]/70 hover:text-[#1a1a1d] transition-colors"
            aria-label="Close live feed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Trades List */}
        <div className="max-h-64 overflow-y-auto">
          {trades.map((trade, index) => (
            <div
              key={`${trade.time}-${index}`}
              className={`flex items-center justify-between px-4 py-2.5 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                index === 0 ? 'animate-pulse bg-green-50' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    trade.type === 'BUY'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {trade.type}
                </span>
                <span className="text-sm font-medium text-[#1a1a1d]">{trade.symbol}</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">${trade.amount.toLocaleString()}</div>
                {trade.profit !== null && (
                  <div
                    className={`text-xs font-semibold ${
                      trade.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-50 text-center">
          <span className="text-xs text-gray-500">
            {trades.length} recent trades • Updated live
          </span>
        </div>
      </div>
    </div>
  );
}
