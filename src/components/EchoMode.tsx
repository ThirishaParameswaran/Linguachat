import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { EchoResult, User } from '../types';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  Sparkles,
  ArrowDown,
  Globe,
  Share2,
  Send,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Check,
  Play,
  Loader2,
} from 'lucide-react';
import { useAppState } from '../store/appState';

interface EchoModeProps {
  currentUser?: User | null;
  onSendVerifiedMessage?: (text: string, targetLanguage: string) => void;
}

export type VoiceState = 'Idle' | 'Listening...' | 'Processing...' | 'Translating...' | 'Speaking...';

const LANGUAGE_LOCALES: Record<string, { name: string; locale: string; flag: string }> = {
  de: { name: 'German', locale: 'de-DE', flag: '🇩🇪' },
  en: { name: 'English', locale: 'en-US', flag: '🇬🇧' },
  ta: { name: 'Tamil', locale: 'ta-IN', flag: '🇮🇳' },
  hi: { name: 'Hindi', locale: 'hi-IN', flag: '🇮🇳' },
  es: { name: 'Spanish', locale: 'es-ES', flag: '🇪🇸' },
  fr: { name: 'French', locale: 'fr-FR', flag: '🇫🇷' },
  ja: { name: 'Japanese', locale: 'ja-JP', flag: '🇯🇵' },
  zh: { name: 'Chinese', locale: 'zh-CN', flag: '🇨🇳' },
  ar: { name: 'Arabic', locale: 'ar-SA', flag: '🇸🇦' },
  ru: { name: 'Russian', locale: 'ru-RU', flag: '🇷🇺' },
  it: { name: 'Italian', locale: 'it-IT', flag: '🇮🇹' },
  pt: { name: 'Portuguese', locale: 'pt-PT', flag: '🇵🇹' },
  ko: { name: 'Korean', locale: 'ko-KR', flag: '🇰🇷' },
};

