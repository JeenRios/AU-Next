'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'How does automated trading work with AU-Next?',
    answer: 'AU-Next connects to your MT5 trading account and executes trades automatically using our proprietary Expert Advisor (EA). Once you connect your account and configure your risk settings, the EA analyzes market conditions 24/7 and places trades based on proven strategies. You maintain full control and can pause or adjust settings at any time.'
  },
  {
    question: 'Is my capital and personal data safe?',
    answer: 'Absolutely. AU-Next uses bank-grade 256-bit SSL encryption for all data transmission. We never have direct access to your trading funds - we only send trading signals to your MT5 account. Your credentials are encrypted and stored securely. We\'re also GDPR compliant and never share your data with third parties.'
  },
  {
    question: 'Which brokers are supported?',
    answer: 'AU-Next works with any broker that supports MetaTrader 5 (MT5). This includes major brokers like IC Markets, Pepperstone, XM, FXTM, Exness, and hundreds of others. If your broker offers MT5, you can use AU-Next.'
  },
  {
    question: 'How do I connect my MT5 account?',
    answer: 'Connecting is simple: 1) Sign up for AU-Next, 2) Go to your dashboard and click "Connect MT5", 3) Enter your MT5 account number, server, and read-only password, 4) Our team verifies the connection within 24 hours, and you\'re ready to trade. We provide step-by-step guides for every broker.'
  },
  {
    question: 'What are the minimum requirements to start?',
    answer: 'You need: 1) A MetaTrader 5 account with any supported broker, 2) A minimum balance of $100 (though we recommend $500+ for optimal results), 3) A stable internet connection. That\'s it! No special hardware or software required - everything runs in the cloud.'
  },
  {
    question: 'Can I use AU-Next on multiple accounts?',
    answer: 'Yes! Our Pro plan supports up to 5 MT5 accounts, and our Enterprise plan offers unlimited connections. Each account can have different risk settings and strategies. This is perfect for traders who want to diversify across different brokers or account types.'
  },
  {
    question: 'What happens if there\'s a technical issue?',
    answer: 'Our platform has 99.9% uptime with redundant servers. If any issue occurs, our monitoring systems alert us immediately. The EA has built-in safety features that close positions if connection is lost. Our 24/7 support team is always available to help, and we provide real-time status updates.'
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! Our Starter plan is completely free and lets you connect one MT5 account with basic EA functionality. You can upgrade to Pro anytime for advanced features. Paid plans also include a 30-day money-back guarantee - if you\'re not satisfied, we\'ll refund you, no questions asked.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative z-10 max-w-4xl mx-auto px-6 py-20">
      <h2 className="text-4xl font-bold text-[#1a1a1d] text-center mb-4">
        Frequently Asked Questions
      </h2>
      <p className="text-gray-600 text-center mb-12 text-lg">
        Everything you need to know about AU-Next
      </p>

      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all hover:border-[#c9a227] hover:shadow-md"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a227] focus-visible:ring-inset"
              aria-expanded={openIndex === index}
            >
              <span className="font-semibold text-[#1a1a1d] pr-4">{item.question}</span>
              <svg
                className={`w-5 h-5 text-[#c9a227] flex-shrink-0 transition-transform duration-300 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Still have questions? */}
      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">Still have questions?</p>
        <a
          href="#contact"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] text-[#1a1a1d] font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Contact Support
        </a>
      </div>
    </section>
  );
}
