import React, { useState, useRef } from 'react';
import { User } from '../types';
import { X, LogIn, UserPlus, CheckCircle2, ShieldCheck, Languages, Sparkles, Upload, Camera } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSelectUser?: (user: User) => void;
  onSwitchUser?: (user: User) => void;
  users: User[];
  onRegisterUser?: (user: User, password: string) => void;
  requireAuth?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
  onSwitchUser,
  users,
  onRegisterUser,
  requireAuth = false,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'signin'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [prefLang, setPrefLang] = useState('en');
  const [customAvatar, setCustomAvatar] = useState('https://api.dicebear.com/7.x/bottts/svg?seed=linguachat_user');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const applyUser = (user: User) => {
    const next = onSelectUser || onSwitchUser;
    next?.(user);
  };

  const loadPasswordMap = (): Record<string, string> => {
    try {
      return JSON.parse(localStorage.getItem('linguachat_passwords') || '{}');
    } catch {
      return {};
    }
  };

  const handleCredentialAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const normalized = email.trim().toLowerCase();
    const passwords = loadPasswordMap();
    const match = users.find((u) => u.email.toLowerCase() === normalized);
    const stored = passwords[normalized];

    if (!match) {
      setError('No account found for that email. Register first.');
      setMode('register');
      return;
    }
    if (stored && stored !== password) {
      setError('Incorrect password.');
      return;
    }
    const mockToken = 'jwt_token_user_' + Date.now();
    const loggedUser: User = { ...match, token: mockToken, isOnline: true, lastSeen: 'Just now' };
    // #region agent log
    fetch('http://127.0.0.1:7357/ingest/964320c7-aa6c-499b-87b0-be74cb7cab77',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db8af2'},body:JSON.stringify({sessionId:'db8af2',hypothesisId:'A',location:'AuthModal.tsx:credentialAuth',message:'Credential auth success',data:{mode,email:normalized,userId:loggedUser.userId,hasOnSelect:!!onSelectUser,hasOnSwitch:!!onSwitchUser},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    applyUser(loggedUser);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const normalized = email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === normalized)) {
      setError('That email is already registered. Sign in instead.');
      setMode('signin');
      return;
    }
    const newUser: User = {
      userId: 'usr_' + Date.now(),
      username: username.trim(),
      email: normalized,
      avatar: customAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username.trim())}`,
      profilePicture: customAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username.trim())}`,
      preferredLanguage: prefLang,
      cameraEnabled: true,
      microphoneEnabled: true,
      googleCalendarConnected: false,
      isOnline: true,
      lastSeen: 'Just now',
      role: 'user',
      token: 'jwt_token_user_' + Date.now(),
    };
    onRegisterUser?.(newUser, password);
    const passwords = loadPasswordMap();
    passwords[normalized] = password;
    localStorage.setItem('linguachat_passwords', JSON.stringify(passwords));
    // #region agent log
    fetch('http://127.0.0.1:7357/ingest/964320c7-aa6c-499b-87b0-be74cb7cab77',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db8af2'},body:JSON.stringify({sessionId:'db8af2',hypothesisId:'A',location:'AuthModal.tsx:register',message:'Register then sign-in step',data:{email:normalized,userId:newUser.userId},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    setNotice('Account created. Sign in with your email and password.');
    setMode('signin');
    setUsername('');
  };

  const title =
    mode === 'login' ? 'Log in' : mode === 'register' ? 'Register' : 'Sign in';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[92dvh] overflow-y-auto shadow-2xl text-slate-200">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">{title}</h2>
          </div>
          {!requireAuth && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors min-h-11 min-w-11 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 border-b border-slate-800 text-xs font-medium text-center bg-slate-950/40">
          {(['login', 'register', 'signin'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setMode(tab);
                setError(null);
                setNotice(null);
              }}
              className={`py-3 min-h-11 transition-colors border-b-2 capitalize ${
                mode === tab
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40 font-semibold'
                  : 'border-transparent text-slate-400'
              }`}
            >
              {tab === 'signin' ? 'Sign in' : tab === 'login' ? 'Log in' : 'Register'}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-5">
          {notice && <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2">{notice}</p>}
          {error && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">{error}</p>}

          {mode === 'signin' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">Sign in with a saved account, or pick a demo persona:</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {users.map((usr) => (
                  <button
                    key={usr.userId}
                    type="button"
                    onClick={() => {
                      applyUser({ ...usr, token: 'jwt_token_user_' + Date.now() });
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-3 min-h-11 rounded-xl border text-left transition-all ${
                      currentUser?.userId === usr.userId
                        ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={usr.avatar} alt={usr.username} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          {usr.username}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-indigo-300 font-normal uppercase">
                            {usr.preferredLanguage}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">{usr.email}</div>
                      </div>
                    </div>
                    {currentUser?.userId === usr.userId && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'register' || mode === 'signin') && (
            <form onSubmit={mode === 'register' ? handleRegister : handleCredentialAuth} className="space-y-4">
              {mode === 'register' && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) setCustomAvatar(ev.target.result as string);
                        };
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <div className="relative group shrink-0">
                      <img
                        src={customAvatar}
                        alt="Avatar Preview"
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/40 bg-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white rounded-xl transition-opacity"
                        title="Upload Photo"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white">Profile Avatar</div>
                      <p className="text-[11px] text-slate-400">Randomize style or upload image</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const styles = ['bottts', 'adventurer', 'lorelei', 'personas', 'thumbs'];
                          const st = styles[Math.floor(Math.random() * styles.length)];
                          const sd = (username.trim() || 'user') + '_' + Math.floor(Math.random() * 9000 + 1000);
                          setCustomAvatar(`https://api.dicebear.com/7.x/${st}/svg?seed=${encodeURIComponent(sd)}`);
                        }}
                        className="p-1.5 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800 hover:bg-indigo-900 transition-colors"
                        title="Randomize Avatar Style"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors"
                        title="Upload Photo"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. Alex Chen"
                      className="w-full px-3 py-2.5 min-h-11 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.chen@linguachat.ai"
                  className="w-full px-3 py-2.5 min-h-11 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2.5 min-h-11 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {mode === 'register' && (
                <div>
                  <label className="text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5 text-indigo-400" /> Preferred Native Language
                  </label>
                  <select
                    value={prefLang}
                    onChange={(e) => setPrefLang(e.target.value)}
                    className="w-full px-3 py-2.5 min-h-11 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="en">English (US)</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="hi">Hindi (हिंदी)</option>
                    <option value="es">Spanish (Español)</option>
                    <option value="ja">Japanese (日本語)</option>
                    <option value="fr">French (Français)</option>
                    <option value="zh">Mandarin (中文)</option>
                    <option value="ar">Arabic (العربية)</option>
                    <option value="de">German (Deutsch)</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 min-h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                {mode === 'register' ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                <span>
                  {mode === 'register' ? 'Create account' : mode === 'signin' ? 'Sign in' : 'Log in'}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
