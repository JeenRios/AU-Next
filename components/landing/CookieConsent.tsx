'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, can't be disabled
    analytics: true,
    marketing: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = { necessary: true, analytics: true, marketing: true };
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    setIsVisible(false);
  };

  const acceptSelected = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    setIsVisible(false);
  };

  const rejectNonEssential = () => {
    const minimal = { necessary: true, analytics: false, marketing: false };
    localStorage.setItem('cookie-consent', JSON.stringify(minimal));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {!showPreferences ? (
          /* Main Banner */
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🍪</span>
                  <h3 className="font-bold text-[#1a1a1d]">We value your privacy</h3>
                </div>
                <p className="text-sm text-gray-600">
                  We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                  By clicking &quot;Accept All&quot;, you consent to our use of cookies.{' '}
                  <a href="/privacy" className="text-[#c9a227] hover:underline">Privacy Policy</a>
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowPreferences(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#1a1a1d] transition-colors"
                >
                  Customize
                </button>
                <button
                  onClick={rejectNonEssential}
                  className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:border-[#c9a227] transition-colors"
                >
                  Reject All
                </button>
                <button
                  onClick={acceptAll}
                  className="px-6 py-2 text-sm font-semibold bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] rounded-lg hover:shadow-md transition-all"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Preferences Panel */
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[#1a1a1d] text-lg">Cookie Preferences</h3>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-gray-500 hover:text-[#1a1a1d]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Necessary Cookies */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-[#1a1a1d]">Necessary Cookies</div>
                  <p className="text-sm text-gray-600">Essential for the website to function properly</p>
                </div>
                <div className="w-12 h-6 bg-[#c9a227] rounded-full relative cursor-not-allowed opacity-75">
                  <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-[#1a1a1d]">Analytics Cookies</div>
                  <p className="text-sm text-gray-600">Help us understand how visitors use our site</p>
                </div>
                <button
                  onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    preferences.analytics ? 'bg-[#c9a227]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      preferences.analytics ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-[#1a1a1d]">Marketing Cookies</div>
                  <p className="text-sm text-gray-600">Used to deliver personalized advertisements</p>
                </div>
                <button
                  onClick={() => setPreferences({ ...preferences, marketing: !preferences.marketing })}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    preferences.marketing ? 'bg-[#c9a227]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      preferences.marketing ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={rejectNonEssential}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:border-[#c9a227] transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={acceptSelected}
                className="px-6 py-2 text-sm font-semibold bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] rounded-lg hover:shadow-md transition-all"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
