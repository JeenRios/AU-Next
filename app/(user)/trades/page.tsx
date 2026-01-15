'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TradesPage() {
  const router = useRouter();
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    fetchTrades();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTrades = async () => {
    try {
      const res = await fetch('/api/trades');
      const data = await res.json();
      setTrades(data.data || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrades = trades.filter(trade => 
    filter === 'ALL' || trade.type === filter
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-white">
            AU<span className="text-purple-400">Next</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="text-gray-300 hover:text-white transition">Dashboard</a>
            <a href="/trades" className="text-purple-400 font-medium">My Trades</a>
            <a href="/profile" className="text-gray-300 hover:text-white transition">Profile</a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">My Trades</h1>
          
          {/* Filter Buttons */}
          <div className="flex gap-2">
            {['ALL', 'BUY', 'SELL'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === type
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center text-white text-xl">Loading trades...</div>
        ) : (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">ID</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Symbol</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Price</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrades.map((trade) => (
                    <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-gray-400">#{trade.id}</td>
                      <td className="py-3 px-4 text-white font-medium">{trade.symbol}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          trade.type === 'BUY' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{parseFloat(trade.amount).toFixed(2)}</td>
                      <td className="py-3 px-4 text-gray-300">${parseFloat(trade.price).toFixed(4)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          trade.status === 'COMPLETED' 
                            ? 'bg-purple-500/20 text-purple-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {trade.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(trade.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredTrades.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No trades found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
