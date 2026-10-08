import React, { useMemo, useState, useEffect } from 'react';
import {
  User,
  Message,
  TranslationDebtItem,
  AuditTrailEntry,
  SharedVocabEntry,
  LearningWord,
  AnalyticsSummary,
  DebtAnalytics,
} from './types';
import { useAppState } from './store/appState';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AuthFlow } from './components/Auth/AuthFlow';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastNotifications } from './components/ToastNotifications';
import { InstallPrompt } from './components/InstallPrompt';
import {
  fetchDebtItems,
  fetchAuditEntries,
  fetchSharedVocabulary,
  fetchLearningWords,
} from './services/api';

// Domain views
import { DashboardView } from './components/views/DashboardView';
import { ChatManager } from './components/Chat/ChatManager';
import { TranslationPanel } from './components/TranslationPanel';
import { EchoMode } from './components/EchoMode';
import { PerceptionAnalysis } from './components/PerceptionAnalysis';
import { CodeSwitchRadar } from './components/CodeSwitchRadar';
import { TranslationDebtLedger } from './components/TranslationDebtLedger';
import { TestDashboard } from './components/TestDashboard';
import { AuditTrailView } from './components/views/AuditTrailView';
import { TranslationDebtDashboardView } from './components/views/TranslationDebtDashboardView';
import { DebtRemediationQueueView } from './components/views/DebtRemediationQueueView';
import { DebtReportsView } from './components/views/DebtReportsView';
import { SharedVocabularyView } from './components/views/SharedVocabularyView';
import { LearnAsYouChatView } from './components/views/LearnAsYouChatView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { DatasetTrainingStudio } from './components/Training/DatasetTrainingStudio';
import { VideoCallView } from './components/views/VideoCallView';
import { CalendarView } from './components/views/CalendarView';
import { SettingsView } from './components/views/SettingsView';
import { NotificationsView } from './components/views/NotificationsView';

import {
  LayoutDashboard,
  MessageSquare,
  Globe,
  ShieldCheck,
  Video,
  Settings as SettingsIcon,
  Sparkles,
  Activity,
  Calculator,
} from 'lucide-react';

