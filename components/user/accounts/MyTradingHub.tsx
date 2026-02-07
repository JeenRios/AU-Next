'use client';

import { useState, useEffect } from 'react';

interface MyTradingHubProps {
  gain?: number;
  absGain?: number;
  daily?: number;
  monthly?: number;
  drawdown?: number;
  balance?: number;
  equity?: number;
  equityPercent?: number;
  highest?: { date: string; value: number };
  profit?: number;
  interest?: number;
  deposits?: number;
  withdrawals?: number;
  updated?: string;
  tracking?: number;
}

type ChartTab = 'growth' | 'balance' | 'profit' | 'drawdown';

// Generate mock chart data
const generateChartData = (type: ChartTab, points: number = 30) => {
  const data: { date: string; value: number }[] = [];
  let value = type === 'growth' ? 0 : type === 'balance' ? 10000 : type === 'profit' ? 0 : 0;
  
  for (let i = 0; i < points; i++) {
    const date = new Date(2025, 0, i + 1);
    
    if (type === 'growth') {
      value += (Math.random() - 0.3) * 8;
      value = Math.max(-20, value);
    } else if (type === 'balance') {
      value += (Math.random() - 0.4) * 500;
      value = Math.max(5000, value);
    } else if (type === 'profit') {
      value += (Math.random() - 0.35) * 300;
    } else if (type === 'drawdown') {
      value = Math.random() * 15 + (i > 15 ? 20 : 5);
    }
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Number(value.toFixed(2)),
    });
  }
  return data;
};

const chartData = {
  growth: generateChartData('growth', 50),
  balance: generateChartData('balance', 50),
  profit: generateChartData('profit', 50),
  drawdown: generateChartData('drawdown', 50),
};

export default function MyTradingHub({
  gain = 179.88,
  absGain = 176.89,
  daily = 0.08,
  monthly = 9.22,
  drawdown = 60.46,
  balance = 0.00,
  equity = 0.00,
  equityPercent = 0,
  highest = { date: 'Jun 12', value: 54475.39 },
  profit = 31900.00,
  interest = -2571.93,
  deposits = 18034.00,
  withdrawals = 49934.00,
  updated = 'May 22, 2024 at 10:43',
  tracking = 156,
}: MyTradingHubProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeChart, setActiveChart] = useState<ChartTab>('growth');
  const [animateChart, setAnimateChart] = useState(false);

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

  const formatValue = (val: number, prefix = '', suffix = '') => {
    if (val >= 0) return `${prefix}+${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${suffix}`;
    return `${prefix}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${suffix}`;
  };

  const stats = [
    { label: 'Gain', value: formatValue(gain, '', '%'), positive: gain >= 0 },
    { label: 'Abs. Gain', value: formatValue(absGain, '', '%'), positive: absGain >= 0 },
    { label: 'Daily', value: `${daily >= 0 ? '+' : ''}${daily.toFixed(2)}%`, positive: daily >= 0 },
    { label: 'Monthly', value: `${monthly >= 0 ? '+' : ''}${monthly.toFixed(2)}%`, positive: monthly >= 0 },
    { label: 'Drawdown', value: `${drawdown.toFixed(2)}%`, positive: false, isDrawdown: true },
    { label: 'Balance', value: `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, neutral: true },
    { label: 'Equity', value: `(${equityPercent}%) $${equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, neutral: true },
    { label: 'Highest', value: `(${highest.date}) $${highest.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, neutral: true },
    { label: 'Profit', value: `$${profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, positive: profit >= 0 },
    { label: 'Interest', value: `$${interest.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, positive: interest >= 0 },
    { label: 'Deposits', value: `$${deposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, neutral: true },
    { label: 'Withdrawals', value: `$${withdrawals.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, neutral: true },
  ];

  return (
    <div className="relative">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a227] to-[#8b6914] flex items-center justify-center shadow-lg shadow-[#c9a227]/20">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 9l-5 5-4-4-3 3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-[#1a1a1d]">My Portfolio</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="relative">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                    <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-ping" />
                  </div>
                  <span className="text-[10px] text-gray-500">Connected</span>
                </div>
                <span className="text-[10px] text-gray-300">•</span>
                <span className="text-[10px] text-gray-500">{tracking} tracking</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-right ${gain >= 0 ? 'text-[#16a34a]' : 'text-red-500'}`}>
              <p className="text-lg font-bold">{gain >= 0 ? '+' : ''}{gain.toFixed(2)}%</p>
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
              <span className="text-[10px] text-gray-500">{updated}</span>
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
                  <linearGradient id={`gradient-${activeChart}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={colors.fill} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={colors.fill} stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Area fill */}
                <path
                  d={areaPath}
                  fill={`url(#gradient-${activeChart})`}
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
    </div>
  );
}
