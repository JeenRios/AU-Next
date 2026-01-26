'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/shared/Toast';
import { Sidebar, StatsCard, PerformanceChart, RecentActivity, NotificationsPanel, QuickActions, QuickActionIcons, ErrorState, SettingsTab, CommunityTab, JournalTab, MyTradingTab } from '@/components/user';
import { useDashboardData } from '@/lib/hooks/useFetch';

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
  
  // MT5 Accounts (needed for dashboard stats)
  const [mt5Accounts, setMt5Accounts] = useState<any[]>([]);


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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileSidebarOpen) setMobileSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileSidebarOpen]);

  // Derive data from hook
  const stats = dashboardData?.stats;
  const trades = dashboardData?.trades || [];
  const notifications = dashboardData?.notifications || [];


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
          <MyTradingTab
            mt5Accounts={mt5Accounts}
            trades={trades}
            stats={stats}
            showToast={showToast}
            fetchMT5Accounts={fetchMT5Accounts}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <SettingsTab user={user} onUserUpdate={setUser} />
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
