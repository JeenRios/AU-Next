'use client';

import { useState, useEffect } from 'react';

interface MT5AccountData {
  id: number;
  account_number: string;
  server: string;
  platform: string;
  status: string;
  ea_status: string;
  automation_status: string;
  balance: number;
  equity: number;
  profit: number;
  gain_percentage: number;
  current_lot_size: number;
  open_positions_count: number;
  last_sync_at: string | null;
  last_trade_at: string | null;
  vps: {
    status: string;
    health: string | null;
    name: string;
    ip: string | null;
  } | null;
  live_data: boolean;
  message?: string;
}

interface MT5AccountStatusProps {
  accountId: number;
  onError?: (message: string) => void;
}

// Status timeline steps
const TIMELINE_STEPS = [
  { key: 'pending', label: 'Submitted', description: 'Request submitted for review' },
  { key: 'active', label: 'Approved', description: 'Account approved by admin' },
  { key: 'vps_ready', label: 'VPS Ready', description: 'VPS provisioned and ready' },
  { key: 'ea_deployed', label: 'EA Deployed', description: 'Trading bot is active' }
];

function getTimelineProgress(status: string, automationStatus: string): number {
  if (status === 'pending') return 0;
  if (status === 'rejected') return -1; // Special case for rejected
  if (status !== 'active') return 0;

  // Account is active, check automation progress
  if (automationStatus === 'none') return 1;
  if (automationStatus === 'vps_provisioning') return 1.5;
  if (automationStatus === 'vps_ready') return 2;
  if (automationStatus === 'ea_deploying') return 2.5;
  if (automationStatus === 'active') return 3;
  if (automationStatus === 'error') return 2; // Show progress but indicate error

  return 1;
}

export default function MT5AccountStatus({ accountId, onError }: MT5AccountStatusProps) {
  const [accountData, setAccountData] = useState<MT5AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAccountStatus();
  }, [accountId]);

  const fetchAccountStatus = async () => {
    try {
      const res = await fetch(`/api/mt5/status?account_id=${accountId}`);
      const data = await res.json();
      if (data.success) {
        setAccountData(data.data);
      } else {
        onError?.(data.error);
      }
    } catch (err: any) {
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAccountStatus();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (!accountData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-gray-500">Unable to load account data</p>
      </div>
    );
  }

  const timelineProgress = getTimelineProgress(accountData.status, accountData.automation_status);
  const isRejected = accountData.status === 'rejected';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#c9a227]/10 to-[#f0d78c]/10 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#1a1a1d]">MT5 Account: {accountData.account_number}</h3>
            <p className="text-sm text-gray-500">{accountData.server} - {accountData.platform}</p>
          </div>
          <div className="flex items-center gap-2">
            {accountData.automation_status === 'active' && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Trading Active
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-500 hover:text-[#c9a227] hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh Status"
            >
              <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="p-4 border-b border-gray-200">
        {isRejected ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium">Request Rejected</span>
            </div>
            <p className="text-sm text-red-600 mt-1">Your account connection request was not approved. Please contact support for more information.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="flex justify-between items-start">
              {TIMELINE_STEPS.map((step, index) => {
                const isCompleted = index < timelineProgress;
                const isCurrent = Math.floor(timelineProgress) === index;
                const isInProgress = timelineProgress > index && timelineProgress < index + 1;

                return (
                  <div key={step.key} className="flex flex-col items-center flex-1 relative">
                    {/* Connector line */}
                    {index < TIMELINE_STEPS.length - 1 && (
                      <div
                        className={`absolute top-4 left-1/2 w-full h-0.5 ${
                          isCompleted ? 'bg-[#c9a227]' :
                          isInProgress ? 'bg-gradient-to-r from-[#c9a227] to-gray-200' :
                          'bg-gray-200'
                        }`}
                        style={{ transform: 'translateY(-50%)' }}
                      />
                    )}
                    {/* Circle */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${
                        isCompleted ? 'bg-[#c9a227] text-white' :
                        isCurrent || isInProgress ? 'bg-[#c9a227]/20 border-2 border-[#c9a227] text-[#c9a227]' :
                        'bg-gray-100 text-gray-400 border-2 border-gray-200'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : isInProgress ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    {/* Label */}
                    <p className={`mt-2 text-xs font-medium text-center ${
                      isCompleted || isCurrent ? 'text-[#1a1a1d]' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-gray-500 text-center mt-0.5 max-w-[80px]">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid - Only show if account is active */}
      {accountData.status === 'active' && (
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Balance</p>
              <p className="text-lg font-semibold text-[#1a1a1d]">${accountData.balance.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Equity</p>
              <p className="text-lg font-semibold text-[#1a1a1d]">${accountData.equity.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Profit</p>
              <p className={`text-lg font-semibold ${accountData.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {accountData.profit >= 0 ? '+' : ''}${accountData.profit.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Gain</p>
              <p className={`text-lg font-semibold ${accountData.gain_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {accountData.gain_percentage >= 0 ? '+' : ''}{accountData.gain_percentage.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-3">
            <div className="flex items-center gap-4">
              <span className="text-gray-500">
                Open Positions: <strong className="text-[#1a1a1d]">{accountData.open_positions_count}</strong>
              </span>
              <span className="text-gray-500">
                Lot Size: <strong className="text-[#1a1a1d]">{accountData.current_lot_size.toFixed(2)}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              {accountData.live_data ? (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-xs">Live Data</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  <span className="text-xs">Cached Data</span>
                </>
              )}
            </div>
          </div>

          {/* Last Sync */}
          {accountData.last_sync_at && (
            <p className="text-xs text-gray-400 mt-2">
              Last synced: {new Date(accountData.last_sync_at).toLocaleString()}
            </p>
          )}

          {/* VPS Info */}
          {accountData.vps && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900">{accountData.vps.name}</p>
                    <p className="text-xs text-blue-700">VPS for automated trading</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  accountData.vps.status === 'active' ? 'bg-green-100 text-green-700' :
                  accountData.vps.status === 'provisioning' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {accountData.vps.status.toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {/* EA Status Message */}
          {accountData.automation_status === 'ea_deploying' && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-100 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <p className="text-sm text-purple-700">Expert Advisor is being deployed. This may take a few minutes...</p>
              </div>
            </div>
          )}

          {accountData.automation_status === 'error' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-red-700">There was an issue with automation setup. Please contact support.</p>
              </div>
            </div>
          )}

          {accountData.message && !accountData.live_data && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
              <p className="text-sm text-yellow-700">{accountData.message}</p>
            </div>
          )}
        </div>
      )}

      {/* Pending Status */}
      {accountData.status === 'pending' && (
        <div className="p-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-amber-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Pending Review</span>
            </div>
            <p className="text-sm text-amber-600 mt-1">Your account connection request is being reviewed by an administrator. You will be notified once approved.</p>
          </div>
        </div>
      )}
    </div>
  );
}
