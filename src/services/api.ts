import {
  User,
  Message,
  EchoResult,
  PerceptionPreview,
  CodeSwitchRadarData,
  TranslationDebtItem,
  AuditTrailEntry,
  SharedVocabEntry,
  LearningWord,
  CalendarEvent,
  AnalyticsSummary,
  DebtAnalytics,
} from '../types';

// Helper for auth headers
function getAuthHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const authToken = token || (typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('linguachat_app_storage') || '{}')?.state?.token : null);
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

// -------------------------------------------------------------------
// 1. Translation & AI Services
// -------------------------------------------------------------------
export async function requestTranslation(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<{
  success: boolean;
  translatedText: string;
  detectedLanguage: string;
  confidenceScore: number;
  keyTerms: Array<{ word: string; translation: string; definition: string; phonetic?: string }>;
  error?: string;
}> {
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage, sourceLanguage }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.translatedText) {
        return {
          success: true,
          translatedText: data.translatedText,
          detectedLanguage: data.detectedLanguage || 'auto',
          confidenceScore: typeof data.confidenceScore === 'number' ? data.confidenceScore : 0,
          keyTerms: data.keyTerms || [],
        };
      }
    } else {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        translatedText: '',
        detectedLanguage: sourceLanguage || 'auto',
        confidenceScore: 0,
        keyTerms: [],
        error: errData.error || errData.message || 'Translation failed. Please try again.',
      };
    }
  } catch (e) {
    console.error('Translation API call error:', e);
  }

  // NO FAKE FALLBACK TEXT! Return clear error state.
  return {
    success: false,
    translatedText: '',
    detectedLanguage: sourceLanguage || 'auto',
    confidenceScore: 0,
    keyTerms: [],
    error: 'Translation unavailable. Please try again.',
  };
}

export async function requestEchoCheck(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<EchoResult> {
  try {
    const res = await fetch('/api/translate/echo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage, sourceLanguage }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.echoResult) {
        return data.echoResult;
      }
    }
  } catch (e) {
    console.error('Echo API error:', e);
  }

  // NO FAKE FALLBACK DATA! Throw error so UI shows clear error state.
  throw new Error('Echo analysis unavailable. Please try again.');
}

export async function requestPerceptionAnalysis(
  text: string,
  targetLanguage: string
): Promise<PerceptionPreview> {
  try {
    const res = await fetch('/api/perception/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.perception;
    }
  } catch (e) {
    console.warn('Perception API failed', e);
  }
  return {
    sentimentScore: 0.8,
    sentimentLabel: 'positive',
    sentimentEmoji: '🌸',
    toneDetails: {
      politeness: 90,
      formality: 75,
      urgency: 20,
      emotionalNuance: 'Constructive collaborative tone.',
    },
  };
}

export async function requestCodeSwitchRadar(
  text: string,
  messageId: string
): Promise<CodeSwitchRadarData> {
  try {
    const res = await fetch('/api/radar/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, messageId }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.radarData;
    }
  } catch (e) {
    console.warn('Radar API failed', e);
  }
  return {
    radarId: 'rad_' + Date.now(),
    messageId,
    isCodeMixed: true,
    primaryLanguage: 'en',
    detectedLanguages: ['en', 'ta'],
    tokens: text.split(' ').map((t, idx) => ({
      token: t,
      language: idx % 2 === 0 ? 'en' : 'ta',
      confidence: 0.95,
      isSwitchPoint: idx === 1,
    })),
    switchPoints: 1,
    languageDistribution: { en: 60, ta: 40 },
    switchCount: 1,
    complexityScore: 50,
  };
}

// -------------------------------------------------------------------
// 2. User Management APIs
// -------------------------------------------------------------------
export async function fetchUsers(): Promise<User[]> {
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      return data.users || [];
    }
  } catch (e) {
    console.warn('Failed to fetch users:', e);
  }
  return [];
}

