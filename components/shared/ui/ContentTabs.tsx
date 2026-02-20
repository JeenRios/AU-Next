'use client';

import { useState, ReactNode, useRef, useEffect } from 'react';

export interface ContentTab {
  id: string;
  label: string;
  icon: string; // SVG path
  badge?: number;
}

interface ContentTabsPropsBase {
  /** Array of tab definitions */
  tabs: ContentTab[];
  /** Default active tab id (only used in uncontrolled mode) */
  defaultTab?: string;
  /** Additional className for the container */
  className?: string;
}

interface ContentTabsUncontrolledProps extends ContentTabsPropsBase {
  /** Render function for tab content (uncontrolled mode) */
  children: (activeTab: string) => ReactNode;
  /** Controlled active tab - not used in uncontrolled mode */
  activeTab?: never;
  /** Controlled onChange callback - not used in uncontrolled mode */
  onTabChange?: never;
}

interface ContentTabsControlledProps extends ContentTabsPropsBase {
  /** Direct ReactNode children (controlled mode) */
  children: ReactNode;
  /** Controlled active tab */
  activeTab: string;
  /** Controlled onChange callback */
  onTabChange: (tab: string) => void;
}

type ContentTabsProps = ContentTabsUncontrolledProps | ContentTabsControlledProps;

export default function ContentTabs(props: ContentTabsProps) {
  const { tabs, className = '' } = props;
  
  // Determine if controlled or uncontrolled mode
  const isControlled = 'activeTab' in props && props.activeTab !== undefined;
  
  // Internal state for uncontrolled mode
  const [internalActiveTab, setInternalActiveTab] = useState(
    props.defaultTab || tabs[0]?.id || ''
  );
  
  // Use controlled or internal state
  const activeTab = isControlled ? (props as ContentTabsControlledProps).activeTab : internalActiveTab;
  const handleTabChange = isControlled 
    ? (props as ContentTabsControlledProps).onTabChange 
    : setInternalActiveTab;
  
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update indicator position when active tab changes
  useEffect(() => {
    const updateIndicator = () => {
      const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
      const activeTabEl = tabRefs.current[activeIndex];
      
      if (activeTabEl && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const tabRect = activeTabEl.getBoundingClientRect();
        
        setIndicatorStyle({
          left: tabRect.left - containerRect.left,
          width: tabRect.width,
        });
      }
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTab, tabs]);

  return (
    <div className={className}>
      {/* Horizontal Tab Bar */}
      <div 
        ref={containerRef}
        className="relative inline-flex items-center bg-primary-gold/10 border border-secondary-gold/30 rounded-xl p-1 mb-6 overflow-x-auto scrollbar-hide"
      >
        {/* Sliding gold indicator */}
        <div
          className="absolute top-1 bottom-1 bg-gradient-to-r from-[#c9a227] to-[#d4af37] rounded-lg shadow-md shadow-[#c9a227]/20 transition-all duration-300 ease-out"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
        />
        
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[index] = el; }}
            onClick={() => handleTabChange(tab.id)}
            className={`relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-[#1a1a1d]'
                : 'text-gray-600 hover:text-[#1a1a1d]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            <span>{tab.label}</span>
            
            {/* Badge */}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 text-xs font-bold rounded-full ${
                activeTab === tab.id
                  ? 'bg-[#1a1a1d]/20 text-[#1a1a1d]'
                  : 'bg-red-100 text-red-600'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl border border-[#f0d78c]/20 shadow-sm overflow-hidden">
        {/* Top gold accent line */}
        <div className="h-1 bg-gradient-to-r from-[#c9a227] via-[#f0d78c] to-[#c9a227]" />
        <div className="p-6">
          {/* Render based on controlled or uncontrolled mode */}
          {typeof props.children === 'function' 
            ? (props.children as (activeTab: string) => ReactNode)(activeTab)
            : props.children
          }
        </div>
      </div>
    </div>
  );
}

// Common icon paths for reuse
export const ContentTabIcons = {
  // General/Profile
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  // Security/Lock
  security: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  // Settings/Cog
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  // Chart/Analytics
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  // Credit Card/Billing
  billing: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  // History/Clock
  history: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  // Overview/Dashboard
  overview: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
  // Accounts/Users
  accounts: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  // Robot/EA
  robot: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  // Document/Orders
  document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  // Link/Connect
  connect: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  // Trending up
  trending: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  // Support
  support: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
  // System
  system: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01',
};
