'use client';

import { useState, useRef } from 'react';
import TabLayout, { TabItem, TabIcons } from './TabLayout';
import { OverviewContent, AccountsContent, PerformanceContent } from './mytrading';

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
}

const tradingTabs: TabItem[] = [
  { id: 'overview', label: 'Overview', icon: TabIcons.overview },
  { id: 'accounts', label: 'Accounts', icon: TabIcons.accounts },
  { id: 'performance', label: 'Performance', icon: TabIcons.chart },
];

export default function MyTradingTab({
  mt5Accounts,
  trades,
  stats,
  showToast,
  fetchMT5Accounts,
}: MyTradingTabProps) {
  // MT5 Connection Form State
  const [showMT5Form, setShowMT5Form] = useState(false);
  const [mt5Data, setMt5Data] = useState({
    account_number: '',
    server: '',
    platform: 'MT5'
  });
  const [mt5Submitting, setMt5Submitting] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Account selection for analytics
  const [selectedAccountForAnalytics, setSelectedAccountForAnalytics] = useState<MT5Account | null>(null);

  // Performance filters
  const [performanceFilter, setPerformanceFilter] = useState<'all' | 'profit' | 'loss'>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');

  // Active tab for internal navigation
  const [activeSubTab, setActiveSubTab] = useState('overview');

  const handleMT5Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMt5Submitting(true);
    try {
      const res = await fetch('/api/mt5/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_number: mt5Data.account_number,
          server: mt5Data.server,
          platform: mt5Data.platform
        })
      });
      const data = await res.json();
      if (data?.success) {
        setShowMT5Form(false);
        setMt5Data({ account_number: '', server: '', platform: 'MT5' });
        if (passwordRef.current) passwordRef.current.value = '';
        showToast('MT5 account connection requested! Admin will review shortly.', 'success');
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
            showMT5Form={showMT5Form}
            setShowMT5Form={setShowMT5Form}
            mt5Data={mt5Data}
            setMt5Data={setMt5Data}
            mt5Submitting={mt5Submitting}
            handleMT5Submit={handleMT5Submit}
            passwordRef={passwordRef}
            selectedAccountForAnalytics={selectedAccountForAnalytics}
            setSelectedAccountForAnalytics={setSelectedAccountForAnalytics}
            fetchMT5Accounts={fetchMT5Accounts}
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
    <TabLayout
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
    </TabLayout>
  );
}
