'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/components/shared/Toast';
import { SideNavLayout, SideNavIcons, NavItem } from '@/components/shared';
import { ErrorState } from '@/components/user';

type UserTab = 'feed' | 'accounts' | 'dashboard' | 'trading' | 'community' | 'journal' | 'settings' | 'profile';

const userNavItems: NavItem<UserTab>[] = [
  { id: 'feed', label: 'Main Feed', icon: SideNavIcons.feed },
  { id: 'accounts', label: 'Accounts', icon: SideNavIcons.tradingChart },
  { id: 'dashboard', label: 'Dashboard', icon: SideNavIcons.dashboard },
  { id: 'trading', label: 'My Trading', icon: SideNavIcons.trading },
  { id: 'community', label: 'Community', icon: SideNavIcons.community },
  { id: 'journal', label: 'Trading Journal', icon: SideNavIcons.journal },
  { id: 'settings', label: 'Settings', icon: SideNavIcons.settings },
];

// Map pathname to tab id
const pathToTab: Record<string, UserTab> = {
  '/feed': 'feed',
  '/accounts': 'accounts',
  '/dashboard': 'dashboard',
  '/trading': 'trading',
  '/community': 'community',
  '/journal': 'journal',
  '/settings': 'settings',
  '/profile': 'profile',
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { showToast, ToastContainer } = useToast();

  // Optimistic UI state for active tab
  // Initialize from current path, default to 'accounts'
  const [activeTab, setActiveTab] = useState<UserTab>(() => pathToTab[pathname] || 'accounts');

  // Sync state with URL changes (e.g. back button, deep links)
  useEffect(() => {
    const tab = pathToTab[pathname];
    if (tab) {
      setActiveTab(tab);
    }
  }, [pathname]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleTabChange = (tab: UserTab) => {
    // Optimistic update - update UI immediately before route change
    setActiveTab(tab);
    router.push(`/${tab}`);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileSidebarOpen) setMobileSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileSidebarOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-gold/5 to-gray-50 flex flex-col pt-[70px]">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-gold focus:text-surface-dark focus:rounded-lg focus:font-semibold">
        Skip to main content
      </a>
      <ToastContainer />
      
      {/* Top Header Navigation */}
      <SideNavLayout<UserTab>
        user={user}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        navItems={userNavItems}
        brandSuffix="Next"
        welcomeText="Welcome back"
        onProfileClick={() => handleTabChange('profile')}
      />

      {/* Main Content */}
      <main id="main-content" className="flex-1 min-h-screen container mx-auto px-4 py-6 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
