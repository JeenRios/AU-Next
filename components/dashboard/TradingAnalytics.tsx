'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface TradingAnalyticsProps {
  accountId?: number;
  accountNumber?: string;
}

interface PerformanceData {
  date: string;
  balance: number;
  equity: number;
}

interface MonthlyData {
  month: string;
  profit: number;
  pct: number;
}

// Generate mock data
const generateMockData = () => {
  const performanceData: PerformanceData[] = [];
  const monthlyData: MonthlyData[] = [];

  let balance = 10000;
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);

  for (let i = 0; i < 180; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dailyChange = (Math.random() - 0.45) * 200;
    balance += dailyChange;
    balance = Math.max(balance, 5000);

    performanceData.push({
      date: date.toISOString().split('T')[0],
      balance: Math.round(balance * 100) / 100,
      equity: Math.round((balance + (Math.random() - 0.5) * 300) * 100) / 100
    });
  }

  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  months.forEach((month) => {
    const pct = Math.round((Math.random() - 0.3) * 20 * 100) / 100;
    monthlyData.push({
      month,
      profit: Math.round(pct * 100),
      pct
    });
  });

  return { performanceData, monthlyData };
};

export default function TradingAnalytics({ accountId, accountNumber }: TradingAnalyticsProps) {
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | 'ALL'>('6M');
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  const stats = useMemo(() => {
    if (performanceData.length === 0) return null;
    const latest = performanceData[performanceData.length - 1];
    const initial = 10000;
    return {
      balance: latest.balance,
      equity: latest.equity,
      profit: latest.balance - initial,
      gain: ((latest.balance - initial) / initial) * 100,
      drawdown: 5.2,
      maxDrawdown: 12.8,
      winRate: 62.8,
      profitFactor: 1.67,
      totalTrades: 156,
      winningTrades: 98,
      losingTrades: 58
    };
  }, [performanceData]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const { performanceData: perfData, monthlyData: monthData } = generateMockData();
      setPerformanceData(perfData);
      setMonthlyData(monthData);
      setLoading(false);
    }, 300);
  }, [accountId, timeframe]);

  const filteredData = useMemo(() => {
    let daysBack = 180;
    switch (timeframe) {
      case '1M': daysBack = 30; break;
      case '3M': daysBack = 90; break;
      case '6M': daysBack = 180; break;
      case 'ALL': daysBack = 9999; break;
    }
    return performanceData.slice(-daysBack);
  }, [performanceData, timeframe]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-[#c9a227] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Section: Chart + Stats Side by Side */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex">
          {/* Left: Equity Curve */}
          <div className="flex-1 p-5 border-r border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a227] to-[#e8c547] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#1a1a1d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1a1a1d]">Equity Curve</h3>
                  <p className="text-xs text-gray-400">Account #{accountNumber || '123456'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                {(['1M', '3M', '6M', 'ALL'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      timeframe === tf ? 'bg-white text-[#1a1a1d] shadow-sm' : 'text-gray-500 hover:text-[#1a1a1d]'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c9a227" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="#c9a227" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    interval="preserveStartEnd"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickFormatter={(v) => `$${(v/1000).toFixed(1)}k`}
                    axisLine={false}
                    tickLine={false}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1d', border: 'none', borderRadius: '8px', padding: '8px 12px' }}
                    labelStyle={{ color: '#9ca3af', fontSize: 11 }}
                    itemStyle={{ color: '#fff', fontSize: 12 }}
                    formatter={(value) => value !== undefined ? [`$${Number(value).toLocaleString()}`, ''] : ['', '']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#c9a227"
                    strokeWidth={2}
                    fill="url(#balanceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: Key Stats Grid */}
          <div className="w-80 p-5 bg-gray-50/50">
            <div className="grid grid-cols-2 gap-3">
              {/* Gain */}
              <div className="bg-white rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Gain</p>
                <p className={`text-xl font-bold mt-1 ${stats.gain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stats.gain >= 0 ? '+' : ''}{stats.gain.toFixed(2)}%
                </p>
              </div>

              {/* Balance */}
              <div className="bg-white rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Balance</p>
                <p className="text-xl font-bold mt-1 text-[#1a1a1d]">${stats.balance.toLocaleString()}</p>
              </div>

              {/* Profit */}
              <div className="bg-white rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Profit</p>
                <p className={`text-xl font-bold mt-1 ${stats.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stats.profit >= 0 ? '+' : ''}${Math.abs(stats.profit).toLocaleString()}
                </p>
              </div>

              {/* Drawdown */}
              <div className="bg-white rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Drawdown</p>
                <p className="text-xl font-bold mt-1 text-orange-500">{stats.drawdown}%</p>
              </div>

              {/* Win Rate */}
              <div className="bg-white rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Win Rate</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-xl font-bold text-[#1a1a1d]">{stats.winRate}%</p>
                  <p className="text-[10px] text-gray-400">{stats.winningTrades}W/{stats.losingTrades}L</p>
                </div>
              </div>

              {/* Profit Factor */}
              <div className="bg-white rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Profit Factor</p>
                <p className="text-xl font-bold mt-1 text-[#1a1a1d]">{stats.profitFactor}</p>
              </div>
            </div>

            {/* Mini Stats Row */}
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500 px-1">
              <span>Max DD: <strong className="text-orange-500">{stats.maxDrawdown}%</strong></span>
              <span>Trades: <strong className="text-[#1a1a1d]">{stats.totalTrades}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Section: Monthly Performance */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#1a1a1d]">Monthly Performance</h3>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Profit</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span>Loss</span>
          </div>
        </div>

        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickFormatter={(v) => `${v}%`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1d', border: 'none', borderRadius: '8px', padding: '8px 12px' }}
                labelStyle={{ color: '#9ca3af', fontSize: 11 }}
                formatter={(value) => value !== undefined ? [`${Number(value).toFixed(2)}%`, 'Return'] : ['', '']}
              />
              <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                {monthlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.pct >= 0 ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Summary Row */}
        <div className="mt-4 grid grid-cols-6 gap-2">
          {monthlyData.map((m, i) => (
            <div key={i} className="text-center">
              <p className="text-[10px] text-gray-400 mb-1">{m.month}</p>
              <p className={`text-sm font-bold ${m.pct >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {m.pct >= 0 ? '+' : ''}{m.pct.toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
