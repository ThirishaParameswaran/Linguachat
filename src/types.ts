export interface User {
  userId: string;
  username: string;
  fullName?: string;
  name?: string;
  email: string;
  phoneNumber?: string;
  phone?: string;
  avatar: string;
  profilePicture?: string;
  profile_image?: string;
  nativeLanguage?: string;
  preferredLanguage: string; // e.g. 'en', 'ta', 'hi', 'es', 'fr', 'zh', 'ja', 'ar', 'de'
  languages?: string[];
  status?: string;
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  googleCalendarConnected: boolean;
  isOnline: boolean;
  is_online?: boolean;
  lastSeen: string;
  role: 'user' | 'translator_admin' | 'reviewer';
  token?: string;
  twoFactorEnabled?: boolean;
  two_factor_enabled?: boolean;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface RadarToken {
  token: string;
  language: string;
  confidence: number;
  isSwitchPoint: boolean;
}

export interface CodeSwitchRadarData {
  radarId: string;
  messageId: string;
  isCodeMixed: boolean;
  primaryLanguage: string;
  detectedLanguages: string[];
  tokens: RadarToken[];
  switchPoints: number;
  languageDistribution: Record<string, number>; // percentage e.g. { en: 60, ta: 40 }
  switchCount: number;
  complexityScore: number; // 0 - 100
}

export interface EchoResult {
  targetLanguage: string;
  translatedText: string; // source -> target
  backTranslatedText: string; // target -> source
  fidelityScore: number; // 0 - 100
  meaningLossNotes?: string;
  isConfirmed: boolean;
}

export interface PerceptionPreview {
  sentimentScore: number; // -1.0 to +1.0
  sentimentLabel: 'positive' | 'neutral' | 'negative';
  sentimentEmoji: string; // 🌸, 😐, ⚠️
  toneDetails: {
    politeness: number; // 0 - 100
    formality: number; // 0 - 100
    urgency: number; // 0 - 100
    emotionalNuance: string;
  };
}

export interface Message {
  messageId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId?: string; // for 1-on-1
  groupId?: string; // for group chat
  originalText: string;
  detectedLanguage: string;
  translatedText: string;
  targetLanguage: string;
  confidenceScore: number; // 0 - 100
  echoChecked: boolean;
  echoResult?: EchoResult;
  sentimentScore: number;
  sentimentLabel: 'positive' | 'neutral' | 'negative';
  sentimentEmoji: string;
  radarId?: string;
  radarData?: CodeSwitchRadarData;
  audioUrl?: string;
  isVoiceMessage?: boolean;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  translationStatus?: 'pending' | 'translated' | 'failed';
  translationError?: string;
  debtId?: string;
  highlightedWords?: Array<{
    word: string;
    translation: string;
    definition: string;
    phonetic?: string;
  }>;
}

export interface AuditTrailEntry {
  auditId: string;
  messageId: string;
  originalMessage: string;
  aiTranslation: string;
  sourceLanguage: string;
  targetLanguage: string;
  correctedTranslation?: string;
  correctionStatus: 'pending' | 'proposed' | 'approved' | 'rejected';
  proposedBy: string; // userId
  proposedByName: string;
  approvedBySender: boolean;
  approvedByReceiver: boolean;
  proposedAt: string;
  approvedAt?: string;
  addedToGlossary: boolean;
  notes?: string;
}

export type DebtCategory = 'quick_fix' | 'structural' | 'rewrite';
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface TranslationDebtItem {
  debtId: string;
  messageId: string;
  originalMessage: string;
  originalText?: string;
  aiTranslation: string;
  translatedText?: string;
  sourceLanguage: string;
  targetLanguage: string;
  debtScore: number; // 0 - 100 total debt score
  // Formula components
  confidenceDebt: number; // 30% weight
  correctionDebt: number; // 25% weight
  timeDebt: number; // 10% weight
  complexityDebt: number; // 15% weight
  auditApprovalDebt: number; // 20% weight
  debtCategory: DebtCategory;
  riskSeverity: RiskSeverity;
  remediationStatus: 'unassigned' | 'in_queue' | 'in_progress' | 'remediated' | 'dismissed';
  status?: string;
  suggestedFix?: string;
  timestamp?: string;
  assignedTo?: string; // userId
  assignedToName?: string;
  remediatedAt?: string;
  remediationNotes?: string;
  evaluatedBy: string;
  evaluatedAt: string;
}

export interface MeetingEvent {
  meetingId: string;
  title: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  organizerId: string;
  organizerName: string;
  participants: string[];
  targetLanguages: string[];
  roomLink: string;
  isSubtitled: boolean;
}

export interface DebtAnalytics {
  analyticsId: string;
  organizationId: string;
  periodStart: string;
  periodEnd: string;
  totalDebt: number;
  averageDebtScore: number;
  totalTranslationsEvaluated: number;
  debtByCategory: {
    quick_fix: number;
    structural: number;
    rewrite: number;
  };
  debtByLanguage: Record<string, number>;
  debtByRisk: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  remediationRate: number; // percentage e.g. 78%
  estimatedRemediationCostHours: number;
}

export interface SharedVocabEntry {
  vocabId: string;
  groupId: string;
  groupName: string;
  term: string;
  sourceLanguage: string;
  translatedTerm: string;
  targetLanguage: string;
  contextUsage: string;
  sourceAuditId?: string;
  proposedBy: string;
  proposedByName: string;
  approvedBy: string;
  correctionCount: number;
  lastUsedAt: string;
  tags: string[];
}

export interface LearningWord {
  wordId: string;
  userId: string;
  word: string;
  sourceLanguage: string;
  translation: string;
  targetLanguage: string;
  definition: string;
  phonetic: string;
  exampleSentence: string;
  masteryLevel: number; // 0 to 5
  nextReviewDate: string;
  timesReviewed: number;
  lastTestedAt: string;
}

export interface GroupChat {
  groupId: string;
  name: string;
  description: string;
  avatar: string;
  members: Array<{
    userId: string;
    username: string;
    preferredLanguage: string;
  }>;
  languages: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface AnalyticsSummary {
  totalMessagesSent: number;
  translationSuccessRate: number; // %
  correctionsSuggested: number;
  correctionsApproved: number;
  newWordsLearned: number;
  codeSwitchingIndex: number;
  totalDebtScore: number;
  activeLanguagePairsCount: number;
  messagesByLanguage: Record<string, number>;
}

export interface CalendarEvent {
  eventId: string;
  userId: string;
  googleEventId?: string;
  title: string;
  description: string;
  translatedTitle: string;
  translatedDescription: string;
  targetLanguage: string;
  startTime: string;
  endTime: string;
  timezone: string;
  attendees: Array<{
    email: string;
    name: string;
    language: string;
  }>;
  videoCallLink: string;
  meetingTranscriptId?: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
}

export interface VideoCallSession {
  callId: string;
  callType: '1-on-1' | 'group';
  groupId?: string;
  title: string;
  participants: Array<{
    userId: string;
    username: string;
    avatar: string;
    preferredLanguage: string;
    isMuted: boolean;
    isVideoOff: boolean;
    isScreenSharing: boolean;
  }>;
  initiatorId: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  status: 'connecting' | 'active' | 'ended';
  recordingUrl?: string;
  isRecording: boolean;
  liveSubtitles: Array<{
    id: string;
    speakerName: string;
    originalText: string;
    sourceLang: string;
    translatedText: string;
    targetLang: string;
    timestamp: string;
  }>;
}

export interface QualityGateRule {
  ruleId: string;
  name: string;
  condition: string;
  thresholdScore: number;
  action: 'flag_for_review' | 'auto_remediate' | 'block_send' | 'notify_admin';
  isActive: boolean;
}

export interface MTDatasetInfo {
  id: string;
  name: string;
  source: string;
  category: 'General' | 'Low-Resource' | 'Sentiment & Tone' | 'Code-Switching' | 'Domain-Specific' | 'Custom';
  languagePairs: string[];
  totalSamples: number;
  description: string;
  paperRef?: string;
  repoUrl?: string;
  sampleData: Array<{ source: string; target: string; srcLang: string; tgtLang: string }>;
}

export interface TrainingHyperparameters {
  epochs: number;
  batchSize: number;
  learningRate: number;
  optimizer: 'adamw' | 'adafactor' | 'sgd';
  loraRank: number;
  warmupSteps: number;
  weightDecay: number;
  evaluationStep: number;
  targetLoss: number;
  baseModel: string;
}

export interface TrainingEpochMetric {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  bleuScore: number;
  chrfScore: number;
  learningRate: number;
  tokensPerSec: number;
  elapsedSec: number;
}

export interface TrainingJob {
  jobId: string;
  datasetId: string;
  datasetName: string;
  sourceLang: string;
  targetLang: string;
  status: 'idle' | 'preparing' | 'training' | 'evaluating' | 'completed' | 'failed';
  currentEpoch: number;
  totalEpochs: number;
  currentStep: number;
  totalSteps: number;
  progressPercent: number;
  hyperparameters: TrainingHyperparameters;
  metrics: TrainingEpochMetric[];
  startTime: string;
  endTime?: string;
  finalBleuScore?: number;
  deployedModelId?: string;
  samplePredictions?: Array<{ source: string; target: string; predicted: string; bleu: number }>;
}

export interface TrainedModelCheckpoint {
  modelId: string;
  name: string;
  baseModel: string;
  datasetName: string;
  languagePair: string;
  bleuScore: number;
  trainedAt: string;
  epochsTrained: number;
  isDeployed: boolean;
  sizeMb: number;
}
