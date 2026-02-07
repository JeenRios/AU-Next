'use client';

interface AccountStatsCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function AccountStatsCardSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-100 ${sizeClasses[size]} animate-pulse`}>
      <div className="w-16 h-3 bg-gray-200 rounded mb-2" />
      <div className="w-24 h-7 bg-gray-200 rounded mb-1" />
      <div className="w-12 h-3 bg-gray-200 rounded" />
    </div>
  );
}

export default function AccountStatsCard({
  label,
  value,
  subtitle,
  trend,
  trendValue,
  size = 'md',
  loading,
}: AccountStatsCardProps) {
  if (loading) return <AccountStatsCardSkeleton size={size} />;

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const valueClasses = {
    sm: 'text-lg font-bold',
    md: 'text-2xl font-bold',
    lg: 'text-3xl font-bold',
  };

  const trendColors = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  };

  const trendIcons = {
    up: 'M5 10l7-7m0 0l7 7m-7-7v18',
    down: 'M19 14l-7 7m0 0l-7-7m7 7V3',
    neutral: 'M5 12h14',
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-100 ${sizeClasses[size]} hover:border-[#f0d78c]/50 hover:shadow-sm transition-all`}>
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</div>
      <div className="flex items-end gap-2">
        <span className={`${valueClasses[size]} text-[#1a1a1d]`}>{value}</span>
        {trend && trendValue && (
          <span className={`text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${trendColors[trend]}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={trendIcons[trend]} />
            </svg>
            {trendValue}
          </span>
        )}
      </div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    </div>
  );
}