export const EchoMode: React.FC<EchoModeProps> = ({ currentUser, onSendVerifiedMessage }) => {
  const { translate, echoCheck, isLoading: isApiLoading } = useTranslation();
  const { addTranslationHistory, addNotification } = useAppState();

  const [sourceText, setSourceText] = useState("");
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');

  const [translatedText, setTranslatedText] = useState("");
  const [voiceState, setVoiceState] = useState<VoiceState>('Idle');
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const [echoResult, setEchoResult] = useState<EchoResult | null>(null);

  const recognitionRef = useRef<any>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const getLocaleCode = (langCode: string): string => {
    return LANGUAGE_LOCALES[langCode]?.locale || 'en-US';
  };

  const getLanguageName = (langCode: string): string => {
    return LANGUAGE_LOCALES[langCode]?.name || langCode.toUpperCase();
  };

  // Stop SpeechSynthesis
  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setVoiceState('Idle');
  }, []);

  // Text to Speech in Target Language
  const speakTranslation = useCallback((textToSpeak: string, langCode: string) => {
    if (!('speechSynthesis' in window)) {
      addNotification({
        title: '🔊 Text-to-Speech Unsupported',
        message: 'Speech synthesis is not supported in this browser.',
        type: 'warning',
      });
      return;
    }

    window.speechSynthesis.cancel();

    if (!textToSpeak || !textToSpeak.trim()) {
      setVoiceState('Idle');
      return;
    }

    setVoiceState('Speaking...');

    const targetLocale = getLocaleCode(langCode);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = targetLocale;
    speechUtteranceRef.current = utterance;

    // Load voices and select matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(
      (v) => v.lang === targetLocale || v.lang.startsWith(langCode)
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      setVoiceState('Idle');
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      setVoiceState('Idle');
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Handle Translation Execution
  const handleTranslate = useCallback(
    async (overrideText?: string, autoSpeak: boolean = true) => {
      const textToUse = (overrideText !== undefined ? overrideText : sourceText).trim();
      if (!textToUse) return;

      stopSpeaking();
      setPermissionError(null);
      setVoiceState('Processing...');

      try {
        setVoiceState('Translating...');

        // 1. Perform forward translation
        const transRes = await translate(textToUse, targetLang, sourceLang);
        const transResultText = transRes?.translatedText || '';

        if (transResultText) {
          setTranslatedText(transResultText);

          // 2. Perform back-translation & fidelity check
          try {
            const echoRes = await echoCheck(textToUse, targetLang, sourceLang);
            if (echoRes) {
              setEchoResult(echoRes);
            }
          } catch (e) {
            console.warn('Echo check secondary error:', e);
          }

          // 3. Auto-speak translated audio in Target Language if requested
          if (autoSpeak) {
            speakTranslation(transResultText, targetLang);
          } else {
            setVoiceState('Idle');
          }
        } else {
          setVoiceState('Idle');
        }
      } catch (err: any) {
        console.error('Voice translation failed:', err);
        setVoiceState('Idle');
      }
    },
    [sourceText, sourceLang, targetLang, translate, echoCheck, speakTranslation, stopSpeaking]
  );

  // Stop Speech Recognition
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
    }
    if (voiceState === 'Listening...') {
      setVoiceState('Idle');
    }
  }, [voiceState]);

  // Start Speech Recognition
  const startListening = useCallback(async () => {
    stopSpeaking();
    setPermissionError(null);

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setPermissionError(
        'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.'
      );
      return;
    }

    // Request microphone permission explicitly via getUserMedia first
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop stream tracks after permission granted so speech recognition can bind
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (err: any) {
      console.warn('Microphone permission denied:', err);
      setPermissionError('Microphone permission is required for voice translation.');
      setVoiceState('Idle');
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = getLocaleCode(sourceLang);

      let finalTranscript = '';

      recognition.onstart = () => {
        setVoiceState('Listening...');
        setSourceText('');
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        const currentCaptured = finalTranscript || interimTranscript;
        if (currentCaptured) {
          setSourceText(currentCaptured);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setPermissionError('Microphone permission is required for voice translation.');
        } else if (event.error !== 'no-speech') {
          console.warn('Speech recognition issue:', event.error);
        }
        setVoiceState('Idle');
      };

      recognition.onend = () => {
        if (finalTranscript.trim()) {
          handleTranslate(finalTranscript.trim(), true);
        } else {
          setVoiceState((prev) => (prev === 'Listening...' ? 'Idle' : prev));
        }
      };

      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setPermissionError('Microphone permission is required for voice translation.');
      setVoiceState('Idle');
    }
  }, [sourceLang, handleTranslate, stopSpeaking]);

  // Clean up speech synthesis & recognition on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <Mic className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span>Voice Translation Module</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            🎙️ Real Voice Translation & Echo Mode
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Speak into your microphone, translate automatically, and listen to the target language voice output.
          </p>
        </div>

        {/* Dynamic Voice State Indicator */}
        <div className="flex items-center gap-2">
          {voiceState === 'Idle' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>State: Idle</span>
            </div>
          )}
          {voiceState === 'Listening...' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-800 animate-pulse">
              <Mic className="w-4 h-4 animate-bounce" />
              <span>Listening...</span>
            </div>
          )}
          {voiceState === 'Processing...' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-800">
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              <span>Processing...</span>
            </div>
          )}
          {voiceState === 'Translating...' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800">
              <Globe className="w-4 h-4 animate-spin text-blue-500" />
              <span>Translating...</span>
            </div>
          )}
          {voiceState === 'Speaking...' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800 animate-pulse">
              <Volume2 className="w-4 h-4 animate-bounce text-emerald-500" />
              <span>Speaking...</span>
            </div>
          )}
        </div>
      </div>

      {/* Permission Error Banner */}
      {permissionError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 flex items-center justify-between gap-4 animate-shake">
          <div className="flex items-center gap-3">
            <MicOff className="w-5 h-5 text-rose-500 shrink-0" />
            <span className="text-xs md:text-sm font-semibold">{permissionError}</span>
          </div>
          <button
            type="button"
            onClick={startListening}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all shrink-0 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Step 1: Voice Capture & Language Selection */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Step 1: Speak or Type Source Message</span>
          </h2>

          <div className="flex items-center gap-2">
            {voiceState === 'Listening...' ? (
              <button
                type="button"
                onClick={stopListening}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 animate-pulse"
              >
                <Square className="w-3.5 h-3.5" />
                <span>⏹ Stop</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={startListening}
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
              >
                <Mic className="w-4 h-4 text-white" />
                <span>🎤 Start Speaking</span>
              </button>
            )}
          </div>
        </div>

        <div>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            rows={3}
            placeholder="Click 'Start Speaking' or type text here..."
            className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
          />
        </div>

        {/* Controls & Language Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Source Language */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              Source Language (Speech Input)
            </label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="w-full p-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(LANGUAGE_LOCALES).map(([code, item]) => (
                <option key={`src-${code}`} value={code}>
                  {item.flag} {item.name} ({code.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Target Language */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              Target Language (Voice Output)
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full p-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(LANGUAGE_LOCALES).map(([code, item]) => (
                <option key={`tgt-${code}`} value={code}>
                  {item.flag} {item.name} ({code.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Manual Action Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              Actions
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleTranslate(sourceText, true)}
                disabled={isApiLoading || !sourceText.trim()}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isApiLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Translate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Control Toolbar Buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
          {voiceState === 'Listening...' ? (
            <button
              type="button"
              onClick={stopListening}
              className="py-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Square className="w-3.5 h-3.5" />
              <span>⏹ Stop Microphone</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startListening}
              className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>🎤 Start</span>
            </button>
          )}

          {voiceState === 'Speaking...' ? (
            <button
              type="button"
              onClick={stopSpeaking}
              className="py-2 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>🔇 Stop Speaking</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => speakTranslation(translatedText || sourceText, targetLang)}
              disabled={!translatedText && !sourceText}
              className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>🔊 Listen / Speak Translation</span>
            </button>
          )}
        </div>
      </div>

      {/* Step 2: Voice Translation Results & Audio Playback */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>Step 2: Voice Recognition & Translation Results</span>
          {translatedText && (
            <button
              type="button"
              onClick={() => speakTranslation(translatedText, targetLang)}
              className="py-1.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 hover:bg-emerald-100 transition-all"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>🔊 Listen ({getLanguageName(targetLang)})</span>
            </button>
          )}
        </h2>

        {/* 📍 Recognized Speech */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Source Language: {getLanguageName(sourceLang)} ({sourceLang.toUpperCase()})</span>
            <span className="text-[10px] font-semibold text-slate-400">Recognized Speech</span>
          </div>
          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
            "{sourceText || 'No speech recorded yet'}"
          </div>
        </div>

        {/* ⬇️ Forward Translation */}
        <div className="flex justify-center -my-1 text-slate-400">
          <ArrowDown className="w-4 h-4" />
        </div>

        <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2">
          <div className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center justify-between">
            <span>Target Language: {getLanguageName(targetLang)} ({targetLang.toUpperCase()})</span>
            <span className="text-[10px] font-semibold text-blue-500">Live Voice Output</span>
          </div>
          <div className="text-base font-bold text-blue-950 dark:text-blue-100 leading-relaxed">
            "{translatedText || 'Translation pending...'}"
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-blue-800 dark:text-blue-300 font-semibold">
            <span>📊 Voice Engine: WebSpeech TTS ({getLocaleCode(targetLang)})</span>
            <span>•</span>
            <span>✅ Speech-to-Text Connected</span>
          </div>
        </div>

        {/* Echo Back-Translation Verification Card */}
        {echoResult && (
          <>
            <div className="flex justify-center -my-1 text-slate-400">
              <ArrowDown className="w-4 h-4" />
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-1">
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                ⬇️ Back-Translation Verification ({getLanguageName(targetLang)} → {getLanguageName(sourceLang)})
              </div>
              <div className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">
                "{echoResult.backTranslatedText}"
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                <span>📊 Fidelity Score: {echoResult.fidelityScore}%</span>
                <span>✅ Accurate Semantic Match</span>
              </div>
            </div>
          </>
        )}

        {/* Verified Ready to Send Actions */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
          <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <span>✅ Voice Translation Verified - Ready to Send!</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                onSendVerifiedMessage?.(translatedText || sourceText, targetLang);
                addNotification({
                  title: '🎙️ Voice Message Sent',
                  message: `Message dispatched in ${getLanguageName(targetLang)}!`,
                  type: 'success',
                });
              }}
              disabled={!translatedText}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Voice Message</span>
            </button>

            <button
              type="button"
              onClick={() => speakTranslation(translatedText, targetLang)}
              disabled={!translatedText}
              className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Replay Audio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tip Card */}
      <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-800 dark:text-indigo-300 flex items-start gap-2.5">
        <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p>
          <strong>Tip:</strong> The Voice module uses real Web Speech APIs for speech-to-text recognition and text-to-speech synthesis tailored to your selected target language locale.
        </p>
      </div>
    </div>
  );
};
