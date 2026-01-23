'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function CommunityTab({ user }: { user: any }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [activeComments, setActiveComments] = useState<number | null>(null);
  const [postComments, setPostComments] = useState<{[key: number]: any[]}>({});
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      const [postsRes, leaderboardRes, suggestedRes] = await Promise.all([
        fetch('/api/community'),
        fetch('/api/community/leaderboard'),
        fetch('/api/community/suggested')
      ]);

      const [postsData, leaderboardData, suggestedData] = await Promise.all([
        postsRes.json(),
        leaderboardRes.json(),
        suggestedRes.json()
      ]);

      if (postsData.success) setPosts(postsData.data);
      if (leaderboardData.success) setLeaderboard(leaderboardData.data);
      if (suggestedData.success) setSuggested(suggestedData.data);
    } catch (err) {
      console.error('Failed to fetch community data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost })
      });
      const data = await res.json();
      if (data.success) {
        setNewPost('');
        // Refresh feed
        const freshPosts = await fetch('/api/community').then(r => r.json());
        if (freshPosts.success) setPosts(freshPosts.data);
      }
    } catch (err) {
      console.error('Create post failed', err);
    }
  };

  const handleLikePost = async (postId: number, liked: boolean) => {
    // Optimistic update
    setPosts(posts.map(p =>
      p.id === postId
        ? { ...p, liked: !liked, likes: liked ? p.likes - 1 : p.likes + 1 }
        : p
    ));

    try {
      await fetch('/api/community', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, action: liked ? 'unlike' : 'like' })
      });
    } catch (err) {
      // Revert on error
      fetchCommunityData();
    }
  };

  const handleFollow = async (targetUserId: number, following: boolean) => {
    // Optimistic update for posts feed
    setPosts(posts.map(p =>
      p.user.id === targetUserId
        ? { ...p, user: { ...p.user, following: !following } }
        : p
    ));

    // Optimistic update for suggested list
    setSuggested(suggested.map(s =>
      s.id === targetUserId
        ? { ...s, following: !following }
        : s
    ));

    try {
      await fetch('/api/community/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_user_id: targetUserId, action: following ? 'unfollow' : 'follow' })
      });
    } catch (err) {
      fetchCommunityData();
    }
  };

  const toggleComments = async (postId: number) => {
    if (activeComments === postId) {
      setActiveComments(null);
      return;
    }

    setActiveComments(postId);
    if (!postComments[postId]) {
      try {
        const res = await fetch(`/api/community/comments?post_id=${postId}`);
        const data = await res.json();
        if (data.success) {
          setPostComments({ ...postComments, [postId]: data.data });
        }
      } catch (err) {
        console.error('Fetch comments failed', err);
      }
    }
  };

  const handleAddComment = async (postId: number) => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch('/api/community/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, content: newComment })
      });
      const data = await res.json();
      if (data.success) {
        setNewComment('');
        // Refresh comments for this post
        const res2 = await fetch(`/api/community/comments?post_id=${postId}`);
        const data2 = await res2.json();
        if (data2.success) {
          setPostComments({ ...postComments, [postId]: data2.data });
          // Update comment count in posts list
          setPosts(posts.map(p => p.id === postId ? { ...p, comments: data2.data.length } : p));
        }
      }
    } catch (err) {
      console.error('Add comment failed', err);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a227]"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6 animate-in fade-in duration-500">
      {/* Main Feed Column */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* Create Post */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c9a227] to-[#f0d78c] flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share your trading insights, wins, or lessons learned..."
                className="w-full p-4 bg-gray-50/50 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] focus:outline-none transition-all resize-none h-28 font-medium text-sm"
              />
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-1">
                  <button className="p-2.5 text-gray-400 hover:text-[#c9a227] hover:bg-amber-50 rounded-xl transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button className="p-2.5 text-gray-400 hover:text-[#c9a227] hover:bg-amber-50 rounded-xl transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPost.trim()}
                  className="px-8 py-2.5 bg-[#1a1a1d] hover:bg-[#2a2a2d] text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-sm"
                >
                  Share Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feed Posts */}
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
            {/* Post Header */}
            <div className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 flex items-center justify-center text-[#c9a227] font-bold shadow-sm">
                {post.user.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1a1a1d]">{post.user.name}</span>
                  {post.user.verified && (
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {post.user.id !== user?.id && (
                    <>
                      <span className="text-gray-300">•</span>
                      <button
                        onClick={() => handleFollow(post.user.id, post.user.following)}
                        className={`text-xs font-bold transition-colors ${post.user.following ? 'text-gray-400' : 'text-[#c9a227] hover:text-[#b08d1e]'}`}
                      >
                        {post.user.following ? 'Following' : 'Follow'}
                      </button>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-400 font-medium">{post.timestamp}</div>
              </div>
              {post.profit && (
                <div className={`px-4 py-2 rounded-xl font-bold text-sm ${
                  post.profit.startsWith('+')
                    ? 'bg-green-50 text-green-700 border border-green-100'
                    : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {post.profit}
                </div>
              )}
            </div>

            {/* Post Content */}
            <div className="px-6 pb-6">
              <p className="text-[#1a1a1d] text-base leading-relaxed font-medium whitespace-pre-wrap">{post.content}</p>
              {post.image && (
                <div className="mt-4 rounded-2xl overflow-hidden border border-gray-100 relative h-64 w-full">
                  <Image
                    src={post.image}
                    alt="Post content"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex items-center gap-8">
              <button
                onClick={() => handleLikePost(post.id, post.liked)}
                className={`flex items-center gap-2 transition-all scale-100 active:scale-90 ${
                  post.liked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'
                }`}
              >
                <svg className="w-5 h-5" fill={post.liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="font-bold text-sm">{post.likes}</span>
              </button>
              <button
                onClick={() => toggleComments(post.id)}
                className={`flex items-center gap-2 transition-all ${activeComments === post.id ? 'text-[#c9a227]' : 'text-gray-400 hover:text-[#c9a227]'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-bold text-sm">{post.comments}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-[#c9a227] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="font-bold text-sm">Share</span>
              </button>
            </div>

            {/* Comments Section */}
            {activeComments === post.id && (
              <div className="px-6 py-6 bg-gray-50/30 border-t border-gray-50 space-y-6 animate-in slide-in-from-top-4 duration-300">
                {/* Comment List */}
                <div className="space-y-4">
                  {postComments[post.id]?.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-[#c9a227] text-xs font-bold flex-shrink-0 shadow-sm">
                        {comment.avatar}
                      </div>
                      <div className="flex-1 bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[#1a1a1d]">{comment.user_name}</span>
                          <span className="text-[10px] text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  {postComments[post.id]?.length === 0 && (
                    <p className="text-center text-xs text-gray-400 font-medium py-2">No comments yet. Be the first to reply!</p>
                  )}
                </div>

                {/* Add Comment */}
                <div className="flex gap-3 pt-2">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1a1d] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      placeholder="Write a comment..."
                      className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] text-sm font-medium transition-all"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      disabled={!newComment.trim()}
                      className="px-4 bg-[#c9a227] text-white rounded-xl hover:bg-[#b08d1e] transition-colors disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {posts.length === 0 && !loading && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#1a1a1d]">No posts found</h3>
            <p className="text-sm text-gray-500 font-medium">Be the first to share something with the community!</p>
          </div>
        )}
      </div>

      {/* Right Sidebar Column */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        {/* Leaderboard */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-8">
          <h3 className="font-bold text-[#1a1a1d] mb-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-[#c9a227]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            Top Traders
          </h3>

          <div className="space-y-4">
            {leaderboard.map((trader, idx) => (
              <div key={idx} className={`flex items-center gap-4 p-3 rounded-2xl transition-all border ${
                idx === 0 ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100 shadow-sm' : 'border-transparent hover:bg-gray-50'
              }`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm ${
                  idx === 0 ? 'bg-[#c9a227] text-white' :
                  idx === 1 ? 'bg-slate-300 text-white' :
                  idx === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {trader.rank}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[#1a1a1d] text-sm truncate max-w-[120px]">{trader.name}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{trader.winRate} Win Rate</div>
                </div>
                <div className="text-green-600 font-black text-sm">{trader.profit}</div>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <p className="text-center text-xs text-gray-400 py-4 font-medium">Trading stats being calculated...</p>
            )}
          </div>

          <button className="w-full mt-6 py-3 border border-gray-100 text-gray-500 hover:text-[#c9a227] hover:bg-amber-50 hover:border-amber-100 font-bold rounded-2xl transition-all text-xs">
            View Ranking Methodology
          </button>
        </div>

        {/* Suggested Traders */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-[#1a1a1d] mb-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            Traders to Follow
          </h3>

          <div className="space-y-4">
            {suggested.map((trader) => (
              <div key={trader.id} className="flex items-center gap-4 p-2 group">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 font-bold text-sm shadow-sm group-hover:scale-110 transition-transform">
                  {trader.avatar}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[#1a1a1d] text-sm flex items-center gap-1.5">
                    {trader.name}
                    {trader.verified && <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  </div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{trader.followers_count} followers</div>
                </div>
                <button
                  onClick={() => handleFollow(trader.id, trader.following)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    trader.following
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-[#1a1a1d] text-white hover:bg-[#2a2a2d] hover:-translate-y-0.5'
                  }`}
                >
                  {trader.following ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Hashtags */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-[#1a1a1d] mb-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            Market Hot Topics
          </h3>

          <div className="space-y-2">
            {['#XAUUSD', '#GoldBullRun', '#CPI_Data', '#ForexSignals', '#TradingPsychology'].map((topic, idx) => (
              <button key={idx} className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100 group">
                <div className="font-bold text-[#c9a227] text-sm group-hover:translate-x-1 transition-transform">{topic}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{Math.floor(Math.random() * 500) + 100} discussions</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
