'use client';

import { useRouter } from 'next/navigation';

interface NavbarProps {
  userRole?: 'admin' | 'user';
  currentPage?: string;
}

export default function Navbar({ userRole, currentPage }: NavbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (userRole === 'admin') {
    return (
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-[#1a1a1d]">
            AU<span className="text-[#c9a227]">Next</span> <span className="text-sm text-[#c9a227] font-normal">Admin</span>
          </div>
          <div className="flex items-center gap-6">
            <a 
              href="/admin" 
              className={currentPage === 'dashboard' ? 'text-[#c9a227] font-semibold' : 'text-gray-600 hover:text-[#1a1a1d] transition-colors'}
            >
              Dashboard
            </a>
            <a 
              href="/admin/analytics" 
              className={currentPage === 'analytics' ? 'text-[#c9a227] font-semibold' : 'text-gray-600 hover:text-[#1a1a1d] transition-colors'}
            >
              Analytics
            </a>
            <button
              onClick={handleLogout}
              className="px-5 py-2 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-[#1a1a1d]">
          AU<span className="text-[#c9a227]">Next</span>
        </div>
        <div className="flex items-center gap-6">
          <a 
            href="/dashboard" 
            className={currentPage === 'dashboard' ? 'text-[#c9a227] font-semibold' : 'text-gray-600 hover:text-[#1a1a1d] transition-colors'}
          >
            Dashboard
          </a>
          <a 
            href="/trades" 
            className={currentPage === 'trades' ? 'text-[#c9a227] font-semibold' : 'text-gray-600 hover:text-[#1a1a1d] transition-colors'}
          >
            My Trades
          </a>
          <a 
            href="/profile" 
            className={currentPage === 'profile' ? 'text-[#c9a227] font-semibold' : 'text-gray-600 hover:text-[#1a1a1d] transition-colors'}
          >
            Profile
          </a>
          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
