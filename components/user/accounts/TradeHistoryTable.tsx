'use client';

import { useState } from 'react';

interface Trade {
  id: string;
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  openPrice: number;
  closePrice: number;
  profit: number;
  pips: number;
  openTime: string;
  closeTime: string;
  duration: string;
}

interface TradeHistoryTableProps {
  trades?: Trade[];
  loading?: boolean;
  showPagination?: boolean;
  pageSize?: number;
}

export function TradeHistoryTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-[#c9a227] via-[#f0d78c] to-[#c9a227]" />
      <div className="p-6">
        <div className="w-32 h-6 bg-gray-200 rounded mb-6 animate-pulse" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg animate-pulse">
              <div className="w-16 h-4 bg-gray-200 rounded" />
              <div className="w-12 h-4 bg-gray-200 rounded" />
              <div className="w-20 h-4 bg-gray-200 rounded" />
              <div className="flex-1" />
              <div className="w-16 h-4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TradeHistoryTable({ 
  trades, 
  loading, 
  showPagination = true,
  pageSize = 10 
}: TradeHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Trade>('closeTime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  if (loading || !trades) return <TradeHistoryTableSkeleton />;

  // Sort trades
  const sortedTrades = [...trades].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * direction;
    }
    return String(aVal).localeCompare(String(bVal)) * direction;
  });

  // Paginate
  const totalPages = Math.ceil(sortedTrades.length / pageSize);
  const paginatedTrades = sortedTrades.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: keyof Trade) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: keyof Trade }) => (
    <svg
      className={`w-4 h-4 transition-transform ${sortField === field ? 'text-[#c9a227]' : 'text-gray-300'} ${
        sortField === field && sortDirection === 'asc' ? 'rotate-180' : ''
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-[#c9a227] via-[#f0d78c] to-[#c9a227]" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#1a1a1d]">Trade History</h3>
          <span className="text-sm text-gray-500">{trades.length} trades</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th className="pb-3 pr-4">
                  <button onClick={() => handleSort('symbol')} className="flex items-center gap-1 hover:text-[#1a1a1d]">
                    Symbol <SortIcon field="symbol" />
                  </button>
                </th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">
                  <button onClick={() => handleSort('volume')} className="flex items-center gap-1 hover:text-[#1a1a1d]">
                    Lots <SortIcon field="volume" />
                  </button>
                </th>
                <th className="pb-3 pr-4">Entry</th>
                <th className="pb-3 pr-4">Exit</th>
                <th className="pb-3 pr-4">
                  <button onClick={() => handleSort('pips')} className="flex items-center gap-1 hover:text-[#1a1a1d]">
                    Pips <SortIcon field="pips" />
                  </button>
                </th>
                <th className="pb-3 pr-4">
                  <button onClick={() => handleSort('profit')} className="flex items-center gap-1 hover:text-[#1a1a1d]">
                    Profit <SortIcon field="profit" />
                  </button>
                </th>
                <th className="pb-3">
                  <button onClick={() => handleSort('closeTime')} className="flex items-center gap-1 hover:text-[#1a1a1d]">
                    Closed <SortIcon field="closeTime" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedTrades.map((trade) => (
                <tr key={trade.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 pr-4">
                    <span className="font-semibold text-[#1a1a1d]">{trade.symbol}</span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                      trade.type === 'BUY' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-gray-600">{trade.volume.toFixed(2)}</td>
                  <td className="py-4 pr-4 text-gray-600 font-mono text-sm">{trade.openPrice.toFixed(5)}</td>
                  <td className="py-4 pr-4 text-gray-600 font-mono text-sm">{trade.closePrice.toFixed(5)}</td>
                  <td className="py-4 pr-4">
                    <span className={trade.pips >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {trade.pips >= 0 ? '+' : ''}{trade.pips.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className={`font-semibold ${trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 text-gray-500 text-sm">
                    <div>{trade.closeTime}</div>
                    <div className="text-xs text-gray-400">{trade.duration}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {showPagination && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, trades.length)} of {trades.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-[#c9a227] text-white'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="text-gray-400">...</span>}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
