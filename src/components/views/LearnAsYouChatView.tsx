import React, { useState } from 'react';
import { LearningWord, User } from '../../types';
import { useAppState } from '../../store/appState';
import { saveLearningWord } from '../../services/api';
import {
  BookOpen,
  Volume2,
  CheckCircle2,
  Sparkles,
  Award,
  Check,
  X,
  Lightbulb,
  TrendingUp,
  RefreshCw,
  Flame,
  Plus,
} from 'lucide-react';

interface LearnAsYouChatViewProps {
  currentUser: User;
  words?: LearningWord[];
  setWords?: React.Dispatch<React.SetStateAction<LearningWord[]>>;
}

export const LearnAsYouChatView: React.FC<LearnAsYouChatViewProps> = ({
  currentUser,
  words: propWords,
}) => {
  const { learningWords, addLearningWord, vocabList } = useAppState();

  const activeWords = propWords && propWords.length > 0 ? propWords : learningWords;

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  // New word form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWordText, setNewWordText] = useState('');
  const [newTranslationText, setNewTranslationText] = useState('');
  const [newDefinitionText, setNewDefinitionText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWordText.trim() || !newTranslationText.trim()) return;

    setIsSaving(true);
    const newWordObj: LearningWord = {
      wordId: 'lrn_' + Date.now(),
      userId: currentUser.userId,
      word: newWordText.trim(),
      sourceLanguage: 'auto',
      translation: newTranslationText.trim(),
      targetLanguage: currentUser.preferredLanguage || 'en',
      definition: newDefinitionText.trim() || 'Custom vocabulary word',
      phonetic: '',
      exampleSentence: `Learned term: ${newWordText.trim()}`,
      masteryLevel: 1,
      nextReviewDate: new Date().toISOString(),
      timesReviewed: 0,
      lastTestedAt: new Date().toISOString(),
    };

    const saved = await saveLearningWord(newWordObj);
    addLearningWord(saved || newWordObj);

    setNewWordText('');
    setNewTranslationText('');
    setNewDefinitionText('');
    setIsSaving(false);
    setShowAddForm(false);
  };

  const handleHearPronunciation = (text: string, lang: string = 'ta') => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Dynamic Quiz Flashcards built from activeWords
  const quizQuestionWord = activeWords[0];
  const quizOptions = activeWords.length > 0
    ? activeWords.slice(0, 4).map((w, idx) => ({
        id: idx,
        text: `${w.translation} (${w.word})`,
        correct: idx === 0,
        wordObj: w,
      }))
    : [];

  const handleCheckAnswer = () => {
    if (selectedOption === null || quizOptions.length === 0) return;
    const selected = quizOptions.find((o) => o.id === selectedOption);
    if (selected?.correct) {
      setQuizFeedback(`✅ Correct! "${selected.wordObj.translation}" is the translation for "${selected.wordObj.word}".`);
    } else {
      const correctOpt = quizOptions.find((o) => o.correct);
      setQuizFeedback(`❌ Incorrect. The correct answer is "${correctOpt?.text}".`);
    }
  };

  const wordsLearnedCount = activeWords.length;
  const flashcardsMastered = activeWords.filter((w) => w.masteryLevel >= 3).length;
  const avgConfidence = activeWords.length > 0 ? Math.min(98, 70 + activeWords.length * 3) : 0;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4 text-teal-500" />
            <span>Spaced Repetition & Vocabulary Mastery</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            📚 Learn As You Chat
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Turn real-time cross-language conversations into personal flashcards and vocabulary retention
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/30 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Word</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>{wordsLearnedCount} words total</span>
          </div>
        </div>
      </div>

      {/* Add New Word Form Modal/Expandable */}
      {showAddForm && (
        <form onSubmit={handleAddWord} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-teal-500/40 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span>Save Custom Vocabulary Word</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Word / Phrase *
              </label>
              <input
                type="text"
                value={newWordText}
                onChange={(e) => setNewWordText(e.target.value)}
                placeholder="e.g. Beautiful"
                required
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Translation *
              </label>
              <input
                type="text"
                value={newTranslationText}
                onChange={(e) => setNewTranslationText(e.target.value)}
                placeholder="e.g. அழகான"
                required
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Definition / Usage
              </label>
              <input
                type="text"
                value={newDefinitionText}
                onChange={(e) => setNewDefinitionText(e.target.value)}
                placeholder="e.g. Pleasing the senses"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md"
            >
              {isSaving ? 'Saving...' : 'Save Word'}
            </button>
          </div>
        </form>
      )}

      {/* 📊 Learning Progress KPI Cards */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          📊 Learning Progress
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Words Learned</span>
            <span className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-1 block">
              {wordsLearnedCount}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Flashcards Mastered</span>
            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 block">
              {flashcardsMastered}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Confidence</span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
              {avgConfidence}%
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Active Streak</span>
            <span className="text-2xl font-extrabold text-amber-500 mt-1 block">
              {activeWords.length > 0 ? '7 days' : '0 days'}
            </span>
          </div>
        </div>
      </div>

      {/* 📝 Words Learned Table OR Empty State */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          📝 Words Learned from Recent Chats
        </h2>

        {activeWords.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">No learned words saved yet</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              As you chat in multilingual channels, click vocabulary chips on messages or use the 'Add New Word' button above to save vocabulary terms to your learning deck!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Word</th>
                  <th className="p-3">Translation</th>
                  <th className="p-3">Language Pair</th>
                  <th className="p-3">Mastery Level</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {activeWords.map((item, idx) => (
                  <tr key={item.wordId || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{item.word}</span>
                      <button
                        type="button"
                        onClick={() => handleHearPronunciation(item.word, 'en')}
                        className="p-1 hover:text-teal-600 transition-colors"
                        title="Hear pronunciation"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </td>
                    <td className="p-3 font-bold text-teal-700 dark:text-teal-300 font-mono text-sm">{item.translation}</td>
                    <td className="p-3 text-slate-500 font-semibold uppercase">{item.sourceLanguage} → {item.targetLanguage}</td>
                    <td className="p-3 font-bold text-slate-700 dark:text-slate-300">Level {item.masteryLevel}/5</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        item.masteryLevel >= 4
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.masteryLevel >= 2
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.masteryLevel >= 4 ? '✅ Mastered' : item.masteryLevel >= 2 ? '📚 Learning' : '🔄 Review'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 📖 Dynamic Practice Section (Flashcard Quiz) */}
      {quizOptions.length > 0 && quizQuestionWord && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>🔄</span>
              <span>Flashcard Practice (Spaced Repetition)</span>
            </h2>
            <span className="text-xs text-slate-400 font-semibold">
              Vocabulary Deck: {activeWords.length} terms
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Question: What is the translation for <span className="text-teal-600 dark:text-teal-400">"{quizQuestionWord.word}"</span>?
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {quizOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedOption(opt.id)}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all flex items-center gap-2.5 ${
                    selectedOption === opt.id
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-800 dark:text-teal-200 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                      selectedOption === opt.id ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'
                    }`}
                  >
                    {selectedOption === opt.id && '●'}
                  </span>
                  <span>{opt.text}</span>
                </button>
              ))}
            </div>

            {quizFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  quizFeedback.startsWith('✅')
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200'
                }`}
              >
                {quizFeedback}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCheckAnswer}
                disabled={selectedOption === null}
                className="py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Check Answer
              </button>

              <button
                type="button"
                onClick={() => handleHearPronunciation(quizQuestionWord.translation, 'ta')}
                className="py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Hear Pronunciation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔄 Shared Vocabulary (Team/Group Terms) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>🔄</span>
          <span>Shared Vocabulary ({vocabList.length > 0 ? vocabList.length : 5} Team Terms)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {(vocabList.length > 0 ? vocabList : [
            { term: 'Project Kickoff', translatedTerm: 'திட்ட தொடக்கம்' },
            { term: 'Deadline', translatedTerm: 'கெடு' },
            { term: 'Review Meeting', translatedTerm: 'மதிப்பாய்வு கூட்டம்' },
            { term: 'Sprint', translatedTerm: 'ஸ்பிரிண்ட்' },
            { term: 'Retrospective', translatedTerm: 'பின்னோக்கு பார்வை' },
          ]).map((item: any, i: number) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
            >
              <span className="font-bold text-slate-800 dark:text-slate-200">• {item.term}</span>
              <span className="font-bold text-teal-700 dark:text-teal-300 font-mono">→ {item.translatedTerm || item.translatedText}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tip Card */}
      <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50 text-xs text-teal-800 dark:text-teal-300 flex items-start gap-2.5">
        <Lightbulb className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <p>
          <strong>Tip:</strong> Practice words captured from your real conversations every day to accelerate language learning and vocabulary retention!
        </p>
      </div>
    </div>
  );
};
