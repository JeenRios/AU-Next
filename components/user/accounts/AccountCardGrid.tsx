'use client';

import Link from 'next/link';

interface AccountCardProps {
  id: string;
  name: string;
  broker?: string;
  gain: number;
  balance: number;
  drawdown: number;
  winRate: number;
  trades: number;
  followers: number;
  isVerified?: boolean;
  lastUpdated?: string;
  rank?: number;
}

interface AccountCardGridProps {
  accounts?: AccountCardProps[];
  loading?: boolean;
  emptyMessage?: string;
}

export function AccountCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
      <div className="h-1 bg-gradient-to-r from-gray-200 to-gray-300" />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-xl" />
            <div>
              <div className="w-32 h-5 bg-gray-200 rounded mb-1" />
              <div className="w-20 h-3 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="w-16 h-6 bg-gray-200 rounded" />
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-2">
              <div className="w-12 h-3 bg-gray-200 rounded mb-1" />
              <div className="w-16 h-5 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="w-20 h-4 bg-gray-200 rounded" />
          <div className="w-24 h-8 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function AccountCard({
  id,
  name,
  broker,
  gain,
  balance,
  drawdown,
  winRate,
  trades,
  followers,
  isVerified,
  lastUpdated,
  rank,
}: AccountCardProps) {
  const isPositive = gain >= 0;

  return (
    <Link href={`/accounts/${id}`}>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:border-[#f0d78c]/50 transition-all cursor-pointer group">
        {/* Gold accent bar */}
        <div className={`h-1 bg-gradient-to-r ${isPositive ? 'from-green-400 to-green-500' : 'from-red-400 to-red-500'}`} />
        
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Rank badge (optional) */}
              {rank && (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                  rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                  rank === 2 ? 'bg-gray-100 text-gray-600' :
                  rank === 3 ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  {rank}
                </div>
              )}
              
              {/* Account icon */}
              <div className="w-12 h-12 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-xl flex items-center justify-center shadow-md shadow-[#c9a227]/10 group-hover:shadow-lg group-hover:shadow-[#c9a227]/20 transition-shadow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[#1a1a1d] group-hover:text-[#c9a227] transition-colors">{name}</h3>
                  {isVerified && (
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                {broker && <p className="text-xs text-gray-500">{broker}</p>}
              </div>
            </div>

            {/* Gain percentage */}
            <div className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{gain.toFixed(1)}%
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-500">Balance</div>
              <div className="font-semibold text-[#1a1a1d]">${balance.toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-500">Drawdown</div>
              <div className={`font-semibold ${drawdown <= 10 ? 'text-green-600' : drawdown <= 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                {drawdown.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-500">Win Rate</div>
              <div className={`font-semibold ${winRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                {winRate.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 text-gray-500">
              <span>{trades} trades</span>
              <span>•</span>
              <span>{followers} followers</span>
            </div>
            <div className="text-[#c9a227] font-medium text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              View Details →
            </div>
          </div>

          {lastUpdated && (
            <div className="mt-2 text-xs text-gray-400">
              Updated {lastUpdated}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function AccountCardGrid({ accounts, loading, emptyMessage = 'No accounts found' }: AccountCardGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <AccountCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{emptyMessage}</h3>
        <p className="text-gray-500">Connect your MT5 account to start tracking performance</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {accounts.map((account, index) => (
        <AccountCard key={account.id} {...account} rank={index < 3 ? index + 1 : undefined} />
      ))}
    </div>
  );
}
