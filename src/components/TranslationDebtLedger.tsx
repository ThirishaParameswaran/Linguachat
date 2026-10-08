import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { TranslationDebtItem, User } from '../types';
import { ButtonValidator } from './ButtonValidator';
import { AlertCircle, CheckCircle2, ShieldAlert, BarChart3, Calculator, Clock, Check } from 'lucide-react';

interface TranslationDebtLedgerProps {
  currentUser?: User | null;
}

export const TranslationDebtLedger: React.FC<TranslationDebtLedgerProps> = () => {
  const { calculateDebt, isLoading } = useTranslation();
  const [originalMessage, setOriginalMessage] = useState('நாளை மாலை நாம் திட்டத்தை தொடங்குவோம்');
  const [aiTranslation, setAiTranslation] = useState('Tomorrow evening we will commence the project');
  const [confidenceScore, setConfidenceScore] = useState(72);
  const [correctionCount, setCorrectionCount] = useState(2);
  const [isAuditApproved, setIsAuditApproved] = useState(false);
  const [codeSwitchComplexity, setCodeSwitchComplexity] = useState(45);
  const [hoursSinceReview, setHoursSinceReview] = useState(12);

  const [evaluatedDebt, setEvaluatedDebt] = useState<TranslationDebtItem | null>(null);

  const handleCalculate = async () => {
    const item = await calculateDebt({
      messageId: 'msg_' + Date.now(),
      originalMessage,
      aiTranslation,
      confidenceScore,
      correctionCount,
      isAuditApproved,
      codeSwitchComplexity,
      hoursSinceReview,
      sourceLanguage: 'ta',
      targetLanguage: 'en',
    });
    setEvaluatedDebt(item);
  };

  const getRiskBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-500 text-white';
      case 'high':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300';
      case 'medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
      default:
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-rose-950 text-white p-6 rounded-3xl shadow-xl border border-amber-800/60">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-2">
          <span>Conversation Ledger</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">
          Conversation Ledger Engine
        </h1>
        <p className="text-xs md:text-sm text-slate-300 max-w-2xl mt-1">
          Computes accumulated conversation risk using the standardized quality scoring model.
        </p>
      </div>

      {/* Input Parameters */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Source String
            </label>
            <input
              type="text"
              value={originalMessage}
              onChange={(e) => setOriginalMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              AI Translated String
            </label>
            <input
              type="text"
              value={aiTranslation}
              onChange={(e) => setAiTranslation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Weights Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {/* Confidence */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>Confidence Score (30%)</span>
              <span className="font-bold">{confidenceScore}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={confidenceScore}
              onChange={(e) => setConfidenceScore(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Corrections */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>Correction Iterations (25%)</span>
              <span className="font-bold">{correctionCount}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              value={correctionCount}
              onChange={(e) => setCorrectionCount(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Code Switch */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>Code-Switch Complexity (15%)</span>
              <span className="font-bold">{codeSwitchComplexity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={codeSwitchComplexity}
              onChange={(e) => setCodeSwitchComplexity(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Hours Review */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>Unreviewed Age (10%)</span>
              <span className="font-bold">{hoursSinceReview} hrs</span>
            </div>
            <input
              type="range"
              min="0"
              max="48"
              value={hoursSinceReview}
              onChange={(e) => setHoursSinceReview(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Audit Toggle */}
          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="auditCheck"
              checked={isAuditApproved}
              onChange={(e) => setIsAuditApproved(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
            />
            <label htmlFor="auditCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Dual-Approval Audit Complete (20% reduction)
            </label>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <ButtonValidator
            variant="primary"
            size="md"
            isLoading={isLoading}
            onClick={handleCalculate}
            icon={<Calculator className="w-4 h-4" />}
          >
            Compute Translation Debt
          </ButtonValidator>
        </div>
      </div>

      {/* Evaluated Score Card */}
      {evaluatedDebt && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div
                className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black text-2xl shadow-lg ${
                  evaluatedDebt.debtScore >= 70
                    ? 'bg-rose-600 text-white shadow-rose-600/30'
                    : evaluatedDebt.debtScore >= 40
                    ? 'bg-amber-500 text-white shadow-amber-500/30'
                    : 'bg-emerald-500 text-white shadow-emerald-500/30'
                }`}
              >
                <span>{evaluatedDebt.debtScore}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-90">
                  Debt Score
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${getRiskBadge(
                      evaluatedDebt.riskSeverity
                    )}`}
                  >
                    {evaluatedDebt.riskSeverity} Risk
                  </span>
                  <span className="text-xs text-slate-400 font-semibold uppercase">
                    Category: {evaluatedDebt.debtCategory.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  Remediation Status: {evaluatedDebt.remediationStatus}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Evaluated by {evaluatedDebt.evaluatedBy} at {evaluatedDebt.evaluatedAt}
                </p>
              </div>
            </div>
          </div>

          {/* 5 Weights Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">
                Confidence (30%)
              </span>
              <span className="text-base font-black text-slate-900 dark:text-white mt-1 block">
                +{evaluatedDebt.confidenceDebt}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">
                Corrections (25%)
              </span>
              <span className="text-base font-black text-slate-900 dark:text-white mt-1 block">
                +{evaluatedDebt.correctionDebt}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">
                Audit Status (20%)
              </span>
              <span className="text-base font-black text-slate-900 dark:text-white mt-1 block">
                +{evaluatedDebt.auditApprovalDebt}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">
                Code-Switch (15%)
              </span>
              <span className="text-base font-black text-slate-900 dark:text-white mt-1 block">
                +{evaluatedDebt.complexityDebt}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">
                Age Lag (10%)
              </span>
              <span className="text-base font-black text-slate-900 dark:text-white mt-1 block">
                +{evaluatedDebt.timeDebt}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
