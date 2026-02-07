import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface PageContainerProps {
  children: ReactNode;
  /**
   * 'default': Standard container with padding and max-width (Dashboard style)
   * 'full': Edge-to-edge, useful for complex layouts (Trading/Accounts style)
   */
  variant?: 'default' | 'full';
  className?: string;
  scrollable?: boolean; // If true, this component handles the scrolling overflow
}

export const PageContainer = ({ 
  children, 
  variant = 'default',
  className,
  scrollable = false
}: PageContainerProps) => {
  
  const baseStyles = "flex-1 w-full flex flex-col min-h-0";
  
  // The content wrapper handles the padding and centering
  const contentStyles = cn(
    "flex-1 w-full h-full",
    variant === 'default' && "p-4 md:p-6 max-w-7xl mx-auto space-y-6",
    className
  );

  if (scrollable) {
    return (
      <div className={cn(baseStyles, "overflow-hidden")}>
         <div className="flex-1 overflow-y-auto h-full">
            <main className={contentStyles}>
              {children}
            </main>
         </div>
      </div>
    );
  }

  // Default: Rely on the parent layout to handle scrolling (MainLayout)
  return (
    <main className={contentStyles}>
      {children}
    </main>
  );
};

export default PageContainer;
