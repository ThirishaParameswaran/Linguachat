import React, { useState } from 'react';
import { User } from '../types';
import {
  Bell,
  Globe,
  Search,
  ChevronDown,
  Menu,
  ShieldCheck,
  User as UserIcon,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  totalDebtScore: number;
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenAuth: () => void;
  onLogout?: () => void;
  onToggleMobileNav?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  totalDebtScore,
  setActiveView,
  onOpenAuth,
  onLogout,
  onToggleMobileNav,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const languages = [
    { code: 'EN', name: 'English (US)', flag: '🇺🇸' },
    { code: 'TA', name: 'Tamil (தமிழ்)', flag: '🇮🇳' },
    { code: 'HI', name: 'Hindi (हिंदी)', flag: '🇮🇳' },
    { code: 'JA', name: 'Japanese (日本語)', flag: '🇯🇵' },
    { code: 'ES', name: 'Spanish (Español)', flag: '🇪🇸' },
    { code: 'DE', name: 'German (Deutsch)', flag: '🇩🇪' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setActiveView('chat');
  };

  return (
    <header className="sticky top-0 z-30 bg-[#090d16]/90 backdrop-blur-xl border-b border-slate-800/80 text-white px-4 md:px-8 py-3 font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile menu toggle + Search bar */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            type="button"
            onClick={onToggleMobileNav}
            className="md:hidden p-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800/60"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo on Mobile */}
          <div
            onClick={() => setActiveView('dashboard')}
            className="md:hidden flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base text-white tracking-tight">LinguaChat</span>
          </div>

          {/* Global Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages, languages, users..."
              className="w-full pl-10 pr-16 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700/60 text-[10px] text-slate-300 font-mono">
              <span>Ctrl + K</span>
            </div>
          </form>
        </div>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setActiveView('notifications');
                setShowNotifications(false);
                setShowLangMenu(false);
                setShowProfileMenu(false);
              }}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-300" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-[#090d16]">
                5
              </span>
            </button>
          </div>

          {/* User Profile Dropdown / Login Button */}
          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                  setShowLangMenu(false);
                }}
                className="flex items-center gap-2.5 p-1 sm:pr-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800/80 transition-all text-left"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-blue-500/30"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#090d16]" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <span>{currentUser.username}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    User
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0d1322] rounded-2xl shadow-2xl border border-slate-800 p-2 z-50 text-xs font-semibold space-y-1 animate-fade-in">
                  <div className="px-3 py-2 border-b border-slate-800/80">
                    <p className="text-white font-bold">{currentUser.username}</p>
                    <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                    {currentUser.role && (
                      <p className="text-[10px] text-indigo-400 font-semibold mt-0.5 capitalize">
                        Role: {currentUser.role.replace('_', ' ')}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors text-left"
                  >
                    <UserIcon className="w-4 h-4 text-blue-400" />
                    <span>View Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Account Settings</span>
                  </button>

                  <div className="pt-1 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout?.();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors text-left font-bold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

