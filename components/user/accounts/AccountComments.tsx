'use client';

import { useState } from 'react';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  likes: number;
  isLiked?: boolean;
  createdAt: string;
  replies?: Comment[];
}

interface AccountCommentsProps {
  comments?: Comment[];
  loading?: boolean;
  currentUserId?: string;
  onAddComment?: (content: string) => void;
  onLikeComment?: (commentId: string) => void;
  onReply?: (commentId: string, content: string) => void;
}

export function AccountCommentsSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-[#c9a227] via-[#f0d78c] to-[#c9a227]" />
      <div className="p-6">
        <div className="w-32 h-6 bg-gray-200 rounded mb-6 animate-pulse" />
        <div className="h-20 bg-gray-100 rounded-lg mb-6 animate-pulse" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="w-24 h-4 bg-gray-200 rounded mb-2" />
                <div className="w-full h-12 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  currentUserId,
  onLike,
  onReply,
}: {
  comment: Comment;
  currentUserId?: string;
  onLike?: (id: string) => void;
  onReply?: (id: string, content: string) => void;
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReply = () => {
    if (onReply && replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText('');
      setShowReplyInput(false);
    }
  };

  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {comment.userAvatar ? (
          <img src={comment.userAvatar} alt={comment.userName} className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a227] to-[#f0d78c] flex items-center justify-center text-white font-semibold">
            {comment.userName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1">
        {/* Comment bubble */}
        <div className="bg-gray-50 rounded-2xl rounded-tl-none px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-[#1a1a1d]">{comment.userName}</span>
            <span className="text-xs text-gray-400">{comment.createdAt}</span>
          </div>
          <p className="text-sm text-gray-700">{comment.content}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-2 ml-2">
          <button
            onClick={() => onLike?.(comment.id)}
            className={`flex items-center gap-1 text-xs transition-colors ${
              comment.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <svg className="w-4 h-4" fill={comment.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {comment.likes > 0 && <span>{comment.likes}</span>}
          </button>
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="text-xs text-gray-400 hover:text-[#c9a227] transition-colors"
          >
            Reply
          </button>
        </div>

        {/* Reply input */}
        {showReplyInput && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227]"
              onKeyDown={(e) => e.key === 'Enter' && handleReply()}
            />
            <button
              onClick={handleReply}
              disabled={!replyText.trim()}
              className="px-3 py-2 bg-[#c9a227] text-white text-sm font-medium rounded-lg hover:bg-[#b8922a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reply
            </button>
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-100">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} currentUserId={currentUserId} onLike={onLike} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountComments({
  comments,
  loading,
  currentUserId,
  onAddComment,
  onLikeComment,
  onReply,
}: AccountCommentsProps) {
  const [newComment, setNewComment] = useState('');

  if (loading) return <AccountCommentsSkeleton />;

  const handleSubmit = () => {
    if (onAddComment && newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-[#c9a227] via-[#f0d78c] to-[#c9a227]" />
      <div className="p-6">
        <h3 className="text-lg font-bold text-[#1a1a1d] mb-6">
          Comments {comments && comments.length > 0 && <span className="text-gray-400 font-normal">({comments.length})</span>}
        </h3>

        {/* Add comment input */}
        <div className="mb-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a227] to-[#f0d78c] flex items-center justify-center text-white font-semibold">
                Y
              </div>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts on this account's performance..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] resize-none"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleSubmit}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-[#c9a227] to-[#d4af37] text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-[#c9a227]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments list */}
        {comments && comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                onLike={onLikeComment}
                onReply={onReply}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No comments yet</p>
            <p className="text-sm">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}
