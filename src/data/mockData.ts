import {
  User,
  Message,
  AuditTrailEntry,
  TranslationDebtItem,
  SharedVocabEntry,
  LearningWord,
  GroupChat,
  CalendarEvent,
  QualityGateRule,
  DebtAnalytics,
} from '../types';

export const CURRENT_USER: User = {
  userId: 'usr_me',
  username: 'Alex Chen',
  email: 'alex.chen@linguachat.ai',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  preferredLanguage: 'en',
  cameraEnabled: true,
  microphoneEnabled: true,
  googleCalendarConnected: true,
  isOnline: true,
  lastSeen: 'Just now',
  role: 'translator_admin',
};

export const SAMPLE_USERS: User[] = [
  CURRENT_USER,
  {
    userId: 'usr_priya',
    username: 'Priya Sharma',
    email: 'priya.sharma@globaltech.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    preferredLanguage: 'hi',
    cameraEnabled: true,
    microphoneEnabled: true,
    googleCalendarConnected: true,
    isOnline: true,
    lastSeen: 'Active now',
    role: 'user',
  },
  {
    userId: 'usr_karthik',
    username: 'Karthik Subramanian',
    email: 'karthik.s@innolabs.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    preferredLanguage: 'ta',
    cameraEnabled: true,
    microphoneEnabled: true,
    googleCalendarConnected: false,
    isOnline: true,
    lastSeen: 'Active now',
    role: 'reviewer',
  },
  {
    userId: 'usr_elena',
    username: 'Elena Rostova',
    email: 'elena.rostova@designcorp.es',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    preferredLanguage: 'es',
    cameraEnabled: false,
    microphoneEnabled: true,
    googleCalendarConnected: true,
    isOnline: false,
    lastSeen: '15m ago',
    role: 'user',
  },
  {
    userId: 'usr_kenji',
    username: 'Kenji Takahashi',
    email: 'kenji.t@tokyoai.jp',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    preferredLanguage: 'ja',
    cameraEnabled: true,
    microphoneEnabled: true,
    googleCalendarConnected: true,
    isOnline: true,
    lastSeen: 'Active now',
    role: 'user',
  },
];

export const SAMPLE_GROUPS: GroupChat[] = [
  {
    groupId: 'grp_global_project',
    name: '🚀 Project Titan Global Core',
    description: 'Cross-functional technical alignment team (US, India, Japan, Spain)',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=200&q=80',
    members: [
      { userId: 'usr_me', username: 'Alex Chen', preferredLanguage: 'en' },
      { userId: 'usr_priya', username: 'Priya Sharma', preferredLanguage: 'hi' },
      { userId: 'usr_karthik', username: 'Karthik Subramanian', preferredLanguage: 'ta' },
      { userId: 'usr_kenji', username: 'Kenji Takahashi', preferredLanguage: 'ja' },
    ],
    languages: ['en', 'hi', 'ta', 'ja', 'es'],
    lastMessage: 'Let us review the high-debt translation entries in Tamil and Hindi before launch.',
    lastMessageTime: '10:42 AM',
    unreadCount: 3,
  },
  {
    groupId: 'grp_design_sprint',
    name: '🎨 UX & Cultural Localization',
    description: 'Tone, sentiment analysis, and cultural perception review group',
    avatar: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=200&q=80',
    members: [
      { userId: 'usr_me', username: 'Alex Chen', preferredLanguage: 'en' },
      { userId: 'usr_elena', username: 'Elena Rostova', preferredLanguage: 'es' },
      { userId: 'usr_karthik', username: 'Karthik Subramanian', preferredLanguage: 'ta' },
    ],
    languages: ['en', 'es', 'ta'],
    lastMessage: 'Perception preview highlighted an aggressive tone warning in the Spanish invite.',
    lastMessageTime: '09:15 AM',
    unreadCount: 0,
  },
];

export const INITIAL_MESSAGES: Message[] = [];

export const INITIAL_AUDIT_TRAIL: AuditTrailEntry[] = [];

export const INITIAL_DEBT_ITEMS: TranslationDebtItem[] = [];

export const INITIAL_DEBT_ANALYTICS: DebtAnalytics = {
  analyticsId: 'ana_debt_001',
  organizationId: 'org_lingua_01',
  periodStart: '2026-08-01',
  periodEnd: '2026-08-11',
  totalDebt: 0,
  averageDebtScore: 0,
  totalTranslationsEvaluated: 0,
  debtByCategory: {
    quick_fix: 0,
    structural: 0,
    rewrite: 0,
  },
  debtByLanguage: {},
  debtByRisk: {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  },
  remediationRate: 100,
  estimatedRemediationCostHours: 0,
};

export const INITIAL_VOCABULARY: SharedVocabEntry[] = [];

export const INITIAL_LEARNING_WORDS: LearningWord[] = [];

