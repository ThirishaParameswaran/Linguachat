import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle, Sparkles } from 'lucide-react';
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

    const emailCheck = validators.email(email);
    const pwdCheck = validators.password(password, 6);

    if (!emailCheck.isValid) {
      setGeneralError(emailCheck.error || 'Invalid email');
      return;
    }
    if (!pwdCheck.isValid) {
      setGeneralError(pwdCheck.error || 'Invalid password');
      return;
    }

    const res = await login({ email, password });
    if (res.success) {
      onSuccess?.();
    } else {
      setGeneralError(res.error || 'Login failed');
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Quick demonstration mock authentication for social providers
    setEmail(`demo.${provider.toLowerCase()}@linguachat.ai`);
    setPassword('social_demo_pass');
    setTimeout(() => {
      login({ email: `alex.${provider.toLowerCase()}@linguachat.ai`, password: 'password123' }).then((res) => {
        if (res.success) onSuccess?.();
      });
    }, 300);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(generalError || authError) && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{generalError || authError}</span>
        </div>
      )}

      {/* Email Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
          <span>📧</span>
          <span>Email Address</span>
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex.chen@linguachat.ai"
            required
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
        className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
            className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Google</span>
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('GitHub')}
            className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1.5"
          >
            <span>GitHub</span>
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('Microsoft')}
            className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1.5"
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
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            <span>New to LinguaChat? Create Account →</span>
          </button>
        </div>
      )}
    </form>
  );
};
