'use client';

interface GeneralForm {
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  postal_code: string;
}

interface GeneralContentProps {
  user: any;
  form: GeneralForm;
  setForm: (form: GeneralForm) => void;
  onSave: (updates: Partial<GeneralForm>) => void;
  saving: boolean;
}

export default function GeneralContent({ user, form, setForm, onSave, saving }: GeneralContentProps) {
  return (
    <div className="p-8">
      <div className="flex items-center gap-6 mb-10 pb-8 border-b border-gray-50">
        <div className="w-20 h-20 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl flex items-center justify-center text-[#c9a227] border border-amber-100">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#1a1a1d]">
            {form.first_name || 'Personal'} {form.last_name || 'Information'}
          </h3>
          <p className="text-gray-400 text-sm font-medium">
            {user?.email} • {user?.role?.toUpperCase()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">First Name</label>
          <input
            type="text"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all text-[#1a1a1d] font-semibold"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Last Name</label>
          <input
            type="text"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all text-[#1a1a1d] font-semibold"
          />
        </div>
        <div className="col-span-1 md:col-span-2 space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Phone Number</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all text-[#1a1a1d] font-semibold"
            placeholder="+1 (555) 000-0000"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Country</label>
          <input
            type="text"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all text-[#1a1a1d] font-semibold"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">City</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all text-[#1a1a1d] font-semibold"
          />
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-gray-50">
        <button
          onClick={() => onSave(form)}
          disabled={saving}
          className="px-8 py-3.5 bg-[#1a1a1d] hover:bg-[#2a2a2d] text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
