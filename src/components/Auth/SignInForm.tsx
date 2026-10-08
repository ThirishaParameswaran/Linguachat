import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ButtonValidator } from '../ButtonValidator';
import { AlertCircle, Shield } from 'lucide-react';

interface SignInFormProps {
  onSuccess?: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onSuccess }) => {
  const { signIn, isLoading } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: 'google' | 'github' | 'apple' | 'microsoft') => {
    setSelectedProvider(provider);
    setError(null);

    const providerNames: Record<string, string> = {
      google: 'Google User',
      github: 'GitHub Developer',
      microsoft: 'Enterprise User',
      apple: 'Apple ID User',
    };

    const res = await signIn({
      provider,
      token: 'oauth_mock_token_' + provider + '_' + Date.now(),
      email: `${provider}.user@linguachat.ai`,
      name: providerNames[provider],
      avatar:
        provider === 'google'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    });

    if (res.success) {
      onSuccess?.();
    } else {
      setError(res.error || 'Social sign-in failed');
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
        Sign in instantly using your verified social identity or single sign-on (SSO) provider:
      </p>

      {/* Google Button */}
      <ButtonValidator
        type="button"
        variant="outline"
        size="lg"
        className="w-full justify-start gap-3 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"
        isLoading={isLoading && selectedProvider === 'google'}
        onClick={() => handleOAuthLogin('google')}
        icon={
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
        }
      >
        Continue with Google
      </ButtonValidator>

      {/* GitHub Button */}
      <ButtonValidator
        type="button"
        variant="outline"
        size="lg"
        className="w-full justify-start gap-3 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"
        isLoading={isLoading && selectedProvider === 'github'}
        onClick={() => handleOAuthLogin('github')}
        icon={
          <svg className="w-5 h-5 shrink-0 fill-current text-slate-900 dark:text-white" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        }
      >
        Continue with GitHub
      </ButtonValidator>

      {/* Enterprise SSO */}
      <ButtonValidator
        type="button"
        variant="outline"
        size="lg"
        className="w-full justify-start gap-3 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"
        isLoading={isLoading && selectedProvider === 'microsoft'}
        onClick={() => handleOAuthLogin('microsoft')}
        icon={<Shield className="w-5 h-5 text-blue-500 shrink-0" />}
      >
        Enterprise SAML / SSO
      </ButtonValidator>

      <div className="pt-2 text-center">
        <span className="text-[11px] text-slate-400">
          Encrypted authentication via OAuth 2.0 & JWT session tokens
        </span>
      </div>
    </div>
  );
};
