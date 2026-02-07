'use client';

import TradingAnalytics from '../TradingAnalytics';

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

interface AccountsContentProps {
  mt5Accounts: MT5Account[];
  selectedAccountForAnalytics: MT5Account | null;
  setSelectedAccountForAnalytics: (account: MT5Account | null) => void;
  fetchMT5Accounts: () => void;
  onOpenConnectModal: () => void;
}

export default function AccountsContent({
  mt5Accounts,
  selectedAccountForAnalytics,
  setSelectedAccountForAnalytics,
  fetchMT5Accounts,
  onOpenConnectModal,
}: AccountsContentProps) {
  return (
    <div className="space-y-6">
      {/* Empty State - No Accounts */}
      {mt5Accounts.length === 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-dashed border-[#f0d78c] p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-[#1a1a1d] mb-3">No MT5 Accounts Connected</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">Connect your MetaTrader 5 account to start automated trading with our Expert Advisors.</p>
          <button
            onClick={onOpenConnectModal}
            className="px-8 py-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Connect MT5 Account
          </button>
        </div>
      )}

      {/* Connected Accounts */}
      {mt5Accounts.length > 0 && (
        <div className="space-y-6">
          {/* Account Selector Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-[#1a1a1d]">My Accounts</h3>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
                {mt5Accounts
                  .sort((a, b) => (a.status === 'active' ? -1 : 1))
                  .map((account) => {
                    if (account.status === 'active') {
                      return (
                        <button
                          key={account.id}
                          onClick={() => setSelectedAccountForAnalytics(account)}
                          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                            selectedAccountForAnalytics?.id === account.id
                              ? 'bg-white text-[#1a1a1d] shadow-sm'
                              : 'text-gray-500 hover:text-[#1a1a1d]'
                          }`}
                        >
                          #{account.account_number}
                        </button>
                      );
                    }
                    return (
                      <div
                        key={account.id}
                        className="px-3 py-1.5 text-sm font-medium text-amber-600 bg-amber-50 rounded-md flex items-center gap-1.5 cursor-help border border-amber-100 whitespace-nowrap"
                        title="Pending Approval"
                      >
                        <span>#{account.account_number}</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    );
                  })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchMT5Accounts}
                className="p-2 text-gray-500 hover:text-[#c9a227] hover:bg-amber-50 rounded-lg transition-colors"
                title="Refresh"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={onOpenConnectModal}
                className="px-4 py-2 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add
              </button>
            </div>
          </div>

          {/* Trading Analytics - Show for selected or first active account */}
          {(selectedAccountForAnalytics || mt5Accounts.find(a => a.status === 'active')) && (
            <TradingAnalytics
              accountId={(selectedAccountForAnalytics || mt5Accounts.find(a => a.status === 'active'))?.id}
              accountNumber={(selectedAccountForAnalytics || mt5Accounts.find(a => a.status === 'active'))?.account_number}
            />
          )}


        </div>
      )}
    </div>
  );
}
