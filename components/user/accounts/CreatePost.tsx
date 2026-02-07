'use client';

import { useState } from 'react';

interface CreatePostProps {
  userAvatar?: string;
  userName?: string;
  onPost?: (data: { content: string; trade?: any }) => void;
  loading?: boolean;
}

export default function CreatePost({ userAvatar, userName = 'You', onPost, loading }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [trade, setTrade] = useState({
    symbol: '',
    type: 'BUY' as 'BUY' | 'SELL',
    profit: 0,
    pips: 0,
    entryPrice: 0,
    exitPrice: 0,
  });

  const handleSubmit = () => {
    if (!content.trim() && !showTradeForm) return;
    onPost?.({
      content,
      trade: showTradeForm ? trade : undefined,
    });
    setContent('');
    setShowTradeForm(false);
    setTrade({ symbol: '', type: 'BUY', profit: 0, pips: 0, entryPrice: 0, exitPrice: 0 });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Gold accent */}
      <div className="h-1 bg-gradient-to-r from-[#c9a227] via-[#f0d78c] to-[#c9a227]" />
      
      <div className="p-4">
        <div className="flex gap-3">
          {/* Avatar */}
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c9a227] to-[#f0d78c] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {userName.charAt(0)}
            </div>
          )}

          {/* Input area */}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your trade insight..."
              className="w-full resize-none border-0 focus:ring-0 text-lg placeholder-gray-400 bg-transparent"
              rows={2}
            />

            {/* Trade attachment form */}
            {showTradeForm && (
              <div className="bg-gray-50 rounded-xl p-4 mt-3 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-[#1a1a1d]">Attach Trade</span>
                  <button
                    onClick={() => setShowTradeForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Symbol</label>
                    <input
                      type="text"
                      value={trade.symbol}
                      onChange={(e) => setTrade({ ...trade, symbol: e.target.value.toUpperCase() })}
                      placeholder="EURUSD"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Type</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTrade({ ...trade, type: 'BUY' })}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          trade.type === 'BUY'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        BUY
                      </button>
                      <button
                        onClick={() => setTrade({ ...trade, type: 'SELL' })}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          trade.type === 'SELL'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        SELL
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Profit ($)</label>
                    <input
                      type="number"
                      value={trade.profit || ''}
                      onChange={(e) => setTrade({ ...trade, profit: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Pips</label>
                    <input
                      type="number"
                      value={trade.pips || ''}
                      onChange={(e) => setTrade({ ...trade, pips: parseFloat(e.target.value) || 0 })}
                      placeholder="0.0"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                {/* Attach trade */}
                <button
                  onClick={() => setShowTradeForm(!showTradeForm)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    showTradeForm
                      ? 'bg-[#c9a227]/10 text-[#c9a227]'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Trade
                </button>

                {/* Add image */}
                <button className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Image
                </button>

                {/* Add chart */}
                <button className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Chart
                </button>
              </div>

              {/* Post button */}
              <button
                onClick={handleSubmit}
                disabled={loading || (!content.trim() && !showTradeForm)}
                className="px-5 py-2 bg-gradient-to-r from-[#c9a227] to-[#d4af37] text-white font-semibold rounded-full hover:shadow-lg hover:shadow-[#c9a227]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
