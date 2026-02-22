'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useModal } from '@/components/shared/ModalProvider';

interface Trade {
  id: number;
  symbol: string;
  type: string;
  amount: string;
  price: string;
  status: string;
  created_at: string;
  opened_at?: string;
}

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

interface AdminContextType {
  // Data
  user: any;
  stats: any;
  trades: Trade[];
  users: User[];
  notifications: any[];
  tickets: any[];
  auditLogs: any[];
  vpsInstances: any[];
  mt5Accounts: any[];
  automationJobs: any[];
  notificationCount: number;
  
  // State
  loading: boolean;
  refreshing: boolean;
  
  // Actions
  fetchData: () => Promise<void>;
  handleAddUser: (userData: any) => Promise<boolean>;
  handleDeleteUser: (userId: number) => Promise<boolean>;
  handleUpdateUser: (userId: number, userData: any) => Promise<boolean>;
  handleLogout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const modal = useModal();
  
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [vpsInstances, setVpsInstances] = useState<any[]>([]);
  const [mt5Accounts, setMt5Accounts] = useState<any[]>([]);
  const [automationJobs, setAutomationJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [statsRes, tradesRes, usersRes, notificationsRes, ticketsRes, vpsRes, mt5Res, jobsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/trades'),
        fetch('/api/users'),
        fetch('/api/notifications'),
        fetch('/api/tickets'),
        fetch('/api/vps'),
        fetch('/api/mt5/connect'),
        fetch('/api/automation/jobs')
      ]);

      const statsData = await statsRes.json();
      const tradesData = await tradesRes.json();
      const usersData = await usersRes.json();
      const notificationsData = await notificationsRes.json();
      const ticketsData = await ticketsRes.json();
      const vpsData = await vpsRes.json();
      const mt5Data = await mt5Res.json();
      const jobsData = await jobsRes.json();

      if (statsData.success) setStats(statsData.data);
      if (tradesData.success) setTrades(tradesData.data);
      if (usersData.success) setUsers(usersData.data);
      if (notificationsData.success) {
        setNotifications(notificationsData.data.slice(0, 10));
        setNotificationCount(notificationsData.data.filter((n: any) => !n.is_read).length);
      }
      if (ticketsData.success) setTickets(ticketsData.data.filter((t: any) => t.status === 'open').slice(0, 10));
      if (vpsData.success) setVpsInstances(vpsData.data || []);
      if (mt5Data.success) setMt5Accounts(mt5Data.data || []);
      if (jobsData.success) setAutomationJobs(jobsData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
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
    if (parsedUser.role !== 'admin') {
      router.push('/accounts');
      return;
    }
    
    setUser(parsedUser);
    fetchData();
  }, [router, fetchData]);

  const handleAddUser = async (userData: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        fetchData();
        await modal.alert('User created successfully!', 'Success');
        return true;
      } else {
        await modal.alert(data.error || 'Failed to create user', 'Error');
        return false;
      }
    } catch (error) {
      console.error('Error adding user:', error);
      await modal.alert('Error creating user', 'Error');
      return false;
    }
  };

  const handleDeleteUser = async (userId: number): Promise<boolean> => {
    const confirmed = await modal.confirm(
      'This action cannot be undone. The user and all associated data will be permanently deleted.',
      'Delete User?'
    );
    
    if (!confirmed) return false;

    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchData();
        await modal.alert('User deleted successfully!', 'Success');
        return true;
      } else {
        await modal.alert('Failed to delete user', 'Error');
        return false;
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      await modal.alert('Error deleting user', 'Error');
      return false;
    }
  };

  const handleUpdateUser = async (userId: number, userData: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, ...userData })
      });

      if (response.ok) {
        fetchData();
        return true;
      } else {
        const data = await response.json();
        await modal.alert(data.error || 'Failed to update user', 'Error');
        return false;
      }
    } catch (error) {
      console.error('Error updating user:', error);
      await modal.alert('Error updating user', 'Error');
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
    <AdminContext.Provider value={{
      user,
      stats,
      trades,
      users,
      notifications,
      tickets,
      auditLogs,
      vpsInstances,
      mt5Accounts,
      automationJobs,
      notificationCount,
      loading,
      refreshing,
      fetchData,
      handleAddUser,
      handleDeleteUser,
      handleUpdateUser,
      handleLogout,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
