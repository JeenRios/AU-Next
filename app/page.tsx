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
    <main className="min-h-screen bg-[#f8fafc]">
      {/* Dynamic background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-50/50 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-50/50 blur-[120px]"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
              <div className="text-xl font-bold text-slate-900 tracking-tight">
                AU<span className="text-indigo-600">Next</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-slate-600 hover:text-indigo-600 text-sm font-medium transition-colors">Process</a>
              <a href="#features" className="text-slate-600 hover:text-indigo-600 text-sm font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-slate-600 hover:text-indigo-600 text-sm font-medium transition-colors">Pricing</a>
              <a href="#activity" className="text-slate-600 hover:text-indigo-600 text-sm font-medium transition-colors">Live Activity</a>
              <div className="h-6 w-px bg-slate-200 mx-2"></div>
              <button
                onClick={openLogin}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                Sign In
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
              aria-label="Toggle menu"
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
            <div className="md:hidden py-4 border-t border-slate-100 animate-fade-in">
              <div className="flex flex-col gap-4">
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="px-2 text-slate-600 hover:text-indigo-600 text-sm font-medium">Process</a>
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="px-2 text-slate-600 hover:text-indigo-600 text-sm font-medium">Features</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="px-2 text-slate-600 hover:text-indigo-600 text-sm font-medium">Pricing</a>
                <a href="#activity" onClick={() => setMobileMenuOpen(false)} className="px-2 text-slate-600 hover:text-indigo-600 text-sm font-medium">Live Activity</a>
                <button
                  onClick={openLogin}
                  className="mx-2 px-5 py-3 bg-indigo-600 text-white font-semibold rounded-xl w-full active:scale-95"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto z-10 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-bold uppercase tracking-wider mb-8">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                Next-Gen Trading Platform
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 mb-8 leading-[1.1] tracking-tight">
                Trade Smarter with
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500"> Automation</span>
              </h1>

              <p className="text-xl text-slate-600 mb-10 max-w-xl leading-relaxed">
                Connect your MT5 account and leverage enterprise-grade Expert Advisors that trade 24/7.
                Maximize efficiency, minimize risk, and master the markets.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={openLogin}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-lg shadow-lg shadow-indigo-200 transition-all active:scale-95 hover:translate-y-[-2px]"
                >
                  Start Automated Trading
                </button>
                <a
                  href="#how-it-works"
                  className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl text-lg hover:bg-slate-50 transition-all text-center"
                >
                  View Process
                </a>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-8 mt-12 text-sm text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  No card required
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Setup in minutes
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Secure MT5 Bridge
                </div>
              </div>
            </div>

            {/* Right: Modern Live Dashboard */}
            <div className="relative group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {/* Decorative blobs */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-200 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-200 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>

              <div className="relative bg-white/80 backdrop-blur-2xl border border-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden">
                <div className="p-8 lg:p-10">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h3 className="text-slate-900 font-bold text-xl">Platform Intelligence</h3>
                      <p className="text-slate-500 text-sm">Real-time ecosystem metrics</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      Sync Live
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="grid grid-cols-2 gap-6">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-slate-50/50 rounded-3xl p-6 animate-pulse">
                          <div className="h-10 bg-slate-100 rounded-lg mb-4"></div>
                          <div className="h-4 bg-slate-50 rounded w-20"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-6 mb-10">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:border-indigo-100 transition-colors">
                          <div className="text-3xl font-black text-slate-900 mb-1">
                            {formatNumber(stats?.totalTrades || 0)}
                          </div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Trades</div>
                        </div>
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:border-emerald-100 transition-colors">
                          <div className="text-3xl font-black text-emerald-600 mb-1">
                            {stats?.avgWinRate || 0}%
                          </div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Win Rate</div>
                        </div>
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:border-indigo-100 transition-colors">
                          <div className="text-3xl font-black text-slate-900 mb-1">
                            {formatNumber(stats?.totalUsers || 0)}
                          </div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Users</div>
                        </div>
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:border-emerald-100 transition-colors">
                          <div className="text-3xl font-black text-indigo-600 mb-1">
                            {stats?.uptime || 99.9}%
                          </div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Uptime</div>
                        </div>
                      </div>

                      {/* Recent Activity Mini-Feed */}
                      <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100">
                        <div className="flex items-center justify-between mb-5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Latest Signals</span>
                          <span className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer">View Feed</span>
                        </div>
                        <div className="space-y-4">
                          {(stats?.recentTrades || []).slice(0, 3).map((trade, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100/50">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                                  trade.type === 'BUY' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                }`}>
                                  {trade.type.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-slate-900 font-bold text-sm">{trade.symbol}</div>
                                  <div className="text-[10px] text-slate-400 font-medium">{formatTime(trade.time)}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                {trade.profit !== null && (
                                  <div className={`font-black text-sm ${trade.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section - How It Works */}
      <section id="how-it-works" className="py-32 px-4 sm:px-6 bg-white relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-indigo-600 text-sm font-black uppercase tracking-[0.25em] mb-4">Onboarding</h2>
            <h3 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Simple. Fast. Reliable.</h3>
            <p className="text-lg text-slate-600">Get your automated trading system up and running in less than 5 minutes with our streamlined process.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {[
              {
                step: '01',
                title: 'Instant Registration',
                description: 'Sign up with just your email. No long forms or upfront commitments required.',
                color: 'bg-indigo-600',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )
              },
              {
                step: '02',
                title: 'Secure MT5 Bridge',
                description: 'Connect your MetaTrader account through our encrypted gateway. Compatible with all brokers.',
                color: 'bg-indigo-500',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                )
              },
              {
                step: '03',
                title: 'Activate & Execute',
                description: 'Deploy our specialized EAs. Sit back as the platform executes professional strategies 24/7.',
                color: 'bg-emerald-500',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                )
              }
            ].map((item, idx) => (
              <div key={idx} className="group text-center">
                <div className="relative mb-10 inline-block">
                  <div className={`w-20 h-20 ${item.color} rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                    {item.icon}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 border-4 border-white rounded-full flex items-center justify-center text-white font-black text-xs">
                    {item.step}
                  </div>
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">{item.title}</h4>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl">
              <h2 className="text-indigo-600 text-sm font-black uppercase tracking-[0.25em] mb-4">Capability</h2>
              <h3 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">Enterprise Infrastructure. <br/>Made Accessible.</h3>
            </div>
            <p className="text-slate-500 max-w-sm lg:mb-2">Advanced algorithmic tools and high-performance server architecture optimized for modern traders.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: '24/7 Autonomy', desc: 'No downtime. Your EA executes strategies around the clock with zero latency issues.', icon: 'clock' },
              { title: 'Intelligent Dashboard', desc: 'Monitor equity curves, trade distribution, and drawdowns in real-time.', icon: 'chart' },
              { title: 'Advanced Risk Control', desc: 'Dynamic SL/TP adjustments and equity protection built into every operation.', icon: 'shield' },
              { title: 'Multi-Terminal Hub', desc: 'Sync multiple MT4/MT5 accounts from different brokers into one pane of glass.', icon: 'users' },
              { title: 'Deep Analytics', desc: 'Institutional-grade reporting on Sharpe ratios, recovery factors, and expectancy.', icon: 'analytics' },
              { title: 'Social Integration', desc: 'Connect with a global community of traders to share insights and lesson learned.', icon: 'community' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white border border-slate-200/60 rounded-[2rem] p-8 hover:border-indigo-200 hover:shadow-[0_20px_40px_rgba(79,70,229,0.04)] transition-all group">
                <div className="w-12 h-12 bg-slate-50 group-hover:bg-indigo-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors mb-6">
                  {feature.icon === 'clock' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  {feature.icon === 'chart' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                  {feature.icon === 'shield' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                  {feature.icon === 'users' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                  {feature.icon === 'analytics' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                  {feature.icon === 'community' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>}
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{feature.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Activity Feed */}
      <section id="activity" className="py-32 px-4 sm:px-6 bg-[#f8fafc] overflow-hidden relative">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-indigo-600 text-sm font-black uppercase tracking-[0.25em] mb-4">Public Ledger</h2>
            <h3 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Real-Time Performance</h3>
            <p className="text-slate-500">Live execution data from the platform ecosystem</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Orders</span>
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                LIVE STREAM
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {isLoading ? (
                <div className="p-20 text-center text-slate-400 font-medium">Synchronizing signals...</div>
              ) : (stats?.recentTrades || []).length > 0 ? (
                (stats?.recentTrades || []).map((trade, idx) => (
                  <div key={idx} className="px-8 py-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${
                        trade.type === 'BUY' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {trade.type}
                      </div>
                      <div>
                        <div className="text-slate-900 font-bold text-lg">{trade.symbol}</div>
                        <div className="text-xs text-slate-400 font-semibold tracking-wide">Volume: {trade.amount.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {trade.profit !== null ? (
                        <div className={`text-xl font-black ${trade.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                        </div>
                      ) : (
                        <div className="text-slate-300 font-bold">--</div>
                      )}
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{formatTime(trade.time)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center text-slate-400 font-medium">Awaiting next signal packet...</div>
              )}
            </div>
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-center">
              <button onClick={openLogin} className="text-indigo-600 font-bold text-sm hover:underline">Connect your account to see full history</button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-indigo-600 text-sm font-black uppercase tracking-[0.25em] mb-4">Investment Plans</h2>
            <h3 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Scale Your Strategy</h3>
            <p className="text-slate-500 max-w-xl mx-auto">Transparent pricing designed for every stage of your trading journey.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10 max-w-6xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 flex flex-col hover:shadow-xl transition-all">
              <div className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-6">Lite</div>
              <div className="mb-8">
                <span className="text-5xl font-black text-slate-900 tracking-tighter">$99</span>
                <span className="text-slate-400 font-bold ml-1">/mo</span>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {['1 MT5 Connection', 'Standard EA Package', 'Email Support', 'Basic Metrics'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-600 font-medium text-sm">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={openLogin}
                className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl hover:bg-slate-100 transition-colors font-bold active:scale-95"
              >
                Start Free Trial
              </button>
            </div>

            {/* Pro Plan - Popular */}
            <div className="bg-slate-900 border-4 border-indigo-600/20 rounded-[2.5rem] p-10 flex flex-col relative shadow-2xl shadow-indigo-200 transform lg:scale-105 z-10">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-5 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                Recommended
              </div>
              <div className="text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mb-6">Professional</div>
              <div className="mb-8 text-white">
                <span className="text-5xl font-black tracking-tighter">$199</span>
                <span className="text-slate-500 font-bold ml-1">/mo</span>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {['3 MT5 Connections', 'Priority EA Deployment', '24/7 Priority Support', 'Institutional Analytics', 'Community Access'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-300 font-medium text-sm">
                    <svg className="w-5 h-5 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={openLogin}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-900/40 active:scale-95"
              >
                Scale Now
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 flex flex-col hover:shadow-xl transition-all">
              <div className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-6">Enterprise</div>
              <div className="mb-8">
                <span className="text-5xl font-black text-slate-900 tracking-tighter">$499</span>
                <span className="text-slate-400 font-bold ml-1">/mo</span>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {['Unlimited Accounts', 'Custom EA Development', 'VIP Concierge Support', 'Advanced API Access', 'Custom White-label'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-600 font-medium text-sm">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={openLogin}
                className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl hover:bg-slate-100 transition-colors font-bold active:scale-95"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">A</div>
                <div className="text-xl font-bold text-slate-900 tracking-tight">AU<span className="text-indigo-600">Next</span></div>
              </div>
              <p className="text-slate-500 max-w-sm mb-6 leading-relaxed">
                Empowering retail traders with institutional-grade automation and infrastructure.
                Trade the world&apos;s markets with confidence and precision.
              </p>
            </div>
            <div>
              <h5 className="text-slate-900 font-bold text-sm mb-6 uppercase tracking-widest">Platform</h5>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li><a href="#features" className="hover:text-indigo-600 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-indigo-600 transition-colors">Process</a></li>
                <li><a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a></li>
                <li><a href="#activity" className="hover:text-indigo-600 transition-colors">Live Feed</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-slate-900 font-bold text-sm mb-6 uppercase tracking-widest">Support</h5>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              &copy; 2026 AU-Next Technologies. All rights reserved.
            </div>
            <div className="flex gap-6">
              {['twitter', 'linkedin', 'github'].map((social) => (
                <a key={social} href="#" className="text-slate-300 hover:text-slate-900 transition-colors">
                  <span className="sr-only">{social}</span>
                  <div className="w-5 h-5 bg-slate-100 rounded-full"></div>
                </a>
              ))}
            </div>
          </div>
          <div className="mt-12 text-center text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em] leading-loose max-w-3xl mx-auto">
            Risk Disclosure: Trading financial instruments carries high risk. Automated systems do not guarantee profit.
            Past results do not indicate future performance. Use at your own risk.
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </main>
  );
}
