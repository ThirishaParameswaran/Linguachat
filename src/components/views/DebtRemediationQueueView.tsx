import React, { useState } from 'react';
import { TranslationDebtItem } from '../../types';
import { ListTodo, CheckCircle2, ShieldCheck, UserCheck, Edit3, Send, Check } from 'lucide-react';

interface DebtRemediationQueueViewProps {
  debtItems: TranslationDebtItem[];
  setDebtItems: React.Dispatch<React.SetStateAction<TranslationDebtItem[]>>;
  onResolveItem: (debtId: string, refinedText: string, notes: string) => void;
}

export const DebtRemediationQueueView: React.FC<DebtRemediationQueueViewProps> = ({
  debtItems,
  setDebtItems,
  onResolveItem,
}) => {
  const [selectedItem, setSelectedItem] = useState<TranslationDebtItem | null>(debtItems[0] || null);
  const [refinedText, setRefinedText] = useState('');
  const [notes, setNotes] = useState('');

  const handleRemediate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !refinedText.trim()) return;

    onResolveItem(selectedItem.debtId, refinedText, notes);
    const updated = debtItems.filter((i) => i.debtId !== selectedItem.debtId);
    setDebtItems(updated);
    setSelectedItem(updated[0] || null);
    setRefinedText('');
    setNotes('');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 text-slate-800">
      {/* Banner */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
            <ListTodo className="w-5 h-5 text-blue-600" />
            Remediation Queue
          </div>
          <p className="text-xs text-slate-600">
            Actionable resolution workspace for high-debt translations. Refine terminology and mark remediated to clear risk alerts.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2 shrink-0 uppercase tracking-wide">
          <ShieldCheck className="w-4 h-4 text-amber-700" /> {debtItems.length} Queue Items
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue Item List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Action Queue</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {debtItems.map((item) => (
              <button
                key={item.debtId}
                onClick={() => {
                  setSelectedItem(item);
                  setRefinedText(item.aiTranslation);
                }}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  selectedItem?.debtId === item.debtId
                    ? 'bg-amber-50/90 border-amber-300 text-slate-900 shadow-xs ring-1 ring-amber-300'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-amber-700">{item.debtScore} pts</span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                    {item.sourceLanguage} → {item.targetLanguage}
                  </span>
                </div>
                <div className="text-xs font-semibold truncate">{item.originalMessage}</div>
              </button>
            ))}

            {debtItems.length === 0 && (
              <div className="p-8 rounded-xl bg-white border border-slate-200 text-center text-slate-500 text-xs shadow-xs font-medium">
                🎉 Remediation Queue Clean! No pending high-debt translations.
              </div>
            )}
          </div>
        </div>

        {/* Remediation Workspace */}
        {selectedItem && (
          <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden space-y-0">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-700 font-bold uppercase">Debt ID: {selectedItem.debtId}</span>
                <h2 className="text-sm font-bold text-slate-900">Side-by-Side Remediation Studio</h2>
              </div>
              <div className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                Score: {selectedItem.debtScore} pts
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Original vs AI Translation */}
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Original Message</span>
                  <p className="text-xs text-slate-800 font-medium">{selectedItem.originalMessage}</p>
                </div>

                <div className="p-4 rounded-lg bg-blue-50/60 border border-blue-200 space-y-1">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Current AI Translation</span>
                  <p className="text-xs text-blue-950 font-semibold">{selectedItem.aiTranslation}</p>
                </div>
              </div>

              {/* Refinement Editor */}
              <form onSubmit={handleRemediate} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-600" /> Refined Correct Translation
                </h4>

                <textarea
                  rows={3}
                  value={refinedText}
                  onChange={(e) => setRefinedText(e.target.value)}
                  placeholder="Enter perfected human translation..."
                  className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium"
                />

                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Remediation rationale or terminology note..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium"
                />

                <button
                  type="submit"
                  disabled={!refinedText.trim()}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Resolve & Clear Debt Item
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
