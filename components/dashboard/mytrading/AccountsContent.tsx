'use client';

import { RefObject } from 'react';
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

interface MT5FormData {
  account_number: string;
  server: string;
  platform: string;
}

interface AccountsContentProps {
  mt5Accounts: MT5Account[];
  showMT5Form: boolean;
  setShowMT5Form: (show: boolean) => void;
  mt5Data: MT5FormData;
  setMt5Data: (data: MT5FormData) => void;
  mt5Submitting: boolean;
  handleMT5Submit: (e: React.FormEvent) => void;
  passwordRef: RefObject<HTMLInputElement | null>;
  selectedAccountForAnalytics: MT5Account | null;
  setSelectedAccountForAnalytics: (account: MT5Account | null) => void;
  fetchMT5Accounts: () => void;
}

export default function AccountsContent({
  mt5Accounts,
  showMT5Form,
  setShowMT5Form,
  mt5Data,
  setMt5Data,
  mt5Submitting,
  handleMT5Submit,
  passwordRef,
  selectedAccountForAnalytics,
  setSelectedAccountForAnalytics,
  fetchMT5Accounts,
}: AccountsContentProps) {
  return (
    <div className="p-6 space-y-6">
      {/* MT5 Connection Form */}
      {showMT5Form && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#1a1a1d]">Connect MT5 Account</h3>
            <button
              onClick={() => setShowMT5Form(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleMT5Submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Account Number</label>
                <input
                  type="text"
                  value={mt5Data.account_number}
                  onChange={(e) => setMt5Data({ ...mt5Data, account_number: e.target.value })}
                  placeholder="Enter account number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Server</label>
                <input
                  type="text"
                  value={mt5Data.server}
                  onChange={(e) => setMt5Data({ ...mt5Data, server: e.target.value })}
                  placeholder="e.g., Broker-Server"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  ref={passwordRef}
                  placeholder="Trading account password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  aria-label="MT5 account password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Platform</label>
                <select
                  value={mt5Data.platform}
                  onChange={(e) => setMt5Data({ ...mt5Data, platform: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                >
                  <option value="MT5">MetaTrader 5</option>
                  <option value="MT4">MetaTrader 4</option>
                </select>
              </div>
            </div>
            <div className="bg-amber-50 border border-[#f0d78c] rounded-xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-[#c9a227] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-700">Your credentials are encrypted and secure. Admin will review and activate your EA within 24 hours.</p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={mt5Submitting}
                className="flex-1 py-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                {mt5Submitting ? 'Submitting...' : 'Submit Connection Request'}
              </button>
              <button
                type="button"
                onClick={() => setShowMT5Form(false)}
                className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty State - No Accounts */}
      {!showMT5Form && mt5Accounts.length === 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-dashed border-[#f0d78c] p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-[#1a1a1d] mb-3">No MT5 Accounts Connected</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">Connect your MetaTrader 5 account to start automated trading with our Expert Advisors.</p>
          <button
            onClick={() => setShowMT5Form(true)}
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
      {!showMT5Form && mt5Accounts.length > 0 && (
        <div className="space-y-6">
          {/* Account Selector Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-[#1a1a1d]">My Accounts</h3>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {mt5Accounts.filter(a => a.status === 'active').map((account) => (
                  <button
                    key={account.id}
                    onClick={() => setSelectedAccountForAnalytics(account)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                      selectedAccountForAnalytics?.id === account.id
                        ? 'bg-white text-[#1a1a1d] shadow-sm'
                        : 'text-gray-500 hover:text-[#1a1a1d]'
                    }`}
                  >
                    #{account.account_number}
                  </button>
                ))}
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
                onClick={() => setShowMT5Form(true)}
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

          {/* Pending Accounts */}
          {mt5Accounts.filter(a => a.status !== 'active').length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-500">Pending Approval</h4>
              {mt5Accounts.filter(a => a.status !== 'active').map((account) => (
                <div key={account.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-[#1a1a1d]">#{account.account_number}</p>
                      <p className="text-xs text-gray-500">{account.server} · {account.platform}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                    Pending Review
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
