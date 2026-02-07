'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PortfolioWidgetProps {
  accountId: string;
  balance?: number;
  equity?: number;
  gain?: number;
  todayPnL?: number;
  openTrades?: number;
  isConnected?: boolean;
}

export default function PortfolioWidget({
  accountId,
  balance = 12450.00,
  equity = 12380.50,
  gain = 124.5,
  todayPnL = 285.40,
  openTrades = 3,
  isConnected = true,
}: PortfolioWidgetProps) {
  const router = useRouter();
  const [currentEquity, setCurrentEquity] = useState(equity);
  const [isHovered, setIsHovered] = useState(false);
  const [showSparkline, setShowSparkline] = useState(false);

  // Simulate live equity fluctuation
  useEffect(() => {
    if (!isConnected) return;
    
    const interval = setInterval(() => {
      setCurrentEquity(prev => {
        const change = (Math.random() - 0.5) * 10;
        return Number((prev + change).toFixed(2));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Sparkline animation delay
  useEffect(() => {
    const timer = setTimeout(() => setShowSparkline(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Generate sparkline points
  const sparklinePoints = Array.from({ length: 24 }, (_, i) => {
    const base = 50;
    const trend = i * 0.8;
    const noise = Math.sin(i * 0.5) * 15 + Math.random() * 10;
    return base - trend - noise + 20;
  });

  const sparklinePath = sparklinePoints
    .map((y, i) => `${i === 0 ? 'M' : 'L'} ${i * 4.5} ${y}`)
    .join(' ');

  const equityChange = currentEquity - equity;
  const equityChangePercent = ((equityChange / equity) * 100).toFixed(3);

  return (
    <div
      onClick={() => router.push(`/accounts/${accountId}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden rounded-2xl cursor-pointer group"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-[#0d0d0f]">
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-[#c9a227]/20 via-transparent to-[#c9a227]/10 transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-50'
          }`}
        />
        {/* Animated grid lines */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#c9a227" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        {/* Scan line effect */}
        <div 
          className={`absolute inset-0 bg-gradient-to-b from-transparent via-[#c9a227]/5 to-transparent transition-transform duration-1000 ${
            isHovered ? 'translate-y-full' : '-translate-y-full'
          }`}
          style={{ height: '200%', top: '-50%' }}
        />
      </div>

      <div className="relative p-4">
        {/* Header with live indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#4ade80]' : 'bg-red-500'}`} />
              {isConnected && (
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#4ade80] animate-ping" />
              )}
            </div>
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-gray-500">
            <span>MT5</span>
            <span className="text-[#c9a227]">•</span>
            <span>FTMO</span>
          </div>
        </div>

        {/* Main equity display */}
        <div className="mb-4">
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">
            Equity
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tracking-tight">
              ${currentEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className={`text-xs font-mono ${equityChange >= 0 ? 'text-[#4ade80]' : 'text-red-400'}`}>
              {equityChange >= 0 ? '+' : ''}{equityChangePercent}%
            </span>
          </div>
        </div>

        {/* Sparkline chart */}
        <div className="relative h-12 mb-4 overflow-hidden rounded-lg bg-black/30">
          <svg 
            className="w-full h-full" 
            viewBox="0 0 108 60" 
            preserveAspectRatio="none"
          >
            {/* Gradient fill */}
            <defs>
              <linearGradient id="sparkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#c9a227" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#c9a227" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Area fill */}
            <path
              d={`${sparklinePath} L 103.5 60 L 0 60 Z`}
              fill="url(#sparkGradient)"
              className={`transition-all duration-1000 ${showSparkline ? 'opacity-100' : 'opacity-0'}`}
            />
            {/* Line */}
            <path
              d={sparklinePath}
              fill="none"
              stroke="#c9a227"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-all duration-1000 ${showSparkline ? 'opacity-100' : 'opacity-0'}`}
              style={{
                strokeDasharray: showSparkline ? 'none' : '300',
                strokeDashoffset: showSparkline ? '0' : '300',
              }}
            />
            {/* Current point */}
            <circle
              cx="103.5"
              cy={sparklinePoints[sparklinePoints.length - 1]}
              r="3"
              fill="#c9a227"
              className={`transition-all duration-1000 ${showSparkline ? 'opacity-100' : 'opacity-0'}`}
            />
            {isConnected && (
              <circle
                cx="103.5"
                cy={sparklinePoints[sparklinePoints.length - 1]}
                r="6"
                fill="#c9a227"
                opacity="0.3"
                className="animate-ping"
              />
            )}
          </svg>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center">
            <div className={`text-sm font-bold font-mono ${gain >= 0 ? 'text-[#4ade80]' : 'text-red-400'}`}>
              {gain >= 0 ? '+' : ''}{gain}%
            </div>
            <div className="text-[9px] font-mono text-gray-500 uppercase">Total Gain</div>
          </div>
          <div className="text-center border-x border-gray-800">
            <div className={`text-sm font-bold font-mono ${todayPnL >= 0 ? 'text-[#4ade80]' : 'text-red-400'}`}>
              {todayPnL >= 0 ? '+' : ''}${todayPnL.toFixed(0)}
            </div>
            <div className="text-[9px] font-mono text-gray-500 uppercase">Today</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold font-mono text-white">
              {openTrades}
            </div>
            <div className="text-[9px] font-mono text-gray-500 uppercase">Open</div>
          </div>
        </div>

        {/* Bottom action */}
        <div 
          className={`flex items-center justify-center gap-2 py-2 rounded-lg border transition-all duration-300 ${
            isHovered 
              ? 'bg-[#c9a227] border-[#c9a227] text-black' 
              : 'bg-transparent border-gray-800 text-gray-400'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-xs font-semibold uppercase tracking-wider">
            View Full Portfolio
          </span>
          <svg 
            className={`w-4 h-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#c9a227]/50 rounded-tl-2xl" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#c9a227]/50 rounded-tr-2xl" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#c9a227]/50 rounded-bl-2xl" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#c9a227]/50 rounded-br-2xl" />
    </div>
  );
}

export function PortfolioWidgetSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0d0d0f] p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="w-16 h-3 bg-gray-800 rounded animate-pulse" />
        <div className="w-20 h-3 bg-gray-800 rounded animate-pulse" />
      </div>
      <div className="mb-4">
        <div className="w-12 h-2 bg-gray-800 rounded animate-pulse mb-2" />
        <div className="w-32 h-7 bg-gray-800 rounded animate-pulse" />
      </div>
      <div className="h-12 bg-gray-800/50 rounded-lg animate-pulse mb-4" />
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="text-center">
            <div className="w-12 h-4 bg-gray-800 rounded animate-pulse mx-auto mb-1" />
            <div className="w-10 h-2 bg-gray-800 rounded animate-pulse mx-auto" />
          </div>
        ))}
      </div>
      <div className="h-9 bg-gray-800 rounded-lg animate-pulse" />
    </div>
  );
}
