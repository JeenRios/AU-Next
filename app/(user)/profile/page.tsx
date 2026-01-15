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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-white">
            AU<span className="text-purple-400">Next</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="text-gray-300 hover:text-white transition">Dashboard</a>
            <a href="/trades" className="text-gray-300 hover:text-white transition">My Trades</a>
            <a href="/profile" className="text-purple-400 font-medium">Profile</a>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Profile Settings</h1>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{formData.name || 'User'}</h2>
              <p className="text-gray-400">{user?.email}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
                user?.role === 'admin' 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {user?.role || 'user'}
              </span>
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                disabled={!editing}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white opacity-50"
              />
              <p className="text-gray-500 text-sm mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                disabled={!editing}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-white mb-1">Email Notifications</label>
                <p className="text-gray-400 text-sm">Receive trade alerts and updates</p>
              </div>
              <button
                onClick={() => editing && setFormData({...formData, notifications: !formData.notifications})}
                disabled={!editing}
                className={`relative w-14 h-7 rounded-full transition ${
                  formData.notifications ? 'bg-purple-600' : 'bg-gray-600'
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
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition"
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
                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition"
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
