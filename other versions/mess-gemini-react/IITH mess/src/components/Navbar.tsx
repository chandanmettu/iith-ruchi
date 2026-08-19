import React from 'react';
import { Utensils, QrCode, ShieldCheck, Calendar, LogIn, LogOut, Sun, Moon, User } from 'lucide-react';
import { StudentProfile, UserRole } from '../types/mess';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: StudentProfile | null;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  currentRole,
  setCurrentRole,
  onOpenAuth,
  onLogout,
  darkMode,
  setDarkMode
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => setActiveTab('booking')}
            className="flex items-center space-x-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-lg text-white font-bold shadow">
              🍱
            </div>
            <div>
              <span className="font-extrabold text-base text-white tracking-tight">IITH Mess Portal</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden sm:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('booking')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'booking'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              Register Mess
            </button>

            <button
              onClick={() => setActiveTab('pass')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'pass'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              Digital Pass
            </button>

            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'scanner'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              Caterer Scanner
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'menu'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              Menu & Timings
            </button>
          </nav>

          {/* User Auth */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenAuth}
                  className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl transition"
                >
                  <img src={currentUser.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
                  <span className="text-xs font-bold text-white truncate max-w-[100px]">{currentUser.name}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-xl transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="sm:hidden flex items-center justify-around border-t border-slate-800 bg-slate-950 py-2">
        <button
          onClick={() => setActiveTab('booking')}
          className={`text-xs font-bold ${activeTab === 'booking' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          Register
        </button>
        <button
          onClick={() => setActiveTab('pass')}
          className={`text-xs font-bold ${activeTab === 'pass' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          My Pass
        </button>
        <button
          onClick={() => setActiveTab('scanner')}
          className={`text-xs font-bold ${activeTab === 'scanner' ? 'text-emerald-400' : 'text-slate-400'}`}
        >
          Scanner
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`text-xs font-bold ${activeTab === 'menu' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          Menu
        </button>
      </div>
    </header>
  );
};
