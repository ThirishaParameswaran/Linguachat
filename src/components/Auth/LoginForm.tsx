import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, Sparkles, KeyRound, ArrowLeft, CheckCircle2, Info, ExternalLink } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAppState } from '../../store/appState';
import { validators } from '../../utils/validators';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const { addNotification } = useAppState();
  const { login, forgotPassword, resetPassword, isLoading, error: authError } = useAuth();

  const [email, setEmail] = useState('alex.chen@linguachat.ai');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [activeDemoLoading, setActiveDemoLoading] = useState<string | null>(null);

  // Forgot password sub-flow state
  const [authView, setAuthView] = useState<'login' | 'forgot' | 'reset'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStatusMsg, setResetStatusMsg] = useState<{ type: 'info' | 'success'; text: string } | null>(null);

  // OAuth status modal state
  const [oauthNotice, setOauthNotice] = useState<{ provider: string; details: string } | null>(null);

  // Check OAuth configuration
  const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
  const githubClientId = (import.meta as any).env?.VITE_GITHUB_CLIENT_ID || '';
  const microsoftClientId =
    (import.meta as any).env?.VITE_MICROSOFT_CLIENT_ID || (import.meta as any).env?.VITE_AZURE_CLIENT_ID || '';

  // 1. Submit Email/Password Login
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
      addNotification({
        title: 'Welcome Back',
        message: `Signed in as ${res.user?.username || cleanEmail}`,
        type: 'success',
      });
      onSuccess?.();
    } else {
      setGeneralError(res.error || 'Invalid email or password');
    }
  };

  // 2. Demo Login Buttons (Alex, Thirisha, Priya, Karthik)
  const handleQuickDemo = async (demoEmail: string, demoLabel: string) => {
    setGeneralError(null);
    setEmail(demoEmail);
    setPassword('password123');
    setActiveDemoLoading(demoEmail);

    try {
      const res = await login({ email: demoEmail, password: 'password123' });
      if (res.success) {
        addNotification({
          title: 'Demo Session Active',
          message: `Authenticated as ${demoLabel} (${demoEmail})`,
          type: 'success',
        });
        onSuccess?.();
      } else {
        setGeneralError(res.error || `Failed to authenticate ${demoLabel}`);
      }
    } finally {
      setActiveDemoLoading(null);
    }
  };

  // 3. Social OAuth Click Handler
  const handleSocialClick = (provider: 'Google' | 'GitHub' | 'Microsoft') => {
    setGeneralError(null);
    const clientId =
      provider === 'Google'
        ? googleClientId
        : provider === 'GitHub'
        ? githubClientId
        : microsoftClientId;

    if (!clientId) {
      setOauthNotice({
        provider,
        details: `${provider} OAuth is currently unavailable because OAuth client credentials are not configured in this environment. To enable real ${provider} authentication, define VITE_${provider.toUpperCase()}_CLIENT_ID in your environment variables. Please use Email/Password sign-in or a 1-Tap Demo account.`,
      });
      return;
    }

    // If client ID is configured, initiate actual OAuth redirect
    if (provider === 'Google') {
      const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=email%20profile`;
    } else if (provider === 'GitHub') {
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email`;
    } else if (provider === 'Microsoft') {
      const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
      window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=openid%20profile%20email`;
    }
  };

  // 4. Request Password Reset Token
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setResetStatusMsg(null);

    const cleanEmail = resetEmail.trim().toLowerCase();
    const emailCheck = validators.email(cleanEmail);
    if (!emailCheck.isValid) {
      setGeneralError(emailCheck.error || 'Please enter a valid email address');
      return;
    }

    const res = await forgotPassword(cleanEmail);
    if (res.success) {
      if (res.resetToken) {
        setResetToken(res.resetToken);
        setResetStatusMsg({
          type: 'info',
          text: res.message || 'Single-use reset token generated.',
        });
        // Transition to reset form
        setAuthView('reset');
      } else {
        setResetStatusMsg({
          type: 'success',
          text: res.message || 'Password reset instructions dispatched.',
        });
      }
    } else {
      setGeneralError(res.error || 'Password reset request failed');
    }
  };

  // 5. Submit Password Reset
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!resetToken.trim()) {
      setGeneralError('Please enter your password reset token');
      return;
    }
    if (newPassword.length < 6) {
      setGeneralError('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setGeneralError('Passwords do not match');
      return;
    }

    const res = await resetPassword(resetToken.trim(), newPassword);
    if (res.success) {
      setEmail(resetEmail);
      setPassword(newPassword);
      setResetStatusMsg({
        type: 'success',
        text: 'Password reset successful! You can now sign in with your new password.',
      });
      setAuthView('login');
      addNotification({
        title: 'Password Updated',
        message: 'Your password has been reset successfully. Please sign in.',
        type: 'success',
      });
    } else {
      setGeneralError(res.error || 'Password reset failed');
    }
  };

  // -------------------------------------------------------------
  // VIEW: Forgot Password (Step 1)
  // -------------------------------------------------------------
  if (authView === 'forgot') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setAuthView('login');
              setGeneralError(null);
            }}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-blue-500" />
              <span>Reset Your Password</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Enter your email to receive a secure password reset token
            </p>
          </div>
        </div>

        {generalError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleRequestReset} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Account Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="name@example.com"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="email"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Generate Password Reset Token</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setAuthView('login')}
            className="w-full text-center text-xs text-slate-500 dark:text-slate-400 hover:underline py-1"
          >
            Cancel and Return to Sign In
          </button>
        </form>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: Reset Password (Step 2)
  // -------------------------------------------------------------
  if (authView === 'reset') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAuthView('forgot')}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-emerald-500" />
              <span>Set New Password</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Verify your token and choose a new secure password
            </p>
          </div>
        </div>

        {resetStatusMsg && (
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
            <div className="space-y-1">
              <p>{resetStatusMsg.text}</p>
              {resetToken && (
                <p className="font-mono text-[11px] bg-blue-100 dark:bg-blue-900/60 p-1.5 rounded-lg break-all select-all text-blue-900 dark:text-blue-200">
                  Token: {resetToken}
                </p>
              )}
            </div>
          </div>
        )}

        {generalError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleConfirmReset} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reset Token
            </label>
            <input
              type="text"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              placeholder="Paste 64-character token"
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Password (min 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Update Password and Sign In</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setAuthView('login')}
            className="w-full text-center text-xs text-slate-500 dark:text-slate-400 hover:underline py-1"
          >
            Cancel and Return to Sign In
          </button>
        </form>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: Main Sign In Form
  // -------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* OAuth Notification Modal */}
      {oauthNotice && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-2">
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <span>⚠️</span>
              <span>{oauthNotice.provider} OAuth Notice</span>
            </span>
            <button
              type="button"
              onClick={() => setOauthNotice(null)}
              className="text-amber-600 dark:text-amber-400 hover:underline font-normal text-[11px]"
            >
              Dismiss
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
            {oauthNotice.details}
          </p>
        </div>
      )}

      {/* General or Auth Error Alert */}
      {(generalError || authError) && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{generalError || authError}</span>
        </div>
      )}

      {/* Status banner (e.g. from password reset) */}
      {resetStatusMsg && resetStatusMsg.type === 'success' && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{resetStatusMsg.text}</span>
        </div>
      )}

      {/* 2. DEMO LOGIN BUTTONS (Alex, Thirisha, Priya, Karthik) */}
      <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
        <div className="flex items-center justify-between text-[11px] font-bold text-blue-700 dark:text-blue-300 mb-2">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>1-Tap Demo Logins (Instant Authentication):</span>
          </span>
          <span className="text-[10px] text-blue-500/80 font-normal">Authenticates & Opens Dashboard</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {[
            { email: 'alex.chen@linguachat.ai', label: 'Alex Chen', role: 'Admin (EN)' },
            { email: 'thirisha.p@linguachat.ai', label: 'Thirisha P', role: 'Admin (Global)' },
            { email: 'priya.sharma@globaltech.com', label: 'Priya Sharma', role: 'User (HI)' },
            { email: 'karthik.s@innolabs.io', label: 'Karthik S', role: 'Reviewer (TA)' },
          ].map((demo) => {
            const isThisLoading = activeDemoLoading === demo.email;
            return (
              <button
                key={demo.email}
                type="button"
                disabled={Boolean(activeDemoLoading)}
                onClick={() => handleQuickDemo(demo.email, demo.label)}
                className="p-2 rounded-xl text-left border transition-all disabled:opacity-50 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-xs active:scale-98 flex flex-col justify-between min-h-[52px]"
              >
                <div className="font-bold text-xs truncate flex items-center justify-between w-full">
                  <span>{demo.label}</span>
                  {isThisLoading && (
                    <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{demo.role}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. SIGN IN FORM */}
      <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
        {/* Email Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
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
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
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
        <div className="flex items-center justify-between text-xs pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            onClick={() => {
              setResetEmail(email);
              setGeneralError(null);
              setResetStatusMsg(null);
              setAuthView('forgot');
            }}
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
          >
            Forgot Password?
          </button>
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

        {/* 5. SOCIAL OAUTH SECTION */}
        <div className="pt-2">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
            <span className="flex-shrink mx-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              or continue with
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2">
            {[
              { provider: 'Google' as const, isConfigured: Boolean(googleClientId) },
              { provider: 'GitHub' as const, isConfigured: Boolean(githubClientId) },
              { provider: 'Microsoft' as const, isConfigured: Boolean(microsoftClientId) },
            ].map(({ provider, isConfigured }) => (
              <button
                key={provider}
                type="button"
                onClick={() => handleSocialClick(provider)}
                className="py-2.5 px-3 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all flex flex-col items-center justify-center gap-0.5 relative group"
              >
                <div className="flex items-center gap-1.5">
                  <span>{provider}</span>
                </div>
                <span className="text-[9px] text-slate-400">
                  {isConfigured ? 'Available' : 'Unavailable'}
                </span>
              </button>
            ))}
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
    </div>
  );
};
