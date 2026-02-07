'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/shared/Toast';
import { PageContainer } from '@/components/shared';
import { MyTradingTab } from '@/components/user';
import { useDashboardData } from '@/lib/hooks/useFetch';

interface Trade {
  id: number;
  symbol: string;
  type: string;
  amount: string;
  price: string;
  profit: number;
  status: string;
  created_at: string;
  opened_at?: string;
}

export default function TradingPage() {
  const { showToast } = useToast();
  const [mt5Accounts, setMt5Accounts] = useState<any[]>([]);
  
  const { data: dashboardData, loading: dataLoading, refetch } = useDashboardData();

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

  const trades: Trade[] = dashboardData?.trades || [];
  const stats = dashboardData?.stats;

  return (
    <PageContainer>
      <MyTradingTab
        mt5Accounts={mt5Accounts}
        trades={trades}
        stats={stats}
        showToast={showToast}
        fetchMT5Accounts={fetchMT5Accounts}
        onRefresh={refetch}
        isRefreshing={dataLoading}
      />
    </PageContainer>
  );
}
