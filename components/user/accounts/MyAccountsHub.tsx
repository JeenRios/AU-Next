'use client';

import { useState } from 'react';
import AccountPortfolioCard, { AccountData, generateDefaultChartData } from './AccountPortfolioCard';

interface MyAccountsHubProps {
  accounts?: AccountData[];
  onAddAccount?: () => void;
  onEditAccount?: (account: AccountData) => void;
  onDisconnectAccount?: (accountId: string) => void;
  onRefreshAccount?: (accountId: string) => void;
  maxVisible?: number;
}

// Default mock accounts - chart data generated with consistent seeds
const defaultAccounts: AccountData[] = [
  {
    id: 'acc-1',
    name: 'FTMO Challenge',
    broker: 'FTMO',
    accountNumber: '12345678',
    gain: 179.88,
    absGain: 176.89,
    daily: 0.08,
    monthly: 9.22,
    drawdown: 60.46,
    balance: 0.00,
    equity: 0.00,
    equityPercent: 0,
    highest: { date: 'Jun 12', value: 54475.39 },
    profit: 31900.00,
    interest: -2571.93,
    deposits: 18034.00,
    withdrawals: 49934.00,
    updated: 'May 22, 2024 at 10:43',
    tracking: 156,
    isConnected: true,
    chartData: generateDefaultChartData(101),
  },
  {
    id: 'acc-2',
    name: 'Live Account',
    broker: 'IC Markets',
    accountNumber: '87654321',
    gain: 45.32,
    absGain: 42.18,
    daily: 0.15,
    monthly: 4.85,
    drawdown: 12.30,
    balance: 8542.50,
    equity: 8620.00,
    equityPercent: 100.9,
    highest: { date: 'Jan 28', value: 9200.00 },
    profit: 2542.50,
    interest: -180.25,
    deposits: 6000.00,
    withdrawals: 0.00,
    updated: 'Feb 6, 2026 at 09:15',
    tracking: 89,
    isConnected: true,
    chartData: generateDefaultChartData(202),
  },
  {
    id: 'acc-3',
    name: 'Cent Account',
    broker: 'FBS',
    accountNumber: '55667788',
    gain: -8.45,
    absGain: -8.45,
    daily: -0.22,
    monthly: -2.15,
    drawdown: 25.60,
    balance: 915.50,
    equity: 892.30,
    equityPercent: 97.5,
    highest: { date: 'Dec 15', value: 1200.00 },
    profit: -84.50,
    interest: -12.00,
    deposits: 1000.00,
    withdrawals: 0.00,
    updated: 'Feb 5, 2026 at 18:30',
    tracking: 23,
    isConnected: false,
    chartData: generateDefaultChartData(303),
  },
];

export default function MyAccountsHub({
  accounts = defaultAccounts,
  onAddAccount,
  onEditAccount,
  onDisconnectAccount,
  onRefreshAccount,
  maxVisible = 1,
}: MyAccountsHubProps) {
  const [activeAccountIndex, setActiveAccountIndex] = useState(0);
  const [showAccountSelector, setShowAccountSelector] = useState(false);

  const activeAccount = accounts[activeAccountIndex] || accounts[0];
  const hasMultipleAccounts = accounts.length > 1;

  const handleAddAccount = () => {
    if (onAddAccount) {
      onAddAccount();
    } else {
      // Default behavior - could open a modal or navigate
      console.log('Add account clicked');
    }
  };

  return (
    <div className="space-y-3">
      {/* Account Selector Header */}
      {(hasMultipleAccounts || true) && (
        <div className="flex items-center justify-between">
          {/* Account tabs / selector */}
          <div className="flex items-center gap-2">
            {hasMultipleAccounts ? (
              <div className="relative">
                <button
                  onClick={() => setShowAccountSelector(!showAccountSelector)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-[#1a1a1d]">
                    {activeAccount?.name}
                  </span>
                  <svg 
                    className={`w-4 h-4 text-gray-400 transition-transform ${showAccountSelector ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {showAccountSelector && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Your Accounts ({accounts.length})
                    </div>
                    {accounts.map((account, index) => (
                      <button
                        key={account.id}
                        onClick={() => {
                          setActiveAccountIndex(index);
                          setShowAccountSelector(false);
                        }}
                        className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                          index === activeAccountIndex ? 'bg-[#c9a227]/5' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                          account.gain >= 0 
                            ? 'bg-gradient-to-br from-[#4ade80] to-[#16a34a]' 
                            : 'bg-gradient-to-br from-[#f87171] to-[#dc2626]'
                        }`}>
                          {account.gain >= 0 ? '+' : ''}{account.gain.toFixed(0)}%
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-medium text-[#1a1a1d] truncate">{account.name}</p>
                          <p className="text-[10px] text-gray-500">{account.broker} • #{account.accountNumber}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${account.isConnected ? 'bg-[#4ade80]' : 'bg-gray-300'}`} />
                        </div>
                        {index === activeAccountIndex && (
                          <svg className="w-4 h-4 text-[#c9a227]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-sm font-medium text-[#1a1a1d]">My Portfolio</span>
            )}

            {/* Account indicators */}
            {hasMultipleAccounts && (
              <div className="flex items-center gap-1 ml-2">
                {accounts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveAccountIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === activeAccountIndex 
                        ? 'bg-[#c9a227] w-4' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Add Account Button */}
          <button
            onClick={handleAddAccount}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#c9a227] hover:bg-[#c9a227]/5 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add Account</span>
          </button>
        </div>
      )}

      {/* Active Account Card */}
      {activeAccount ? (
        <AccountPortfolioCard
          account={activeAccount}
          onEdit={onEditAccount}
          onDisconnect={onDisconnectAccount}
          onRefresh={onRefreshAccount}
          defaultExpanded={true}
        />
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-gray-200 border-dashed p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#1a1a1d] mb-1">Connect your MT5 account</h3>
          <p className="text-sm text-gray-500 mb-4">
            Link your trading account to track performance and share with the community
          </p>
          <button
            onClick={handleAddAccount}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#c9a227] text-white font-medium rounded-lg hover:bg-[#b8922a] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Connect Account
          </button>
        </div>
      )}

      {/* Quick Navigation for multiple accounts */}
      {hasMultipleAccounts && accounts.length > 2 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setActiveAccountIndex(Math.max(0, activeAccountIndex - 1))}
            disabled={activeAccountIndex === 0}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xs text-gray-500">
            {activeAccountIndex + 1} of {accounts.length}
          </span>
          <button
            onClick={() => setActiveAccountIndex(Math.min(accounts.length - 1, activeAccountIndex + 1))}
            disabled={activeAccountIndex === accounts.length - 1}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
