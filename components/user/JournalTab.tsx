'use client';

import { useState, useEffect } from 'react';

interface JournalEntry {
  id: number;
  title: string;
  content: string;
  emotion: string;
  tags: string;
  created_at: string;
  updated_at: string;
}

export default function JournalTab({ user, showToast }: { user: any; showToast: (msg: string, type: 'success' | 'error' | 'info') => void }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    emotion: 'Neutral',
    tags: ''
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/journal');
      const data = await res.json();
      if (data.success) {
        setEntries(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch journal entries', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/journal';
      const method = editingEntry ? 'PATCH' : 'POST';
      const body = editingEntry
        ? { ...formData, id: editingEntry.id }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        showToast(editingEntry ? 'Entry updated successfully' : 'Entry created successfully', 'success');
        setIsFormOpen(false);
        setEditingEntry(null);
        setFormData({ title: '', content: '', emotion: 'Neutral', tags: '' });
        fetchEntries();
      } else {
        showToast(data.error || 'Operation failed', 'error');
      }
    } catch (err) {
      showToast('Error saving entry', 'error');
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      content: entry.content || '',
      emotion: entry.emotion || 'Neutral',
      tags: entry.tags || ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      const res = await fetch(`/api/journal?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Entry deleted successfully', 'success');
        fetchEntries();
      } else {
        showToast(data.error || 'Delete failed', 'error');
      }
    } catch (err) {
      showToast('Error deleting entry', 'error');
    }
  };

  const getEmotionEmoji = (emotion: string) => {
    switch (emotion) {
      case 'Confident': return '🚀';
      case 'Anxious': return '😰';
      case 'Frustrated': return '😤';
      case 'Happy': return '😊';
      case 'Neutral': return '😐';
      case 'Greedy': return '🤑';
      case 'Fearful': return '😨';
      default: return '📝';
    }
  };

  if (loading && entries.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a227]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#1a1a1d]">Trading Journal</h2>
        <button
          onClick={() => {
            setEditingEntry(null);
            setFormData({ title: '', content: '', emotion: 'Neutral', tags: '' });
            setIsFormOpen(true);
          }}
          className="px-6 py-2.5 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-bold rounded-xl transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New Entry
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white rounded-3xl border border-amber-100 shadow-xl p-6 mb-8 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#1a1a1d]">
              {editingEntry ? 'Edit Journal Entry' : 'New Journal Entry'}
            </h3>
            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Morning Gold Setup"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Emotion</label>
                <select
                  value={formData.emotion}
                  onChange={(e) => setFormData({ ...formData, emotion: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all outline-none"
                >
                  <option>Neutral</option>
                  <option>Confident</option>
                  <option>Anxious</option>
                  <option>Frustrated</option>
                  <option>Happy</option>
                  <option>Greedy</option>
                  <option>Fearful</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., #gold #nfp #long"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Notes / Rationale</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Why did you take this trade? What did you learn?"
                className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] outline-none transition-all resize-none h-40"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-[#1a1a1d] text-white font-bold rounded-xl hover:bg-[#2a2a2d] transition-all shadow-md"
              >
                {editingEntry ? 'Update Entry' : 'Save Entry'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 relative group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl">
                  {getEmotionEmoji(entry.emotion)}
                </div>
                <div>
                  <h4 className="font-bold text-[#1a1a1d] truncate max-w-[150px]">{entry.title}</h4>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(entry)}
                  className="p-2 text-gray-400 hover:text-[#c9a227] hover:bg-amber-50 rounded-lg transition-all"
                  aria-label="Edit entry"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                  aria-label="Delete entry"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 font-medium">
              {entry.content}
            </p>

            {entry.tags && (
              <div className="flex flex-wrap gap-2">
                {entry.tags.split(' ').filter(t => t.trim() !== '').map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-gray-100">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {entries.length === 0 && !loading && (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[#1a1a1d] mb-2">No journal entries yet</h3>
          <p className="text-gray-500 font-medium max-w-sm mx-auto mb-8">Start recording your trading thoughts and emotions to improve your market performance.</p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-8 py-3 bg-[#1a1a1d] text-white font-bold rounded-xl hover:bg-[#2a2a2d] transition-all"
          >
            Create Your First Entry
          </button>
        </div>
      )}
    </div>
  );
}
