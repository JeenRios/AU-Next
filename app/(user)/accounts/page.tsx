'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/shared';
import { AccountsTab } from '@/components/user';

export default function AccountsPage() {
  const router = useRouter();
  const [mt5Accounts, setMt5Accounts] = useState<any[]>([]);

  useEffect(() => {
    fetchMT5Accounts();
  }, []);

  const fetchMT5Accounts = async () => {
    try {
      const res = await fetch('/api/mt5/connect');
      const data = await res.json();
      if (data.success && data.data) {
        setMt5Accounts(data.data);
      }
    } catch (err) {
      console.error('Error fetching MT5 accounts:', err);
    }
  };

  const handleConnectAccount = async (data: any) => {
    try {
      const res = await fetch('/api/mt5/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_number: data.login,
          server: data.server,
          platform: 'MT5',
          password: data.password || data.investorPassword,
        })
      });
      const result = await res.json();
      if (result?.success) {
        fetchMT5Accounts();
      } else {
        console.error(result?.error || result?.message || 'Failed to request MT5 connection.');
      }
    } catch (err) {
      console.error('MT5 connect error:', err);
    }
  };

  return (
    <PageContainer>
      <AccountsTab
        mt5Accounts={mt5Accounts}
        fetchMT5Accounts={fetchMT5Accounts}
        onConnectAccount={handleConnectAccount}
      />
    </PageContainer>
  );
}
