'use client';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg?: string;
  variant?: 'default' | 'gold';
  badge?: string;
  loading?: boolean;
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-xl" />
        <div className="w-12 h-4 bg-gray-200 rounded" />
      </div>
      <div className="w-24 h-4 bg-gray-200 rounded mb-2" />
      <div className="w-32 h-8 bg-gray-200 rounded mb-2" />
      <div className="w-20 h-3 bg-gray-200 rounded" />
    </div>
  );
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  iconBg = 'bg-blue-50',
  variant = 'default',
  badge,
  loading,
}: StatsCardProps) {
  if (loading) return <StatsCardSkeleton />;

  if (variant === 'gold') {
    return (
      <div className="bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">{icon}</div>
          {badge && <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">{badge}</span>}
        </div>
        <div className="text-sm opacity-90 mb-1">{title}</div>
        <div className="text-3xl font-bold">{value}</div>
        {subtitle && <div className="text-xs opacity-75 mt-2">{subtitle}</div>}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>{icon}</div>
        {badge && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-green-600">{badge}</span>
          </div>
        )}
      </div>
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-3xl font-bold text-[#1a1a1d]">{value}</div>
      {subtitle && <div className="text-xs text-green-600 mt-2">{subtitle}</div>}
    </div>
  );
}
