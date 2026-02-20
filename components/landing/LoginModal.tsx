'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        onClose();
        
        if (data.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/accounts');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    if (!firstName || !lastName) {
      setError('First name and last name are required');
      setLoading(false);
      return;
    }

    try {
      // Create user
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role: 'user',
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Auto-login after signup
        const loginResponse = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
          localStorage.setItem('user', JSON.stringify(loginData.user));
          onClose();
          router.push('/accounts');
        } else {
          // Signup successful but auto-login failed, switch to login mode
          setMode('login');
          setError('Account created! Please sign in.');
        }
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setPhone('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-slide-up relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-surface-dark mb-2">
            AU<span className="text-primary-gold">Next</span>
          </div>
          <h2 className="text-2xl font-bold text-surface-dark mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600">
            {mode === 'login' ? 'Sign in to start trading' : 'Join us and start trading today'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
              mode === 'login'
                ? 'bg-gradient-to-r from-primary-gold to-secondary-gold text-surface-dark shadow-md'
                : 'text-gray-600 hover:text-surface-dark'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-primary-gold to-secondary-gold text-surface-dark shadow-md'
                : 'text-gray-600 hover:text-surface-dark'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-6 animate-shake">
            {error}
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-surface-dark mb-2">
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
              <label className="block text-sm font-semibold text-surface-dark mb-2">
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
              className="w-full py-3 bg-gradient-to-r from-primary-gold to-secondary-gold text-surface-dark font-semibold rounded-xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transform hover:scale-105 flex justify-center items-center gap-2"
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
        )}

        {/* Signup Form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-surface-dark mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input-base text-surface-dark"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-dark mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input-base text-surface-dark"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-dark mb-2">
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
              <label className="block text-sm font-semibold text-surface-dark mb-2">
                Phone Number <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-base text-surface-dark"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-dark mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base text-surface-dark"
                placeholder="••••••••"
                minLength={8}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-dark mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-base text-surface-dark"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-gold to-secondary-gold text-surface-dark font-semibold rounded-xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transform hover:scale-105"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Demo accounts - only show for login */}
        {mode === 'login' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-3">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setEmail('admin@au.com');
                  setPassword('admin');
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-surface-dark text-sm font-medium rounded-lg transition"
              >
                👨‍💼 Admin
              </button>
              <button
                onClick={() => {
                  setEmail('user@au.com');
                  setPassword('user');
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-surface-dark text-sm font-medium rounded-lg transition"
              >
                👤 User
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
