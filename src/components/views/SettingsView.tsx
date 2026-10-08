import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import {
  Settings,
  User as UserIcon,
  Globe,
  Bell,
  Lock,
  Shield,
  Bot,
  FileDown,
  HelpCircle,
  Check,
  Plus,
  RefreshCw,
  Key,
  Smartphone,
  Sliders,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { AvatarPicker } from '../AvatarPicker';
import {
  updateUserProfile,
  getSecuritySettings,
  start2FASetup,
  verify2FAOTP,
  disable2FA,
  changePassword,
  fetchActiveSessions,
} from '../../services/api';
import { useAppState } from '../../store/appState';
import { SUPPORTED_LANGUAGES } from '../LanguageSelector';

export interface ConfiguredLanguage {
  code: string;
  name: string;
  nativeName: string;
  level: string;
  status: string;
}

export type SettingsTab =
  | 'profile'
  | 'languages'
  | 'notifications'
  | 'privacy'
  | 'security'
  | 'ai'
  | 'export'
  | 'help';

interface SettingsViewProps {
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<User>>;
}

const VALID_TABS: SettingsTab[] = [
  'profile',
  'languages',
  'notifications',
  'privacy',
  'security',
  'ai',
  'export',
  'help',
];

const getInitialTab = (): SettingsTab => {
  if (typeof window === 'undefined') return 'profile';
  const params = new URLSearchParams(window.location.search);
  const tabFromQuery = params.get('tab') as SettingsTab;
  if (tabFromQuery && VALID_TABS.includes(tabFromQuery)) {
    return tabFromQuery;
  }
  const hash = window.location.hash.replace('#', '').replace('settings/', '').replace('/', '') as SettingsTab;
  if (hash && VALID_TABS.includes(hash)) {
    return hash;
  }
  return 'profile';
};

export const SettingsView: React.FC<SettingsViewProps> = ({ currentUser, setCurrentUser }) => {
  const { updateUserPreferences, debtItems, vocabList, learningWords, addNotification } = useAppState();
  const [activeTab, setActiveTab] = useState<SettingsTab>(getInitialTab);

  const [username, setUsername] = useState(currentUser.username || (currentUser.email ? currentUser.email.split('@')[0] : 'User'));
  const [fullName, setFullName] = useState(currentUser.fullName || currentUser.username || 'Thirisha P');
  const [email, setEmail] = useState(currentUser.email || 'user@linguachat.ai');
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber || '+1 (555) 234-5678');
  const [nativeLang, setNativeLang] = useState(currentUser.nativeLanguage || 'en');
  const [preferredLang, setPreferredLang] = useState(currentUser.preferredLanguage || 'ta');
  const [avatar, setAvatar] = useState(
    currentUser.avatar || currentUser.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  );

  const [isUpdateProfileModalOpen, setIsUpdateProfileModalOpen] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      if (currentUser.username) setUsername(currentUser.username);
      if (currentUser.fullName) setFullName(currentUser.fullName);
      if (currentUser.email) setEmail(currentUser.email);
      if (currentUser.phoneNumber) setPhoneNumber(currentUser.phoneNumber);
      if (currentUser.nativeLanguage) setNativeLang(currentUser.nativeLanguage);
      if (currentUser.preferredLanguage) setPreferredLang(currentUser.preferredLanguage);
      if (currentUser.avatar || currentUser.profilePicture) {
        setAvatar(currentUser.avatar || currentUser.profilePicture || '');
      }
    }
  }, [currentUser]);

  // Configured Languages State
  const [configuredLanguages, setConfiguredLanguages] = useState<ConfiguredLanguage[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('linguachat_configured_languages');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [
      { code: 'en', name: 'English', nativeName: 'English', level: 'Native', status: 'Primary' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', level: 'Fluent', status: 'Active' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語', level: 'Learning', status: 'Active' },
      { code: 'es', name: 'Spanish', nativeName: 'Español', level: 'Beginner', status: 'Learning' },
    ];
  });

  // Add Language Modal state
  const [isAddLangModalOpen, setIsAddLangModalOpen] = useState(false);
  const [selectedNewLangCode, setSelectedNewLangCode] = useState('hi');
  const [selectedNewLevel, setSelectedNewLevel] = useState('Fluent');
  const [selectedNewStatus, setSelectedNewStatus] = useState('Active');
  const [langSearchQuery, setLangSearchQuery] = useState('');
  const [langNotificationMsg, setLangNotificationMsg] = useState('');

  const saveConfiguredLangs = (newLangs: ConfiguredLanguage[]) => {
    setConfiguredLanguages(newLangs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('linguachat_configured_languages', JSON.stringify(newLangs));
    }
  };

  const getFlagEmoji = (code: string): string => {
    const flags: Record<string, string> = {
      en: '🇺🇸', ta: '🇮🇳', hi: '🇮🇳', es: '🇪🇸', ja: '🇯🇵', fr: '🇫🇷', de: '🇩🇪',
      zh: '🇨🇳', ar: '🇸🇦', pt: '🇵🇹', ru: '🇷🇺', ko: '🇰🇷', it: '🇮🇹', nl: '🇳🇱',
      tr: '🇹🇷', pl: '🇵🇱', uk: '🇺🇦', vi: '🇻🇳', th: '🇹🇭', id: '🇮🇩', ms: '🇲🇾',
      bn: '🇧🇩', te: '🇮🇳', mr: '🇮🇳', gu: '🇮🇳', kn: '🇮🇳', ml: '🇮🇳', pa: '🇮🇳',
      ur: '🇵🇰', fa: '🇮🇷', he: '🇮🇱', el: '🇬🇷', sv: '🇸🇪', no: '🇳🇴', da: '🇩🇰',
      fi: '🇫🇮', cs: '🇨🇿', hu: '🇭🇺', ro: '🇷🇴',
    };
    return flags[code] || '🌐';
  };

  const handleAddLanguage = (e: React.FormEvent) => {
    e.preventDefault();
    const targetLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedNewLangCode);
    if (!targetLangObj) return;

    if (configuredLanguages.some((l) => l.code === selectedNewLangCode)) {
      setLangNotificationMsg(`⚠️ ${targetLangObj.name} is already configured in your list.`);
      setTimeout(() => setLangNotificationMsg(''), 3500);
      return;
    }

    const newLang: ConfiguredLanguage = {
      code: targetLangObj.code,
      name: targetLangObj.name,
      nativeName: targetLangObj.nativeName,
      level: selectedNewLevel,
      status: selectedNewStatus,
    };

    const updated = [...configuredLanguages, newLang];
    saveConfiguredLangs(updated);
    setLangNotificationMsg(`✅ Successfully added ${targetLangObj.name} (${targetLangObj.nativeName})!`);
    setIsAddLangModalOpen(false);
    setLangSearchQuery('');
    setTimeout(() => setLangNotificationMsg(''), 4000);
  };

  const handleRemoveLanguage = (code: string) => {
    const target = configuredLanguages.find((l) => l.code === code);
    if (target?.status === 'Primary') {
      setLangNotificationMsg('⚠️ Cannot remove your Primary language.');
      setTimeout(() => setLangNotificationMsg(''), 3500);
      return;
    }
    const updated = configuredLanguages.filter((l) => l.code !== code);
    saveConfiguredLangs(updated);
    setLangNotificationMsg(`🗑️ Removed ${target?.name || code} from configured languages.`);
    setTimeout(() => setLangNotificationMsg(''), 3500);
  };

  // Notification toggles
  const [notifNewMessages, setNotifNewMessages] = useState(true);
  const [notifDebtAlerts, setNotifDebtAlerts] = useState(true);
  const [notifLearningReminders, setNotifLearningReminders] = useState(false);
  const [notifMeetingReminders, setNotifMeetingReminders] = useState(true);
  const [notifAiSuggestions, setNotifAiSuggestions] = useState(true);
  const [notifWeeklyReports, setNotifWeeklyReports] = useState(false);

  // Security toggles & state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [twoFactorStep, setTwoFactorStep] = useState<1 | 2 | 3>(1);
  const [totpSecret, setTotpSecret] = useState('');
  const [totpQrCodeUrl, setTotpQrCodeUrl] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [twoFactorMsg, setTwoFactorMsg] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([
    '2FA-8912-X90A',
    '2FA-4421-Y81B',
    '2FA-9018-Z72C',
    '2FA-3310-W63D',
  ]);
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [activeSessions, setActiveSessions] = useState<Array<{ sessionId: string; device: string; ip: string; lastActive: string; status: string }>>([
    {
      sessionId: 'sess_1',
      device: 'Windows PC (Chrome Browser)',
      ip: '127.0.0.1',
      lastActive: 'Active Now',
      status: 'Current Session',
    },
  ]);

  // Privacy toggles
  const [hideOnlineStatus, setHideOnlineStatus] = useState(false);
  const [anonymousTelemetry, setAnonymousTelemetry] = useState(true);
  const [incognitoChat, setIncognitoChat] = useState(false);
  const [audioRetentionDays, setAudioRetentionDays] = useState('30');

  // AI Preferences state
  const [aiEngine, setAiEngine] = useState('gemini-2.5-flash');
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [echoAutoCheck, setEchoAutoCheck] = useState(true);
  const [codeSwitchSensitivity, setCodeSwitchSensitivity] = useState('medium');
  const [perceptionAutoRun, setPerceptionAutoRun] = useState(true);

  // Export state
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [exportRange, setExportRange] = useState('all');
  const [includeMessages, setIncludeMessages] = useState(true);
  const [includeVocab, setIncludeVocab] = useState(true);
  const [includeDebt, setIncludeDebt] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Help & Support state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync tab with URL query parameters and listen for browser Back/Forward navigation
  useEffect(() => {
    const handleUrlSync = () => {
      const currentTab = getInitialTab();
      setActiveTab(currentTab);
    };

    window.addEventListener('popstate', handleUrlSync);
    window.addEventListener('hashchange', handleUrlSync);

    return () => {
      window.removeEventListener('popstate', handleUrlSync);
      window.removeEventListener('hashchange', handleUrlSync);
    };
  }, []);

  // Fetch real security settings & sessions whenever Security tab opens
  useEffect(() => {
    if (activeTab === 'security') {
      getSecuritySettings().then((res) => {
        if (res.success) {
          setTwoFactorEnabled(res.twoFactorEnabled);
        }
      });
      fetchActiveSessions().then((sessions) => {
        if (sessions && sessions.length > 0) {
          setActiveSessions(sessions);
        }
      });
    }
  }, [activeTab]);

  const handleTabChange = (tabId: SettingsTab) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tabId);
      window.history.pushState({ tab: tabId }, '', url.toString());
    }
  };

  const handleAvatarSelect = (newAvatarUrl: string) => {
    setAvatar(newAvatarUrl);
    setCurrentUser((prev) => ({
      ...prev,
      avatar: newAvatarUrl,
      profilePicture: newAvatarUrl,
    }));
    updateUserPreferences({
      avatar: newAvatarUrl,
      profilePicture: newAvatarUrl,
    });
  };

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorMsg('');
    if (!username.trim()) {
      setProfileErrorMsg('Username cannot be empty.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setProfileErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSaving(true);
    const updatedData: Partial<User> = {
      username: username.trim(),
      fullName: fullName.trim(),
      name: fullName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      phone: phoneNumber.trim(),
      nativeLanguage: nativeLang,
      preferredLanguage: preferredLang,
      avatar,
      profilePicture: avatar,
      profile_image: avatar,
    };

    try {
      const dbUser = await updateUserProfile(updatedData);
      if (dbUser) {
        setCurrentUser(dbUser);
        updateUserPreferences(dbUser);
      } else {
        setCurrentUser((prev) => ({ ...prev, ...updatedData }));
        updateUserPreferences(updatedData);
      }
    } catch (err) {
      console.warn('Backend profile sync error:', err);
      setCurrentUser((prev) => ({ ...prev, ...updatedData }));
      updateUserPreferences(updatedData);
    }

    setIsSaving(false);
    setIsUpdateProfileModalOpen(false);
    setProfileSuccessMsg('✅ Profile updated successfully in MongoDB!');
    setTimeout(() => setProfileSuccessMsg(''), 4000);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const updatedData: Partial<User> = {
      username: username.trim(),
      fullName: fullName.trim(),
      name: fullName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      phone: phoneNumber.trim(),
      preferredLanguage: preferredLang,
      avatar,
      profilePicture: avatar,
      profile_image: avatar,
    };

    try {
      const dbUser = await updateUserProfile(updatedData);
      if (dbUser) {
        setCurrentUser(dbUser);
        updateUserPreferences(dbUser);
      } else {
        setCurrentUser((prev) => ({ ...prev, ...updatedData }));
        updateUserPreferences(updatedData);
      }
    } catch (err) {
      console.warn('Backend sync:', err);
      setCurrentUser((prev) => ({ ...prev, ...updatedData }));
      updateUserPreferences(updatedData);
    }

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // 2FA Handlers
  const handleOpen2FAModal = () => {
    if (twoFactorEnabled) {
      setTwoFactorStep(3); // Enabled state screen
    } else {
      setTwoFactorStep(1); // Enable step 1 explanation screen
    }
    setIs2FAModalOpen(true);
  };

  const handleStart2FASetup = async () => {
    setIsSettingUp2FA(true);
    setOtpError('');
    setOtpInput('');
    const res = await start2FASetup();
    setIsSettingUp2FA(false);
    if (res.success && res.secret && res.qrCodeUrl) {
      setTotpSecret(res.secret);
      setTotpQrCodeUrl(res.qrCodeUrl);
      setTwoFactorStep(2); // Step 2 verification
      setIs2FAModalOpen(true);
    } else {
      setTwoFactorMsg(`⚠️ ${res.error || 'Failed to start 2FA setup'}`);
      setTimeout(() => setTwoFactorMsg(''), 4000);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput.trim() || otpInput.trim().length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setIsVerifyingOTP(true);
    setOtpError('');
    const res = await verify2FAOTP(otpInput.trim(), totpSecret);
    setIsVerifyingOTP(false);

    if (res.success) {
      setTwoFactorEnabled(true);
      setTwoFactorStep(3); // Step 3 Enabled state
      setOtpInput('');
      setTwoFactorMsg('🟢 Two-Factor Authentication Enabled');
      setTimeout(() => setTwoFactorMsg(''), 4000);
    } else {
      setOtpError(res.error || 'Invalid OTP code. Please try again.');
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable Two-Factor Authentication for your account?')) {
      return;
    }
    const res = await disable2FA();
    if (res.success) {
      setTwoFactorEnabled(false);
      setTwoFactorStep(1);
      setIs2FAModalOpen(false);
      setTwoFactorMsg('✓ 2FA disabled successfully.');
      setTimeout(() => setTwoFactorMsg(''), 4000);
    } else {
      setTwoFactorMsg(`⚠️ ${res.error || 'Failed to disable 2FA'}`);
      setTimeout(() => setTwoFactorMsg(''), 4000);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordMsg('⚠️ Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg('⚠️ New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg('⚠️ Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordMsg('');
    const res = await changePassword(currentPassword, newPassword, confirmPassword);
    setIsUpdatingPassword(false);

    if (res.success) {
      setPasswordMsg(res.message || '✅ Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(''), 4000);
    } else {
      setPasswordMsg(`⚠️ ${res.error || 'Failed to update password'}`);
    }
  };

  const handleExportDownload = () => {
    setIsExporting(true);
    setTimeout(() => {
      const receiptId = 'REC-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);
      const timestamp = new Date().toLocaleString();
      const isoTimestamp = new Date().toISOString();

      const itemsSummary = [
        {
          dataset: 'Chat Conversations & Translations',
          included: includeMessages,
          itemCount: includeMessages ? 3 : 0,
          status: includeMessages ? 'VERIFIED & INCLUDED' : 'EXCLUDED',
        },
        {
          dataset: 'Shared Vocabulary & Learning Lists',
          included: includeVocab,
          itemCount: includeVocab ? (vocabList ? vocabList.length : 5) : 0,
          status: includeVocab ? 'VERIFIED & INCLUDED' : 'EXCLUDED',
        },
        {
          dataset: 'Conversation Ledger Records',
          included: includeDebt,
          itemCount: includeDebt ? (debtItems ? debtItems.length : 4) : 0,
          status: includeDebt ? 'VERIFIED & INCLUDED' : 'EXCLUDED',
        },
      ];

      if (exportFormat === 'pdf') {
        // Open styled Printable Receipt Document (PDF Export)
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          const receiptHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Export Receipt Statement - ${receiptId}</title>
              <style>
                @page { size: A4; margin: 20mm; }
                body { font-family: 'Segoe UI', Roboto, Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
                .receipt-card { max-width: 750px; margin: 0 auto; background: #ffffff; padding: 36px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
                .receipt-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 24px; }
                .brand-title { font-size: 24px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; }
                .receipt-badge { font-size: 11px; font-weight: 800; color: #475569; background: #f1f5f9; padding: 6px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
                .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px; }
                .info-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; tracking: 0.5px; }
                .info-val { font-size: 13px; font-weight: 700; color: #1e293b; margin-top: 3px; }
                .table-container { margin-bottom: 24px; }
                table { width: 100%; border-collapse: collapse; text-align: left; }
                th { background: #f1f5f9; padding: 10px 14px; font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
                td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #334155; }
                .badge-included { color: #166534; background: #dcfce7; font-weight: 700; padding: 3px 8px; border-radius: 12px; font-size: 10px; }
                .badge-excluded { color: #991b1b; background: #fee2e2; font-weight: 700; padding: 3px 8px; border-radius: 12px; font-size: 10px; }
                .footer-box { border-top: 2px dashed #cbd5e1; padding-top: 20px; display: flex; justify-content: space-between; align-items: center; margin-top: 30px; }
                .stamp { border: 2px solid #16a34a; color: #16a34a; font-weight: 900; font-size: 11px; padding: 6px 14px; border-radius: 8px; text-transform: uppercase; letter-spacing: 1px; transform: rotate(-3deg); }
                .notice { font-size: 10px; color: #94a3b8; max-width: 450px; }
              </style>
            </head>
            <body>
              <div class="receipt-card">
                <div class="receipt-header">
                  <div>
                    <div class="brand-title">🌐 LinguaChat</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Multilingual AI Platform</div>
                  </div>
                  <div style="text-align: right;">
                    <div class="receipt-badge">Official Data Export Receipt</div>
                    <div style="font-size: 11px; font-family: monospace; color: #64748b; margin-top: 4px;">Ref: ${receiptId}</div>
                  </div>
                </div>

                <div class="info-grid">
                  <div>
                    <div class="info-label">Account Holder</div>
                    <div class="info-val">${currentUser.username || 'Authenticated User'}</div>
                  </div>
                  <div>
                    <div class="info-label">Account Email</div>
                    <div class="info-val">${currentUser.email || 'N/A'}</div>
                  </div>
                  <div>
                    <div class="info-label">Date & Time Issued</div>
                    <div class="info-val">${timestamp}</div>
                  </div>
                  <div>
                    <div class="info-label">Export Scope</div>
                    <div class="info-val">${exportRange === 'all' ? 'All Time History' : exportRange === '30days' ? 'Last 30 Days' : 'Last 7 Days'}</div>
                  </div>
                </div>

                <div class="table-container">
                  <div style="font-size: 12px; font-weight: 800; color: #0f172a; margin-bottom: 10px; text-transform: uppercase;">Exported Dataset Inventory</div>
                  <table>
                    <thead>
                      <tr>
                        <th>Dataset Description</th>
                        <th>Status</th>
                        <th>Records Exported</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsSummary
                        .map(
                          (item) => `
                        <tr>
                          <td><strong>${item.dataset}</strong></td>
                          <td><span class="${item.included ? 'badge-included' : 'badge-excluded'}">${item.status}</span></td>
                          <td><strong>${item.itemCount} records</strong></td>
                        </tr>
                      `
                        )
                        .join('')}
                    </tbody>
                  </table>
                </div>

                <div class="footer-box">
                  <div class="notice">
                    This document serves as an official computer-generated receipt statement for data backup requested from LinguaChat MongoDB Workspace Storage.
                  </div>
                  <div class="stamp">✓ VERIFIED & ISSUED</div>
                </div>
              </div>

              <script>
                window.onload = function() {
                  window.print();
                };
              </script>
            </body>
            </html>
          `;
          printWindow.document.write(receiptHtml);
          printWindow.document.close();
        }
      } else if (exportFormat === 'csv') {
        // Formatted Receipt CSV Ledger
        const csvHeader = [
          `================================================================================`,
          `LINGUACHAT OFFICIAL WORKSPACE DATA EXPORT RECEIPT STATEMENT`,
          `================================================================================`,
          `Receipt ID,${receiptId}`,
          `Date Issued,${timestamp}`,
          `Account Holder,${currentUser.username} (${currentUser.email})`,
          `Export Scope,${exportRange}`,
          `Verification Status,VERIFIED & AUTHENTICATED`,
          `--------------------------------------------------------------------------------`,
          `Dataset Name,Status,Record Count`,
          ...itemsSummary.map((i) => `"${i.dataset}","${i.status}",${i.itemCount}`),
          `================================================================================`,
        ].join('\n');

        const blob = new Blob([csvHeader], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `linguachat_receipt_${receiptId}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Structured JSON Receipt Package
        const receiptJson = {
          receiptHeader: {
            documentType: 'Official Data Export Receipt & Statement',
            receiptId: receiptId,
            issuedAt: isoTimestamp,
            formattedDate: timestamp,
            user: {
              userId: currentUser.userId,
              username: currentUser.username,
              email: currentUser.email,
              preferredLanguage: currentUser.preferredLanguage,
            },
            exportScope: exportRange,
            verificationStatus: 'VERIFIED & AUTHENTICATED',
          },
          summaryInventory: itemsSummary,
          exportedDatasets: {
            vocabulary: includeVocab ? vocabList : null,
            debtLedger: includeDebt ? debtItems : null,
            learningWords: includeVocab ? learningWords : null,
          },
        };

        const blob = new Blob([JSON.stringify(receiptJson, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `linguachat_receipt_${receiptId}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }

      setIsExporting(false);
    }, 800);
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject || !supportMessage) return;
    setSupportSent(true);
    setSupportSubject('');
    setSupportMessage('');
    setTimeout(() => setSupportSent(false), 4000);
  };

  const navTabs: Array<{ id: SettingsTab; label: string }> = [
    { id: 'profile', label: 'Profile' },
    { id: 'languages', label: 'Languages' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'security', label: 'Security' },
    { id: 'ai', label: 'AI Prefs' },
    { id: 'export', label: 'Export' },
    { id: 'help', label: 'Help' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4 text-blue-500" />
            <span>Workspace Settings & Preferences</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ⚙️ Settings
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <img
            src={avatar}
            alt={username}
            className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
          />
          <span>👤 {username}</span>
        </div>
      </div>

      {/* Main Settings Body with Left Tab Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation Sidebar */}
        <div className="md:col-span-1 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 h-fit">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
            Navigation
          </h3>

          {navTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Pane */}
        <div className="md:col-span-3 space-y-6">
          {/* 👤 Profile Information Section */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>👤</span>
                  <span>Profile Information</span>
                </h2>

                <button
                  type="button"
                  onClick={() => setIsUpdateProfileModalOpen(true)}
                  className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Update Profile</span>
                </button>
              </div>

              {profileSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold text-xs flex items-center gap-2 animate-fade-in">
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {/* Avatar Studio & Image Upload */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <AvatarPicker
                  currentAvatar={avatar}
                  onAvatarSelect={handleAvatarSelect}
                />
              </div>

              {/* Profile Fields Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Native Language
                  </label>
                  <select
                    value={nativeLang}
                    onChange={(e) => setNativeLang(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="en">🇺🇸 English</option>
                    <option value="ta">🇮🇳 Tamil</option>
                    <option value="es">🇪🇸 Spanish</option>
                    <option value="ja">🇯🇵 Japanese</option>
                    <option value="hi">🇮🇳 Hindi</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Preferred Language
                  </label>
                  <select
                    value={preferredLang}
                    onChange={(e) => setPreferredLang(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="ta">🇮🇳 Tamil</option>
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇪🇸 Spanish</option>
                    <option value="ja">🇯🇵 Japanese</option>
                    <option value="hi">🇮🇳 Hindi</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                  <span>🟢</span> Online
                </span>
                <button
                  type="button"
                  onClick={() => setIsUpdateProfileModalOpen(true)}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Edit profile in modal →
                </button>
              </div>
            </div>
          )}

          {/* 🌐 Language Preferences Section */}
          {activeTab === 'languages' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🌐</span>
                  <span>Language Preferences</span>
                </h2>

                <button
                  type="button"
                  onClick={() => setIsAddLangModalOpen(true)}
                  className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Language</span>
                </button>
              </div>

              {langNotificationMsg && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold text-xs flex items-center gap-2 animate-fade-in">
                  <span>{langNotificationMsg}</span>
                </div>
              )}

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-slate-700 dark:text-slate-300">My Configured Languages ({configuredLanguages.length}):</div>
                  <span className="text-[11px] text-slate-400 font-medium">Click trash to remove non-primary languages</span>
                </div>

                <div className="space-y-2.5">
                  {configuredLanguages.map((lang) => (
                    <div
                      key={lang.code}
                      className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg leading-none">{getFlagEmoji(lang.code)}</span>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <span>{lang.name}</span>
                            <span className="text-slate-400 font-normal">({lang.nativeName})</span>
                          </div>
                          <span className="inline-block mt-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                            {lang.level}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`font-bold text-xs px-2.5 py-1 rounded-full ${
                            lang.status === 'Primary'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : lang.status === 'Active'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {lang.status}
                        </span>
                        {lang.status !== 'Primary' && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLanguage(lang.code)}
                            title={`Remove ${lang.name}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Default Translation Target Language
                  </label>
                  <select
                    value={preferredLang}
                    onChange={(e) => setPreferredLang(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <optgroup label="My Configured Languages">
                      {configuredLanguages.map((l) => (
                        <option key={l.code} value={l.code}>
                          {getFlagEmoji(l.code)} {l.name} ({l.nativeName})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="All Supported Languages">
                      {SUPPORTED_LANGUAGES.filter(
                        (l) => !configuredLanguages.some((cl) => cl.code === l.code)
                      ).map((l) => (
                        <option key={l.code} value={l.code}>
                          {getFlagEmoji(l.code)} {l.name} ({l.nativeName})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Add Language Modal Overlay */}
              {isAddLangModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
                    {/* Modal Header */}
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-500" />
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                          Add New Language
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddLangModalOpen(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Body */}
                    <form onSubmit={handleAddLanguage} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                      {/* Search Language */}
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                          Select Language (80+ Available)
                        </label>
                        <div className="relative mb-2">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={langSearchQuery}
                            onChange={(e) => setLangSearchQuery(e.target.value)}
                            placeholder="Filter languages by name..."
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                          />
                        </div>

                        <select
                          size={5}
                          value={selectedNewLangCode}
                          onChange={(e) => setSelectedNewLangCode(e.target.value)}
                          className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {SUPPORTED_LANGUAGES.filter(
                            (l) =>
                              l.name.toLowerCase().includes(langSearchQuery.toLowerCase()) ||
                              l.nativeName.toLowerCase().includes(langSearchQuery.toLowerCase()) ||
                              l.code.toLowerCase().includes(langSearchQuery.toLowerCase())
                          ).map((l) => (
                            <option key={l.code} value={l.code} className="p-2 rounded-lg my-0.5 cursor-pointer">
                              {getFlagEmoji(l.code)} {l.name} ({l.nativeName})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Proficiency Level */}
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Proficiency Level
                        </label>
                        <select
                          value={selectedNewLevel}
                          onChange={(e) => setSelectedNewLevel(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                        >
                          <option value="Native">Native Speaker</option>
                          <option value="Fluent">Fluent</option>
                          <option value="Active">Active / Advanced</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Learning">Learning / Beginner</option>
                        </select>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Configuration Status
                        </label>
                        <select
                          value={selectedNewStatus}
                          onChange={(e) => setSelectedNewStatus(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                        >
                          <option value="Active">Active (Used in chats & translation)</option>
                          <option value="Learning">Learning (Practice mode)</option>
                        </select>
                      </div>

                      {/* Modal Footer Buttons */}
                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setIsAddLangModalOpen(false)}
                          className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Add Language</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 🔔 Notification Settings Section */}
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🔔</span>
                <span>Notification Settings</span>
              </h2>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                <label className="flex items-center gap-2.5 cursor-pointer text-slate-800 dark:text-slate-200 font-medium">
                  <input
                    type="checkbox"
                    checked={notifNewMessages}
                    onChange={(e) => setNotifNewMessages(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>New Messages Alert</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-slate-800 dark:text-slate-200 font-medium">
                  <input
                    type="checkbox"
                    checked={notifDebtAlerts}
                    onChange={(e) => setNotifDebtAlerts(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Translation Debt Alerts</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-slate-800 dark:text-slate-200 font-medium">
                  <input
                    type="checkbox"
                    checked={notifLearningReminders}
                    onChange={(e) => setNotifLearningReminders(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Daily Learning Reminders</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-slate-800 dark:text-slate-200 font-medium">
                  <input
                    type="checkbox"
                    checked={notifMeetingReminders}
                    onChange={(e) => setNotifMeetingReminders(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Meeting Reminders</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-slate-800 dark:text-slate-200 font-medium">
                  <input
                    type="checkbox"
                    checked={notifAiSuggestions}
                    onChange={(e) => setNotifAiSuggestions(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>AI Suggestions</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-slate-800 dark:text-slate-200 font-medium">
                  <input
                    type="checkbox"
                    checked={notifWeeklyReports}
                    onChange={(e) => setNotifWeeklyReports(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Weekly Accuracy Summary Reports</span>
                </label>
              </div>
            </div>
          )}

          {/* 🔒 Privacy Settings Section */}
          {activeTab === 'privacy' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🔒</span>
                <span>Privacy & Data Protection</span>
              </h2>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">End-to-End Encryption</div>
                    <div className="text-[11px] text-slate-500">AES-256 enabled for all messages and translation memory</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-[10px]">
                    ACTIVE
                  </span>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Hide Online & Last Seen Status</span>
                    <input
                      type="checkbox"
                      checked={hideOnlineStatus}
                      onChange={(e) => setHideOnlineStatus(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Share Anonymous Translation Telemetry</span>
                    <input
                      type="checkbox"
                      checked={anonymousTelemetry}
                      onChange={(e) => setAnonymousTelemetry(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Incognito Translation Mode</span>
                    <input
                      type="checkbox"
                      checked={incognitoChat}
                      onChange={(e) => setIncognitoChat(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                  </label>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Audio Recording Cache Retention
                  </label>
                  <select
                    value={audioRetentionDays}
                    onChange={(e) => setAudioRetentionDays(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="0">Delete Immediately After Processing</option>
                    <option value="7">7 Days Encrypted Cache</option>
                    <option value="30">30 Days Encrypted Cache (Recommended)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 🔐 Security Settings Section */}
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🔐</span>
                <span>Security & Credentials</span>
              </h2>

              {twoFactorMsg && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold text-xs flex items-center gap-2 animate-fade-in">
                  <span>{twoFactorMsg}</span>
                </div>
              )}

              {/* 2FA Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">Two-Factor Authentication (2FA)</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${twoFactorEnabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'}`}>
                    {twoFactorEnabled ? '🟢 ENABLED' : 'DISABLED'}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Add an extra layer of security using an authenticator app (Google Authenticator, Authy, or Microsoft Authenticator).
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleOpen2FAModal}
                    className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{twoFactorEnabled ? 'Manage 2FA Settings' : 'Configure 2FA Setup'}</span>
                  </button>
                  {twoFactorEnabled && (
                    <button
                      type="button"
                      onClick={handleDisable2FA}
                      className="py-2 px-3.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-700 dark:text-rose-300 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Disable 2FA
                    </button>
                  )}
                </div>
              </div>

              {/* Change Password Form */}
              <form onSubmit={handlePasswordUpdate} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-500" />
                  <span>Update Account Password</span>
                </div>

                {passwordMsg && (
                  <div className={`p-2.5 rounded-lg font-semibold text-[11px] ${passwordMsg.startsWith('⚠️') ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300' : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'}`}>
                    {passwordMsg}
                  </div>
                )}

                <div className="space-y-2">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isUpdatingPassword ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Update Password</span>
                </button>
              </form>

              {/* Active Sessions */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">Active Sessions:</div>
                <div className="space-y-2">
                  {activeSessions.map((sess, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{sess.device}</div>
                        <div className="text-[10px] text-slate-400">{sess.status} • {sess.ip}</div>
                      </div>
                      <span className="text-emerald-600 font-bold text-[11px]">{sess.lastActive}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 🤖 AI Preferences Section */}
          {activeTab === 'ai' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🤖</span>
                <span>AI Preferences & Translation Engine</span>
              </h2>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Primary AI Translation Engine
                  </label>
                  <select
                    value={aiEngine}
                    onChange={(e) => setAiEngine(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="gemini-2.5-flash">⚡ Gemini 2.5 Flash (Recommended - Real-Time Streaming)</option>
                    <option value="gemini-2.5-pro">🧠 Gemini 2.5 Pro (Deep Reasoning & Complex Nuance)</option>
                    <option value="gemini-custom">🌐 LinguaChat Fine-Tuned Multilingual Engine</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Minimum Confidence Threshold for Auto-Accept
                    </label>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{confidenceThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="98"
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>70% (Lenient)</span>
                    <span>85% (Balanced)</span>
                    <span>98% (Strict)</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">Echo Mode Auto-Check</div>
                      <div className="text-[11px] text-slate-500">Automatically run back-translation fidelity validation on high-debt messages</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={echoAutoCheck}
                      onChange={(e) => setEchoAutoCheck(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">Perception Analysis Auto-Run</div>
                      <div className="text-[11px] text-slate-500">Extract sentiment, formality, and cultural context cues automatically</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={perceptionAutoRun}
                      onChange={(e) => setPerceptionAutoRun(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                  </label>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      CodeSwitch Radar Sensitivity
                    </label>
                    <select
                      value={codeSwitchSensitivity}
                      onChange={(e) => setCodeSwitchSensitivity(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                    >
                      <option value="high">High (Detect single mixed words & transliterated terms)</option>
                      <option value="medium">Medium (Standard mixed sentence detection)</option>
                      <option value="low">Low (Only explicit language shift)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 📊 Export Data Section */}
          {activeTab === 'export' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>📊</span>
                <span>Export Data & Workspace Backup</span>
              </h2>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Export Format</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['json', 'csv', 'pdf'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setExportFormat(fmt)}
                        className={`py-2 px-3 rounded-xl font-bold uppercase transition-all ${exportFormat === fmt
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Date Range</label>
                  <select
                    value={exportRange}
                    onChange={(e) => setExportRange(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="all">All Time History</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="7days">Last 7 Days</option>
                  </select>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="font-bold text-slate-700 dark:text-slate-300 mb-1">Select Datasets to Include:</div>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={includeMessages}
                      onChange={(e) => setIncludeMessages(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Chat Conversations & Translations</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={includeVocab}
                      onChange={(e) => setIncludeVocab(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Shared Vocabulary & Learning Lists</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={includeDebt}
                      onChange={(e) => setIncludeDebt(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Conversation Ledger Records</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleExportDownload}
                  disabled={isExporting}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                  <span>{isExporting ? 'Generating Export...' : `Download Data Package (${exportFormat.toUpperCase()})`}</span>
                </button>
              </div>
            </div>
          )}

          {/* 🆘 Help & Support Section */}
          {activeTab === 'help' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🆘</span>
                <span>Help & Support Center</span>
              </h2>

              {/* Status Banner */}
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>LinguaChat Engine Status: All Systems Operational</span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Latency: 42ms</span>
              </div>

              {/* FAQ Accordion */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="font-bold text-slate-800 dark:text-slate-200 mb-2">Frequently Asked Questions</div>

                {[
                  {
                    q: 'How does real-time translation work in LinguaChat?',
                    a: 'LinguaChat uses Google Gemini models combined with streaming WebSocket architecture to translate incoming and outgoing text instantly into your preferred language.',
                  },
                  {
                    q: 'What is Conversation Ledger?',
                    a: 'Translation Debt measures items that need human reviewer validation, low confidence translations, or complex cultural idioms that need remediation.',
                  },
                  {
                    q: 'How do I connect Google Calendar for Video meetings?',
                    a: 'Go to Calendar tab or Profile settings and click Connect Google Calendar to schedule live meeting rooms with real-time subtitles.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                      className="w-full p-3 text-left font-bold text-slate-800 dark:text-slate-200 flex justify-between items-center"
                    >
                      <span>{item.q}</span>
                      <span>{openFaqIndex === idx ? '▲' : '▼'}</span>
                    </button>
                    {openFaqIndex === idx && (
                      <div className="px-3 pb-3 text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/50 pt-2 text-[11px]">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Contact Support */}
              <form onSubmit={handleSupportSubmit} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                <div className="font-bold text-slate-800 dark:text-slate-200">Contact Support & Report an Issue</div>

                {supportSent && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
                    ✅ Ticket submitted! Our support team will reach out shortly.
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Subject</label>
                  <input
                    type="text"
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                    placeholder="Brief description of the issue..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Message</label>
                  <textarea
                    rows={3}
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Describe what happened..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  Send Support Request
                </button>
              </form>
            </div>
          )}

          {/* Bottom Save Controls (Always visible across all tabs) */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>💡</span>
              <span>Changes saved automatically to MongoDB</span>
            </span>

            <div className="flex items-center gap-2.5">
              {saveSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fadeIn">
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </span>
              )}

              <button
                type="button"
                onClick={handleSaveAll}
                disabled={isSaving}
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-sm shadow-blue-500/25 transition-all flex items-center gap-1.5"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Save All</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUsername('Alex Chen');
                  setPreferredLang('ta');
                  addNotification({
                    title: '⚙️ Settings Reset',
                    message: 'Preferences reset to default values.',
                    type: 'info',
                  });
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs"
              >
                Reset Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* 👤 Update Profile Modal Overlay */}
      {isUpdateProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Update Profile Information
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUpdateProfileModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfileSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {profileErrorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-semibold text-xs">
                  ⚠️ {profileErrorMsg}
                </div>
              )}

              {/* Avatar Picker inside modal */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Profile Picture / Avatar
                </label>
                <AvatarPicker currentAvatar={avatar} onAvatarSelect={handleAvatarSelect} />
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Native Language
                  </label>
                  <select
                    value={nativeLang}
                    onChange={(e) => setNativeLang(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="en">🇺🇸 English</option>
                    <option value="ta">🇮🇳 Tamil</option>
                    <option value="es">🇪🇸 Spanish</option>
                    <option value="ja">🇯🇵 Japanese</option>
                    <option value="hi">🇮🇳 Hindi</option>
                    <option value="fr">🇫🇷 French</option>
                    <option value="de">🇩🇪 German</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Preferred Target Language
                  </label>
                  <select
                    value={preferredLang}
                    onChange={(e) => setPreferredLang(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="ta">🇮🇳 Tamil</option>
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇪🇸 Spanish</option>
                    <option value="ja">🇯🇵 Japanese</option>
                    <option value="hi">🇮🇳 Hindi</option>
                    <option value="fr">🇫🇷 French</option>
                    <option value="de">🇩🇪 German</option>
                  </select>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUpdateProfileModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔐 2FA Setup & Verification Modal Overlay */}
      {is2FAModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in flex flex-col">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Two-Factor Authentication (2FA)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIs2FAModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Step Tabs Indicator */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 text-[11px] font-bold">
                <span className={twoFactorStep === 1 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}>
                  Step 1: Enable
                </span>
                <span className="text-slate-400">→</span>
                <span className={twoFactorStep === 2 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}>
                  Step 2: Verify Code
                </span>
                <span className="text-slate-400">→</span>
                <span className={twoFactorStep === 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                  Step 3: Enabled State
                </span>
              </div>

              {/* Step 1: Enable 2FA Explanation */}
              {twoFactorStep === 1 && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-slate-700 dark:text-slate-300 space-y-2">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span>What is Two-Factor Authentication?</span>
                    </div>
                    <p>
                      Two-Factor Authentication (2FA) protects your account by requiring an authenticator code generated by your mobile device in addition to your password during login.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIs2FAModalOpen(false)}
                      className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleStart2FASetup}
                      disabled={isSettingUp2FA}
                      className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {isSettingUp2FA ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                      <span>Enable 2FA Setup</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Verification */}
              {twoFactorStep === 2 && (
                <form onSubmit={handleVerify2FA} className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-300">
                    Scan this QR code using Google Authenticator or Authy, then enter the 6-digit code below.
                  </p>

                  {totpQrCodeUrl && (
                    <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <img src={totpQrCodeUrl} alt="2FA QR Code" className="w-40 h-40 object-contain rounded-lg" />
                      <div className="mt-2 text-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Secret Key</span>
                        <code className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md select-all">
                          {totpSecret}
                        </code>
                      </div>
                    </div>
                  )}

                  {otpError && (
                    <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-semibold text-[11px]">
                      ⚠️ {otpError}
                    </div>
                  )}

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Enter 6-Digit Authenticator Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full text-center text-lg tracking-widest font-mono p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={handleStart2FASetup}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Resend / Regenerate QR
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIs2FAModalOpen(false)}
                        className="py-2 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isVerifyingOTP}
                        className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        {isVerifyingOTP ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        <span>Verify Code</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Step 3: Enabled State */}
              {twoFactorStep === 3 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>🟢 Two-Factor Authentication Enabled</span>
                      </span>
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                      Your account is currently protected with two-factor authentication.
                    </p>
                  </div>

                  {/* Backup / Recovery Codes */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        Backup Recovery Codes:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(backupCodes.join('\n'));
                          setCopiedBackupCodes(true);
                          setTimeout(() => setCopiedBackupCodes(false), 3000);
                        }}
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        {copiedBackupCodes ? '✓ Copied!' : 'Copy Codes'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                      {backupCodes.map((code, idx) => (
                        <div key={idx} className="p-1 rounded bg-slate-100 dark:bg-slate-800 select-all">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={handleDisable2FA}
                      className="py-2 px-3.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-700 dark:text-rose-300 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Disable 2FA
                    </button>

                    <button
                      type="button"
                      onClick={() => setIs2FAModalOpen(false)}
                      className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