export async function searchUsers(query: string): Promise<User[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(query.trim())}`);
    if (res.ok) {
      const data = await res.json();
      return data.users || [];
    }
  } catch (e) {
    console.warn('User search failed:', e);
  }
  return [];
}

export async function fetchOnlineUsers(): Promise<User[]> {
  try {
    const res = await fetch('/api/users/online');
    if (res.ok) {
      const data = await res.json();
      return data.users || [];
    }
  } catch (e) {
    console.warn('Failed to fetch online users:', e);
  }
  return [];
}

export async function updateUserProfile(updates: Partial<User>): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const data = await res.json();
      return data.user || null;
    }
  } catch (e) {
    console.warn('Failed to update user profile:', e);
  }
  return null;
}

// -------------------------------------------------------------------
// 3. Translation Debt & Analytics APIs
// -------------------------------------------------------------------
export async function requestDebtCalculation(payload: {
  messageId: string;
  originalMessage: string;
  aiTranslation: string;
  confidenceScore: number;
  correctionCount?: number;
  isAuditApproved?: boolean;
  codeSwitchComplexity?: number;
  hoursSinceReview?: number;
  sourceLanguage?: string;
  targetLanguage?: string;
}): Promise<TranslationDebtItem> {
  try {
    const res = await fetch('/api/debt/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      return data.debtItem;
    }
  } catch (e) {
    console.warn('Debt API failed', e);
  }

  const confidenceDebt = (100 - payload.confidenceScore) * 0.30;
  const correctionDebt = Math.min((payload.correctionCount || 0) * 12.5, 25);
  const auditApprovalDebt = payload.isAuditApproved ? 0 : 20;
  const complexityDebt = ((payload.codeSwitchComplexity || 50) / 100) * 15;
  const timeDebt = Math.min(((payload.hoursSinceReview || 2) / 24) * 10, 10);
  const score = Math.round(confidenceDebt + correctionDebt + auditApprovalDebt + complexityDebt + timeDebt);

  return {
    debtId: 'debt_' + Date.now(),
    messageId: payload.messageId,
    originalMessage: payload.originalMessage,
    aiTranslation: payload.aiTranslation,
    sourceLanguage: payload.sourceLanguage || 'ta',
    targetLanguage: payload.targetLanguage || 'en',
    debtScore: score,
    confidenceDebt,
    correctionDebt,
    auditApprovalDebt,
    complexityDebt,
    timeDebt,
    debtCategory: score > 70 ? 'rewrite' : score > 40 ? 'structural' : 'quick_fix',
    riskSeverity: score >= 80 ? 'critical' : score >= 60 ? 'high' : score >= 35 ? 'medium' : 'low',
    remediationStatus: score > 50 ? 'in_queue' : 'unassigned',
    evaluatedBy: 'LinguaChat Debt Engine',
    evaluatedAt: 'Just now',
  };
}

export async function fetchDebtItems(): Promise<TranslationDebtItem[]> {
  try {
    const res = await fetch('/api/debt');
    if (res.ok) {
      const data = await res.json();
      return data.debtItems || [];
    }
  } catch (e) {
    console.warn('Failed to fetch debt items:', e);
  }
  return [];
}

export async function resolveDebtItem(debtId: string, notes: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/debt/${debtId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes, status: 'resolved' }),
    });
    return res.ok;
  } catch (e) {
    console.warn('Failed to resolve debt item:', e);
    return false;
  }
}

export async function fetchAnalyticsData(): Promise<{
  summary: AnalyticsSummary;
  debtAnalytics: DebtAnalytics;
} | null> {
  try {
    const res = await fetch('/api/analytics');
    if (res.ok) {
      const data = await res.json();
      return { summary: data.summary, debtAnalytics: data.debtAnalytics };
    }
  } catch (e) {
    console.warn('Failed to fetch analytics:', e);
  }
  return null;
}

// -------------------------------------------------------------------
// 4. Domain APIs (Audit, Vocabulary, Learning, Calendar)
// -------------------------------------------------------------------
export async function fetchAuditEntries(): Promise<AuditTrailEntry[]> {
  try {
    const res = await fetch('/api/audit');
    if (res.ok) {
      const data = await res.json();
      return data.auditEntries || [];
    }
  } catch (e) {
    console.warn('Failed to fetch audit entries:', e);
  }
  return [];
}

export async function fetchSharedVocabulary(): Promise<SharedVocabEntry[]> {
  try {
    const res = await fetch('/api/vocabulary');
    if (res.ok) {
      const data = await res.json();
      return data.vocabList || [];
    }
  } catch (e) {
    console.warn('Failed to fetch vocabulary:', e);
  }
  return [];
}

export async function addSharedVocabulary(entry: Partial<SharedVocabEntry>): Promise<SharedVocabEntry | null> {
  try {
    const res = await fetch('/api/vocabulary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (res.ok) {
      const data = await res.json();
      return data.vocabEntry;
    }
  } catch (e) {
    console.warn('Failed to add vocabulary:', e);
  }
  return null;
}

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    const res = await fetch('/api/calendar');
    if (res.ok) {
      const data = await res.json();
      return data.events || [];
    }
  } catch (e) {
    console.warn('Failed to fetch calendar events:', e);
  }
  return [];
}

export async function createCalendarEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
  try {
    const res = await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    if (res.ok) {
      const data = await res.json();
      return data.event;
    }
  } catch (e) {
    console.warn('Failed to create calendar event:', e);
  }
  return null;
}

export async function fetchCalendarShares(): Promise<Array<{ id: string; userEmail: string; permission: string; sharedAt: string }>> {
  try {
    const res = await fetch('/api/calendar/shares');
    if (res.ok) {
      const data = await res.json();
      return data.shares || [];
    }
  } catch (e) {
    console.warn('Failed to fetch calendar shares:', e);
  }
  return [];
}

export async function createCalendarShare(shareData: { userEmail: string; permission: string }): Promise<{ id: string; userEmail: string; permission: string; sharedAt: string } | null> {
  try {
    const res = await fetch('/api/calendar/shares', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shareData),
    });
    if (res.ok) {
      const data = await res.json();
      return data.share;
    }
  } catch (e) {
    console.warn('Failed to create calendar share:', e);
  }
  return null;
}

export async function deleteCalendarShare(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/calendar/shares/${id}`, { method: 'DELETE' });
    if (res.ok) {
      return true;
    }
  } catch (e) {
    console.warn('Failed to delete calendar share:', e);
  }
  return false;
}

