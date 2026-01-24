'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';

interface JournalEntry {
  id: number;
  title: string;
  content: string;
  emotion: string;
  tags: string[];
  created_at: string;
}

const EMOTIONS = [
  { label: 'Confident', icon: '💪', color: 'bg-green-100 text-green-700' },
  { label: 'Neutral', icon: '😐', color: 'bg-gray-100 text-gray-700' },
  { label: 'Stressed', icon: '😫', color: 'bg-red-100 text-red-700' },
  { label: 'Greedy', icon: '🤑', color: 'bg-yellow-100 text-yellow-700' },
  { label: 'Fearful', icon: '😨', color: 'bg-orange-100 text-orange-700' },
];

export default function TradingJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    emotion: 'Neutral',
    tags: '',
  });

  useEffect(() => {
    fetchEntries();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/journal');
      const data = await res.json();
      if (data.success) {
        setEntries(data.data);
      }
    } catch (err) {
      console.error('Error fetching journal entries:', err);
      showToast('Failed to load journal entries', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const method = isEditing ? 'PATCH' : 'POST';
      const body = isEditing
        ? { ...formData, id: isEditing, tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean) }
        : { ...formData, tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean) };

      const res = await fetch('/api/journal', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        showToast(isEditing ? 'Entry updated' : 'Entry created', 'success');
        fetchEntries();
        setShowForm(false);
        setIsEditing(null);
        setFormData({ title: '', content: '', emotion: 'Neutral', tags: '' });
      } else {
        showToast(data.error || 'Something went wrong', 'error');
      }
    } catch (err) {
      console.error('Error saving journal entry:', err);
      showToast('Error saving journal entry', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setFormData({
      title: entry.title,
      content: entry.content,
      emotion: entry.emotion || 'Neutral',
      tags: (entry.tags || []).join(', '),
    });
    setIsEditing(entry.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const res = await fetch(`/api/journal?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Entry deleted', 'success');
        fetchEntries();
      }
    } catch (err) {
      console.error('Error deleting journal entry:', err);
      showToast('Error deleting entry', 'error');
    }
  };

  const getEmotionDetails = (emotionName: string) => {
    return EMOTIONS.find(e => e.label === emotionName) || EMOTIONS[1];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#1a1a1d]">Trading Journal</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Entry
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#1a1a1d]">
              {isEditing ? 'Edit Entry' : 'New Journal Entry'}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setIsEditing(null);
                setFormData({ title: '', content: '', emotion: 'Neutral', tags: '' });
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Morning Session - XAUUSD Analysis"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Emotion</label>
              <div className="flex flex-wrap gap-2">
                {EMOTIONS.map((e) => (
                  <button
                    key={e.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, emotion: e.label })}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      formData.emotion === e.label
                        ? 'bg-[#c9a227] text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{e.icon}</span>
                    {e.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="What did you learn today? How did the market behave? Any psychological barriers?"
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c9a227] focus:border-transparent resize-none h-40"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="XAUUSD, Scalping, FOMC"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                {submitting ? 'Saving...' : isEditing ? 'Update Entry' : 'Save Entry'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setIsEditing(null);
                  setFormData({ title: '', content: '', emotion: 'Neutral', tags: '' });
                }}
                className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[#1a1a1d] mb-2">No journal entries yet</h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">Start documenting your trading journey to improve your performance and psychology.</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all"
          >
            Create Your First Entry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {entries.map((entry) => {
            const emotion = getEmotionDetails(entry.emotion);
            return (
              <div key={entry.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col group">
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${emotion.color}`}>
                      <span>{emotion.icon}</span>
                      {emotion.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(entry.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-[#1a1a1d] mb-2 group-hover:text-[#c9a227] transition-colors">{entry.title}</h4>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">{entry.content}</p>

                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-50 border border-gray-100 text-gray-500 rounded text-[10px] font-medium uppercase tracking-wider">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/30 rounded-b-2xl flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
