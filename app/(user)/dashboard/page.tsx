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
            AU<span className="text-[#c9a227]">Next</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="text-[#c9a227] font-semibold">Dashboard</a>
            <a href="/trades" className="text-gray-600 hover:text-[#1a1a1d] transition-colors">My Trades</a>
            <a href="/profile" className="text-gray-600 hover:text-[#1a1a1d] transition-colors">Profile</a>
            <button
              onClick={handleLogout}
              className="px-5 py-2 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all"
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
          <h1 className="text-4xl font-bold text-[#1a1a1d] mb-2">
            Welcome back, {user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600">Here&apos;s your trading overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-gray-600 text-sm mb-2">Total Trades</div>
            <div className="text-3xl font-bold text-[#1a1a1d]">{stats?.total_trades || 0}</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-gray-600 text-sm mb-2">Buy Orders</div>
            <div className="text-3xl font-bold text-green-600">{stats?.buy_trades || 0}</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-gray-600 text-sm mb-2">Sell Orders</div>
            <div className="text-3xl font-bold text-red-600">{stats?.sell_trades || 0}</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-gray-600 text-sm mb-2">Avg Amount</div>
            <div className="text-3xl font-bold text-[#c9a227]">{stats?.avg_amount || '0.00'}</div>
          </div>
        </div>

        {/* Recent Trades */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-bold text-[#1a1a1d] mb-4">Recent Trades</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Symbol</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Type</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Price</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-[#1a1a1d] font-medium">{trade.symbol}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        trade.type === 'BUY' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{parseFloat(trade.amount).toFixed(2)}</td>
                    <td className="py-3 px-4 text-gray-700">${parseFloat(trade.price).toFixed(4)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        trade.status === 'COMPLETED' 
                          ? 'bg-[#c9a227]/20 text-[#f0d78c]' 
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
            <a href="/trades" className="text-[#c9a227] hover:text-[#f0d78c]">
              View All Trades →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
