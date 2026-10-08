import React, { useState, useEffect } from 'react';
import { Download, X, Globe, Sparkles } from 'lucide-react';
import { ButtonValidator } from './ButtonValidator';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if previously dismissed
      const dismissed = localStorage.getItem('linguachat_pwa_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('linguachat_pwa_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white p-4 rounded-3xl shadow-2xl border border-indigo-500/30 animate-slideUp">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
            LC
          </div>
          <div>
            <h4 className="text-sm font-bold">Install LinguaChat App</h4>
            <p className="text-[11px] text-slate-300">Fast, offline-ready multilingual chat</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 text-slate-400 hover:text-white rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleDismiss}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
        >
          Not now
        </button>
        <ButtonValidator
          variant="primary"
          size="sm"
          onClick={handleInstall}
          icon={<Download className="w-3.5 h-3.5" />}
        >
          Install App
        </ButtonValidator>
      </div>
    </div>
  );
};
