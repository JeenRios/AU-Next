'use client';

import { PageContainer } from '@/components/shared';
import { useState } from 'react';

// Mock Data
const PROFILE = {
  name: 'Alex Sterling',
  username: '@alexsterling',
  tagline: 'Forex Scalper | Ex-Prop Firm Trader | SaaS Founder',
  avatar: 'AS',
  bio: 'Specializing in XAUUSD and GJ scalping strategies. Building tools for automated trading. Helping others pass funding challenges.',
  interests: ['Forex', 'Automated Trading', 'SaaS', 'Real Estate'],
  skills: ['Risk Management', 'MQL5', 'Python', 'Price Action'],
  joined: 'Member since 2023',
};

const STATS = [
  { label: 'Followers', value: '12.4K' },
  { label: 'Following', value: '342' },
  { label: 'Win Rate', value: '68%' },
];

const PORTFOLIO = [
  { id: 1, title: 'Gold Sniper EA', type: 'Product', price: '$199', image: '🤖', desc: 'Fully automated XAUUSD scalping bot.' },
  { id: 2, title: 'VIP Signals Group', type: 'Subscription', price: '$49/mo', image: '📊', desc: 'Daily setups with entry/exit points.' },
  { id: 3, title: '1-on-1 Mentorship', type: 'Service', price: '$997', image: '🎓', desc: '4 weeks of intensive trading coaching.' },
];

export default function ProfilePage() {
  return (
    <PageContainer>
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-gray-900 via-[#1a1a1d] to-gray-900"></div>
        
        <div className="relative pt-16 flex flex-col md:flex-row items-start md:items-end gap-6">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#c9a227] to-[#f0d78c] p-1 shadow-xl">
            <div className="w-full h-full bg-[#1a1a1d] rounded-xl flex items-center justify-center text-4xl font-bold text-[#c9a227]">
              {PROFILE.avatar}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{PROFILE.name}</h1>
            <p className="text-gray-500 font-medium text-sm md:text-base mb-2">{PROFILE.tagline}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {PROFILE.interests.map((tag) => (
                <span key={tag} className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-100">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex gap-3 pb-2 w-full md:w-auto">
             <button className="flex-1 md:flex-none px-6 py-2.5 bg-[#1a1a1d] hover:bg-gray-800 text-white rounded-xl font-medium transition-colors shadow-lg shadow-gray-200">
                Follow
             </button>
             <button className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors">
                Message
             </button>
          </div>
        </div>

        {/* Bio & Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-gray-100">
           <div className="md:col-span-2 space-y-4">
              <h3 className="font-bold text-gray-900">About</h3>
              <p className="text-gray-600 leading-relaxed">{PROFILE.bio}</p>
              
              <div className="pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Skills & Expertise</h4>
                <div className="flex flex-wrap gap-2">
                   {PROFILE.skills.map((skill) => (
                     <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                        {skill}
                     </span>
                   ))}
                </div>
              </div>
           </div>

           <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 h-fit">
              <div className="grid grid-cols-3 gap-4 text-center">
                 {STATS.map((stat) => (
                    <div key={stat.label}>
                       <div className="text-xl font-bold text-[#c9a227]">{stat.value}</div>
                       <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">{stat.label}</div>
                    </div>
                 ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                 <p className="text-xs text-gray-400">{PROFILE.joined}</p>
              </div>
           </div>
        </div>
      </div>

      {/* Portfolio Grid */}
      <h2 className="text-xl font-bold text-gray-900 mt-2">Ventures & Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {PORTFOLIO.map((item) => (
            <div key={item.id} className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow group">
               <div className="h-24 bg-gray-50 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                  {item.image}
               </div>
               <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                     <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">{item.type}</span>
                     <span className="font-bold text-gray-900">{item.price}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{item.desc}</p>
                  <button className="w-full py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                     View Details
                  </button>
               </div>
            </div>
         ))}
      </div>
    </PageContainer>
  );
}
