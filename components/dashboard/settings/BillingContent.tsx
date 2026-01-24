'use client';

export default function BillingContent() {
  return (
    <div className="p-8">
      <div className="mb-10">
        <h3 className="text-xl font-bold text-[#1a1a1d] mb-2">Billing & Subscription</h3>
        <p className="text-gray-400 text-sm font-medium">Manage your subscription plan and view payment history.</p>
      </div>

      <div className="space-y-8">
        {/* Current Plan Card */}
        <div className="bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-2xl p-8 text-[#1a1a1d] shadow-lg shadow-[#c9a227]/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-2">Current Active Plan</div>
              <h2 className="text-4xl font-black mb-2">Pro Trader</h2>
              <div className="text-2xl font-bold">$199<span className="text-sm font-medium opacity-70">/month</span></div>
            </div>
            <div className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/40">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/20 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Next billing date</div>
              <div className="font-bold">February 16, 2026</div>
            </div>
            <button className="px-5 py-2 bg-[#1a1a1d] text-white text-xs font-bold rounded-lg hover:bg-[#2a2a2d] transition-colors">
              Manage Auto-renew
            </button>
          </div>
        </div>

        {/* Other Plans */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Available Upgrades</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-[#f0d78c] transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#c9a227] shadow-sm border border-amber-50 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-[#1a1a1d]">$499</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">per month</div>
                </div>
              </div>
              <h5 className="font-bold text-[#1a1a1d] mb-4">Institutional Premium</h5>
              <ul className="space-y-3 mb-8">
                {['Unlimited MT5 Accounts', 'Premium EA Suite', '24/7 VIP Dedicated Support', 'Custom EA Optimization'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                    <svg className="w-4 h-4 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3.5 bg-white border border-gray-200 text-[#1a1a1d] font-bold text-sm rounded-xl hover:border-[#c9a227] transition-colors shadow-sm">
                Upgrade Account
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 opacity-60">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-[#1a1a1d]">$99</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">per month</div>
                </div>
              </div>
              <h5 className="font-bold text-[#1a1a1d] mb-4">Basic Starter</h5>
              <ul className="space-y-3 mb-8">
                {['1 MT5 Account', 'Standard EA Portfolio', 'Email Support', 'Manual Signal Copying'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3.5 bg-gray-100 text-gray-400 font-bold text-sm rounded-xl cursor-not-allowed">
                Downgrade Unavailable
              </button>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="pt-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Payment History</h4>
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Invoice</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Date</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Amount</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { id: 'INV-2026-001', date: 'Jan 16, 2026', amount: '$199.00', status: 'Paid' },
                  { id: 'INV-2025-012', date: 'Dec 16, 2025', amount: '$199.00', status: 'Paid' },
                ].map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[#1a1a1d]">{inv.id}</td>
                    <td className="px-6 py-4 text-gray-500 font-semibold">{inv.date}</td>
                    <td className="px-6 py-4 font-bold text-[#1a1a1d]">{inv.amount}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider border border-green-100">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
