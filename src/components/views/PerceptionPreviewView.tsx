import React, { useState } from 'react';
import { User, PerceptionPreview } from '../../types';
import { requestPerceptionAnalysis } from '../../services/api';
import { Sparkles, Smile, Meh, AlertTriangle, ShieldAlert, Languages, RefreshCw, BarChart2 } from 'lucide-react';

interface PerceptionPreviewViewProps {
  currentUser: User;
}

export const PerceptionPreviewView: React.FC<PerceptionPreviewViewProps> = ({ currentUser }) => {
  const [sampleText, setSampleText] = useState(
    'Please note that backend API response time is excellent and we can push to production today without delay.'
  );
  const [targetLang, setTargetLang] = useState('en');
  const [perception, setPerception] = useState<PerceptionPreview | null>({
    sentimentScore: 0.85,
    sentimentLabel: 'positive',
    sentimentEmoji: '🌸',
    toneDetails: {
      politeness: 92,
      formality: 78,
      urgency: 40,
      emotionalNuance: 'Enthusiastic and respectful professional alignment.',
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!sampleText.trim()) return;
    setIsLoading(true);
    const res = await requestPerceptionAnalysis(sampleText, targetLang);
    setPerception(res);
    setIsLoading(false);
  };

  const getSentimentColor = (label: string) => {
    if (label === 'positive') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (label === 'neutral') return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-slate-200">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-lg">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Perception Preview & Sentiment Analyzer
          </div>
          <p className="text-xs text-slate-300">
            Detect emotional nuance, tone shifts, politeness indices, and potential cultural misinterpretations before sending.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-2 shrink-0">
          <BarChart2 className="w-4 h-4" /> Real-time Sentiment
        </div>
      </div>

      {/* Input Form */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <label className="text-xs font-bold text-white flex items-center gap-2">
            <Languages className="w-4 h-4 text-purple-400" /> Test Message Sentiment
          </label>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Target Language:</span>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="en">English (US)</option>
              <option value="ta">Tamil (தமிழ்)</option>
              <option value="hi">Hindi (हिंदी)</option>
              <option value="es">Spanish (Español)</option>
              <option value="ja">Japanese (日本語)</option>
            </select>
          </div>
        </div>

        <textarea
          rows={3}
          value={sampleText}
          onChange={(e) => setSampleText(e.target.value)}
          className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
        />

        <button
          onClick={handleAnalyze}
          disabled={isLoading || !sampleText.trim()}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-lg shadow-purple-600/30 flex items-center gap-2"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Analyze Sentiment & Emotional Tone</span>
        </button>
      </div>

      {/* Analysis Output */}
      {perception && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> Emotional Perception Breakdown
            </h3>

            <div className={`px-3 py-1 rounded-full border text-xs font-bold ${getSentimentColor(perception.sentimentLabel || 'neutral')}`}>
              {perception.sentimentEmoji || '✨'} {(perception.sentimentLabel || 'neutral').toUpperCase()} ({Math.round((perception.sentimentScore || 0) * 100)}%)
            </div>
          </div>

          {/* Tone Meters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Meter 1: Politeness */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Politeness Index</span>
                <span className="text-purple-300 font-bold">{perception.toneDetails.politeness}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full transition-all"
                  style={{ width: `${perception.toneDetails.politeness}%` }}
                />
              </div>
            </div>

            {/* Meter 2: Formality */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Formality Level</span>
                <span className="text-indigo-300 font-bold">{perception.toneDetails.formality}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full transition-all"
                  style={{ width: `${perception.toneDetails.formality}%` }}
                />
              </div>
            </div>

            {/* Meter 3: Urgency */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Urgency Rating</span>
                <span className="text-amber-300 font-bold">{perception.toneDetails.urgency}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all"
                  style={{ width: `${perception.toneDetails.urgency}%` }}
                />
              </div>
            </div>
          </div>

          {/* Emotional Nuance Box */}
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
            <span className="text-[10px] text-purple-300 uppercase font-bold tracking-wider">Emotional Nuance Summary</span>
            <p className="text-purple-100 font-medium">{perception.toneDetails.emotionalNuance}</p>
          </div>
        </div>
      )}
    </div>
  );
};
