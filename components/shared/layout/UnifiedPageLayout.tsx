'use client';

import { useState, ReactNode, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SectionHeader } from '@/components/shared';

export interface SidebarTab {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

interface UnifiedPageLayoutProps {
  /** Array of sidebar tab definitions */
  tabs: SidebarTab[];
  /** Default active tab id (only used in uncontrolled mode) */
  defaultTab?: string;
  /** Additional className for the container */
  className?: string;
  /** Render function for tab content (uncontrolled mode) */
  children: (activeTab: string) => ReactNode;
  /** Optional width for sidebar (default: 240px) */
  sidebarWidth?: string;
  /** Optional collapsed state for mobile */
  collapsible?: boolean;
  /** Page title for SectionHeader */
  title?: string;
  /** Page subtitle for SectionHeader */
  subtitle?: string;
  /** Optional actions for SectionHeader */
  actions?: ReactNode;
}

export default function UnifiedPageLayout({
  tabs,
  defaultTab,
  className = '',
  children,
  sidebarWidth = '240px',
  collapsible = true,
  title,
  subtitle,
  actions,
}: UnifiedPageLayoutProps) {
  // Internal state for active tab
  const [activeTab, setActiveTab] = useState(
    defaultTab || tabs[0]?.id || ''
  );
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Close mobile menu after selection
    if (window.innerWidth < 768) {
      setIsMobileOpen(false);
    }
  };

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={cn("flex h-full bg-white rounded-lg overflow-hidden", className)}>
      {/* Mobile Overlay */}
      {collapsible && (
        <>
          {isMobileOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
          )}
        </>
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "flex-shrink-0 bg-gray-50 border-r border-gray-200 transition-all duration-300 z-50",
          isCollapsed ? "w-16" : sidebarWidth,
          collapsible && "fixed md:relative h-full md:h-auto",
          !collapsible && "relative",
          isMobileOpen ? "left-0" : "-left-full md:left-0"
        )}
        style={{ width: isCollapsed ? '64px' : sidebarWidth }}
      >
        {/* Mobile Menu Toggle */}
        {collapsible && (
          <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200">
            {!isCollapsed && (
              <span className="font-semibold text-gray-900">Menu</span>
            )}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1 rounded-md hover:bg-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Desktop Collapse Toggle */}
        {collapsible && (
          <div className="hidden md:flex items-center justify-end p-3 border-b border-gray-200">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-md hover:bg-gray-200 transition-colors"
            >
              <svg 
                className={cn("w-4 h-4 transition-transform", isCollapsed && "rotate-180")} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* Sidebar Navigation */}
        <nav className="p-2 space-y-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-1",
                  isActive 
                    ? "bg-primary-gold text-white shadow-sm" 
                    : "text-gray-700 hover:text-gray-900"
                )}
                title={isCollapsed ? tab.label : undefined}
              >
                {/* Icon */}
                <div className={cn(
                  "flex-shrink-0 flex items-center justify-center",
                  isActive ? "text-white" : "text-gray-500"
                )}>
                  {tab.icon}
                </div>

                {/* Label and Badge */}
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left truncate">
                      {tab.label}
                    </span>
                    
                    {tab.badge && tab.badge > 0 && (
                      <span className={cn(
                        "inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full",
                        isActive 
                          ? "bg-white/20 text-white" 
                          : "bg-gray-200 text-gray-700"
                      )}>
                        {tab.badge > 99 ? '99+' : tab.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Mobile Menu Button */}
        {collapsible && (
          <div className="md:hidden flex items-center p-4 border-b border-gray-200">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="ml-3 font-semibold text-gray-900">
              {tabs.find(t => t.id === activeTab)?.label || 'Menu'}
            </span>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {/* Section Header */}
          {title && (
            <div className="p-6 pb-0">
              <SectionHeader
                title={title}
                subtitle={subtitle}
                actions={actions}
              />
            </div>
          )}
          
          {/* Tab Content */}
          <div className={title ? "p-6 pt-4" : "p-6"}>
            {children(activeTab)}
          </div>
        </div>
      </div>
    </div>
  );
}
