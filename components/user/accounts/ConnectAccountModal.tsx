'use client';

import { useState } from 'react';

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (data: ConnectAccountData) => void;
}

export interface ConnectAccountData {
  accountName: string;
  broker: string;
  server: string;
  login: string;
  password: string;
  investorPassword?: string;
}

const popularBrokers = [
  { id: 'ftmo', name: 'FTMO', logo: '🏆' },
  { id: 'icmarkets', name: 'IC Markets', logo: '💹' },
  { id: 'pepperstone', name: 'Pepperstone', logo: '🌶️' },
  { id: 'fbs', name: 'FBS', logo: '📊' },
  { id: 'exness', name: 'Exness', logo: '📈' },
  { id: 'xm', name: 'XM', logo: '✨' },
  { id: 'other', name: 'Other', logo: '🔧' },
];

export default function ConnectAccountModal({
  isOpen,
  onClose,
  onConnect,
}: ConnectAccountModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
  const [formData, setFormData] = useState<ConnectAccountData>({
    accountName: '',
    broker: '',
    server: '',
    login: '',
    password: '',
    investorPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBrokerSelect = (brokerId: string, brokerName: string) => {
    setSelectedBroker(brokerId);
    setFormData(prev => ({ ...prev, broker: brokerName }));
    setStep(2);
  };

  const handleInputChange = (field: keyof ConnectAccountData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleConnect = async () => {
    // Validation
    if (!formData.accountName.trim()) {
      setError('Please enter an account name');
      return;
    }
    if (!formData.server.trim()) {
      setError('Please enter the server address');
      return;
    }
    if (!formData.login.trim()) {
      setError('Please enter your login/account number');
      return;
    }
    if (!formData.password.trim() && !formData.investorPassword?.trim()) {
      setError('Please enter either main password or investor password');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      onConnect(formData);
      handleClose();
    } catch (err) {
      setError('Failed to connect. Please check your credentials.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedBroker(null);
    setFormData({
      accountName: '',
      broker: '',
      server: '',
      login: '',
      password: '',
      investorPassword: '',
    });
    setError(null);
    onClose();
  };

  const handleBack = () => {
    setStep(1);
    setSelectedBroker(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={handleBack}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h2 className="text-lg font-semibold text-[#1a1a1d]">
                {step === 1 ? 'Connect MT5 Account' : `Connect to ${formData.broker}`}
              </h2>
              <p className="text-xs text-gray-500">
                {step === 1 ? 'Select your broker' : 'Enter your account credentials'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {step === 1 ? (
            /* Step 1: Broker Selection */
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Choose your broker to get started. We support all MT5 brokers.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {popularBrokers.map((broker) => (
                  <button
                    key={broker.id}
                    onClick={() => handleBrokerSelect(broker.id, broker.name)}
                    className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-[#c9a227]/5 hover:border-[#c9a227] border-2 border-transparent rounded-xl transition-all"
                  >
                    <span className="text-2xl">{broker.logo}</span>
                    <span className="text-sm font-medium text-[#1a1a1d]">{broker.name}</span>
                  </button>
                ))}
              </div>

              {/* Security note */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl mt-4">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs text-blue-700 font-medium">Secure Connection</p>
                  <p className="text-xs text-blue-600">
                    We recommend using your investor (read-only) password for security. Your credentials are encrypted.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Step 2: Credentials Form */
            <div className="space-y-4">
              {/* Account Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Account Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => handleInputChange('accountName', e.target.value)}
                  placeholder="e.g., My FTMO Challenge"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all text-sm"
                />
              </div>

              {/* Server */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Server <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.server}
                  onChange={(e) => handleInputChange('server', e.target.value)}
                  placeholder="e.g., FTMO-Demo, ICMarketsSC-MT5"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all text-sm"
                />
              </div>

              {/* Login */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Login / Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.login}
                  onChange={(e) => handleInputChange('login', e.target.value)}
                  placeholder="e.g., 12345678"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all text-sm"
                />
              </div>

              {/* Password Section */}
              <div className="p-3 bg-gray-50 rounded-xl space-y-3">
                <p className="text-xs text-gray-500">
                  Enter either your main password or investor password:
                </p>
                
                {/* Main Password */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Main Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 border-t border-gray-200" />
                  <span className="text-xs text-gray-400">or</span>
                  <div className="flex-1 border-t border-gray-200" />
                </div>

                {/* Investor Password */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Investor Password <span className="text-green-600 text-[10px]">(Recommended)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.investorPassword}
                      onChange={(e) => handleInputChange('investorPassword', e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] transition-all text-sm pr-10"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Read-only access - we can only view your trades, not execute any.
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs">{error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 2 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full py-3 bg-[#c9a227] hover:bg-[#b8922a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isConnecting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Connect Account
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
