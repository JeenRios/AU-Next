'use client';

import { useState, useEffect } from 'react';
import LoginModal from '@/components/LoginModal';

interface PlatformStats {
  totalUsers: number;
  totalTrades: number;
  tradesToday: number;
  winRate: number;
  totalBalance: number;
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
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-xl flex items-center justify-center text-[#1a1a1d] font-bold shadow-lg shadow-[#c9a227]/20">A</div>
              <div className="text-2xl font-bold text-[#1a1a1d] tracking-tight">
                AU<span className="text-[#c9a227]">Next</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-10">
              <a href="#how-it-works" className="text-gray-600 hover:text-[#c9a227] text-sm font-semibold transition-colors">Process</a>
              <a href="#features" className="text-gray-600 hover:text-[#c9a227] text-sm font-semibold transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-[#c9a227] text-sm font-semibold transition-colors">Pricing</a>
              <a href="#activity" className="text-gray-600 hover:text-[#c9a227] text-sm font-semibold transition-colors">Activity</a>
              <button
                onClick={openLogin}
                className="px-6 py-2.5 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:from-[#f0d78c] hover:to-[#c9a227] text-[#1a1a1d] text-sm font-bold rounded-lg transition-all duration-300 shadow-md shadow-[#c9a227]/20 hover:shadow-lg hover:-translate-y-0.5"
              >
                Sign In
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
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
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 py-6 px-6 space-y-4 shadow-xl">
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-gray-600 hover:text-[#c9a227] font-semibold">Process</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-gray-600 hover:text-[#c9a227] font-semibold">Features</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-gray-600 hover:text-[#c9a227] font-semibold">Pricing</a>
            <a href="#activity" onClick={() => setMobileMenuOpen(false)} className="block text-gray-600 hover:text-[#c9a227] font-semibold">Live Activity</a>
            <button
              onClick={openLogin}
              className="w-full py-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] font-bold rounded-lg shadow-lg"
            >
              Sign In
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#c9a227]/5 blur-[120px] rounded-full -z-10"></div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#f0d78c] rounded-full text-[#c9a227] text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
                <span className="w-2 h-2 bg-[#c9a227] rounded-full animate-pulse"></span>
                Institutional Automated Trading
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#1a1a1d] mb-8 leading-[1.1] tracking-tight">
                Master the Markets with <span className="text-[#c9a227]">Next-Gen</span> Automation
              </h1>

              <p className="text-lg text-gray-600 mb-10 max-w-xl leading-relaxed font-medium">
                Bridge your MetaTrader account with our high-performance EA infrastructure.
                Execute professional-grade strategies 24/7 with zero latency and enterprise security.
              </p>

              <div className="flex flex-col sm:flex-row gap-5">
                <button
                  onClick={openLogin}
                  className="px-10 py-4 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:from-[#f0d78c] hover:to-[#c9a227] text-[#1a1a1d] font-bold rounded-lg text-lg shadow-lg shadow-[#c9a227]/30 transition-all hover:-translate-y-1 active:scale-95"
                >
                  Start Trading Now
                </button>
                <a
                  href="#how-it-works"
                  className="px-10 py-4 bg-white border border-gray-200 text-[#1a1a1d] font-bold rounded-lg text-lg hover:bg-gray-50 transition-all text-center shadow-sm"
                >
                  View Process
                </a>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-10 mt-16 text-xs text-gray-400 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  Encrypted Bridge
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  24/7 Uptime
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  Verified EA Performance
                </div>
              </div>
            </div>

            {/* Right: Modern Dashboard Preview */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] blur-3xl opacity-10 rounded-full group-hover:opacity-20 transition-opacity"></div>
              <div className="relative bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden p-8">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-50">
                  <div>
                    <h3 className="text-xl font-bold text-[#1a1a1d]">Intelligence Hub</h3>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-1">Real-time stats</p>
                  </div>
                  <div className="px-4 py-2 bg-amber-50 text-[#c9a227] text-[10px] font-bold uppercase tracking-widest rounded-full border border-[#f0d78c]/30">
                    Live Stream
                  </div>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-2 gap-6 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-28 bg-gray-50 rounded-2xl"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 transition-all hover:border-[#f0d78c]">
                        <p className="text-sm font-semibold text-gray-500 mb-1">Total Trades</p>
                        <p className="text-3xl font-bold text-[#1a1a1d]">{formatNumber(stats?.totalTrades || 0)}</p>
                      </div>
                      <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 transition-all hover:border-[#f0d78c]">
                        <p className="text-sm font-semibold text-gray-500 mb-1">Win Rate</p>
                        <p className="text-3xl font-bold text-[#c9a227]">{stats?.winRate || 0}%</p>
                      </div>
                      <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 transition-all hover:border-[#f0d78c]">
                        <p className="text-sm font-semibold text-gray-500 mb-1">Total Volume</p>
                        <p className="text-3xl font-bold text-[#1a1a1d]">{formatNumber(stats?.totalBalance || 0)}</p>
                      </div>
                      <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 transition-all hover:border-[#f0d78c]">
                        <p className="text-sm font-semibold text-gray-500 mb-1">Uptime</p>
                        <p className="text-3xl font-bold text-[#c9a227]">{stats?.uptime || 99.9}%</p>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Signals</span>
                        <span className="text-[10px] text-gray-400 font-medium">Last updated: {new Date().toLocaleTimeString()}</span>
                      </div>
                      <div className="space-y-4">
                        {(stats?.recentTrades || []).slice(0, 3).map((trade, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-amber-50/30 transition-colors border border-transparent hover:border-[#f0d78c]/20">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                                trade.type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-[#1a1a1d] text-white'
                              }`}>
                                {trade.type}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-[#1a1a1d]">{trade.symbol}</p>
                                <p className="text-[10px] text-gray-400 font-semibold">{formatTime(trade.time)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-bold ${trade.profit !== null && trade.profit >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
                                {trade.profit !== null ? `${trade.profit >= 0 ? '+' : ''}$${trade.profit.toFixed(2)}` : '--'}
                              </p>
                              <p className="text-[10px] text-gray-400 font-semibold">Vol: {trade.amount.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="how-it-works" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-[#c9a227] text-sm font-bold uppercase tracking-[0.3em] mb-4">The Process</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-[#1a1a1d] mb-6">Simple 3-Step Integration</h3>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">Designed for simplicity, built for performance. Get started in minutes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Register & Configure',
                desc: 'Create your account and select your preferred trading parameters and risk level.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                )
              },
              {
                step: '02',
                title: 'Bridge MT5',
                desc: 'Connect your MT4/MT5 account through our secure, encrypted backend connection.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                )
              },
              {
                step: '03',
                title: 'Live Automation',
                desc: 'Deploy our Expert Advisors and monitor your performance via our sleek analytics dashboard.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                )
              }
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="bg-gray-50 rounded-3xl p-10 border border-gray-100 transition-all hover:bg-white hover:border-[#f0d78c] hover:shadow-xl hover:shadow-[#c9a227]/5">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#c9a227] mb-8 shadow-sm group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <p className="text-[#c9a227] text-xs font-bold uppercase tracking-[0.2em] mb-3">{item.step}</p>
                  <h4 className="text-2xl font-bold text-[#1a1a1d] mb-4">{item.title}</h4>
                  <p className="text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 translate-y-[-50%] z-10 text-[#f0d78c]">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" /></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl">
              <h2 className="text-[#c9a227] text-sm font-bold uppercase tracking-[0.3em] mb-4">Capability</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-[#1a1a1d]">The Edge You Need to Succeed.</h3>
            </div>
            <p className="text-gray-500 max-w-sm lg:mb-2 font-medium">Built on top of a low-latency execution engine optimized for high-frequency algorithmic strategies.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Cloud Infrastructure', desc: 'Enterprise-grade VPS hosting with direct fiber connection to major liquidity hubs.', icon: 'cloud' },
              { title: 'Risk Intelligence', desc: 'Advanced equity protection and drawdown controls built into the core engine.', icon: 'shield' },
              { title: 'Universal Connectivity', desc: 'Seamlessly connect with any MT4/MT5 broker worldwide through our secure gateway.', icon: 'sync' },
              { title: 'Performance Metrics', desc: 'Granular reporting on Sharpe ratios, recovery factors, and trade distribution.', icon: 'chart' },
              { title: 'Security First', desc: 'Institutional-grade encryption for all account credentials and API keys.', icon: 'lock' },
              { title: 'Social Community', desc: 'Share insights and copy strategies from the top performing traders in our network.', icon: 'users' },
            ].map((f, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-all group hover:border-[#f0d78c]">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-[#c9a227] mb-6 group-hover:scale-110 transition-transform">
                  {/* Icons placeholder */}
                  <div className="w-6 h-6 border-2 border-[#c9a227] rounded"></div>
                </div>
                <h4 className="text-xl font-bold text-[#1a1a1d] mb-3">{f.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 bg-white overflow-hidden relative">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gray-100 -z-10"></div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-[#c9a227] text-sm font-bold uppercase tracking-[0.3em] mb-4">Pricing</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-[#1a1a1d] mb-6">Built to Scale with You</h3>
            <p className="text-lg text-gray-500 font-medium">Flexible plans designed for retail traders and institutional desks alike.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-center">
            {/* Standard */}
            <div className="bg-white border border-gray-200 rounded-3xl p-10 flex flex-col shadow-sm">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">Standard</p>
              <div className="mb-8">
                <span className="text-5xl font-bold text-[#1a1a1d]">$99</span>
                <span className="text-gray-400 font-medium ml-2">/month</span>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {['1 Active MT5 Connection', 'Standard EA Portfolio', 'Email Support', 'Basic Analytics'].map((feat, k) => (
                  <li key={k} className="flex items-center gap-3 text-gray-600 font-medium text-sm">
                    <svg className="w-5 h-5 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <button onClick={openLogin} className="w-full py-4 border-2 border-gray-200 hover:border-[#c9a227] text-[#1a1a1d] font-bold rounded-lg transition-all">
                Select Plan
              </button>
            </div>

            {/* Pro - Recommended */}
            <div className="bg-[#1a1a1d] border border-[#c9a227]/20 rounded-3xl p-12 flex flex-col shadow-2xl scale-105 relative z-10">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
                Recommended
              </div>
              <p className="text-[#c9a227] text-xs font-bold uppercase tracking-widest mb-6">Professional</p>
              <div className="mb-8 text-white">
                <span className="text-5xl font-bold">$199</span>
                <span className="text-gray-500 font-medium ml-2">/month</span>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {['3 Active Connections', 'Full EA Suite', 'Priority Deployment', 'Advanced Institutional Stats', 'Community Access'].map((feat, k) => (
                  <li key={k} className="flex items-center gap-3 text-gray-300 font-medium text-sm">
                    <svg className="w-5 h-5 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <button onClick={openLogin} className="w-full py-4 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:from-[#f0d78c] hover:to-[#c9a227] text-[#1a1a1d] font-bold rounded-lg transition-all shadow-lg shadow-[#c9a227]/20">
                Get Started Now
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-white border border-gray-200 rounded-3xl p-10 flex flex-col shadow-sm">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">Enterprise</p>
              <div className="mb-8">
                <span className="text-5xl font-bold text-[#1a1a1d]">$499</span>
                <span className="text-gray-400 font-medium ml-2">/month</span>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {['Unlimited Connections', 'Custom EA Development', 'Dedicated Account Manager', 'API Access', 'White-label Support'].map((feat, k) => (
                  <li key={k} className="flex items-center gap-3 text-gray-600 font-medium text-sm">
                    <svg className="w-5 h-5 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <button onClick={openLogin} className="w-full py-4 border-2 border-gray-200 hover:border-[#c9a227] text-[#1a1a1d] font-bold rounded-lg transition-all">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Feed Section */}
      <section id="activity" className="py-32 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[#c9a227] text-sm font-bold uppercase tracking-[0.3em] mb-4">Market Flow</h2>
            <h3 className="text-4xl font-bold text-[#1a1a1d] mb-4">Transparent Performance</h3>
            <p className="text-gray-500 font-medium">Real-time signals executed across our network</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Global Activity</span>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded-full border border-green-100">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Active
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {isLoading ? (
                <div className="p-20 text-center text-gray-400 font-medium italic">Synchronizing with node...</div>
              ) : (stats?.recentTrades || []).length > 0 ? (
                (stats?.recentTrades || []).map((trade, idx) => (
                  <div key={idx} className="p-8 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xs ${
                        trade.type === 'BUY' ? 'bg-amber-50 text-[#c9a227]' : 'bg-[#1a1a1d] text-white'
                      }`}>
                        {trade.type}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-[#1a1a1d]">{trade.symbol}</p>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Volume: {trade.amount.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${trade.profit !== null && trade.profit >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
                        {trade.profit !== null ? `${trade.profit >= 0 ? '+' : ''}$${trade.profit.toFixed(2)}` : '--'}
                      </p>
                      <p className="text-xs text-gray-400 font-semibold">{formatTime(trade.time)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center text-gray-400 font-semibold">No recent activity detected.</div>
              )}
            </div>
            <div className="p-8 bg-gray-50/50 text-center">
              <button onClick={openLogin} className="text-[#c9a227] font-bold text-sm hover:underline">View Verified Audit Results</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-xl flex items-center justify-center text-[#1a1a1d] font-bold">A</div>
                <div className="text-2xl font-bold text-[#1a1a1d]">AU<span className="text-[#c9a227]">Next</span></div>
              </div>
              <p className="text-gray-400 max-w-sm leading-relaxed font-medium">
                Democratizing institutional-grade automated trading for retail investors globally.
                Built with precision, reliability, and security at its core.
              </p>
            </div>
            <div>
              <h5 className="text-[#1a1a1d] font-bold text-sm mb-6 uppercase tracking-widest">Navigation</h5>
              <ul className="space-y-4 text-sm text-gray-500 font-semibold">
                <li><a href="#how-it-works" className="hover:text-[#c9a227] transition-colors">Process</a></li>
                <li><a href="#features" className="hover:text-[#c9a227] transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-[#c9a227] transition-colors">Pricing</a></li>
                <li><a href="#activity" className="hover:text-[#c9a227] transition-colors">Live Feed</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-[#1a1a1d] font-bold text-sm mb-6 uppercase tracking-widest">Support</h5>
              <ul className="space-y-4 text-sm text-gray-500 font-semibold">
                <li><a href="#" className="hover:text-[#c9a227] transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-[#c9a227] transition-colors">Legal Disclosure</a></li>
                <li><a href="#" className="hover:text-[#c9a227] transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[#c9a227] transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-sm text-gray-400 font-semibold">
              © 2026 AU-Next Technologies. All rights reserved.
            </div>
            <div className="flex gap-8">
              {['Twitter', 'LinkedIn', 'Discord'].map((social) => (
                <a key={social} href="#" className="text-gray-300 hover:text-[#1a1a1d] transition-colors text-sm font-bold">
                  {social}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-3xl mx-auto">
            High Risk Warning: Foreign exchange trading carries a high level of risk and may not be suitable for all investors.
            The high degree of leverage can work against you as well as for you. Past results do not guarantee future performance.
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </main>
  );
}
