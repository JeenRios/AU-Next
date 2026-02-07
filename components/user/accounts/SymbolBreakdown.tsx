'use client';

import { useState } from 'react';

interface SymbolData {
  symbol: string;
  trades: number;
  winRate: number;
  profit: number;
  pips: number;
  lots: number;
  avgDuration: string;
}

interface SymbolBreakdownProps {
  data?: SymbolData[];
  loading?: boolean;
}

export function SymbolBreakdownSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-[#c9a227] via-[#f0d78c] to-[#c9a227]" />
      <div className="p-6">
        <div className="w-40 h-6 bg-gray-200 rounded mb-6 animate-pulse" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SymbolBreakdown({ data, loading }: SymbolBreakdownProps) {
  const [sortBy, setSortBy] = useState<'profit' | 'trades' | 'winRate'>('profit');

  if (loading || !data) return <SymbolBreakdownSkeleton />;

  const sortedData = [...data].sort((a, b) => {
    switch (sortBy) {
      case 'profit':
        return b.profit - a.profit;
      case 'trades':
        return b.trades - a.trades;
      case 'winRate':
        return b.winRate - a.winRate;
      default:
        return 0;
    }
  });

  const totalProfit = data.reduce((sum, s) => sum + s.profit, 0);
  const maxProfit = Math.max(...data.map(s => Math.abs(s.profit)));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-[#c9a227] via-[#f0d78c] to-[#c9a227]" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#1a1a1d]">Performance by Symbol</h3>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['profit', 'trades', 'winRate'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setSortBy(option)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
                  sortBy === option
                    ? 'bg-white text-[#1a1a1d] shadow-sm'
                    : 'text-gray-500 hover:text-[#1a1a1d]'
                }`}
              >
                {option === 'winRate' ? 'Win %' : option}
              </button>
            ))}
          </div>
        </div>

        {/* Symbol List */}
        <div className="space-y-3">
          {sortedData.map((symbol) => {
            const profitPercent = Math.abs(symbol.profit) / maxProfit * 100;
            const isPositive = symbol.profit >= 0;

            return (
              <div
                key={symbol.symbol}
                className="relative p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                {/* Background bar */}
                <div
                  className={`absolute inset-y-0 left-0 rounded-l-xl transition-all ${
                    isPositive ? 'bg-green-100' : 'bg-red-100'
                  }`}
                  style={{ width: `${profitPercent}%`, opacity: 0.5 }}
                />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Symbol */}
                    <div className="w-20">
                      <span className="font-bold text-[#1a1a1d]">{symbol.symbol}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-gray-500">Trades:</span>{' '}
                        <span className="font-medium text-[#1a1a1d]">{symbol.trades}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Win:</span>{' '}
                        <span className={`font-medium ${symbol.winRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                          {symbol.winRate.toFixed(0)}%
                        </span>
                      </div>
                      <div className="hidden sm:block">
                        <span className="text-gray-500">Pips:</span>{' '}
                        <span className={`font-medium ${symbol.pips >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {symbol.pips >= 0 ? '+' : ''}{symbol.pips.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Profit */}
                  <div className="text-right">
                    <div className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? '+' : ''}${symbol.profit.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {((symbol.profit / totalProfit) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                </div>

                {/* Expanded details on hover */}
                <div className="relative mt-3 pt-3 border-t border-gray-200 hidden group-hover:flex items-center justify-between text-xs text-gray-500">
                  <span>Volume: {symbol.lots.toFixed(2)} lots</span>
                  <span>Avg Duration: {symbol.avgDuration}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-500">Total Symbols</div>
            <div className="text-lg font-bold text-[#1a1a1d]">{data.length}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Best Performer</div>
            <div className="text-lg font-bold text-green-600">
              {sortedData[0]?.symbol || '-'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Total Profit</div>
            <div className={`text-lg font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
