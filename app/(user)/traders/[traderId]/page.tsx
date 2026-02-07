'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TradePost from '@/components/user/accounts/TradePost';
import { EquityCurve, TradeHistoryTable, MonthlyBreakdown } from '@/components/user/accounts';

// Mock trader data
const mockTrader = {
  id: 'trader1',
  username: 'sarah_fx',
  displayName: 'Sarah Chen',
  avatar: undefined,
  coverImage: undefined,
  bio: '📈 Full-time forex trader | 5+ years experience\n💰 Specializing in EUR/USD & GBP/USD\n🎯 Risk management focused | Max 2% per trade',
  location: 'Singapore',
  website: 'sarahfx.com',
  joinedDate: 'January 2024',
  isVerified: true,
  followers: 8900,
  following: 156,
  stats: {
    gain: 124.5,
    balance: 25680,
    winRate: 68,
    trades: 320,
    profitFactor: 2.4,
    avgWin: 125,
    avgLoss: 52,
    maxDrawdown: 8.5,
  },
};

const mockPosts = [
  {
    id: '1',
    trader: {
      id: 'trader1',
      username: 'sarah_fx',
      displayName: 'Sarah Chen',
      isVerified: true,
    },
    trade: {
      symbol: 'EURUSD',
      type: 'BUY' as const,
      profit: 245.50,
      pips: 48.5,
      entryPrice: 1.08520,
      exitPrice: 1.09005,
      duration: '2h 45m',
    },
    content: 'Caught this nice reversal at the support level 📈',
    likes: 124,
    comments: 18,
    shares: 5,
    timestamp: '2h ago',
  },
  {
    id: '2',
    trader: {
      id: 'trader1',
      username: 'sarah_fx',
      displayName: 'Sarah Chen',
      isVerified: true,
    },
    content: 'My morning routine:\n\n1. Check economic calendar\n2. Review overnight price action\n3. Mark key levels on 4H chart\n4. Wait for confirmation\n\nPatience is key! 🔑',
    likes: 89,
    comments: 32,
    shares: 12,
    timestamp: '1d ago',
  },
];

const mockEquityData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2026, 0, i + 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  balance: 20000 + Math.random() * 5000 + i * 100,
  equity: 20000 + Math.random() * 4800 + i * 98,
}));

type ProfileTab = 'posts' | 'trades' | 'stats' | 'likes';

