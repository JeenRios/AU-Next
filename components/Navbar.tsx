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
      <nav className="bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-white">
            AU<span className="text-purple-400">Next</span> <span className="text-sm text-purple-400">Admin</span>
          </div>
          <div className="flex items-center gap-6">
            <a 
              href="/admin" 
              className={currentPage === 'dashboard' ? 'text-purple-400 font-medium' : 'text-gray-300 hover:text-white transition'}
            >
              Dashboard
            </a>
            <a 
              href="/admin/analytics" 
              className={currentPage === 'analytics' ? 'text-purple-400 font-medium' : 'text-gray-300 hover:text-white transition'}
            >
              Analytics
            </a>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white/5 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-white">
          AU<span className="text-purple-400">Next</span>
        </div>
        <div className="flex items-center gap-6">
          <a 
            href="/dashboard" 
            className={currentPage === 'dashboard' ? 'text-purple-400 font-medium' : 'text-gray-300 hover:text-white transition'}
          >
            Dashboard
          </a>
          <a 
            href="/trades" 
            className={currentPage === 'trades' ? 'text-purple-400 font-medium' : 'text-gray-300 hover:text-white transition'}
          >
            My Trades
          </a>
          <a 
            href="/profile" 
            className={currentPage === 'profile' ? 'text-purple-400 font-medium' : 'text-gray-300 hover:text-white transition'}
          >
            Profile
          </a>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
