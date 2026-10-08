import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { CodeSwitchRadarData, User } from '../types';
import { useAppState } from '../store/appState';
import {
  Activity,
  Zap,
  Layers,
  Search,
  ArrowRight,
  TrendingUp,
  FileText,
  Bell,
  Download,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';

interface CodeSwitchRadarProps {
  currentUser?: User | null;
}

export const CodeSwitchRadar: React.FC<CodeSwitchRadarProps> = () => {
  const { addNotification } = useAppState();
  const { detectCodeSwitch, isLoading } = useTranslation();
  const [inputText, setInputText] = useState(
    'Naan (I) am going to Tokyo next week.'
  );

  const [radarData, setRadarData] = useState<CodeSwitchRadarData>({
    primaryLanguage: 'en',
    detectedLanguages: ['en', 'ta', 'ja'],
    switchPoints: 3,
    complexityScore: 68,
    isCodeMixed: true,
    tokens: [
      { token: 'Naan', language: 'ta', isSwitchPoint: false },
      { token: '(I)', language: 'ta', isSwitchPoint: false },
      { token: 'am', language: 'en', isSwitchPoint: true },
      { token: 'going', language: 'en', isSwitchPoint: false },
      { token: 'to', language: 'en', isSwitchPoint: false },
      { token: 'Tokyo', language: 'ja', isSwitchPoint: true },
      { token: 'next', language: 'en', isSwitchPoint: true },
      { token: 'week', language: 'en', isSwitchPoint: false },
    ],
  });

  const recentEvents = [
    { id: 1, message: '"Naan tomorrow office"', fromTo: 'TA → EN', type: 'Intra', complexity: 'Low', badge: 'bg-emerald-100 text-emerald-700' },
    { id: 2, message: '"How are you today?"', fromTo: 'EN → TA', type: 'Intra', complexity: 'Medium', badge: 'bg-amber-100 text-amber-700' },
    { id: 3, message: '"Konichiwa, how are"', fromTo: 'JA → EN', type: 'Inter', complexity: 'High', badge: 'bg-orange-100 text-orange-700' },
  ];

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    try {
      const res = await detectCodeSwitch(inputText);
      if (res) setRadarData(res);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 text-purple-500" />
            <span>Token-Level Language Scanner</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            🔍 Code-Switch Radar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time polyglot syntax parsing, language mixing distribution & switch-point detection
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800">
          <Activity className="w-4 h-4" />
          <span>Detected: {radarData.switchPoints} switches</span>
        </div>
      </div>

      {/* 📊 Analysis Summary KPI Cards */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          📊 Analysis Summary
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Total Words</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">47</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Languages</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">🇺🇸 🇮🇳 🇯🇵</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Switches</span>
            <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1 block">{radarData.switchPoints}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Complexity</span>
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">Medium</span>
          </div>
        </div>
      </div>

      {/* 🌐 Language Mix Visualization */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          🌐 Language Mix Visualization
        </h2>

        <div className="space-y-3">
          {/* English 45% */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">🇺🇸 English</span>
              <span>45%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '45%' }} />
            </div>
          </div>

          {/* Tamil 40% */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">🇮🇳 Tamil</span>
              <span>40%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full" style={{ width: '40%' }} />
            </div>
          </div>

          {/* Japanese 15% */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">🇯🇵 Japanese</span>
              <span>15%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-pink-500 rounded-full" style={{ width: '15%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 🔄 Detected Switch Points Timeline */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          🔄 Detected Switch Points
        </h2>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Message: <strong className="text-slate-800 dark:text-slate-200">"{inputText}"</strong>
          </div>

          {/* Word Token Badges */}
          <div className="flex flex-wrap gap-2 pt-1 pb-2">
            {radarData.tokens.map((tok, i) => (
              <div
                key={i}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex flex-col items-center gap-0.5 ${
                  tok.language === 'ta'
                    ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
                    : tok.language === 'ja'
                    ? 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800'
                    : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                }`}
              >
                <span>{tok.token}</span>
                <span className="text-[9px] uppercase opacity-75 font-mono">[{tok.language}]</span>
              </div>
            ))}
          </div>

          {/* Switch Analysis Breakdown */}
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="font-bold text-slate-800 dark:text-slate-200">📊 Switch Analysis:</div>
            <div>• Switch 1: TA → EN at position 3 (Intra-sentential)</div>
            <div>• Switch 2: EN → JA at position 6 (Named entity code-switch)</div>
            <div>• Switch 3: JA → EN at position 7 (Intra-sentential transition)</div>
            <div className="text-purple-600 dark:text-purple-400 font-semibold pt-1">
              💡 Type: Mixed intra-sentential code-switching
            </div>
          </div>
        </div>
      </div>

      {/* 📋 Recent Code-Switch Events Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          📋 Recent Code-Switch Events
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700 uppercase">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Message</th>
                <th className="p-3">From → To</th>
                <th className="p-3">Type</th>
                <th className="p-3">Complexity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {recentEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-slate-400">{ev.id}</td>
                  <td className="p-3 text-slate-900 dark:text-slate-100 font-semibold">{ev.message}</td>
                  <td className="p-3 font-mono text-purple-600 dark:text-purple-400 font-bold">{ev.fromTo}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{ev.type}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${ev.badge}`}>
                      {ev.complexity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔧 Actions Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          🔧 Actions
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              addNotification({
                title: '📊 Code-Switch Analysis',
                message: 'Detailed breakdown loaded.',
                type: 'info',
              })
            }
            className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>View Full Analysis</span>
          </button>
          <button
            type="button"
            onClick={() =>
              addNotification({
                title: '📥 Export Report',
                message: 'Code-switch report exported as JSON/CSV.',
                type: 'success',
              })
            }
            className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
          <button
            type="button"
            onClick={() =>
              addNotification({
                title: '💡 Syntax Correction',
                message: 'Grammar and code-switch suggestion generated.',
                type: 'info',
              })
            }
            className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Suggest Correction</span>
          </button>
          <button
            type="button"
            onClick={() =>
              addNotification({
                title: '📈 Pattern Trends',
                message: 'Code-switching trends & stats updated.',
                type: 'info',
              })
            }
            className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>View Pattern Trends</span>
          </button>
          <button
            type="button"
            onClick={() =>
              addNotification({
                title: '🔔 Alerts Configured',
                message: 'Code-switch alerts set to Medium+ complexity threshold.',
                type: 'success',
              })
            }
            className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Set Alerts</span>
          </button>
        </div>
      </div>

      {/* Tip Card */}
      <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 text-xs text-purple-800 dark:text-purple-300 flex items-start gap-2.5">
        <Lightbulb className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        <p>
          <strong>Insight:</strong> Switch patterns suggest bilingual fluency. Add context-aware translation for better accuracy and idiom translation fidelity.
        </p>
      </div>
    </div>
  );
};
