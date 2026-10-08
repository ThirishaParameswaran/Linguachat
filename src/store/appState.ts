import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Message, TranslationDebtItem, AuditTrailEntry, SharedVocabEntry, LearningWord, EchoResult, PerceptionPreview, CodeSwitchRadarData } from '../types';

export interface Chat {
  id: string;
  name: string;
  isGroup: boolean;
  avatar: string;
  participants: Array<{
    userId: string;
    username: string;
    avatar?: string;
    preferredLanguage: string;
  }>;
  languages: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface TranslationHistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: string;
  confidenceScore: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export interface AppState {
  // 1. User Auth State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUserPreferences: (prefs: Partial<User>) => void;

  // 2. Chat State
  chats: Chat[];
  activeChatId: string | null;
  messages: Record<string, Message[]>; // chatId -> messages array
  typingUsers: Record<string, string[]>; // chatId -> list of usernames typing
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  removeChat: (chatId: string) => void;
  setActiveChatId: (chatId: string | null) => void;
  setMessagesForChat: (chatId: string, messages: Message[]) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  setTyping: (chatId: string, username: string, isTyping: boolean) => void;
  clearChatUnread: (chatId: string) => void;

  // 3. Translation State
  sourceLanguage: string;
  targetLanguage: string;
  autoDetectSource: boolean;
  translationHistory: TranslationHistoryItem[];
  currentTranslation: {
    text: string;
    translated: string;
    detectedLang: string;
    confidence: number;
    keyTerms: Array<{ word: string; translation: string; definition: string; phonetic?: string }>;
    isLoading: boolean;
  };
  setSourceLanguage: (lang: string) => void;
  setTargetLanguage: (lang: string) => void;
  setAutoDetectSource: (auto: boolean) => void;
  addTranslationHistory: (item: Omit<TranslationHistoryItem, 'id' | 'timestamp'>) => void;
  trackTranslation: (item: {
    sourceText: string;
    translatedText: string;
    sourceLang: string;
    targetLang: string;
    confidenceScore?: number;
  }) => void;
  clearTranslationHistory: () => void;
  setCurrentTranslation: (data: Partial<AppState['currentTranslation']>) => void;

  // 4. UI State
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  isLoading: boolean;
  activeView: string;
  notifications: NotificationItem[];
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setActiveView: (view: string) => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;

  // 5. Extended Domain State (Audit, Debt, Vocabulary, Learning)
  enabledAiModules: {
    echoMode: boolean;
    perception: boolean;
    codeSwitchRadar: boolean;
    showLabTraining: boolean;
  };
  toggleAiModule: (moduleKey: 'echoMode' | 'perception' | 'codeSwitchRadar' | 'showLabTraining', enabled?: boolean) => void;
  debtItems: TranslationDebtItem[];
  auditEntries: AuditTrailEntry[];
  vocabList: SharedVocabEntry[];
  learningWords: LearningWord[];
  setDebtItems: (items: TranslationDebtItem[]) => void;
  addDebtItem: (item: TranslationDebtItem) => void;
  resolveDebtItem: (debtId: string, notes: string) => void;
  setAuditEntries: (entries: AuditTrailEntry[]) => void;
  addAuditEntry: (entry: AuditTrailEntry) => void;
  updateAuditStatus: (auditId: string, status: AuditTrailEntry['correctionStatus']) => void;
  setVocabList: (vocab: SharedVocabEntry[]) => void;
  addVocabEntry: (entry: SharedVocabEntry) => void;
  setLearningWords: (words: LearningWord[]) => void;
  addLearningWord: (word: LearningWord) => void;
  updateWordMastery: (wordId: string, level: number) => void;
}

export const useAppState = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false, activeChatId: null }),
      updateUserPreferences: (prefs) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...prefs } : null,
        })),

      // Chats
      chats: [],
      activeChatId: null,
      messages: {},
      typingUsers: {},
      setChats: (chats) => set({ chats }),
      addChat: (chat) =>
        set((state) => ({
          chats: [chat, ...state.chats.filter((c) => c.id !== chat.id)],
        })),
      removeChat: (chatId) =>
        set((state) => ({
          chats: state.chats.filter((c) => c.id !== chatId),
          activeChatId: state.activeChatId === chatId ? null : state.activeChatId,
        })),
      setActiveChatId: (chatId) => {
        set({ activeChatId: chatId });
        if (chatId) {
          get().clearChatUnread(chatId);
        }
      },
      setMessagesForChat: (chatId, messages) =>
        set((state) => ({
          messages: { ...state.messages, [chatId]: messages },
        })),
      addMessage: (chatId, message) =>
        set((state) => {
          const current = state.messages[chatId] || [];
          // Avoid duplicate messages
          if (current.some((m) => m.messageId === message.messageId)) return state;
          const updatedChatList = state.chats.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  lastMessage: message.translatedText || message.originalText,
                  lastMessageTime: message.timestamp,
                  unreadCount: state.activeChatId === chatId ? 0 : c.unreadCount + 1,
                }
              : c
          );
          return {
            messages: { ...state.messages, [chatId]: [...current, message] },
            chats: updatedChatList,
          };
        }),
      updateMessage: (chatId, messageId, updates) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [chatId]: (state.messages[chatId] || []).map((m) =>
              m.messageId === messageId ? { ...m, ...updates } : m
            ),
          },
        })),
      deleteMessage: (chatId, messageId) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [chatId]: (state.messages[chatId] || []).filter((m) => m.messageId !== messageId),
          },
        })),
      setTyping: (chatId, username, isTyping) =>
        set((state) => {
          const existing = state.typingUsers[chatId] || [];
          const updated = isTyping
            ? Array.from(new Set([...existing, username]))
            : existing.filter((u) => u !== username);
          return { typingUsers: { ...state.typingUsers, [chatId]: updated } };
        }),
      clearChatUnread: (chatId) =>
        set((state) => ({
          chats: state.chats.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c)),
        })),

      // Translation
      sourceLanguage: 'auto',
      targetLanguage: 'es',
      autoDetectSource: true,
      translationHistory: [],
      currentTranslation: {
        text: '',
        translated: '',
        detectedLang: 'auto',
        confidence: 90,
        keyTerms: [],
        isLoading: false,
      },
      setSourceLanguage: (lang) => set({ sourceLanguage: lang }),
      setTargetLanguage: (lang) => set({ targetLanguage: lang }),
      setAutoDetectSource: (auto) => set({ autoDetectSource: auto }),
      addTranslationHistory: (item) =>
        set((state) => ({
          translationHistory: [
            {
              ...item,
              id: 'th_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
            ...state.translationHistory.slice(0, 49), // Keep latest 50
          ],
        })),
      trackTranslation: (item) =>
        set((state) => ({
          translationHistory: [
            {
              id: 'th_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
              sourceText: item.sourceText,
              translatedText: item.translatedText,
              sourceLang: item.sourceLang,
              targetLang: item.targetLang,
              confidenceScore: item.confidenceScore ?? 90,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
            ...state.translationHistory.slice(0, 49),
          ],
        })),
      clearTranslationHistory: () => set({ translationHistory: [] }),
      setCurrentTranslation: (data) =>
        set((state) => ({
          currentTranslation: { ...state.currentTranslation, ...data },
        })),

      // UI
      theme: 'light',
      sidebarOpen: true,
      mobileMenuOpen: false,
      isLoading: false,
      activeView: 'dashboard',
      notifications: [],
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          const root = document.documentElement;
          if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      },
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setActiveView: (view) => set({ activeView: view }),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: 'notif_' + Date.now(),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              read: false,
            },
            ...state.notifications,
          ],
        })),
      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      clearNotifications: () => set({ notifications: [] }),

      // Extended domain states
      debtItems: [],
      auditEntries: [],
      vocabList: [],
      enabledAiModules: {
        echoMode: true,
        perception: true,
        codeSwitchRadar: true,
        showLabTraining: false,
      },
      toggleAiModule: (moduleKey, enabled) =>
        set((state) => ({
          enabledAiModules: {
            ...state.enabledAiModules,
            [moduleKey]: enabled !== undefined ? enabled : !state.enabledAiModules[moduleKey],
          },
        })),
      learningWords: [],
      setDebtItems: (items) => set({ debtItems: items }),
      addDebtItem: (item) => set((state) => ({ debtItems: [item, ...state.debtItems] })),
      resolveDebtItem: (debtId, notes) =>
        set((state) => ({
          debtItems: state.debtItems.map((i) =>
            i.debtId === debtId
              ? { ...i, remediationStatus: 'remediated', remediationNotes: notes, remediatedAt: 'Just now' }
              : i
          ),
        })),
      setAuditEntries: (entries) => set({ auditEntries: entries }),
      addAuditEntry: (entry) => set((state) => ({ auditEntries: [entry, ...state.auditEntries] })),
      updateAuditStatus: (auditId, status) =>
        set((state) => ({
          auditEntries: state.auditEntries.map((a) => (a.auditId === auditId ? { ...a, correctionStatus: status } : a)),
        })),
      setVocabList: (vocab) => set({ vocabList: vocab }),
      addVocabEntry: (entry) => set((state) => ({ vocabList: [entry, ...state.vocabList] })),
      setLearningWords: (words) => set({ learningWords: words }),
      addLearningWord: (word) =>
        set((state) => {
          if (state.learningWords.some((w) => w.word.toLowerCase() === word.word.toLowerCase())) return state;
          return { learningWords: [word, ...state.learningWords] };
        }),
      updateWordMastery: (wordId, level) =>
        set((state) => ({
          learningWords: state.learningWords.map((w) =>
            w.wordId === wordId ? { ...w, masteryLevel: Math.min(5, Math.max(0, level)) } : w
          ),
        })),
    }),
    {
      name: 'linguachat_app_storage',
      storage: createJSONStorage(() =>
        typeof localStorage !== 'undefined'
          ? localStorage
          : ({
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            } as any)
      ),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        sourceLanguage: state.sourceLanguage,
        targetLanguage: state.targetLanguage,
        translationHistory: state.translationHistory,
        sidebarOpen: state.sidebarOpen,
        enabledAiModules: state.enabledAiModules,
      }),
    }
  )
);

export const useAppStore = useAppState;
