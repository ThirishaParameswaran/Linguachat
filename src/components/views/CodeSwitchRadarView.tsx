import React, { useState } from 'react';
import { User, CodeSwitchRadarData } from '../../types';
import { requestCodeSwitchRadar } from '../../services/api';
import { Activity, Sparkles, RefreshCw, BarChart2, Zap, ArrowRightLeft } from 'lucide-react';

interface CodeSwitchRadarViewProps {
  currentUser: User;
}

export const CodeSwitchRadarView: React.FC<CodeSwitchRadarViewProps> = () => {
  const [inputText, setInputText] = useState(
    'வணக்கம் நண்பர்களே, deploy process ready-யா இருக்கு. Any blockers for sprint release?'
  );
  const [radar, setRadar] = useState<CodeSwitchRadarData | null>({
    radarId: 'rad_101',
    messageId: 'msg_sample',
    isCodeMixed: true,
    primaryLanguage: 'ta',
    detectedLanguages: ['ta', 'en'],
    tokens: [
      { token: 'வணக்கம்', language: 'ta', confidence: 0.99, isSwitchPoint: false },
      { token: 'நண்பர்களே,', language: 'ta', confidence: 0.98, isSwitchPoint: false },
      { token: 'deploy', language: 'en', confidence: 0.95, isSwitchPoint: true },
      { token: 'process', language: 'en', confidence: 0.95, isSwitchPoint: false },
      { token: 'ready-யா', language: 'ta', confidence: 0.82, isSwitchPoint: true },
      { token: 'இருக்கு.', language: 'ta', confidence: 0.99, isSwitchPoint: false },
      { token: 'Any', language: 'en', confidence: 0.99, isSwitchPoint: true },
      { token: 'blockers', language: 'en', confidence: 0.99, isSwitchPoint: false },
      { token: 'for', language: 'en', confidence: 0.99, isSwitchPoint: false },
      { token: 'sprint', language: 'en', confidence: 0.99, isSwitchPoint: false },
      { token: 'release?', language: 'en', confidence: 0.99, isSwitchPoint: false },
    ],
    switchPoints: 3,
    languageDistribution: { ta: 55, en: 45 },
    switchCount: 3,
    complexityScore: 68,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyzeRadar = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    const res = await requestCodeSwitchRadar(inputText, 'msg_custom_' + Date.now());
    setRadar(res);
    setIsLoading(false);
  };

  const getLangBadgeColor = (lang: string) => {
    if (lang === 'ta') return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (lang === 'hi') return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    if (lang === 'es') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (lang === 'ja') return 'bg-pink-500/20 text-pink-300 border-pink-500/40';
    return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-slate-200">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-lg">
            <Activity className="w-6 h-6 text-purple-400" />
            Code-Switch Radar & Token Language Visualizer
          </div>
          <p className="text-xs text-slate-300">
            High-frequency token-level language switching detector and complexity scorer for code-mixed multilingual text.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-2 shrink-0">
          <Zap className="w-4 h-4" /> &lt; 1ms Radar Latency
        </div>
      </div>

      {/* Input Box */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <label className="text-xs font-bold text-white flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-purple-400" /> Input Code-Mixed Text (e.g., Tanglish, Hinglish, Spanglish)
        </label>
        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={handleAnalyzeRadar}
          disabled={isLoading || !inputText.trim()}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-lg shadow-purple-600/30 flex items-center gap-2"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
          <span>Run Token Level Radar Scan</span>
        </button>
      </div>

      {/* Radar Visualizer Output */}
      {radar && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          {/* Summary metrics header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-purple-400 uppercase">Radar ID: {radar.radarId}</span>
              <h3 className="text-sm font-bold text-white">Token Language Composition</h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Switch Points</div>
                <div className="text-base font-bold text-purple-300">{radar.switchPoints}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Complexity Score</div>
                <div className="text-base font-bold text-indigo-300">{radar.complexityScore} / 100</div>
              </div>
            </div>
          </div>

          {/* Token Visualizer Chips */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300">Token-by-Token Language Map:</span>
            <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-slate-950 border border-slate-800">
              {radar.tokens.map((tok, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs transition-all ${getLangBadgeColor(
                    tok.language
                  )} ${tok.isSwitchPoint ? 'ring-2 ring-purple-400 animate-pulse' : ''}`}
                >
                  <span className="font-semibold">{tok.token}</span>
                  <span className="text-[10px] uppercase font-mono px-1 rounded bg-slate-900/60">
                    {tok.language}
                  </span>
                  {tok.isSwitchPoint && <span className="text-[10px] text-purple-300 font-bold">⚡ Switch</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Language Composition Distribution Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Language Distribution Ratio</span>
              <div className="flex gap-3 text-[11px] font-mono">
                {Object.entries(radar.languageDistribution).map(([lang, pct]) => (
                  <span key={lang} className="text-slate-300">
                    {(lang || 'en').toUpperCase()}: <span className="text-purple-400 font-bold">{pct}%</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex">
              {Object.entries(radar.languageDistribution).map(([lang, pct], idx) => (
                <div
                  key={lang}
                  style={{ width: `${pct}%` }}
                  className={`h-full ${
                    idx === 0 ? 'bg-purple-500' : idx === 1 ? 'bg-indigo-500' : 'bg-pink-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
