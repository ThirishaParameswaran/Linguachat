import React, { useEffect } from 'react';
import { useAppState } from '../store/appState';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastNotifications: React.FC = () => {
  const { notifications, markNotificationAsRead } = useAppState();

  const activeNotifs = notifications.filter((n) => !n.read).slice(0, 4);

  useEffect(() => {
    if (activeNotifs.length > 0) {
      const timer = setTimeout(() => {
        markNotificationAsRead(activeNotifs[0].id);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [activeNotifs, markNotificationAsRead]);

  if (activeNotifs.length === 0) return null;

  const iconMap = {
    success: <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />,
    info: <Info className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />,
  };

  const bgMap = {
    success: 'bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-800 shadow-xl shadow-emerald-500/10',
    error: 'bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-800 shadow-xl shadow-rose-500/10',
    warning: 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-800 shadow-xl shadow-amber-500/10',
    info: 'bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-800 shadow-xl shadow-blue-500/10',
  };

  return (
    <div className="fixed bottom-4 right-4 sm:right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
      {activeNotifs.map((n) => (
        <div
          key={n.id}
          className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl flex items-start gap-3 transition-all animate-slideUp ${
            bgMap[n.type]
          }`}
        >
          {iconMap[n.type]}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              {n.title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
              {n.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => markNotificationAsRead(n.id)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
