'use client';

import { useState, useEffect, useCallback } from 'react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
  profit?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Michael Chen',
    role: 'Professional Trader',
    avatar: 'MC',
    content: 'AU-Next has transformed my trading workflow. The automation is seamless, and I\'ve seen a 40% increase in my trading efficiency. Highly recommended!',
    rating: 5,
    profit: '+$12,450'
  },
  {
    id: 2,
    name: 'Sarah Williams',
    role: 'Forex Enthusiast',
    avatar: 'SW',
    content: 'Finally, a platform that just works. The MT5 integration is flawless, and the dashboard gives me all the insights I need at a glance.',
    rating: 5,
    profit: '+$8,200'
  },
  {
    id: 3,
    name: 'David Kumar',
    role: 'Part-time Trader',
    avatar: 'DK',
    content: 'As someone who trades part-time, AU-Next\'s automation lets me earn while I focus on my day job. The EA runs 24/7 without any issues.',
    rating: 5,
    profit: '+$5,800'
  },
  {
    id: 4,
    name: 'Emma Thompson',
    role: 'Investment Manager',
    avatar: 'ET',
    content: 'The security features and reliability are enterprise-grade. I manage multiple client accounts with complete confidence.',
    rating: 5,
    profit: '+$45,000'
  },
  {
    id: 5,
    name: 'Alex Rodriguez',
    role: 'Day Trader',
    avatar: 'AR',
    content: 'Lightning-fast execution and real-time analytics. AU-Next is the edge I needed in today\'s competitive markets.',
    rating: 5,
    profit: '+$22,300'
  }
];

const trustBadges = [
  { label: 'MT5 Compatible', icon: '🔗' },
  { label: '256-bit Encryption', icon: '🔒' },
  { label: '24/7 Support', icon: '💬' },
  { label: 'No Hidden Fees', icon: '✓' }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  return (
    <section id="testimonials" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
      <h2 className="text-4xl font-bold text-[#1a1a1d] text-center mb-4">
        Trusted by Traders Worldwide
      </h2>
      <p className="text-gray-600 text-center mb-12 text-lg">
        See what our community has to say
      </p>

      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {trustBadges.map((badge, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm"
          >
            <span className="text-lg">{badge.icon}</span>
            <span className="text-sm font-medium text-gray-700">{badge.label}</span>
          </div>
        ))}
      </div>

      {/* Testimonial Carousel */}
      <div
        className="relative max-w-4xl mx-auto"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="w-full flex-shrink-0 px-4"
              >
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 md:p-10">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-full flex items-center justify-center text-[#1a1a1d] font-bold text-lg flex-shrink-0">
                      {testimonial.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-[#1a1a1d]">{testimonial.name}</h4>
                          <p className="text-sm text-gray-600">{testimonial.role}</p>
                        </div>
                        {testimonial.profit && (
                          <div className="text-right">
                            <div className="text-green-600 font-bold">{testimonial.profit}</div>
                            <div className="text-xs text-gray-500">Total Profit</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < testimonial.rating ? 'text-[#c9a227]' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <blockquote className="text-gray-700 text-lg leading-relaxed italic">
                    &ldquo;{testimonial.content}&rdquo;
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-[#c9a227] hover:shadow-xl transition-all"
          aria-label="Previous testimonial"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-[#c9a227] hover:shadow-xl transition-all"
          aria-label="Next testimonial"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-[#c9a227] w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
