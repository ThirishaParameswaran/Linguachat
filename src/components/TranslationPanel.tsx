import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { ButtonValidator } from './ButtonValidator';
import {
  Globe,
  ArrowRightLeft,
  Copy,
  Check,
  Volume2,
  Sparkles,
  BookOpen,
  History,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { useAppState } from '../store/appState';

export const TranslationPanel: React.FC = () => {
  const {
    sourceLanguage,
    targetLanguage,
    currentTranslation,
    isLoading,
    error,
    setSourceLanguage,
    setTargetLanguage,
    translate,
  } = useTranslation();

  const { translationHistory, clearTranslationHistory } = useAppState();

  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSwapLanguages = () => {
    const currentSource = sourceLanguage === 'auto' ? (currentTranslation.detectedLang || 'en') : sourceLanguage;
    const prevSource = currentSource;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(prevSource);
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    await translate(inputText, targetLanguage, sourceLanguage);
  };

  const handleCopy = () => {
    if (currentTranslation.translated) {
      navigator.clipboard.writeText(currentTranslation.translated);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSpeechLocale = (langCode: string): string => {
    const map: Record<string, string> = {
      hi: 'hi-IN',
      ta: 'ta-IN',
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      ja: 'ja-JP',
      zh: 'zh-CN',
      ar: 'ar-SA',
    };
    return map[langCode] || langCode;
  };

  const handleSpeak = (text: string, lang: string) => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = getSpeechLocale(lang);
      window.speechSynthesis.speak(utt);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>AI Translation Workbench</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Universal Multilingual Translation
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Powered by Gemini AI neural machine translation with terminology extraction & semantic alignment.
          </p>
        </div>
      </div>

      {/* Main Translation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Text Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Source Text
              </span>

              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="auto">Auto Detect</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="ta">Tamil</option>
                <option value="hi">Hindi</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ar">Arabic</option>
              </select>
            </div>

            {/* Input Textarea */}
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text, paragraph, or phrase to translate..."
              rows={6}
              className="w-full bg-transparent text-sm md:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Bottom Action bar */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Speak source"
                onClick={() => handleSpeak(inputText, sourceLanguage === 'auto' ? 'en' : sourceLanguage)}
                disabled={!inputText}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-400 font-mono">
                {inputText.length} chars
              </span>
            </div>

            <ButtonValidator
              variant="primary"
              size="md"
              isLoading={isLoading}
              disabled={!inputText.trim()}
              onClick={handleTranslate}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Translate
            </ButtonValidator>
          </div>
        </div>

        {/* Target Translation Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Target Translation
                </span>
                {currentTranslation.confidence > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    {currentTranslation.confidence}%
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSwapLanguages}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                  title="Swap languages"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </button>

                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="es">Spanish</option>
                  <option value="en">English</option>
                  <option value="ta">Tamil</option>
                  <option value="hi">Hindi</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                  <option value="ja">Japanese</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>
            </div>

            {/* Translation Output */}
            <div className="min-h-[140px] text-sm md:text-base text-slate-900 dark:text-slate-100 leading-relaxed">
              {isLoading ? (
                <p className="text-slate-400 italic animate-pulse">Translating...</p>
              ) : error ? (
                <p className="text-rose-500 font-medium">{error}</p>
              ) : currentTranslation.translated ? (
                <p className="whitespace-pre-wrap">{currentTranslation.translated}</p>
              ) : (
                <p className="text-slate-400 italic">
                  Translation will appear here in real-time...
                </p>
              )}
            </div>

            {/* Extracted Key Terms */}
            {currentTranslation.keyTerms && currentTranslation.keyTerms.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                  <BookOpen className="w-3 h-3" /> Extracted Key Vocabulary
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentTranslation.keyTerms.map((term, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-xs"
                    >
                      <div className="font-bold text-blue-700 dark:text-blue-300">
                        {term.word} <span className="font-normal text-slate-500">→ {term.translation}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        {term.definition}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Speak translation"
                onClick={() => handleSpeak(currentTranslation.translated, targetLanguage)}
                disabled={!currentTranslation.translated}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <ButtonValidator
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!currentTranslation.translated}
              icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </ButtonValidator>
          </div>
        </div>
      </div>

      {/* Translation History Section */}
      {translationHistory.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <span>Recent Translation Sessions</span>
            </h3>
            <button
              type="button"
              onClick={clearTranslationHistory}
              className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-semibold"
            >
              <Trash2 className="w-3 h-3" /> Clear History
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-60 overflow-y-auto">
            {translationHistory.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                    {item.sourceText}
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 truncate mt-0.5">
                    {item.translatedText}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-[10px] text-slate-400">
                  <span className="uppercase font-bold">
                    {item.sourceLang} → {item.targetLang}
                  </span>
                  <span>{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
