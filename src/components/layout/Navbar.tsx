import { Activity, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Link } from 'react-router-dom';

export function Navbar() {
  const { user, signIn, logOut, isGuestMode } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Activity className="text-accent" size={24} />
          <span className="font-bold text-xl tracking-tighter hidden sm:inline-block">
            AI <span className="text-accent">MOTION</span> COACH
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {isGuestMode && (
                <div className="flex items-center gap-2 px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded-md">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">Local Mode</span>
                </div>
              )}
              <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors">
                <UserIcon size={18} />
                <span className="text-sm font-medium hidden md:inline">{user.displayName}</span>
              </Link>
              <button
                onClick={logOut}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-sm font-bold transition-all"
              >
                <LogOut size={18} />
                로그아웃
              </button>
            </>
          ) : (
            <button
              onClick={signIn}
              className="flex items-center gap-2 px-6 py-2 bg-accent text-bg rounded-lg hover:bg-sky-400 font-bold transition-all shadow-lg"
            >
              <LogIn size={18} />
              시작하기
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
