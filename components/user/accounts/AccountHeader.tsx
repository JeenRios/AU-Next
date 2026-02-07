'use client';

import { useState } from 'react';

interface AccountHeaderProps {
  accountName: string;
  accountNumber?: string;
  broker?: string;
  isVerified?: boolean;
  isPublic?: boolean;
  isOwner?: boolean;
  lastSync?: string;
  status?: 'active' | 'inactive' | 'syncing';
  followers?: number;
  isFollowing?: boolean;
  onFollow?: () => void;
  onShare?: () => void;
  onSettings?: () => void;
  loading?: boolean;
}

export function AccountHeaderSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
      <div className="h-2 bg-gradient-to-r from-[#c9a227] via-[#f0d78c] to-[#c9a227]" />
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-xl" />
            <div>
              <div className="w-48 h-6 bg-gray-200 rounded mb-2" />
              <div className="w-32 h-4 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-24 h-10 bg-gray-200 rounded-lg" />
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountHeader({
  accountName,
  accountNumber,
  broker,
  isVerified = false,
  isPublic = true,
  isOwner = false,
  lastSync,
  status = 'active',
  followers = 0,
  isFollowing = false,
  onFollow,
  onShare,
  onSettings,
  loading,
}: AccountHeaderProps) {
  const [followLoading, setFollowLoading] = useState(false);

  if (loading) return <AccountHeaderSkeleton />;

  const handleFollow = async () => {
    if (!onFollow) return;
    setFollowLoading(true);
    await onFollow();
    setFollowLoading(false);
  };

  const statusConfig = {
    active: { label: 'Live', color: 'bg-green-500', textColor: 'text-green-600' },
    inactive: { label: 'Inactive', color: 'bg-gray-400', textColor: 'text-gray-600' },
    syncing: { label: 'Syncing', color: 'bg-blue-500 animate-pulse', textColor: 'text-blue-600' },
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Gold accent bar */}
      <div className="h-2 bg-gradient-to-r from-[#c9a227] via-[#f0d78c] to-[#c9a227]" />
      
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          {/* Left side - Account info */}
          <div className="flex items-center gap-4">
            {/* Account avatar/icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-xl flex items-center justify-center shadow-lg shadow-[#c9a227]/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>

            <div>
              {/* Account name with badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-[#1a1a1d]">{accountName}</h1>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                )}
                {!isPublic && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Private
                  </span>
                )}
              </div>

              {/* Account details */}
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                {/* Status indicator */}
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${statusConfig[status].color}`} />
                  <span className={statusConfig[status].textColor}>{statusConfig[status].label}</span>
                </div>

                {broker && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span>{broker}</span>
                  </>
                )}

                {accountNumber && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="font-mono">#{accountNumber}</span>
                  </>
                )}

                {lastSync && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span>Synced {lastSync}</span>
                  </>
                )}
              </div>

              {/* Followers */}
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="text-gray-600">
                  <span className="font-semibold text-[#1a1a1d]">{followers.toLocaleString()}</span> followers
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {!isOwner && (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  isFollowing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gradient-to-r from-[#c9a227] to-[#d4af37] text-white hover:shadow-lg hover:shadow-[#c9a227]/20'
                }`}
              >
                {followLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : isFollowing ? (
                  'Following'
                ) : (
                  'Follow'
                )}
              </button>
            )}

            {/* Share button */}
            <button
              onClick={onShare}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              title="Share"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>

            {/* Settings (owner only) */}
            {isOwner && (
              <button
                onClick={onSettings}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
