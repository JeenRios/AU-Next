'use client';

import { useState } from 'react';

interface TraderProfileCardProps {
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
  isFollowing?: boolean;
  onFollow?: (id: string) => void;
  onViewProfile?: (id: string) => void;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function TraderProfileCardSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  if (size === 'sm') {
    return (
      <div className="flex items-center gap-3 p-3 animate-pulse">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1">
          <div className="w-24 h-4 bg-gray-200 rounded mb-1" />
          <div className="w-16 h-3 bg-gray-200 rounded" />
        </div>
        <div className="w-16 h-8 bg-gray-200 rounded-full" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="h-20 bg-gray-200" />
      <div className="px-4 pb-4">
        <div className="flex justify-between items-end -mt-8 mb-3">
          <div className="w-16 h-16 bg-gray-300 rounded-full border-4 border-white" />
          <div className="w-20 h-8 bg-gray-200 rounded-full" />
        </div>
        <div className="w-32 h-5 bg-gray-200 rounded mb-1" />
        <div className="w-24 h-4 bg-gray-200 rounded mb-3" />
        <div className="w-full h-12 bg-gray-100 rounded mb-3" />
        <div className="flex justify-between">
          <div className="w-16 h-4 bg-gray-200 rounded" />
          <div className="w-16 h-4 bg-gray-200 rounded" />
          <div className="w-16 h-4 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function TraderProfileCard({
  id,
  username,
  displayName,
  avatar,
  bio,
  isVerified,
  gain,
  winRate,
  followers,
  following,
  trades,
  isFollowing = false,
  onFollow,
  onViewProfile,
  size = 'md',
  loading,
}: TraderProfileCardProps) {
  const [followLoading, setFollowLoading] = useState(false);
  const [localIsFollowing, setLocalIsFollowing] = useState(isFollowing);

  if (loading) return <TraderProfileCardSkeleton size={size} />;

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onFollow) return;
    setFollowLoading(true);
    await onFollow(id);
    setLocalIsFollowing(!localIsFollowing);
    setFollowLoading(false);
  };

  // Compact version for sidebars/suggestions
  if (size === 'sm') {
    return (
      <div 
        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
        onClick={() => onViewProfile?.(id)}
      >
        {/* Avatar */}
        <div className="relative">
          {avatar ? (
            <img src={avatar} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a227] to-[#f0d78c] flex items-center justify-center text-white font-bold">
              {displayName.charAt(0)}
            </div>
          )}
          {isVerified && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-[#1a1a1d] truncate">{displayName}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className={gain >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {gain >= 0 ? '+' : ''}{gain.toFixed(1)}%
            </span>
            <span>•</span>
            <span>{followers.toLocaleString()} followers</span>
          </div>
        </div>

        {/* Follow button */}
        <button
          onClick={handleFollow}
          disabled={followLoading}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
            localIsFollowing
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-[#c9a227] text-white hover:bg-[#b8922a]'
          }`}
        >
          {followLoading ? '...' : localIsFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
    );
  }

  // Full card version
  return (
    <div 
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={() => onViewProfile?.(id)}
    >
      {/* Cover/Banner with gradient */}
      <div className="h-20 bg-gradient-to-r from-[#c9a227] via-[#d4af37] to-[#f0d78c] relative">
        {/* Performance badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
          gain >= 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {gain >= 0 ? '↑' : '↓'} {Math.abs(gain).toFixed(1)}%
        </div>
      </div>

      <div className="px-4 pb-4">
        {/* Avatar + Follow button row */}
        <div className="flex justify-between items-end -mt-8 mb-3">
          {/* Avatar */}
          <div className="relative">
            {avatar ? (
              <img 
                src={avatar} 
                alt={displayName} 
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c9a227] to-[#f0d78c] flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-md">
                {displayName.charAt(0)}
              </div>
            )}
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Follow button */}
          <button
            onClick={handleFollow}
            disabled={followLoading}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
              localIsFollowing
                ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-200'
                : 'bg-[#1a1a1d] text-white hover:bg-[#2a2a2d]'
            }`}
          >
            {followLoading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : localIsFollowing ? 'Following' : 'Follow'}
          </button>
        </div>

        {/* Name & username */}
        <div className="mb-2">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-[#1a1a1d] group-hover:text-[#c9a227] transition-colors">
              {displayName}
            </h3>
          </div>
          <p className="text-sm text-gray-500">@{username}</p>
        </div>

        {/* Bio */}
        {bio && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{bio}</p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-3">
          <div className="text-center">
            <div className="font-bold text-[#1a1a1d]">{trades}</div>
            <div className="text-xs text-gray-500">Trades</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-[#1a1a1d]">{followers.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Followers</div>
          </div>
          <div className="text-center">
            <div className={`font-bold ${winRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
              {winRate}%
            </div>
            <div className="text-xs text-gray-500">Win Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
