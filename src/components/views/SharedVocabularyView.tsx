import React, { useState } from 'react';
import { SharedVocabEntry, User } from '../../types';
import { BookOpen, Search, Plus, Tag, CheckCircle2, Languages, Link } from 'lucide-react';

interface SharedVocabularyViewProps {
  currentUser: User;
  vocabList: SharedVocabEntry[];
  setVocabList: React.Dispatch<React.SetStateAction<SharedVocabEntry[]>>;
}

export const SharedVocabularyView: React.FC<SharedVocabularyViewProps> = ({
  currentUser,
  vocabList,
  setVocabList,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Term Form state
  const [term, setTerm] = useState('');
  const [translatedTerm, setTranslatedTerm] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('ta');
  const [contextUsage, setContextUsage] = useState('');

  const filteredVocab = vocabList.filter((v) => {
    const matchesSearch =
      v.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.translatedTerm.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroupFilter === 'all' || v.groupId === selectedGroupFilter;
    return matchesSearch && matchesGroup;
  });

  const handleAddTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim() || !translatedTerm.trim()) return;

    const newEntry: SharedVocabEntry = {
      vocabId: 'voc_' + Date.now(),
      groupId: 'grp_global_project',
      groupName: '🚀 Project Titan Global Core',
      term: term.trim(),
      sourceLanguage,
      translatedTerm: translatedTerm.trim(),
      targetLanguage,
      contextUsage: contextUsage || 'Custom glossary term added by team.',
      proposedBy: currentUser.userId,
      proposedByName: currentUser.username,
      approvedBy: 'Alex Chen',
      correctionCount: 1,
      lastUsedAt: 'Just now',
      tags: ['user_added', 'approved'],
    };

    setVocabList((prev) => [newEntry, ...prev]);
    setIsModalOpen(false);
    setTerm('');
    setTranslatedTerm('');
    setContextUsage('');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 text-slate-200">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-lg">
            <BookOpen className="w-6 h-6 text-purple-400" />
            Shared Collaborative Vocabulary & Glossary
          </div>
          <p className="text-xs text-slate-300">
            Group-specific collaborative glossary automatically seeded from approved dual-approval audit trail corrections.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-lg shadow-purple-600/30 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Glossary Term
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search glossary terms (e.g., Deploy, Latency, 翻訳)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <select
          value={selectedGroupFilter}
          onChange={(e) => setSelectedGroupFilter(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 w-full sm:w-auto"
        >
          <option value="all">All Groups</option>
          <option value="grp_global_project">🚀 Project Titan Global Core</option>
          <option value="grp_design_sprint">🎨 UX & Cultural Localization</option>
        </select>
      </div>

      {/* Glossary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVocab.map((item) => (
          <div
            key={item.vocabId}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-purple-500/40 transition-colors"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white text-sm">{item.term}</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {item.sourceLanguage} → {item.targetLanguage}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-purple-200 font-semibold">
              ↳ {item.translatedTerm}
            </div>

            <p className="text-xs text-slate-400">{item.contextUsage}</p>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> By {item.proposedByName}
              </span>
              <span>Used {item.correctionCount} times</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Term Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 text-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" /> Add Shared Glossary Entry
            </h3>

            <form onSubmit={handleAddTerm} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Source Term</label>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="e.g. Microservice Latency"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Approved Translation</label>
                <input
                  type="text"
                  value={translatedTerm}
                  onChange={(e) => setTranslatedTerm(e.target.value)}
                  placeholder="e.g. நுண் சேவை தாமதம் (Latency)"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Context Usage / Notes</label>
                <textarea
                  rows={2}
                  value={contextUsage}
                  onChange={(e) => setContextUsage(e.target.value)}
                  placeholder="Engineering performance metrics domain..."
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30"
                >
                  Save Term
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
