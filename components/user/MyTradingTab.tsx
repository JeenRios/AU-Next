'use client';

import { useState } from 'react';
import { SectionHeader, ContentTabs, ContentTab, ContentTabIcons } from '@/components/shared';
import { OverviewContent, AccountsContent, PerformanceContent } from './mytrading';
import ConnectAccountModal from './accounts/ConnectAccountModal';

interface MT5Account {
  id: number;
  account_number: string;
  server: string;
  platform: string;
  status: string;
  balance?: number;
  equity?: number;
  profit?: number;
  ea_status?: string;
}

interface Trade {
  id: number;
  symbol: string;
  type: string;
  amount: string;
  price: string;
  profit: number;
  status: string;
  created_at: string;
}

interface MyTradingTabProps {
  mt5Accounts: MT5Account[];
  trades: Trade[];
  stats: {
    totalBalance?: string;
    totalTrades?: number;
    winRate?: number;
  } | null;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  fetchMT5Accounts: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const tradingTabs: ContentTab[] = [
  { id: 'overview', label: 'Overview', icon: ContentTabIcons.overview },
  { id: 'accounts', label: 'Accounts', icon: ContentTabIcons.accounts },
  { id: 'performance', label: 'Performance', icon: ContentTabIcons.chart },
];

export default function MyTradingTab({
  mt5Accounts,
  trades,
  stats,
  showToast,
  fetchMT5Accounts,
  onRefresh,
  isRefreshing = false,
}: MyTradingTabProps) {
  // Connect Modal State
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Account selection for analytics
  const [selectedAccountForAnalytics, setSelectedAccountForAnalytics] = useState<MT5Account | null>(null);

  // Performance filters
  const [performanceFilter, setPerformanceFilter] = useState<'all' | 'profit' | 'loss'>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');

  // Active activeSubTab for internal navigation
  const [activeSubTab, setActiveSubTab] = useState('overview');

  const handleConnectAccount = async (data: any) => {
    setIsConnecting(true);
    try {
      const res = await fetch('/api/mt5/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_number: data.login,
          server: data.server,
          platform: 'MT5',
          password: data.password || data.investorPassword,
        })
      });
      const result = await res.json();
      if (result?.success) {
        setShowConnectModal(false);
        showToast('MT5 account connection requested! Admin will review shortly.', 'success');
        fetchMT5Accounts();
      } else {
        showToast(result?.error || result?.message || 'Failed to request MT5 connection.', 'error');
      }
    } catch (err) {
      console.error('MT5 connect error:', err);
      showToast('Error connecting MT5 account', 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleNavigate = (tab: string) => {
    setActiveSubTab(tab);
  };

  const renderContent = (activeTab: string) => {
    // Use internal activeSubTab for navigation from Overview
    const currentTab = activeSubTab !== 'overview' && activeTab === 'overview' ? activeSubTab : activeTab;

    switch (currentTab) {
      case 'overview':
        return (
          <OverviewContent
            mt5Accounts={mt5Accounts}
            trades={trades}
            stats={stats}
            onNavigate={handleNavigate}
          />
        );
      case 'accounts':
        return (
          <AccountsContent
            mt5Accounts={mt5Accounts}
            selectedAccountForAnalytics={selectedAccountForAnalytics}
            setSelectedAccountForAnalytics={setSelectedAccountForAnalytics}
            fetchMT5Accounts={fetchMT5Accounts}
            onOpenConnectModal={() => setShowConnectModal(true)}
          />
        );
      case 'performance':
        return (
          <PerformanceContent
            trades={trades}
            performanceFilter={performanceFilter}
            setPerformanceFilter={setPerformanceFilter}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
        );
      default:
        return (
          <OverviewContent
            mt5Accounts={mt5Accounts}
            trades={trades}
            stats={stats}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <>
      <ConnectAccountModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnect={handleConnectAccount}
      />
      <SectionHeader
        title="My Trading"
        subtitle="Manage your MT5 accounts and view trading performance"
        actions={
          onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="px-4 py-2.5 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <svg
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
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
          )
        }
      />
      <ContentTabs
        tabs={tradingTabs}
        defaultTab="overview"
      >
        {(activeTab) => {
          // Reset internal navigation when main tab changes
          if (activeTab !== activeSubTab && tradingTabs.some(t => t.id === activeTab)) {
            setActiveSubTab(activeTab);
          }
          return renderContent(activeTab);
        }}
      </ContentTabs>
    </>
  );
}
