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
    <div className="h-screen w-full bg-gradient-to-br from-[#f5e6b5] via-[#d4af37] to-[#8a6d1b] flex flex-col overflow-hidden relative isolate">
      {/* Enhanced Abstract Background Shapes - More Visible */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
         {/* Top Left Highlights - Sharp White */}
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/20 blur-[100px] animate-blob mix-blend-overlay"></div>
         
         {/* Bottom Right Depths - Dark Contrast */}
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#8a6d1b]/40 blur-[80px] animate-blob animation-delay-2000 mix-blend-multiply"></div>

         {/* Floating Blobs (Distinct shapes) */}
         <div className="absolute top-[20%] right-[15%] w-[350px] h-[350px] rounded-full bg-[#f0d78c]/60 blur-[60px] animate-blob mix-blend-overlay" style={{ animationDelay: '0s' }}></div>
         <div className="absolute bottom-[25%] left-[15%] w-[450px] h-[450px] rounded-full bg-[#c9a227]/40 blur-[90px] animate-blob mix-blend-overlay" style={{ animationDelay: '2s' }}></div>
         <div className="absolute top-[45%] left-[45%] w-[400px] h-[400px] rounded-full bg-[#ffeebb]/50 blur-[70px] animate-blob mix-blend-overlay" style={{ animationDelay: '4s' }}></div>
      </div>

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
      <div className="flex-1 flex flex-col min-h-0 pt-[70px] pb-2 px-2 z-10 w-full overflow-hidden">
        <div className="w-full h-full bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 overflow-hidden relative flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth w-full">
             <div className="w-full h-full">
               {children}
             </div>
          </div>
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
