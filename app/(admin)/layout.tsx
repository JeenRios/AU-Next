'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { TopNavBar, TopNavIcons, NavItem, BackgroundEffects, PageContainer } from '@/components/shared';
import { AdminProvider, useAdmin } from '@/lib/hooks/useAdmin';

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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, handleLogout, notificationCount } = useAdmin();

  // Determine active tab from pathname
  const activeTab = pathToTab[pathname] || 'overview';

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
    { id: 'overview', label: 'Overview', icon: TopNavIcons.overview },
    { id: 'users', label: 'Users', icon: TopNavIcons.users },
    { id: 'trading', label: 'Trading', icon: TopNavIcons.tradingChart },
    { id: 'support', label: 'Support', icon: TopNavIcons.support, badge: notificationCount },
    { id: 'system', label: 'System', icon: TopNavIcons.system },
  ];

  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#f5e6b5] via-[#d4af37] to-[#8a6d1b] 
                   flex flex-col overflow-hidden relative isolate">
      {/* Background effects */}
      <BackgroundEffects />
      
      {/* Top Navigation Bar - positioned absolutely at top */}
      <div className="relative z-20">
        <TopNavBar<AdminTab>
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
      </div>

      {/* Main content area with card container */}
      <div className="flex-1 flex flex-col min-h-0 pt-[70px] pb-2 px-2 z-10 w-full overflow-hidden">
        <div className="w-full h-full bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 overflow-hidden relative flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth w-full">
            <div className="w-full h-full">
              <PageContainer variant="default">
                {/* Main Content */}
                <main className="flex-1">
                  {children}
                </main>
              </PageContainer>
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
