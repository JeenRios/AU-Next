'use client';

import Link from 'next/link';

interface ActivityItem {
  id: string;
  type: 'trade_closed' | 'milestone' | 'followed' | 'comment' | 'like';
  trader: {
    id: string;
    displayName: string;
    avatar?: string;
    isVerified?: boolean;
  };
  data?: any;
  timestamp: string;
}

interface ActivityFeedProps {
  activities?: ActivityItem[];
  loading?: boolean;
  title?: string;
}

function ActivityItemComponent({ activity }: { activity: ActivityItem }) {
  const getActivityContent = () => {
    switch (activity.type) {
      case 'trade_closed':
        const profit = activity.data?.profit || 0;
        const symbol = activity.data?.symbol || 'Unknown';
        return (
          <span>
            closed a trade on <span className="font-semibold">{symbol}</span> with{' '}
            <span className={profit >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
              {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
            </span>
          </span>
        );
      case 'milestone':
        return (
          <span>
            reached <span className="font-semibold text-[#c9a227]">{activity.data?.milestone}</span> 🎉
          </span>
        );
      case 'followed':
        return (
          <span>
            started following <Link href={`/traders/${activity.data?.followedId}`} className="font-semibold hover:text-[#c9a227]">{activity.data?.followedName}</Link>
          </span>
        );
      case 'comment':
        return (
          <span>
            commented: "{activity.data?.preview}"
          </span>
        );
      case 'like':
        return (
          <span>
            liked <Link href={`/traders/${activity.data?.traderId}`} className="font-semibold hover:text-[#c9a227]">{activity.data?.traderName}</Link>'s trade
          </span>
        );
      default:
        return null;
    }
  };

  const getActivityIcon = () => {
    switch (activity.type) {
      case 'trade_closed':
        const profit = activity.data?.profit || 0;
        return (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            profit >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        );
      case 'milestone':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        );
      case 'followed':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        );
      case 'comment':
        return (
          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      case 'like':
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-start gap-3 py-3 hover:bg-gray-50 px-3 -mx-3 rounded-lg transition-colors">
      {/* Activity icon */}
      {getActivityIcon()}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <Link href={`/traders/${activity.trader.id}`} className="flex-shrink-0">
            {activity.trader.avatar ? (
              <img src={activity.trader.avatar} alt="" className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#c9a227] to-[#f0d78c] flex items-center justify-center text-white text-xs font-bold">
                {activity.trader.displayName.charAt(0)}
              </div>
            )}
          </Link>
          <p className="text-sm text-gray-600 flex-1">
            <Link href={`/traders/${activity.trader.id}`} className="font-semibold text-[#1a1a1d] hover:text-[#c9a227]">
              {activity.trader.displayName}
            </Link>{' '}
            {getActivityContent()}
          </p>
        </div>
        <p className="text-xs text-gray-400 mt-1 ml-8">{activity.timestamp}</p>
      </div>
    </div>
  );
}

export default function ActivityFeed({ activities, loading, title = 'Activity' }: ActivityFeedProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="w-24 h-5 bg-gray-200 rounded mb-4 animate-pulse" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="w-3/4 h-4 bg-gray-200 rounded mb-1" />
                <div className="w-16 h-3 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <p className="text-gray-500">No activity yet</p>
        <p className="text-sm text-gray-400">Follow traders to see their activity here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-bold text-[#1a1a1d]">{title}</h3>
      </div>
      <div className="p-3 max-h-[500px] overflow-y-auto">
        {activities.map((activity) => (
          <ActivityItemComponent key={activity.id} activity={activity} />
        ))}
      </div>
      <div className="p-3 border-t border-gray-100">
        <button className="w-full py-2 text-sm text-[#c9a227] hover:bg-amber-50 rounded-lg font-medium transition-colors">
          View all activity
        </button>
      </div>
    </div>
  );
}
