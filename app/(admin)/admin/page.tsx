'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  role: string;
  name?: string;
  created_at: string;
}

interface Trade {
  id: number;
  symbol: string;
  type: string;
  amount: string;
  price: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'trades' | 'users' | 'settings' | 'support' | 'audit' | 'notifications'>('overview');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'user',
    name: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
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
      const [statsRes, tradesRes, usersRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/trades'),
        fetch('/api/users')
      ]);

      const statsData = await statsRes.json();
      const tradesData = await tradesRes.json();
      const usersData = await usersRes.json();

      if (statsData.success) setStats(statsData.data);
      if (tradesData.success) setTrades(tradesData.data);
      if (usersData.success) setUsers(usersData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      const data = await response.json();

      if (response.ok) {
        setShowAddUser(false);
        setNewUser({ email: '', password: '', role: 'user', name: '' });
        fetchData();
        alert('User created successfully!');
      } else {
        alert(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Error creating user');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchData();
        alert('User deleted successfully!');
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#c9a227] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50 to-gray-50 flex">
      {/* Modern Light Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 fixed h-full flex flex-col shadow-lg">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a227] to-[#f0d78c] flex items-center justify-center shadow-lg">
              <span className="text-[#1a1a1d] font-bold text-xl">A</span>
            </div>
            <h1 className="text-2xl font-bold text-[#1a1a1d]">AU<span className="text-[#c9a227]">Admin</span></h1>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-3 border border-[#f0d78c]/30">
            <p className="text-xs text-gray-600 mb-1">Logged in as</p>
            <p className="text-sm text-[#1a1a1d] font-semibold truncate">{user?.email}</p>
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
            <span>Trades</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-3 group ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] font-semibold shadow-lg shadow-[#c9a227]/30'
                : 'text-gray-600 hover:bg-amber-50 hover:text-[#1a1a1d]'
            }`}
          >
            <div className={`p-2 rounded-lg ${activeTab === 'users' ? 'bg-white/20' : 'bg-white group-hover:bg-amber-100/50'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span>Users</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-3 group ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] font-semibold shadow-lg shadow-[#c9a227]/30'
                : 'text-gray-600 hover:bg-amber-50 hover:text-[#1a1a1d]'
            }`}
          >
            <div className={`p-2 rounded-lg ${activeTab === 'settings' ? 'bg-white/20' : 'bg-white group-hover:bg-amber-100/50'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span>Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-3 group ${
              activeTab === 'support'
                ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] font-semibold shadow-lg shadow-[#c9a227]/30'
                : 'text-gray-600 hover:bg-amber-50 hover:text-[#1a1a1d]'
            }`}
          >
            <div className={`p-2 rounded-lg ${activeTab === 'support' ? 'bg-white/20' : 'bg-white group-hover:bg-amber-100/50'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span>Support</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-3 group ${
              activeTab === 'audit'
                ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] font-semibold shadow-lg shadow-[#c9a227]/30'
                : 'text-gray-600 hover:bg-amber-50 hover:text-[#1a1a1d]'
            }`}
          >
            <div className={`p-2 rounded-lg ${activeTab === 'audit' ? 'bg-white/20' : 'bg-white group-hover:bg-amber-100/50'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span>Audit Log</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-3 group ${
              activeTab === 'notifications'
                ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] font-semibold shadow-lg shadow-[#c9a227]/30'
                : 'text-gray-600 hover:bg-amber-50 hover:text-[#1a1a1d]'
            }`}
          >
            <div className={`p-2 rounded-lg relative ${activeTab === 'notifications' ? 'bg-white/20' : 'bg-white group-hover:bg-amber-100/50'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">3</span>
            </div>
            <span>Notifications</span>
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

      {/* Main Content Area */}
      <div className="flex-1 ml-72">
        <div className="max-w-7xl mx-auto px-8 py-8">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4 h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
              {/* Compact Header with Stats */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-lg">
                      <svg className="w-4 h-4 text-[#1a1a1d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Total Users</div>
                      <div className="text-2xl font-bold text-[#1a1a1d]">{users.length}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                      {users.filter(u => u.role === 'admin').length} admins
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                      {users.filter(u => u.role === 'user').length} users
                    </span>
                  </div>
                </div>
                <button
                  onClick={fetchData}
                  className="px-3 py-2 bg-white hover:bg-gray-50 text-[#1a1a1d] rounded-lg transition-all flex items-center gap-2 border border-gray-200 text-xs"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>

              {/* Top Row: System Health, Recent Alerts, Support Tickets */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-shrink-0">
                {/* System Health */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-bold text-[#1a1a1d] mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                    System Health
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-green-900">All Systems Operational</p>
                          <p className="text-xs text-green-700">Uptime: 99.8%</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-green-200 text-green-800 rounded text-xs font-bold">LIVE</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-1 mb-0.5">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">Database</span>
                        </div>
                        <p className="text-xs font-semibold text-[#1a1a1d]">Connected</p>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-1 mb-0.5">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">Maintenance</span>
                        </div>
                        <p className="text-xs font-semibold text-[#1a1a1d]">Off</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="w-full px-3 py-2 mt-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:from-[#f0d78c] hover:to-[#c9a227] text-[#1a1a1d] font-semibold rounded-lg transition-all text-xs"
                  >
                    View Settings
                  </button>
                </div>

                {/* Recent Alerts */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[#1a1a1d] flex items-center gap-2">
                      <div className="w-1 h-4 bg-[#c9a227] rounded-full"></div>
                      Recent Alerts
                    </h3>
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">3</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 bg-amber-50 rounded border-l-2 border-[#c9a227]">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-[#1a1a1d]">New User Registration</p>
                        <span className="text-xs text-gray-500">5m</span>
                      </div>
                      <p className="text-xs text-gray-700">newuser@example.com</p>
                    </div>
                    <div className="p-2 bg-red-50 rounded border-l-2 border-red-500">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-[#1a1a1d]">Large Trade Alert</p>
                        <span className="text-xs text-gray-500">12m</span>
                      </div>
                      <p className="text-xs text-gray-700">5.00 lots XAUUSD</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('notifications')}
                    className="w-full px-3 py-2 mt-3 bg-white hover:bg-gray-50 text-[#1a1a1d] font-semibold rounded-lg transition-all border border-gray-200 hover:border-[#c9a227] text-xs"
                  >
                    View All (3 more)
                  </button>
                </div>

                {/* Support Tickets */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[#1a1a1d] flex items-center gap-2">
                      <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                      Support Tickets
                    </h3>
                    <div className="flex items-center gap-1">
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-bold">2</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">JD</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#1a1a1d] truncate">John Doe</p>
                          <p className="text-xs text-gray-700 truncate">Cannot complete trade</p>
                        </div>
                        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-semibold">Open</span>
                      </div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">SA</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#1a1a1d] truncate">Sarah Anderson</p>
                          <p className="text-xs text-gray-700 truncate">Account verification</p>
                        </div>
                        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-semibold">Open</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('support')}
                    className="w-full px-3 py-2 mt-3 bg-white hover:bg-gray-50 text-[#1a1a1d] font-semibold rounded-lg transition-all border border-gray-200 hover:border-[#c9a227] text-xs"
                  >
                    View All Tickets
                  </button>
                </div>
              </div>

              {/* Bottom Row: Recent Activity, Recent Trades */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
                {/* Recent Activity */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm flex flex-col min-h-0">
                  <h3 className="text-sm font-bold text-[#1a1a1d] mb-3 flex items-center gap-2 flex-shrink-0">
                    <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                    Recent Activity
                  </h3>
                  <div className="space-y-2 flex-1 overflow-auto">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1a1a1d]">User Created</p>
                        <p className="text-xs text-gray-600 truncate">newuser@example.com</p>
                        <span className="text-xs text-gray-500">2 minutes ago</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1a1a1d]">Large Trade Executed</p>
                        <p className="text-xs text-gray-600 truncate">XAUUSD · 5.00 lots · $11,701</p>
                        <span className="text-xs text-gray-500">15 minutes ago</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1a1a1d]">Admin Login</p>
                        <p className="text-xs text-gray-600 truncate">admin@au.com · 192.168.1.104</p>
                        <span className="text-xs text-gray-500">1 hour ago</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('audit')}
                    className="w-full px-3 py-2 mt-3 bg-white hover:bg-gray-50 text-[#1a1a1d] font-semibold rounded-lg transition-all border border-gray-200 hover:border-[#c9a227] text-xs flex-shrink-0"
                  >
                    View Full Audit Log
                  </button>
                </div>

                {/* Recent Trades */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm flex flex-col min-h-0">
                  <h3 className="text-sm font-bold text-[#1a1a1d] mb-3 flex items-center gap-2 flex-shrink-0">
                    <div className="w-1 h-4 bg-[#c9a227] rounded-full"></div>
                    Recent Trades
                  </h3>
                  <div className="space-y-2 flex-1 overflow-auto">
                    {trades.slice(0, 3).map((trade) => (
                      <div 
                        key={trade.id} 
                        className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className={`p-1.5 rounded ${
                            trade.type === 'BUY' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            <svg className={`w-3 h-3 ${trade.type === 'BUY' ? 'text-green-700' : 'text-red-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={trade.type === 'BUY' ? "M7 11l5-5m0 0l5 5m-5-5v12" : "M17 13l-5 5m0 0l-5-5m5 5V6"} />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-[#1a1a1d] text-xs">{trade.symbol}</div>
                            <div className="text-xs text-gray-600 truncate">${parseFloat(trade.price).toFixed(4)} · {parseFloat(trade.amount).toFixed(2)} lots</div>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ml-2 ${
                          trade.type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {trade.type}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setActiveTab('trades')}
                    className="w-full px-3 py-2 mt-3 bg-white hover:bg-gray-50 text-[#1a1a1d] font-semibold rounded-lg transition-all border border-gray-200 hover:border-[#c9a227] text-xs flex-shrink-0"
                  >
                    View All Trades
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Trades Tab */}
          {activeTab === 'trades' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-[#1a1a1d] mb-2">All Trades</h2>
                  <p className="text-gray-600 text-sm">Manage all trading activities</p>
                </div>
                <button
                  onClick={fetchData}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-[#1a1a1d] rounded-lg transition-all duration-300 flex items-center gap-2 border border-gray-200 shadow-sm hover:shadow-md text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold text-xs">ID</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold text-xs">Symbol</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold text-xs">Type</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold text-xs">Amount</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold text-xs">Price</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold text-xs">Status</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold text-xs">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {trades.map((trade) => (
                        <tr key={trade.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-gray-600 font-medium text-sm">#{trade.id}</td>
                          <td className="py-3 px-4 text-[#1a1a1d] font-semibold text-sm">{trade.symbol}</td>
                          <td className="py-3 px-4">
                            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                              trade.type === 'BUY' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {trade.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-700 font-medium text-sm">{parseFloat(trade.amount).toFixed(2)}</td>
                          <td className="py-3 px-4 text-gray-700 font-medium text-sm">${parseFloat(trade.price).toFixed(4)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                              trade.status === 'COMPLETED' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {trade.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-xs">
                            {new Date(trade.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-[#1a1a1d] mb-2">User Management</h2>
                  <p className="text-gray-600 text-sm">Manage system users and permissions</p>
                </div>
                <button
                  onClick={() => setShowAddUser(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:from-[#f0d78c] hover:to-[#c9a227] text-[#1a1a1d] font-semibold rounded-lg transition-all duration-300 shadow-md shadow-[#c9a227]/30 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 text-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New User
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold text-xs">ID</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold text-xs">Email</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold text-xs">Name</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold text-xs">Role</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold text-xs">Created</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-gray-600 font-medium text-sm">#{u.id}</td>
                          <td className="py-3 px-4 text-[#1a1a1d] font-semibold text-sm">{u.email}</td>
                          <td className="py-3 px-4 text-gray-700 text-sm">{u.name || '-'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                              u.role === 'admin' 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-xs">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-all duration-300"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#1a1a1d] mb-2">System Settings</h2>
                <p className="text-gray-600 text-sm">Configure platform settings and preferences</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Settings */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-[#1a1a1d] mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#c9a227] to-[#f0d78c] rounded-full"></div>
                    Platform Configuration
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-[#1a1a1d]">Maintenance Mode</p>
                        <p className="text-xs text-gray-600">Disable user access temporarily</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c9a227]"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-[#1a1a1d]">New User Registration</p>
                        <p className="text-xs text-gray-600">Allow new account creation</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c9a227]"></div>
                      </label>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-semibold text-[#1a1a1d] mb-2">Session Timeout (minutes)</label>
                      <input type="number" defaultValue="30" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-[#1a1a1d] mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#c9a227] to-[#f0d78c] rounded-full"></div>
                    Security & Access
                  </h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-semibold text-[#1a1a1d] mb-2">Minimum Password Length</label>
                      <input type="number" defaultValue="8" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-[#1a1a1d]">Two-Factor Authentication</p>
                        <p className="text-xs text-gray-600">Require 2FA for admin accounts</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c9a227]"></div>
                      </label>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-semibold text-[#1a1a1d] mb-2">Max Login Attempts</label>
                      <input type="number" defaultValue="5" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                  </div>
                </div>

                {/* Email Settings */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-[#1a1a1d] mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#c9a227] to-[#f0d78c] rounded-full"></div>
                    Email Configuration
                  </h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-semibold text-[#1a1a1d] mb-2">SMTP Server</label>
                      <input type="text" placeholder="smtp.example.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-semibold text-[#1a1a1d] mb-2">From Email</label>
                      <input type="email" placeholder="noreply@au-gold.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <button className="w-full px-4 py-2 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:from-[#f0d78c] hover:to-[#c9a227] text-[#1a1a1d] font-semibold rounded-lg transition-all duration-300 shadow-sm text-sm">
                      Test Email Connection
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-[#f0d78c]/30">
                  <h3 className="text-lg font-bold text-[#1a1a1d] mb-3">Save Changes</h3>
                  <p className="text-sm text-gray-600 mb-4">Review all settings before saving</p>
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:from-[#f0d78c] hover:to-[#c9a227] text-[#1a1a1d] font-semibold rounded-lg transition-all duration-300 shadow-md shadow-[#c9a227]/30 hover:shadow-lg hover:-translate-y-0.5 text-sm">
                    Save All Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Support Tab */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-[#1a1a1d] mb-2">Support Tickets</h2>
                  <p className="text-gray-600 text-sm">Manage user inquiries and support requests</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold">2 Open</span>
                  <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">5 Resolved</span>
                </div>
              </div>

              <div className="space-y-3">
                {/* Sample Support Ticket 1 */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        JD
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#1a1a1d]">John Doe</h4>
                        <p className="text-xs text-gray-600">john.doe@example.com</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">Open</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1a1a1d] mb-2">Cannot complete trade transaction</h3>
                  <p className="text-sm text-gray-600 mb-3">I'm experiencing issues when trying to place a buy order. The system shows an error message...</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">2 hours ago · Ticket #1024</span>
                    <button className="px-4 py-2 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:from-[#f0d78c] hover:to-[#c9a227] text-[#1a1a1d] font-semibold rounded-lg transition-all duration-300 text-xs">
                      Respond
                    </button>
                  </div>
                </div>

                {/* Sample Support Ticket 2 */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        SA
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#1a1a1d]">Sarah Anderson</h4>
                        <p className="text-xs text-gray-600">sarah.a@example.com</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">Open</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1a1a1d] mb-2">Question about account verification</h3>
                  <p className="text-sm text-gray-600 mb-3">How long does the verification process usually take? I submitted my documents yesterday...</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">5 hours ago · Ticket #1023</span>
                    <button className="px-4 py-2 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:from-[#f0d78c] hover:to-[#c9a227] text-[#1a1a1d] font-semibold rounded-lg transition-all duration-300 text-xs">
                      Respond
                    </button>
                  </div>
                </div>

                {/* Sample Resolved Ticket */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm opacity-60">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold text-sm">
                        MJ
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#1a1a1d]">Mike Johnson</h4>
                        <p className="text-xs text-gray-600">mike.j@example.com</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Resolved</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1a1a1d] mb-2">Password reset request</h3>
                  <p className="text-sm text-gray-600 mb-3">I need help resetting my password...</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">1 day ago · Ticket #1022</span>
                    <span className="text-xs text-green-600 font-semibold">✓ Resolved by Admin</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Audit Log Tab */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-[#1a1a1d] mb-2">Audit Log</h2>
                  <p className="text-gray-600 text-sm">Track all system activities and changes</p>
                </div>
                <div className="flex items-center gap-3">
                  <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg text-xs" />
                  <button className="px-4 py-2 bg-white hover:bg-gray-50 text-[#1a1a1d] rounded-lg transition-all duration-300 border border-gray-200 text-sm">
                    Filter
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {/* Audit Entry 1 */}
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-[#1a1a1d]">User Created</h4>
                          <span className="text-xs text-gray-500">2 minutes ago</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Admin created new user account: newuser@example.com</p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">admin@au.com</span>
                          <span className="text-xs text-gray-500">IP: 192.168.1.104</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Audit Entry 2 */}
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-[#1a1a1d]">Trade Executed</h4>
                          <span className="text-xs text-gray-500">15 minutes ago</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">User placed BUY order for XAUUSD · 0.50 lots · $2,340.25</p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">user@au.com</span>
                          <span className="text-xs text-gray-500">Trade #458</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Audit Entry 3 */}
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-[#1a1a1d]">User Login</h4>
                          <span className="text-xs text-gray-500">1 hour ago</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Admin logged into dashboard</p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">admin@au.com</span>
                          <span className="text-xs text-gray-500">IP: 192.168.1.104</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Audit Entry 4 */}
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-[#1a1a1d]">Settings Changed</h4>
                          <span className="text-xs text-gray-500">3 hours ago</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Admin updated session timeout settings: 30 → 60 minutes</p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">admin@au.com</span>
                          <span className="text-xs text-gray-500">Settings Panel</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Audit Entry 5 */}
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-[#1a1a1d]">User Deleted</h4>
                          <span className="text-xs text-gray-500">5 hours ago</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Admin deleted user account: olduser@example.com</p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">admin@au.com</span>
                          <span className="text-xs text-gray-500">User ID: #42</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-[#1a1a1d] mb-2">Notifications</h2>
                  <p className="text-gray-600 text-sm">Real-time alerts and system events</p>
                </div>
                <button className="px-4 py-2 bg-white hover:bg-gray-50 text-[#1a1a1d] rounded-lg transition-all duration-300 border border-gray-200 text-sm">
                  Mark All Read
                </button>
              </div>

              <div className="space-y-3">
                {/* Unread Notification 1 */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border-l-4 border-[#c9a227] shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#c9a227] rounded-full animate-pulse"></div>
                      <h4 className="text-sm font-bold text-[#1a1a1d]">New User Registration</h4>
                    </div>
                    <span className="text-xs text-gray-500">5 minutes ago</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">newuser@example.com has registered a new account</p>
                  <button className="px-3 py-1.5 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:from-[#f0d78c] hover:to-[#c9a227] text-[#1a1a1d] font-semibold rounded-lg transition-all duration-300 text-xs">
                    View Details
                  </button>
                </div>

                {/* Unread Notification 2 */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border-l-4 border-red-500 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <h4 className="text-sm font-bold text-[#1a1a1d]">Large Trade Alert</h4>
                    </div>
                    <span className="text-xs text-gray-500">12 minutes ago</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">User placed large BUY order: XAUUSD · 5.00 lots · $11,701.25</p>
                  <button className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition-all duration-300 text-xs">
                    Review Trade
                  </button>
                </div>

                {/* Unread Notification 3 */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-l-4 border-blue-500 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <h4 className="text-sm font-bold text-[#1a1a1d]">System Update Available</h4>
                    </div>
                    <span className="text-xs text-gray-500">1 hour ago</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">Platform version 2.1.3 is now available with security improvements</p>
                  <button className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition-all duration-300 text-xs">
                    Update Now
                  </button>
                </div>

                {/* Read Notification */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm opacity-60">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <h4 className="text-sm font-semibold text-[#1a1a1d]">Daily Report Generated</h4>
                    </div>
                    <span className="text-xs text-gray-500">3 hours ago</span>
                  </div>
                  <p className="text-sm text-gray-600">Trading summary report for January 15, 2026 has been generated</p>
                </div>

                {/* Read Notification */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm opacity-60">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <h4 className="text-sm font-semibold text-[#1a1a1d]">Backup Completed</h4>
                    </div>
                    <span className="text-xs text-gray-500">6 hours ago</span>
                  </div>
                  <p className="text-sm text-gray-600">Automated database backup completed successfully</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border-2 border-[#c9a227]/20 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c9a227] to-[#f0d78c] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#1a1a1d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#1a1a1d]">Add New User</h2>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-[#1a1a1d] focus:border-[#c9a227] focus:outline-none transition-all shadow-sm focus:shadow-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-[#1a1a1d] focus:border-[#c9a227] focus:outline-none transition-all shadow-sm focus:shadow-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-[#1a1a1d] focus:border-[#c9a227] focus:outline-none transition-all shadow-sm focus:shadow-md"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-[#1a1a1d] focus:border-[#c9a227] focus:outline-none transition-all shadow-sm focus:shadow-md"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-4 mt-6 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-[#1a1a1d] font-semibold rounded-xl transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:from-[#f0d78c] hover:to-[#c9a227] text-[#1a1a1d] font-bold rounded-xl transition-all duration-300 shadow-lg shadow-[#c9a227]/30"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
