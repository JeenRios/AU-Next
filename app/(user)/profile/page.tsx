'use client';

import { PageContainer } from '@/components/shared';
import { useState } from 'react';
import { ContentTabIcons } from '@/components/shared/ui/ContentTabs';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Enhanced Mock Data
const PROFILE = {
  name: 'Alex Sterling',
  username: '@alexsterling',
  tagline: 'Algorithmic Scalper | Strategy Developer',
  avatar: 'AS',
  bio: 'Full-time algorithmic trader specializing in XAUUSD. Developer of "Gold Sniper" series. Sharing verifying results and tools for community.',
  interests: ['Algo Trading', 'MQL5', 'NextJS', 'Forex'],
  skills: ['System Design', 'Risk Mgmt', 'React', 'Python'],
  joined: 'Jan 2024',
  role: 'Pro Trader',
  verified: true
};

const STATS = [
  { label: 'Followers', value: '12.4K', change: '+12%' },
  { label: 'Win Rate', value: '68.5%', change: '+2.1%' },
  { label: 'Profit Factor', value: '2.45', change: '+0.1' },
];

const PERFORMANCE_DATA = [
  { day: 'Mon', equity: 45000 },
  { day: 'Tue', equity: 46200 },
  { day: 'Wed', equity: 45800 },
  { day: 'Thu', equity: 47500 },
  { day: 'Fri', equity: 48900 },
  { day: 'Sat', equity: 48900 },
  { day: 'Sun', equity: 48900 },
];

const PORTFOLIO = [
  { id: 1, title: 'Gold Sniper V3', type: 'Product', price: '$199', image: '🤖', desc: 'Automated scalping EA for XAUUSD with 90% win rate.' },
  { id: 2, title: 'Mentorship Core', type: 'Service', price: '$997', image: '🎓', desc: '4 weeks of live coaching and strategy breakdown.' },
  { id: 3, title: 'Signal Room', type: 'Subscription', price: '$49/mo', image: '📡', desc: 'Real-time entry/exit alerts.' },
];

export default function ProfilePage() {
  const [timeRange, setTimeRange] = useState('1W');

  const profileTabs = [
    { id: 'profile', label: 'Profile', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ContentTabIcons.user} /></svg> },
  ];

  return (
    <PageContainer
      tabs={profileTabs}
      defaultTab="profile"
      title="Profile"
      subtitle="View your trading profile and performance"
      className="h-full"
    >
      {() => (
        // md:pl-20 ensures content is not hidden by fixed floating sidebar
        <div className="md:pl-20 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-surface-dark border border-white/5 shadow-2xl">
             <div className="absolute inset-0 bg-gradient-to-br from-primary-gold/10 via-transparent to-transparent pointer-events-none" />
             <div className="absolute top-0 right-0 w-96 h-96 bg-primary-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
             
             <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center md:items-end gap-8">
                {/* Avatar Ring */}
                <div className="relative group">
                   <div className="absolute -inset-1 bg-gradient-to-br from-primary-gold to-secondary-gold rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                   <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-surface-dark p-1 ring-2 ring-white/10 overflow-hidden flex items-center justify-center">
                      <span className="text-4xl font-bold bg-gradient-to-br from-primary-gold to-secondary-gold bg-clip-text text-transparent">
                        {PROFILE.avatar}
                      </span>
                   </div>
                   {PROFILE.verified && (
                      <div className="absolute bottom-2 right-2 bg-primary-gold text-surface-dark rounded-full p-1.5 shadow-lg border-2 border-surface-dark" title="Verified Trader">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                   )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left space-y-2">
                   <div className="flex items-center justify-center md:justify-start gap-3">
                      <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{PROFILE.name}</h1>
                      <span className="px-3 py-1 rounded-full bg-primary-gold/20 text-primary-gold text-xs font-bold border border-primary-gold/20">
                        {PROFILE.role}
                      </span>
                   </div>
                   <p className="text-gray-400 font-medium">{PROFILE.username} • {PROFILE.tagline}</p>
                   <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                      {PROFILE.interests.slice(0, 3).map(tag => (
                         <span key={tag} className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                           {tag}
                         </span>
                      ))}
                   </div>
                </div>

                {/* Stats Summary */}
                <div className="flex gap-6 md:gap-8 bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                   {STATS.map(stat => (
                      <div key={stat.label} className="text-center">
                         <div className="text-xl font-bold text-white">{stat.value}</div>
                         <div className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Chart Section - Takes up 2/3 */}
             <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col h-[400px]">
                <div className="flex items-center justify-between mb-6">
                   <div>
                      <h3 className="font-bold text-gray-900 text-lg">Performance Verification</h3>
                      <p className="text-sm text-gray-400">Equity Curve (Last 7 Days)</p>
                   </div>
                   <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                      {['1W', '1M', '3M', 'YTD'].map(range => (
                         <button 
                           key={range}
                           onClick={() => setTimeRange(range)}
                           className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                              timeRange === range ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                           }`}
                         >
                          {range}
                         </button>
                      ))}
                   </div>
                </div>
              
                <div className="flex-1 w-full min-h-0">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={PERFORMANCE_DATA}>
                         <defs>
                            <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="var(--primary-gold)" stopOpacity={0.2}/>
                               <stop offset="95%" stopColor="var(--primary-gold)" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <XAxis 
                            dataKey="day" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#9ca3af', fontSize: 12 }} 
                         />
                         <YAxis 
                            hide 
                            domain={['dataMin - 1000', 'dataMax + 1000']} 
                         />
                         <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--surface-dark)', border: 'none', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: 'var(--primary-gold)' }}
                         />
                         <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="3 3" />
                         <Area 
                            type="monotone" 
                            dataKey="equity" 
                            stroke="var(--primary-gold)" 
                            strokeWidth={2} 
                            fillOpacity={1} 
                            fill="url(#colorEquity)" 
                         />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </div>

             {/* About / Bio Section */}
             <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
                <div>
                   <h3 className="font-bold text-gray-900 mb-3">About</h3>
                   <p className="text-gray-500 text-sm leading-relaxed">{PROFILE.bio}</p>
                </div>
                
                <div>
                   <h4 className="font-bold text-gray-900 mb-3 text-sm">Skills</h4>
                   <div className="flex flex-wrap gap-2">
                      {PROFILE.skills.map(skill => (
                         <span key={skill} className="px-3 py-1 bg-primary-gold/10 text-primary-gold rounded-lg text-xs font-semibold border border-primary-gold/20">
                           {skill}
                         </span>
                      ))}
                   </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                   <button className="w-full py-3 bg-surface-dark text-white rounded-xl font-medium shadow-xl shadow-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all">
                      View Public Journal
                   </button>
                </div>
             </div>

             {/* Ventures Grid */}
             <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 px-1">Ventures</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {PORTFOLIO.map(item => (
                      <div key={item.id} className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                         <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl group-hover:bg-primary-gold/10 transition-colors">
                               {item.image}
                            </div>
                            <span className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 group-hover:border-primary-gold/20 group-hover:text-primary-gold transition-all">
                               {item.price}
                            </span>
                         </div>
                         <h4 className="font-bold text-gray-900 mb-2 group-hover:text-primary-gold transition-colors">{item.title}</h4>
                         <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.desc}</p>
                         <div className="flex items-center text-primary-gold text-sm font-bold gap-2 group/link cursor-pointer">
                            <span>Learn more</span>
                            <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