export default function App() {
  const {
    user,
    setUser,
    logout,
    activeView,
    setActiveView,
    debtItems,
    setDebtItems,
    addDebtItem,
    resolveDebtItem,
    auditEntries,
    setAuditEntries,
    vocabList,
    setVocabList,
    learningWords,
    setLearningWords,
    addLearningWord,
    addNotification,
  } = useAppState();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Initialize dynamic backend data on first run
  useEffect(() => {
    // 1. Auto-login or verify default user session
    if (!user) {
      const defaultUser: User = {
        userId: 'usr_thirisha',
        username: 'Thirisha P',
        email: 'thirisha.p@linguachat.ai',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        preferredLanguage: 'en',
        cameraEnabled: true,
        microphoneEnabled: true,
        googleCalendarConnected: true,
        isOnline: true,
        lastSeen: 'Just now',
        role: 'user',
      };
      setUser(defaultUser);
    }

    // 2. Fetch live debt items
    fetchDebtItems().then((items) => {
      if (items && items.length > 0) setDebtItems(items);
    });

    // 3. Fetch live audit trail
    fetchAuditEntries().then((entries) => {
      if (entries && entries.length > 0) setAuditEntries(entries);
    });

    // 4. Fetch shared vocabulary
    fetchSharedVocabulary().then((voc) => {
      if (voc && voc.length > 0) setVocabList(voc);
    });

    // 5. Fetch learning words
    fetchLearningWords().then((words) => {
      if (words && words.length > 0) setLearningWords(words);
    });
  }, []);

  // Synchronize URL search parameters with activeView state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const tabParam = url.searchParams.get('tab');

    if (tabParam) {
      if (activeView !== 'settings' && activeView !== 'profile') {
        setActiveView('settings');
      }
    }

    const handlePopState = () => {
      const currentUrl = new URL(window.location.href);
      const currentTab = currentUrl.searchParams.get('tab');
      if (currentTab) {
        setActiveView('settings');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Clean up ?tab=... URL query parameter when switching to non-settings views
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);

    if (activeView !== 'settings' && activeView !== 'profile') {
      if (url.searchParams.has('tab')) {
        url.searchParams.delete('tab');
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
      }
    }
  }, [activeView]);

  const totalDebtScore = Math.round(
    debtItems.reduce((acc, item) => acc + item.debtScore, 0) / (debtItems.length || 1)
  );

  const remediable = debtItems.filter(
    (i) => i.remediationStatus === 'remediated' || i.remediationStatus === 'dismissed' || i.status === 'resolved'
  ).length;
  const remediationPercent = Math.round((remediable / (debtItems.length || 1)) * 100);

  const liveAnalytics: AnalyticsSummary = useMemo(() => {
    const messagesByLanguage: Record<string, number> = {};
    messages.forEach((m) => {
      const lang = m.detectedLanguage || 'en';
      messagesByLanguage[lang] = (messagesByLanguage[lang] || 0) + 1;
    });
    const mixed = messages.filter((m) => m.radarData?.isCodeMixed).length;
    return {
      totalMessagesSent: messages.length,
      translationSuccessRate: Math.round(
        messages.reduce((acc, m) => acc + (m.confidenceScore || 0), 0) / (messages.length || 1)
      ) || 98,
      correctionsSuggested: auditEntries.length,
      correctionsApproved: auditEntries.filter((a) => a.correctionStatus === 'approved').length,
      newWordsLearned: learningWords.length,
      codeSwitchingIndex: Math.round((mixed / (messages.length || 1)) * 100) || 52,
      totalDebtScore,
      activeLanguagePairsCount: Object.keys(messagesByLanguage).length || 5,
      messagesByLanguage: Object.keys(messagesByLanguage).length ? messagesByLanguage : { en: 540, ta: 380, hi: 290, es: 120, ja: 90 },
    };
  }, [messages, auditEntries, learningWords, totalDebtScore]);

  const liveDebtAnalytics: DebtAnalytics = useMemo(() => {
    const byCat = { quick_fix: 0, structural: 0, rewrite: 0 };
    const byRisk = { low: 0, medium: 0, high: 0, critical: 0 };
    const byLang: Record<string, number> = {};
    debtItems.forEach((d) => {
      byCat[d.debtCategory] = (byCat[d.debtCategory] || 0) + 1;
      byRisk[d.riskSeverity] = (byRisk[d.riskSeverity] || 0) + 1;
      const pair = `${d.sourceLanguage}-${d.targetLanguage}`;
      byLang[pair] = (byLang[pair] || 0) + d.debtScore;
    });
    return {
      analyticsId: 'ana_debt_live',
      organizationId: 'org_lingua_01',
      periodStart: '2026-08-01',
      periodEnd: '2026-08-11',
      totalDebt: debtItems.reduce((a, d) => a + d.debtScore, 0),
      averageDebtScore: totalDebtScore,
      totalTranslationsEvaluated: debtItems.length,
      debtByCategory: byCat,
      debtByLanguage: byLang,
      debtByRisk: byRisk,
      remediationRate: remediationPercent,
      estimatedRemediationCostHours: Math.round(debtItems.length * 0.5),
    };
  }, [debtItems, totalDebtScore, remediationPercent]);

  const handleAddToGlossaryFromAudit = (entry: AuditTrailEntry) => {
    if (!user) return;
    const vocabEntry: SharedVocabEntry = {
      vocabId: 'voc_' + Date.now(),
      groupId: 'grp_global_project',
      groupName: '🚀 Project Titan Global Core',
      term: entry.originalMessage,
      sourceLanguage: entry.sourceLanguage,
      translatedTerm: entry.correctedTranslation || entry.aiTranslation,
      targetLanguage: entry.targetLanguage,
      contextUsage: entry.notes || 'Approved from dual-approval audit trail.',
      proposedBy: entry.proposedBy || user.userId,
      proposedByName: entry.proposedByName || user.username,
      approvedBy: user.username,
      correctionCount: 1,
      lastUsedAt: 'Just now',
      tags: ['audit_approved'],
    };
    setVocabList([vocabEntry, ...vocabList]);
    addNotification({
      title: 'Vocabulary Saved',
      message: `"${entry.originalMessage}" added to glossary.`,
      type: 'success',
    });
  };

  return (
    <AuthProvider>
      <ErrorBoundary>
        <div className="min-h-dvh bg-[#0b0f19] text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white overflow-x-hidden">
          {/* Header */}
          <Header
            currentUser={user}
            onOpenAuth={() => setActiveView('auth')}
            onLogout={() => {
              logout();
              setActiveView('auth');
            }}
            onToggleMobileNav={() => setMobileNavOpen(true)}
            totalDebtScore={totalDebtScore}
            activeView={activeView}
            setActiveView={setActiveView}
          />

          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Sidebar */}
            {user && activeView !== 'auth' && (
              <Sidebar
                activeView={activeView}
                setActiveView={setActiveView}
                debtCountHigh={
                  debtItems.filter((i) => i.riskSeverity === 'critical' || i.riskSeverity === 'high')
                    .length
                }
                remediationPercent={remediationPercent}
                mobileOpen={mobileNavOpen}
                onCloseMobile={() => setMobileNavOpen(false)}
              />
            )}

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-[#0b0f19] pb-20 md:pb-0">
              {activeView === 'auth' || !user ? (
                <div className="p-4 md:p-8 flex items-center justify-center min-h-[80vh]">
                  <AuthFlow onSuccess={() => setActiveView('dashboard')} />
                </div>
              ) : (
                <>
                  {/* Dashboard */}
                  {activeView === 'dashboard' && (
                    <DashboardView
                      currentUser={user}
                      totalDebtScore={totalDebtScore}
                      messages={messages}
                      debtItems={debtItems}
                      setActiveView={setActiveView}
                    />
                  )}

                  {/* Real-Time Chat Manager with Socket.io */}
                  {activeView === 'chat' && (
                    <ChatManager
                      onOpenAudit={() => setActiveView('audit_trail')}
                      onOpenRadar={() => setActiveView('audit_trail')}
                      onLearnWord={(w) => addLearningWord(w)}
                      onStartVideoCall={() => setActiveView('video_call')}
                      onStartVoiceCall={() => setActiveView('video_call')}
                    />
                  )}

                  {/* Translation Workbench */}
                  {(activeView === 'translation' || activeView === 'translate') && (
                    <TranslationPanel />
                  )}

                  {/* Echo Mode Back-Translation Checker */}
                  {(activeView === 'echo' || activeView === 'echo_mode') && (
                    <EchoMode currentUser={user} />
                  )}

                  {/* Perception Sentiment & Tone */}
                  {activeView === 'perception' && <PerceptionAnalysis currentUser={user} />}

                  {/* Awesome-MT Dataset Training & Fine-Tuning Studio */}
                  {(activeView === 'training' || activeView === 'dataset_training') && (
                    <DatasetTrainingStudio />
                  )}

                  {/* NCP Automated Testing Lab & Diagnostics */}
                  {(activeView === 'nlp_testing' ||
                    activeView === 'nlp' ||
                    activeView === 'test-dashboard') && <TestDashboard />}

                  {/* Debt Ledger & Quality Gates */}
                  {(activeView === 'debt_calculator' || activeView === 'debt_ledger') && (
                    <TranslationDebtLedger currentUser={user} />
                  )}

                  {activeView === 'debt_dashboard' && (
                    <TranslationDebtDashboardView
                      debtItems={debtItems}
                      analytics={liveDebtAnalytics}
                      totalDebtScore={totalDebtScore}
                      setActiveView={setActiveView}
                    />
                  )}

                  {activeView === 'debt_queue' && (
                    <DebtRemediationQueueView
                      debtItems={debtItems}
                      setDebtItems={setDebtItems}
                      onResolveItem={(id, _txt, notes) => resolveDebtItem(id, notes)}
                    />
                  )}

                  {activeView === 'debt_reports' && (
                    <DebtReportsView analytics={liveDebtAnalytics} />
                  )}

                  {/* Audit Trail Dual Approval */}
                  {(activeView === 'audit' || activeView === 'audit_trail') && (
                    <AuditTrailView
                      currentUser={user}
                      auditEntries={auditEntries}
                      setAuditEntries={setAuditEntries}
                      onAddToGlossary={handleAddToGlossaryFromAudit}
                    />
                  )}

                  {/* Vocabulary & Learning */}
                  {(activeView === 'vocabulary' || activeView === 'shared_vocab') && (
                    <SharedVocabularyView
                      currentUser={user}
                      vocabList={vocabList}
                      setVocabList={setVocabList}
                    />
                  )}

                  {(activeView === 'learn' || activeView === 'learn_chat') && (
                    <LearnAsYouChatView
                      currentUser={user}
                      words={learningWords}
                      setWords={setLearningWords}
                    />
                  )}

                  {/* Analytics */}
                  {activeView === 'analytics' && (
                    <AnalyticsView summary={liveAnalytics} debtAnalytics={liveDebtAnalytics} />
                  )}

                  {/* Video Calling & Subtitles */}
                  {(activeView === 'video' || activeView === 'video_call') && (
                    <VideoCallView currentUser={user} />
                  )}

                  {/* Calendar View */}
                  {(activeView === 'calendar' || activeView === 'calendar_view' || activeView === 'schedule') && (
                    <CalendarView currentUser={user} />
                  )}

                  {/* Notifications View */}
                  {(activeView === 'notifications' || activeView === 'notification') && (
                    <NotificationsView setActiveView={setActiveView} />
                  )}

                  {/* Settings & Profile */}
                  {(activeView === 'settings' || activeView === 'profile') && (
                    <SettingsView currentUser={user} setCurrentUser={setUser} />
                  )}
                </>
              )}
            </main>
          </div>

          {/* Bottom Mobile Navigation Bar */}
          {user && activeView !== 'auth' && (
            <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
              {[
                { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
                { id: 'chat', label: 'Chat', icon: MessageSquare },
                { id: 'translation', label: 'Translate', icon: Globe },
                { id: 'nlp_testing', label: 'NCP', icon: ShieldCheck },
                { id: 'settings', label: 'Settings', icon: SettingsIcon },
              ].map((item) => {
                const Icon = item.icon;
                const active =
                  activeView === item.id ||
                  (item.id === 'translation' && (activeView === 'translate' || activeView === 'echo_mode')) ||
                  (item.id === 'nlp_testing' && (activeView === 'nlp' || activeView === 'test-dashboard'));
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveView(item.id)}
                    className={`flex flex-col items-center justify-center py-2 min-h-14 text-[10px] font-semibold transition-colors ${
                      active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-0.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* In-app Toast Notifications & PWA Install Prompt */}
          <ToastNotifications />
          <InstallPrompt />
        </div>
      </ErrorBoundary>
    </AuthProvider>
  );
}
