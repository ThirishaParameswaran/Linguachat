import React, { useState } from 'react';
import { TranslationDebtItem, DebtAnalytics } from '../../types';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  Layers,
  Sparkles,
  Bot,
  FileText,
  Check,
  Lightbulb,
} from 'lucide-react';

interface TranslationDebtDashboardViewProps {
  debtItems?: TranslationDebtItem[];
  analytics?: DebtAnalytics;
  totalDebtScore?: number;
  setActiveView: (view: string) => void;
}

export const TranslationDebtDashboardView: React.FC<TranslationDebtDashboardViewProps> = ({
  debtItems = [],
  totalDebtScore = 38,
  setActiveView,
}) => {
  const [pendingItems, setPendingItems] = useState([
    {
      id: 'd_1',
      severity: 'MEDIUM',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300',
      pair: 'TA + EN',
      score: 44,
      category: 'QUICK_FIX',
      timeAgo: '2h ago',
      original: "Let's meet at the station entrance",
      translated: 'ஸ்டேஷன் நுழைவாயிலில் சந்திப்போம்',
      issue: 'Ambiguous translation - Which station?',
      confidence: 67,
      createdBy: 'Alex Chen',
      status: 'pending',
    },
    {
      id: 'd_2',
      severity: 'MEDIUM',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300',
      pair: 'TA + EN',
      score: 43,
      category: 'QUICK_FIX',
      timeAgo: '5h ago',
      original: "It's raining cats and dogs",
      translated: 'பூனைகளும் நாய்களும் மழை பெய்கிறது',
      issue: 'Idiom translation - literal translation incorrect',
      confidence: 71,
      createdBy: 'Priya Sharma',
      status: 'pending',
    },
  ]);

  const [resolvedNotification, setResolvedNotification] = useState<string | null>(null);

  const handleResolveItem = (id: string) => {
    setPendingItems((prev) => prev.filter((i) => i.id !== id));
    setResolvedNotification('Item resolved and updated in dictionary!');
    setTimeout(() => setResolvedNotification(null), 3000);
  };

  const handleEscalateAI = (id: string) => {
    setResolvedNotification(`Item ${id} escalated to AI fine-tuning dataset.`);
    setTimeout(() => setResolvedNotification(null), 3500);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <span>Quality Assurance & Risk Model</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Conversation Ledger
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track, prioritize, and remediate conversation audit records across polyglot communications
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
          <span>{totalDebtScore} pts</span>
          <span>•</span>
          <span>{pendingItems.length} items pending</span>
        </div>
      </div>

      {resolvedNotification && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{resolvedNotification}</span>
        </div>
      )}

      {/* 📊 Debt Overview KPI Cards */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          📊 Debt Overview
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Total Debt</span>
            <span className="text-2xl font-extrabold text-amber-600 mt-1 block">{totalDebtScore} pts</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Pending</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{pendingItems.length}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Resolved</span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">12</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Accuracy</span>
            <span className="text-2xl font-extrabold text-blue-600 mt-1 block">94%</span>
          </div>
        </div>
      </div>

      {/* 🔴 Pending Items (Requires Your Attention) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <span>🔴</span>
          <span>Pending Items (Requires Your Attention)</span>
        </h2>

        <div className="space-y-4">
          {pendingItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-emerald-600 font-semibold bg-emerald-50/50 rounded-xl border border-emerald-500/20">
              ✨ All pending translation debt items have been resolved!
            </div>
          ) : (
            pendingItems.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3"
              >
                {/* Item Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold border ${item.badgeColor}`}>
                      ⚠️ {item.severity}
                    </span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      {item.pair}
                    </span>
                    <span>•</span>
                    <span className="font-bold text-amber-600">{item.score} pts</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-500">{item.category}</span>
                  </div>
                  <div className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>⏰ {item.timeAgo}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs">
                  <div className="text-slate-800 dark:text-slate-200">
                    <strong>📝 Original:</strong> "{item.original}"
                  </div>
                  <div className="text-blue-900 dark:text-blue-200 font-semibold">
                    <strong>🔄 Translated:</strong> "{item.translated}"
                  </div>
                  <div className="text-rose-600 dark:text-rose-400 font-medium">
                    <strong>❌ Issue:</strong> {item.issue}
                  </div>
                  <div className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-2">
                    <span>📊 Confidence: {item.confidence}%</span>
                    <span>⚠️ Below threshold</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    👤 Created by: {item.createdBy}   📅 {item.timeAgo}
                  </div>
                </div>

                {/* Action Buttons: [Resolve] [Add Note] [Skip] [Escalate to AI] */}
                <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => handleResolveItem(item.id)}
                    className="py-1.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Resolve</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setResolvedNotification('Note added to audit log');
                      setTimeout(() => setResolvedNotification(null), 3500);
                    }}
                    className="py-1.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
                  >
                    <span>Add Note</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPendingItems((prev) => prev.filter((i) => i.id !== item.id))}
                    className="py-1.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
                  >
                    <span>Skip</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEscalateAI(item.id)}
                    className="py-1.5 px-3 rounded-xl bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200 text-purple-700 dark:text-purple-300 font-bold text-xs transition-colors flex items-center gap-1"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Escalate to AI</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ✅ Recently Resolved (Last 24 Hours) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <span>✅</span>
          <span>Recently Resolved (Last 24 Hours)</span>
        </h2>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
          <div className="text-slate-800 dark:text-slate-200 font-medium">
            ✅ Original: "The meeting is postponed to Friday"
          </div>
          <div className="text-slate-600 dark:text-slate-300">
            Translated: "கூட்டம் வெள்ளிக்கிழமைக்கு ஒத்திவைக்கப்பட்டது"
          </div>
          <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
            Resolution: Added context "weekly team meeting"
          </div>
          <div className="text-slate-400 text-[11px]">
            Resolved by: Alex Chen • 1 hour ago • Score: 95%
          </div>
        </div>
      </div>

      {/* 🔄 Remediation Queue Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>🔄</span>
          <span>Remediation Queue</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Priority</th>
                <th className="p-3">Items</th>
                <th className="p-3">Avg Score</th>
                <th className="p-3">Est. Time</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              <tr>
                <td className="p-3 font-bold text-rose-600">🔴 High</td>
                <td className="p-3">0</td>
                <td className="p-3">-</td>
                <td className="p-3">-</td>
                <td className="p-3">
                  <button className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-400 text-[11px] font-bold cursor-not-allowed">
                    Process
                  </button>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-amber-600">🟡 Medium</td>
                <td className="p-3">2</td>
                <td className="p-3">69%</td>
                <td className="p-3">5 min</td>
                <td className="p-3">
                  <button
                    onClick={() => setActiveView('debt_queue')}
                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shadow-xs transition-colors"
                  >
                    Process Next
                  </button>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-emerald-600">🟢 Low</td>
                <td className="p-3">0</td>
                <td className="p-3">-</td>
                <td className="p-3">-</td>
                <td className="p-3">
                  <button className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-400 text-[11px] font-bold cursor-not-allowed">
                    Auto-Fix
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 📊 Debt Trends Chart (Last 7 Days) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>📊</span>
          <span>Debt Trends (Last 7 Days)</span>
        </h2>

        <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800">
          {[
            { day: 'Mon', pts: 10, h: '16%' },
            { day: 'Tue', pts: 20, h: '33%' },
            { day: 'Wed', pts: 30, h: '50%' },
            { day: 'Thu', pts: 40, h: '66%' },
            { day: 'Fri', pts: 50, h: '83%' },
            { day: 'Sat', pts: 60, h: '100%' },
            { day: 'Sun', pts: 38, h: '63%' },
          ].map((bar) => (
            <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                {bar.pts} pts
              </div>
              <div
                style={{ height: bar.h }}
                className="w-full max-w-[36px] bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg group-hover:from-amber-500 group-hover:to-amber-300 transition-all"
              />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{bar.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tip Suggestion Card */}
      <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p>
          <strong>Suggestion:</strong> Review pending items regularly to prevent semantic degradation and improve overall translation quality for your workspace.
        </p>
      </div>
    </div>
  );
};
