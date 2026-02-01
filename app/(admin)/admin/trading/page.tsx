'use client';

import { useState } from 'react';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { SectionHeader, ContentTabs, ContentTab, ContentTabIcons } from '@/components/shared';
import MT5Trading from '@/components/admin/trading/MT5Trading';
import VPSManagement from '@/components/admin/trading/VPSManagement';
import AutomationJobs from '@/components/admin/trading/AutomationJobs';

const tradingTabs: ContentTab[] = [
  { id: 'accounts', label: 'MT5 Accounts', icon: ContentTabIcons.accounts },
  { id: 'vps', label: 'VPS Management', icon: ContentTabIcons.settings },
  { id: 'jobs', label: 'Automation Jobs', icon: ContentTabIcons.chart },
  { id: 'history', label: 'Trade History', icon: ContentTabIcons.overview },
];

export default function AdminTradingPage() {
  const { trades, loading, refreshing, fetchData } = useAdmin();
  const [activeSubTab, setActiveSubTab] = useState('accounts');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#c9a227] rounded-full animate-spin"></div>
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
            <h3 className="font-bold text-[#1a1a1d] mb-4">Trade History</h3>
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
                        <p className="font-semibold text-[#1a1a1d]">{trade.symbol}</p>
                        <p className="text-xs text-gray-500">{trade.type} · {trade.amount}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#1a1a1d]">${trade.price}</p>
                      <p className="text-xs text-gray-500">{new Date(trade.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      trade.status === 'completed' ? 'bg-green-100 text-green-700' :
                      trade.status === 'pending' ? 'bg-amber-100 text-amber-700' :
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
    <>
      <SectionHeader
        title="Trading"
        subtitle="Manage MT5 accounts, VPS instances, and automation"
        onRefresh={fetchData}
        isRefreshing={refreshing}
      />
      <ContentTabs
        tabs={tradingTabs}
        activeTab={activeSubTab}
        onTabChange={setActiveSubTab}
      >
        {renderContent()}
      </ContentTabs>
    </>
  );
}
