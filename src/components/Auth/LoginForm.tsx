import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAppState } from '../../store/appState';
import { validators } from '../../utils/validators';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const { addNotification } = useAppState();
  const { login, isLoading, error: authError } = useAuth();
  const [email, setEmail] = useState('alex.chen@linguachat.ai');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailCheck = validators.email(cleanEmail);
    const pwdCheck = validators.password(password, 6);

    if (!emailCheck.isValid) {
      setGeneralError(emailCheck.error || 'Please enter a valid email address');
      return;
    }
    if (!pwdCheck.isValid) {
      setGeneralError(pwdCheck.error || 'Password must be at least 6 characters');
      return;
    }

    const res = await login({ email: cleanEmail, password });
    if (res.success) {
      onSuccess?.();
    } else {
      setGeneralError(res.error || 'Login failed');
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setGeneralError(null);
    const demoEmail = `demo.${provider.toLowerCase()}@linguachat.ai`;
    setEmail(demoEmail);
    setPassword('password123');
    const res = await login({ email: demoEmail, password: 'password123' });
    if (res.success) {
      onSuccess?.();
    } else {
      setGeneralError(res.error || `${provider} sign-in failed`);
    }
  };

  const handleQuickDemo = (demoEmail: string) => {
    setGeneralError(null);
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {(generalError || authError) && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{generalError || authError}</span>
        </div>
      )}

      {/* Quick Mobile Demo Accounts Picker */}
      <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Quick 1-Tap Demo Logins:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleQuickDemo('alex.chen@linguachat.ai')}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
              email === 'alex.chen@linguachat.ai'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300'
            }`}
          >
            Alex (Admin)
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('thirisha.p@linguachat.ai')}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
              email === 'thirisha.p@linguachat.ai'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300'
            }`}
          >
            Thirisha (Admin)
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('priya.sharma@globaltech.com')}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
              email === 'priya.sharma@globaltech.com'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300'
            }`}
          >
            Priya (Hindi)
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('karthik.s@innolabs.io')}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
              email === 'karthik.s@innolabs.io'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300'
            }`}
          >
            Karthik (Tamil)
          </button>
        </div>
      </div>

      {/* Email Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
          <span>📧</span>
          <span>Email Address</span>
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex.chen@linguachat.ai"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="email"
            autoComplete="email"
            required
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[44px]"
          />
        </div>
      </div>

      {/* Password Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
          <span>🔒</span>
          <span>Password</span>
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="current-password"
            required
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[44px]"
          />
        </div>
      </div>

      {/* Remember me & Forgot Password */}
      <div className="flex items-center justify-between text-xs pt-1">
        <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
          />
          <span>Remember me</span>
        </label>

        <a
          href="#forgot"
          onClick={(e) => {
            e.preventDefault();
            addNotification({
              title: '📧 Password Reset',
              message: 'Password reset instructions sent to your email.',
              type: 'info',
            });
          }}
          className="text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
        >
          Forgot Password?
        </a>
      </div>

      {/* Sign In Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <span>🚀</span>
            <span>Sign In</span>
          </>
        )}
      </button>

      {/* Social Logins */}
      <div className="pt-2">
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
          <span className="flex-shrink mx-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
            or continue with
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2">
          <button
            type="button"
            onClick={() => handleSocialLogin('Google')}
            className="py-2.5 px-3 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Google</span>
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('GitHub')}
            className="py-2.5 px-3 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1.5"
          >
            <span>GitHub</span>
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('Microsoft')}
            className="py-2.5 px-3 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Microsoft</span>
          </button>
        </div>
      </div>

      {/* Toggle to Create Account */}
      {onSwitchToRegister && (
        <div className="text-center pt-3 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 min-h-[36px]"
          >
            <span>New to LinguaChat? Create Account →</span>
          </button>
        </div>
      )}
    </form>
  );
};
