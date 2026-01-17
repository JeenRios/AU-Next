'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { Sidebar, StatsCard, PerformanceChart, RecentActivity, NotificationsPanel, QuickActions, QuickActionIcons, ErrorState } from '@/components/dashboard';
import { useDashboardData } from '@/lib/hooks/useFetch';
import MT5AccountStatus from '@/components/dashboard/MT5AccountStatus';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'my-trading' | 'community' | 'settings'>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { showToast, ToastContainer } = useToast();
  
  // MT5 and EA Management
  const [showMT5Form, setShowMT5Form] = useState(false);
  const [mt5Accounts, setMt5Accounts] = useState<any[]>([]);
  const [mt5Submitting, setMt5Submitting] = useState(false);
  const [mt5Data, setMt5Data] = useState({
    account_number: '',
    server: '',
    platform: 'MT5'
  });
  const passwordRef = useRef<HTMLInputElement | null>(null);
  
  // Performance filters
  const [performanceFilter, setPerformanceFilter] = useState<'all' | 'profit' | 'loss'>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  
  // Profile edit
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: ''
  });

  // Community/Social
  const [newPost, setNewPost] = useState('');
  const [communityPosts, setCommunityPosts] = useState<any[]>([
    {
      id: 1,
      user: { name: 'Alex Trader', avatar: 'A', verified: true },
      content: 'Just hit my monthly target! 🎯 XAUUSD has been treating me well this week. Remember: patience is key in trading!',
      image: null,
      profit: '+$2,450',
      likes: 24,
      comments: 8,
      liked: false,
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      user: { name: 'Sarah Gold', avatar: 'S', verified: true },
      content: 'New strategy working great! Sharing my GBPUSD analysis for those interested 📊',
      image: null,
      profit: '+$890',
      likes: 45,
      comments: 12,
      liked: true,
      timestamp: '4 hours ago'
    },
    {
      id: 3,
      user: { name: 'Mike Reynolds', avatar: 'M', verified: false },
      content: 'Learning from my losses today. Down $150 on EURUSD but the lesson was worth more than that. Stay humble! 💪',
      image: null,
      profit: '-$150',
      likes: 67,
      comments: 23,
      liked: false,
      timestamp: '6 hours ago'
    }
  ]);
  const [leaderboard] = useState([
    { rank: 1, name: 'GoldMaster99', profit: '+$12,450', winRate: '78%', trades: 156 },
    { rank: 2, name: 'ForexQueen', profit: '+$9,230', winRate: '72%', trades: 203 },
    { rank: 3, name: 'Alex Trader', profit: '+$8,100', winRate: '69%', trades: 178 },
    { rank: 4, name: 'TradingPro', profit: '+$6,890', winRate: '65%', trades: 142 },
    { rank: 5, name: 'Sarah Gold', profit: '+$5,670', winRate: '71%', trades: 98 },
  ]);

  // Use custom hook for data fetching with error handling
  const { data: dashboardData, loading: dataLoading, error: dataError, refetch } = useDashboardData();

  // Sample chart data (would come from API in production)
  const [chartData] = useState([
    { label: 'Mon', value: 120 },
    { label: 'Tue', value: -45 },
    { label: 'Wed', value: 230 },
    { label: 'Thu', value: 85 },
    { label: 'Fri', value: -30 },
    { label: 'Sat', value: 150 },
    { label: 'Sun', value: 95 },
  ]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(userData));
    fetchMT5Accounts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch MT5 accounts from API
  const fetchMT5Accounts = async () => {
    try {
      const res = await fetch('/api/mt5/connect');
      const data = await res.json();
      if (data.success && data.data) {
        setMt5Accounts(data.data);
      }
    } catch (err) {
      console.error('Error fetching MT5 accounts:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleMT5Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMt5Submitting(true);
    try {
      const res = await fetch('/api/mt5/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_number: mt5Data.account_number, server: mt5Data.server, platform: mt5Data.platform })
      });
      const data = await res.json();
      if (data?.success) {
        setShowMT5Form(false);
        setMt5Data({ account_number: '', server: '', platform: 'MT5' });
        if (passwordRef.current) passwordRef.current.value = '';
        showToast('MT5 account connection requested! Admin will review shortly.', 'success');
        // Refresh accounts list from API
        fetchMT5Accounts();
      } else {
        showToast(data?.error || data?.message || 'Failed to request MT5 connection.', 'error');
      }
    } catch (err) {
      console.error('MT5 connect error:', err);
      showToast('Error connecting MT5 account', 'error');
    } finally {
      setMt5Submitting(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileSidebarOpen) setMobileSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileSidebarOpen]);

  const toggleEA = (accountId: number) => {
    setMt5Accounts(mt5Accounts.map(acc => 
      acc.id === accountId 
        ? { ...acc, ea_status: acc.ea_status === 'active' ? 'inactive' : 'active' }
        : acc
    ));
  };

  // Derive data from hook
  const stats = dashboardData?.stats;
  const trades = dashboardData?.trades || [];
  const transactions = dashboardData?.transactions || [];
  const notifications = dashboardData?.notifications || [];

  const filteredTrades = trades.filter((trade: any) => {
    if (performanceFilter === 'all') return true;
    if (performanceFilter === 'profit') return trade.profit > 0;
    if (performanceFilter === 'loss') return trade.profit < 0;
    return true;
  });

  // Community functions
  const handleLikePost = (postId: number) => {
    setCommunityPosts(communityPosts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleCreatePost = () => {
    if (!newPost.trim()) return;
    
    const post = {
      id: Date.now(),
      user: { name: user?.name || 'Anonymous', avatar: user?.name?.charAt(0) || 'U', verified: false },
      content: newPost,
      image: null,
      profit: null,
      likes: 0,
      comments: 0,
      liked: false,
      timestamp: 'Just now'
    };
    
    setCommunityPosts([post, ...communityPosts]);
    setNewPost('');
  };

  // Show error state with retry
  if (dataError && !dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center p-8">
        <ErrorState message={dataError} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50 to-gray-50 flex">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#c9a227] focus:text-[#1a1a1d] focus:rounded-lg focus:font-semibold">
        Skip to main content
      </a>
      <ToastContainer />
      
      {/* Sidebar Component */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content */}
      <main id="main-content" className="flex-1 lg:ml-72 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-[#1a1a1d] mb-1 md:mb-2">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'my-trading' && 'My Trading'}
                {activeTab === 'community' && 'Community'}
                {activeTab === 'settings' && 'Settings'}
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                {activeTab === 'dashboard' && 'Monitor your trading activity and account status'}
                {activeTab === 'my-trading' && 'Manage your MT5 accounts and view trading performance'}
                {activeTab === 'community' && 'Connect with fellow traders, share insights, and learn together'}
                {activeTab === 'settings' && 'Manage your account, billing, and subscription settings'}
              </p>
            </div>
          </div>
          <button
            onClick={refetch}
            disabled={dataLoading}
            className="px-5 py-2.5 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a227]"
            aria-label="Refresh data"
          >
            <svg
              className={`w-5 h-5 ${dataLoading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {dataLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Key Metrics Grid - using StatsCard components */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Account Balance"
                value={`$${stats?.total_balance || '0.00'}`}
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                variant="gold"
                badge="Live"
                loading={dataLoading}
              />
              <StatsCard
                title="Total Trades"
                value={stats?.total_trades || 0}
                subtitle="+12% this month"
                icon={<svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                iconBg="bg-blue-50"
                loading={dataLoading}
              />
              <StatsCard
                title="Win Rate"
                value={`${stats?.win_rate || 0}%`}
                subtitle="Above average"
                icon={<svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                iconBg="bg-green-50"
                loading={dataLoading}
              />
              <StatsCard
                title="EA Status"
                value={mt5Accounts.filter(a => a.ea_status === 'active').length}
                subtitle={`of ${mt5Accounts.length} accounts`}
                icon={<svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>}
                iconBg="bg-purple-50"
                badge="Active"
                loading={dataLoading}
              />
            </div>

            {/* Performance Chart + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceChart data={chartData} loading={dataLoading} />
              <RecentActivity trades={trades} loading={dataLoading} />
            </div>

            {/* Quick Actions */}
            <QuickActions
              actions={[
                {
                  id: 'connect-mt5',
                  label: 'Connect MT5',
                  sublabel: 'Add trading account',
                  icon: QuickActionIcons.add,
                  iconBg: 'bg-gradient-to-br from-[#c9a227] to-[#f0d78c]',
                  variant: 'primary',
                  onClick: () => setActiveTab('my-trading'),
                },
                {
                  id: 'view-analytics',
                  label: 'View Analytics',
                  sublabel: 'Performance charts',
                  icon: QuickActionIcons.analytics,
                  iconBg: 'bg-blue-50',
                  onClick: () => setActiveTab('my-trading'),
                },
                {
                  id: 'manage-plan',
                  label: 'Manage Plan',
                  sublabel: 'Billing & subscription',
                  icon: QuickActionIcons.billing,
                  iconBg: 'bg-green-50',
                  onClick: () => setActiveTab('settings'),
                },
              ]}
            />

            {/* Notifications Section */}
            <NotificationsPanel notifications={notifications} loading={dataLoading} />
          </div>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <div className="grid grid-cols-12 gap-6">
            {/* Main Feed Column */}
            <div className="col-span-12 lg:col-span-8 space-y-4">
              {/* Create Post */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c9a227] to-[#f0d78c] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="Share your trading insights, wins, or lessons learned..."
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c9a227] focus:border-transparent resize-none h-24"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-2">
                        <button className="p-2 text-gray-500 hover:text-[#c9a227] hover:bg-amber-50 rounded-lg transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button className="p-2 text-gray-500 hover:text-[#c9a227] hover:bg-amber-50 rounded-lg transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={handleCreatePost}
                        disabled={!newPost.trim()}
                        className="px-6 py-2 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all disabled:opacity-50"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feed Posts */}
              {communityPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  {/* Post Header */}
                  <div className="p-5 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c9a227] to-[#f0d78c] flex items-center justify-center text-white font-bold">
                      {post.user.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#1a1a1d]">{post.user.name}</span>
                        {post.user.verified && (
                          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{post.timestamp}</div>
                    </div>
                    {post.profit && (
                      <div className={`px-4 py-2 rounded-xl font-bold ${
                        post.profit.startsWith('+') 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {post.profit}
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="px-5 pb-4">
                    <p className="text-[#1a1a1d] text-base leading-relaxed">{post.content}</p>
                  </div>

                  {/* Post Actions */}
                  <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-6">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-2 transition-colors ${
                        post.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <svg className="w-5 h-5" fill={post.liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="font-medium">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-[#c9a227] transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="font-medium">{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-[#c9a227] transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      <span className="font-medium">Share</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              {/* Leaderboard */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sticky top-4">
                <h3 className="font-bold text-[#1a1a1d] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Top Traders This Month
                </h3>

                <div className="space-y-3">
                  {leaderboard.map((trader, idx) => (
                    <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      idx === 0 ? 'bg-gradient-to-r from-[#c9a227]/10 to-[#f0d78c]/10 border border-[#f0d78c]' :
                      idx === 1 ? 'bg-gray-100' :
                      idx === 2 ? 'bg-orange-50' : 'hover:bg-gray-50'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        idx === 0 ? 'bg-[#c9a227] text-white' :
                        idx === 1 ? 'bg-gray-400 text-white' :
                        idx === 2 ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {trader.rank}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-[#1a1a1d] text-sm">{trader.name}</div>
                        <div className="text-xs text-gray-500">{trader.trades} trades • {trader.winRate} win</div>
                      </div>
                      <div className="text-green-600 font-bold text-sm">{trader.profit}</div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-4 py-2.5 border border-[#c9a227] text-[#c9a227] hover:bg-amber-50 font-semibold rounded-xl transition-all text-sm">
                  View Full Leaderboard
                </button>
              </div>

              {/* Suggested Traders */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-bold text-[#1a1a1d] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Suggested to Follow
                </h3>

                <div className="space-y-3">
                  {[
                    { name: 'CryptoKing', followers: '2.5k', winRate: '75%' },
                    { name: 'GoldTrader_Pro', followers: '1.8k', winRate: '71%' },
                    { name: 'ForexMaster', followers: '3.2k', winRate: '68%' },
                  ].map((trader, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a227] to-[#f0d78c] flex items-center justify-center text-white font-bold">
                        {trader.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-[#1a1a1d] text-sm">{trader.name}</div>
                        <div className="text-xs text-gray-500">{trader.followers} followers • {trader.winRate} win</div>
                      </div>
                      <button className="px-3 py-1.5 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] text-xs font-semibold rounded-lg hover:shadow-md transition-all">
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Topics */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-bold text-[#1a1a1d] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Trending Topics
                </h3>

                <div className="space-y-2">
                  {['#XAUUSD', '#NFP', '#GoldTrading', '#ForexSignals', '#TradingPsychology'].map((topic, idx) => (
                    <button key={idx} className="w-full text-left px-3 py-2 hover:bg-amber-50 rounded-lg transition-colors">
                      <div className="font-semibold text-[#c9a227] text-sm">{topic}</div>
                      <div className="text-xs text-gray-500">{Math.floor(Math.random() * 500) + 100} posts today</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Trading Tab */}
        {activeTab === 'my-trading' && (
          <div className="space-y-6">
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
                      className="flex-1 py-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all"
                    >
                      Submit Connection Request
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

            {/* Add Account Button */}
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
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-[#1a1a1d]">Connected Accounts</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={fetchMT5Accounts}
                      className="p-2 text-gray-500 hover:text-[#c9a227] hover:bg-amber-50 rounded-lg transition-colors"
                      title="Refresh accounts"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setShowMT5Form(true)}
                      className="px-4 py-2 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all inline-flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Account
                    </button>
                  </div>
                </div>

                {/* Enhanced MT5 Account Cards */}
                <div className="space-y-6">
                  {mt5Accounts.map((account) => (
                    <MT5AccountStatus
                      key={account.id}
                      accountId={account.id}
                      onError={(msg) => showToast(msg, 'error')}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Legacy account cards removed - now using MT5AccountStatus component */}
            {/* The old toggleEA functionality is now handled automatically through the automation system */}
            {false && mt5Accounts.map((account: any) => (
              <div key={account.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-[#1a1a1d]">Account #{account.account_number}</div>
                      <div className="text-sm text-gray-600">{account.server}</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    account.status === 'active' ? 'bg-green-100 text-green-700' :
                    account.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {account.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Balance</div>
                    <div className="font-bold text-[#1a1a1d]">${(account.balance || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Equity</div>
                    <div className="font-bold text-[#1a1a1d]">${(account.equity || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Profit</div>
                    <div className={`font-bold ${(account.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(account.profit || 0) >= 0 ? '+' : ''}${(account.profit || 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    <span className="text-sm font-semibold text-purple-900">EA Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {account.ea_status === 'active' && (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-green-700">ACTIVE</span>
                      </>
                    )}
                    {account.ea_status === 'inactive' && (
                      <>
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="text-sm font-semibold text-gray-600">INACTIVE</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => toggleEA(account.id)}
                  disabled={account.status !== 'active'}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    account.ea_status === 'active'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {account.ea_status === 'active' ? 'Stop EA' : 'Start EA'}
                      </button>
                    </div>
                  ))}

            {/* Performance Section */}
            <div className="mt-8 space-y-6">
              {/* Filters */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">Filter:</span>
                  <button
                    onClick={() => setPerformanceFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      performanceFilter === 'all'
                        ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d]'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All Trades
                  </button>
                  <button
                    onClick={() => setPerformanceFilter('profit')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      performanceFilter === 'profit'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Profitable
                  </button>
                  <button
                    onClick={() => setPerformanceFilter('loss')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      performanceFilter === 'loss'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Loss
                  </button>
                </div>
                <div className="border-l border-gray-300 pl-4 flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">Period:</span>
                  <button
                    onClick={() => setDateRange('week')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      dateRange === 'week'
                        ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d]'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setDateRange('month')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      dateRange === 'month'
                        ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d]'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setDateRange('year')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      dateRange === 'year'
                        ? 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d]'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Year
                  </button>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="text-sm text-gray-600 mb-2">Total Profit/Loss</div>
                  <div className="text-3xl font-bold text-green-600">+$1,245.50</div>
                  <div className="text-xs text-gray-500 mt-1">+15.2% ROI</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="text-sm text-gray-600 mb-2">Win Rate</div>
                  <div className="text-3xl font-bold text-[#1a1a1d]">68.5%</div>
                  <div className="text-xs text-green-600 mt-1">Above average</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="text-sm text-gray-600 mb-2">Total Trades</div>
                  <div className="text-3xl font-bold text-[#1a1a1d]">{filteredTrades.length}</div>
                  <div className="text-xs text-gray-500 mt-1">This period</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="text-sm text-gray-600 mb-2">Avg Trade</div>
                  <div className="text-3xl font-bold text-[#1a1a1d]">$52.50</div>
                  <div className="text-xs text-green-600 mt-1">+8% vs last period</div>
                </div>
              </div>

              {/* Trades Table */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-4 px-6 text-gray-600 font-semibold">Trade ID</th>
                        <th className="text-left py-4 px-6 text-gray-600 font-semibold">Symbol</th>
                        <th className="text-left py-4 px-6 text-gray-600 font-semibold">Type</th>
                        <th className="text-left py-4 px-6 text-gray-600 font-semibold">Amount</th>
                        <th className="text-left py-4 px-6 text-gray-600 font-semibold">Price</th>
                        <th className="text-left py-4 px-6 text-gray-600 font-semibold">Profit/Loss</th>
                        <th className="text-left py-4 px-6 text-gray-600 font-semibold">Status</th>
                        <th className="text-left py-4 px-6 text-gray-600 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTrades.map((trade) => (
                        <tr key={trade.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6 font-mono text-sm text-gray-600">#{trade.id}</td>
                          <td className="py-4 px-6 font-semibold text-[#1a1a1d]">{trade.symbol}</td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              trade.type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {trade.type}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-semibold text-[#1a1a1d]">${parseFloat(trade.amount).toFixed(2)}</td>
                          <td className="py-4 px-6 text-gray-600">${parseFloat(trade.price).toFixed(4)}</td>
                          <td className="py-4 px-6">
                            <span className={`font-semibold ${trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {trade.profit >= 0 ? '+' : ''}{trade.profit ? `$${parseFloat(trade.profit).toFixed(2)}` : '-'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              trade.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {trade.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">{new Date(trade.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            {/* Account Information Section */}
            <div className="max-w-2xl">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <h2 className="text-2xl font-bold text-[#1a1a1d] mb-6">Account Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-[#1a1a1d] disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={user?.name || ''}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-[#1a1a1d] disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Account Role</label>
                    <input
                      type="text"
                      value={user?.role || 'User'}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-[#1a1a1d] disabled:opacity-50 capitalize"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      className="px-6 py-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Section */}
            <div className="space-y-6">
              {/* Current Plan */}
              <div className="bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-90 mb-2">Current Plan</div>
                    <h2 className="text-4xl font-bold mb-2">Pro Plan</h2>
                    <div className="text-2xl font-semibold">$199<span className="text-lg opacity-75">/month</span></div>
                  </div>
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="text-sm opacity-90 mb-2">Next billing date</div>
                  <div className="font-semibold">February 16, 2026</div>
                </div>
              </div>

              {/* Upgrade Options */}
              <div>
                <h3 className="text-xl font-bold text-[#1a1a1d] mb-4">Upgrade Your Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Basic Plan */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h4 className="text-2xl font-bold text-[#1a1a1d] mb-2">Basic</h4>
                      <div className="text-3xl font-bold text-[#1a1a1d] mb-1">$99</div>
                      <div className="text-sm text-gray-600">per month</div>
                    </div>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        1 MT5 Account
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Basic EA
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Email Support
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-400">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Advanced Analytics
                      </li>
                    </ul>
                    <button className="w-full py-3 border-2 border-gray-300 hover:border-[#c9a227] text-gray-700 hover:text-[#1a1a1d] font-semibold rounded-xl transition-all">
                      Select Plan
                    </button>
                  </div>

                  {/* Pro Plan - Current */}
                  <div className="bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-4 right-4 bg-white text-[#c9a227] px-3 py-1 rounded-full text-xs font-bold">
                      CURRENT
                    </div>
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <h4 className="text-2xl font-bold mb-2">Pro</h4>
                      <div className="text-3xl font-bold mb-1">$199</div>
                      <div className="text-sm opacity-75">per month</div>
                    </div>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center gap-2 text-sm">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        3 MT5 Accounts
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Advanced EA
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Priority Support
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Advanced Analytics
                      </li>
                    </ul>
                    <button className="w-full py-3 bg-white text-[#c9a227] font-bold rounded-xl">
                      Current Plan
                    </button>
                  </div>

                  {/* Premium Plan */}
                  <div className="bg-white rounded-2xl border-2 border-[#c9a227] shadow-sm p-6 hover:shadow-lg transition-shadow">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                        </svg>
                      </div>
                      <h4 className="text-2xl font-bold text-[#1a1a1d] mb-2">Premium</h4>
                      <div className="text-3xl font-bold text-[#1a1a1d] mb-1">$499</div>
                      <div className="text-sm text-gray-600">per month</div>
                    </div>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Unlimited MT5 Accounts
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Premium EA Suite
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        24/7 VIP Support
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Custom EA Development
                      </li>
                    </ul>
                    <button className="w-full py-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all">
                      Upgrade Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div>
                <h3 className="text-xl font-bold text-[#1a1a1d] mb-4">Payment History</h3>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left py-4 px-6 text-gray-600 font-semibold">Invoice</th>
                          <th className="text-left py-4 px-6 text-gray-600 font-semibold">Plan</th>
                          <th className="text-left py-4 px-6 text-gray-600 font-semibold">Amount</th>
                          <th className="text-left py-4 px-6 text-gray-600 font-semibold">Status</th>
                          <th className="text-left py-4 px-6 text-gray-600 font-semibold">Date</th>
                          <th className="text-left py-4 px-6 text-gray-600 font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6 font-mono text-sm text-gray-600">#INV-2026-001</td>
                          <td className="py-4 px-6 font-semibold text-[#1a1a1d]">Pro Plan</td>
                          <td className="py-4 px-6 font-semibold text-[#1a1a1d]">$199.00</td>
                          <td className="py-4 px-6">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">PAID</span>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">Jan 16, 2026</td>
                          <td className="py-4 px-6">
                            <button className="text-[#c9a227] hover:text-[#1a1a1d] text-sm font-semibold">Download</button>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6 font-mono text-sm text-gray-600">#INV-2025-012</td>
                          <td className="py-4 px-6 font-semibold text-[#1a1a1d]">Pro Plan</td>
                          <td className="py-4 px-6 font-semibold text-[#1a1a1d]">$199.00</td>
                          <td className="py-4 px-6">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">PAID</span>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">Dec 16, 2025</td>
                          <td className="py-4 px-6">
                            <button className="text-[#c9a227] hover:text-[#1a1a1d] text-sm font-semibold">Download</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
