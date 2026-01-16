'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'trades' | 'profile' | 'transactions'>('overview');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(userData));
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [statsRes, tradesRes, transactionsRes, notificationsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/trades'),
        fetch('/api/transactions'),
        fetch('/api/notifications')
      ]);
      
      const statsData = await statsRes.json();
      const tradesData = await tradesRes.json();
      const transactionsData = await transactionsRes.json();
      const notificationsData = await notificationsRes.json();
      
      if (statsData.success) setStats(statsData.data);
      if (tradesData.success) setTrades(tradesData.data || []);
      if (transactionsData.success) setTransactions(transactionsData.data?.slice(0, 10) || []);
      if (notificationsData.success) setNotifications(notificationsData.data?.slice(0, 10) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#c9a227] rounded-full animate-spin"></div>
          <div className="text-[#1a1a1d] text-lg font-medium">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50 to-gray-50 flex">
      {/* Modern Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 fixed h-full flex flex-col shadow-lg">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a227] to-[#f0d78c] flex items-center justify-center shadow-lg">
              <span className="text-[#1a1a1d] font-bold text-xl">A</span>
            </div>
            <h1 className="text-2xl font-bold text-[#1a1a1d]">AU<span className="text-[#c9a227]">Next</span></h1>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-3 border border-[#f0d78c]/30">
            <p className="text-xs text-gray-600 mb-1">Welcome back</p>
            <p className="text-sm text-[#1a1a1d] font-semibold truncate">{user?.name || user?.email}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-3 group ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] font-semibold shadow-lg shadow-[#c9a227]/30'
                : 'text-gray-600 hover:bg-amber-50 hover:text-[#1a1a1d]'
            }`}
          >
            <div className={`p-2 rounded-lg ${activeTab === 'overview' ? 'bg-white/20' : 'bg-white group-hover:bg-amber-100/50'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <span>Overview</span>
          </button>
          
          <button
            onClick={() => setActiveTab('trades')}
            className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-3 group ${
              activeTab === 'trades'
                ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] font-semibold shadow-lg shadow-[#c9a227]/30'
                : 'text-gray-600 hover:bg-amber-50 hover:text-[#1a1a1d]'
            }`}
          >
            <div className={`p-2 rounded-lg ${activeTab === 'trades' ? 'bg-white/20' : 'bg-white group-hover:bg-amber-100/50'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span>My Trades</span>
          </button>
          
          <button
            onClick={() => setActiveTab('transactions')}
            className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-3 group ${
              activeTab === 'transactions'
                ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] font-semibold shadow-lg shadow-[#c9a227]/30'
                : 'text-gray-600 hover:bg-amber-50 hover:text-[#1a1a1d]'
            }`}
          >
            <div className={`p-2 rounded-lg ${activeTab === 'transactions' ? 'bg-white/20' : 'bg-white group-hover:bg-amber-100/50'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span>Transactions</span>
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-3 group ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] font-semibold shadow-lg shadow-[#c9a227]/30'
                : 'text-gray-600 hover:bg-amber-50 hover:text-[#1a1a1d]'
            }`}
          >
            <div className={`p-2 rounded-lg ${activeTab === 'profile' ? 'bg-white/20' : 'bg-white group-hover:bg-amber-100/50'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span>Profile</span>
          </button>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-[#1a1a1d] rounded-xl transition-all duration-300 flex items-center justify-center gap-3 border border-gray-200 hover:border-[#c9a227]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#1a1a1d] mb-2">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'trades' && 'My Trades'}
              {activeTab === 'transactions' && 'Transactions'}
              {activeTab === 'profile' && 'My Profile'}
            </h1>
            <p className="text-gray-600">
              {activeTab === 'overview' && 'Monitor your trading activity'}
              {activeTab === 'trades' && 'View and manage your trades'}
              {activeTab === 'transactions' && 'View your deposits and withdrawals'}
              {activeTab === 'profile' && 'Manage your account settings'}
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="px-5 py-2.5 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <svg
              className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-[#c9a227]/20 to-[#f0d78c]/20 rounded-lg">
                    <svg className="w-6 h-6 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Total Trades</p>
                <p className="text-3xl font-bold text-[#1a1a1d]">{stats?.total_trades || 0}</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-400/20 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Buy Orders</p>
                <p className="text-3xl font-bold text-green-600">{stats?.buy_trades || 0}</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-400/20 rounded-lg">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Sell Orders</p>
                <p className="text-3xl font-bold text-red-600">{stats?.sell_trades || 0}</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-[#c9a227]/20 to-[#f0d78c]/20 rounded-lg">
                    <svg className="w-6 h-6 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Average Amount</p>
                <p className="text-3xl font-bold text-[#c9a227]">${stats?.avg_amount || '0.00'}</p>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Trades Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-[#1a1a1d]">Recent Trades</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {trades.slice(0, 5).map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-amber-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            trade.type === 'BUY' ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}>
                            <svg className={`w-5 h-5 ${trade.type === 'BUY' ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={trade.type === 'BUY' ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-[#1a1a1d]">{trade.symbol}</p>
                            <p className="text-sm text-gray-600">{trade.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#1a1a1d]">${parseFloat(trade.amount).toFixed(2)}</p>
                          <p className="text-sm text-gray-600">${parseFloat(trade.price).toFixed(4)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveTab('trades')}
                    className="mt-4 w-full py-2 text-[#c9a227] hover:text-[#f0d78c] font-semibold transition-colors"
                  >
                    View All Trades →
                  </button>
                </div>
              </div>

              {/* Notifications Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-[#1a1a1d]">Notifications</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map((notif) => (
                      <div key={notif.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-amber-50 transition-colors">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          notif.type === 'success' ? 'bg-green-500/20' : 
                          notif.type === 'warning' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                        }`}>
                          <svg className={`w-5 h-5 ${
                            notif.type === 'success' ? 'text-green-600' : 
                            notif.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[#1a1a1d] text-sm">{notif.title}</p>
                          <p className="text-xs text-gray-600">{notif.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trades Tab */}
        {activeTab === 'trades' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 text-gray-600 font-semibold">Trade ID</th>
                    <th className="text-left py-4 px-6 text-gray-600 font-semibold">Symbol</th>
                    <th className="text-left py-4 px-6 text-gray-600 font-semibold">Type</th>
                    <th className="text-left py-4 px-6 text-gray-600 font-semibold">Amount</th>
                    <th className="text-left py-4 px-6 text-gray-600 font-semibold">Price</th>
                    <th className="text-left py-4 px-6 text-gray-600 font-semibold">Status</th>
                    <th className="text-left py-4 px-6 text-gray-600 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => (
                    <tr key={trade.id} className="border-b border-gray-100 hover:bg-amber-50/50 transition-colors">
                      <td className="py-4 px-6 text-gray-700 font-mono text-sm">#{trade.id}</td>
                      <td className="py-4 px-6 text-[#1a1a1d] font-semibold">{trade.symbol}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          trade.type === 'BUY' 
                            ? 'bg-green-500/20 text-green-600' 
                            : 'bg-red-500/20 text-red-600'
                        }`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700 font-medium">{parseFloat(trade.amount).toFixed(2)}</td>
                      <td className="py-4 px-6 text-gray-700 font-medium">${parseFloat(trade.price).toFixed(4)}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          trade.status === 'COMPLETED' 
                            ? 'bg-[#c9a227]/20 text-[#c9a227]' 
                            : trade.status === 'PENDING'
                            ? 'bg-yellow-500/20 text-yellow-600'
                            : 'bg-gray-500/20 text-gray-600'
                        }`}>
                          {trade.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600 text-sm">
                        {new Date(trade.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 text-gray-600 font-semibold">Transaction ID</th>
                    <th className="text-left py-4 px-6 text-gray-600 font-semibold">Type</th>
                    <th className="text-left py-4 px-6 text-gray-600 font-semibold">Amount</th>
                    <th className="text-left py-4 px-6 text-gray-600 font-semibold">Status</th>
                    <th className="text-left py-4 px-6 text-gray-600 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="border-b border-gray-100 hover:bg-amber-50/50 transition-colors">
                      <td className="py-4 px-6 text-gray-700 font-mono text-sm">#{txn.id}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          txn.type === 'DEPOSIT' 
                            ? 'bg-green-500/20 text-green-600' 
                            : 'bg-blue-500/20 text-blue-600'
                        }`}>
                          {txn.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[#1a1a1d] font-semibold">${parseFloat(txn.amount).toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          txn.status === 'COMPLETED' 
                            ? 'bg-[#c9a227]/20 text-[#c9a227]' 
                            : txn.status === 'PENDING'
                            ? 'bg-yellow-500/20 text-yellow-600'
                            : 'bg-red-500/20 text-red-600'
                        }`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600 text-sm">
                        {new Date(txn.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <h2 className="text-2xl font-bold text-[#1a1a1d] mb-6">Account Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-[#1a1a1d] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-[#1a1a1d] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Account Role</label>
                  <input
                    type="text"
                    value={user?.role || 'User'}
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-[#1a1a1d] disabled:opacity-50 capitalize"
                  />
                </div>

                <div className="pt-4">
                  <button
                    className="px-6 py-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
