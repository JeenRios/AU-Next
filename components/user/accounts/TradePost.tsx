'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TradePostProps {
  id: string;
  trader: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    isVerified?: boolean;
  };
  trade?: {
    symbol: string;
    type: 'BUY' | 'SELL';
    profit: number;
    pips: number;
    entryPrice: number;
    exitPrice: number;
    duration: string;
  };
  content?: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  timestamp: string;
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
  onShare?: (id: string) => void;
  onBookmark?: (id: string) => void;
}

export function TradePostSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full" />
        <div className="flex-1">
          <div className="w-32 h-4 bg-gray-200 rounded mb-1" />
          <div className="w-20 h-3 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="w-full h-24 bg-gray-100 rounded-xl mb-4" />
      <div className="flex items-center gap-6">
        <div className="w-16 h-4 bg-gray-200 rounded" />
        <div className="w-16 h-4 bg-gray-200 rounded" />
        <div className="w-16 h-4 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export default function TradePost({
  id,
  trader,
  trade,
  content,
  image,
  likes,
  comments,
  shares,
  isLiked = false,
  isBookmarked = false,
  timestamp,
  onLike,
  onComment,
  onShare,
  onBookmark,
}: TradePostProps) {
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localLikes, setLocalLikes] = useState(likes);
  const [localBookmarked, setLocalBookmarked] = useState(isBookmarked);

  const handleLike = () => {
    setLocalLiked(!localLiked);
    setLocalLikes(localLiked ? localLikes - 1 : localLikes + 1);
    onLike?.(id);
  };

  const handleBookmark = () => {
    setLocalBookmarked(!localBookmarked);
    onBookmark?.(id);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-0">
        <Link href={`/traders/${trader?.id || ''}`} className="flex items-start gap-3 group">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {trader.avatar ? (
              <img src={trader.avatar} alt={trader.displayName} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c9a227] to-[#f0d78c] flex items-center justify-center text-white text-lg font-bold">
                {trader.displayName.charAt(0)}
              </div>
            )}
            {trader.isVerified && (
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Name & Time */}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#1a1a1d] group-hover:text-[#c9a227] transition-colors">
                {trader.displayName}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>@{trader.username}</span>
              <span>·</span>
              <span>{timestamp}</span>
            </div>
          </div>
        </Link>

        {/* More menu */}
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {content && <p className="text-[#1a1a1d] mb-3 whitespace-pre-wrap">{content}</p>}

        {/* Trade Card */}
        {trade && (
          <div className={`rounded-xl p-4 mb-3 ${
            trade.profit >= 0 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
              : 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  trade.type === 'BUY' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {trade.type}
                </span>
                <span className="font-bold text-lg text-[#1a1a1d]">{trade.symbol}</span>
              </div>
              <div className={`text-right ${trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <div className="text-xl font-bold">
                  {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                </div>
                <div className="text-sm">
                  {trade.pips >= 0 ? '+' : ''}{trade.pips.toFixed(1)} pips
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Entry</div>
                <div className="font-mono font-medium text-[#1a1a1d]">{trade.entryPrice.toFixed(5)}</div>
              </div>
              <div>
                <div className="text-gray-500">Exit</div>
                <div className="font-mono font-medium text-[#1a1a1d]">{trade.exitPrice.toFixed(5)}</div>
              </div>
              <div>
                <div className="text-gray-500">Duration</div>
                <div className="font-medium text-[#1a1a1d]">{trade.duration}</div>
              </div>
            </div>
          </div>
        )}

        {/* Image */}
        {image && (
          <div className="rounded-xl overflow-hidden mb-3">
            <img src={image} alt="Post image" className="w-full object-cover" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div className="flex items-center gap-1">
          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
              localLiked 
                ? 'text-red-500 hover:bg-red-50' 
                : 'text-gray-500 hover:bg-gray-100 hover:text-red-500'
            }`}
          >
            <svg className="w-5 h-5" fill={localLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm font-medium">{localLikes > 0 && localLikes}</span>
          </button>

          {/* Comment */}
          <button
            onClick={() => onComment?.(id)}
            className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-500 hover:bg-blue-50 hover:text-blue-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-medium">{comments > 0 && comments}</span>
          </button>

          {/* Share */}
          <button
            onClick={() => onShare?.(id)}
            className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-500 hover:bg-green-50 hover:text-green-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="text-sm font-medium">{shares > 0 && shares}</span>
          </button>
        </div>

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          className={`p-2 rounded-full transition-colors ${
            localBookmarked 
              ? 'text-primary-gold hover:bg-primary-gold/10' 
              : 'text-gray-400 hover:bg-gray-100 hover:text-[#c9a227]'
          }`}
        >
          <svg className="w-5 h-5" fill={localBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
