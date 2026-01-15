'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [newTrade, setNewTrade] = useState({
    symbol: 'AUDUSD',
    type: 'BUY',
    amount: '',
    price: '',
    status: 'PENDING'
  });

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
    setUser(parsedUser);
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

  const handleAddTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrade),
      });
      
      if (res.ok) {
        setShowAddTrade(false);
        setNewTrade({ symbol: 'AUDUSD', type: 'BUY', amount: '', price: '', status: 'PENDING' });
        fetchData();
      }
    } catch (error) {
      console.error('Error adding trade:', error);
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
            AU<span className="text-purple-400">Next</span> <span className="text-sm text-purple-400">Admin</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/admin" className="text-purple-400 font-medium">Dashboard</a>
            <a href="/admin/analytics" className="text-gray-300 hover:text-white transition">Analytics</a>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-300">Manage all trading activities</p>
          </div>
          <button
            onClick={() => setShowAddTrade(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition"
          >
            + Add New Trade
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-gray-400 text-sm mb-2">Total Trades</div>
            <div className="text-3xl font-bold text-white">{stats?.total_trades || 0}</div>
            <div className="text-green-400 text-sm mt-2">↑ Active</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-gray-400 text-sm mb-2">Buy Orders</div>
            <div className="text-3xl font-bold text-green-400">{stats?.buy_trades || 0}</div>
            <div className="text-gray-400 text-sm mt-2">{((Number(stats?.buy_trades) / Number(stats?.total_trades)) * 100 || 0).toFixed(1)}% of total</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-gray-400 text-sm mb-2">Sell Orders</div>
            <div className="text-3xl font-bold text-red-400">{stats?.sell_trades || 0}</div>
            <div className="text-gray-400 text-sm mt-2">{((Number(stats?.sell_trades) / Number(stats?.total_trades)) * 100 || 0).toFixed(1)}% of total</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-gray-400 text-sm mb-2">Unique Symbols</div>
            <div className="text-3xl font-bold text-purple-400">{stats?.unique_symbols || 0}</div>
            <div className="text-gray-400 text-sm mt-2">Active pairs</div>
          </div>
        </div>

        {/* All Trades Table */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4">All Trades</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">ID</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Symbol</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Price</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-gray-400">#{trade.id}</td>
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
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {new Date(trade.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Trade Modal */}
      {showAddTrade && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Add New Trade</h2>
            <form onSubmit={handleAddTrade} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Symbol</label>
                <input
                  type="text"
                  value={newTrade.symbol}
                  onChange={(e) => setNewTrade({...newTrade, symbol: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <select
                  value={newTrade.type}
                  onChange={(e) => setNewTrade({...newTrade, type: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={newTrade.amount}
                  onChange={(e) => setNewTrade({...newTrade, amount: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Price</label>
                <input
                  type="number"
                  step="0.0001"
                  value={newTrade.price}
                  onChange={(e) => setNewTrade({...newTrade, price: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  required
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddTrade(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition"
                >
                  Add Trade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
