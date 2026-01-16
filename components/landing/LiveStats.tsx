'use client';

import { useEffect, useState } from 'react';

interface LandingStats {
  totalUsers: number;
  totalTrades: number;
  tradesToday: number;
  avgWinRate: number;
  activeConnections: number;
  uptime: number;
}

interface LiveStatsProps {
  className?: string;
}

export default function LiveStats({ className = '' }: LiveStatsProps) {
  const [stats, setStats] = useState<LandingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/landing-stats');
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch landing stats:', error);
        // Use fallback stats
        setStats({
          totalUsers: 150,
          totalTrades: 12500,
          tradesToday: 89,
          avgWinRate: 72.5,
          activeConnections: 45,
          uptime: 99.9
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-200 shadow-lg p-12 ${className}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded-lg mb-2 w-24 mx-auto" />
              <div className="h-4 bg-gray-200 rounded w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-lg p-12 hover:shadow-2xl transition-shadow duration-500 ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div className="group cursor-pointer transform hover:scale-110 transition-transform duration-300">
          <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#c9a227] to-[#f0d78c] mb-2 group-hover:animate-pulse">
            {stats?.uptime || 99.9}%
          </div>
          <div className="text-gray-600 font-medium group-hover:text-[#c9a227] transition-colors">Uptime</div>
        </div>
        <div className="group cursor-pointer transform hover:scale-110 transition-transform duration-300">
          <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#c9a227] to-[#f0d78c] mb-2 group-hover:animate-pulse">
            {formatNumber(stats?.totalTrades || 0)}+
          </div>
          <div className="text-gray-600 font-medium group-hover:text-[#c9a227] transition-colors">Trades Executed</div>
        </div>
        <div className="group cursor-pointer transform hover:scale-110 transition-transform duration-300">
          <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#c9a227] to-[#f0d78c] mb-2 group-hover:animate-pulse">
            {stats?.avgWinRate || 0}%
          </div>
          <div className="text-gray-600 font-medium group-hover:text-[#c9a227] transition-colors">Avg Win Rate</div>
        </div>
        <div className="group cursor-pointer transform hover:scale-110 transition-transform duration-300">
          <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#c9a227] to-[#f0d78c] mb-2 group-hover:animate-pulse">
            {formatNumber(stats?.totalUsers || 0)}+
          </div>
          <div className="text-gray-600 font-medium group-hover:text-[#c9a227] transition-colors">Active Traders</div>
        </div>
      </div>
    </div>
  );
}
