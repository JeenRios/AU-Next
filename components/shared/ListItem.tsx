'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ListItemAttribute {
  label: string;
  value: ReactNode;
  isSensitive?: boolean;
}

export interface ListItemProps {
  /** A ReactNode to display as the main icon or avatar */
  icon?: ReactNode;
  /** The main title of the list item */
  title: ReactNode;
  /** The subtitle displayed below the title */
  subtitle?: ReactNode;
  /** An array of badges to display next to the title */
  badges?: ReactNode[];
  /** An array of data attributes to display as columns in the row */
  attributes?: ListItemAttribute[];
  /** Action buttons to display on the right side of the row */
  actionButtons?: ReactNode;
  /** The content to show within the collapsible area. If null, the expand button is hidden. */
  collapsibleContent?: ReactNode;
  /** Optional click handler for the entire row */
  onClick?: () => void;
  /** The background color of the component */
  className?: string;
}

// ============================================================================
// MAIN LIST ITEM COMPONENT
// ============================================================================

/**
 * ListItem - A generic, reusable list item with an optional collapsible area.
 *
 * Architecture:
 * - Manages its own expand/collapse state.
 * - Uses flexible props (ReactNode) to allow any content to be injected.
 * - The 'attributes' prop allows for a structured way to display columnar data.
 * - The 'collapsibleContent' prop enables an optional, expandable section.
 * - The expand button is automatically hidden if 'collapsibleContent' is not provided.
 */
export default function ListItem({
  icon,
  title,
  subtitle,
  badges = [],
  attributes = [],
  actionButtons,
  collapsibleContent,
  onClick,
  className = '',
}: ListItemProps) {
  // ========== STATE ==========
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // ========== EFFECTS ==========
  // Update content height for smooth animation when expanded state changes
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded, collapsibleContent]);

  // ========== HANDLERS ==========
  const handleToggleExpand = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (collapsibleContent) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleRowClick = () => {
    if (onClick) {
      onClick();
    } else if (collapsibleContent) {
      setIsExpanded(!isExpanded);
    }
  };

  const rowClasses = [
    'relative transition-all duration-200 ease-out',
    className,
    isExpanded ? 'bg-gray-50' : 'bg-white hover:bg-stone-50 border-b border-stone-100',
    onClick || collapsibleContent ? 'cursor-pointer' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={rowClasses}>
      {/* ===== MAIN ROW ===== */}
      <div className="px-4 py-3" onClick={handleRowClick}>
        <div className="flex items-center gap-4">
          {/* Expand Toggle, Icon, or Placeholder */}
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
            {collapsibleContent ? (
              <button
                onClick={handleToggleExpand}
                className={`w-full h-full flex items-center justify-center rounded-lg transition-all duration-200 ${
                  isExpanded
                    ? 'bg-[#c9a227]/15 text-[#c9a227]'
                    : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
                }`}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ease-out ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : icon ? (
              <div className="w-full h-full flex items-center justify-center">{icon}</div>
            ) : null}
          </div>
          
          {/* Icon (if expand toggle is also present) */}
          {collapsibleContent && icon && (
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
              {icon}
            </div>
          )}

          {/* Title, Subtitle, and Badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`font-medium text-sm truncate transition-colors duration-200 ${isExpanded ? 'text-[#c9a227]' : 'text-stone-800'}`}>
                {title}
              </span>
              {badges.map((badge, i) => <div key={i}>{badge}</div>)}
            </div>
            {subtitle && (
              <p className="text-xs text-stone-500 truncate mt-0.5">{subtitle}</p>
            )}
          </div>

          {/* Attributes */}
          <div className="hidden md:flex flex-1 items-center justify-end gap-6 text-sm">
            {attributes.map((attr, i) => (
              <div key={i} className="min-w-[120px] text-left">
                <p className="text-xs text-stone-500">{attr.label}</p>
                <div className={`text-sm text-stone-700 truncate ${attr.isSensitive ? 'font-mono' : ''}`}>
                  {attr.value}
                </div>
              </div>
            ))}
          </div>
          
          {/* Action Buttons */}
          {actionButtons && (
            <div className="flex items-center gap-1 flex-shrink-0 ml-4">
              {actionButtons}
            </div>
          )}
        </div>
      </div>

      {/* ===== COLLAPSIBLE CONTENT ===== */}
      {collapsibleContent && (
        <div
          ref={contentRef}
          style={{ height: contentHeight }}
          className="overflow-hidden transition-[height] duration-300 ease-in-out"
        >
          <div className={`transition-opacity duration-300 ease-in-out ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            {isExpanded && collapsibleContent}
          </div>
        </div>
      )}
    </div>
  );
}
