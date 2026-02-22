import React, { ReactNode, useState } from 'react';
import { SectionHeader } from '@/components/shared';
import { cn } from '@/lib/utils';

export interface Tab {
  id: string;
  label: string;
  icon: ReactNode;
}

export interface PageContainerProps {
  children: ReactNode | ((activeTab?: string) => ReactNode);
  /**
   * 'default': Standard container with padding and max-width (Dashboard style)
   * 'full': Edge-to-edge, useful for complex layouts (Trading/Accounts style)
   */
  variant?: 'default' | 'full';
  className?: string;
  scrollable?: boolean; // If true, this component handles scrolling overflow
  
  // New props for sidebar functionality
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  tabs?: Tab[]; // Optional - if provided, show sidebar
  defaultTab?: string;
}

export const PageContainer = ({ 
  children, 
  variant = 'default',
  className,
  scrollable = false,
  title,
  subtitle,
  actions,
  tabs = [],
  defaultTab
}: PageContainerProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const hasNavigation = tabs.length > 0;
  
  const baseStyles = "flex-1 w-full flex flex-col min-h-0";
  
  // The content wrapper handles padding and centering
  const contentStyles = cn(
    "flex-1 w-full h-full",
    variant === 'default' && "p-4 md:p-6 max-w-7xl mx-auto space-y-6",
    className
  );

  const renderSimpleLayout = () => (
    <>
      {title && <SectionHeader title={title} subtitle={subtitle} actions={actions} />}
      {typeof children === 'function' ? children() : children}
    </>
  );

  const renderLayoutWithSidebar = () => (
    <div className="flex gap-6 h-full">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-md border border-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "w-64 flex-shrink-0 bg-white rounded-xl border border-gray-200 p-4 h-fit",
        "hidden lg:block",
        isMobileMenuOpen && "fixed inset-0 z-40 lg:relative lg:inset-auto"
      )}>
        <div className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all",
                activeTab === tab.id 
                  ? "bg-primary-gold text-white shadow-sm" 
                  : "hover:bg-gray-100 text-gray-700"
              )}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {title && <SectionHeader title={title} subtitle={subtitle} actions={actions} />}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          {typeof children === 'function' ? children(activeTab || undefined) : children}
        </div>
      </div>
    </div>
  );

  if (scrollable) {
    return (
      <div className={cn(baseStyles, "overflow-hidden")}>
         <div className="flex-1 overflow-y-auto h-full">
            <main className={contentStyles}>
              {hasNavigation ? renderLayoutWithSidebar() : renderSimpleLayout()}
            </main>
         </div>
      </div>
    );
  }

  // Default: Rely on parent layout to handle scrolling (MainLayout)
  return (
    <main className={contentStyles}>
      {hasNavigation ? renderLayoutWithSidebar() : renderSimpleLayout()}
    </main>
  );
};

export default PageContainer;
