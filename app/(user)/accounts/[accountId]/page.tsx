'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SectionHeader, PageContainer } from '@/components/shared';
import {
  AccountHeader,
  AccountStatsCard,
  EquityCurve,
  TradeHistoryTable,
  MonthlyBreakdown,
  SymbolBreakdown,
  AccountComments,
} from '@/components/user/accounts';

// Mock data - will be replaced with API calls
const mockAccountData = {
  id: '1',
  accountName: 'My FTMO Challenge',
  accountNumber: '12345678',
  broker: 'FTMO',
  isVerified: true,
  isPublic: true,
  lastSync: '2 minutes ago',
  status: 'active' as const,
  followers: 1234,
  isFollowing: false,
  isOwner: true,
};

const mockStats = {
  gain: 124.5,
  balance: 12450.0,
  equity: 12380.5,
  drawdown: 8.2,
  winRate: 68,
  profitFactor: 2.4,
  totalTrades: 156,
  avgWin: 85.0,
  avgLoss: 42.0,
  bestTrade: 450.0,
  worstTrade: -180.0,
  avgRR: 2.0,
  avgDuration: '4h 23m',
  totalPips: 1250.5,
  totalLots: 45.6,
};

const mockEquityData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2026, 0, i + 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  balance: 10000 + Math.random() * 2500 + i * 50,
  equity: 10000 + Math.random() * 2400 + i * 48,
}));

const mockTrades = Array.from({ length: 50 }, (_, i) => ({
  id: `trade-${i}`,
  ticket: 1000000 + i,
  symbol: ['EURUSD', 'GBPUSD', 'XAUUSD', 'USDJPY', 'GBPJPY'][Math.floor(Math.random() * 5)],
  type: Math.random() > 0.5 ? 'BUY' : 'SELL' as 'BUY' | 'SELL',
  volume: Math.round(Math.random() * 100) / 100 + 0.01,
  openPrice: 1.08 + Math.random() * 0.02,
  closePrice: 1.08 + Math.random() * 0.02,
  profit: Math.random() > 0.4 ? Math.random() * 200 : -Math.random() * 100,
  pips: Math.random() > 0.4 ? Math.random() * 50 : -Math.random() * 30,
  openTime: '2026-01-15 10:30',
  closeTime: '2026-01-15 14:45',
  duration: `${Math.floor(Math.random() * 8)}h ${Math.floor(Math.random() * 60)}m`,
}));

const mockMonthlyData = [
  { year: 2026, month: 1, monthName: 'Jan', profit: 850, gainPercent: 8.5, trades: 24, winRate: 71 },
  { year: 2025, month: 12, monthName: 'Dec', profit: 1200, gainPercent: 12.0, trades: 32, winRate: 68 },
  { year: 2025, month: 11, monthName: 'Nov', profit: -350, gainPercent: -3.5, trades: 18, winRate: 44 },
  { year: 2025, month: 10, monthName: 'Oct', profit: 920, gainPercent: 9.2, trades: 28, winRate: 64 },
  { year: 2025, month: 9, monthName: 'Sep', profit: 650, gainPercent: 6.5, trades: 22, winRate: 59 },
  { year: 2025, month: 8, monthName: 'Aug', profit: 480, gainPercent: 4.8, trades: 15, winRate: 73 },
  { year: 2025, month: 7, monthName: 'Jul', profit: -180, gainPercent: -1.8, trades: 12, winRate: 42 },
  { year: 2025, month: 6, monthName: 'Jun', profit: 1100, gainPercent: 11.0, trades: 30, winRate: 70 },
];

const mockSymbolData = [
  { symbol: 'EURUSD', trades: 45, winRate: 71, profit: 1250.5, pips: 425.0, lots: 15.2, avgDuration: '3h 45m' },
  { symbol: 'GBPUSD', trades: 32, winRate: 65, profit: 820.0, pips: 310.5, lots: 10.8, avgDuration: '4h 10m' },
  { symbol: 'XAUUSD', trades: 28, winRate: 68, profit: 1450.0, pips: 520.0, lots: 8.5, avgDuration: '5h 30m' },
  { symbol: 'USDJPY', trades: 25, winRate: 60, profit: -180.5, pips: -45.0, lots: 6.2, avgDuration: '2h 55m' },
  { symbol: 'GBPJPY', trades: 18, winRate: 72, profit: 680.0, pips: 180.0, lots: 4.5, avgDuration: '6h 20m' },
];

const mockComments = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Sarah Trader',
    content: 'Impressive consistency! What\'s your strategy for managing drawdown?',
    likes: 24,
    isLiked: false,
    createdAt: '2 hours ago',
    replies: [
      {
        id: '1-1',
        userId: 'owner',
        userName: 'Account Owner',
        content: 'Thanks! I use a strict 2% risk per trade and always set stop losses.',
        likes: 8,
        isLiked: true,
        createdAt: '1 hour ago',
      },
    ],
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Mike FX',
    content: 'Great performance on Gold trades! Are you using any specific indicators?',
    likes: 12,
    isLiked: false,
    createdAt: '5 hours ago',
  },
];

