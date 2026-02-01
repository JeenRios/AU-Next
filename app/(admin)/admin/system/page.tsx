'use client';

import { useState } from 'react';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { SectionHeader, ContentTabs, ContentTab, ContentTabIcons } from '@/components/shared';

const systemTabs: ContentTab[] = [
  { id: 'settings', label: 'Settings', icon: ContentTabIcons.settings },
  { id: 'audit', label: 'Audit Logs', icon: ContentTabIcons.overview },
];

export default function AdminSystemPage() {
  const { users, mt5Accounts, loading, refreshing, fetchData } = useAdmin();
  const [activeSubTab, setActiveSubTab] = useState('settings');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#c9a227] rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSubTab) {
      case 'settings':
        return (
          <div className="space-y-6">
            {/* System Status */}
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h3 className="font-bold text-[#1a1a1d] mb-4">System Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-green-700">API Server</span>
                  </div>
                  <p className="text-sm text-green-600">Online - 99.9% uptime</p>
                </div>
                <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-green-700">Database</span>
                  </div>
                  <p className="text-sm text-green-600">Connected - Healthy</p>
                </div>
                <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-green-700">MT5 Service</span>
                  </div>
                  <p className="text-sm text-green-600">Running - {mt5Accounts.filter((a: any) => a.status === 'active').length} active</p>
                </div>
              </div>
            </div>

            {/* General Settings */}
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h3 className="font-bold text-[#1a1a1d] mb-4">General Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-[#1a1a1d]">Maintenance Mode</p>
                    <p className="text-sm text-gray-500">Disable access for non-admin users</p>
                  </div>
                  <button className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                    Disabled
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-[#1a1a1d]">New User Registration</p>
                    <p className="text-sm text-gray-500">Allow new users to register</p>
                  </div>
                  <button className="px-4 py-2 bg-green-100 text-green-700 border border-green-200 rounded-xl">
                    Enabled
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-[#1a1a1d]">Email Notifications</p>
                    <p className="text-sm text-gray-500">Send email notifications for events</p>
                  </div>
                  <button className="px-4 py-2 bg-green-100 text-green-700 border border-green-200 rounded-xl">
                    Enabled
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'audit':
        return (
          <div className="bg-white border border-gray-100 rounded-xl">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-[#1a1a1d]">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {/* Generate audit logs from users and accounts */}
              {users.slice(0, 5).map((u) => (
                <div key={`audit-user-${u.id}`} className="p-4 flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#1a1a1d]">
                      {u.last_login ? 'User logged in' : 'New user registered'}
                    </p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(u.last_login || u.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {mt5Accounts.slice(0, 3).map((account: any) => (
                <div key={`audit-mt5-${account.id}`} className="p-4 flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#1a1a1d]">
                      MT5 account {account.status === 'pending' ? 'connection requested' : account.status}
                    </p>
                    <p className="text-sm text-gray-500">Account: {account.account_number}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(account.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <SectionHeader
        title="System"
        subtitle="System settings and audit logs"
        onRefresh={fetchData}
        isRefreshing={refreshing}
      />
      <ContentTabs
        tabs={systemTabs}
        activeTab={activeSubTab}
        onTabChange={setActiveSubTab}
      >
        {renderContent()}
      </ContentTabs>
    </>
  );
}
