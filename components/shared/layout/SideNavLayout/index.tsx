'use client';

import { Dispatch, SetStateAction, ReactNode, useRef, useEffect, useState } from 'react';

export interface NavItem<T extends string = string> {
  id: T;
  label: string;
  icon: ReactNode;
  badge?: number;
}

export interface SideNavLayoutProps<T extends string = string> {
  /** User information to display in the sidebar header */
  user: { name?: string; email?: string } | null;
  /** Currently active tab/section */
  activeTab: T;
  /** Callback to set the active tab - accepts either Dispatch or simple function */
  setActiveTab: Dispatch<SetStateAction<T>> | ((tab: T) => void);
  /** Callback for logout action */
  onLogout: () => void;
  /** Whether mobile sidebar is open */
  mobileOpen: boolean;
  /** Callback to set mobile sidebar open state - accepts either Dispatch or simple function */
  setMobileOpen: Dispatch<SetStateAction<boolean>> | ((open: boolean) => void);
  /** Navigation items to display */
  navItems: NavItem<T>[];
  /** Brand name suffix (e.g., "Next" for "AUNext", "Admin" for "AUAdmin") */
  brandSuffix?: string;
  /** Welcome text shown above user name */
  welcomeText?: string;
  /** Callback for profile navigation */
  onProfileClick?: () => void;
}

