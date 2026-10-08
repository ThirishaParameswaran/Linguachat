import React, { useState } from 'react';
import { User, EchoResult } from '../../types';
import { requestEchoCheck } from '../../services/api';
import { Repeat, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Languages, AlertTriangle, RefreshCw } from 'lucide-react';

interface EchoModePanelProps {
  currentUser: User;
}

export const EchoModePanel: React.FC<EchoModePanelProps> = ({ currentUser }) => {
  const [inputText, setInputText] = useState(
    'வணக்கம் நண்பர்களே, deploy process ready-யா இருக்கு. Any blockers for sprint release?'
  );
  const [targetLang, setTargetLang] = useState('en');
  const [echoResult, setEchoResult] = useState<EchoResult | null>({
    targetLanguage: 'en',
    translatedText: 'Hello friends, the deployment process is ready. Any blockers for sprint release?',
    backTranslatedText: 'வணக்கம் நண்பர்களே, வரிசைப்படுத்தல் செயல்முறை தயார். ஸ்ப்ரின்ட் வெளியீட்டிற்கு ஏதேனும் தடைகள் உள்ளதா?',
    fidelityScore: 94,
    meaningLossNotes: 'High semantic alignment preserved. Technical terms matched.',
    isConfirmed: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRunEcho = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    const res = await requestEchoCheck(inputText, targetLang, currentUser.preferredLanguage);
    setEchoResult(res);
    setIsLoading(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-slate-200">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-500/30 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-lg">
            <Repeat className="w-6 h-6" />
            Echo Mode Verification Studio
          </div>
          <p className="text-xs text-slate-300">
            Prevent translation drift by translating your message to the target language and back to source before sending.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 shrink-0">
          <ShieldCheck className="w-4 h-4" /> Zero Drift Enforcement
        </div>
      </div>

      {/* Input controls */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <label className="text-xs font-bold text-white flex items-center gap-2">
            <Languages className="w-4 h-4 text-indigo-400" /> Enter Message for Echo Validation
          </label>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Target Language:</span>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="en">English (US)</option>
              <option value="ta">Tamil (தமிழ்)</option>
              <option value="hi">Hindi (हिंदी)</option>
              <option value="es">Spanish (Español)</option>
              <option value="ja">Japanese (日本語)</option>
              <option value="fr">French (Français)</option>
            </select>
          </div>
        </div>

        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type message in Tamil, Hindi, English, Spanish, Japanese..."
          className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
        />

        <button
          onClick={handleRunEcho}
          disabled={isLoading || !inputText.trim()}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-lg shadow-indigo-600/30 flex items-center gap-2"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Repeat className="w-4 h-4" />
          )}
          <span>Run Echo Back-Translation Loop</span>
        </button>
      </div>

      {/* Echo Side-by-Side Results */}
      {echoResult && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Back-Translation Comparison Results
            </h3>

            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold text-xs">
              <span>Semantic Fidelity Score:</span>
              <span className="text-base text-indigo-200">{echoResult.fidelityScore}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Box 1: Original */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step 1: Original Input</div>
              <p className="text-xs text-slate-200 leading-relaxed font-mono">{inputText}</p>
            </div>

            {/* Box 2: Target Translation */}
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-2">
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <ArrowRight className="w-3 h-3" /> Step 2: Target ({(echoResult.targetLanguage || 'es').toUpperCase()})
              </div>
              <p className="text-xs text-white font-semibold leading-relaxed font-mono">{echoResult.translatedText}</p>
            </div>

            {/* Box 3: Back Translation */}
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Step 3: Back-Translation
              </div>
              <p className="text-xs text-emerald-200 leading-relaxed font-mono">{echoResult.backTranslatedText}</p>
            </div>
          </div>

          {/* Meaning Loss Notes */}
          <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs text-indigo-200 flex items-center gap-2">
            <InfoIcon className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{echoResult.meaningLossNotes || 'No significant loss of meaning detected.'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
