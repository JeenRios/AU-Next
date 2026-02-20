'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SectionHeader, PageContainer } from '@/components/shared';
import { StatsCard, PerformanceChart, RecentActivity, NotificationsPanel, QuickActions, QuickActionIcons, ErrorState } from '@/components/user';
import { useDashboardData } from '@/lib/hooks/useFetch';

export default function DashboardPage() {
  const router = useRouter();
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
    fetchMT5Accounts();
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

  // Derive data from hook
  const stats = dashboardData?.stats;
  const trades = dashboardData?.trades || [];
  const notifications = dashboardData?.notifications || [];

  // Show error state with retry
  if (dataError && !dataLoading) {
    return <ErrorState message={dataError} onRetry={refetch} />;
  }

  return (
    <PageContainer>
      <SectionHeader
        title="Dashboard"
        subtitle="Monitor your trading activity and account status"
        onRefresh={refetch}
        isRefreshing={dataLoading}
      />
      <div className="space-y-6">
        {/* Key Metrics Grid */}
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
              iconBg: 'bg-gradient-to-br from-primary-gold to-secondary-gold',
              variant: 'primary',
              onClick: () => router.push('/trading'),
            },
            {
              id: 'trading-journal',
              label: 'Trading Journal',
              sublabel: 'Log your trades',
              icon: <svg className="w-6 h-6 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
              iconBg: 'bg-primary-gold/10',
              onClick: () => router.push('/journal'),
            },
            {
              id: 'view-analytics',
              label: 'View Analytics',
              sublabel: 'Performance charts',
              icon: QuickActionIcons.analytics,
              iconBg: 'bg-blue-50',
              onClick: () => router.push('/trading'),
            },
            {
              id: 'manage-plan',
              label: 'Manage Plan',
              sublabel: 'Billing & subscription',
              icon: QuickActionIcons.billing,
              iconBg: 'bg-green-50',
              onClick: () => router.push('/settings'),
            },
          ]}
        />

        {/* Notifications Section */}
        <NotificationsPanel notifications={notifications} loading={dataLoading} />
      </div>
    </PageContainer>
  );
}
