'use client';

interface PreferencesForm {
  language: string;
  timezone: string;
  email_notifications_enabled: boolean;
  push_notifications_enabled: boolean;
  sms_notifications_enabled: boolean;
  two_factor_enabled: boolean;
}

interface PreferencesContentProps {
  form: PreferencesForm;
  setForm: (form: PreferencesForm) => void;
  onUpdate: (updates: Partial<PreferencesForm>) => void;
}

export default function PreferencesContent({ form, setForm, onUpdate }: PreferencesContentProps) {
  const notificationChannels = [
    {
      id: 'email_notifications_enabled' as const,
      label: 'Email Notifications',
      desc: 'Receive trade reports and account alerts via email.',
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    },
    {
      id: 'push_notifications_enabled' as const,
      label: 'Browser Push',
      desc: 'Real-time alerts directly on your device.',
      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
    },
    {
      id: 'sms_notifications_enabled' as const,
      label: 'SMS Alerts',
      desc: 'Urgent margin calls and execution alerts via text.',
      icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z'
    },
  ];

  const handleToggle = (field: keyof PreferencesForm) => {
    const nextVal = !form[field];
    setForm({ ...form, [field]: nextVal });
    onUpdate({ [field]: nextVal });
  };

  return (
    <div className="p-8">
      <div className="mb-10">
        <h3 className="text-xl font-bold text-[#1a1a1d] mb-2">App Preferences</h3>
        <p className="text-gray-400 text-sm font-medium">Customize your experience and notifications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Language</label>
          <select
            value={form.language}
            onChange={(e) => {
              setForm({ ...form, language: e.target.value });
              onUpdate({ language: e.target.value });
            }}
            className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all font-semibold appearance-none"
          >
            <option value="en">English (US)</option>
            <option value="es">Espa&ntilde;ol</option>
            <option value="fr">Fran&ccedil;ais</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Timezone</label>
          <select
            value={form.timezone}
            onChange={(e) => {
              setForm({ ...form, timezone: e.target.value });
              onUpdate({ timezone: e.target.value });
            }}
            className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all font-semibold appearance-none"
          >
            <option value="UTC">UTC (Greenwich Mean Time)</option>
            <option value="America/New_York">EST (Eastern Standard Time)</option>
            <option value="Europe/London">GMT/BST (London)</option>
            <option value="Asia/Tokyo">JST (Tokyo)</option>
          </select>
        </div>
      </div>

      <div className="mt-12 space-y-4">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Notification Channels</h4>

        {notificationChannels.map((chan) => (
          <div key={chan.id} className="flex items-center justify-between p-5 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={chan.icon} />
                </svg>
              </div>
              <div>
                <p className="font-bold text-sm text-[#1a1a1d]">{chan.label}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">{chan.desc}</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle(chan.id)}
              className={`relative w-12 h-6 rounded-full transition-colors ${form[chan.id] ? 'bg-[#c9a227]' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${form[chan.id] ? 'translate-x-6' : ''}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
