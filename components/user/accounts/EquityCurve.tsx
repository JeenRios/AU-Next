'use client';

import { useState } from 'react';

interface DataPoint {
  date: string;
  balance: number;
  equity: number;
}

interface EquityCurveProps {
  data?: DataPoint[];
  loading?: boolean;
  height?: number;
}

export function EquityCurveSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
      <div className="h-1 bg-gradient-to-r from-[#c9a227] via-[#f0d78c] to-[#c9a227]" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="w-32 h-6 bg-gray-200 rounded" />
          <div className="flex gap-2">
            <div className="w-16 h-8 bg-gray-200 rounded" />
            <div className="w-16 h-8 bg-gray-200 rounded" />
            <div className="w-16 h-8 bg-gray-200 rounded" />
          </div>
        </div>
        <div className={`bg-gray-100 rounded-lg`} style={{ height }} />
      </div>
    </div>
  );
}

export default function EquityCurve({ data, loading, height = 300 }: EquityCurveProps) {
  const [timeRange, setTimeRange] = useState<'1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'>('1M');
  const [showEquity, setShowEquity] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  if (loading || !data || data.length === 0) return <EquityCurveSkeleton height={height} />;

  // Calculate chart bounds
  const allValues = data.flatMap(d => [d.balance, d.equity]);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = maxValue - minValue || 1;
  const padding = range * 0.1;

  // Generate SVG path
  const generatePath = (values: number[]) => {
    const points = values.map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 100 - ((value - minValue + padding) / (range + padding * 2)) * 100;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  // Generate area path (for gradient fill)
  const generateAreaPath = (values: number[]) => {
    const linePath = generatePath(values);
    return `${linePath} L 100,100 L 0,100 Z`;
  };

  const balancePath = generatePath(data.map(d => d.balance));
  const equityPath = generatePath(data.map(d => d.equity));
  const balanceAreaPath = generateAreaPath(data.map(d => d.balance));

  const currentBalance = data[data.length - 1].balance;
  const startBalance = data[0].balance;
  const totalGain = currentBalance - startBalance;
  const totalGainPercent = ((totalGain / startBalance) * 100).toFixed(2);

  const timeRanges = ['1W', '1M', '3M', '6M', '1Y', 'ALL'] as const;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-[#c9a227] via-[#f0d78c] to-[#c9a227]" />
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-[#1a1a1d]">Equity Curve</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-sm font-semibold ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalGain >= 0 ? '+' : ''}{totalGainPercent}%
              </span>
              <span className="text-xs text-gray-400">all time</span>
            </div>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  timeRange === range
                    ? 'bg-white text-[#1a1a1d] shadow-sm'
                    : 'text-gray-500 hover:text-[#1a1a1d]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setShowBalance(!showBalance)}
            className={`flex items-center gap-2 text-xs transition-opacity ${!showBalance && 'opacity-40'}`}
          >
            <div className="w-3 h-3 rounded-sm bg-[#c9a227]" />
            <span className="text-gray-600">Balance</span>
          </button>
          <button
            onClick={() => setShowEquity(!showEquity)}
            className={`flex items-center gap-2 text-xs transition-opacity ${!showEquity && 'opacity-40'}`}
          >
            <div className="w-3 h-3 rounded-sm bg-blue-500" />
            <span className="text-gray-600">Equity</span>
          </button>
        </div>

        {/* Chart */}
        <div className="relative" style={{ height }}>
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c9a227" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#c9a227" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="0.2"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {/* Balance area fill */}
            {showBalance && (
              <path
                d={balanceAreaPath}
                fill="url(#balanceGradient)"
              />
            )}

            {/* Balance line */}
            {showBalance && (
              <path
                d={balancePath}
                fill="none"
                stroke="#c9a227"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                className="drop-shadow-sm"
              />
            )}

            {/* Equity line */}
            {showEquity && (
              <path
                d={equityPath}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="1.5"
                strokeDasharray="4,2"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 -ml-2 pr-2">
            <span>${(maxValue + padding).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span>${((maxValue + minValue) / 2).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span>${(minValue - padding).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>{data[0]?.date}</span>
          <span>{data[Math.floor(data.length / 2)]?.date}</span>
          <span>{data[data.length - 1]?.date}</span>
        </div>

        {/* Current Values */}
        <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500">Current Balance</div>
            <div className="text-xl font-bold text-[#c9a227]">
              ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Current Equity</div>
            <div className="text-xl font-bold text-[#1a1a1d]">
              ${data[data.length - 1].equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
