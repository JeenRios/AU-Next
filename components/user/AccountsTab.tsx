'use client';

import { useState } from 'react';
import { SectionHeader } from '@/components/shared';
import { PageContainer } from '@/components/shared';
import { ContentTabIcons } from '@/components/shared/ui/ContentTabs';
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

interface AccountsTabProps {
  mt5Accounts: MT5Account[];
  fetchMT5Accounts: () => void;
  onConnectAccount: (data: any) => void;
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
];

const accountsTabs = [
  { 
    id: 'feed', 
    label: 'Community Feed', 
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ContentTabIcons.trending} /></svg> 
  },
  { 
    id: 'accounts', 
    label: 'My Accounts', 
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ContentTabIcons.accounts} /></svg> 
  },
  { 
    id: 'activity', 
    label: 'Activity', 
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ContentTabIcons.history} /></svg> 
  },
];

export default function AccountsTab({ mt5Accounts, fetchMT5Accounts, onConnectAccount }: AccountsTabProps) {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [feedTab, setFeedTab] = useState<'for-you' | 'following'>('for-you');
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState(mockPosts);

  const handlePost = (data: { content: string; trade?: any }) => {
    console.log('New post:', data);
  };

  const handleFollow = (id: string) => {
    console.log('Follow:', id);
  };

  const handleViewProfile = (id: string) => {
    // In a real app, this would navigate to the profile
    console.log('View profile:', id);
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleComment = (id: string) => {
    console.log('Comment on post:', id);
  };

  const handleShare = (postId: string) => {
    console.log('Share post:', postId);
  };

  const renderContent = (activeTab: string) => {
    switch (activeTab) {
      case 'feed':
        return (
          <div className="space-y-6">
            {/* Create Post */}
            <CreatePost onPost={handlePost} />
            
            {/* Feed Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Feed */}
              <div className="lg:col-span-2 space-y-4">
                {/* Feed Sub-tabs */}
                <div className="bg-white rounded-2xl border border-gray-200 p-1">
                  <div className="flex">
                    <button
                      onClick={() => setFeedTab('for-you')}
                      className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl transition-all ${
                        feedTab === 'for-you' 
                          ? 'bg-primary-gold text-white shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      For You
                    </button>
                    <button
                      onClick={() => setFeedTab('following')}
                      className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl transition-all ${
                        feedTab === 'following' 
                          ? 'bg-primary-gold text-white shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Following
                    </button>
                  </div>
                </div>

                {/* Posts */}
                <div className="space-y-4">
                  {loading ? (
                    <>
                      <TradePostSkeleton />
                      <TradePostSkeleton />
                      <TradePostSkeleton />
                    </>
                  ) : (
                    posts.map(post => (
                      <TradePost
                        key={post.id}
                        id={post.id}
                        trader={post.trader}
                        trade={post.trade}
                        content={post.content}
                        image={(post as any).image}
                        likes={post.likes}
                        comments={post.comments}
                        shares={post.shares}
                        isLiked={post.isLiked}
                        isBookmarked={(post as any).isBookmarked}
                        timestamp={post.timestamp}
                        onLike={handleLike}
                        onComment={handleComment}
                        onShare={handleShare}
                        onBookmark={(id) => console.log('Bookmark:', id)}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <TrendingSection
                  traders={mockTrendingTraders}
                  onFollow={handleFollow}
                  onViewProfile={handleViewProfile}
                />
                <WhoToFollow
                  suggestions={mockSuggestions}
                  onFollow={handleFollow}
                  onViewProfile={handleViewProfile}
                  onDismiss={(id) => console.log('Dismiss:', id)}
                />
                <ActivityFeed activities={mockActivities} />
              </div>
            </div>
          </div>
        );

      case 'accounts':
        return (
          <div className="space-y-6">
            <AccountsContent
              mt5Accounts={mt5Accounts}
              selectedAccountForAnalytics={null}
              setSelectedAccountForAnalytics={() => {}}
              fetchMT5Accounts={fetchMT5Accounts}
              onOpenConnectModal={() => setShowConnectModal(true)}
            />
          </div>
        );

      case 'activity':
        return (
          <div className="space-y-6">
            <ActivityFeed activities={mockActivities} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <ConnectAccountModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnect={onConnectAccount}
      />
      
      <PageContainer
        tabs={accountsTabs}
        defaultTab="feed"
        title="Accounts"
        subtitle="Manage your trading accounts and community activity"
        className="h-full"
      >
        {(activeTab: string) => renderContent(activeTab)}
      </PageContainer>
    </>
  );
}
