'use client';

import { useState, useEffect } from 'react';

export interface AccountData {
  id: string;
  name: string;
  broker: string;
  accountNumber: string;
  gain: number;
  absGain: number;
  daily: number;
  monthly: number;
  drawdown: number;
  balance: number;
  equity: number;
  equityPercent: number;
  highest: { date: string; value: number };
  profit: number;
  interest: number;
  deposits: number;
  withdrawals: number;
  updated: string;
  tracking: number;
  isConnected: boolean;
  chartData?: {
    growth: { date: string; value: number }[];
    balance: { date: string; value: number }[];
    profit: { date: string; value: number }[];
    drawdown: { date: string; value: number }[];
  };
}

export type ChartTab = 'growth' | 'balance' | 'profit' | 'drawdown';

interface AccountPortfolioCardProps {
  account: AccountData;
  onEdit?: (account: AccountData) => void;
  onDisconnect?: (accountId: string) => void;
  onRefresh?: (accountId: string) => void;
  showActions?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

// Generate mock chart data with seeded random for consistency
const generateChartData = (type: ChartTab, points: number = 50, seed: number = 1) => {
  const data: { date: string; value: number }[] = [];
  let value = type === 'growth' ? 0 : type === 'balance' ? 10000 : type === 'profit' ? 0 : 0;
  
  // Simple seeded random function for consistent values
  const seededRandom = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };
  
  for (let i = 0; i < points; i++) {
    const date = new Date(2025, 0, i + 1);
    const rand = seededRandom(seed + i * 100 + (type === 'growth' ? 0 : type === 'balance' ? 1000 : type === 'profit' ? 2000 : 3000));
    
    if (type === 'growth') {
      value += (rand - 0.3) * 8;
      value = Math.max(-20, value);
    } else if (type === 'balance') {
      value += (rand - 0.4) * 500;
      value = Math.max(5000, value);
    } else if (type === 'profit') {
      value += (rand - 0.35) * 300;
    } else if (type === 'drawdown') {
      value = rand * 15 + (i > 15 ? 20 : 5);
    }
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Number(value.toFixed(2)),
    });
  }
  return data;
};

export const generateDefaultChartData = (seed: number = 42) => ({
  growth: generateChartData('growth', 50, seed),
  balance: generateChartData('balance', 50, seed),
  profit: generateChartData('profit', 50, seed),
  drawdown: generateChartData('drawdown', 50, seed),
});

