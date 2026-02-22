'use client';

import { useState } from 'react';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { SectionHeader } from '@/components/shared';
import UnifiedPageLayout from '@/components/shared/layout/UnifiedPageLayout';
import { ContentTabIcons } from '@/components/shared/ui/ContentTabs';
import MT5Trading from '@/components/admin/trading/MT5Trading';
import VPSManagement from '@/components/admin/trading/VPSManagement';
import AutomationJobs from '@/components/admin/trading/AutomationJobs';

const tradingTabs = [
  { id: 'accounts', label: 'MT5 Accounts', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ContentTabIcons.accounts} /></svg> },
  { id: 'vps', label: 'VPS Management', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ContentTabIcons.settings} /></svg> },
  { id: 'jobs', label: 'Automation Jobs', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ContentTabIcons.chart} /></svg> },
  { id: 'history', label: 'Trade History', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ContentTabIcons.overview} /></svg> },
];

export default function AdminTradingPage() {
  const { trades, loading, refreshing, fetchData } = useAdmin();
  const [activeSubTab, setActiveSubTab] = useState('accounts');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSubTab) {
      case 'accounts':
        // MT5Trading manages its own data fetching
        return <MT5Trading />;
      case 'vps':
        // VPSManagement manages its own data fetching
        return <VPSManagement />;
      case 'jobs':
        // AutomationJobs manages its own data fetching
        return <AutomationJobs />;
      case 'history':
        return (
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="font-bold text-surface-dark mb-4">Trade History</h3>
            {trades.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No trades found</p>
            ) : (
              <div className="space-y-3">
                {trades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        trade.type === 'BUY' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <svg className={`w-5 h-5 ${trade.type === 'BUY' ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={trade.type === 'BUY' ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' : 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'} />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-surface-dark">{trade.symbol}</p>
                        <p className="text-xs text-gray-500">{trade.type} · {trade.amount}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-surface-dark">${trade.price}</p>
                      <p className="text-xs text-gray-500">{new Date(trade.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      trade.status === 'completed' ? 'bg-green-100 text-green-700' :
                      trade.status === 'pending' ? 'bg-primary-gold/20 text-primary-gold' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {trade.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <UnifiedPageLayout
      tabs={tradingTabs}
      defaultTab="accounts"
      title="Trading"
      subtitle="Manage MT5 accounts, VPS instances, and automation"
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
      {(activeTab) => {
        setActiveSubTab(activeTab);
        return renderContent();
      }}
    </UnifiedPageLayout>
  );
}
