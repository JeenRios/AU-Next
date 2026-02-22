'use client';

import { PageContainer, SectionHeader } from '@/components/shared';
import UnifiedPageLayout from '@/components/shared/layout/UnifiedPageLayout';
import { ContentTabIcons } from '@/components/shared/ui/ContentTabs';

const feedTabs = [
  { id: 'following', label: 'Following', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ContentTabIcons.user} /></svg> },
  { id: 'trending', label: 'Trending', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ContentTabIcons.trending} /></svg> },
  { id: 'marketplace', label: 'Marketplace', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ContentTabIcons.chart} /></svg> },
];

// Mock Data
const POSTS = [
  {
    id: 1,
    author: 'Sarah Jenkins',
    role: 'Crypto Analyst',
    avatar: 'SJ',
    time: '2h ago',
    content: 'Bitcoin trying to break the 65k resistance level. Based on the 4H RSI divergence, we might see a small pullback before the next leg up. 📈',
    tag: 'Crypto',
    likes: 124,
    comments: 42,
  },
  {
    id: 2,
    author: 'David Chen',
    role: 'E-commerce Expert',
    avatar: 'DC',
    time: '5h ago',
    content: 'Just closed a supplier deal for the new dropshipping store. Margins improved by 15%. Never underestimate the power of negotiation in bulk orders.',
    tag: 'Business',
    likes: 89,
    comments: 15,
  },
  {
    id: 3,
    author: 'Forex King',
    role: 'Signal Provider',
    avatar: 'FK',
    time: '1d ago',
    content: 'GBPJPY +150 pips taken! 💰 The setup shared in the VIP group played out perfectly. Secure profits and move SL to breakeven.',
    tag: 'Forex',
    likes: 456,
    comments: 88,
  }
];

const DEALS = [
  { id: 1, title: 'Prop Firm Passing Service', price: '$200', author: 'Elite Traders' },
  { id: 2, title: 'Exclusive SaaS Codebase', price: '$5k', author: 'DevStudio' },
];

export default function FeedPage() {
  return (
    <UnifiedPageLayout
      tabs={feedTabs}
      defaultTab="following"
      title="Your Feed"
      subtitle="Insights, opportunities, and network updates."
      actions={
        <button
          onClick={() => {}}
          className="px-4 py-2.5 bg-gradient-to-r from-primary-gold to-secondary-gold hover:shadow-lg text-surface-dark font-semibold rounded-xl transition-all"
        >
          New Post
        </button>
      }
      className="h-full"
    >
      {(activeTab) => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Logic for Following / Trending Tabs */}
          {(activeTab === 'following' || activeTab === 'trending') && (
            <div className="space-y-4">
              {POSTS.map((post) => (
                <div key={post.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                        {post.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{post.author}</p>
                        <p className="text-xs text-gray-500">{post.role} • {post.time}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs font-semibold rounded-md border border-gray-100">
                      {post.tag}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-4">{post.content}</p>
                  
                  <div className="flex items-center gap-6 pt-4 border-t border-gray-50 text-sm text-gray-500">
                    <button className="flex items-center gap-2 hover:text-primary-gold transition-colors">
                      <span>❤️</span> {post.likes}
                    </button>
                    <button className="flex items-center gap-2 hover:text-gray-900 transition-colors">
                      <span>💬</span> {post.comments} Comment
                    </button>
                    <button className="flex items-center gap-2 hover:text-gray-900 transition-colors ml-auto">
                      <span>🔖</span> Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Logic for Marketplace Tab */}
          {activeTab === 'marketplace' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEALS.map((deal) => (
                 <div key={deal.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                       <h3 className="font-bold text-gray-900">{deal.title}</h3>
                       <p className="text-xs text-gray-500">by {deal.author}</p>
                    </div>
                    <div className="text-right">
                       <div className="font-bold text-primary-gold mb-1">{deal.price}</div>
                       <button className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700">Buy Now</button>
                    </div>
                 </div>
              ))}
              
              {/* Empty State / CTA */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center text-gray-400">
                <p className="font-medium">Sell your services here</p>
                <p className="text-xs mt-1">List signals, tools, or mentorship</p>
              </div>
            </div>
          )}
        </div>
      )}
    </UnifiedPageLayout>
  );
}
