'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Tab = 'general' | 'security' | 'preferences' | 'trading';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profile, setProfile] = useState<any>(null);

  // Form states
  const [generalForm, setGeneralForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    country: '',
    city: '',
    address: '',
    postal_code: '',
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferencesForm, setPreferencesForm] = useState({
    language: 'en',
    timezone: 'UTC',
    email_notifications_enabled: true,
    push_notifications_enabled: true,
    sms_notifications_enabled: false,
    two_factor_enabled: false,
  });

  const [tradingForm, setTradingForm] = useState({
    trading_risk_level: 'moderate',
    default_stop_loss: '',
    default_take_profit: '',
  });

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setGeneralForm({
          first_name: data.data.first_name || '',
          last_name: data.data.last_name || '',
          phone: data.data.phone || '',
          country: data.data.country || '',
          city: data.data.city || '',
          address: data.data.address || '',
          postal_code: data.data.postal_code || '',
        });
        setPreferencesForm({
          language: data.data.language || 'en',
          timezone: data.data.timezone || 'UTC',
          email_notifications_enabled: data.data.email_notifications_enabled ?? true,
          push_notifications_enabled: data.data.push_notifications_enabled ?? true,
          sms_notifications_enabled: data.data.sms_notifications_enabled ?? false,
          two_factor_enabled: data.data.two_factor_enabled ?? false,
        });
        setTradingForm({
          trading_risk_level: data.data.trading_risk_level || 'moderate',
          default_stop_loss: data.data.default_stop_loss || '',
          default_take_profit: data.data.default_take_profit || '',
        });
      } else if (res.status === 401) {
        router.push('/login');
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleUpdateProfile = async (updates: any) => {
    try {
      setSaving(true);
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        showMessage('success', data.message || 'Settings updated successfully');
      } else {
        showMessage('error', data.error || 'Update failed');
      }
    } catch (err) {
      showMessage('error', 'A network error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      showMessage('error', 'Passwords do not match');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/user/security', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: securityForm.currentPassword,
          newPassword: securityForm.newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage('success', 'Password updated successfully');
        setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showMessage('error', data.error || 'Password update failed');
      }
    } catch (err) {
      showMessage('error', 'A network error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a227]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-xl flex items-center justify-center text-[#1a1a1d] font-bold shadow-sm">A</div>
            <div className="text-xl font-bold text-[#1a1a1d]">AU<span className="text-[#c9a227]">Next</span></div>
          </div>
          <div className="flex items-center gap-8">
            <a href="/dashboard" className="text-sm font-semibold text-gray-500 hover:text-[#c9a227] transition-colors">Dashboard</a>
            <a href="/trades" className="text-sm font-semibold text-gray-500 hover:text-[#c9a227] transition-colors">Trades</a>
            <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-[#c9a227] text-xs font-bold">
              {profile?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#1a1a1d] mb-2">Account Settings</h1>
          <p className="text-gray-500 font-medium">Manage your profile, security, and trading preferences.</p>
        </div>

        {message.text && (
          <div className={`mb-8 p-4 rounded-xl border ${
            message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
          } flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300`}>
            {message.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            <span className="text-sm font-bold">{message.text}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 space-y-1">
            {[
              { id: 'general', label: 'General', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
              { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
              { id: 'preferences', label: 'Preferences', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
              { id: 'trading', label: 'Trading', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-[#c9a227] shadow-sm border border-gray-100'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {activeTab === 'general' && (
              <div className="p-8">
                <div className="flex items-center gap-6 mb-10 pb-8 border-b border-gray-50">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl flex items-center justify-center text-[#c9a227] border border-amber-100">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1a1a1d]">{generalForm.first_name || 'Personal'} {generalForm.last_name || 'Information'}</h3>
                    <p className="text-gray-400 text-sm font-medium">{profile?.email} • {profile?.role?.toUpperCase()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">First Name</label>
                    <input
                      type="text"
                      value={generalForm.first_name}
                      onChange={(e) => setGeneralForm({ ...generalForm, first_name: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all text-[#1a1a1d] font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Last Name</label>
                    <input
                      type="text"
                      value={generalForm.last_name}
                      onChange={(e) => setGeneralForm({ ...generalForm, last_name: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all text-[#1a1a1d] font-semibold"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Phone Number</label>
                    <input
                      type="tel"
                      value={generalForm.phone}
                      onChange={(e) => setGeneralForm({ ...generalForm, phone: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all text-[#1a1a1d] font-semibold"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Country</label>
                    <input
                      type="text"
                      value={generalForm.country}
                      onChange={(e) => setGeneralForm({ ...generalForm, country: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all text-[#1a1a1d] font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">City</label>
                    <input
                      type="text"
                      value={generalForm.city}
                      onChange={(e) => setGeneralForm({ ...generalForm, city: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all text-[#1a1a1d] font-semibold"
                    />
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-50">
                  <button
                    onClick={() => handleUpdateProfile(generalForm)}
                    disabled={saving}
                    className="px-8 py-3.5 bg-[#1a1a1d] hover:bg-[#2a2a2d] text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="p-8">
                <div className="mb-10">
                  <h3 className="text-xl font-bold text-[#1a1a1d] mb-2">Security Settings</h3>
                  <p className="text-gray-400 text-sm font-medium">Protect your account with a strong password and 2FA.</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={securityForm.confirmPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
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
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1a1a1d]">Two-Factor Authentication</h4>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">Add an extra layer of security to your account.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const nextVal = !preferencesForm.two_factor_enabled;
                        setPreferencesForm({ ...preferencesForm, two_factor_enabled: nextVal });
                        handleUpdateProfile({ two_factor_enabled: nextVal });
                      }}
                      className={`relative w-14 h-7 rounded-full transition-colors ${preferencesForm.two_factor_enabled ? 'bg-[#c9a227]' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${preferencesForm.two_factor_enabled ? 'translate-x-7' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="p-8">
                <div className="mb-10">
                  <h3 className="text-xl font-bold text-[#1a1a1d] mb-2">App Preferences</h3>
                  <p className="text-gray-400 text-sm font-medium">Customize your experience and notifications.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Language</label>
                    <select
                      value={preferencesForm.language}
                      onChange={(e) => {
                        setPreferencesForm({ ...preferencesForm, language: e.target.value });
                        handleUpdateProfile({ language: e.target.value });
                      }}
                      className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all font-semibold appearance-none"
                    >
                      <option value="en">English (US)</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Timezone</label>
                    <select
                      value={preferencesForm.timezone}
                      onChange={(e) => {
                        setPreferencesForm({ ...preferencesForm, timezone: e.target.value });
                        handleUpdateProfile({ timezone: e.target.value });
                      }}
                      className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all font-semibold appearance-none"
                    >
                      <option value="UTC">UTC (Greenwich Mean Time)</option>
                      <option value="America/New_York">EST (Eastern Standard Time)</option>
                      <option value="Europe/London">GMT/BST (London)</option>
                      <option value="Asia/Tokyo">JST (Tokyo)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-12 space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Notification Channels</h4>

                  {[
                    { id: 'email_notifications_enabled', label: 'Email Notifications', desc: 'Receive trade reports and account alerts via email.', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                    { id: 'push_notifications_enabled', label: 'Browser Push', desc: 'Real-time alerts directly on your device.', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
                    { id: 'sms_notifications_enabled', label: 'SMS Alerts', desc: 'Urgent margin calls and execution alerts via text.', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
                  ].map((chan) => (
                    <div key={chan.id} className="flex items-center justify-between p-5 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={chan.icon} /></svg>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#1a1a1d]">{chan.label}</p>
                          <p className="text-xs text-gray-400 font-medium mt-0.5">{chan.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const field = chan.id as keyof typeof preferencesForm;
                          const nextVal = !preferencesForm[field];
                          setPreferencesForm({ ...preferencesForm, [field]: nextVal });
                          handleUpdateProfile({ [field]: nextVal });
                        }}
                        className={`relative w-12 h-6 rounded-full transition-colors ${preferencesForm[chan.id as keyof typeof preferencesForm] ? 'bg-[#c9a227]' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${preferencesForm[chan.id as keyof typeof preferencesForm] ? 'translate-x-6' : ''}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'trading' && (
              <div className="p-8">
                <div className="mb-10">
                  <h3 className="text-xl font-bold text-[#1a1a1d] mb-2">Trading Defaults</h3>
                  <p className="text-gray-400 text-sm font-medium">Set your global risk parameters and execution defaults.</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Risk Appetite</label>
                    <div className="grid grid-cols-3 gap-4">
                      {['conservative', 'moderate', 'aggressive'].map((level) => (
                        <button
                          key={level}
                          onClick={() => {
                            setTradingForm({ ...tradingForm, trading_risk_level: level });
                            handleUpdateProfile({ trading_risk_level: level });
                          }}
                          className={`py-4 rounded-2xl border text-sm font-bold capitalize transition-all ${
                            tradingForm.trading_risk_level === level
                              ? 'bg-amber-50 border-[#c9a227] text-[#c9a227] shadow-sm shadow-amber-100'
                              : 'bg-gray-50/50 border-gray-100 text-gray-400 hover:border-gray-200'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium italic px-1">
                      * This setting influences our EA&apos;s position sizing and drawdown thresholds.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 pt-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Default Stop Loss (Pips)</label>
                      <input
                        type="number"
                        placeholder="e.g. 30"
                        value={tradingForm.default_stop_loss}
                        onChange={(e) => setTradingForm({ ...tradingForm, default_stop_loss: e.target.value })}
                        className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Default Take Profit (Pips)</label>
                      <input
                        type="number"
                        placeholder="e.g. 60"
                        value={tradingForm.default_take_profit}
                        onChange={(e) => setTradingForm({ ...tradingForm, default_take_profit: e.target.value })}
                        className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div className="mt-6 pt-8 border-t border-gray-50">
                    <button
                      onClick={() => handleUpdateProfile({
                        default_stop_loss: tradingForm.default_stop_loss,
                        default_take_profit: tradingForm.default_take_profit
                      })}
                      disabled={saving}
                      className="px-8 py-3.5 bg-[#1a1a1d] text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Trading Defaults'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Deletion (Danger Zone) */}
        <div className="mt-16 pt-12 border-t border-gray-100">
          <div className="p-8 bg-red-50/30 border border-red-100 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-red-700 font-bold text-lg mb-1">Delete Account</h4>
              <p className="text-red-600/70 text-sm font-medium">Permanently remove your account and all associated data. This action is irreversible.</p>
            </div>
            <button className="px-6 py-3 bg-white border border-red-200 text-red-600 font-bold text-sm rounded-xl hover:bg-red-50 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
