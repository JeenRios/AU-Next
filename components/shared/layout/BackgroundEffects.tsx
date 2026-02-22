'use client';

export function BackgroundEffects() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Top Left Highlights - Sharp White */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/20 blur-[100px] animate-blob mix-blend-overlay"></div>
      
      {/* Bottom Right Depths - Dark Contrast */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#8a6d1b]/40 blur-[80px] animate-blob animation-delay-2000 mix-blend-multiply"></div>

      {/* Floating Blobs (Distinct shapes) */}
      <div className="absolute top-[20%] right-[15%] w-[350px] h-[350px] rounded-full bg-[#f0d78c]/60 blur-[60px] animate-blob mix-blend-overlay" style={{ animationDelay: '0s' }}></div>
      <div className="absolute bottom-[25%] left-[15%] w-[450px] h-[450px] rounded-full bg-[#c9a227]/40 blur-[90px] animate-blob mix-blend-overlay" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[45%] left-[45%] w-[400px] h-[400px] rounded-full bg-[#ffeebb]/50 blur-[70px] animate-blob mix-blend-overlay" style={{ animationDelay: '4s' }}></div>
    </div>
  );
}
