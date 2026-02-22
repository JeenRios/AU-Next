'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useModal } from '@/components/shared/ModalProvider';

export interface User {
  id: number;
  email: string;
  role: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  last_login?: string;
}

export interface UserTrade {
  id: number;
  symbol: string;
  type: string;
  amount: string;
  price: string;
  profit?: number;
  status: string;
  created_at: string;
}

export interface UserAccount {
  id: number;
  account_id: string;
  broker: string;
  balance: number;
  equity: number;
  margin: number;
  free_margin: number;
  is_connected: boolean;
  created_at: string;
}

interface UserContextType {
  // Data
  user: User | null;
  trades: UserTrade[];
  accounts: UserAccount[];
  notifications: any[];
  
  // State
  loading: boolean;
  refreshing: boolean;
  
  // Actions
  fetchData: () => Promise<void>;
  handleConnectAccount: (accountData: any) => Promise<boolean>;
  handleDisconnectAccount: (accountId: number) => Promise<boolean>;
  handleUpdateProfile: (profileData: any) => Promise<boolean>;
  handleLogout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const modal = useModal();
  
  const [user, setUser] = useState<User | null>(null);
  const [trades, setTrades] = useState<UserTrade[]>([]);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [tradesRes, accountsRes, notificationsRes] = await Promise.all([
        fetch('/api/user/trades'),
        fetch('/api/user/accounts'),
        fetch('/api/user/notifications')
      ]);

      const tradesData = await tradesRes.json();
      const accountsData = await accountsRes.json();
      const notificationsData = await notificationsRes.json();

      if (tradesData.success) setTrades(tradesData.data || []);
      if (accountsData.success) setAccounts(accountsData.data || []);
      if (notificationsData.success) setNotifications(notificationsData.data.slice(0, 10) || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'user') {
      router.push('/admin');
      return;
    }
    
    setUser(parsedUser);
    fetchData();
  }, [router, fetchData]);

  const handleConnectAccount = async (accountData: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/user/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData)
      });

      const data = await response.json();

      if (response.ok) {
        fetchData();
        await modal.alert('Account connected successfully!', 'Success');
        return true;
      } else {
        await modal.alert(data.error || 'Failed to connect account', 'Error');
        return false;
      }
    } catch (error) {
      console.error('Error connecting account:', error);
      await modal.alert('Error connecting account', 'Error');
      return false;
    }
  };

  const handleDisconnectAccount = async (accountId: number): Promise<boolean> => {
    const confirmed = await modal.confirm(
      'This action will disconnect the account and stop all trading activity.',
      'Disconnect Account?'
    );
    
    if (!confirmed) return false;

    try {
      const response = await fetch(`/api/user/accounts?id=${accountId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchData();
        await modal.alert('Account disconnected successfully!', 'Success');
        return true;
      } else {
        await modal.alert('Failed to disconnect account', 'Error');
        return false;
      }
    } catch (error) {
      console.error('Error disconnecting account:', error);
      await modal.alert('Error disconnecting account', 'Error');
      return false;
    }
  };

  const handleUpdateProfile = async (profileData: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser.data);
        localStorage.setItem('user', JSON.stringify(updatedUser.data));
        await modal.alert('Profile updated successfully!', 'Success');
        return true;
      } else {
        const data = await response.json();
        await modal.alert(data.error || 'Failed to update profile', 'Error');
        return false;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      await modal.alert('Error updating profile', 'Error');
      return false;
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <UserContext.Provider value={{
      user,
      trades,
      accounts,
      notifications,
      loading,
      refreshing,
      fetchData,
      handleConnectAccount,
      handleDisconnectAccount,
      handleUpdateProfile,
      handleLogout,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
