'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notifications: true
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setFormData({
      name: parsedUser.name || '',
      email: parsedUser.email || '',
      phone: parsedUser.phone || '',
      notifications: parsedUser.notifications ?? true
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50 to-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-[#1a1a1d]">
            AU<span className="text-[#c9a227]">Next</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="text-gray-600 hover:text-[#1a1a1d] transition">Dashboard</a>
            <a href="/trades" className="text-gray-600 hover:text-[#1a1a1d] transition">My Trades</a>
            <a href="/profile" className="text-[#c9a227] font-medium">Profile</a>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-[#1a1a1d] mb-8">Profile Settings</h1>

        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
            <div className="w-24 h-24 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-full flex items-center justify-center text-[#1a1a1d] text-3xl font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1a1a1d]">{formData.name || 'User'}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
                user?.role === 'admin' 
                  ? 'bg-[#c9a227]/20 text-[#f0d78c]' 
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {user?.role || 'user'}
              </span>
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                disabled={!editing}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-[#1a1a1d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c9a227] focus:border-transparent disabled:bg-gray-100 disabled:opacity-50 transition-all"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
              />
              <p className="text-gray-500 text-sm mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                disabled={!editing}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-[#1a1a1d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c9a227] focus:border-transparent disabled:bg-gray-100 disabled:opacity-50 transition-all"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-[#1a1a1d] mb-1">Email Notifications</label>
                <p className="text-gray-600 text-sm">Receive trade alerts and updates</p>
              </div>
              <button
                onClick={() => editing && setFormData({...formData, notifications: !formData.notifications})}
                disabled={!editing}
                className={`relative w-14 h-7 rounded-full transition ${
                  formData.notifications ? 'bg-[#c9a227]' : 'bg-gray-600'
                } disabled:opacity-50`}
              >
                <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  formData.notifications ? 'translate-x-7' : ''
                }`} />
              </button>
            </div>

            <div className="flex gap-4 pt-6">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 py-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-xl text-[#1a1a1d] font-semibold rounded-xl transition-all duration-300 shadow-md"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditing(false);
                      // Reset form
                      setFormData({
                        name: user.name || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        notifications: user.notifications ?? true
                      });
                    }}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-[#1a1a1d] font-semibold rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 py-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:from-[#f0d78c] hover:to-[#c9a227] text-[#1a1a1d] font-bold rounded-lg transition"
                  >
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
