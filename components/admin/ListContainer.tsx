'use client';

import { useState, useMemo, ReactNode } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface ListContainerProps<T> {
  /** The data items to display */
  items: T[];
  /** Function to render each item - receives item and index */
  renderItem: (item: T, index: number) => ReactNode;
  /** Function to extract searchable text from an item */
  getSearchableText: (item: T) => string;
  /** Function to get the filter value from an item */
  getFilterValue: (item: T) => string;
  /** Available filter options */
  filterOptions: FilterOption[];
  /** Default filter value */
  defaultFilter?: string;
  /** Items per page */
  pageSize?: number;
  /** Loading state */
  loading?: boolean;
  /** Called when refresh is clicked */
  onRefresh?: () => void;
  /** Header actions (buttons, etc.) */
  headerActions?: ReactNode;
  /** Empty state content */
  emptyState?: ReactNode;
  /** Title for the list */
  title?: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Show item count badge */
  showCount?: boolean;
  /** Custom class for the container */
  className?: string;
}

// ============================================================================
// PAGINATION COMPONENT
// ============================================================================

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}

function Pagination({ currentPage, totalPages, onPageChange, totalItems, pageSize }: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // Max pages to show

    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
      <p className="text-xs text-gray-500">
        Showing <span className="font-medium text-gray-700">{startItem}</span> to{' '}
        <span className="font-medium text-gray-700">{endItem}</span> of{' '}
        <span className="font-medium text-gray-700">{totalItems}</span> items
      </p>

      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page Numbers */}
        {getPageNumbers().map((page, idx) => (
          typeof page === 'number' ? (
            <button
              key={idx}
              onClick={() => onPageChange(page)}
              className={`min-w-[32px] h-8 px-2 text-xs font-medium rounded-lg transition-colors ${
                currentPage === page
                  ? 'bg-[#c9a227] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ) : (
            <span key={idx} className="px-1 text-gray-400">...</span>
          )
        ))}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN LIST CONTAINER COMPONENT
// ============================================================================

/**
 * ListContainer - A reusable container for list/table views with search, filter, and pagination.
 *
 * Architecture decisions:
 * - Generic type T allows any data shape
 * - Render prop pattern for maximum flexibility in item rendering
 * - Client-side filtering/search for immediate responsiveness
 * - Pagination state managed internally
 * - Filter/search functions passed as props for type-safe filtering
 */
export default function ListContainer<T>({
  items,
  renderItem,
  getSearchableText,
  getFilterValue,
  filterOptions,
  defaultFilter = 'all',
  pageSize = 10,
  loading = false,
  onRefresh,
  headerActions,
  emptyState,
  title,
  subtitle,
  searchPlaceholder = 'Search...',
  showCount = true,
  className = '',
}: ListContainerProps<T>) {
  // ========== STATE ==========
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(defaultFilter);
  const [currentPage, setCurrentPage] = useState(1);

  // ========== DERIVED STATE ==========

  // Filter and search items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Apply status filter
      const filterMatch = activeFilter === 'all' || getFilterValue(item) === activeFilter;

      // Apply search filter
      const searchMatch = searchQuery === '' ||
        getSearchableText(item).toLowerCase().includes(searchQuery.toLowerCase());

      return filterMatch && searchMatch;
    });
  }, [items, activeFilter, searchQuery, getFilterValue, getSearchableText]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / pageSize);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Reset to page 1 when filters change
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    items.forEach((item) => {
      const filterVal = getFilterValue(item);
      counts[filterVal] = (counts[filterVal] || 0) + 1;
    });
    return counts;
  }, [items, getFilterValue]);

  // ========== RENDER ==========
  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* ===== HEADER (Gold bar) ===== */}
      <div className="px-4 py-3 bg-[#c9a227]">
        {/* Title Row */}
        {(title || headerActions) && (
          <div className="flex items-center justify-between mb-3">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-white">
                  {title}
                  {showCount && (
                    <span className="ml-2 text-sm font-normal text-white/70">
                      ({filteredItems.length})
                    </span>
                  )}
                </h2>
              )}
              {subtitle && <p className="text-sm text-white/80 mt-0.5">{subtitle}</p>}
            </div>
            {headerActions && (
              <div className="flex items-center gap-2">{headerActions}</div>
            )}
          </div>
        )}

        {/* Search & Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white/90 border-0 rounded-lg focus:ring-2 focus:ring-white/50 focus:bg-white transition-colors placeholder:text-stone-400"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {filterOptions.map((option) => {
              const count = filterCounts[option.value] || 0;
              const isActive = activeFilter === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange(option.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-white text-[#c9a227]'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {option.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-[#c9a227]/20 text-[#c9a227]' : 'bg-white/20'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
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
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* ===== LIST CONTENT (Level 2: Clean white background for rows) ===== */}
      <div className="bg-white">
        {loading ? (
          // Loading skeleton
          <div className="p-8 text-center">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading...
            </div>
          </div>
        ) : paginatedItems.length === 0 ? (
          // Empty state
          <div className="p-8 text-center">
            {emptyState || (
              <div className="text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="font-medium">No items found</p>
                <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        ) : (
          // Render items
          paginatedItems.map((item, index) => renderItem(item, index))
        )}
      </div>

      {/* ===== PAGINATION ===== */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredItems.length}
        pageSize={pageSize}
      />
    </div>
  );
}
