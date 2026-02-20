'use client';

import TraderProfileCard from './TraderProfileCard';

interface TrendingTrader {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  isVerified?: boolean;
  gain: number;
  winRate: number;
  followers: number;
  following: number;
  trades: number;
  isFollowing?: boolean;
}

interface TrendingSectionProps {
  traders?: TrendingTrader[];
  loading?: boolean;
  onFollow?: (id: string) => void;
  onViewProfile?: (id: string) => void;
}

export default function TrendingSection({ traders, loading, onFollow, onViewProfile }: TrendingSectionProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="w-32 h-5 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="p-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="w-24 h-4 bg-gray-200 rounded mb-1" />
                <div className="w-16 h-3 bg-gray-200 rounded" />
              </div>
              <div className="w-16 h-8 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!traders || traders.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#c9a227]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
          </svg>
          <h3 className="font-bold text-[#1a1a1d]">Trending Traders</h3>
        </div>
      </div>
      <div className="p-2">
        {traders.map((trader, index) => (
          <div key={trader.id} className="relative">
            {/* Rank badge */}
            {index < 3 && (
              <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                index === 0 ? 'bg-yellow-400 text-yellow-900' :
                index === 1 ? 'bg-gray-300 text-gray-700' :
                'bg-orange-400 text-orange-900'
              }`}>
                {index + 1}
              </div>
            )}
            <div className={index < 3 ? 'pl-6' : ''}>
              <TraderProfileCard
                {...trader}
                size="sm"
                onFollow={onFollow}
                onViewProfile={onViewProfile}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-gray-100">
        <button className="w-full py-2 text-sm text-primary-gold hover:bg-primary-gold/10 rounded-lg font-medium transition-colors">
          See all trending
        </button>
      </div>
    </div>
  );
}
