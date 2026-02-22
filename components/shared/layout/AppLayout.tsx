'use client';

import { ReactNode } from 'react';
import { PageContainer } from './PageContainer';
import { BackgroundEffects } from './BackgroundEffects';

export interface AppLayoutProps {
  children: ReactNode;
  /**
   * 'default': Standard container with padding and max-width (Dashboard style)
   * 'full': Edge-to-edge, useful for complex layouts (Trading/Accounts style)
   */
  variant?: 'default' | 'full';
  className?: string;
  showBackground?: boolean;
}

export function AppLayout({ 
  children, 
  variant = "default",
  className,
  showBackground = true 
}: AppLayoutProps) {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#f5e6b5] via-[#d4af37] to-[#8a6d1b] 
                   flex flex-col overflow-hidden relative isolate">
      {/* Background effects */}
      {showBackground && <BackgroundEffects />}
      
      {/* Main content area with card container */}
      <div className="flex-1 flex flex-col min-h-0 pt-[70px] pb-2 px-2 z-10 w-full overflow-hidden">
        <div className="w-full h-full bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 overflow-hidden relative flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth w-full">
            <div className="w-full h-full">
              <PageContainer variant={variant} className={className}>
                {children}
              </PageContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
