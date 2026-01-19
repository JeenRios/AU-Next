'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useModal } from '@/components/ModalProvider';
import MT5Trading from '@/components/admin/MT5Trading';
import VPSManagement from '@/components/admin/VPSManagement';
import AutomationJobs from '@/components/admin/AutomationJobs';
import UserDetailDrawer, { UserDetail } from '@/components/admin/UserDetailDrawer';
import TicketDetailDrawer, { TicketDetail } from '@/components/admin/TicketDetailDrawer';
import NotificationDetailDrawer, { NotificationDetail } from '@/components/admin/NotificationDetailDrawer';
import SlideOutPanel from '@/components/admin/SlideOutPanel';

interface User {
  id: number;
  email: string;
  role: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  last_login?: string;
}

interface Trade {
  id: number;
  symbol: string;
  type: string;
  amount: string;
  price: string;
  status: string;
  created_at: string;
  opened_at?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const modal = useModal();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [vpsInstances, setVpsInstances] = useState<any[]>([]);
  const [mt5Accounts, setMt5Accounts] = useState<any[]>([]);
  const [automationJobs, setAutomationJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'trading' | 'support' | 'system'>('overview');
  const [tradingSubTab, setTradingSubTab] = useState<'history' | 'accounts' | 'vps' | 'jobs'>('accounts');
  const [supportSubTab, setSupportSubTab] = useState<'tickets' | 'notifications'>('tickets');
  const [systemSubTab, setSystemSubTab] = useState<'settings' | 'audit'>('settings');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [editingUser, setEditingUser] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [showNotificationDetails, setShowNotificationDetails] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'user',
    name: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // Search results computed from query
  const searchResults = searchQuery.length >= 2 ? {
    users: users.filter(u =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3),
    accounts: mt5Accounts.filter(a =>
      a.account_number?.toString().includes(searchQuery) ||
      a.broker?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3),
    tickets: tickets.filter(t =>
      t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticket_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3)
  } : { users: [], accounts: [], tickets: [] };

  const hasSearchResults = searchResults.users.length > 0 || searchResults.accounts.length > 0 || searchResults.tickets.length > 0;

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
    setRefreshing(true);
    try {
      const [statsRes, tradesRes, usersRes, notificationsRes, ticketsRes, vpsRes, mt5Res, jobsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/trades'),
        fetch('/api/users'),
        fetch('/api/notifications'),
        fetch('/api/tickets'),
        fetch('/api/vps'),
        fetch('/api/mt5/connect'),
        fetch('/api/automation/jobs')
      ]);

      const statsData = await statsRes.json();
      const tradesData = await tradesRes.json();
      const usersData = await usersRes.json();
      const notificationsData = await notificationsRes.json();
      const ticketsData = await ticketsRes.json();
      const vpsData = await vpsRes.json();
      const mt5Data = await mt5Res.json();
      const jobsData = await jobsRes.json();

      if (statsData.success) setStats(statsData.data);
      if (tradesData.success) setTrades(tradesData.data);
      if (usersData.success) setUsers(usersData.data);
      if (notificationsData.success) setNotifications(notificationsData.data.slice(0, 10));
      if (ticketsData.success) setTickets(ticketsData.data.filter((t: any) => t.status === 'open').slice(0, 10));
      if (vpsData.success) setVpsInstances(vpsData.data || []);
      if (mt5Data.success) setMt5Accounts(mt5Data.data || []);
      if (jobsData.success) setAutomationJobs(jobsData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
        await modal.alert('User created successfully!', 'Success');
      } else {
        await modal.alert(data.error || 'Failed to create user', 'Error');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      await modal.alert('Error creating user', 'Error');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const confirmed = await modal.confirm(
      'This action cannot be undone. The user and all associated data will be permanently deleted.',
      'Delete User?'
    );
    
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchData();
        await modal.alert('User deleted successfully!', 'Success');
      } else {
        await modal.alert('Failed to delete user', 'Error');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      await modal.alert('Error deleting user', 'Error');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('user');
    router.push('/');
  };

  const closeUserDetails = () => {
    setShowUserDetails(false);
  };

  const closeTicketDetails = () => {
    setShowTicketDetails(false);
  };

  const closeNotificationDetails = () => {
    setShowNotificationDetails(false);
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
            onClick={() => setActiveTab('trading')}
            className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-3 group ${
              activeTab === 'trading'
                ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] font-semibold shadow-lg shadow-[#c9a227]/30'
                : 'text-gray-600 hover:bg-amber-50 hover:text-[#1a1a1d]'
            }`}
          >
            <div className={`p-2 rounded-lg ${activeTab === 'trading' ? 'bg-white/20' : 'bg-white group-hover:bg-amber-100/50'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span>Trading</span>
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-3 group ${
              activeTab === 'support'
                ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] font-semibold shadow-lg shadow-[#c9a227]/30'
                : 'text-gray-600 hover:bg-amber-50 hover:text-[#1a1a1d]'
            }`}
          >
            <div className={`p-2 rounded-lg relative ${activeTab === 'support' ? 'bg-white/20' : 'bg-white group-hover:bg-amber-100/50'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
            </div>
            <span>Support</span>
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-3 group ${
              activeTab === 'system'
                ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] font-semibold shadow-lg shadow-[#c9a227]/30'
                : 'text-gray-600 hover:bg-amber-50 hover:text-[#1a1a1d]'
            }`}
          >
            <div className={`p-2 rounded-lg ${activeTab === 'system' ? 'bg-white/20' : 'bg-white group-hover:bg-amber-100/50'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span>System</span>
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
            <div className="space-y-5">
              {/* Welcome Header with System Status Bar */}
              <div className="bg-gradient-to-r from-[#1a1a1d] to-[#2d2d30] rounded-2xl p-5 text-white relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#c9a227]/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[#f0d78c] text-xs font-medium mb-1">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <h1 className="text-xl font-bold">Welcome back, {user?.email?.split('@')[0] || 'Admin'}</h1>
                    </div>
                  </div>
                  {/* Search & Quick Actions Bar */}
                  <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                    {/* Search Bar */}
                    <div className="flex-1 relative">
                      <div className={`flex items-center gap-3 px-3 py-2 bg-white/5 border rounded-lg transition-all ${searchFocused ? 'bg-white/10 border-white/30' : 'border-white/10 hover:border-white/20'}`}>
                        <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => setSearchFocused(true)}
                          onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                          placeholder="Search users, accounts, tickets..."
                          className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="p-0.5 hover:bg-white/10 rounded transition-colors"
                          >
                            <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        {!searchQuery && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-white/30 font-mono">
                            Ctrl+K
                          </div>
                        )}
                      </div>

                      {/* Search Results Dropdown */}
                      {searchFocused && searchQuery.length >= 2 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                          {!hasSearchResults ? (
                            <div className="px-4 py-6 text-center">
                              <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              <p className="text-sm text-gray-500">No results found for &quot;{searchQuery}&quot;</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-100">
                              {/* Users Results */}
                              {searchResults.users.length > 0 && (
                                <div className="p-2">
                                  <p className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Users</p>
                                  {searchResults.users.map((u) => (
                                    <div
                                      key={u.id}
                                      onClick={() => {
                                        setSelectedUser(u);
                                        setShowUserDetails(true);
                                        setSearchQuery('');
                                        setSearchFocused(false);
                                      }}
                                      className="flex items-center gap-3 px-2 py-2 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors"
                                    >
                                      <div className="w-8 h-8 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        {u.first_name?.[0] || u.email[0].toUpperCase()}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#1a1a1d] truncate">
                                          {u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.email}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                      </div>
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {u.role}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* MT5 Accounts Results */}
                              {searchResults.accounts.length > 0 && (
                                <div className="p-2">
                                  <p className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">MT5 Accounts</p>
                                  {searchResults.accounts.map((a) => (
                                    <div
                                      key={a.id}
                                      onClick={() => {
                                        setActiveTab('trading');
                                        setTradingSubTab('accounts');
                                        setSearchQuery('');
                                        setSearchFocused(false);
                                      }}
                                      className="flex items-center gap-3 px-2 py-2 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors"
                                    >
                                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#1a1a1d]">{a.account_number}</p>
                                        <p className="text-xs text-gray-500 truncate">{a.broker} · {a.user_email}</p>
                                      </div>
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                        a.status === 'active' ? 'bg-green-100 text-green-700' :
                                        a.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                        'bg-gray-100 text-gray-600'
                                      }`}>
                                        {a.status}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Tickets Results */}
                              {searchResults.tickets.length > 0 && (
                                <div className="p-2">
                                  <p className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Support Tickets</p>
                                  {searchResults.tickets.map((t) => (
                                    <div
                                      key={t.id}
                                      onClick={() => {
                                        setSelectedTicket(t);
                                        setShowTicketDetails(true);
                                        setSearchQuery('');
                                        setSearchFocused(false);
                                      }}
                                      className="flex items-center gap-3 px-2 py-2 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors"
                                    >
                                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#1a1a1d] truncate">{t.subject}</p>
                                        <p className="text-xs text-gray-500">{t.ticket_number} · {t.user_email}</p>
                                      </div>
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                        t.status === 'open' ? 'bg-orange-100 text-orange-700' :
                                        t.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                        'bg-gray-100 text-gray-600'
                                      }`}>
                                        {t.status}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-1">
                      {/* Add User */}
                      <div
                        onClick={() => setShowAddUser(true)}
                        className="group relative w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-gradient-to-br hover:from-[#c9a227]/30 hover:to-[#f0d78c]/20 border border-white/10 hover:border-[#c9a227]/30 transition-all cursor-pointer"
                      >
                        <svg className="w-4 h-4 text-white/50 group-hover:text-[#f0d78c] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#1a1a1d] text-[10px] text-white/80 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">Add User</span>
                      </div>

                      {/* Refresh */}
                      <div
                        onClick={fetchData}
                        className="group relative w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-gradient-to-br hover:from-[#c9a227]/30 hover:to-[#f0d78c]/20 border border-white/10 hover:border-[#c9a227]/30 transition-all cursor-pointer"
                      >
                        <svg className={`w-4 h-4 text-white/50 group-hover:text-[#f0d78c] transition-colors ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#1a1a1d] text-[10px] text-white/80 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">Refresh</span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-6 bg-white/10"></div>

                    {/* Pending Review Indicator */}
                    {(mt5Accounts.filter(a => a.status === 'pending').length > 0 || tickets.length > 0) ? (
                      <div
                        onClick={() => { setActiveTab('trading'); setTradingSubTab('accounts'); }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#c9a227]/20 to-[#f0d78c]/10 border border-[#c9a227]/30 rounded-lg cursor-pointer hover:from-[#c9a227]/30 hover:to-[#f0d78c]/20 transition-all group"
                      >
                        <div className="flex items-center -space-x-1.5">
                          {mt5Accounts.filter(a => a.status === 'pending').length > 0 && (
                            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#c9a227] to-[#f0d78c] flex items-center justify-center text-[9px] font-bold text-[#1a1a1d] ring-1 ring-[#1a1a1d]/50">
                              {mt5Accounts.filter(a => a.status === 'pending').length}
                            </span>
                          )}
                          {tickets.length > 0 && (
                            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-[9px] font-bold text-[#1a1a1d] ring-1 ring-[#1a1a1d]/50">
                              {tickets.length}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#f0d78c] font-medium">Pending</span>
                        <svg className="w-3 h-3 text-[#c9a227] group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span className="text-[11px] text-white/50">All Clear</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div
                  onClick={() => setActiveTab('users')}
                  className="bg-white border border-gray-100 rounded-xl p-5 hover:border-[#c9a227] hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#c9a227]/10 to-[#f0d78c]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-[#c9a227] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-[#1a1a1d]">{users.length}</p>
                  <p className="text-sm text-gray-500 mt-1">Total Users</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs px-2 py-1 bg-amber-50 text-[#c9a227] rounded-md font-medium">{users.filter(u => u.role === 'admin').length} Admin</span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium">{users.filter(u => u.role === 'user').length} Users</span>
                  </div>
                </div>

                <div
                  onClick={() => { setActiveTab('trading'); setTradingSubTab('accounts'); }}
                  className="bg-white border border-gray-100 rounded-xl p-5 hover:border-[#c9a227] hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#c9a227]/10 to-[#f0d78c]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-[#c9a227] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-[#1a1a1d]">{mt5Accounts.length}</p>
                  <p className="text-sm text-gray-500 mt-1">MT5 Accounts</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs px-2 py-1 bg-amber-50 text-[#c9a227] rounded-md font-medium">{mt5Accounts.filter(a => a.status === 'active').length} Active</span>
                    {mt5Accounts.filter(a => a.status === 'pending').length > 0 && (
                      <span className="text-xs px-2 py-1 bg-[#c9a227] text-white rounded-md font-medium animate-pulse">{mt5Accounts.filter(a => a.status === 'pending').length} Pending</span>
                    )}
                  </div>
                </div>

                <div
                  onClick={() => { setActiveTab('trading'); setTradingSubTab('vps'); }}
                  className="bg-white border border-gray-100 rounded-xl p-5 hover:border-[#c9a227] hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#c9a227]/10 to-[#f0d78c]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-[#c9a227] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-[#1a1a1d]">{vpsInstances.length}</p>
                  <p className="text-sm text-gray-500 mt-1">VPS Servers</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs px-2 py-1 bg-amber-50 text-[#c9a227] rounded-md font-medium">{vpsInstances.filter(v => v.status === 'active').length} Online</span>
                    {vpsInstances.filter(v => v.status === 'error').length > 0 && (
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-md font-medium">{vpsInstances.filter(v => v.status === 'error').length} Error</span>
                    )}
                  </div>
                </div>

                <div
                  onClick={() => { setActiveTab('trading'); setTradingSubTab('jobs'); }}
                  className="bg-white border border-gray-100 rounded-xl p-5 hover:border-[#c9a227] hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#c9a227]/10 to-[#f0d78c]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-[#c9a227] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-[#1a1a1d]">{automationJobs.length}</p>
                  <p className="text-sm text-gray-500 mt-1">Automation Jobs</p>
                  <div className="flex items-center gap-2 mt-3">
                    {automationJobs.filter(j => j.status === 'running').length > 0 && (
                      <span className="text-xs px-2 py-1 bg-amber-50 text-[#c9a227] rounded-md font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#c9a227] rounded-full animate-pulse"></span>
                        {automationJobs.filter(j => j.status === 'running').length} Running
                      </span>
                    )}
                    {automationJobs.filter(j => j.status === 'failed').length > 0 && (
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-md font-medium">{automationJobs.filter(j => j.status === 'failed').length} Failed</span>
                    )}
                    {automationJobs.filter(j => j.status === 'running').length === 0 && automationJobs.filter(j => j.status === 'failed').length === 0 && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium">All Complete</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Content - 2 Column Layout */}
              <div className="grid grid-cols-5 gap-6">
                {/* Left Column - Pending Approvals & Quick Actions */}
                <div className="col-span-3 space-y-6">
                  {/* Pending MT5 Approvals */}
                  <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#1a1a1d]">Pending MT5 Approvals</h3>
                          <p className="text-xs text-gray-500">Review and approve connection requests</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setActiveTab('trading'); setTradingSubTab('accounts'); }}
                        className="text-xs text-[#c9a227] hover:text-[#1a1a1d] font-medium transition-colors"
                      >
                        View All →
                      </button>
                    </div>
                    <div className="p-5">
                      {mt5Accounts.filter(a => a.status === 'pending').length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-500">No pending approvals</p>
                          <p className="text-xs text-gray-400 mt-1">All MT5 requests have been processed</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {mt5Accounts.filter(a => a.status === 'pending').slice(0, 4).map((account) => (
                            <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-amber-50/50 transition-all">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {account.user_email?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-[#1a1a1d]">{account.account_number}</p>
                                  <p className="text-xs text-gray-500">{account.broker || 'Unknown Broker'} · {account.user_email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">
                                  {new Date(account.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                                <button
                                  onClick={() => { setActiveTab('trading'); setTradingSubTab('accounts'); }}
                                  className="px-3 py-1.5 bg-[#c9a227] hover:bg-[#b8922a] text-white text-xs font-medium rounded-lg transition-all"
                                >
                                  Review
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Support Tickets */}
                  <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#1a1a1d]">Open Tickets</h3>
                          <p className="text-xs text-gray-500">{tickets.length} tickets need attention</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('support')}
                        className="text-xs text-[#c9a227] hover:text-[#1a1a1d] font-medium transition-colors"
                      >
                        View All →
                      </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {tickets.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-sm text-gray-500">No open tickets</p>
                        </div>
                      ) : (
                        tickets.slice(0, 3).map((ticket) => (
                          <div
                            key={ticket.id}
                            onClick={() => { setSelectedTicket(ticket); setShowTicketDetails(true); }}
                            className="px-5 py-4 hover:bg-amber-50/50 transition-all cursor-pointer flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {ticket.first_name?.[0] || ticket.user_email?.[0]?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[#1a1a1d]">{ticket.subject}</p>
                                <p className="text-xs text-gray-500">{ticket.ticket_number} · {ticket.user_email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`text-xs px-2 py-1 rounded font-medium ${
                                ticket.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {ticket.priority || 'normal'}
                              </span>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Activity & Notifications */}
                <div className="col-span-2 space-y-6">
                  {/* Recent Activity Timeline */}
                  <div className="bg-white border border-gray-100 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-[#1a1a1d]">Recent Activity</h3>
                      <button
                        onClick={() => { setActiveTab('system'); setSystemSubTab('audit'); }}
                        className="text-xs text-[#c9a227] hover:text-[#1a1a1d] font-medium transition-colors"
                      >
                        View All →
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-[#c9a227] to-transparent"></div>
                      <div className="space-y-4">
                        {users.slice(0, 2).map((u, index) => (
                          <div key={`timeline-user-${u.id}`} className="flex items-start gap-4 relative">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-full flex items-center justify-center z-10 flex-shrink-0">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div className="flex-1 pb-4">
                              <p className="text-sm font-medium text-[#1a1a1d]">{u.last_login ? 'User logged in' : 'New user registered'}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{u.email}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(u.last_login || u.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))}
                        {mt5Accounts.slice(0, 2).map((account) => (
                          <div key={`timeline-mt5-${account.id}`} className="flex items-start gap-4 relative">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-full flex items-center justify-center z-10 flex-shrink-0">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                            </div>
                            <div className="flex-1 pb-4">
                              <p className="text-sm font-medium text-[#1a1a1d]">
                                MT5 {account.status === 'pending' ? 'connection requested' : `account ${account.status}`}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">{account.account_number}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(account.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="bg-white border border-gray-100 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-[#1a1a1d]">Notifications</h3>
                      {notifications.filter(n => !n.is_read).length > 0 && (
                        <span className="text-xs font-medium text-[#c9a227] bg-amber-50 px-2 py-1 rounded">
                          {notifications.filter(n => !n.is_read).length} new
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No notifications</p>
                      ) : (
                        notifications.slice(0, 4).map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => { setSelectedNotification(notif); setShowNotificationDetails(true); }}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-amber-50/50 transition-all cursor-pointer"
                          >
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.is_read ? 'bg-gray-300' : 'bg-[#c9a227]'}`}></div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${notif.is_read ? 'text-gray-600' : 'text-[#1a1a1d] font-medium'} truncate`}>{notif.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(notif.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <button
                      onClick={() => { setActiveTab('support'); setSupportSubTab('notifications'); }}
                      className="mt-3 w-full py-2.5 text-sm font-medium text-[#1a1a1d] bg-gradient-to-r from-[#c9a227] to-[#f0d78c] rounded-lg hover:shadow-md transition-all"
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trading Tab */}
          {activeTab === 'trading' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#1a1a1d] mb-2">Trading & Automation</h2>
                  <p className="text-gray-600 text-sm">Manage trades, MT5 accounts, VPS instances, and automation jobs</p>
                </div>
              </div>

              {/* Trading Sub-tabs */}
              <div className="flex gap-2 border-b border-gray-200 pb-4">
                <button
                  onClick={() => setTradingSubTab('history')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    tradingSubTab === 'history'
                      ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Trade History
                </button>
                <button
                  onClick={() => setTradingSubTab('accounts')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    tradingSubTab === 'accounts'
                      ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  MT5 Accounts
                </button>
                <button
                  onClick={() => setTradingSubTab('vps')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    tradingSubTab === 'vps'
                      ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  VPS Management
                </button>
                <button
                  onClick={() => setTradingSubTab('jobs')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    tradingSubTab === 'jobs'
                      ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Automation Jobs
                </button>
              </div>

              {/* Trading Sub-tab Content */}
              {tradingSubTab === 'history' && (
                <div className="space-y-4">
                  <div className="flex justify-end">
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
              {tradingSubTab === 'accounts' && <MT5Trading />}
              {tradingSubTab === 'vps' && (
                <VPSManagement
                  onError={(msg) => modal.alert(msg, 'Error')}
                  onSuccess={(msg) => modal.alert(msg, 'Success')}
                />
              )}
              {tradingSubTab === 'jobs' && (
                <AutomationJobs
                  onError={(msg) => modal.alert(msg, 'Error')}
                  onSuccess={(msg) => modal.alert(msg, 'Success')}
                />
              )}
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
                <div className="flex items-center gap-3">
                  {/* Filter Buttons */}
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setUserRoleFilter('all')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        userRoleFilter === 'all'
                          ? 'bg-white text-[#1a1a1d] shadow-sm'
                          : 'text-gray-600 hover:text-[#1a1a1d]'
                      }`}
                    >
                      All ({users.length})
                    </button>
                    <button
                      onClick={() => setUserRoleFilter('admin')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        userRoleFilter === 'admin'
                          ? 'bg-white text-[#1a1a1d] shadow-sm'
                          : 'text-gray-600 hover:text-[#1a1a1d]'
                      }`}
                    >
                      Admins ({users.filter(u => u.role === 'admin').length})
                    </button>
                    <button
                      onClick={() => setUserRoleFilter('user')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        userRoleFilter === 'user'
                          ? 'bg-white text-[#1a1a1d] shadow-sm'
                          : 'text-gray-600 hover:text-[#1a1a1d]'
                      }`}
                    >
                      Users ({users.filter(u => u.role === 'user').length})
                    </button>
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
                      {users
                        .filter(u => userRoleFilter === 'all' || u.role === userRoleFilter)
                        .map((u) => (
                        <tr 
                          key={u.id} 
                          onClick={() => {
                            setSelectedUser(u);
                            setShowUserDetails(true);
                          }}
                          className="hover:bg-amber-50 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-4 text-gray-600 font-medium text-sm">#{u.id}</td>
                          <td className="py-3 px-4 text-[#1a1a1d] font-semibold text-sm">{u.email}</td>
                          <td className="py-3 px-4 text-gray-700 text-sm">{u.name || u.first_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : '-'}</td>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUser(u.id);
                              }}
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

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#1a1a1d] mb-2">System Administration</h2>
                  <p className="text-gray-600 text-sm">Configure settings and view system activity logs</p>
                </div>
              </div>

              {/* System Sub-tabs */}
              <div className="flex gap-2 border-b border-gray-200 pb-4">
                <button
                  onClick={() => setSystemSubTab('settings')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    systemSubTab === 'settings'
                      ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Settings
                </button>
                <button
                  onClick={() => setSystemSubTab('audit')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    systemSubTab === 'audit'
                      ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Audit Log
                </button>
              </div>

              {/* Settings Sub-tab */}
              {systemSubTab === 'settings' && (
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
              )}

              {/* Audit Log Sub-tab */}
              {systemSubTab === 'audit' && (
                <div className="space-y-4">
                  <div className="flex justify-end items-center gap-3">
                    <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg text-xs" />
                    <button className="px-4 py-2 bg-white hover:bg-gray-50 text-[#1a1a1d] rounded-lg transition-all duration-300 border border-gray-200 text-sm">
                      Filter
                    </button>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-100">
                      {auditLogs.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p>No audit logs available</p>
                        </div>
                      ) : (
                        auditLogs.map((log, index) => (
                          <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-4">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="text-sm font-semibold text-[#1a1a1d]">{log.operation}</h4>
                                  <span className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{log.details || 'No details available'}</p>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">{log.user_email || 'System'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Support Tab */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#1a1a1d] mb-2">Support & Notifications</h2>
                  <p className="text-gray-600 text-sm">Manage support tickets and system notifications</p>
                </div>
              </div>

              {/* Support Sub-tabs */}
              <div className="flex gap-2 border-b border-gray-200 pb-4">
                <button
                  onClick={() => setSupportSubTab('tickets')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    supportSubTab === 'tickets'
                      ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Tickets
                  {tickets.filter(t => t.status === 'open').length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
                      {tickets.filter(t => t.status === 'open').length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setSupportSubTab('notifications')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    supportSubTab === 'notifications'
                      ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Notifications
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                      {notifications.filter(n => !n.is_read).length}
                    </span>
                  )}
                </button>
              </div>

              {/* Tickets Sub-tab */}
              {supportSubTab === 'tickets' && (
                <div className="space-y-3">
                  {tickets.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p className="text-gray-500">No support tickets</p>
                    </div>
                  ) : (
                    tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowTicketDetails(true);
                        }}
                        className={`bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
                          ticket.status === 'resolved' ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a227] to-[#f0d78c] flex items-center justify-center text-[#1a1a1d] font-semibold text-sm">
                              {ticket.first_name?.[0] || ticket.user_email?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-[#1a1a1d]">
                                {ticket.first_name && ticket.last_name
                                  ? `${ticket.first_name} ${ticket.last_name}`
                                  : ticket.user_email || 'Unknown User'}
                              </h4>
                              <p className="text-xs text-gray-600">{ticket.user_email}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            ticket.status === 'open'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {ticket.status || 'Open'}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-[#1a1a1d] mb-2">{ticket.subject}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.message || 'No message'}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {new Date(ticket.created_at).toLocaleDateString()} · {ticket.ticket_number}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Notifications Sub-tab */}
              {supportSubTab === 'notifications' && (
                <div className="space-y-3">
                  <div className="flex justify-end mb-2">
                    <button className="px-4 py-2 bg-white hover:bg-gray-50 text-[#1a1a1d] rounded-lg transition-all duration-300 border border-gray-200 text-sm">
                      Mark All Read
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <p className="text-gray-500">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          setSelectedNotification(notif);
                          setShowNotificationDetails(true);
                        }}
                        className={`rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                          notif.is_read
                            ? 'bg-white border border-gray-200 opacity-60'
                            : notif.type === 'trade'
                            ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-[#c9a227]'
                            : notif.type === 'system'
                            ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500'
                            : notif.type === 'account'
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500'
                            : 'bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {!notif.is_read && (
                              <div className={`w-2 h-2 rounded-full animate-pulse ${
                                notif.type === 'trade' ? 'bg-[#c9a227]' :
                                notif.type === 'system' ? 'bg-blue-500' :
                                notif.type === 'account' ? 'bg-green-500' : 'bg-purple-500'
                              }`}></div>
                            )}
                            <h4 className="text-sm font-bold text-[#1a1a1d]">{notif.title}</h4>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(notif.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Add User Slide Panel */}
      <SlideOutPanel
        isOpen={showAddUser}
        onClose={() => setShowAddUser(false)}
        title="Add New User"
        subtitle="Create a new user account"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddUser} className="space-y-6">
          {/* User Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#c9a227]/20 to-[#f0d78c]/30 flex items-center justify-center border-2 border-dashed border-[#c9a227]/40">
              <svg className="w-10 h-10 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                placeholder="user@example.com"
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-[#1a1a1d] focus:border-[#c9a227] focus:outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                placeholder="Enter a secure password"
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-[#1a1a1d] focus:border-[#c9a227] focus:outline-none transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters recommended</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={newUser.name.split(' ')[0] || ''}
                  onChange={(e) => {
                    const lastName = newUser.name.split(' ').slice(1).join(' ');
                    setNewUser({...newUser, name: `${e.target.value} ${lastName}`.trim()});
                  }}
                  placeholder="John"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-[#1a1a1d] focus:border-[#c9a227] focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={newUser.name.split(' ').slice(1).join(' ') || ''}
                  onChange={(e) => {
                    const firstName = newUser.name.split(' ')[0] || '';
                    setNewUser({...newUser, name: `${firstName} ${e.target.value}`.trim()});
                  }}
                  placeholder="Doe"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-[#1a1a1d] focus:border-[#c9a227] focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Account Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewUser({...newUser, role: 'user'})}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    newUser.role === 'user'
                      ? 'border-[#c9a227] bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      newUser.role === 'user' ? 'bg-[#c9a227]/20' : 'bg-gray-100'
                    }`}>
                      <svg className={`w-5 h-5 ${newUser.role === 'user' ? 'text-[#c9a227]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className={`text-sm font-medium ${newUser.role === 'user' ? 'text-[#1a1a1d]' : 'text-gray-600'}`}>User</span>
                    <span className="text-xs text-gray-500">Standard access</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setNewUser({...newUser, role: 'admin'})}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    newUser.role === 'admin'
                      ? 'border-[#c9a227] bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      newUser.role === 'admin' ? 'bg-[#c9a227]/20' : 'bg-gray-100'
                    }`}>
                      <svg className={`w-5 h-5 ${newUser.role === 'admin' ? 'text-[#c9a227]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <span className={`text-sm font-medium ${newUser.role === 'admin' ? 'text-[#1a1a1d]' : 'text-gray-600'}`}>Admin</span>
                    <span className="text-xs text-gray-500">Full access</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowAddUser(false)}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:from-[#f0d78c] hover:to-[#c9a227] text-[#1a1a1d] font-semibold rounded-lg transition-all shadow-md"
            >
              Create User
            </button>
          </div>
        </form>
      </SlideOutPanel>

      {/* User Details Drawer */}
      <UserDetailDrawer
        isOpen={showUserDetails}
        onClose={closeUserDetails}
        user={selectedUser as UserDetail}
        onEdit={() => modal.alert('Edit functionality coming soon!', 'Feature')}
        onDelete={async (userId) => {
          const confirmed = await modal.confirm(
            'This will permanently delete the user and all associated data.',
            'Delete User?'
          );
          if (confirmed) {
            closeUserDetails();
            setTimeout(() => handleDeleteUser(userId), 300);
          }
        }}
      />

      {/* Ticket Details Drawer */}
      <TicketDetailDrawer
        isOpen={showTicketDetails}
        onClose={closeTicketDetails}
        ticket={selectedTicket as TicketDetail}
        onReply={() => modal.alert('Reply functionality coming soon!', 'Feature')}
        onMarkResolved={() => modal.alert('Mark as resolved functionality coming soon!', 'Feature')}
      />

      {/* Notification Details Drawer */}
      <NotificationDetailDrawer
        isOpen={showNotificationDetails}
        onClose={closeNotificationDetails}
        notification={selectedNotification as NotificationDetail}
        onMarkAsRead={(notificationId) => {
          // TODO: Implement mark as read API call
          console.log('Mark as read:', notificationId);
        }}
      />
    </div>
  );
}
