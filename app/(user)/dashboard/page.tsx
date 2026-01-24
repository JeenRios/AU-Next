'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { Sidebar, StatsCard, PerformanceChart, RecentActivity, NotificationsPanel, QuickActions, QuickActionIcons, ErrorState, SettingsTab, CommunityTab, JournalTab } from '@/components/dashboard';
import { useDashboardData } from '@/lib/hooks/useFetch';
import MT5AccountStatus from '@/components/dashboard/MT5AccountStatus';
import TradingAnalytics from '@/components/dashboard/TradingAnalytics';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'my-trading' | 'community' | 'journal' | 'settings'>('dashboard');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['dashboard', 'my-trading', 'community', 'journal', 'settings'].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { showToast, ToastContainer } = useToast();
  
  // MT5 and EA Management
  const [showMT5Form, setShowMT5Form] = useState(false);
  const [mt5Accounts, setMt5Accounts] = useState<any[]>([]);
  const [mt5Submitting, setMt5Submitting] = useState(false);
  const [selectedAccountForAnalytics, setSelectedAccountForAnalytics] = useState<any>(null);
  const [mt5Data, setMt5Data] = useState({
    account_number: '',
    server: '',
    platform: 'MT5'
  });
  const passwordRef = useRef<HTMLInputElement | null>(null);
  
  // Performance filters
  const [performanceFilter, setPerformanceFilter] = useState<'all' | 'profit' | 'loss'>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  
  // Profile edit
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: ''
  });


  // Use custom hook for data fetching with error handling
  const { data: dashboardData, loading: dataLoading, error: dataError, refetch } = useDashboardData();

  // Sample chart data (would come from API in production)
  const [chartData] = useState([
    { label: 'Mon', value: 120 },
    { label: 'Tue', value: -45 },
    { label: 'Wed', value: 230 },
    { label: 'Thu', value: 85 },
    { label: 'Fri', value: -30 },
    { label: 'Sat', value: 150 },
    { label: 'Sun', value: 95 },
  ]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(userData));
    fetchMT5Accounts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch MT5 accounts from API
  const fetchMT5Accounts = async () => {
    try {
      const res = await fetch('/api/mt5/connect');
      const data = await res.json();
      if (data.success && data.data) {
        setMt5Accounts(data.data);
      }
    } catch (err) {
      console.error('Error fetching MT5 accounts:', err);
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

  const handleMT5Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMt5Submitting(true);
    try {
      const res = await fetch('/api/mt5/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_number: mt5Data.account_number, server: mt5Data.server, platform: mt5Data.platform })
      });
      const data = await res.json();
      if (data?.success) {
        setShowMT5Form(false);
        setMt5Data({ account_number: '', server: '', platform: 'MT5' });
        if (passwordRef.current) passwordRef.current.value = '';
        showToast('MT5 account connection requested! Admin will review shortly.', 'success');
        // Refresh accounts list from API
        fetchMT5Accounts();
      } else {
        showToast(data?.error || data?.message || 'Failed to request MT5 connection.', 'error');
      }
    } catch (err) {
      console.error('MT5 connect error:', err);
      showToast('Error connecting MT5 account', 'error');
    } finally {
      setMt5Submitting(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileSidebarOpen) setMobileSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileSidebarOpen]);

  const toggleEA = (accountId: number) => {
    setMt5Accounts(mt5Accounts.map(acc => 
      acc.id === accountId 
        ? { ...acc, ea_status: acc.ea_status === 'active' ? 'inactive' : 'active' }
        : acc
    ));
  };

  // Derive data from hook
  const stats = dashboardData?.stats;
  const trades = dashboardData?.trades || [];
  const transactions = dashboardData?.transactions || [];
  const notifications = dashboardData?.notifications || [];

  const filteredTrades = trades.filter((trade: any) => {
    if (performanceFilter === 'all') return true;
    if (performanceFilter === 'profit') return trade.profit > 0;
    if (performanceFilter === 'loss') return trade.profit < 0;
    return true;
  });


  // Show error state with retry
  if (dataError && !dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center p-8">
        <ErrorState message={dataError} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50 to-gray-50 flex">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#c9a227] focus:text-[#1a1a1d] focus:rounded-lg focus:font-semibold">
        Skip to main content
      </a>
      <ToastContainer />
      
      {/* Sidebar Component */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content */}
      <main id="main-content" className="flex-1 lg:ml-72 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-[#1a1a1d] mb-1 md:mb-2">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'my-trading' && 'My Trading'}
                {activeTab === 'community' && 'Community'}
                {activeTab === 'journal' && 'Trading Journal'}
                {activeTab === 'settings' && 'Settings'}
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                {activeTab === 'dashboard' && 'Monitor your trading activity and account status'}
                {activeTab === 'my-trading' && 'Manage your MT5 accounts and view trading performance'}
                {activeTab === 'community' && 'Connect with fellow traders, share insights, and learn together'}
                {activeTab === 'journal' && 'Document your trades, emotions, and lessons learned'}
                {activeTab === 'settings' && 'Manage your account, billing, and subscription settings'}
              </p>
            </div>
          </div>
          <button
            onClick={refetch}
            disabled={dataLoading}
            className="px-5 py-2.5 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a227]"
            aria-label="Refresh data"
          >
            <svg
              className={`w-5 h-5 ${dataLoading ? 'animate-spin' : ''}`}
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
            {dataLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Key Metrics Grid - using StatsCard components */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Account Balance"
                value={`$${stats?.totalBalance || '0.00'}`}
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                variant="gold"
                badge="Live"
                loading={dataLoading}
              />
              <StatsCard
                title="Total Trades"
                value={stats?.totalTrades || 0}
                subtitle="+12% this month"
                icon={<svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                iconBg="bg-blue-50"
                loading={dataLoading}
              />
              <StatsCard
                title="Win Rate"
                value={`${stats?.winRate || 0}%`}
                subtitle="Above average"
                icon={<svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                iconBg="bg-green-50"
                loading={dataLoading}
              />
              <StatsCard
                title="EA Status"
                value={mt5Accounts.filter(a => a.ea_status === 'active').length}
                subtitle={`of ${mt5Accounts.length} accounts`}
                icon={<svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>}
                iconBg="bg-purple-50"
                badge="Active"
                loading={dataLoading}
              />
            </div>

            {/* Performance Chart + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceChart data={chartData} loading={dataLoading} />
              <RecentActivity trades={trades} loading={dataLoading} />
            </div>

            {/* Quick Actions */}
            <QuickActions
              actions={[
                {
                  id: 'connect-mt5',
                  label: 'Connect MT5',
                  sublabel: 'Add trading account',
                  icon: QuickActionIcons.add,
                  iconBg: 'bg-gradient-to-br from-[#c9a227] to-[#f0d78c]',
                  variant: 'primary',
                  onClick: () => setActiveTab('my-trading'),
                },
                {
                  id: 'trading-journal',
                  label: 'Trading Journal',
                  sublabel: 'Log your trades',
                  icon: <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
                  iconBg: 'bg-amber-50',
                  onClick: () => setActiveTab('journal'),
                },
                {
                  id: 'view-analytics',
                  label: 'View Analytics',
                  sublabel: 'Performance charts',
                  icon: QuickActionIcons.analytics,
                  iconBg: 'bg-blue-50',
                  onClick: () => setActiveTab('my-trading'),
                },
                {
                  id: 'manage-plan',
                  label: 'Manage Plan',
                  sublabel: 'Billing & subscription',
                  icon: QuickActionIcons.billing,
                  iconBg: 'bg-green-50',
                  onClick: () => setActiveTab('settings'),
                },
              ]}
            />

            {/* Notifications Section */}
            <NotificationsPanel notifications={notifications} loading={dataLoading} />
          </div>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <CommunityTab user={user} />
        )}

        {/* Journal Tab */}
        {activeTab === 'journal' && (
          <JournalTab user={user} showToast={showToast} />
        )}

        {/* My Trading Tab */}
        {activeTab === 'my-trading' && (
          <div className="space-y-6">
            {/* MT5 Connection Form */}
            {showMT5Form && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#1a1a1d]">Connect MT5 Account</h3>
                  <button
                    onClick={() => setShowMT5Form(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleMT5Submit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Account Number</label>
                      <input
                        type="text"
                        value={mt5Data.account_number}
                        onChange={(e) => setMt5Data({ ...mt5Data, account_number: e.target.value })}
                        placeholder="Enter account number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Server</label>
                      <input
                        type="text"
                        value={mt5Data.server}
                        onChange={(e) => setMt5Data({ ...mt5Data, server: e.target.value })}
                        placeholder="e.g., Broker-Server"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                      <input
                        type="password"
                        ref={passwordRef}
                        placeholder="Trading account password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                        aria-label="MT5 account password"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Platform</label>
                      <select
                        value={mt5Data.platform}
                        onChange={(e) => setMt5Data({ ...mt5Data, platform: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                      >
                        <option value="MT5">MetaTrader 5</option>
                        <option value="MT4">MetaTrader 4</option>
                      </select>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-[#f0d78c] rounded-xl p-4 flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#c9a227] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-gray-700">Your credentials are encrypted and secure. Admin will review and activate your EA within 24 hours.</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all"
                    >
                      Submit Connection Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMT5Form(false)}
                      className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Add Account Button */}
            {!showMT5Form && mt5Accounts.length === 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-dashed border-[#f0d78c] p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[#1a1a1d] mb-3">No MT5 Accounts Connected</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">Connect your MetaTrader 5 account to start automated trading with our Expert Advisors.</p>
                <button
                  onClick={() => setShowMT5Form(true)}
                  className="px-8 py-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Connect MT5 Account
                </button>
              </div>
            )}

            {/* Connected Accounts */}
            {!showMT5Form && mt5Accounts.length > 0 && (
              <div className="space-y-6">
                {/* Account Selector Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-[#1a1a1d]">My Accounts</h3>
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                      {mt5Accounts.filter(a => a.status === 'active').map((account) => (
                        <button
                          key={account.id}
                          onClick={() => setSelectedAccountForAnalytics(account)}
                          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                            selectedAccountForAnalytics?.id === account.id
                              ? 'bg-white text-[#1a1a1d] shadow-sm'
                              : 'text-gray-500 hover:text-[#1a1a1d]'
                          }`}
                        >
                          #{account.account_number}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchMT5Accounts}
                      className="p-2 text-gray-500 hover:text-[#c9a227] hover:bg-amber-50 rounded-lg transition-colors"
                      title="Refresh"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setShowMT5Form(true)}
                      className="px-4 py-2 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all inline-flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add
                    </button>
                  </div>
                </div>

                {/* Trading Analytics - Show for selected or first active account */}
                {(selectedAccountForAnalytics || mt5Accounts.find(a => a.status === 'active')) && (
                  <TradingAnalytics
                    accountId={(selectedAccountForAnalytics || mt5Accounts.find(a => a.status === 'active'))?.id}
                    accountNumber={(selectedAccountForAnalytics || mt5Accounts.find(a => a.status === 'active'))?.account_number}
                  />
                )}

                {/* Pending Accounts */}
                {mt5Accounts.filter(a => a.status !== 'active').length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-500">Pending Approval</h4>
                    {mt5Accounts.filter(a => a.status !== 'active').map((account) => (
                      <div key={account.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-[#1a1a1d]">#{account.account_number}</p>
                            <p className="text-xs text-gray-500">{account.server} · {account.platform}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                          Pending Review
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Legacy account cards removed - now using MT5AccountStatus component */}
            {/* The old toggleEA functionality is now handled automatically through the automation system */}
            {false && mt5Accounts.map((account: any) => (
              <div key={account.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-[#1a1a1d]">Account #{account.account_number}</div>
                      <div className="text-sm text-gray-600">{account.server}</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    account.status === 'active' ? 'bg-green-100 text-green-700' :
                    account.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {account.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Balance</div>
                    <div className="font-bold text-[#1a1a1d]">${(account.balance || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Equity</div>
                    <div className="font-bold text-[#1a1a1d]">${(account.equity || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Profit</div>
                    <div className={`font-bold ${(account.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(account.profit || 0) >= 0 ? '+' : ''}${(account.profit || 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    <span className="text-sm font-semibold text-purple-900">EA Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {account.ea_status === 'active' && (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-green-700">ACTIVE</span>
                      </>
                    )}
                    {account.ea_status === 'inactive' && (
                      <>
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="text-sm font-semibold text-gray-600">INACTIVE</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => toggleEA(account.id)}
                  disabled={account.status !== 'active'}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    account.ea_status === 'active'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {account.ea_status === 'active' ? 'Stop EA' : 'Start EA'}
                      </button>
                    </div>
                  ))}

            {/* Performance Section */}
            <div className="mt-8 space-y-6">
              {/* Filters */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">Filter:</span>
                  <button
                    onClick={() => setPerformanceFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      performanceFilter === 'all'
                        ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d]'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All Trades
                  </button>
                  <button
                    onClick={() => setPerformanceFilter('profit')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      performanceFilter === 'profit'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Profitable
                  </button>
                  <button
                    onClick={() => setPerformanceFilter('loss')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      performanceFilter === 'loss'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Loss
                  </button>
                </div>
                <div className="border-l border-gray-300 pl-4 flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">Period:</span>
                  <button
                    onClick={() => setDateRange('week')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      dateRange === 'week'
                        ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d]'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setDateRange('month')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      dateRange === 'month'
                        ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d]'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setDateRange('year')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      dateRange === 'year'
                        ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d]'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Year
                  </button>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="text-sm text-gray-600 mb-2">Total Profit/Loss</div>
                  <div className="text-3xl font-bold text-green-600">+$1,245.50</div>
                  <div className="text-xs text-gray-500 mt-1">+15.2% ROI</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="text-sm text-gray-600 mb-2">Win Rate</div>
                  <div className="text-3xl font-bold text-[#1a1a1d]">68.5%</div>
                  <div className="text-xs text-green-600 mt-1">Above average</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="text-sm text-gray-600 mb-2">Total Trades</div>
                  <div className="text-3xl font-bold text-[#1a1a1d]">{filteredTrades.length}</div>
                  <div className="text-xs text-gray-500 mt-1">This period</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="text-sm text-gray-600 mb-2">Avg Trade</div>
                  <div className="text-3xl font-bold text-[#1a1a1d]">$52.50</div>
                  <div className="text-xs text-green-600 mt-1">+8% vs last period</div>
                </div>
              </div>

              {/* Trades Table */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-4 px-6 text-gray-600 font-semibold">Trade ID</th>
                        <th className="text-left py-4 px-6 text-gray-600 font-semibold">Symbol</th>
                        <th className="text-left py-4 px-6 text-gray-600 font-semibold">Type</th>
                        <th className="text-left py-4 px-6 text-gray-600 font-semibold">Amount</th>
                        <th className="text-left py-4 px-6 text-gray-600 font-semibold">Price</th>
                        <th className="text-left py-4 px-6 text-gray-600 font-semibold">Profit/Loss</th>
                        <th className="text-left py-4 px-6 text-gray-600 font-semibold">Status</th>
                        <th className="text-left py-4 px-6 text-gray-600 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTrades.map((trade) => (
                        <tr key={trade.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6 font-mono text-sm text-gray-600">#{trade.id}</td>
                          <td className="py-4 px-6 font-semibold text-[#1a1a1d]">{trade.symbol}</td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              trade.type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {trade.type}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-semibold text-[#1a1a1d]">${parseFloat(trade.amount).toFixed(2)}</td>
                          <td className="py-4 px-6 text-gray-600">${parseFloat(trade.price).toFixed(4)}</td>
                          <td className="py-4 px-6">
                            <span className={`font-semibold ${trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {trade.profit >= 0 ? '+' : ''}{trade.profit ? `$${parseFloat(trade.profit).toFixed(2)}` : '-'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              trade.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {trade.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">{new Date(trade.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <SettingsTab user={user} />
        )}
      </main>
    </div>
  );
}

export default function UserDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a227]"></div></div>}>
      <DashboardContent />
    </Suspense>
  );
}
