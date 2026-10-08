import React, { useState, useMemo, useEffect } from 'react';
import {
  FileSearch,
  Search,
  RefreshCw,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  Globe,
  Volume2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  FileText,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAppState } from '../../store/appState';
import { User, AuditTrailEntry } from '../../types';

export interface ExtendedAuditRecord {
  id: string; // Translation ID e.g. TR-20261007-0042
  dateTime: string;
  user: string;
  sourceLang: string;
  sourceLangName: string;
  sourceText: string;
  targetLang: string;
  targetLangName: string;
  translatedText: string;
  confidence: number;
  status: 'Verified' | 'Reviewed' | 'Needs Review' | 'Corrected' | 'Failed';
  reviewedBy: string;
  translationMethod?: string;
  correctionHistory?: string;
  audioStatus?: string;
  ledgerStatus?: string;
}

interface AuditTrailViewProps {
  currentUser?: User | null;
  auditEntries?: AuditTrailEntry[];
  setAuditEntries?: React.Dispatch<React.SetStateAction<AuditTrailEntry[]>>;
  onAddToGlossary?: (entry: AuditTrailEntry) => void;
}

const INITIAL_SAMPLE_AUDIT_DATA: ExtendedAuditRecord[] = [
  {
    id: 'TR-20261007-0042',
    dateTime: '2026-10-07 10:24 AM',
    user: 'Thirisha P',
    sourceLang: 'en',
    sourceLangName: 'English',
    sourceText: 'I will call you tomorrow.',
    targetLang: 'ta',
    targetLangName: 'Tamil',
    translatedText: 'நான் உங்களை நாளை அழைப்பேன்.',
    confidence: 98,
    status: 'Verified',
    reviewedBy: 'Alex (Reviewer)',
    translationMethod: 'Gemini 3.6 Flash NMT Engine',
    correctionHistory: 'Initial AI draft verified with 0 edit distance.',
    audioStatus: 'Available (WebAudio API)',
    ledgerStatus: 'Synced & Verified',
  },
  {
    id: 'TR-20261007-0041',
    dateTime: '2026-10-07 09:52 AM',
    user: 'Priya Sharma',
    sourceLang: 'ta',
    sourceLangName: 'Tamil',
    sourceText: 'இன்று வானிலை மிகவும் நன்றாக உள்ளது.',
    targetLang: 'en',
    targetLangName: 'English',
    translatedText: 'The weather is very nice today.',
    confidence: 96,
    status: 'Verified',
    reviewedBy: 'Karthik S',
    translationMethod: 'Google Translate Neural v2',
    correctionHistory: 'Verified by domain reviewer.',
    audioStatus: 'Available (WebAudio API)',
    ledgerStatus: 'Synced & Verified',
  },
  {
    id: 'TR-20261007-0040',
    dateTime: '2026-10-07 08:30 AM',
    user: 'Alex',
    sourceLang: 'en',
    sourceLangName: 'English',
    sourceText: 'I am planning to visit Chennai next week.',
    targetLang: 'ta',
    targetLangName: 'Tamil',
    translatedText: 'அடுத்த வாரம் சென்னை செல்ல திட்டமிட்டுள்ளேன்.',
    confidence: 94,
    status: 'Needs Review',
    reviewedBy: 'Pending',
    translationMethod: 'Gemini 3.6 Flash NMT Engine',
    correctionHistory: 'Flagged for formality & location nuance check.',
    audioStatus: 'Available',
    ledgerStatus: 'Pending Reviewer Sign-off',
  },
  {
    id: 'TR-20261007-0039',
    dateTime: '2026-10-06 04:15 PM',
    user: 'Kenji Takahashi',
    sourceLang: 'ja',
    sourceLangName: 'Japanese',
    sourceText: 'プロジェクトの進捗状況を共有してください。',
    targetLang: 'en',
    targetLangName: 'English',
    translatedText: 'Please share the project progress status.',
    confidence: 97,
    status: 'Reviewed',
    reviewedBy: 'Alex (Reviewer)',
    translationMethod: 'Gemini 3.6 Flash NMT Engine',
    correctionHistory: 'Reviewed and confirmed by team admin.',
    audioStatus: 'Available',
    ledgerStatus: 'Synced & Verified',
  },
  {
    id: 'TR-20261007-0038',
    dateTime: '2026-10-06 02:40 PM',
    user: 'Elena Rostova',
    sourceLang: 'es',
    sourceLangName: 'Spanish',
    sourceText: 'Nos vemos en la reunión de alineación estratégica.',
    targetLang: 'en',
    targetLangName: 'English',
    translatedText: 'See you at the strategic alignment meeting.',
    confidence: 95,
    status: 'Corrected',
    reviewedBy: 'Priya Sharma',
    translationMethod: 'Dual-Approval Refined Model',
    correctionHistory: 'Replaced "reunion" with "strategic alignment meeting".',
    audioStatus: 'Available',
    ledgerStatus: 'Glossary Approved',
  },
  {
    id: 'TR-20261007-0037',
    dateTime: '2026-10-05 11:20 AM',
    user: 'Karthik Subramanian',
    sourceLang: 'ta',
    sourceLangName: 'Tamil',
    sourceText: 'தரவுத்தள சேவையகம் புதுப்பிக்கப்பட்டது.',
    targetLang: 'en',
    targetLangName: 'English',
    translatedText: 'Database server updated successfully.',
    confidence: 99,
    status: 'Verified',
    reviewedBy: 'Alex (Reviewer)',
    translationMethod: 'Gemini 3.6 Flash NMT Engine',
    correctionHistory: 'High-confidence automated verification.',
    audioStatus: 'Available',
    ledgerStatus: 'Synced & Verified',
  },
  {
    id: 'TR-20261007-0036',
    dateTime: '2026-10-05 09:10 AM',
    user: 'Thirisha P',
    sourceLang: 'en',
    sourceLangName: 'English',
    sourceText: 'Welcome to our global team meeting.',
    targetLang: 'hi',
    targetLangName: 'Hindi',
    translatedText: 'हमारी वैश्विक टीम बैठक में आपका स्वागत है।',
    confidence: 93,
    status: 'Needs Review',
    reviewedBy: 'Pending',
    translationMethod: 'Gemini 3.6 Flash NMT Engine',
    correctionHistory: 'Awaiting Hindi reviewer sign-off.',
    audioStatus: 'Available',
    ledgerStatus: 'Pending Reviewer Sign-off',
  },
  {
    id: 'TR-20261007-0035',
    dateTime: '2026-10-04 03:00 PM',
    user: 'Priya Sharma',
    sourceLang: 'hi',
    sourceLangName: 'Hindi',
    sourceText: 'हमारा कोड-स्विचिंग इंडेक्स 90% से अधिक है।',
    targetLang: 'en',
    targetLangName: 'English',
    translatedText: 'Our code-switching index is above 90%.',
    confidence: 78,
    status: 'Failed',
    reviewedBy: 'System Auditor',
    translationMethod: 'Fallback Engine',
    correctionHistory: 'Low confidence score triggered quality gate warning.',
    audioStatus: 'Unavailable',
    ledgerStatus: 'Escalated to Remediation Queue',
  },
];

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  currentUser,
}) => {
  const { addNotification, translationHistory, auditEntries } = useAppState();

  const [records, setRecords] = useState<ExtendedAuditRecord[]>(INITIAL_SAMPLE_AUDIT_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedSourceLang, setSelectedSourceLang] = useState<string>('All');
  const [selectedTargetLang, setSelectedTargetLang] = useState<string>('All');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('All');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // Detail Modal State
  const [selectedRecord, setSelectedRecord] = useState<ExtendedAuditRecord | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Synchronize dynamic translations performed elsewhere in app
  useEffect(() => {
    if (translationHistory && translationHistory.length > 0) {
      const liveConverted: ExtendedAuditRecord[] = translationHistory.map((h, i) => ({
        id: `TR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${(100 + i).toString().padStart(4, '0')}`,
        dateTime: h.timestamp || 'Just now',
        user: currentUser?.username || 'Current User',
        sourceLang: h.sourceLang || 'en',
        sourceLangName: h.sourceLang?.toUpperCase() || 'ENGLISH',
        sourceText: h.sourceText,
        targetLang: h.targetLang || 'ta',
        targetLangName: h.targetLang?.toUpperCase() || 'TAMIL',
        translatedText: h.translatedText,
        confidence: h.confidenceScore || 95,
        status: (h.confidenceScore || 95) >= 95 ? 'Verified' : 'Needs Review',
        reviewedBy: (h.confidenceScore || 95) >= 95 ? 'AI Auditor' : 'Pending',
        translationMethod: 'Gemini 3.6 Flash Live Engine',
        correctionHistory: 'Generated via live translation workbench.',
        audioStatus: 'Available (WebAudio API)',
        ledgerStatus: 'Synced & Recorded',
      }));

      // Merge avoiding duplicates by sourceText
      setRecords((prev) => {
        const existingTexts = new Set(prev.map((r) => r.sourceText));
        const newAdditions = liveConverted.filter((c) => !existingTexts.has(c.sourceText));
        return [...newAdditions, ...prev];
      });
    }
  }, [translationHistory, currentUser?.username]);

  // Filtering Logic
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchId = r.id.toLowerCase().includes(q);
        const matchUser = r.user.toLowerCase().includes(q);
        const matchSource = r.sourceText.toLowerCase().includes(q);
        const matchTarget = r.translatedText.toLowerCase().includes(q);
        if (!matchId && !matchUser && !matchSource && !matchTarget) return false;
      }

      // 2. Status Filter
      if (selectedStatus !== 'All' && r.status !== selectedStatus) {
        return false;
      }

      // 3. Source Language Filter
      if (selectedSourceLang !== 'All') {
        if (r.sourceLang.toLowerCase() !== selectedSourceLang.toLowerCase() &&
            r.sourceLangName.toLowerCase() !== selectedSourceLang.toLowerCase()) {
          return false;
        }
      }

      // 4. Target Language Filter
      if (selectedTargetLang !== 'All') {
        if (r.targetLang.toLowerCase() !== selectedTargetLang.toLowerCase() &&
            r.targetLangName.toLowerCase() !== selectedTargetLang.toLowerCase()) {
          return false;
        }
      }

      // 5. Date Range Filter
      if (selectedDateRange !== 'All') {
        if (selectedDateRange === 'Today' && !r.dateTime.includes('2026-10-07')) return false;
        if (selectedDateRange === '7Days' && !r.dateTime.includes('2026-10')) return false;
      }

      return true;
    });
  }, [records, searchQuery, selectedStatus, selectedSourceLang, selectedTargetLang, selectedDateRange]);

  // Summary Metrics (Dynamically Calculated)
  const totalTranslations = filteredRecords.length;
  const verifiedCount = filteredRecords.filter((r) => r.status === 'Verified').length;
  const needsReviewCount = filteredRecords.filter((r) => r.status === 'Needs Review').length;
  const avgConfidence = totalTranslations > 0
    ? (filteredRecords.reduce((acc, r) => acc + r.confidence, 0) / totalTranslations).toFixed(1)
    : '0.0';

  // Pagination Slice
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const currentPageRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedSourceLang, selectedTargetLang, selectedDateRange, pageSize]);

  // Refresh handler
  const handleRefresh = () => {
    setSearchQuery('');
    setSelectedStatus('All');
    setSelectedSourceLang('All');
    setSelectedTargetLang('All');
    setSelectedDateRange('All');
    addNotification({
      title: '🔄 Audit Trail Refreshed',
      message: 'Audit records synced and filters reset.',
      type: 'info',
    });
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      'Translation ID',
      'Date & Time',
      'User',
      'Source Language',
      'Source Text',
      'Target Language',
      'Translated Text',
      'Confidence (%)',
      'Status',
      'Reviewed By',
    ];

    const rows = filteredRecords.map((r) => [
      `"${r.id}"`,
      `"${r.dateTime}"`,
      `"${r.user}"`,
      `"${r.sourceLangName}"`,
      `"${r.sourceText.replace(/"/g, '""')}"`,
      `"${r.targetLangName}"`,
      `"${r.translatedText.replace(/"/g, '""')}"`,
      `"${r.confidence}%"`,
      `"${r.status}"`,
      `"${r.reviewedBy}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Translation_Audit_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addNotification({
      title: '📥 Audit CSV Exported',
      message: `Exported ${filteredRecords.length} audit entries to CSV.`,
      type: 'success',
    });
  };

  // Audio Text-to-Speech handler
  const handleSpeakText = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ta' ? 'ta-IN' : lang === 'hi' ? 'hi-IN' : lang === 'es' ? 'es-ES' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const getStatusBadge = (status: ExtendedAuditRecord['status']) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Verified
          </span>
        );
      case 'Reviewed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            Reviewed
          </span>
        );
      case 'Needs Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Needs Review
          </span>
        );
      case 'Corrected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Corrected
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-100 font-sans">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d1322] p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-start md:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-xs">
            <FileSearch className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Translation Audit Trail
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Track, review, and verify all translation activities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <button
            type="button"
            onClick={handleRefresh}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-200 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-indigo-400" />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit Report</span>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY CARDS (DYNAMICALLY CALCULATED) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Translations */}
        <div className="bg-[#0d1322] border border-slate-800 p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Translations</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-white">{totalTranslations}</div>
          <div className="text-[11px] text-slate-500">Evaluated in current dataset</div>
        </div>

        {/* Card 2: Verified */}
        <div className="bg-[#0d1322] border border-slate-800 p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Verified</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-emerald-400">{verifiedCount}</div>
          <div className="text-[11px] text-slate-500">
            {totalTranslations > 0 ? `${Math.round((verifiedCount / totalTranslations) * 100)}% of total` : '0% of total'}
          </div>
        </div>

        {/* Card 3: Needs Review */}
        <div className="bg-[#0d1322] border border-slate-800 p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Needs Review</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-amber-400">{needsReviewCount}</div>
          <div className="text-[11px] text-slate-500">Pending reviewer inspection</div>
        </div>

        {/* Card 4: Average Confidence */}
        <div className="bg-[#0d1322] border border-slate-800 p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Average Confidence</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-purple-400">{avgConfidence}%</div>
          <div className="text-[11px] text-slate-500">Global translation accuracy index</div>
        </div>
      </div>

      {/* 3. SEARCH AND FILTER SECTION */}
      <div className="bg-[#0d1322] border border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Translation ID (e.g. TR-20261007-0042), User, or Text..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Select Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Date Range Filter */}
            <div>
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="All">📅 All Dates</option>
                <option value="Today">Today (Oct 7)</option>
                <option value="7Days">Last 7 Days</option>
              </select>
            </div>

            {/* Source Lang Filter */}
            <div>
              <select
                value={selectedSourceLang}
                onChange={(e) => setSelectedSourceLang(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="All">🌐 Source: All</option>
                <option value="en">English (EN)</option>
                <option value="ta">Tamil (TA)</option>
                <option value="hi">Hindi (HI)</option>
                <option value="es">Spanish (ES)</option>
                <option value="ja">Japanese (JA)</option>
              </select>
            </div>

            {/* Target Lang Filter */}
            <div>
              <select
                value={selectedTargetLang}
                onChange={(e) => setSelectedTargetLang(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="All">🎯 Target: All</option>
                <option value="ta">Tamil (TA)</option>
                <option value="en">English (EN)</option>
                <option value="hi">Hindi (HI)</option>
                <option value="es">Spanish (ES)</option>
                <option value="ja">Japanese (JA)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="All">🏷️ Status: All</option>
                <option value="Verified">Verified (Green)</option>
                <option value="Reviewed">Reviewed (Blue)</option>
                <option value="Needs Review">Needs Review (Orange)</option>
                <option value="Corrected">Corrected (Purple)</option>
                <option value="Failed">Failed (Red)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4. RESPONSIVE AUDIT TABLE */}
      <div className="bg-[#0d1322] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-[11px] uppercase tracking-wider font-bold text-slate-400 select-none">
              <tr>
                <th scope="col" className="px-4 py-3.5">Translation ID</th>
                <th scope="col" className="px-4 py-3.5">Date & Time</th>
                <th scope="col" className="px-4 py-3.5">User</th>
                <th scope="col" className="px-4 py-3.5">Source Lang</th>
                <th scope="col" className="px-4 py-3.5">Source Text</th>
                <th scope="col" className="px-4 py-3.5">Target Lang</th>
                <th scope="col" className="px-4 py-3.5">Translated Text</th>
                <th scope="col" className="px-4 py-3.5">Confidence</th>
                <th scope="col" className="px-4 py-3.5">Status</th>
                <th scope="col" className="px-4 py-3.5">Reviewed By</th>
                <th scope="col" className="px-4 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {currentPageRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    No translation audit records match your search & filter criteria.
                  </td>
                </tr>
              ) : (
                currentPageRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* ID */}
                    <td className="px-4 py-3.5 font-mono text-indigo-400 font-bold whitespace-nowrap">
                      {r.id}
                    </td>

                    {/* Date & Time */}
                    <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">
                      {r.dateTime}
                    </td>

                    {/* User */}
                    <td className="px-4 py-3.5 font-bold text-white whitespace-nowrap">
                      {r.user}
                    </td>

                    {/* Source Lang */}
                    <td className="px-4 py-3.5 font-bold text-slate-300 uppercase whitespace-nowrap">
                      {r.sourceLangName}
                    </td>

                    {/* Source Text */}
                    <td className="px-4 py-3.5 text-slate-200 max-w-xs truncate" title={r.sourceText}>
                      "{r.sourceText}"
                    </td>

                    {/* Target Lang */}
                    <td className="px-4 py-3.5 font-bold text-slate-300 uppercase whitespace-nowrap">
                      {r.targetLangName}
                    </td>

                    {/* Translated Text */}
                    <td className="px-4 py-3.5 text-slate-200 max-w-xs truncate" title={r.translatedText}>
                      "{r.translatedText}"
                    </td>

                    {/* Confidence */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`font-mono font-bold ${
                        r.confidence >= 95 ? 'text-emerald-400' : r.confidence >= 90 ? 'text-blue-400' : 'text-amber-400'
                      }`}>
                        {r.confidence}%
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getStatusBadge(r.status)}
                    </td>

                    {/* Reviewed By */}
                    <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">
                      {r.reviewedBy}
                    </td>

                    {/* Action View Button */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedRecord(r)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-300 hover:text-white font-bold text-xs transition-all flex items-center gap-1.5 mx-auto cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION BAR */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value={5}>5 records per page</option>
              <option value={10}>10 records per page</option>
              <option value={20}>20 records per page</option>
            </select>
            <span>• Showing {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} entries</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-200">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. DETAILED AUDIT MODAL / INSPECTOR PANEL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0d1322] border border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 text-xs space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-base font-extrabold text-indigo-400">
                    {selectedRecord.id}
                  </span>
                  {getStatusBadge(selectedRecord.status)}
                </div>
                <p className="text-slate-400 text-xs mt-1">
                  Recorded at {selectedRecord.dateTime}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Original vs Translated Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
                  <span>Source ({selectedRecord.sourceLangName})</span>
                  <button
                    type="button"
                    onClick={() => handleSpeakText(selectedRecord.sourceText, selectedRecord.sourceLang)}
                    className="hover:text-indigo-400 p-1 cursor-pointer"
                    title="Play Audio"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm font-medium text-slate-100 leading-relaxed">
                  "{selectedRecord.sourceText}"
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-indigo-400 uppercase">
                  <span>Target ({selectedRecord.targetLangName})</span>
                  <button
                    type="button"
                    onClick={() => handleSpeakText(selectedRecord.translatedText, selectedRecord.targetLang)}
                    className="hover:text-indigo-300 p-1 cursor-pointer"
                    title="Play Audio"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm font-semibold text-white leading-relaxed">
                  "{selectedRecord.translatedText}"
                </p>
              </div>
            </div>

            {/* Detailed Audit Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">User</label>
                <span className="font-bold text-white">{selectedRecord.user}</span>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Reviewed By</label>
                <span className="font-bold text-indigo-300">{selectedRecord.reviewedBy}</span>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Confidence Score</label>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-400">{selectedRecord.confidence}%</span>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${selectedRecord.confidence}%` }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Translation Method</label>
                <span className="font-medium text-slate-300">{selectedRecord.translationMethod}</span>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Audio Status</label>
                <span className="font-medium text-slate-300">{selectedRecord.audioStatus}</span>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Ledger Status</label>
                <span className="font-medium text-emerald-400">{selectedRecord.ledgerStatus}</span>
              </div>
            </div>

            {/* Correction History & Notes */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500 block">Correction History & Audit Log</label>
              <p className="text-xs text-slate-300 italic">
                {selectedRecord.correctionHistory}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(selectedRecord.translatedText);
                  setCopiedText(true);
                  setTimeout(() => setCopiedText(false), 2000);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedText ? 'Copied' : 'Copy Translation'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
