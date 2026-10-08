import React, { useState } from 'react';
import { Menu, X, Globe, MessageSquare, LayoutDashboard, Settings, Video, ShieldCheck, Sparkles } from 'lucide-react';
import { useMobile } from '../hooks/useMobile';
import { useAppState } from '../store/appState';

interface MobileWrapperProps {
  children: React.ReactNode;
  activeView: string;
  onSelectView: (view: string) => void;
  title?: string;
}

export const MobileWrapper: React.FC<MobileWrapperProps> = ({
  children,
  activeView,
  onSelectView,
  title = 'LinguaChat',
}) => {
  const { isMobile } = useMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const user = useAppState((state) => state.user);
  const theme = useAppState((state) => state.theme);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Real-time Chat', icon: MessageSquare },
    { id: 'translation', label: 'Translate', icon: Globe },
    { id: 'echo', label: 'Echo Mode', icon: Sparkles },
    { id: 'nlp_testing', label: 'NCP Testing', icon: ShieldCheck },
    { id: 'video_call', label: 'Video Call', icon: Video },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-dvh bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Mobile Top App Bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open Navigation Menu"
            onClick={() => setDrawerOpen(true)}
            className="p-2 -ml-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
              LC
            </div>
            <span className="font-bold text-base bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {title}
            </span>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
              alt={user.username}
              className="w-8 h-8 rounded-full border-2 border-blue-500/40 object-cover"
            />
          </div>
        )}
      </header>

      {/* Drawer Overlay for Mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative flex flex-col w-[280px] max-w-[80vw] bg-white dark:bg-slate-900 h-full shadow-2xl z-10 border-r border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  LC
                </div>
                <span className="font-bold text-slate-800 dark:text-white">Navigation</span>
              </div>
              <button
                type="button"
                aria-label="Close Navigation Menu"
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectView(item.id);
                      setDrawerOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom info */}
            {user && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate text-slate-900 dark:text-white">{user.username}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content View */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {[
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'chat', label: 'Chat', icon: MessageSquare },
          { id: 'translation', label: 'Translate', icon: Globe },
          { id: 'nlp_testing', label: 'NCP', icon: ShieldCheck },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={`flex flex-col items-center justify-center py-2 text-[10px] font-semibold transition-colors ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