export default function SideNavLayout<T extends string = string>({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  mobileOpen,
  setMobileOpen,
  navItems,
  brandSuffix = 'Next',
  welcomeText = 'Welcome back',
  onProfileClick,
}: SideNavLayoutProps<T>) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, top: 0, width: 0, height: 0, opacity: 0 });
  const [searchOpen, setSearchOpen] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Toggle Search with Keyboard Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  // Click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchOpen && 
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.search-widget')
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen]);

  useEffect(() => {
    const updateIndicator = () => {
      const activeIndex = navItems.findIndex(item => item.id === activeTab);
      const activeTabEl = tabRefs.current[activeIndex];
      
      if (activeTabEl && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const tabRect = activeTabEl.getBoundingClientRect();
        
        setIndicatorStyle({
          left: tabRect.left - containerRect.left,
          top: tabRect.top - containerRect.top,
          width: tabRect.width,
          height: tabRect.height,
          opacity: 1,
        });
      } else {
        setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };

    updateIndicator();
    // Use a small timeout to ensure layout is settled especially for mobile/desktop transitions
    const timeout_id = setTimeout(updateIndicator, 100);
    window.addEventListener('resize', updateIndicator);
    return () => {
      window.removeEventListener('resize', updateIndicator);
      clearTimeout(timeout_id);
    };
  }, [activeTab, navItems, mobileOpen]);

  const handleNavClick = (tab: T) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Responsive Fixed Dock (Horizontal Mobile / Vertical Desktop) */}
      <aside className="fixed top-0 left-0 z-50 p-4 md:h-screen md:p-6 md:flex md:flex-col md:justify-center pointer-events-none md:pointer-events-auto w-full md:w-auto">
        
        {/* Dock Container */}
        <nav 
          className="pointer-events-auto flex md:flex-col items-center justify-between md:justify-center gap-3 px-4 py-3 md:px-2.5 md:py-5 bg-white/70 backdrop-blur-2xl rounded-2xl md:rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.6)_inset] border border-white/40 group/dock isolate transition-all duration-300 hover:bg-white/80 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.8)_inset] max-w-lg mx-auto md:max-w-none md:mx-0"
          role="menubar"
        >
          {/* User Profile Marker */}
          <div className="relative group/user z-50 order-3 md:order-1 md:mb-2">
            <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary-gold to-secondary-gold flex items-center justify-center shadow-lg shadow-primary-gold/30 shrink-0 group-has-[.dock-trigger:hover]/dock:blur-[3px] transition-all duration-300 group-hover/user:scale-110 group-hover/user:!blur-none overflow-hidden dock-trigger">
               {/* Initials or Placeholder */}
               <span className="text-surface-dark font-bold text-xs md:text-sm">
                {user?.name 
                  ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
                  : 'AU'}
              </span>
            </button>
            
            {/* User Options Tooltip (Interactive Menu) - Desktop Only for now */}
            <div className="absolute left-full top-0 ml-4 opacity-0 group-hover/user:opacity-100 transition-all duration-300 invisible group-hover/user:visible pointer-events-none group-hover/user:pointer-events-auto hidden md:block">
                {/* Invisible hover bridge */}
                <div className="absolute -left-6 top-0 w-6 h-full bg-transparent" />
                
                <div className="bg-surface-dark/95 backdrop-blur-xl text-white text-xs rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] p-3 min-w-[200px] flex flex-col gap-1 border border-white/10">
                   {/* Arrow */}
                   <div className="w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-surface-dark/95 border-b-[6px] border-b-transparent absolute -left-1.5 top-5" />

                   {/* User Header */}
                   <div className="pb-3 mb-1 border-b border-white/10">
                      <p className="font-bold text-primary-gold text-sm truncate">{user?.name || 'Guest User'}</p>
                      <p className="text-[10px] text-gray-400 truncate">{user?.email || 'guest@example.com'}</p>
                   </div>

                   {/* Options */}
                   <button onClick={onProfileClick} className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg transition-colors text-left w-full group/item">
                      <svg className="w-4 h-4 text-gray-400 group-hover/item:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      Profile
                   </button>
                   <button className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg transition-colors text-left w-full group/item">
                      <svg className="w-4 h-4 text-gray-400 group-hover/item:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Settings
                   </button>
                   
                   {/* Logout Option */}
                   <button onClick={onLogout} className="flex items-center gap-3 p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors text-left w-full mt-1 text-gray-400 group/logout">
                       <svg className="w-4 h-4 group-hover/logout:text-red-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Logout
                   </button>
                </div>
            </div>
          </div>

          <div className="hidden md:block w-full h-px md:w-6 md:h-px bg-gray-200/60 my-1 blur-[0.5px] group-has-[.dock-trigger:hover]/dock:blur-[3px] transition-all duration-300 md:order-2" />

          {/* Navigation Items - Horizontal on Mobile, Vertical on Desktop */}
          <div 
            ref={containerRef}
            className="relative flex md:flex-col items-center gap-1 md:gap-4 order-1 md:order-3 flex-1 justify-around w-full md:w-auto"
          >
             {/* Sliding Indicator */}
             <div
                className="absolute bg-surface-dark rounded-full shadow-lg shadow-black/20 transition-all duration-300 ease-out -z-10"
                style={{
                  left: indicatorStyle.left,
                  top: indicatorStyle.top,
                  width: indicatorStyle.width,
                  height: indicatorStyle.height,
                  opacity: indicatorStyle.opacity,
                }}
             />

             {/* Search Trigger */}
             <button
                onClick={() => setSearchOpen(!searchOpen)}
                title="Search (Ctrl + K)"
                aria-label="Search"
                className={`relative w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 group focus:outline-none group-has-[.dock-trigger:hover]/dock:blur-[3px] hover:!blur-none dock-trigger md:mb-2 ${
                    searchOpen ? 'bg-primary-gold text-white scale-110' : 'text-gray-500 hover:text-primary-gold hover:!scale-110'
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </button>

             {navItems.map((item, index) => (
                <button
                  key={item.id}
                  ref={el => { tabRefs.current[index] = el; }}
                  onClick={() => handleNavClick(item.id)}
                  role="menuitem"
                  title={item.label}
                  aria-current={activeTab === item.id ? 'page' : undefined}
                  className={`relative w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 group focus:outline-none group-has-[.dock-trigger:hover]/dock:blur-[3px] hover:!blur-none hover:!scale-110 dock-trigger ${
                    activeTab === item.id
                      ? 'text-white scale-110'
                      : 'text-primary-gold hover:text-surface-dark'
                  }`}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    {item.icon}
                  </div>
                  
                  {/* Badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold border-2 border-white transition-all ${
                      activeTab === item.id ? 'bg-primary-gold text-white' : 'bg-red-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  
                  {/* Tooltip on Hover (Right Side - Desktop Only) */}
                  <div className="hidden md:block absolute left-full ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 top-1/2 -translate-y-1/2">
                    <div className="bg-surface-dark text-white text-xs px-2 py-1 rounded-md shadow-xl flex items-center">
                      <div className="w-0 h-0 border-t-[4px] border-t-transparent border-r-[4px] border-r-surface-dark border-b-[4px] border-b-transparent absolute -left-1" />
                      {item.label}
                    </div>
                  </div>
                </button>
              ))}
          </div>
          
          <div className="hidden md:block w-6 h-px bg-gray-200/60 my-1 blur-[0.5px] group-has-[button:hover]/dock:blur-[3px] transition-all duration-300 max-md:hidden order-3 md:order-4" />

          <button
            onClick={onLogout}
            title="Logout"
            aria-label="Logout"
            className="relative w-10 h-10 hidden md:flex items-center justify-center rounded-full transition-all duration-300 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:!scale-125 group-has-[.dock-trigger:hover]/dock:blur-[3px] hover:!blur-none dock-trigger order-3 md:order-5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
             <div className="absolute left-full ml-4 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 top-1/2 -translate-y-1/2">
                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-md shadow-xl flex items-center">
                   <div className="w-0 h-0 border-t-[4px] border-t-transparent border-r-[4px] border-r-red-500 border-b-[4px] border-b-transparent absolute -left-1" />
                  Logout
                </div>
              </div>
          </button>
        </nav>
      </aside>

      {/* Floating Search Widget (Independent of Dock Structure) */}
      {searchOpen && (
        <div 
           className="search-widget fixed z-[60] 
                      top-[80px] left-1/2 -translate-x-1/2 w-[90%] md:w-[350px]
                      md:top-auto md:left-[100px] md:-translate-x-0 md:translate-y-[-210px] md:bottom-auto
                      animate-in fade-in slide-in-from-top-2 md:slide-in-from-left-2 duration-200"
           style={{  
               // Only for desktop vertical centering relative to dock if reasonable, 
               // but fixed offset is safer for simplicity
               top: window.innerWidth >= 768 ? '50%' : '80px',
               marginTop: window.innerWidth >= 768 ? '-150px' : '0' // Roughly align with top of dock or user pref
           }}
        >
          <div className="bg-white/80 backdrop-blur-2xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.7)_inset] overflow-hidden border border-white/40">
              {/* Input Area */}
              <div className="flex items-center px-4 py-3 gap-3 border-b border-gray-100/50">
                  <svg className="w-5 h-5 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input 
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    className="flex-1 bg-transparent border-none outline-none text-surface-dark text-sm placeholder-gray-400"
                    autoFocus
                  />
                  <span className="text-[10px] font-mono text-gray-400 bg-white/50 px-1.5 py-0.5 rounded border border-gray-200">ESC</span>
              </div>
              
              {/* Quick Results */}
              <div className="p-2 space-y-1">
                 <div className="text-[10px] font-bold text-gray-400 uppercase px-2 py-1">Quick Links</div>
                 <button onClick={() => { setActiveTab('dashboard' as T); setSearchOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-dark/5 hover:text-primary-gold text-gray-600 transition-colors text-xs font-medium">
                    {SideNavIcons.dashboard}
                    Dashboard
                 </button>
                 <button onClick={() => { setActiveTab('trading' as T); setSearchOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-dark/5 hover:text-primary-gold text-gray-600 transition-colors text-xs font-medium">
                    {SideNavIcons.trading}
                    Trading Terminal
                 </button>
              </div>
          </div>
          
          {/* Decorative Arrow Pointing to Dock (Desktop Only) */}
          <div className="hidden md:block absolute -left-2 top-[47px] w-4 h-4 bg-white/80 backdrop-blur-md rotate-45 border-l border-b border-white/40 shadow-sm z-[-1]" />
        </div>
      )}
    </>
  );
}

// Pre-defined icons for common nav items
export const SideNavIcons = {
  feed: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  ),
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  trading: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  tradingChart: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  community: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  journal: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  support: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  system: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  overview: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
};
