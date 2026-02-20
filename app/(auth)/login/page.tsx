'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/accounts');
        }
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-primary-gold/5 to-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl p-8 border-2 border-primary-gold/20 shadow-xl">
          <h1 className="text-3xl font-bold text-surface-dark mb-2 text-center">Welcome Back</h1>
          <p className="text-gray-600 text-center mb-8">Sign in to AU-Next Trading</p>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-surface-dark mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base text-surface-dark"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-dark mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base text-surface-dark"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-gold to-secondary-gold hover:from-secondary-gold hover:to-primary-gold text-surface-dark font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-gold focus-visible:ring-offset-2"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-surface-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Demo accounts: <br />
              <span className="text-primary-gold">admin@au.com / admin</span> (Admin) <br />
              <span className="text-primary-gold">user@au.com / user</span> (User)
            </p>
          </div>

          <div className="mt-4 text-center">
            <a href="/" className="text-primary-gold hover:text-secondary-gold text-sm">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
