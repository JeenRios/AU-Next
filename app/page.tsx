'use client';

import { useState, useEffect } from 'react';
import LoginModal from '@/components/LoginModal';

interface PlatformStats {
  totalUsers: number;
  totalTrades: number;
  tradesToday: number;
  avgWinRate: number;
  activeConnections: number;
  uptime: number;
  recentTrades: Array<{
    symbol: string;
    type: string;
    amount: number;
    profit: number | null;
    time: string;
  }>;
}

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/landing-stats');
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const openLogin = () => setIsLoginModalOpen(true);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50 to-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="text-xl font-bold text-[#1a1a1d]">
              AU<span className="text-[#c9a227]">Next</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-gray-600 hover:text-[#1a1a1d] text-sm font-medium transition-colors">How It Works</a>
              <a href="#features" className="text-gray-600 hover:text-[#1a1a1d] text-sm font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-[#1a1a1d] text-sm font-medium transition-colors">Pricing</a>
              <a href="#activity" className="text-gray-600 hover:text-[#1a1a1d] text-sm font-medium transition-colors">Live Activity</a>
              <button
                onClick={openLogin}
                className="px-5 py-2 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all"
              >
                Sign In
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-[#1a1a1d]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col gap-4">
                <a href="#how-it-works" className="text-gray-600 hover:text-[#1a1a1d] text-sm font-medium">How It Works</a>
                <a href="#features" className="text-gray-600 hover:text-[#1a1a1d] text-sm font-medium">Features</a>
                <a href="#pricing" className="text-gray-600 hover:text-[#1a1a1d] text-sm font-medium">Pricing</a>
                <a href="#activity" className="text-gray-600 hover:text-[#1a1a1d] text-sm font-medium">Live Activity</a>
                <button
                  onClick={openLogin}
                  className="px-5 py-2 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] font-semibold rounded-xl w-fit"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-green-700 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Platform Online
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1a1a1d] mb-6 leading-tight">
                Automated Trading for
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9a227] to-[#f0d78c]"> MT5</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                Connect your MetaTrader 5 account and let our Expert Advisors trade for you 24/7.
                Monitor performance, manage risk, and grow your portfolio.
              </p>

              <button
                onClick={openLogin}
                className="px-8 py-4 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-xl text-[#1a1a1d] font-semibold rounded-xl text-lg transition-all transform hover:scale-105"
              >
                Start Trading Now
              </button>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 mt-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Setup in 2 minutes
                </div>
              </div>
            </div>

            {/* Right: Live Stats Dashboard */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#1a1a1d] font-semibold text-lg">Platform Statistics</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Live
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
                      <div className="h-8 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-100 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4">
                      <div className="text-2xl sm:text-3xl font-bold text-[#1a1a1d] mb-1">
                        {formatNumber(stats?.totalTrades || 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Trades</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4">
                      <div className="text-2xl sm:text-3xl font-bold text-[#c9a227] mb-1">
                        {stats?.avgWinRate || 0}%
                      </div>
                      <div className="text-sm text-gray-600">Avg Win Rate</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                      <div className="text-2xl sm:text-3xl font-bold text-[#1a1a1d] mb-1">
                        {formatNumber(stats?.totalUsers || 0)}
                      </div>
                      <div className="text-sm text-gray-600">Active Users</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                      <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
                        {stats?.uptime || 99.9}%
                      </div>
                      <div className="text-sm text-gray-600">Uptime</div>
                    </div>
                  </div>

                  {/* Mini trade feed */}
                  {(stats?.recentTrades || []).length > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                      <div className="text-xs text-gray-500 mb-3 font-medium">Recent Activity</div>
                      <div className="space-y-2">
                        {(stats?.recentTrades || []).slice(0, 3).map((trade, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                trade.type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {trade.type}
                              </span>
                              <span className="text-[#1a1a1d] font-medium">{trade.symbol}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              {trade.profit !== null && (
                                <span className={`font-semibold ${trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                                </span>
                              )}
                              <span className="text-gray-400 text-xs">{formatTime(trade.time)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1d] mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create Account',
                description: 'Sign up with your email. No complex verification needed to get started.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )
              },
              {
                step: '02',
                title: 'Connect MT5',
                description: 'Link your MetaTrader 5 account. We support all major brokers.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                )
              },
              {
                step: '03',
                title: 'Start Trading',
                description: 'Activate the EA and monitor performance from your dashboard.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                )
              }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 h-full hover:border-[#f0d78c] hover:shadow-lg transition-all">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-xl flex items-center justify-center text-[#1a1a1d] mb-4">
                    {item.icon}
                  </div>
                  <div className="text-sm text-[#c9a227] font-semibold mb-2">Step {item.step}</div>
                  <h3 className="text-xl font-bold text-[#1a1a1d] mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-gray-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1d] mb-4">Platform Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Everything you need for successful automated trading</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: '24/7 Automated Trading', desc: 'Your EA runs around the clock, executing trades even while you sleep.', icon: 'clock' },
              { title: 'Real-time Dashboard', desc: 'Monitor all your trades, profits, and account status in real-time.', icon: 'chart' },
              { title: 'Risk Management', desc: 'Built-in stop loss, take profit, and position sizing controls.', icon: 'shield' },
              { title: 'Multi-Account Support', desc: 'Connect and manage multiple MT5 accounts from one dashboard.', icon: 'users' },
              { title: 'Performance Analytics', desc: 'Detailed reports on win rate, drawdown, and profit factor.', icon: 'analytics' },
              { title: 'Community Access', desc: 'Share strategies and insights with fellow traders.', icon: 'community' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#f0d78c] hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-xl flex items-center justify-center text-[#1a1a1d] mb-4">
                  {feature.icon === 'clock' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {feature.icon === 'chart' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )}
                  {feature.icon === 'shield' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )}
                  {feature.icon === 'users' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                  {feature.icon === 'analytics' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  {feature.icon === 'community' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-bold text-[#1a1a1d] mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Activity */}
      <section id="activity" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1d] mb-4">Live Trading Activity</h2>
            <p className="text-gray-600">Real trades executed by our platform</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-[#1a1a1d]">Recent Trades</span>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Updating live
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">Loading trades...</div>
              ) : (stats?.recentTrades || []).length > 0 ? (
                (stats?.recentTrades || []).map((trade, idx) => (
                  <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-white transition-colors">
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        trade.type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {trade.type}
                      </span>
                      <div>
                        <div className="text-[#1a1a1d] font-semibold">{trade.symbol}</div>
                        <div className="text-xs text-gray-500">${trade.amount.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {trade.profit !== null ? (
                        <div className={`font-semibold ${trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                        </div>
                      ) : (
                        <div className="text-gray-400">-</div>
                      )}
                      <div className="text-xs text-gray-500">{formatTime(trade.time)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">No recent trades to display</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1d] mb-4">Simple Pricing</h2>
            <p className="text-gray-600">Choose the plan that fits your trading needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Basic */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="text-gray-500 text-sm font-medium mb-2">Basic</div>
              <div className="text-4xl font-bold text-[#1a1a1d] mb-1">$99<span className="text-lg text-gray-400 font-normal">/mo</span></div>
              <div className="text-gray-500 text-sm mb-6">For getting started</div>

              <ul className="space-y-3 mb-8">
                {['1 MT5 Account', 'Basic EA', 'Email Support', 'Basic Analytics'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-gray-700">
                    <svg className="w-5 h-5 text-[#c9a227]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={openLogin}
                className="w-full py-3 border-2 border-gray-200 text-[#1a1a1d] rounded-xl hover:border-[#c9a227] transition-colors font-semibold"
              >
                Get Started
              </button>
            </div>

            {/* Pro - Featured */}
            <div className="bg-gradient-to-b from-amber-50 to-white border-2 border-[#c9a227] rounded-2xl p-8 relative shadow-xl">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] text-xs font-bold rounded-full">
                Most Popular
              </div>
              <div className="text-[#c9a227] text-sm font-medium mb-2">Pro</div>
              <div className="text-4xl font-bold text-[#1a1a1d] mb-1">$199<span className="text-lg text-gray-400 font-normal">/mo</span></div>
              <div className="text-gray-500 text-sm mb-6">For serious traders</div>

              <ul className="space-y-3 mb-8">
                {['3 MT5 Accounts', 'Advanced EA', 'Priority Support', 'Full Analytics', 'Community Access'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-gray-700">
                    <svg className="w-5 h-5 text-[#c9a227]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={openLogin}
                className="w-full py-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] rounded-xl hover:shadow-lg transition-all font-bold"
              >
                Get Started
              </button>
            </div>

            {/* Premium */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="text-gray-500 text-sm font-medium mb-2">Premium</div>
              <div className="text-4xl font-bold text-[#1a1a1d] mb-1">$499<span className="text-lg text-gray-400 font-normal">/mo</span></div>
              <div className="text-gray-500 text-sm mb-6">For professionals</div>

              <ul className="space-y-3 mb-8">
                {['Unlimited Accounts', 'Premium EA Suite', '24/7 VIP Support', 'Custom EA Development', 'API Access'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-gray-700">
                    <svg className="w-5 h-5 text-[#c9a227]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={openLogin}
                className="w-full py-3 border-2 border-gray-200 text-[#1a1a1d] rounded-xl hover:border-[#c9a227] transition-colors font-semibold"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-xl font-bold text-[#1a1a1d]">
              AU<span className="text-[#c9a227]">Next</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-[#c9a227] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#c9a227] transition-colors">Terms</a>
              <a href="#" className="hover:text-[#c9a227] transition-colors">Support</a>
            </div>
            <div className="text-sm text-gray-500">
              &copy; 2026 AU-Next
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-gray-400">
            Trading involves significant risk. Past performance is not indicative of future results.
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </main>
  );
}
