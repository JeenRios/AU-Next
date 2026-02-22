'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { SectionHeader } from '@/components/shared';
import UnifiedPageLayout from '@/components/shared/layout/UnifiedPageLayout';
import { ContentTabIcons } from '@/components/shared/ui/ContentTabs';
import UserDetailDrawer from '@/components/admin/users/UserDetailDrawer';
import TicketDetailDrawer from '@/components/admin/support/TicketDetailDrawer';
import NotificationDetailDrawer from '@/components/admin/support/NotificationDetailDrawer';

export default function AdminOverviewPage() {
  const router = useRouter();
  const { 
    user, stats, users, mt5Accounts, notifications, tickets, 
    loading, refreshing, fetchData 
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [showNotificationDetails, setShowNotificationDetails] = useState(false);

  // Search results computed from query
  const searchResults = searchQuery.length >= 2 ? {
    users: users.filter(u =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3),
    accounts: mt5Accounts.filter((a: any) =>
      a.account_number?.toString().includes(searchQuery) ||
      a.broker?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3),
    tickets: tickets.filter((t: any) =>
      t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticket_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3)
  } : { users: [], accounts: [], tickets: [] };

  const hasSearchResults = searchResults.users.length > 0 || searchResults.accounts.length > 0 || searchResults.tickets.length > 0;

  const adminTabs = [
    { id: 'overview', label: 'Overview', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ContentTabIcons.overview} /></svg> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <UnifiedPageLayout
      tabs={adminTabs}
      defaultTab="overview"
      title="Admin Overview"
      subtitle="System administration and monitoring"
      actions={
        <button
          onClick={fetchData}
          disabled={refreshing}
          className="px-4 py-2.5 bg-gradient-to-r from-primary-gold to-secondary-gold hover:shadow-lg text-surface-dark font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-gold focus-visible:ring-offset-2 flex items-center gap-2"
        >
          <svg
            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
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
          <span className="hidden sm:inline">Refresh</span>
        </button>
      }
      className="h-full"
    >
      {() => (
        <div className="space-y-5">
      {/* Welcome Header with System Status Bar */}
      <div className="bg-gradient-to-r from-surface-dark to-surface-dark/90 rounded-2xl p-5 text-white relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-gold/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-secondary-gold text-xs font-medium mb-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-xl font-bold">Welcome back, {user?.name || user?.email?.split('@')[0] || 'Admin'}</h1>
            </div>
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3 pt-3 border-t border-white/10">
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
                  <button onClick={() => setSearchQuery('')} className="p-0.5 hover:bg-white/10 rounded transition-colors">
                    <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {searchFocused && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                  {!hasSearchResults ? (
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm text-gray-500">No results found for &quot;{searchQuery}&quot;</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {searchResults.users.length > 0 && (
                        <div className="p-2">
                          <p className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Users</p>
                          {searchResults.users.map((u) => (
                            <div
                              key={u.id}
                              onClick={() => { setSelectedUser(u); setShowUserDetails(true); setSearchQuery(''); }}
                              className="flex items-center gap-3 px-2 py-2 hover:bg-primary-gold/10 rounded-lg cursor-pointer"
                            >
                              <div className="w-8 h-8 bg-gradient-to-br from-primary-gold to-secondary-gold rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {u.first_name?.[0] || u.email[0].toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-surface-dark truncate">
                                  {u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.email}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{u.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-gold to-secondary-gold rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-surface-dark">{stats?.totalUsers || 0}</p>
          <p className="text-xs text-gray-500 font-medium">Total Users</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-surface-dark">{stats?.totalTrades || 0}</p>
          <p className="text-xs text-gray-500 font-medium">Total Trades</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-surface-dark">{mt5Accounts.length}</p>
          <p className="text-xs text-gray-500 font-medium">MT5 Accounts</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-surface-dark">{tickets.length}</p>
          <p className="text-xs text-gray-500 font-medium">Open Tickets</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => router.push('/admin/users')} className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-primary-gold transition-all text-left">
          <h3 className="font-semibold text-surface-dark mb-1">Manage Users</h3>
          <p className="text-xs text-gray-500">View and edit user accounts</p>
        </button>
        <button onClick={() => router.push('/admin/trading')} className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-primary-gold transition-all text-left">
          <h3 className="font-semibold text-surface-dark mb-1">Trading</h3>
          <p className="text-xs text-gray-500">MT5 accounts and VPS</p>
        </button>
        <button onClick={() => router.push('/admin/support')} className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-primary-gold transition-all text-left">
          <h3 className="font-semibold text-surface-dark mb-1">Support</h3>
          <p className="text-xs text-gray-500">Tickets and notifications</p>
        </button>
        <button onClick={() => router.push('/admin/system')} className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-primary-gold transition-all text-left">
          <h3 className="font-semibold text-surface-dark mb-1">System</h3>
          <p className="text-xs text-gray-500">Settings and audit logs</p>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-surface-dark">Recent Users</h3>
            <button onClick={() => router.push('/admin/users')} className="text-xs text-primary-gold hover:text-surface-dark font-medium">
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {users.slice(0, 5).map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-2 hover:bg-primary-gold/10 rounded-lg cursor-pointer" onClick={() => { setSelectedUser(u); setShowUserDetails(true); }}>
                <div className="w-9 h-9 bg-gradient-to-br from-primary-gold to-secondary-gold rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {u.first_name?.[0] || u.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-dark truncate">{u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.email}</p>
                  <p className="text-xs text-gray-500">{u.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-surface-dark">Notifications</h3>
            <button onClick={() => router.push('/admin/support')} className="text-xs text-primary-gold hover:text-surface-dark font-medium">
              View All →
            </button>
          </div>
          <div className="space-y-2">
            {notifications.slice(0, 5).map((n) => (
              <div key={n.id} className="flex items-start gap-3 p-2 hover:bg-primary-gold/10 rounded-lg cursor-pointer" onClick={() => { setSelectedNotification(n); setShowNotificationDetails(true); }}>
                <div className={`w-2 h-2 rounded-full mt-1.5 ${n.is_read ? 'bg-gray-300' : 'bg-primary-gold'}`}></div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${n.is_read ? 'text-gray-600' : 'text-surface-dark font-medium'}`}>{n.title}</p>
                  <p className="text-xs text-gray-400">{new Date(n.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Detail Drawer */}
      <UserDetailDrawer 
        isOpen={showUserDetails} 
        onClose={() => setShowUserDetails(false)}
        user={selectedUser}
        onDelete={async (userId) => {
          await fetchData();
        }}
      />

      {/* Ticket Detail Drawer */}
      <TicketDetailDrawer
        isOpen={showTicketDetails}
        onClose={() => setShowTicketDetails(false)}
        ticket={selectedTicket}
        onMarkResolved={async (ticketId) => {
          await fetchData();
        }}
      />

      {/* Notification Detail Drawer */}
      <NotificationDetailDrawer
        isOpen={showNotificationDetails}
        onClose={() => setShowNotificationDetails(false)}
        notification={selectedNotification}
        onMarkAsRead={async (notificationId) => {
          await fetchData();
        }}
      />
        </div>
      )}
    </UnifiedPageLayout>
  );
}