export default function TraderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const traderId = params.traderId as string;

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: 'posts', label: 'Posts' },
    { id: 'trades', label: 'Trades' },
    { id: 'stats', label: 'Statistics' },
    { id: 'likes', label: 'Likes' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-4 h-14">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="font-bold text-[#1a1a1d]">{mockTrader.displayName}</h1>
              <p className="text-xs text-gray-500">{mockTrader.stats.trades} trades</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile header */}
      <div className="bg-white border-b border-gray-200">
        {/* Cover image */}
        <div className="h-32 sm:h-48 bg-gradient-to-r from-[#c9a227] via-[#d4af37] to-[#f0d78c]" />

        <div className="max-w-3xl mx-auto px-4">
          {/* Avatar & Follow button row */}
          <div className="flex justify-between items-end -mt-16 sm:-mt-20 mb-4">
            {/* Avatar */}
            <div className="relative">
              {mockTrader.avatar ? (
                <img
                  src={mockTrader.avatar}
                  alt={mockTrader.displayName}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#c9a227] to-[#f0d78c] flex items-center justify-center text-white text-4xl sm:text-5xl font-bold border-4 border-white shadow-lg">
                  {mockTrader.displayName.charAt(0)}
                </div>
              )}
              {mockTrader.isVerified && (
                <div className="absolute bottom-1 right-1 w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center border-3 border-white">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pb-2">
              <button className="p-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
              <button className="p-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={handleFollow}
                className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${
                  isFollowing
                    ? 'bg-white border border-gray-300 text-[#1a1a1d] hover:border-red-300 hover:text-red-600 hover:bg-red-50'
                    : 'bg-[#1a1a1d] text-white hover:bg-[#2a2a2d]'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>

          {/* Profile info */}
          <div className="pb-4">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-[#1a1a1d]">{mockTrader.displayName}</h2>
            </div>
            <p className="text-gray-500 mb-3">@{mockTrader.username}</p>

            {/* Bio */}
            <p className="text-[#1a1a1d] whitespace-pre-wrap mb-3">{mockTrader.bio}</p>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mb-4">
              {mockTrader.location && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {mockTrader.location}
                </span>
              )}
              {mockTrader.website && (
                <a href={`https://${mockTrader.website}`} className="flex items-center gap-1 text-[#c9a227] hover:underline">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {mockTrader.website}
                </a>
              )}
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Joined {mockTrader.joinedDate}
              </span>
            </div>

            {/* Follower stats */}
            <div className="flex items-center gap-4 text-sm">
              <Link href="#" className="hover:underline">
                <span className="font-bold text-[#1a1a1d]">{mockTrader.following.toLocaleString()}</span>
                <span className="text-gray-500"> Following</span>
              </Link>
              <Link href="#" className="hover:underline">
                <span className="font-bold text-[#1a1a1d]">{mockTrader.followers.toLocaleString()}</span>
                <span className="text-gray-500"> Followers</span>
              </Link>
            </div>
          </div>

          {/* Performance banner */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">+{mockTrader.stats.gain}%</div>
              <div className="text-xs text-gray-500">Total Gain</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#1a1a1d]">{mockTrader.stats.winRate}%</div>
              <div className="text-xs text-gray-500">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#1a1a1d]">{mockTrader.stats.profitFactor}</div>
              <div className="text-xs text-gray-500">Profit Factor</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{mockTrader.stats.maxDrawdown}%</div>
              <div className="text-xs text-gray-500">Max DD</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 -mx-4 px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${
                  activeTab === tab.id ? 'text-[#1a1a1d]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#c9a227] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {mockPosts.map((post) => (
              <TradePost key={post.id} {...post} />
            ))}
          </div>
        )}

        {activeTab === 'trades' && (
          <div className="bg-white rounded-2xl border border-gray-200">
            <TradeHistoryTable
              trades={Array.from({ length: 20 }, (_, i) => ({
                id: `trade-${i}`,
                ticket: 1000000 + i,
                symbol: ['EURUSD', 'GBPUSD', 'XAUUSD'][Math.floor(Math.random() * 3)],
                type: Math.random() > 0.5 ? 'BUY' : 'SELL' as 'BUY' | 'SELL',
                volume: Math.round(Math.random() * 100) / 100 + 0.01,
                openPrice: 1.08 + Math.random() * 0.02,
                closePrice: 1.08 + Math.random() * 0.02,
                profit: Math.random() > 0.4 ? Math.random() * 200 : -Math.random() * 100,
                pips: Math.random() > 0.4 ? Math.random() * 50 : -Math.random() * 30,
                openTime: '2026-01-15 10:30',
                closeTime: '2026-01-15 14:45',
                duration: `${Math.floor(Math.random() * 8)}h ${Math.floor(Math.random() * 60)}m`,
              }))}
            />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <EquityCurve data={mockEquityData} />
            <MonthlyBreakdown
              data={[
                { year: 2026, month: 1, monthName: 'Jan', profit: 850, gainPercent: 8.5, trades: 24, winRate: 71 },
                { year: 2025, month: 12, monthName: 'Dec', profit: 1200, gainPercent: 12.0, trades: 32, winRate: 68 },
                { year: 2025, month: 11, monthName: 'Nov', profit: -350, gainPercent: -3.5, trades: 18, winRate: 44 },
                { year: 2025, month: 10, monthName: 'Oct', profit: 920, gainPercent: 9.2, trades: 28, winRate: 64 },
              ]}
            />
          </div>
        )}

        {activeTab === 'likes' && (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p>No likes yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
