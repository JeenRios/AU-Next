'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SideNavLayout, SideNavIcons, NavItem } from '@/components/shared';
import { AdminProvider } from '@/lib/hooks/useAdmin';

type AdminTab = 'overview' | 'users' | 'trading' | 'support' | 'system';

// Map pathname to tab id
const pathToTab: Record<string, AdminTab> = {
  '/admin': 'overview',
  '/admin/overview': 'overview',
  '/admin/users': 'users',
  '/admin/trading': 'trading',
  '/admin/support': 'support',
  '/admin/system': 'system',
};

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Determine active tab from pathname
  const activeTab = pathToTab[pathname] || 'overview';

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
    fetchNotificationCount();
  }, [router]);

  const fetchNotificationCount = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotificationCount(data.data.filter((n: any) => !n.is_read).length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleTabChange = (tab: AdminTab) => {
    if (tab === 'overview') {
      router.push('/admin');
    } else {
      router.push(`/admin/${tab}`);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileSidebarOpen) setMobileSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileSidebarOpen]);

  const navItems: NavItem<AdminTab>[] = [
    { id: 'overview', label: 'Overview', icon: SideNavIcons.overview },
    { id: 'users', label: 'Users', icon: SideNavIcons.users },
    { id: 'trading', label: 'Trading', icon: SideNavIcons.tradingChart },
    { id: 'support', label: 'Support', icon: SideNavIcons.support, badge: notificationCount },
    { id: 'system', label: 'System', icon: SideNavIcons.system },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-gold/5 to-gray-50 flex flex-col pt-[70px]">
      {/* Top Header Navigation */}
      <SideNavLayout<AdminTab>
        user={user}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        navItems={navItems}
        brandSuffix="Admin"
        welcomeText="Logged in as"
      />

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminProvider>
  );
}
