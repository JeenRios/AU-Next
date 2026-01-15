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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-white">
            AU<span className="text-purple-400">Next</span> <span className="text-sm text-purple-400">Admin</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/admin" className="text-gray-300 hover:text-white transition">Dashboard</a>
            <a href="/admin/analytics" className="text-purple-400 font-medium">Analytics</a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Trading Analytics</h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-gray-400 text-sm mb-2">Total Volume</div>
            <div className="text-3xl font-bold text-white">
              {trades.reduce((sum, t) => sum + parseFloat(t.amount), 0).toFixed(2)}
            </div>
            <div className="text-green-400 text-sm mt-2">Units traded</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-gray-400 text-sm mb-2">Average Trade Value</div>
            <div className="text-3xl font-bold text-purple-400">{stats?.avg_amount || '0.00'}</div>
            <div className="text-gray-400 text-sm mt-2">Per transaction</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-gray-400 text-sm mb-2">Buy/Sell Ratio</div>
            <div className="text-3xl font-bold text-white">
              {stats?.buy_trades && stats?.sell_trades 
                ? (Number(stats.buy_trades) / Number(stats.sell_trades)).toFixed(2)
                : '0.00'}
            </div>
            <div className="text-gray-400 text-sm mt-2">Buy vs Sell</div>
          </div>
        </div>

        {/* Top Trading Pairs */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Top Trading Pairs</h2>
          <div className="space-y-4">
            {topSymbols.map(([symbol, data]: any, index) => (
              <div key={symbol} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">{symbol}</span>
                    <span className="text-gray-400">{data.count} trades</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                      style={{ width: `${(data.count / trades.length) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{data.volume.toFixed(2)}</div>
                  <div className="text-gray-400 text-sm">Volume</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trade Type Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Trade Distribution</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-green-400 font-medium">Buy Orders</span>
                  <span className="text-white">{stats?.buy_trades || 0}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: `${(Number(stats?.buy_trades) / Number(stats?.total_trades)) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-red-400 font-medium">Sell Orders</span>
                  <span className="text-white">{stats?.sell_trades || 0}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full"
                    style={{ width: `${(Number(stats?.sell_trades) / Number(stats?.total_trades)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
            <div className="space-y-3">
              {trades.slice(0, 5).map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-white font-medium">{trade.symbol}</div>
                    <div className="text-gray-400 text-sm">
                      {new Date(trade.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${
                      trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {trade.type}
                    </div>
                    <div className="text-gray-400 text-sm">{parseFloat(trade.amount).toFixed(2)}</div>
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
