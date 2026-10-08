import React, { useState } from 'react';
import { QualityGateRule, DebtAnalytics } from '../../types';
import { FileBarChart, Download, Sliders, ShieldCheck, Check, AlertCircle, RefreshCw } from 'lucide-react';

const DEFAULT_QUALITY_GATES: QualityGateRule[] = [
  {
    ruleId: 'gate_1',
    name: 'High Debt Auto-Queue Trigger',
    condition: 'Translation Debt Score > 70 OR Risk == Critical',
    thresholdScore: 70,
    action: 'flag_for_review',
    isActive: true,
  },
  {
    ruleId: 'gate_2',
    name: 'Echo Mode Enforcement for Low Confidence',
    condition: 'AI Translation Confidence < 80%',
    thresholdScore: 80,
    action: 'block_send',
    isActive: true,
  },
  {
    ruleId: 'gate_3',
    name: 'Negative Sentiment Escalation',
    condition: 'Sentiment Score < -0.6 (Hostile / Negative)',
    thresholdScore: -0.6,
    action: 'notify_admin',
    isActive: true,
  },
];

interface DebtReportsViewProps {
  analytics: DebtAnalytics;
}

export const DebtReportsView: React.FC<DebtReportsViewProps> = ({ analytics }) => {
  const [gates, setGates] = useState<QualityGateRule[]>(DEFAULT_QUALITY_GATES);
  const [selectedLanguagePair, setSelectedLanguagePair] = useState('all');
  const [reportGenerated, setReportGenerated] = useState(false);

  const toggleGate = (ruleId: string) => {
    setGates((prev) => prev.map((g) => (g.ruleId === ruleId ? { ...g, isActive: !g.isActive } : g)));
  };

  const handleGenerateReport = () => {
    setReportGenerated(true);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 text-slate-800">
      {/* Banner */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
            <FileBarChart className="w-5 h-5 text-blue-600" />
            Debt Reports Generator & Quality Gate Configurator
          </div>
          <p className="text-xs text-slate-600">
            Generate enterprise debt reports by language pair or project room, and define automatic quality gate trigger thresholds.
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-2 shrink-0"
        >
          <Download className="w-4 h-4" /> Export Report PDF/CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality Gate Rules Manager */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" /> Automated Quality Gate Rules
            </h3>
            <span className="text-[10px] font-mono text-emerald-700 font-bold">Active Engine Rules</span>
          </div>

          <div className="space-y-3">
            {gates.map((gate) => (
              <div
                key={gate.ruleId}
                className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-900">{gate.name}</div>
                  <div className="text-[11px] font-mono text-blue-700 font-semibold">{gate.condition}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Action: {gate.action}</div>
                </div>

                <button
                  onClick={() => toggleGate(gate.ruleId)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                    gate.isActive ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      gate.isActive ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Report Breakdown Generator */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Report Filter Criteria</h3>
            <span className="text-[10px] text-slate-500 font-medium">Period: Aug 1 - Aug 11, 2026</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Filter by Language Pair</label>
              <select
                value={selectedLanguagePair}
                onChange={(e) => setSelectedLanguagePair(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium"
              >
                <option value="all">All Language Pairs (Tamil, Hindi, Spanish, Japanese)</option>
                <option value="ta-en">Tamil → English (ta-en)</option>
                <option value="hi-en">Hindi → English (hi-en)</option>
                <option value="es-en">Spanish → English (es-en)</option>
                <option value="ja-en">Japanese → English (ja-en)</option>
              </select>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Total Evaluated:</span>
                <span className="text-slate-900 font-bold">{analytics.totalTranslationsEvaluated} messages</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Average Debt Score:</span>
                <span className="text-amber-700 font-bold">{analytics.averageDebtScore} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Remediation Velocity:</span>
                <span className="text-emerald-700 font-bold">{analytics.remediationRate}%</span>
              </div>
            </div>

            {reportGenerated && (
              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Enterprise Conversation Ledger Report compiled and exported!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