export default function AccountPortfolioCard({
  account,
  onEdit,
  onDisconnect,
  onRefresh,
  showActions = true,
  defaultExpanded = false,
  className = '',
}: AccountPortfolioCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeChart, setActiveChart] = useState<ChartTab>('growth');
  const [animateChart, setAnimateChart] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Use provided chart data or generate default
  const chartData = account.chartData || generateDefaultChartData();

  useEffect(() => {
    setAnimateChart(false);
    const timer = setTimeout(() => setAnimateChart(true), 50);
    return () => clearTimeout(timer);
  }, [activeChart]);

  const currentData = chartData[activeChart];
  const minValue = Math.min(...currentData.map(d => d.value));
  const maxValue = Math.max(...currentData.map(d => d.value));
  const range = maxValue - minValue || 1;

  // Create SVG path for chart
  const chartHeight = 120;
  const chartWidth = 300;
  const points = currentData.map((d, i) => ({
    x: (i / (currentData.length - 1)) * chartWidth,
    y: chartHeight - ((d.value - minValue) / range) * (chartHeight - 20) - 10,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  const getChartColor = (tab: ChartTab) => {
    switch (tab) {
      case 'growth': return { line: '#4ade80', fill: '#4ade80' };
      case 'balance': return { line: '#c9a227', fill: '#c9a227' };
      case 'profit': return { line: '#60a5fa', fill: '#60a5fa' };
      case 'drawdown': return { line: '#f87171', fill: '#f87171' };
    }
  };

  const colors = getChartColor(activeChart);
  const lastValue = currentData[currentData.length - 1].value;

  const stats = [
    { label: 'Gain', value: `${account.gain >= 0 ? '+' : ''}${account.gain.toFixed(2)}%`, positive: account.gain >= 0 },
    { label: 'Abs. Gain', value: `${account.absGain >= 0 ? '+' : ''}${account.absGain.toFixed(2)}%`, positive: account.absGain >= 0 },
    { label: 'Daily', value: `${account.daily >= 0 ? '+' : ''}${account.daily.toFixed(2)}%`, positive: account.daily >= 0 },
    { label: 'Monthly', value: `${account.monthly >= 0 ? '+' : ''}${account.monthly.toFixed(2)}%`, positive: account.monthly >= 0 },
    { label: 'Drawdown', value: `${account.drawdown.toFixed(2)}%`, positive: false, isDrawdown: true },
    { label: 'Balance', value: `$${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, neutral: true },
    { label: 'Equity', value: `(${account.equityPercent}%) $${account.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, neutral: true },
    { label: 'Highest', value: `(${account.highest.date}) $${account.highest.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, neutral: true },
    { label: 'Profit', value: `$${account.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, positive: account.profit >= 0 },
    { label: 'Interest', value: `$${account.interest.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, positive: account.interest >= 0 },
    { label: 'Deposits', value: `$${account.deposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, neutral: true },
    { label: 'Withdrawals', value: `$${account.withdrawals.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, neutral: true },
  ];

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a227] to-[#8b6914] flex items-center justify-center shadow-lg shadow-[#c9a227]/20 flex-shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 9l-5 5-4-4-3 3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[#1a1a1d] truncate">{account.name}</h3>
              {showActions && (
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="6" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="12" cy="18" r="1.5" />
                    </svg>
                  </button>
                  {showMenu && (
                    <div className="absolute top-full left-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      {onEdit && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEdit(account); setShowMenu(false); }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      )}
                      {onRefresh && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onRefresh(account.id); setShowMenu(false); }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Refresh
                        </button>
                      )}
                      {onDisconnect && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDisconnect(account.id); setShowMenu(false); }}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Disconnect
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-gray-500">{account.broker}</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500">#{account.accountNumber}</span>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1">
                <div className="relative">
                  <div className={`w-1.5 h-1.5 rounded-full ${account.isConnected ? 'bg-[#4ade80]' : 'bg-gray-300'}`} />
                  {account.isConnected && (
                    <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-ping" />
                  )}
                </div>
                <span className={account.isConnected ? 'text-[#16a34a]' : 'text-gray-400'}>
                  {account.isConnected ? 'Connected' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`text-right ${account.gain >= 0 ? 'text-[#16a34a]' : 'text-red-500'}`}>
            <p className="text-lg font-bold">{account.gain >= 0 ? '+' : ''}{account.gain.toFixed(2)}%</p>
            <p className="text-[10px] text-gray-500">Total Gain</p>
          </div>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      <div className={`transition-all duration-300 ease-out overflow-hidden ${
        isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        {/* Stats Grid */}
        <div className="p-4 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-500">{stat.label}</span>
                <span className={`text-xs font-semibold font-mono ${
                  stat.neutral ? 'text-[#1a1a1d]' : 
                  stat.isDrawdown ? 'text-red-500' :
                  stat.positive ? 'text-[#16a34a]' : 'text-red-500'
                }`}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
          
          {/* Updated time */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <span className="text-[10px] text-gray-400">Updated</span>
            <span className="text-[10px] text-gray-500">{account.updated}</span>
          </div>
        </div>

        {/* Chart Section */}
        <div className="p-4">
          {/* Chart Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-4">
            {[
              { id: 'growth' as ChartTab, label: 'Growth' },
              { id: 'balance' as ChartTab, label: 'Balance' },
              { id: 'profit' as ChartTab, label: 'Profit' },
              { id: 'drawdown' as ChartTab, label: 'Drawdown' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveChart(tab.id);
                }}
                className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${
                  activeChart === tab.id
                    ? 'bg-white text-[#1a1a1d] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="relative h-[140px] bg-gray-50 rounded-xl overflow-hidden">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between py-2 px-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="border-t border-gray-200/50" />
              ))}
            </div>

            {/* Chart SVG */}
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={`gradient-${account.id}-${activeChart}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={colors.fill} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={colors.fill} stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Area fill */}
              <path
                d={areaPath}
                fill={`url(#gradient-${account.id}-${activeChart})`}
                className={`transition-all duration-700 ${animateChart ? 'opacity-100' : 'opacity-0'}`}
              />
              
              {/* Line */}
              <path
                d={linePath}
                fill="none"
                stroke={colors.line}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-all duration-700 ${animateChart ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  strokeDasharray: animateChart ? 'none' : '1000',
                  strokeDashoffset: animateChart ? '0' : '1000',
                }}
              />

              {/* End point */}
              <circle
                cx={points[points.length - 1]?.x || 0}
                cy={points[points.length - 1]?.y || 0}
                r="4"
                fill={colors.line}
                className={`transition-all duration-700 ${animateChart ? 'opacity-100' : 'opacity-0'}`}
              />
              <circle
                cx={points[points.length - 1]?.x || 0}
                cy={points[points.length - 1]?.y || 0}
                r="8"
                fill={colors.line}
                opacity="0.2"
                className={`transition-all duration-700 ${animateChart ? 'opacity-100' : 'opacity-0'}`}
              />
            </svg>

            {/* Value labels */}
            <div className="absolute top-2 left-3 text-[10px] text-gray-400">
              {activeChart === 'growth' || activeChart === 'drawdown' 
                ? `${maxValue.toFixed(1)}%` 
                : `$${maxValue.toLocaleString()}`}
            </div>
            <div className="absolute bottom-2 left-3 text-[10px] text-gray-400">
              {activeChart === 'growth' || activeChart === 'drawdown' 
                ? `${minValue.toFixed(1)}%` 
                : `$${minValue.toLocaleString()}`}
            </div>

            {/* Current value badge */}
            <div 
              className="absolute top-2 right-3 px-2 py-1 rounded-md text-xs font-bold"
              style={{ 
                backgroundColor: `${colors.fill}20`,
                color: colors.line 
              }}
            >
              {activeChart === 'growth' && `${lastValue >= 0 ? '+' : ''}${lastValue.toFixed(2)}%`}
              {activeChart === 'balance' && `$${lastValue.toLocaleString()}`}
              {activeChart === 'profit' && `${lastValue >= 0 ? '+' : ''}$${lastValue.toLocaleString()}`}
              {activeChart === 'drawdown' && `${lastValue.toFixed(2)}%`}
            </div>
          </div>

          {/* Time range */}
          <div className="flex justify-between mt-2 text-[10px] text-gray-400">
            <span>{currentData[0]?.date}</span>
            <span>{currentData[Math.floor(currentData.length / 2)]?.date}</span>
            <span>{currentData[currentData.length - 1]?.date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton loader
export function AccountPortfolioCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
          <div>
            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="w-48 h-3 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="text-right">
          <div className="w-20 h-5 bg-gray-200 rounded animate-pulse mb-1" />
          <div className="w-16 h-3 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
