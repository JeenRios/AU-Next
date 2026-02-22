'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer, SectionHeader } from '@/components/shared';
import { ContentTabIcons } from '@/components/shared/ui/ContentTabs';
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

  useEffect(() => {
    fetchMT5Accounts();
  }, []);

  // Derive data from hook
  const stats = dashboardData?.stats;
  const trades = dashboardData?.trades || [];
  const notifications = dashboardData?.notifications || [];

  // Show error state with retry
  if (dataError && !dataLoading) {
    return <ErrorState message={dataError} onRetry={refetch} />;
  }

  const dashboardTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ContentTabIcons.overview} /></svg> },
  ];

  return (
    <PageContainer
      tabs={dashboardTabs}
      defaultTab="dashboard"
      title="Dashboard"
      subtitle="Overview of your trading performance and activities"
      className="h-full"
    >
      {() => (
        <>
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
                title="Total Balance"
                value={stats?.totalBalance || '$0'}
                change={stats?.balanceChange || '+0%'}
                icon="💰"
                loading={dataLoading}
              />
              <StatsCard
                title="Active Accounts"
                value={stats?.activeAccounts || '0'}
                change={stats?.accountsChange || '+0%'}
                icon="📊"
                loading={dataLoading}
              />
              <StatsCard
                title="Win Rate"
                value={stats?.winRate || '0%'}
                change={stats?.winRateChange || '+0%'}
                icon="📈"
                loading={dataLoading}
              />
              <StatsCard
                title="Total Trades"
                value={stats?.totalTrades || '0'}
                change={stats?.tradesChange || '+0%'}
                icon="💹"
                loading={dataLoading}
              />
            </div>

            {/* Performance Chart */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
                <div className="flex gap-2">
                  {['1W', '1M', '3M', 'YTD'].map(range => (
                    <button
                      key={range}
                      onClick={() => {}}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                        range === '1W' ? 'bg-primary-gold text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              <PerformanceChart data={chartData} loading={dataLoading} />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <button
                  onClick={() => router.push('/journal')}
                  className="text-sm text-primary-gold hover:text-primary-gold/80 font-medium transition-colors"
                >
                  View All
                </button>
              </div>
              <RecentActivity trades={trades} loading={dataLoading} />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
              <QuickActions
                actions={[
                  {
                    id: 'add-account',
                    label: 'Add Account',
                    sublabel: 'Connect new MT5 account',
                    icon: QuickActionIcons.add,
                    iconBg: 'bg-blue-50',
                    onClick: () => router.push('/trading'),
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
            </div>

            {/* Notifications Section */}
            <NotificationsPanel notifications={notifications} loading={dataLoading} />
          </div>
        </>
      )}
    </PageContainer>
  );
}