export const INITIAL_MEETINGS = [
  {
    meetingId: 'meet_501',
    title: 'Titan Global Release & Translation Debt Review',
    startTime: '2026-08-12 14:00',
    endTime: '2026-08-12 15:00',
    timeZone: 'UTC+05:30 (IST)',
    organizerId: 'usr_me',
    organizerName: 'Alex Chen',
    participants: ['Alex Chen', 'Karthik Subramanian', 'Priya Sharma', 'Kenji Takahashi'],
    targetLanguages: ['ta', 'hi', 'ja', 'en'],
    roomLink: 'https://linguachat.ai/room/titan_global',
    isSubtitled: true,
  },
  {
    meetingId: 'meet_502',
    title: 'Perception Preview & Echo Mode Workshop',
    startTime: '2026-08-13 16:30',
    endTime: '2026-08-13 17:30',
    timeZone: 'UTC+02:00 (CEST)',
    organizerId: 'usr_me',
    organizerName: 'Alex Chen',
    participants: ['Alex Chen', 'Elena Rostova'],
    targetLanguages: ['es', 'en'],
    roomLink: 'https://linguachat.ai/room/design_sprint',
    isSubtitled: true,
  },
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    eventId: 'evt_501',
    userId: 'usr_me',
    googleEventId: 'g_evt_titan_01',
    title: 'Titan Global Release & Translation Debt Review',
    description: 'Syncing US, India, and Japan teams on code-switching metrics and quality gates.',
    translatedTitle: 'டைட்டன் குளோபல் வெளியீடு & மொழிபெயர்ப்பு கடன் விமர்சனம் (Titan Release Review)',
    translatedDescription: 'அமெரிக்கா, இந்தியா மற்றும் ஜப்பான் குழுக்களை குறியீடு மாற்ற அளவீடுகள் மற்றும் தர வாயில்களில் ஒத்திசைத்தல்.',
    targetLanguage: 'ta',
    startTime: '2026-08-12T14:00:00Z',
    endTime: '2026-08-12T15:00:00Z',
    timezone: 'UTC',
    attendees: [
      { name: 'Alex Chen', email: 'alex.chen@linguachat.ai', language: 'en' },
      { name: 'Karthik Subramanian', email: 'karthik.s@innolabs.io', language: 'ta' },
      { name: 'Priya Sharma', email: 'priya.sharma@globaltech.com', language: 'hi' },
      { name: 'Kenji Takahashi', email: 'kenji.t@tokyoai.jp', language: 'ja' },
    ],
    videoCallLink: 'https://linguachat.ai/call/room_titan_global',
    status: 'scheduled',
  },
  {
    eventId: 'evt_502',
    userId: 'usr_me',
    title: 'Perception Preview & Echo Mode Design Workshop',
    description: 'Fine-tuning VADER emotional nuance thresholds and Echo back-translation fidelity.',
    translatedTitle: 'Reunión de taller sobre modo eco y vista previa de percepción',
    translatedDescription: 'Ajuste de los umbrales de matices emocionales y fidelidad de traducción.',
    targetLanguage: 'es',
    startTime: '2026-08-13T16:30:00Z',
    endTime: '2026-08-13T17:30:00Z',
    timezone: 'UTC',
    attendees: [
      { name: 'Alex Chen', email: 'alex.chen@linguachat.ai', language: 'en' },
      { name: 'Elena Rostova', email: 'elena.rostova@designcorp.es', language: 'es' },
    ],
    videoCallLink: 'https://linguachat.ai/call/room_design_sprint',
    status: 'scheduled',
  },
];

export const INITIAL_QUALITY_GATES: QualityGateRule[] = [
  {
    ruleId: 'gate_1',
    name: 'High Debt Auto-Queue Trigger',
    condition: 'Translation Debt Score > 70 OR Risk == Critical',
    thresholdScore: 70,
    action: 'flag_for_review',
    isActive: true,
  },
  {
    ruleId: 'gate_2',
    name: 'Echo Mode Enforcement for Low Confidence',
    condition: 'AI Translation Confidence < 80%',
    thresholdScore: 80,
    action: 'block_send',
    isActive: true,
  },
  {
    ruleId: 'gate_3',
    name: 'Negative Sentiment Escalation',
    condition: 'Sentiment Score < -0.6 (Hostile / Negative)',
    thresholdScore: -0.6,
    action: 'notify_admin',
    isActive: true,
  },
];

export const MOCK_USERS = SAMPLE_USERS;
export const MOCK_GROUPS = SAMPLE_GROUPS;
export const INITIAL_AUDIT_LOGS = INITIAL_AUDIT_TRAIL;
export const INITIAL_SHARED_VOCAB = INITIAL_VOCABULARY;
export const MOCK_DEBT_ANALYTICS = INITIAL_DEBT_ANALYTICS;

export const MOCK_ANALYTICS_SUMMARY = {
  totalMessagesSent: 1420,
  activeLanguagePairsCount: 5,
  messagesByLanguage: {
    en: 540,
    ta: 380,
    hi: 290,
    es: 120,
    ja: 90,
  },
  translationSuccessRate: 98.4,
  newWordsLearned: 42,
  codeSwitchingIndex: 64,
  averageConfidenceScore: 88.5,
};

