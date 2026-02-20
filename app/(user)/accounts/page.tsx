'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/shared';
import CreatePost from '@/components/user/accounts/CreatePost';
import TradePost, { TradePostSkeleton } from '@/components/user/accounts/TradePost';
import TrendingSection from '@/components/user/accounts/TrendingSection';
import WhoToFollow from '@/components/user/accounts/WhoToFollow';
import ActivityFeed from '@/components/user/accounts/ActivityFeed';
import MyAccountsHub from '@/components/user/accounts/MyAccountsHub';
import ConnectAccountModal from '@/components/user/accounts/ConnectAccountModal';
import { AccountsContent } from '@/components/user/mytrading';

// MT5 Account interface
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

// Mock data
const mockPosts = [
  {
    id: '1',
    trader: {
      id: 'trader1',
      username: 'sarah_fx',
      displayName: 'Sarah Chen',
      avatar: undefined,
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
    content: 'Caught this nice reversal at the support level. The 4H candle gave a clear signal 📈',
    likes: 124,
    comments: 18,
    shares: 5,
    isLiked: false,
    timestamp: '2h ago',
  },
  {
    id: '2',
    trader: {
      id: 'trader2',
      username: 'mike_trades',
      displayName: 'Mike Johnson',
      isVerified: false,
    },
    content: 'My thoughts on Gold this week: Still bullish overall, but expecting a pullback to 2020 level before continuation. Will be looking for entries there. What do you think? 🤔\n\nKey levels:\n• Support: 2020, 2000\n• Resistance: 2065, 2080',
    likes: 89,
    comments: 32,
    shares: 12,
    isLiked: true,
    timestamp: '4h ago',
  },
  {
    id: '3',
    trader: {
      id: 'trader3',
      username: 'gold_sniper',
      displayName: 'Alex Gold',
      isVerified: true,
    },
    trade: {
      symbol: 'XAUUSD',
      type: 'SELL' as const,
      profit: -85.20,
      pips: -12.5,
      entryPrice: 2045.50,
      exitPrice: 2058.00,
      duration: '45m',
    },
    content: 'Took the loss on this one. Got stopped out on the spike. Risk management saved me - only 1% risk on this trade.',
    likes: 56,
    comments: 24,
    shares: 3,
    isLiked: false,
    timestamp: '6h ago',
  },
  {
    id: '4',
    trader: {
      id: 'trader4',
      username: 'jenny_pips',
      displayName: 'Jenny Williams',
      isVerified: true,
    },
    trade: {
      symbol: 'GBPJPY',
      type: 'BUY' as const,
      profit: 520.00,
      pips: 85.0,
      entryPrice: 188.250,
      exitPrice: 189.100,
      duration: '1d 4h',
    },
    content: '🎯 Target hit! This was my swing trade from Monday. Patience pays off!',
    likes: 312,
    comments: 45,
    shares: 28,
    isLiked: false,
    timestamp: '8h ago',
  },
];

const mockTrendingTraders = [
  {
    id: 't1',
    username: 'jenny_pips',
    displayName: 'Jenny Williams',
    isVerified: true,
    gain: 156.8,
    winRate: 72,
    followers: 12500,
    following: 89,
    trades: 450,
  },
  {
    id: 't2',
    username: 'sarah_fx',
    displayName: 'Sarah Chen',
    isVerified: true,
    gain: 124.5,
    winRate: 68,
    followers: 8900,
    following: 156,
    trades: 320,
  },
  {
    id: 't3',
    username: 'gold_sniper',
    displayName: 'Alex Gold',
    isVerified: true,
    gain: 98.2,
    winRate: 65,
    followers: 6700,
    following: 45,
    trades: 580,
  },
];

const mockSuggestions = [
  {
    id: 's1',
    username: 'pro_scalper',
    displayName: 'David Miller',
    bio: 'Scalping EUR/USD & GBP/USD | 5+ years experience',
    isVerified: true,
    gain: 45.2,
    winRate: 71,
    followers: 3200,
    following: 120,
    trades: 1200,
    mutualFollowers: ['Sarah Chen', 'Mike Johnson'],
  },
  {
    id: 's2',
    username: 'swing_master',
    displayName: 'Emma Roberts',
    bio: 'Swing trader | Technical analysis focused',
    isVerified: false,
    gain: 67.8,
    winRate: 58,
    followers: 1800,
    following: 89,
    trades: 156,
    reason: 'Popular in your network',
  },
  {
    id: 's3',
    username: 'crypto_fx',
    displayName: 'Chris Lee',
    bio: 'Forex + Crypto | Risk management guru',
    isVerified: true,
    gain: 89.4,
    winRate: 62,
    followers: 5600,
    following: 234,
    trades: 890,
  },
];

const mockActivities = [
  {
    id: 'a1',
    type: 'trade_closed' as const,
    trader: { id: 't1', displayName: 'Jenny Williams', isVerified: true },
    data: { profit: 520, symbol: 'GBPJPY' },
    timestamp: '2m ago',
  },
  {
    id: 'a2',
    type: 'milestone' as const,
    trader: { id: 't2', displayName: 'Sarah Chen', isVerified: true },
    data: { milestone: '100% total gain' },
    timestamp: '15m ago',
  },
  {
    id: 'a3',
    type: 'followed' as const,
    trader: { id: 't3', displayName: 'Alex Gold', isVerified: true },
    data: { followedId: 't1', followedName: 'Jenny Williams' },
    timestamp: '1h ago',
  },
  {
    id: 'a4',
    type: 'trade_closed' as const,
    trader: { id: 't4', displayName: 'Mike Johnson' },
    data: { profit: -45, symbol: 'EURUSD' },
    timestamp: '2h ago',
  },
  {
    id: 'a5',
    type: 'like' as const,
    trader: { id: 't5', displayName: 'Emma Roberts' },
    data: { traderId: 't2', traderName: 'Sarah Chen' },
    timestamp: '3h ago',
  },
];

type FeedTab = 'for-you' | 'following';

// Mock MT5 Accounts for UI development/fallback
const mockMT5Accounts: MT5Account[] = [
  {
    id: 1,
    account_number: '55667788',
    server: 'FBS-Real',
    platform: 'MT5',
    status: 'active',
    balance: 10542.50,
    equity: 10620.00,
    profit: 542.50,
    ea_status: 'active'
  },
  {
    id: 2,
    account_number: '12345678',
    server: 'FTMO-Demo',
    platform: 'MT5',
    status: 'active',
    balance: 100000.00,
    equity: 102450.00,
    profit: 2450.00,
    ea_status: 'active'
  },
  {
    id: 3,
    account_number: '99887766',
    server: 'ICMarkets-Live',
    platform: 'MT5',
    status: 'pending',
    balance: 5000.00,
    equity: 5000.00,
    profit: 0.00,
    ea_status: 'inactive'
  }
];

export default function SocialFeedPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FeedTab>('for-you');
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState(mockPosts);
  const [showConnectModal, setShowConnectModal] = useState(false);

  // MT5 AccountsContent state - Initialize with mock data to prevent empty state in dev
  const [mt5Accounts, setMt5Accounts] = useState<MT5Account[]>(mockMT5Accounts);
  const [selectedAccountForAnalytics, setSelectedAccountForAnalytics] = useState<MT5Account | null>(null);

  // Fetch MT5 accounts
  const fetchMT5Accounts = useCallback(async () => {
    try {
      const res = await fetch('/api/mt5/connect');
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        setMt5Accounts(data.data);
        // Auto-select first active account
        const activeAccount = data.data.find((a: MT5Account) => a.status === 'active');
        if (activeAccount && !selectedAccountForAnalytics) {
          setSelectedAccountForAnalytics(activeAccount);
        }
      }
      // If API returns empty, keep using mock data if we have it (or clear it if that's desired behavior)
      // For now, let's presume we want to see something if the DB is empty.
    } catch (err) {
      console.error('Error fetching MT5 accounts:', err);
    }
  }, [selectedAccountForAnalytics]);

  useEffect(() => {
    fetchMT5Accounts();
  }, [fetchMT5Accounts]);

  const handlePost = (data: { content: string; trade?: any }) => {
    console.log('New post:', data);
  };

  const handleFollow = (id: string) => {
    console.log('Follow:', id);
  };

  const handleViewProfile = (id: string) => {
    router.push(`/traders/${id}`);
  };

  const handleConnectAccount = async (data: any) => {
    try {
      const res = await fetch('/api/mt5/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_number: data.login,
          server: data.server,
          platform: 'MT5',
          password: data.password || data.investorPassword,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setShowConnectModal(false);
        fetchMT5Accounts();
      } else {
        console.error('Failed to connect:', result.message);
      }
    } catch (err) {
      console.error('Error connecting account:', err);
    }
  };

  return (
    <>
      <ConnectAccountModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnect={handleConnectAccount}
      />
      <PageContainer variant="full">
        {/* Header - Twitter/X style */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between h-14">
              <h1 className="text-xl font-bold text-surface-dark">Feed</h1>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            {/* Feed tabs - For You / Following */}
            <div className="flex">
              <button
                onClick={() => setActiveTab('for-you')}
                className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${
                  activeTab === 'for-you' ? 'text-surface-dark' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                For You
                {activeTab === 'for-you' && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-primary-gold rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${
                  activeTab === 'following' ? 'text-surface-dark' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Following
                {activeTab === 'following' && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-primary-gold rounded-full" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main content - 3 column layout */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          {/* MT5 Accounts Section - Full Width */}
          <div className="mb-6">
            <AccountsContent
              mt5Accounts={mt5Accounts}
              selectedAccountForAnalytics={selectedAccountForAnalytics}
              setSelectedAccountForAnalytics={setSelectedAccountForAnalytics}
              fetchMT5Accounts={fetchMT5Accounts}
              onOpenConnectModal={() => setShowConnectModal(true)}
            />
          </div>

          <div className="flex gap-6">
            
            {/* Main Feed Column */}
            <div className="flex-1 max-w-[600px] space-y-4">
              {/* Create post */}
              <CreatePost onPost={handlePost} />

              {/* Posts feed */}
              {loading ? (
                <>
                  <TradePostSkeleton />
                  <TradePostSkeleton />
                  <TradePostSkeleton />
                </>
              ) : (
                posts.map((post) => (
                  <TradePost
                    key={post.id}
                    {...post}
                    onLike={(id) => console.log('Like:', id)}
                    onComment={(id) => console.log('Comment:', id)}
                    onShare={(id) => console.log('Share:', id)}
                    onBookmark={(id) => console.log('Bookmark:', id)}
                  />
                ))
              )}

              {/* Load more */}
              <button className="w-full py-4 text-primary-gold font-medium hover:bg-white rounded-2xl transition-colors">
                Load more posts
              </button>
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block w-[340px] space-y-4">
              {/* My Portfolio Widget */}
              <MyAccountsHub
                onAddAccount={() => setShowConnectModal(true)}
                onEditAccount={(account) => console.log('Edit:', account)}
                onDisconnectAccount={(id) => console.log('Disconnect:', id)}
                onRefreshAccount={(id) => console.log('Refresh:', id)}
              />

              {/* Search */}
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search traders..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-gold/30 focus:bg-white transition-all"
                />
              </div>

              {/* Trending Traders */}
              <TrendingSection
                traders={mockTrendingTraders}
                onFollow={handleFollow}
                onViewProfile={handleViewProfile}
              />

              {/* Who to follow */}
              <WhoToFollow
                suggestions={mockSuggestions}
                onFollow={handleFollow}
                onViewProfile={handleViewProfile}
                onDismiss={(id) => console.log('Dismiss:', id)}
              />

              {/* Activity */}
              <ActivityFeed activities={mockActivities} />

              {/* Footer links */}
              <div className="px-4 text-xs text-gray-400">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <a href="#" className="hover:underline">Terms</a>
                  <a href="#" className="hover:underline">Privacy</a>
                  <a href="#" className="hover:underline">Help</a>
                  <a href="#" className="hover:underline">About</a>
                </div>
                <p className="mt-2">© 2026 AU Trading</p>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
