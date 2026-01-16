'use client';

interface PerformanceChartProps {
  data?: { label: string; value: number }[];
  loading?: boolean;
}

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm animate-pulse">
      <div className="w-40 h-6 bg-gray-200 rounded mb-6" />
      <div className="flex items-end justify-between gap-2 h-48">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex-1 bg-gray-200 rounded-t" style={{ height: `${30 + Math.random() * 60}%` }} />
        ))}
      </div>
      <div className="flex justify-between mt-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="w-8 h-3 bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function PerformanceChart({ data, loading }: PerformanceChartProps) {
  if (loading || !data) return <ChartSkeleton />;

  const maxValue = Math.max(...data.map((d) => Math.abs(d.value)), 1);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-[#1a1a1d]">Weekly Performance</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <span className="text-gray-600">Profit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <span className="text-gray-600">Loss</span>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3 h-48" role="img" aria-label="Weekly performance chart">
        {data.map((item, i) => {
          const height = (Math.abs(item.value) / maxValue) * 100;
          const isPositive = item.value >= 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="relative w-full flex-1 flex items-end">
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80 ${
                    isPositive
                      ? 'bg-gradient-to-t from-green-500 to-green-400'
                      : 'bg-gradient-to-t from-red-500 to-red-400'
                  }`}
                  style={{ height: `${Math.max(height, 8)}%` }}
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {isPositive ? '+' : ''}${item.value.toFixed(0)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-4">
        {data.map((item, i) => (
          <div key={i} className="flex-1 text-center text-xs text-gray-500">
            {item.label}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">Total P/L</div>
          <div className={`text-xl font-bold ${data.reduce((a, b) => a + b.value, 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.reduce((a, b) => a + b.value, 0) >= 0 ? '+' : ''}${data.reduce((a, b) => a + b.value, 0).toFixed(2)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Win Rate</div>
          <div className="text-xl font-bold text-[#1a1a1d]">
            {((data.filter((d) => d.value > 0).length / data.length) * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
}
