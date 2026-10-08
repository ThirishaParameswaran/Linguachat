import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { PerceptionPreview, User } from '../types';
import { useAppState } from '../store/appState';
import {
  Sparkles,
  Heart,
  Smile,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Lightbulb,
  ArrowRight,
  Globe,
  Sliders,
} from 'lucide-react';

interface PerceptionAnalysisProps {
  currentUser?: User | null;
}

export const PerceptionAnalysis: React.FC<PerceptionAnalysisProps> = () => {
  const { addNotification } = useAppState();
  const { analyzePerception, isLoading } = useTranslation();
  const [inputText, setInputText] = useState(
    'I think we should reconsider this decision'
  );
  const [targetCulture, setTargetCulture] = useState('Indian');
  const [targetLang, setTargetLang] = useState('ta');
  const [contextType, setContextType] = useState('Professional');
  const [copied, setCopied] = useState(false);
  const [perceptionResult, setPerceptionResult] = useState<PerceptionPreview | null>({
    sentimentScore: 0.8,
    sentimentLabel: 'positive',
    sentimentEmoji: '🌸',
    toneDetails: {
      politeness: 78,
      formality: 75,
      urgency: 25,
      emotionalNuance: 'Constructive professional tone.',
    },
  });

  const improvedText =
    "I'd like to discuss this decision and hear your thoughts on alternative approaches that might work better.";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    const result = await analyzePerception(inputText, targetLang);
    if (result) {
      setPerceptionResult(result);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span>Cross-Cultural Sentiment & Tone Intelligence</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            🎯 Perception Preview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            📝 Preview how your message might be perceived across cultures before sending
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-xs font-bold border border-pink-200 dark:border-pink-800">
          <CheckCircle2 className="w-4 h-4" />
          <span>Active ✅</span>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
          Type your message here...
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={3}
          placeholder="Type your message here..."
          className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Target Culture */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              Target Culture
            </label>
            <select
              value={targetCulture}
              onChange={(e) => setTargetCulture(e.target.value)}
              className="w-full p-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="Indian">🇮🇳 Indian ▼</option>
              <option value="Japanese">🇯🇵 Japanese ▼</option>
              <option value="German">🇩🇪 German ▼</option>
              <option value="American">🇺🇸 American ▼</option>
              <option value="Spanish">🇪🇸 Spanish ▼</option>
            </select>
          </div>

          {/* Target Language */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              Target Language
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full p-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="ta">🇮🇳 Tamil ▼</option>
              <option value="en">🇺🇸 English ▼</option>
              <option value="ja">🇯🇵 Japanese ▼</option>
              <option value="es">🇪🇸 Spanish ▼</option>
              <option value="de">🇩🇪 German ▼</option>
            </select>
          </div>

          {/* Context Type */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              Context Type
            </label>
            <select
              value={contextType}
              onChange={(e) => setContextType(e.target.value)}
              className="w-full p-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="Professional">Professional</option>
              <option value="Casual">Casual / Social</option>
              <option value="Negotiation">Negotiation</option>
            </select>
          </div>
        </div>

        {/* Action Buttons: [Analyze Message] [Clear] [Save Template] */}
        <div className="pt-2 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isLoading || !inputText.trim()}
            className="py-2.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white font-bold text-xs shadow-sm shadow-pink-500/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analyze Message</span>
          </button>

          <button
            type="button"
            onClick={() => setInputText('')}
            className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={() =>
              addNotification({
                title: '💾 Template Saved',
                message: 'Message template saved to perception library.',
                type: 'success',
              })
            }
            className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
          >
            Save Template
          </button>
        </div>
      </div>

      {/* 📊 Message Analysis Results */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          📊 Message Analysis Results
        </h2>

        {/* 😊 Sentiment Analysis Bars */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span>😊</span>
            <span>Sentiment Analysis</span>
          </h3>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                <span>Positive</span>
                <span>25%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                <span>Neutral</span>
                <span>65%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                <span>Negative</span>
                <span>10%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '10%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* 🎭 Emotional Tone & Scores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              🎭 Emotional Tone
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold">
                <div>😊 Friendly</div>
                <div className="text-sm font-bold mt-1">40%</div>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 font-semibold">
                <div>😌 Neutral</div>
                <div className="text-sm font-bold mt-1">35%</div>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-semibold">
                <div>😕 Critical</div>
                <div className="text-sm font-bold mt-1">25%</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 justify-center flex flex-col">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">⚖️ Politeness Score:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">78/100 (Professional & Courteous)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">🎯 Clarity Score:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">85/100 (Clear and understandable)</span>
            </div>
          </div>
        </div>

        {/* 💬 Context Suggestions */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">
            💬 Context Suggestions
          </h3>
          <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
            <li>📌 Adding "I'd like to hear your thoughts" softens the message</li>
            <li>📌 Consider using "maybe" to make it more collaborative</li>
            <li>📌 The message might be perceived as direct in high-context cultures. Consider softening tone.</li>
          </ul>
        </div>

        {/* 🌍 Cultural Adaptability */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">
            🌍 Cultural Adaptability
          </h3>
          <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
            <li>• High context culture detected (Indirect communication)</li>
            <li>• Message is culturally appropriate for professional setting</li>
            <li>• Consider adding relationship-building opening</li>
            <li>• Suggestion: "Hope you're having a good day! I was thinking..."</li>
          </ul>
        </div>
      </div>

      {/* 📎 Suggested Improvements Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>📎</span>
          <span>Suggested Improvements</span>
        </h2>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
          <div className="text-slate-500">Original: "{inputText}"</div>
          <div className="text-emerald-800 dark:text-emerald-300 font-bold text-sm">
            Improved: "{improvedText}"
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>📊 Impact: <strong className="text-emerald-600">40% more collaborative tone</strong></span>
            <span>•</span>
            <span>🎯 Clarity: <strong className="text-blue-600">Improved by 15%</strong></span>
            <span>•</span>
            <span>😊 Tone: <strong className="text-pink-600">More inclusive & respectful</strong></span>
          </div>

          {/* Actions: [Apply Suggestion] [Modify] [Discard] [Copy] */}
          <div className="pt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setInputText(improvedText)}
              className="py-1.5 px-3.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Apply Suggestion
            </button>
            <button
              type="button"
              onClick={() => setInputText(improvedText + ' ')}
              className="py-1.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs"
            >
              Modify
            </button>
            <button
              type="button"
              onClick={() =>
                addNotification({
                  title: '🗑️ Suggestion Discarded',
                  message: 'Tone suggestion removed.',
                  type: 'info',
                })
              }
              className="py-1.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={() => handleCopy(improvedText)}
              className="py-1.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tip Box */}
      <div className="p-4 rounded-2xl bg-pink-50/60 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/50 text-xs text-pink-800 dark:text-pink-300 flex items-start gap-2.5">
        <Lightbulb className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
        <p>
          <strong>Tip:</strong> Perception Preview helps you communicate more effectively across cultures and avoid misunderstandings by aligning emotional tone with local cultural norms.
        </p>
      </div>
    </div>
  );
};
