import React, { useState, useRef } from 'react';
import { User, Mail, Lock, Globe, UserPlus, AlertCircle, Camera, Sparkles, RefreshCw, Upload } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { validators } from '../../utils/validators';
import { ButtonValidator } from '../ButtonValidator';
import { useButtonValidation } from '../../hooks/useButtonValidation';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const { register, isLoading, error: authError } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('es');
  const [avatar, setAvatar] = useState('https://api.dicebear.com/7.x/bottts/svg?seed=linguachat_user');
  const [generalError, setGeneralError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const usernameVal = useButtonValidation({
    value: username,
    validator: validators.username,
    debounceMs: 200,
  });

  const emailVal = useButtonValidation({
    value: email,
    validator: validators.email,
    debounceMs: 200,
  });

  const passwordVal = useButtonValidation({
    value: password,
    validator: (pwd) => validators.password(pwd, 6),
    debounceMs: 200,
  });

  const isFormValid = usernameVal.isValid && emailVal.isValid && passwordVal.isValid;

  const handleRandomizeAvatar = () => {
    const styles = ['bottts', 'adventurer', 'lorelei', 'personas', 'thumbs'];
    const style = styles[Math.floor(Math.random() * styles.length)];
    const seed = (username.trim() || 'user') + '_' + Math.floor(Math.random() * 9000 + 1000);
    setAvatar(`https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setAvatar(ev.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const userCheck = validators.username(username);
    const emailCheck = validators.email(email);
    const pwdCheck = validators.password(password, 6);

    if (!userCheck.isValid) {
      setGeneralError(userCheck.error || 'Invalid username');
      return;
    }
    if (!emailCheck.isValid) {
      setGeneralError(emailCheck.error || 'Invalid email');
      return;
    }
    if (!pwdCheck.isValid) {
      setGeneralError(pwdCheck.error || 'Password too short');
      return;
    }

    const res = await register({
      username,
      email,
      password,
      preferredLanguage,
      avatar,
    });

    if (res.success) {
      onSuccess?.();
    } else {
      setGeneralError(res.error || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {(generalError || authError) && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{generalError || authError}</span>
        </div>
      )}

      {/* Avatar Customization Preview */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleFileUpload}
          className="hidden"
        />
        <div className="relative group shrink-0">
          <img
            src={avatar}
            alt="Chosen Avatar"
            className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/40 bg-slate-100 dark:bg-slate-900"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white rounded-xl transition-opacity"
            title="Upload photo"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-900 dark:text-white">Profile Avatar</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Randomize style or upload image</p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleRandomizeAvatar}
            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
            title="Randomize Avatar Style"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            title="Upload Photo"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Username */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Full Name / Username
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. Maria Gonzalez"
            required
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
              usernameVal.errorMessage
                ? 'border-rose-400 focus:ring-rose-400'
                : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
            }`}
          />
        </div>
        {usernameVal.errorMessage && (
          <p className="mt-1 text-[11px] text-rose-500 font-medium">{usernameVal.errorMessage}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Email Address
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="maria@example.com"
            required
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
              emailVal.errorMessage
                ? 'border-rose-400 focus:ring-rose-400'
                : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
            }`}
          />
        </div>
        {emailVal.errorMessage && (
          <p className="mt-1 text-[11px] text-rose-500 font-medium">{emailVal.errorMessage}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Password (min 6 characters)
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
              passwordVal.errorMessage
                ? 'border-rose-400 focus:ring-rose-400'
                : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
            }`}
          />
        </div>
        {passwordVal.errorMessage && (
          <p className="mt-1 text-[11px] text-rose-500 font-medium">{passwordVal.errorMessage}</p>
        )}
      </div>

      {/* Preferred Language */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Primary Native Language
        </label>
        <div className="relative">
          <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="en">English (English)</option>
            <option value="es">Spanish (Español)</option>
            <option value="ta">Tamil (தமிழ்)</option>
            <option value="hi">Hindi (हिन्दी)</option>
            <option value="fr">French (Français)</option>
            <option value="de">German (Deutsch)</option>
            <option value="zh">Chinese (中文)</option>
            <option value="ja">Japanese (日本語)</option>
            <option value="ar">Arabic (العربية)</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <ButtonValidator
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
          status={isFormValid ? 'valid' : 'idle'}
          isValid={isFormValid}
          icon={<UserPlus className="w-4 h-4" />}
          tooltipText={isFormValid ? 'Create your multilingual account' : 'Please fill all required fields correctly'}
        >
          Create Free Account
        </ButtonValidator>
      </div>

      {onSwitchToLogin && (
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      )}
    </form>
  );
};
