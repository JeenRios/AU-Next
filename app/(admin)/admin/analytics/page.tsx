'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, tradesRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/trades'),
      ]);
      
      const statsData = await statsRes.json();
      const tradesData = await tradesRes.json();
      
      setStats(statsData.data);
      setTrades(tradesData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate symbol distribution
  const symbolStats = trades.reduce((acc: any, trade) => {
    if (!acc[trade.symbol]) {
      acc[trade.symbol] = { count: 0, volume: 0 };
    }
    acc[trade.symbol].count++;
    acc[trade.symbol].volume += parseFloat(trade.amount);
    return acc;
  }, {});

  const topSymbols = Object.entries(symbolStats)
    .sort((a: any, b: any) => b[1].count - a[1].count)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50 to-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#c9a227] rounded-full animate-spin"></div>
          <div className="text-[#1a1a1d] text-lg font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50 to-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-[#1a1a1d]">
            AU<span className="text-[#c9a227]">Next</span> <span className="text-sm text-[#c9a227]">Admin</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/admin" className="text-gray-600 hover:text-[#1a1a1d] transition">Dashboard</a>
            <a href="/admin/analytics" className="text-[#c9a227] font-medium">Analytics</a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-[#1a1a1d] mb-8">Trading Analytics</h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-gray-600 text-sm mb-2">Total Volume</div>
            <div className="text-3xl font-bold text-[#1a1a1d]">
              {trades.reduce((sum, t) => sum + parseFloat(t.amount), 0).toFixed(2)}
            </div>
            <div className="text-green-600 text-sm mt-2">Units traded</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-gray-600 text-sm mb-2">Average Trade Value</div>
            <div className="text-3xl font-bold text-[#c9a227]">{stats?.avgAmount || '0.00'}</div>
            <div className="text-gray-600 text-sm mt-2 font-medium">Per transaction</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-gray-600 text-sm mb-2">Buy/Sell Ratio</div>
            <div className="text-3xl font-bold text-[#1a1a1d]">
              {stats?.buyTrades && stats?.sellTrades
                ? (Number(stats.buyTrades) / Number(stats.sellTrades)).toFixed(2)
                : '0.00'}
            </div>
            <div className="text-gray-600 text-sm mt-2 font-medium">Buy vs Sell</div>
          </div>
        </div>

        {/* Top Trading Pairs */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-[#1a1a1d] mb-6">Top Trading Pairs</h2>
          <div className="space-y-4">
            {topSymbols.map(([symbol, data]: any, index) => (
              <div key={symbol} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-[#c9a227] rounded-full flex items-center justify-center text-[#1a1a1d] font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#1a1a1d] font-medium">{symbol}</span>
                    <span className="text-gray-600">{data.count} trades</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#c9a227] to-[#f0d78c] h-2 rounded-full"
                      style={{ width: `${(data.count / trades.length) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[#1a1a1d] font-medium">{data.volume.toFixed(2)}</div>
                  <div className="text-gray-600 text-sm">Volume</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trade Type Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-[#1a1a1d] mb-6">Trade Distribution</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-green-600 font-bold">Buy Orders</span>
                  <span className="text-[#1a1a1d] font-bold">{stats?.buyTrades || 0}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: `${(Number(stats?.buyTrades) / Number(stats?.totalTrades)) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-rose-600 font-bold">Sell Orders</span>
                  <span className="text-[#1a1a1d] font-bold">{stats?.sellTrades || 0}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-rose-500 h-3 rounded-full"
                    style={{ width: `${(Number(stats?.sellTrades) / Number(stats?.totalTrades)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-[#1a1a1d] mb-6">Recent Activity</h2>
            <div className="space-y-3">
              {trades.slice(0, 5).map((trade: any) => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <div className="text-[#1a1a1d] font-bold">{trade.symbol}</div>
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      {new Date(trade.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-black text-sm ${
                      trade.type === 'BUY' ? 'text-green-600' : 'text-rose-600'
                    }`}>
                      {trade.type}
                    </div>
                    <div className="text-slate-500 text-xs font-bold">{parseFloat(trade.amount).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
