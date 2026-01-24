'use client';

import { useState } from 'react';

interface JournalModalProps {
  trade: any;
  onClose: () => void;
  onUpdate: (updatedTrade: any) => void;
}

export default function JournalModal({ trade, onClose, onUpdate }: JournalModalProps) {
  const [notes, setNotes] = useState(trade.notes || '');
  const [tags, setTags] = useState(trade.tags || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      const res = await fetch('/api/trades/journal', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trade_id: trade.id,
          notes,
          tags
        })
      });

      const data = await res.json();
      if (data.success) {
        onUpdate(data.data);
        onClose();
      } else {
        setError(data.error || 'Failed to update journal');
      }
    } catch (err) {
      setError('A network error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1a1a1d]/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#c9a227] to-[#f0d78c] p-6 text-[#1a1a1d]">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold">Trading Journal</h3>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Trade #{trade.trade_number || trade.id}</p>
        </div>

        <div className="p-8 space-y-6">
          {/* Trade Info Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Asset</p>
              <p className="font-bold text-[#1a1a1d]">{trade.symbol}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Type</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trade.type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {trade.type}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Profit/Loss</p>
              <p className={`font-bold ${trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trade.profit >= 0 ? '+' : ''}${Math.abs(trade.profit || 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Notes Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] px-1">Entry Reflections & Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why did you take this trade? What did you learn? Emotion check..."
              className="w-full h-40 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] focus:outline-none transition-all resize-none font-medium text-[#1a1a1d]"
            />
          </div>

          {/* Tags Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] px-1">Strategy Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. TrendFollowing, SupportBreakout, FOMC"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] focus:outline-none transition-all font-semibold"
            />
          </div>

          {error && <p className="text-rose-500 text-xs font-bold text-center">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-4 bg-[#1a1a1d] text-white font-bold rounded-2xl hover:bg-[#2a2a2d] transition-all shadow-lg shadow-[#1a1a1d]/10 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Journal'}
            </button>
            <button
              onClick={onClose}
              className="px-8 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
