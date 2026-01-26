'use client';

import { useState } from 'react';

interface SecurityContentProps {
  twoFactorEnabled: boolean;
  onToggle2FA: (enabled: boolean) => void;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  saving: boolean;
}

export default function SecurityContent({
  twoFactorEnabled,
  onToggle2FA,
  onChangePassword,
  saving
}: SecurityContentProps) {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const success = await onChangePassword(form.currentPassword, form.newPassword);
    if (success) {
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-10">
        <h3 className="text-xl font-bold text-[#1a1a1d] mb-2">Security Settings</h3>
        <p className="text-gray-400 text-sm font-medium">Protect your account with a strong password and 2FA.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Current Password</label>
          <input
            type="password"
            required
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all font-semibold"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">New Password</label>
          <input
            type="password"
            required
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all font-semibold"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Confirm New Password</label>
          <input
            type="password"
            required
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all font-semibold"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3.5 bg-[#1a1a1d] text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
        >
          {saving ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      <div className="mt-12 pt-10 border-t border-gray-50">
        <div className="flex items-center justify-between p-6 bg-amber-50/50 border border-amber-100/50 rounded-2xl">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#c9a227] shadow-sm border border-amber-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-[#1a1a1d]">Two-Factor Authentication</h4>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Add an extra layer of security to your account.</p>
            </div>
          </div>
          <button
            onClick={() => onToggle2FA(!twoFactorEnabled)}
            className={`relative w-14 h-7 rounded-full transition-colors ${twoFactorEnabled ? 'bg-[#c9a227]' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${twoFactorEnabled ? 'translate-x-7' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
