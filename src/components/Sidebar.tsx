import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Globe,
  Mic,
  Video,
  Calendar,
  BarChart2,
  Bell,
  Repeat,
  Sparkles,
  Activity,
  BookOpen,
  ShieldCheck,
  BookMarked,
  Settings as SettingsIcon,
  User as UserIcon,
  LogOut,
  X,
  Zap,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useAppState } from '../store/appState';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  debtCountHigh?: number;
  remediationPercent?: number;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  debtCountHigh = 0,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { logout, user } = useAppState();

  // Determine if an AI Assistant route is currently active
  const isAiAssistantActive = useMemo(() => {
    return [
      'echo_mode', 'echo', 'voice',
      'perception',
      'code_switch', 'radar',
      'shared_vocab', 'vocabulary',
      'learn', 'learn_chat',
      'audit_trail', 'audit', 'debt_dashboard',
    ].includes(activeView);
  }, [activeView]);

  // Collapsible state for AI Assistants section (closed by default unless an AI Assistant route is active)
  const [aiAssistantsOpen, setAiAssistantsOpen] = useState<boolean>(isAiAssistantActive);

  // Automatically expand AI Assistants accordion if an AI Assistant route is activated
  useEffect(() => {
    if (isAiAssistantActive) {
      setAiAssistantsOpen(true);
    }
  }, [isAiAssistantActive]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Messages', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'translation', label: 'Translate', icon: Globe },
    { id: 'echo_mode', label: 'Voice', icon: Mic },
    { id: 'video_call', label: 'Video', icon: Video },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  const aiAssistants = [
    { id: 'echo_mode', label: 'Echo Mode', icon: Repeat, color: 'from-blue-500 to-cyan-400' },
    { id: 'perception', label: 'Perception Preview', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
    { id: 'shared_vocab', label: 'Shared Vocabulary', icon: BookMarked, color: 'from-amber-400 to-orange-500' },
    { id: 'learn', label: 'Learn As You Chat', icon: BookOpen, color: 'from-pink-500 to-rose-500' },
    { id: 'audit_trail', label: 'Conversation Ledger', icon: undefined, color: 'from-indigo-500 to-violet-500', badge: debtCountHigh > 0 ? `${debtCountHigh}` : undefined },
  ];

  const navContent = (
    <aside className="w-64 bg-[#090d16] border-r border-slate-800/80 flex flex-col shrink-0 text-slate-300 select-none h-full min-h-[calc(100vh-65px)] font-sans">
      {/* Mobile close bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800/80">
        <span className="text-sm font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" />
          LinguaChat
        </span>
        <button
          type="button"
          onClick={onCloseMobile}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar Header Logo & Subtitle */}
      <div className="p-4 border-b border-slate-800/60 hidden md:block">
        <div
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
            {/* Waveform / Soundwave logo */}
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 10v4" />
              <path d="M6 6v12" />
              <path d="M10 3v18" />
              <path d="M14 8v8" />
              <path d="M18 5v14" />
              <path d="M22 10v4" />
            </svg>
          </div>
          <div>
            <span className="font-extrabold text-base text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent block">
              LinguaChat
            </span>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight">
              Multilingual Communication
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Navigation Body */}
      <div className="p-3 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
        {/* Navigation Section */}
        <div className="space-y-1">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeView === item.id ||
                (item.id === 'translation' && activeView === 'translate') ||
                (item.id === 'echo_mode' && activeView === 'voice') ||
                (item.id === 'video_call' && activeView === 'video');

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveView(item.id);
                    onCloseMobile?.();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-600/30 font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'chat' && (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-blue-500 text-white shadow-xs">
                      3
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapsible AI Assistants Section */}
        <div className="pt-2 border-t border-slate-800/60">
          {/* Accordion Header */}
          <button
            type="button"
            onClick={() => setAiAssistantsOpen(!aiAssistantsOpen)}
            className="w-full px-3 py-1.5 flex items-center justify-between text-slate-400 hover:text-slate-100 transition-colors rounded-lg group text-left cursor-pointer"
          >
            <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 group-hover:text-white">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>AI Assistants</span>
            </h3>
            {aiAssistantsOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform" />
            )}
          </button>

          {/* Accordion Body with Smooth Expand/Collapse Transition */}
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden space-y-0.5 ${
              aiAssistantsOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0 pointer-events-none mt-0'
            }`}
          >
            {aiAssistants.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeView === item.id ||
                (item.id === 'code_switch' && activeView === 'radar') ||
                (item.id === 'shared_vocab' && activeView === 'vocabulary') ||
                (item.id === 'learn' && activeView === 'learn_chat') ||
                (item.id === 'audit_trail' && (activeView === 'audit' || activeView === 'debt_dashboard'));

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveView(item.id);
                    onCloseMobile?.();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 text-left group ${
                    isActive
                      ? 'bg-slate-800/90 text-white border border-blue-500/30 shadow-xs font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-2 h-2 rounded-full bg-gradient-to-r ${item.color} ${
                        isActive ? 'scale-125 ring-2 ring-blue-400/40' : 'opacity-70 group-hover:opacity-100'
                      }`}
                    />
                    {Icon && (
                      <Icon
                        className={`w-3.5 h-3.5 ${
                          isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                    )}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Globe Widget Card */}
        <div className="pt-3">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0d1627] to-[#070b14] p-3.5 border border-slate-800/80 shadow-lg flex items-center gap-3 group hover:border-blue-500/40 transition-all">
            <div className="relative shrink-0 w-12 h-12 rounded-xl overflow-hidden border border-blue-500/30 shadow-inner">
              <img
                src="/earth_globe.jpg"
                alt="Earth Globe"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-200 leading-tight">
                Different languages.
              </p>
              <p className="text-[11px] font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight">
                Same dreams.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Profile & Settings & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-[#070a12]/80 space-y-1">
        <button
          type="button"
          onClick={() => {
            setActiveView('settings');
            onCloseMobile?.();
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeView === 'settings'
              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <SettingsIcon className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveView('profile');
            onCloseMobile?.();
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeView === 'profile'
              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <UserIcon className="w-4 h-4 text-slate-400" />
          <span>Profile</span>
        </button>

        <button
          type="button"
          onClick={() => {
            logout();
            setActiveView('auth');
            onCloseMobile?.();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-400" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden md:flex h-screen sticky top-0">{navContent}</div>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
            aria-label="Close menu"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 h-full">{navContent}</div>
        </div>
      )}
    </>
  );
};

