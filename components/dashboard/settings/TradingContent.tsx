'use client';

interface TradingForm {
  trading_risk_level: string;
  default_stop_loss: string;
  default_take_profit: string;
}

interface TradingContentProps {
  form: TradingForm;
  setForm: (form: TradingForm) => void;
  onUpdate: (updates: Partial<TradingForm>) => void;
  saving: boolean;
}

export default function TradingContent({ form, setForm, onUpdate, saving }: TradingContentProps) {
  return (
    <div className="p-8">
      <div className="mb-10">
        <h3 className="text-xl font-bold text-[#1a1a1d] mb-2">Trading Defaults</h3>
        <p className="text-gray-400 text-sm font-medium">Set your global risk parameters and execution defaults.</p>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Risk Appetite</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['conservative', 'moderate', 'aggressive'].map((level) => (
              <button
                key={level}
                onClick={() => {
                  setForm({ ...form, trading_risk_level: level });
                  onUpdate({ trading_risk_level: level });
                }}
                className={`py-4 rounded-2xl border text-sm font-bold capitalize transition-all ${
                  form.trading_risk_level === level
                    ? 'bg-amber-50 border-[#c9a227] text-[#c9a227] shadow-sm shadow-amber-100'
                    : 'bg-gray-50/50 border-gray-100 text-gray-400 hover:border-gray-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 font-medium italic px-1">
            * This setting influences our EA&apos;s position sizing and drawdown thresholds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Default Stop Loss (Pips)</label>
            <input
              type="number"
              placeholder="e.g. 30"
              value={form.default_stop_loss}
              onChange={(e) => setForm({ ...form, default_stop_loss: e.target.value })}
              className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all font-semibold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Default Take Profit (Pips)</label>
            <input
              type="number"
              placeholder="e.g. 60"
              value={form.default_take_profit}
              onChange={(e) => setForm({ ...form, default_take_profit: e.target.value })}
              className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all font-semibold"
            />
          </div>
        </div>

        <div className="mt-6 pt-8 border-t border-gray-50">
          <button
            onClick={() => onUpdate({
              default_stop_loss: form.default_stop_loss,
              default_take_profit: form.default_take_profit
            })}
            disabled={saving}
            className="px-8 py-3.5 bg-[#1a1a1d] text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Trading Defaults'}
          </button>
        </div>
      </div>
    </div>
  );
}
