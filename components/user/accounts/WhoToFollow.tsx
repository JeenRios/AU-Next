'use client';

import TraderProfileCard from './TraderProfileCard';

interface Suggestion {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  isVerified?: boolean;
  gain: number;
  winRate: number;
  followers: number;
  following: number;
  trades: number;
  mutualFollowers?: string[];
  reason?: string;
}

interface WhoToFollowProps {
  suggestions?: Suggestion[];
  loading?: boolean;
  onFollow?: (id: string) => void;
  onViewProfile?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export default function WhoToFollow({ suggestions, loading, onFollow, onViewProfile, onDismiss }: WhoToFollowProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="w-28 h-5 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="p-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="w-24 h-4 bg-gray-200 rounded mb-1" />
                <div className="w-32 h-3 bg-gray-200 rounded" />
              </div>
              <div className="w-16 h-8 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-bold text-[#1a1a1d]">Who to follow</h3>
      </div>
      <div className="p-2">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="relative group">
            <TraderProfileCard
              {...suggestion}
              size="sm"
              onFollow={onFollow}
              onViewProfile={onViewProfile}
            />
            {/* Dismiss button */}
            {onDismiss && (
              <button
                onClick={() => onDismiss(suggestion.id)}
                className="absolute top-2 right-2 p-1 text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {/* Reason */}
            {suggestion.reason && (
              <p className="text-xs text-gray-400 px-3 pb-2 -mt-1">{suggestion.reason}</p>
            )}
            {/* Mutual followers */}
            {suggestion.mutualFollowers && suggestion.mutualFollowers.length > 0 && (
              <p className="text-xs text-gray-400 px-3 pb-2 -mt-1">
                Followed by {suggestion.mutualFollowers.slice(0, 2).join(', ')}
                {suggestion.mutualFollowers.length > 2 && ` +${suggestion.mutualFollowers.length - 2} more`}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-gray-100">
        <button className="w-full py-2 text-sm text-[#c9a227] hover:bg-amber-50 rounded-lg font-medium transition-colors">
          Show more
        </button>
      </div>
    </div>
  );
}