export async function sendEmailReport(
  email: string,
  dateRange: string,
  analyticsData?: any
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const res = await fetch('/api/analytics/email-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, dateRange, reportData: analyticsData }),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        message: data.message || `Telemetry report successfully sent to ${email}`,
      };
    } else {
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        message: '',
        error: errJson.error || 'Failed to dispatch email report.',
      };
    }
  } catch (e: any) {
    return {
      success: false,
      message: '',
      error: e.message || 'Network error while dispatching email report.',
    };
  }
}

// -------------------------------------------------------------------
// 9. Security & 2FA & Contact API Helpers
// -------------------------------------------------------------------
export async function fetchContactDetails(id: string): Promise<any> {
  try {
    const res = await fetch(`/api/contacts/${encodeURIComponent(id)}`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      return data.contact || data.user || null;
    }
  } catch (e) {
    console.warn('Failed to fetch contact details:', e);
  }
  return null;
}
export async function getSecuritySettings(): Promise<{ success: boolean; twoFactorEnabled: boolean }> {
  try {
    const res = await fetch('/api/security/settings', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, twoFactorEnabled: Boolean(data.twoFactorEnabled) };
    }
  } catch (e) {
    console.warn('Failed to fetch security settings:', e);
  }
  return { success: false, twoFactorEnabled: false };
}

export async function start2FASetup(): Promise<{ success: boolean; secret?: string; qrCodeUrl?: string; error?: string }> {
  try {
    const res = await fetch('/api/security/2fa/setup', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, secret: data.secret, qrCodeUrl: data.qrCodeUrl };
    }
    return { success: false, error: data.error || 'Failed to initiate 2FA setup' };
  } catch (e: any) {
    return { success: false, error: e.message || 'Network error' };
  }
}

export async function verify2FAOTP(token: string, secret: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/security/2fa/verify', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ token, secret }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return { success: false, error: data.error || 'Verification failed' };
  } catch (e: any) {
    return { success: false, error: e.message || 'Network error' };
  }
}

export async function disable2FA(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/security/2fa/disable', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return { success: false, error: data.error || 'Failed to disable 2FA' };
  } catch (e: any) {
    return { success: false, error: e.message || 'Network error' };
  }
}

export async function changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/security/change-password', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return { success: false, error: data.error || 'Failed to update password' };
  } catch (e: any) {
    return { success: false, error: e.message || 'Network error' };
  }
}

export async function fetchActiveSessions(): Promise<Array<{ sessionId: string; device: string; ip: string; lastActive: string; status: string }>> {
  try {
    const res = await fetch('/api/security/sessions', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      return data.sessions || [];
    }
  } catch (e) {
    console.warn('Failed to fetch active sessions:', e);
  }
  return [
    {
      sessionId: 'sess_1',
      device: 'Windows PC (Chrome Browser)',
      ip: '127.0.0.1',
      lastActive: 'Active Now',
      status: 'Current Session',
    },
  ];
}

export async function fetchLearningWords(): Promise<LearningWord[]> {
  try {
    const res = await fetch('/api/learn', { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      return data.learningWords || [];
    }
  } catch (e) {
    console.warn('Failed to fetch learning words:', e);
  }
  return [];
}

export async function saveLearningWord(word: Partial<LearningWord>): Promise<LearningWord | null> {
  try {
    const res = await fetch('/api/learn', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(word),
    });
    if (res.ok) {
      const data = await res.json();
      return data.word || null;
    }
  } catch (e) {
    console.warn('Failed to save learning word:', e);
  }
  return null;
}

export const addLearningWord = saveLearningWord;