type TabType = 'overview' | 'trades' | 'monthly' | 'symbols';

export default function AccountProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isFollowing, setIsFollowing] = useState(mockAccountData.isFollowing);
  const [loading, setLoading] = useState(false);

  const accountId = params.accountId as string;

  const handleFollow = async () => {
    // API call would go here
    setIsFollowing(!isFollowing);
  };

  const handleShare = () => {
    // Share functionality
    if (navigator.share) {
      navigator.share({
        title: mockAccountData.accountName,
        text: `Check out this trading account with ${mockStats.gain}% gain!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleSettings = () => {
    router.push(`/accounts/${accountId}/settings`);
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'trades' as TabType, label: 'Trade History', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'monthly' as TabType, label: 'Monthly', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'symbols' as TabType, label: 'Symbols', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' },
  ];

  return (
    <PageContainer>
      <SectionHeader
        title="Account Profile"
        subtitle="View detailed trading performance and statistics"
        backLink="/accounts"
        backLabel="Back to Accounts"
      />

      <div className="space-y-6">
        {/* Account Header */}
        <AccountHeader
          {...mockAccountData}
          isFollowing={isFollowing}
          onFollow={handleFollow}
          onShare={handleShare}
          onSettings={handleSettings}
          loading={loading}
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <AccountStatsCard
            label="Total Gain"
            value={`${mockStats.gain >= 0 ? '+' : ''}${mockStats.gain}%`}
            trend={mockStats.gain >= 0 ? 'up' : 'down'}
            trendValue="this month"
            loading={loading}
          />
          <AccountStatsCard
            label="Balance"
            value={`$${mockStats.balance.toLocaleString()}`}
            loading={loading}
          />
          <AccountStatsCard
            label="Drawdown"
            value={`${mockStats.drawdown}%`}
            subtitle="Max"
            loading={loading}
          />
          <AccountStatsCard
            label="Win Rate"
            value={`${mockStats.winRate}%`}
            trend={mockStats.winRate >= 50 ? 'up' : 'down'}
            loading={loading}
          />
          <AccountStatsCard
            label="Profit Factor"
            value={mockStats.profitFactor.toFixed(2)}
            loading={loading}
          />
          <AccountStatsCard
            label="Total Trades"
            value={mockStats.totalTrades}
            loading={loading}
          />
        </div>

        {/* Tabs */}
        <div className="relative inline-flex items-center bg-amber-50/80 border border-[#f0d78c]/30 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#c9a227] to-[#d4af37] text-white shadow-md'
                  : 'text-gray-600 hover:text-[#1a1a1d]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Equity Curve */}
            <EquityCurve data={mockEquityData} loading={loading} />

            {/* Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Advanced Stats */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-[#c9a227] via-[#f0d78c] to-[#c9a227]" />
                <div className="p-6">
                  <h3 className="text-lg font-bold text-[#1a1a1d] mb-6">Advanced Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Avg Win</div>
                      <div className="text-lg font-bold text-green-600">${mockStats.avgWin}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Avg Loss</div>
                      <div className="text-lg font-bold text-red-600">${mockStats.avgLoss}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Best Trade</div>
                      <div className="text-lg font-bold text-green-600">+${mockStats.bestTrade}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Worst Trade</div>
                      <div className="text-lg font-bold text-red-600">${mockStats.worstTrade}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Avg R:R</div>
                      <div className="text-lg font-bold text-[#1a1a1d]">1:{mockStats.avgRR}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Avg Duration</div>
                      <div className="text-lg font-bold text-[#1a1a1d]">{mockStats.avgDuration}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Total Pips</div>
                      <div className="text-lg font-bold text-[#c9a227]">+{mockStats.totalPips}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Total Lots</div>
                      <div className="text-lg font-bold text-[#1a1a1d]">{mockStats.totalLots}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Trades Preview */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-[#c9a227] via-[#f0d78c] to-[#c9a227]" />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#1a1a1d]">Recent Trades</h3>
                    <button
                      onClick={() => setActiveTab('trades')}
                      className="text-sm text-[#c9a227] hover:underline"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {mockTrades.slice(0, 5).map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            trade.type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {trade.type}
                          </span>
                          <span className="font-medium text-[#1a1a1d]">{trade.symbol}</span>
                        </div>
                        <span className={`font-semibold ${trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <AccountComments
              comments={mockComments}
              loading={loading}
              onAddComment={(content) => console.log('Add comment:', content)}
              onLikeComment={(id) => console.log('Like comment:', id)}
              onReply={(id, content) => console.log('Reply to:', id, content)}
            />
          </div>
        )}

        {activeTab === 'trades' && (
          <TradeHistoryTable trades={mockTrades} loading={loading} />
        )}

        {activeTab === 'monthly' && (
          <MonthlyBreakdown data={mockMonthlyData} loading={loading} />
        )}

        {activeTab === 'symbols' && (
          <SymbolBreakdown data={mockSymbolData} loading={loading} />
        )}
      </div>
    </PageContainer>
  );
}
