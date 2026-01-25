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
  /** Whether to show labels above attribute values. Set to false when used with ListContainer column headers. */
  showAttributeLabels?: boolean;
  /** Action buttons to display on the right side of the row */
  actionButtons?: ReactNode;
  /** The content to show within the collapsible area. If null, the expand button is hidden. */
  collapsibleContent?: ReactNode;
  /** Controls the expanded state from parent. If provided, parent manages expansion. */
  isExpanded?: boolean;
  /** Callback to toggle expanded state from parent. Must be provided with `isExpanded`. */
  onToggleExpand?: () => void;
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
  showAttributeLabels = true,
  actionButtons,
  collapsibleContent,
  isExpanded: controlledIsExpanded, // Rename to avoid conflict with internal state
  onToggleExpand: controlledOnToggleExpand, // Rename
  className = '',
}: ListItemProps) {
  // ========== STATE ==========
  // Use internal state if not controlled by parent
  const [internalIsExpanded, setInternalIsExpanded] = useState(false);
  
  // Determine the effective expanded state and toggle handler
  const isControlled = controlledIsExpanded !== undefined && controlledOnToggleExpand !== undefined;
  const effectiveIsExpanded = isControlled ? controlledIsExpanded : internalIsExpanded;
  const effectiveOnToggleExpand = isControlled ? controlledOnToggleExpand : () => setInternalIsExpanded(prev => !prev);

  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // ========== EFFECTS ==========
  // Update content height for smooth animation when expanded state changes
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(effectiveIsExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [effectiveIsExpanded, collapsibleContent]); // Depend on effectiveIsExpanded

  // ========== HANDLERS ==========
  const handleToggleExpand = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent event bubbling if a child is clicked
    if (!collapsibleContent) return;
    effectiveOnToggleExpand();
  };

  const rowClasses = [
    'relative transition-all duration-200 ease-out',
    className,
    effectiveIsExpanded
      ? 'bg-amber-50 border border-amber-200 rounded-xl mx-2 my-1'  // Expanded: amber card style
      : 'bg-white hover:bg-stone-50 border-b border-stone-100',     // Collapsed: clean style
    collapsibleContent ? 'cursor-pointer' : '' // Only show pointer if it can be expanded
  ].filter(Boolean).join(' ');

  return (
    <div className={rowClasses}>
      {/* ===== MAIN ROW ===== */}
      <div className="px-4 py-4" onClick={handleToggleExpand}>
        <div className="flex items-center gap-4">
          {/* Icon and/or Expand Toggle */}
          <div className={`flex-shrink-0 rounded-full flex items-center justify-center transition-all duration-200 ${
            effectiveIsExpanded
              ? 'w-12 h-12 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-white font-bold text-lg'  // Expanded: gold gradient
              : 'w-8 h-8'  // Collapsed: simple
          }`}>
            {icon ? (
              icon
            ) : collapsibleContent ? (
              <svg
                className={`transition-transform duration-200 ease-out ${effectiveIsExpanded ? 'w-5 h-5 rotate-90' : 'w-4 h-4 text-stone-400'}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            ) : null}
          </div>

          {/* Title, Subtitle, and Badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`truncate transition-colors duration-200 ${
                effectiveIsExpanded
                  ? 'font-bold text-[#1a1a1d]'      // Expanded: bold dark
                  : 'font-medium text-sm text-stone-800'  // Collapsed: medium
              }`}>
                {title}
              </span>
              {badges.map((badge, i) => <div key={i}>{badge}</div>)}
            </div>
            {subtitle && (
              <p className={`truncate mt-0.5 ${effectiveIsExpanded ? 'text-sm text-gray-600' : 'text-xs text-stone-500'}`}>
                {subtitle}
              </p>
            )}
          </div>

          {/* Attributes */}
          <div className="hidden md:flex items-center gap-6 flex-shrink-0">
            {attributes.map((attr, i) => (
              <div key={i} className="w-[120px] text-left">
                {showAttributeLabels && <p className={`text-xs ${effectiveIsExpanded ? 'text-gray-500' : 'text-stone-500'}`}>{attr.label}</p>}
                <div className={`text-sm truncate ${attr.isSensitive ? 'font-mono' : ''} ${
                  effectiveIsExpanded ? 'font-semibold text-[#1a1a1d]' : 'text-stone-700'
                }`}>
                  {attr.value}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0 w-[100px] justify-end">
            {actionButtons}
          </div>
        </div>
      </div>

      {/* ===== COLLAPSIBLE CONTENT ===== */}
      {collapsibleContent && (
        <div
          ref={contentRef}
          style={{ height: contentHeight }}
          className="overflow-hidden transition-[height] duration-300 ease-in-out"
        >
          <div className={`transition-all duration-300 ease-in-out ${
            effectiveIsExpanded
              ? 'border-t border-amber-200 opacity-100 pointer-events-auto visible'  // Expanded: amber border
              : 'border-t border-stone-200 opacity-0 pointer-events-none invisible'   // Collapsed
          }`}>
            {collapsibleContent}
          </div>
        </div>
      )}
    </div>
  );
}
