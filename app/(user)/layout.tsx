'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { TopNavBar, TopNavIcons, NavItem, AppLayout, BackgroundEffects, PageContainer } from '@/components/shared';
import { UserProvider, useUser } from '@/lib/hooks/useUser';
import { ErrorState } from '@/components/user';

type UserTab = 'feed' | 'accounts' | 'dashboard' | 'trading' | 'community' | 'journal' | 'settings' | 'profile';

const userNavItems: NavItem<UserTab>[] = [
  { id: 'feed', label: 'Main Feed', icon: TopNavIcons.feed },
  { id: 'accounts', label: 'Accounts', icon: TopNavIcons.tradingChart },
  { id: 'dashboard', label: 'Dashboard', icon: TopNavIcons.dashboard },
  { id: 'trading', label: 'My Trading', icon: TopNavIcons.trading },
  { id: 'community', label: 'Community', icon: TopNavIcons.community },
  { id: 'journal', label: 'Trading Journal', icon: TopNavIcons.journal },
  { id: 'settings', label: 'Settings', icon: TopNavIcons.settings },
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

function UserLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, handleLogout } = useUser();

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
    <div className="h-screen w-full bg-gradient-to-br from-[#f5e6b5] via-[#d4af37] to-[#8a6d1b] 
                   flex flex-col overflow-hidden relative isolate">
      {/* Background effects */}
      <BackgroundEffects />
      
      {/* Top Navigation Bar - positioned absolutely at top */}
      <div className="relative z-20">
        <TopNavBar<UserTab>
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
      </div>

      {/* Main content area with card container */}
      <div className="flex-1 flex flex-col min-h-0 pt-[70px] pb-2 px-2 z-10 w-full overflow-hidden">
        <div className="w-full h-full bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 overflow-hidden relative flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth w-full">
            <div className="w-full h-full">
              <PageContainer variant="default">
                {/* Skip link for accessibility */}
                <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-gold focus:text-surface-dark focus:rounded-lg focus:font-semibold">
                  Skip to main content
                </a>
                
                {/* Main Content */}
                <main id="main-content">
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

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <UserLayoutContent>{children}</UserLayoutContent>
    </UserProvider>
  );
}
