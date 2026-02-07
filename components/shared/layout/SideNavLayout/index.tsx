'use client';

import { Dispatch, SetStateAction, ReactNode } from 'react';

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
}: SideNavLayoutProps<T>) {
  const handleNavClick = (tab: T) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Floating Left Vertical Dock */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-4">
        
        {/* Dock Container */}
        <nav 
          className="flex flex-col items-center gap-3 px-2.5 py-5 bg-white/70 backdrop-blur-2xl rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.6)_inset] border border-white/40 group/dock isolate transition-all duration-300 hover:bg-white/80 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.8)_inset]"
          role="menubar"
        >
          {/* User Profile Marker */}
          <div className="relative group/user z-50">
            <button className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a227] to-[#f0d78c] flex items-center justify-center shadow-lg shadow-[#c9a227]/30 mb-2 shrink-0 group-has-[.dock-trigger:hover]/dock:blur-[3px] transition-all duration-300 group-hover/user:scale-110 group-hover/user:!blur-none overflow-hidden dock-trigger">
               {/* Initials or Placeholder */}
               <span className="text-[#1a1a1d] font-bold text-sm">
                {user?.name 
                  ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
                  : 'AU'}
              </span>
            </button>

            {/* User Options Tooltip (Interactive Menu) */}
            <div className="absolute left-full top-0 ml-4 opacity-0 group-hover/user:opacity-100 transition-all duration-300 invisible group-hover/user:visible pointer-events-none group-hover/user:pointer-events-auto">
                {/* Invisible hover bridge */}
                <div className="absolute -left-6 top-0 w-6 h-full bg-transparent" />
                
                <div className="bg-[#1a1a1d]/95 backdrop-blur-xl text-white text-xs rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] p-3 min-w-[200px] flex flex-col gap-1 border border-white/10">
                   {/* Arrow */}
                   <div className="w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-[#1a1a1d]/95 border-b-[6px] border-b-transparent absolute -left-1.5 top-5" />

                   {/* User Header */}
                   <div className="pb-3 mb-1 border-b border-white/10">
                      <p className="font-bold text-[#c9a227] text-sm truncate">{user?.name || 'Guest User'}</p>
                      <p className="text-[10px] text-gray-400 truncate">{user?.email || 'guest@example.com'}</p>
                   </div>

                   {/* Options */}
                   <button className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg transition-colors text-left w-full group/item">
                      <svg className="w-4 h-4 text-gray-400 group-hover/item:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      Profile
                   </button>
                   <button className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg transition-colors text-left w-full group/item">
                      <svg className="w-4 h-4 text-gray-400 group-hover/item:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Settings
                   </button>
                   
                   {/* Logout Option */}
                    {/* Note: Logic duplicated from bottom button, might want to remove bottom trigger later */}
                   <button onClick={onLogout} className="flex items-center gap-3 p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors text-left w-full mt-1 text-gray-400 group/logout">
                       <svg className="w-4 h-4 group-hover/logout:text-red-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Logout
                   </button>
                </div>
            </div>
          </div>

          <div className="w-6 h-px bg-gray-200/60 my-1 blur-[0.5px] group-has-[.dock-trigger:hover]/dock:blur-[3px] transition-all duration-300" />

          {/* Navigation Items */}
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              role="menuitem"
              title={item.label}
              aria-current={activeTab === item.id ? 'page' : undefined}
              className={`relative w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 group focus:outline-none group-has-[.dock-trigger:hover]/dock:blur-[3px] hover:!blur-none hover:!scale-125 dock-trigger ${
                activeTab === item.id
                  ? 'bg-[#1a1a1d] text-white shadow-lg shadow-black/20 scale-110'
                  : 'text-gray-500 hover:text-[#1a1a1d]'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {item.icon}
              </div>
              
              {/* Badge */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold border-2 border-white transition-all ${
                  activeTab === item.id ? 'bg-[#c9a227] text-white' : 'bg-red-500 text-white'
                }`}>
                  {item.badge}
                </span>
              )}
              
              {/* Tooltip on Hover (Right Side) */}
              <div className="absolute left-full ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 top-1/2 -translate-y-1/2">
                <div className="bg-[#1a1a1d] text-white text-xs px-2 py-1 rounded-md shadow-xl flex items-center">
                  <div className="w-0 h-0 border-t-[4px] border-t-transparent border-r-[4px] border-r-[#1a1a1d] border-b-[4px] border-b-transparent absolute -left-1" />
                  {item.label}
                </div>
              </div>
            </button>
          ))}

          <div className="w-6 h-px bg-gray-200/60 my-1 blur-[0.5px] group-has-[button:hover]/dock:blur-[3px] transition-all duration-300" />

          {/* Logout Button */}
          <button
            onClick={onLogout}
            title="Logout"
            className="relative w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:!scale-125 group-has-[.dock-trigger:hover]/dock:blur-[3px] hover:!blur-none dock-trigger"
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
      </div>
    </>
  );
}

// Pre-defined icons for common nav items
export const SideNavIcons = {
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
