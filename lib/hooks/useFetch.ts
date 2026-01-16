'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useFetch<T>(url: string, options?: RequestInit): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success === false) throw new Error(json.message || 'Request failed');
      setData(json.data ?? json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Parallel fetch for multiple endpoints
export function useDashboardData() {
  const [data, setData] = useState<{
    stats: any;
    trades: any[];
    transactions: any[];
    notifications: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, tradesRes, transactionsRes, notificationsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/trades'),
        fetch('/api/transactions'),
        fetch('/api/notifications'),
      ]);

      const [statsJson, tradesJson, transactionsJson, notificationsJson] = await Promise.all([
        statsRes.json(),
        tradesRes.json(),
        transactionsRes.json(),
        notificationsRes.json(),
      ]);

      setData({
        stats: statsJson.success ? statsJson.data : null,
        trades: tradesJson.success ? tradesJson.data || [] : [],
        transactions: transactionsJson.success ? transactionsJson.data?.slice(0, 10) || [] : [],
        notifications: notificationsJson.success ? notificationsJson.data?.slice(0, 10) || [] : [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { data, loading, error, refetch: fetchAll };
}
