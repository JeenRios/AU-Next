'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

export interface SectionHeaderAction {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary';
}

export interface SectionHeaderProps {
  /** Main title of the section */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Optional action buttons/elements on the right side */
  actions?: ReactNode;
  /** Single action button config */
  action?: SectionHeaderAction;
  /** Optional icon to display before title */
  icon?: ReactNode;
  /** Back link URL */
  backLink?: string;
  /** Back link label */
  backLabel?: string;
  /** Whether to show mobile menu button (handled externally) */
  showMobileMenu?: boolean;
  /** Callback when mobile menu button is clicked */
  onMobileMenuClick?: () => void;
  /** Callback for refresh action */
  onRefresh?: () => void;
  /** Whether refresh is in progress */
  isRefreshing?: boolean;
  /** Additional className for the container */
  className?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  actions,
  action,
  icon,
  backLink,
  backLabel,
  showMobileMenu = false,
  onMobileMenuClick,
  onRefresh,
  isRefreshing = false,
  className = '',
}: SectionHeaderProps) {
  // Build refresh button if onRefresh is provided
  const refreshButton = onRefresh ? (
    <button
      onClick={onRefresh}
      disabled={isRefreshing}
      className="px-5 py-2.5 bg-gradient-to-r from-primary-gold to-secondary-gold hover:shadow-lg text-surface-dark font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-gold focus-visible:ring-offset-2"
      aria-label="Refresh data"
    >
      <svg
        className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      {isRefreshing ? 'Refreshing...' : 'Refresh'}
    </button>
  ) : null;

  // Build action button if action config is provided
  const actionButton = action ? (
    <button
      onClick={action.onClick}
      className={`px-5 py-2.5 font-semibold rounded-xl transition-all flex items-center gap-2 focus:outline-none focus-visible:ring-2 ${
        action.variant === 'secondary'
          ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 focus-visible:ring-gray-400'
          : 'bg-gradient-to-r from-primary-gold to-secondary-gold hover:shadow-lg hover:shadow-primary-gold/20 text-surface-dark focus-visible:ring-primary-gold focus-visible:ring-offset-2'
      }`}
    >
      {action.icon}
      {action.label}
    </button>
  ) : null;

  return (
    <div className={`mb-6 ${className}`}>
      {/* Back link */}
      {backLink && (
        <Link
          href={backLink}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-gold mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {backLabel || 'Back'}
        </Link>
      )}

      <div className="flex items-start md:items-center justify-between gap-4 flex-col md:flex-row">
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          {showMobileMenu && (
            <button
              onClick={onMobileMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          
          {/* Icon */}
          {icon && (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-gold to-secondary-gold flex items-center justify-center shadow-md">
              {icon}
            </div>
          )}
          
          {/* Title & Subtitle */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-surface-dark">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm md:text-base text-gray-600 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        {(actions || refreshButton || actionButton) && (
          <div className="flex items-center gap-3 w-full md:w-auto">
            {refreshButton}
            {actionButton}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
