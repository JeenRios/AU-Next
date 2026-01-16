'use client';

import { useState, useEffect } from 'react';

interface MobileNavProps {
  onLoginClick: () => void;
}

export default function MobileNav({ onLoginClick }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-[#1a1a1d] hover:text-[#c9a227] transition-colors"
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="p-6">
          {/* Close Button */}
          <div className="flex justify-between items-center mb-8">
            <div className="text-xl font-bold text-[#1a1a1d]">
              AU<span className="text-[#c9a227]">Next</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-500 hover:text-[#1a1a1d] transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-4">
            <a
              href="#features"
              onClick={() => setIsOpen(false)}
              className="block py-3 px-4 text-[#1a1a1d] hover:bg-amber-50 hover:text-[#c9a227] rounded-xl transition-colors font-medium"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setIsOpen(false)}
              className="block py-3 px-4 text-[#1a1a1d] hover:bg-amber-50 hover:text-[#c9a227] rounded-xl transition-colors font-medium"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              onClick={() => setIsOpen(false)}
              className="block py-3 px-4 text-[#1a1a1d] hover:bg-amber-50 hover:text-[#c9a227] rounded-xl transition-colors font-medium"
            >
              Testimonials
            </a>
            <a
              href="#faq"
              onClick={() => setIsOpen(false)}
              className="block py-3 px-4 text-[#1a1a1d] hover:bg-amber-50 hover:text-[#c9a227] rounded-xl transition-colors font-medium"
            >
              FAQ
            </a>
            <a
              href="#contact"
              onClick={() => setIsOpen(false)}
              className="block py-3 px-4 text-[#1a1a1d] hover:bg-amber-50 hover:text-[#c9a227] rounded-xl transition-colors font-medium"
            >
              Contact
            </a>
          </nav>

          {/* CTA Button */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={() => {
                setIsOpen(false);
                onLoginClick();
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
