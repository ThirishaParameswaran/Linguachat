import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import {
  Globe,
  MessageSquare,
  Mic,
  Video,
  Bot,
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface AuthFlowProps {
  onSuccess?: () => void;
  initialTab?: 'login' | 'register';
}

export const AuthFlow: React.FC<AuthFlowProps> = ({ onSuccess, initialTab = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialTab);

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4">
      {/* Outer Hero Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-all">
        {/* Top Header Banner */}
        <div className="p-6 md:p-10 text-center bg-gradient-to-b from-blue-50/70 via-white to-white dark:from-slate-800/60 dark:via-slate-900 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="inline-flex items-center justify-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide uppercase mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AI-Powered Multilingual Platform</span>
          </div>

          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Globe className="w-7 h-7" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              LINGUACHAT
            </h1>
          </div>

          <p className="text-base md:text-lg font-medium text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            Real-Time Multilingual Communication Platform
          </p>
        </div>

        {/* Feature Highlights Grid (as per Wireframe) */}
        <div className="px-6 md:px-10 pt-6 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>Key Platform Features</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-slate-800/50 border border-blue-100 dark:border-slate-700/60 hover:border-blue-300 transition-all group">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">💬 Chat</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Real-time Messages</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-50/60 dark:bg-slate-800/50 border border-teal-100 dark:border-slate-700/60 hover:border-teal-300 transition-all group">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Mic className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">🎙️ Voice</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Speech Translation</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-slate-800/50 border border-purple-100 dark:border-slate-700/60 hover:border-purple-300 transition-all group">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Video className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">📹 Video</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Face to Face Calls</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-slate-800/50 border border-indigo-100 dark:border-slate-700/60 hover:border-indigo-300 transition-all group">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">🤖 AI</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Smart Translation</p>
            </div>
          </div>
        </div>

        {/* Auth Form Card */}
        <div className="p-6 md:p-10 max-w-lg mx-auto">
          <div className="bg-slate-50/80 dark:bg-slate-800/40 p-6 md:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <div className="mb-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {mode === 'login' ? '🔐 Welcome Back' : '🚀 Create Your Account'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {mode === 'login'
                    ? 'Enter your credentials to access your multilingual workspace'
                    : 'Join thousands communicating across languages effortlessly'}
                </p>
              </div>
            </div>

            {mode === 'login' ? (
              <LoginForm
                onSuccess={onSuccess}
                onSwitchToRegister={() => setMode('register')}
              />
            ) : (
              <RegisterForm
                onSuccess={onSuccess}
                onSwitchToLogin={() => setMode('login')}
              />
            )}
          </div>
        </div>

        {/* Feature Badges Strip (as per Wireframe) */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="text-base">🌍</span> 14+ Languages Supported
            </span>
            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Enterprise Grade Security
            </span>
            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" /> Real-time Translation
            </span>
            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-purple-500" /> AI-Powered
            </span>
          </div>
        </div>
      </div>

      {/* Footer (as per Wireframe) */}
      <footer className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500 flex flex-wrap items-center justify-center gap-4">
        <span>© 2026 LinguaChat. All rights reserved.</span>
        <a href="#privacy" className="hover:text-blue-500 transition-colors">Privacy Policy</a>
        <a href="#terms" className="hover:text-blue-500 transition-colors">Terms of Service</a>
      </footer>
    </div>
  );
};
