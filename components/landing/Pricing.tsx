'use client';

import { useState } from 'react';

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  cta: string;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Starter',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started with automated trading',
    features: [
      '1 MT5 Account Connection',
      'Basic EA Functionality',
      'Community Access',
      'Email Support',
      'Basic Analytics Dashboard',
      '10 Trades/Day Limit'
    ],
    cta: 'Start Free'
  },
  {
    id: 'pro',
    name: 'Professional',
    price: '$49',
    period: '/month',
    description: 'For serious traders who want more control',
    features: [
      '5 MT5 Account Connections',
      'Advanced EA Strategies',
      'Priority Community Access',
      '24/7 Priority Support',
      'Full Analytics Suite',
      'Unlimited Trades',
      'Risk Management Tools',
      'Custom Alerts'
    ],
    highlighted: true,
    badge: 'Most Popular',
    cta: 'Start Pro Trial'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$199',
    period: '/month',
    description: 'For professional traders and institutions',
    features: [
      'Unlimited MT5 Connections',
      'Custom EA Development',
      'Dedicated Account Manager',
      'Phone & Video Support',
      'White-label Options',
      'API Access',
      'Multi-user Management',
      'Advanced Reporting',
      'SLA Guarantee'
    ],
    cta: 'Contact Sales'
  }
];

interface PricingProps {
  onGetStarted: () => void;
}

export default function Pricing({ onGetStarted }: PricingProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const getPrice = (plan: Plan) => {
    if (plan.price === '$0') return plan.price;
    const monthlyPrice = parseInt(plan.price.replace('$', ''));
    if (billingPeriod === 'yearly') {
      const yearlyPrice = Math.floor(monthlyPrice * 10); // 2 months free
      return `$${yearlyPrice}`;
    }
    return plan.price;
  };

  const getPeriod = (plan: Plan) => {
    if (plan.price === '$0') return plan.period;
    return billingPeriod === 'yearly' ? '/year' : '/month';
  };

  return (
    <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
      <h2 className="text-4xl font-bold text-[#1a1a1d] text-center mb-4">
        Simple, Transparent Pricing
      </h2>
      <p className="text-gray-600 text-center mb-8 text-lg">
        Choose the plan that fits your trading style
      </p>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-[#1a1a1d]' : 'text-gray-500'}`}>
          Monthly
        </span>
        <button
          onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
          className={`relative w-14 h-7 rounded-full transition-colors ${
            billingPeriod === 'yearly' ? 'bg-[#c9a227]' : 'bg-gray-300'
          }`}
          aria-label={`Switch to ${billingPeriod === 'monthly' ? 'yearly' : 'monthly'} billing`}
        >
          <span
            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
              billingPeriod === 'yearly' ? 'translate-x-8' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-[#1a1a1d]' : 'text-gray-500'}`}>
          Yearly
          <span className="ml-1 text-xs text-green-600 font-semibold">Save 17%</span>
        </span>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl p-8 transition-all duration-300 ${
              plan.highlighted
                ? 'bg-gradient-to-br from-[#c9a227] to-[#f0d78c] shadow-2xl scale-105 z-10'
                : 'bg-white border border-gray-200 hover:border-[#c9a227] hover:shadow-xl'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#1a1a1d] text-white text-sm font-semibold rounded-full">
                {plan.badge}
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-[#1a1a1d]' : 'text-[#1a1a1d]'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-4 ${plan.highlighted ? 'text-[#1a1a1d]/70' : 'text-gray-600'}`}>
                {plan.description}
              </p>
              <div className="flex items-baseline justify-center">
                <span className={`text-5xl font-bold ${plan.highlighted ? 'text-[#1a1a1d]' : 'text-[#1a1a1d]'}`}>
                  {getPrice(plan)}
                </span>
                <span className={`ml-1 ${plan.highlighted ? 'text-[#1a1a1d]/70' : 'text-gray-500'}`}>
                  {getPeriod(plan)}
                </span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      plan.highlighted ? 'text-[#1a1a1d]' : 'text-green-500'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className={`text-sm ${plan.highlighted ? 'text-[#1a1a1d]' : 'text-gray-700'}`}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={onGetStarted}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                plan.highlighted
                  ? 'bg-[#1a1a1d] text-white hover:bg-[#2a2a2d] hover:shadow-lg'
                  : 'bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] hover:shadow-lg'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Money-back Guarantee */}
      <p className="text-center text-gray-500 mt-8 text-sm">
        🛡️ 30-day money-back guarantee on all paid plans. No questions asked.
      </p>
    </section>
  );
}
