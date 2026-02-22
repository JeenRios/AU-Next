'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/shared';
import { ContentTabIcons } from '@/components/shared/ui/ContentTabs';
import {
  GeneralContent,
  SecurityContent,
  PreferencesContent,
  TradingContent,
  BillingContent
} from './settings';

interface SettingsTabProps {
  user: any;
  onUserUpdate?: (user: any) => void;
}

const settingsTabs = [
  { id: 'general', label: 'Profile Info', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ContentTabIcons.user} /></svg> },
  { id: 'security', label: 'Security', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ContentTabIcons.security} /></svg> },
  { id: 'preferences', label: 'Preferences', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ContentTabIcons.settings} /></svg> },
  { id: 'trading', label: 'Trading Defaults', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ContentTabIcons.chart} /></svg> },
  { id: 'billing', label: 'Billing & Plan', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ContentTabIcons.billing} /></svg> },
];

export default function SettingsTab({ user, onUserUpdate }: SettingsTabProps) {
  const router = useRouter();
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

        // Sync localStorage and parent state if name fields were updated
        if (updates.first_name !== undefined || updates.last_name !== undefined) {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userObj = JSON.parse(storedUser);
            const firstName = updates.first_name ?? data.data.first_name ?? '';
            const lastName = updates.last_name ?? data.data.last_name ?? '';
            const newName = `${firstName} ${lastName}`.trim();
            // Create new object to ensure React detects the change
            const updatedUser = {
              ...userObj,
              name: newName || userObj.email
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            onUserUpdate?.(updatedUser);
          }
        }
      } else {
        showMessage('error', data.error || 'Update failed');
      }
    } catch (err) {
      showMessage('error', 'A network error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      setSaving(true);
      const res = await fetch('/api/user/security', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage('success', 'Password updated successfully');
        return true;
      } else {
        showMessage('error', data.error || 'Password update failed');
        return false;
      }
    } catch (err) {
      showMessage('error', 'A network error occurred');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you absolutely sure? This will permanently delete your account and all trading history. This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/user/profile', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        router.push('/login?message=Account deleted');
      } else {
        showMessage('error', data.error || 'Failed to delete account');
      }
    } catch (err) {
      showMessage('error', 'A network error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a227]"></div>
      </div>
    );
  }

  const renderContent = (activeTab: string) => {
    switch (activeTab) {
      case 'general':
        return (
          <GeneralContent
            user={user}
            form={generalForm}
            setForm={setGeneralForm}
            onSave={handleUpdateProfile}
            saving={saving}
          />
        );
      case 'security':
        return (
          <SecurityContent
            twoFactorEnabled={preferencesForm.two_factor_enabled}
            onToggle2FA={(enabled) => {
              setPreferencesForm({ ...preferencesForm, two_factor_enabled: enabled });
              handleUpdateProfile({ two_factor_enabled: enabled });
            }}
            onChangePassword={handleChangePassword}
            saving={saving}
          />
        );
      case 'preferences':
        return (
          <PreferencesContent
            form={preferencesForm}
            setForm={setPreferencesForm}
            onUpdate={handleUpdateProfile}
            saving={saving}
          />
        );
      case 'trading':
        return (
          <TradingContent
            form={tradingForm}
            setForm={setTradingForm}
            onUpdate={handleUpdateProfile}
            saving={saving}
          />
        );
      case 'billing':
        return <BillingContent />;
      default:
        return null;
    }
  };

  return (
    <PageContainer
      tabs={settingsTabs}
      defaultTab="general"
      title="Settings"
      subtitle="Manage your account settings and preferences"
      className="h-full"
    >
      {(activeTab: string) => renderContent(activeTab)}
    </PageContainer>
  );
}
