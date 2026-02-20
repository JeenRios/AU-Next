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
      <main id="main-content" className="flex-1 flex flex-col min-h-0 pt-[70px] pb-2 px-2 z-10 w-full">
         <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 overflow-hidden relative flex flex-col">
            <div className="absolute inset-0 overflow-y-auto p-4 md:p-8 scroll-smooth">
                <div className="container mx-auto max-w-7xl min-h-full">
                    {children}
                </div>
            </div>
         </div>
      </main>
    </div>
  );
}
