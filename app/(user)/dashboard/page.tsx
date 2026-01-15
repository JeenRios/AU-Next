'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
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
      setTrades(tradesData.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-white">
            AU<span className="text-purple-400">Next</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="text-purple-400 font-medium">Dashboard</a>
            <a href="/trades" className="text-gray-300 hover:text-white transition">My Trades</a>
            <a href="/profile" className="text-gray-300 hover:text-white transition">Profile</a>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-300">Here&apos;s your trading overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-gray-400 text-sm mb-2">Total Trades</div>
            <div className="text-3xl font-bold text-white">{stats?.total_trades || 0}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-gray-400 text-sm mb-2">Buy Orders</div>
            <div className="text-3xl font-bold text-green-400">{stats?.buy_trades || 0}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-gray-400 text-sm mb-2">Sell Orders</div>
            <div className="text-3xl font-bold text-red-400">{stats?.sell_trades || 0}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-gray-400 text-sm mb-2">Avg Amount</div>
            <div className="text-3xl font-bold text-purple-400">{stats?.avg_amount || '0.00'}</div>
          </div>
        </div>

        {/* Recent Trades */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4">Recent Trades</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Symbol</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Price</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white font-medium">{trade.symbol}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        trade.type === 'BUY' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{parseFloat(trade.amount).toFixed(2)}</td>
                    <td className="py-3 px-4 text-gray-300">${parseFloat(trade.price).toFixed(4)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        trade.status === 'COMPLETED' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {trade.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <a href="/trades" className="text-purple-400 hover:text-purple-300">
              View All Trades →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
