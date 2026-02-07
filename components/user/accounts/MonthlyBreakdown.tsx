'use client';

interface MonthlyData {
  year: number;
  month: number;
  monthName: string;
  profit: number;
  gainPercent: number;
  trades: number;
  winRate: number;
}

interface MonthlyBreakdownProps {
  data?: MonthlyData[];
  loading?: boolean;
}

export function MonthlyBreakdownSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-[#c9a227] via-[#f0d78c] to-[#c9a227]" />
      <div className="p-6">
        <div className="w-40 h-6 bg-gray-200 rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-4 gap-2">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MonthlyBreakdown({ data, loading }: MonthlyBreakdownProps) {
  if (loading || !data) return <MonthlyBreakdownSkeleton />;

  // Group by year
  const byYear = data.reduce((acc, item) => {
    if (!acc[item.year]) acc[item.year] = [];
    acc[item.year].push(item);
    return acc;
  }, {} as Record<number, MonthlyData[]>);

  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  // Calculate yearly totals
  const yearlyTotals = years.map(year => ({
    year,
    profit: byYear[year].reduce((sum, m) => sum + m.profit, 0),
    gainPercent: byYear[year].reduce((sum, m) => sum + m.gainPercent, 0),
  }));

  const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-[#c9a227] via-[#f0d78c] to-[#c9a227]" />
      <div className="p-6">
        <h3 className="text-lg font-bold text-[#1a1a1d] mb-6">Monthly Performance</h3>

        {years.map((year) => {
          const yearData = byYear[year];
          const yearTotal = yearlyTotals.find(y => y.year === year);

          return (
            <div key={year} className="mb-6 last:mb-0">
              {/* Year Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-[#1a1a1d]">{year}</span>
                <span className={`text-sm font-semibold ${(yearTotal?.gainPercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(yearTotal?.gainPercent || 0) >= 0 ? '+' : ''}{yearTotal?.gainPercent.toFixed(2)}%
                </span>
              </div>

              {/* Month Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
                {allMonths.map((monthName, monthIndex) => {
                  const monthData = yearData.find(m => m.month === monthIndex + 1);
                  
                  if (!monthData) {
                    return (
                      <div
                        key={monthName}
                        className="aspect-square flex flex-col items-center justify-center bg-gray-50 rounded-lg text-gray-300"
                      >
                        <span className="text-xs">{monthName}</span>
                        <span className="text-xs">—</span>
                      </div>
                    );
                  }

                  const isPositive = monthData.gainPercent >= 0;
                  const intensity = Math.min(Math.abs(monthData.gainPercent) / 10, 1);
                  
                  return (
                    <div
                      key={monthName}
                      className={`aspect-square flex flex-col items-center justify-center rounded-lg transition-all hover:scale-105 cursor-pointer group relative ${
                        isPositive
                          ? 'bg-green-50 hover:bg-green-100'
                          : 'bg-red-50 hover:bg-red-100'
                      }`}
                      style={{
                        backgroundColor: isPositive
                          ? `rgba(34, 197, 94, ${0.1 + intensity * 0.3})`
                          : `rgba(239, 68, 68, ${0.1 + intensity * 0.3})`,
                      }}
                    >
                      <span className="text-xs text-gray-600">{monthName}</span>
                      <span className={`text-xs font-bold ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
                        {isPositive ? '+' : ''}{monthData.gainPercent.toFixed(1)}%
                      </span>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        <div className="font-semibold">{monthName} {year}</div>
                        <div>Profit: ${monthData.profit.toFixed(2)}</div>
                        <div>Trades: {monthData.trades}</div>
                        <div>Win Rate: {monthData.winRate.toFixed(0)}%</div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-red-200" />
              <span>Loss</span>
            </div>
            <div className="w-8 h-1 bg-gradient-to-r from-red-200 via-gray-100 to-green-200 rounded" />
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-green-200" />
              <span>Profit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
