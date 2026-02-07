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
  const [activeTab, setActiveTab] = useState<'equity' | 'monthly'>('equity');
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
      absGain: ((latest.balance - initial) / initial) * 100 - 3, // Mock slightly different abs gain
      daily: 0.08,
      monthly: 9.22,
      drawdown: 5.2,
      maxDrawdown: 12.8,
      winRate: 62.8,
      profitFactor: 1.67,
      totalTrades: 156,
      winningTrades: 98,
      losingTrades: 58,
      interest: -2571.93,
      deposits: 18034.00,
      withdrawals: 49934.00,
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
          {/* Key Stats Grid */}
          <div className="w-80 p-4 bg-gray-800 rounded-lg shadow-sm border border-gray-700">
            {/* Main Gain Metric */}
            <div className="bg-gradient-to-r from-primary-gold/20 to-secondary-gold/20 rounded-lg p-2 text-center mb-2">
              <p className="text-sm font-semibold text-primary-gold uppercase tracking-wider">Gain</p>
              <p className={`text-3xl font-bold mt-1 ${stats.gain >= 0 ? 'text-primary-gold' : 'text-red-500'}`}>
                {stats.gain >= 0 ? '+' : ''}{stats.gain.toFixed(2)}%
              </p>
            </div>

            {/* Other Metrics List */}
            <div className="space-y-0 text-xs">
              <div className="flex justify-between items-center px-3 py-1 rounded-lg transition-colors duration-200 hover:bg-primary-gold/20">
                <span className="text-gray-300">Abs. Gain</span>
                <span className="font-semibold text-primary-gold">+{stats.absGain.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center px-3 py-1 rounded-lg transition-colors duration-200 hover:bg-primary-gold/20">
                <span className="text-gray-300">Daily</span>
                <span className="font-semibold text-primary-gold">+{stats.daily.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center px-3 py-1 rounded-lg transition-colors duration-200 hover:bg-primary-gold/20">
                <span className="text-gray-300">Monthly</span>
                <span className="font-semibold text-primary-gold">+{stats.monthly.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center px-3 py-1 rounded-lg transition-colors duration-200 hover:bg-primary-gold/20">
                <span className="text-gray-300">Drawdown</span>
                <span className="font-semibold text-orange-400">{stats.drawdown}%</span>
              </div>
              <div className="flex justify-between items-center px-3 py-1 rounded-lg transition-colors duration-200 hover:bg-primary-gold/20">
                <span className="text-gray-300">Balance</span>
                <span className="font-semibold text-white">${stats.balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center px-3 py-1 rounded-lg transition-colors duration-200 hover:bg-primary-gold/20">
                <span className="text-gray-300">Equity</span>
                <span className="font-semibold text-white">${stats.equity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center px-3 py-1 rounded-lg transition-colors duration-200 hover:bg-primary-gold/20">
                <span className="text-gray-300">Profit</span>
                <span className={`font-semibold ${stats.profit >= 0 ? 'text-primary-gold' : 'text-red-500'}`}>
                  {stats.profit >= 0 ? '+' : ''}${Math.abs(stats.profit).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center px-3 py-1 rounded-lg transition-colors duration-200 hover:bg-primary-gold/20">
                <span className="text-gray-300">Interest</span>
                <span className={`font-semibold ${stats.interest >= 0 ? 'text-primary-gold' : 'text-red-500'}`}>
                  {stats.interest >= 0 ? '+' : ''}${Math.abs(stats.interest).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center px-3 py-1 rounded-lg transition-colors duration-200 hover:bg-primary-gold/20">
                <span className="text-gray-300">Deposits</span>
                <span className="font-semibold text-white">${stats.deposits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center px-3 py-1 rounded-lg transition-colors duration-200 hover:bg-primary-gold/20">
                <span className="text-gray-300">Withdrawals</span>
                <span className="font-semibold text-white">${stats.withdrawals.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center px-3 py-1 rounded-lg transition-colors duration-200 hover:bg-primary-gold/20">
                <span className="text-gray-300">Win Rate</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-semibold text-white">{stats.winRate}%</span>
                  <span className="text-[10px] text-gray-400">({stats.winningTrades}W/{stats.losingTrades}L)</span>
                </div>
              </div>
              <div className="flex justify-between items-center px-3 py-1 rounded-lg transition-colors duration-200 hover:bg-primary-gold/20">
                <span className="text-gray-300">Profit Factor</span>
                <span className="font-semibold text-white">{stats.profitFactor}</span>
              </div>
            </div>

            {/* Mini Stats Row */}
            <div className="mt-3 flex items-center justify-between text-xs text-gray-400 px-1 pt-2 border-t border-gray-700">
              <span>Max DD: <strong className="text-orange-400">{stats.maxDrawdown}%</strong></span>
              <span>Trades: <strong className="text-white">{stats.totalTrades}</strong></span>
            </div>
          </div>
          {/* Right: Equity/Monthly Tabbed View */}
          <div className="flex-1 p-5 border-l border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('equity')}
                  className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                    activeTab === 'equity'
                      ? 'border-primary-gold text-[#1a1a1d]'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    activeTab === 'equity' ? 'bg-gradient-to-br from-primary-gold to-secondary-gold text-[#1a1a1d]' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold">Equity Curve</h3>
                    {activeTab === 'equity' && (
                      <p className="text-[10px] text-gray-400">Account #{accountNumber || '123456'}</p>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('monthly')}
                  className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                    activeTab === 'monthly'
                      ? 'border-primary-gold text-[#1a1a1d]'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    activeTab === 'monthly' ? 'bg-gradient-to-br from-primary-gold to-secondary-gold text-[#1a1a1d]' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold">Monthly</h3>
                    {activeTab === 'monthly' && (
                      <p className="text-[10px] text-gray-400">Performance</p>
                    )}
                  </div>
                </button>
              </div>

              {activeTab === 'equity' ? (
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
              ) : (
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary-gold"></span>Profit</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span>Loss</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                {activeTab === 'equity' ? (
                  <AreaChart data={filteredData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary-gold)" stopOpacity={0.3}/>
                        <stop offset="100%" stopColor="var(--primary-gold)" stopOpacity={0}/>
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
                      stroke="var(--primary-gold)"
                      strokeWidth={2}
                      fill="url(#balanceGradient)"
                    />
                  </AreaChart>
                ) : (
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
                      itemStyle={{ color: '#fff', fontSize: 12 }}
                      formatter={(value) => value !== undefined ? [`${Number(value).toFixed(2)}%`, 'Return'] : ['', '']}
                    />
                    <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                      {monthlyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.pct >= 0 ? 'var(--primary-gold)' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
            
            {activeTab === 'monthly' && (
              <div className="mt-4 grid grid-cols-6 gap-2 border-t border-gray-100 pt-3">
                {monthlyData.map((m, i) => (
                  <div key={i} className="text-center">
                    <p className="text-[10px] text-gray-400 mb-1">{m.month}</p>
                    <p className={`text-xs font-bold ${m.pct >= 0 ? 'text-primary-gold' : 'text-red-600'}`}>
                      {m.pct >= 0 ? '+' : ''}{m.pct.toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
