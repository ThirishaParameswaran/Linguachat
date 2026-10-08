import React, { useState } from 'react';
import { Message, User } from '../../types';
import { useAppState } from '../../store/appState';
import {
  Globe,
  Volume2,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  CheckCheck,
} from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  currentUser?: User | null;
  onOpenAudit?: (message: Message) => void;
  onOpenRadar?: (message: Message) => void;
  onLearnWord?: (term: { word: string; translation: string; definition: string; phonetic?: string }) => void;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  ta: 'Tamil',
  hi: 'Hindi',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  ja: 'Japanese',
  zh: 'Mandarin',
  ar: 'Arabic',
  ko: 'Korean',
  ru: 'Russian',
  it: 'Italian',
  pt: 'Portuguese',
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMe,
  currentUser,
  onOpenAudit,
  onOpenRadar,
  onLearnWord,
}) => {
  const { addDebtItem } = useAppState();
  const [copied, setCopied] = useState(false);
  const [flagged, setFlagged] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang || 'en';
      window.speechSynthesis.speak(utterance);
    }
  };

  const formattedTime = (() => {
    if (!message.timestamp) return 'Just now';
    const d = new Date(message.timestamp);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return message.timestamp;
  })();

  const isFailed = message.translationStatus === 'failed' || message.status === 'failed' || Boolean(message.translationError);
  const confidence = isFailed ? 0 : (message.confidenceScore || 90);
  const isAccurate = confidence >= 95;

  const dynamicSenderName = isMe
    ? `${currentUser?.username || (message.senderName && message.senderName !== 'Alex' ? message.senderName : 'You')} (You)`
    : message.senderName || 'Contact';

  const targetLangLabel = LANGUAGE_NAMES[message.targetLanguage?.toLowerCase()] || (message.targetLanguage ? message.targetLanguage.toUpperCase() : 'Tamil');

  return (
    <div className={`flex flex-col my-3.5 max-w-2xl ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
      {/* Message Card Container (as specified in Wireframe) */}
      <div
        className={`w-full p-4 rounded-2xl border transition-all shadow-xs space-y-2.5 ${
          isMe
            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
        }`}
      >
        {/* Header: Sender Name & Original text */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <span>👤</span>
            <span>{dynamicSenderName}</span>
            <span className="text-[10px] font-normal text-slate-400">
              ({(message.detectedLanguage || 'en').toUpperCase()})
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-0.5">
              <span>🕐</span>
              <span>{formattedTime}</span>
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-0.5">
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Read</span>
            </span>
          </div>
        </div>

        {/* Primary Message Content (Original) */}
        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed space-y-2">
          {message.originalText.includes('![Image Attachment](') || message.originalText.includes('![Audio Attachment](') || message.originalText.includes('🎙️ [Voice Note') ? (
            <div className="space-y-2">
              {message.originalText.split('\n').map((line, idx) => {
                if (line.startsWith('![Image Attachment](')) {
                  const imgUrl = line.replace('![Image Attachment](', '').slice(0, -1);
                  return (
                    <div key={idx} className="my-1 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-sm">
                      <img
                        src={imgUrl}
                        alt="Attached Upload"
                        className="w-full max-h-64 object-cover hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => window.open(imgUrl, '_blank')}
                      />
                    </div>
                  );
                }
                if (line.startsWith('![Audio Attachment](')) {
                  const audioUrl = line.replace('![Audio Attachment](', '').slice(0, -1);
                  return (
                    <div key={idx} className="my-2 p-3 bg-blue-100/70 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-2xl flex flex-col gap-2 max-w-xs">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
                        <Volume2 className="w-4 h-4 text-blue-600 animate-pulse" />
                        <span>Voice Recording Playback</span>
                      </div>
                      <audio controls src={audioUrl} className="w-full h-8 rounded-lg" />
                    </div>
                  );
                }
                return line ? <p key={idx}>{line}</p> : null;
              })}
            </div>
          ) : (
            <span>{message.originalText}</span>
          )}
        </div>

        {/* Translation Banner OR Error Banner */}
        {isFailed ? (
          <div className="p-2.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-400 font-medium flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{message.translationError || 'Translation unavailable. Please try again.'}</span>
            </div>
          </div>
        ) : message.translatedText ? (
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                <span>🔄</span>
                <span>
                  {targetLangLabel}:
                </span>
              </span>
              <button
                type="button"
                onClick={() => handleSpeak(message.translatedText || '', message.targetLanguage || 'ta')}
                className="hover:text-blue-600 transition-colors p-1"
                title="Hear translation"
              >
                <Volume2 className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600" />
              </button>
            </div>
            <div className="text-slate-800 dark:text-slate-200 font-medium italic">
              "{message.translatedText}"
            </div>
          </div>
        ) : null}

        {/* Confidence & Quality Status Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            {isFailed ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">
                <AlertTriangle className="w-3 h-3" />
                <span>Translation Failed</span>
              </span>
            ) : (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold ${
                  isAccurate
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
                }`}
              >
                <span>📊</span>
                <span>Confidence: {confidence}%</span>
                <span>{isAccurate ? '✅ Accurate' : '⚠️ Needs Review'}</span>
              </span>
            )}
          </div>

          {/* Action Triggers: Suggest Correction / Conversation Ledger Flag */}
          <div className="flex items-center gap-2 text-xs">
            {onOpenAudit && (
              <button
                type="button"
                onClick={() => onOpenAudit(message)}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Lightbulb className="w-3 h-3" />
                <span>Suggest Correction</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const nextState = !flagged;
                setFlagged(nextState);
                if (nextState) {
                  addDebtItem({
                    debtId: 'debt_' + Date.now(),
                    messageId: message.messageId,
                    originalMessage: message.originalText,
                    originalText: message.originalText,
                    aiTranslation: message.translatedText || message.originalText,
                    translatedText: message.translatedText || '',
                    sourceLanguage: message.detectedLanguage || 'en',
                    targetLanguage: message.targetLanguage || 'ta',
                    debtScore: 45,
                    confidenceDebt: 15,
                    correctionDebt: 10,
                    timeDebt: 5,
                    complexityDebt: 5,
                    auditApprovalDebt: 10,
                    debtCategory: 'quick_fix',
                    riskSeverity: 'medium',
                    status: 'pending',
                    remediationStatus: 'in_queue',
                    evaluatedBy: 'system',
                    evaluatedAt: new Date().toISOString(),
                  });
                }
              }}
              className={`text-[11px] font-semibold transition-colors ${
                flagged ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-amber-600'
              }`}
            >
              <span>{flagged ? 'Flagged in Conversation Ledger' : 'Flag in Conversation Ledger'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
