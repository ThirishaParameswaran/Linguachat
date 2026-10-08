import React, { useState, useEffect, useMemo } from 'react';
import { User, Message, TranslationDebtItem } from '../../types';
import { useAppState } from '../../store/appState';
import { analyticsService, AnalyticsData } from '../../services/analyticsService';
import { fetchAnalyticsData } from '../../services/api';
import { chatService } from '../../services/chatService';
import {
  MessageSquare,
  Globe,
  Video,
  Calendar,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Clock,
  Activity,
  Mic,
  TrendingUp,
  TrendingDown,
  Leaf,
  Users,
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: User;
  messages?: Message[];
  totalDebtScore?: number;
  debtItems?: TranslationDebtItem[];
  setActiveView: (view: string) => void;
}

// Helper to parse dates safely without throwing RangeError
function safeParseDate(dateInput?: any): Date | null {
  if (!dateInput) return null;
  try {
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

// Safely convert date input to YYYY-MM-DD string
function safeIsoDate(dateInput?: any): string | null {
  const d = safeParseDate(dateInput);
  return d ? d.toISOString().split('T')[0] : null;
}

// Safely format relative time (e.g., "Just now", "2m", "1h")
function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Just now';
  const d = safeParseDate(dateStr);
  if (!d) return dateStr;
  const now = Date.now();
  const diffSec = Math.floor((now - d.getTime()) / 1000);
  if (diffSec < 0 || diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
  return `${Math.floor(diffSec / 86400)}d`;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  messages: propsMessages = [],
  setActiveView,
}) => {
  const {
    chats,
    messages: messagesStore,
    translationHistory,
    auditEntries,
    learningWords,
    user,
  } = useAppState();

  const activeUser = currentUser || user || {
    username: 'Thirisha P',
    fullName: 'Thirisha P',
    email: 'thirisha.p@linguachat.ai',
    preferredLanguage: 'ta',
    twoFactorEnabled: true,
    isOnline: true,
  };

  // State Management
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [hoveredDataPoint, setHoveredDataPoint] = useState<number | null>(null);

  // Calendar State
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());

  // Live timer for current date & time display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Subscribe to Analytics Service & Fetch Backend API & Socket Events
  useEffect(() => {
    let isMounted = true;

    // 1. Fetch backend API endpoint
    fetchAnalyticsData()
      .then((data) => {
        if (isMounted) {
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    // 2. Subscribe to real-time analytics updates from store changes
    const unsubscribeAnalytics = analyticsService.subscribe((data) => {
      if (isMounted) {
        setAnalyticsData(data);
        setIsLoading(false);
      }
    });

    // 3. Listen to Socket.IO events for real-time live refresh
    const rawSocket = chatService.getRawSocket();
    const handleSocketRefresh = () => {
      if (isMounted) {
        const fresh = analyticsService.getAnalytics();
        setAnalyticsData(fresh);
      }
    };

    if (rawSocket) {
      rawSocket.on('new_message', handleSocketRefresh);
    }

    return () => {
      isMounted = false;
      unsubscribeAnalytics();
      if (rawSocket) {
        rawSocket.off('new_message', handleSocketRefresh);
      }
    };
  }, []);

  // Dynamic Greeting based on current time
  const currentHour = currentTime.getHours();
  let dynamicGreeting = 'Good Morning';
  if (currentHour >= 12 && currentHour < 17) {
    dynamicGreeting = 'Good Afternoon';
  } else if (currentHour >= 17 || currentHour < 5) {
    dynamicGreeting = 'Good Evening';
  }

  // Formatted Date & Time Strings
  const dateBadgeString = currentTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeBadgeString = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const userNameDisplay = activeUser.fullName || activeUser.username || 'Thirisha P';

  // -------------------------------------------------------------------
  // REAL DYNAMIC KPI CALCULATIONS (ZERO HARDCODED DEMO NUMBERS)
  // -------------------------------------------------------------------

  // All messages flattened across all store chats and props
  const allMessagesList = useMemo(() => {
    const flatFromStore = Object.values(messagesStore).flat();
    return flatFromStore.length > 0 ? flatFromStore : propsMessages;
  }, [messagesStore, propsMessages]);

  const nowMs = Date.now();
  const ms7Days = 7 * 86400 * 1000;
  const ms14Days = 14 * 86400 * 1000;

  // KPI 1: TOTAL MESSAGES & DYNAMIC 7-DAY CHANGE
  const kpiMessages = useMemo(() => {
    const count = allMessagesList.length;

    let curr7 = 0;
    let prior7 = 0;

    allMessagesList.forEach((m) => {
      const d = safeParseDate(m.timestamp || (m as any).createdAt);
      if (d) {
        const diff = nowMs - d.getTime();
        if (diff >= 0 && diff <= ms7Days) {
          curr7++;
        } else if (diff > ms7Days && diff <= ms14Days) {
          prior7++;
        }
      }
    });

    let trendLabel = '--';
    let isPositive = true;

    if (prior7 > 0) {
      const pct = Math.round(((curr7 - prior7) / prior7) * 1000) / 10;
      isPositive = pct >= 0;
      trendLabel = `${isPositive ? '↑' : '↓'} ${Math.abs(pct)}% vs. last 7 days`;
    } else if (curr7 > 0) {
      trendLabel = `↑ 100% vs. last 7 days`;
      isPositive = true;
    } else {
      trendLabel = `0% vs. last 7 days`;
      isPositive = true;
    }

    return {
      value: count.toLocaleString(),
      rawCount: count,
      trendLabel,
      isPositive,
    };
  }, [allMessagesList, nowMs, ms7Days, ms14Days]);

  // KPI 2: TOTAL TRANSLATIONS & DYNAMIC 7-DAY CHANGE
  const kpiTranslations = useMemo(() => {
    const uniqueKeys = new Set<string>();
    let curr7 = 0;
    let prior7 = 0;

    allMessagesList.forEach((m) => {
      if (m.translatedText && m.translatedText.trim() !== '' && m.translationStatus !== 'failed') {
        const key = m.messageId || `msg_${m.originalText}_${m.targetLanguage}`;
        uniqueKeys.add(key);

        const d = safeParseDate(m.timestamp || (m as any).createdAt);
        if (d) {
          const diff = nowMs - d.getTime();
          if (diff >= 0 && diff <= ms7Days) curr7++;
          else if (diff > ms7Days && diff <= ms14Days) prior7++;
        }
      }
    });

    translationHistory.forEach((th) => {
      if (th.translatedText && th.translatedText.trim() !== '') {
        const key = th.id || `th_${th.sourceText}_${th.targetLang}`;
        uniqueKeys.add(key);

        const d = safeParseDate(th.timestamp);
        if (d) {
          const diff = nowMs - d.getTime();
          if (diff >= 0 && diff <= ms7Days) curr7++;
          else if (diff > ms7Days && diff <= ms14Days) prior7++;
        }
      }
    });

    auditEntries.forEach((ae) => {
      const key = ae.auditId || `ae_${ae.originalMessage}`;
      uniqueKeys.add(key);
    });

    const count = uniqueKeys.size;
    let trendLabel = '--';
    let isPositive = true;

    if (prior7 > 0) {
      const pct = Math.round(((curr7 - prior7) / prior7) * 1000) / 10;
      isPositive = pct >= 0;
      trendLabel = `${isPositive ? '↑' : '↓'} ${Math.abs(pct)}% vs. last 7 days`;
    } else if (curr7 > 0) {
      trendLabel = `↑ 100% vs. last 7 days`;
      isPositive = true;
    } else {
      trendLabel = `0% vs. last 7 days`;
      isPositive = true;
    }

    return {
      value: count.toLocaleString(),
      rawCount: count,
      trendLabel,
      isPositive,
    };
  }, [allMessagesList, translationHistory, auditEntries, nowMs, ms7Days, ms14Days]);

  // KPI 3: ACTIVE LANGUAGES & DYNAMIC 7-DAY CHANGE
  const kpiLanguages = useMemo(() => {
    const totalSet = new Set<string>();
    const curr7Set = new Set<string>();
    const prior7Set = new Set<string>();

    const addLang = (lang?: string, dateInput?: any) => {
      if (!lang || lang === 'auto' || lang.trim() === '') return;
      const normalized = lang.toLowerCase().trim();
      totalSet.add(normalized);

      const d = safeParseDate(dateInput);
      if (d) {
        const diff = nowMs - d.getTime();
        if (diff >= 0 && diff <= ms7Days) curr7Set.add(normalized);
        else if (diff > ms7Days && diff <= ms14Days) prior7Set.add(normalized);
      }
    };

    allMessagesList.forEach((m) => {
      addLang(m.detectedLanguage, m.timestamp);
      addLang(m.targetLanguage, m.timestamp);
    });

    translationHistory.forEach((th) => {
      addLang(th.sourceLang, th.timestamp);
      addLang(th.targetLang, th.timestamp);
    });

    chats.forEach((c) => {
      if (Array.isArray(c.languages)) {
        c.languages.forEach((l) => addLang(l, c.lastMessageTime));
      }
    });

    if (activeUser?.preferredLanguage) addLang(activeUser.preferredLanguage);
    if (activeUser?.nativeLanguage) addLang(activeUser.nativeLanguage);

    const count = totalSet.size;
    const curr7 = curr7Set.size;
    const prior7 = prior7Set.size;

    let trendLabel = '--';
    let isPositive = true;

    if (prior7 > 0) {
      const pct = Math.round(((curr7 - prior7) / prior7) * 1000) / 10;
      isPositive = pct >= 0;
      trendLabel = `${isPositive ? '↑' : '↓'} ${Math.abs(pct)}% vs. last 7 days`;
    } else if (curr7 > 0) {
      trendLabel = `↑ 100% vs. last 7 days`;
      isPositive = true;
    } else {
      trendLabel = `0% vs. last 7 days`;
      isPositive = true;
    }

    return {
      value: count.toString(),
      rawCount: count,
      trendLabel,
      isPositive,
    };
  }, [allMessagesList, translationHistory, chats, activeUser, nowMs, ms7Days, ms14Days]);

  // KPI 4: TRANSLATION ACCURACY & DYNAMIC 7-DAY CHANGE
  const kpiAccuracy = useMemo(() => {
    const scores: number[] = [];
    const curr7Scores: number[] = [];
    const prior7Scores: number[] = [];

    const addScore = (score?: number, dateInput?: any) => {
      if (typeof score !== 'number' || score <= 0) return;
      scores.push(score);

      const d = safeParseDate(dateInput);
      if (d) {
        const diff = nowMs - d.getTime();
        if (diff >= 0 && diff <= ms7Days) curr7Scores.push(score);
        else if (diff > ms7Days && diff <= ms14Days) prior7Scores.push(score);
      }
    };

    allMessagesList.forEach((m) => addScore(m.confidenceScore, m.timestamp));
    translationHistory.forEach((th) => addScore(th.confidenceScore, th.timestamp));

    if (scores.length === 0) {
      return {
        value: 'N/A',
        trendLabel: '-- vs. last 7 days',
        isPositive: true,
      };
    }

    const avg = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
    const currAvg = curr7Scores.length > 0 ? curr7Scores.reduce((a, b) => a + b, 0) / curr7Scores.length : avg;
    const priorAvg = prior7Scores.length > 0 ? prior7Scores.reduce((a, b) => a + b, 0) / prior7Scores.length : 0;

    let trendLabel = '-- vs. last 7 days';
    let isPositive = true;

    if (priorAvg > 0) {
      const diff = Math.round((currAvg - priorAvg) * 10) / 10;
      isPositive = diff >= 0;
      trendLabel = `${isPositive ? '↑' : '↓'} ${Math.abs(diff)}% vs. last 7 days`;
    } else if (curr7Scores.length > 0) {
      trendLabel = `↑ 0% vs. last 7 days`;
      isPositive = true;
    }

    return {
      value: `${avg}%`,
      trendLabel,
      isPositive,
    };
  }, [allMessagesList, translationHistory, nowMs, ms7Days, ms14Days]);

  // -------------------------------------------------------------------
  // 3. Dynamic 7-Day Activity Chart Data
  // -------------------------------------------------------------------
  const activityData = useMemo(() => {
    const today = new Date();
    const days: { day: string; dateStr: string; translations: number; messages: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dateStr = safeIsoDate(d) || '';
      days.push({ day: dayName, dateStr, translations: 0, messages: 0 });
    }

    allMessagesList.forEach((m) => {
      if (m.timestamp) {
        const mDate = safeIsoDate(m.timestamp);
        if (mDate) {
          const match = days.find((d) => d.dateStr === mDate);
          if (match) {
            match.messages += 1;
            if (m.translatedText || m.targetLanguage) match.translations += 1;
          }
        }
      }
    });

    translationHistory.forEach((t) => {
      if (t.timestamp) {
        const tDate = safeIsoDate(t.timestamp);
        if (tDate) {
          const match = days.find((d) => d.dateStr === tDate);
          if (match) match.translations += 1;
        }
      }
    });

    return days;
  }, [allMessagesList, translationHistory]);

  // SVG Chart Geometry
  const chartWidth = 520;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 25;
  const availableW = chartWidth - paddingX * 2;
  const availableH = chartHeight - paddingY * 2;

  const maxValInChart = useMemo(() => {
    const maxVal = Math.max(...activityData.flatMap((d) => [d.translations, d.messages]), 10);
    return Math.ceil(maxVal / 10) * 10;
  }, [activityData]);

  const getX = (index: number) => paddingX + (index / Math.max(1, activityData.length - 1)) * availableW;
  const getY = (val: number) => chartHeight - paddingY - (val / maxValInChart) * availableH;

  // SVG Path Generators
  const createSmoothPath = (key: 'translations' | 'messages') => {
    const points = activityData.map((d, idx) => ({
      x: getX(idx),
      y: getY(d[key]),
    }));

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const createAreaPath = (key: 'translations' | 'messages') => {
    const linePath = createSmoothPath(key);
    const lastX = getX(activityData.length - 1);
    const firstX = getX(0);
    const bottomY = chartHeight - paddingY;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  // 4. Dynamic Popular Languages Usage
  const popularLanguages = useMemo(() => {
    const counts: Record<string, number> = {};

    allMessagesList.forEach((m) => {
      if (m.detectedLanguage) counts[m.detectedLanguage.toLowerCase()] = (counts[m.detectedLanguage.toLowerCase()] || 0) + 1;
      if (m.targetLanguage) counts[m.targetLanguage.toLowerCase()] = (counts[m.targetLanguage.toLowerCase()] || 0) + 1;
    });

    translationHistory.forEach((t) => {
      if (t.sourceLang) counts[t.sourceLang.toLowerCase()] = (counts[t.sourceLang.toLowerCase()] || 0) + 1;
      if (t.targetLang) counts[t.targetLang.toLowerCase()] = (counts[t.targetLang.toLowerCase()] || 0) + 1;
    });

    chats.forEach((c) => {
      if (Array.isArray(c.languages)) {
        c.languages.forEach((l) => {
          counts[l.toLowerCase()] = (counts[l.toLowerCase()] || 0) + 1;
        });
      }
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const metaMap: Record<string, { name: string; flag: string; color: string }> = {
      en: { name: 'English', flag: '🇬🇧', color: 'bg-blue-500' },
      ta: { name: 'Tamil', flag: '🇮🇳', color: 'bg-purple-500' },
      es: { name: 'Spanish', flag: '🇪🇸', color: 'bg-teal-400' },
      fr: { name: 'French', flag: '🇫🇷', color: 'bg-amber-500' },
      de: { name: 'German', flag: '🇩🇪', color: 'bg-pink-500' },
      hi: { name: 'Hindi', flag: '🇮🇳', color: 'bg-orange-500' },
      ja: { name: 'Japanese', flag: '🇯🇵', color: 'bg-rose-500' },
      others: { name: 'Others', flag: '🌐', color: 'bg-indigo-400' },
    };

    if (total === 0) return [];

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([code, cnt]) => {
        const meta = metaMap[code] || { name: code.toUpperCase(), flag: '🌐', color: 'bg-indigo-400' };
        const pct = Math.round((cnt / total) * 100);
        return { code, name: meta.name, flag: meta.flag, percentage: pct, color: meta.color };
      });
  }, [allMessagesList, translationHistory, chats]);

  // 5. Dynamic Recent Activity & Recent Messages
  const recentActivityList = useMemo(() => {
    if (chats && chats.length > 0) {
      return chats.slice(0, 4).map((c) => ({
        id: c.id,
        name: c.name,
        avatar: c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        message: c.lastMessage || 'Active channel session',
        time: c.lastMessageTime ? formatRelativeTime(c.lastMessageTime) : 'Just now',
        isGroup: c.isGroup,
      }));
    }
    return [];
  }, [chats]);

  const recentMessagesList = useMemo(() => {
    if (allMessagesList && allMessagesList.length > 0) {
      return allMessagesList.slice(-4).reverse().map((m) => ({
        id: m.messageId,
        name: m.senderId === activeUser.userId ? 'You' : m.senderId || 'User',
        avatar: m.senderId === activeUser.userId ? activeUser.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        message: m.translatedText || m.originalText,
        time: formatRelativeTime(m.timestamp),
        isGroup: false,
      }));
    }
    return [];
  }, [allMessagesList, activeUser]);

  // 6. Dynamic Language Learning Progress
  const learningProgressPct = useMemo(() => {
    if (!learningWords || learningWords.length === 0) return 0;
    const mastered = learningWords.filter((w) => (w.masteryLevel || 0) >= 3).length;
    return Math.round((mastered / learningWords.length) * 100);
  }, [learningWords]);

  // 7. Interactive Calendar Calculations
  const prevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  const monthYearDisplay = calendarDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 text-slate-100 font-sans bg-[#080d19] min-h-screen">
      {/* 1. TOP HEADER / WELCOME SECTION */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{dynamicGreeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">{userNameDisplay}!</span></span>
            <span className="inline-block animate-bounce text-2xl">👋</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 font-medium">
            Different languages. Same human emotions.
          </p>
        </div>

        {/* Live Date-Time Pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#111827]/90 border border-slate-800 text-xs font-semibold text-slate-300 shadow-md">
          <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{dateBadgeString}</span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-blue-300">{timeBadgeString}</span>
        </div>
      </div>

      {/* 2. TOP KPI CARDS (4 METRICS) - 100% DYNAMIC & REAL-TIME */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Messages */}
        <div className="bg-[#0e1626] border border-slate-800/80 p-5 rounded-3xl shadow-xl flex items-center justify-between hover:border-blue-500/40 transition-all duration-300 group">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Total Messages</span>
            <div className="text-3xl font-black text-white tracking-tight">
              {isLoading ? '--' : kpiMessages.value}
            </div>
            <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border w-fit ${
              kpiMessages.isPositive ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
            }`}>
              {kpiMessages.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{kpiMessages.trendLabel}</span>
            </div>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-6.5 h-6.5" />
          </div>
        </div>

        {/* Card 2: Total Translations */}
        <div className="bg-[#0e1626] border border-slate-800/80 p-5 rounded-3xl shadow-xl flex items-center justify-between hover:border-purple-500/40 transition-all duration-300 group">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Total Translations</span>
            <div className="text-3xl font-black text-white tracking-tight">
              {isLoading ? '--' : kpiTranslations.value}
            </div>
            <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border w-fit ${
              kpiTranslations.isPositive ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
            }`}>
              {kpiTranslations.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{kpiTranslations.trendLabel}</span>
            </div>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
            <Globe className="w-6.5 h-6.5" />
          </div>
        </div>

        {/* Card 3: Active Languages */}
        <div className="bg-[#0e1626] border border-slate-800/80 p-5 rounded-3xl shadow-xl flex items-center justify-between hover:border-emerald-500/40 transition-all duration-300 group">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Active Languages</span>
            <div className="text-3xl font-black text-white tracking-tight">
              {isLoading ? '--' : kpiLanguages.value}
            </div>
            <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border w-fit ${
              kpiLanguages.isPositive ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
            }`}>
              {kpiLanguages.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{kpiLanguages.trendLabel}</span>
            </div>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-6.5 h-6.5" />
          </div>
        </div>

        {/* Card 4: Translation Accuracy */}
        <div className="bg-[#0e1626] border border-slate-800/80 p-5 rounded-3xl shadow-xl flex items-center justify-between hover:border-pink-500/40 transition-all duration-300 group">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Translation Accuracy</span>
            <div className="text-3xl font-black text-white tracking-tight">
              {isLoading ? '--' : kpiAccuracy.value}
            </div>
            <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border w-fit ${
              kpiAccuracy.isPositive ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
            }`}>
              {kpiAccuracy.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{kpiAccuracy.trendLabel}</span>
            </div>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6.5 h-6.5" />
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION (3 COLUMNS: TRANSLATION ACTIVITY, RECENT ACTIVITY, AI & POPULAR LANGS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMN 1: TRANSLATION ACTIVITY LINE GRAPH (5 COLS) */}
        <div className="lg:col-span-5 bg-[#0e1626] border border-slate-800/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight">Translation Activity</h3>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <span className="text-slate-300">Translations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <span className="text-slate-300">Messages</span>
              </div>
            </div>
          </div>

          {/* SVG Smooth Dual Line Chart */}
          <div className="relative w-full pt-2">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient id="gradientTranslations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="gradientMessages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Dynamic Y-Axis Horizontal Grid Lines */}
              {[0, Math.round(maxValInChart * 0.25), Math.round(maxValInChart * 0.5), Math.round(maxValInChart * 0.75), maxValInChart].map((val) => {
                const y = getY(val);
                return (
                  <g key={val}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="#1e293b"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 4}
                      fill="#64748b"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="sans-serif"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Area Fills */}
              <path d={createAreaPath('translations')} fill="url(#gradientTranslations)" />
              <path d={createAreaPath('messages')} fill="url(#gradientMessages)" />

              {/* Smooth Curves */}
              <path
                d={createSmoothPath('translations')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d={createSmoothPath('messages')}
                fill="none"
                stroke="#a855f7"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Interactive Node Circles & X-Axis Labels */}
              {activityData.map((d, i) => {
                const cx = getX(i);
                const cyTrans = getY(d.translations);
                const cyMsg = getY(d.messages);
                const isHovered = hoveredDataPoint === i;

                return (
                  <g key={d.day} className="cursor-pointer" onMouseEnter={() => setHoveredDataPoint(i)} onMouseLeave={() => setHoveredDataPoint(null)}>
                    {/* X-Axis Label */}
                    <text
                      x={cx}
                      y={chartHeight - 4}
                      fill={isHovered ? '#f8fafc' : '#64748b'}
                      fontSize="10"
                      fontWeight={isHovered ? 'bold' : 'normal'}
                      textAnchor="middle"
                    >
                      {d.day}
                    </text>

                    {/* Translations Point */}
                    <circle
                      cx={cx}
                      cy={cyTrans}
                      r={isHovered ? 6 : 4}
                      fill="#3b82f6"
                      stroke="#0e1626"
                      strokeWidth="2"
                      className="transition-all duration-200"
                    />

                    {/* Messages Point */}
                    <circle
                      cx={cx}
                      cy={cyMsg}
                      r={isHovered ? 6 : 4}
                      fill="#a855f7"
                      stroke="#0e1626"
                      strokeWidth="2"
                      className="transition-all duration-200"
                    />

                    {/* Tooltip on Hover */}
                    {isHovered && (
                      <g>
                        <rect
                          x={cx - 50}
                          y={Math.min(cyTrans, cyMsg) - 45}
                          width="100"
                          height="36"
                          rx="8"
                          fill="#090d16"
                          stroke="#334155"
                          strokeWidth="1"
                        />
                        <text x={cx} y={Math.min(cyTrans, cyMsg) - 30} fill="#60a5fa" fontSize="9" fontWeight="bold" textAnchor="middle">
                          Trans: {d.translations}
                        </text>
                        <text x={cx} y={Math.min(cyTrans, cyMsg) - 18} fill="#c084fc" fontSize="9" fontWeight="bold" textAnchor="middle">
                          Msgs: {d.messages}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* COLUMN 2: RECENT ACTIVITY LIST (3 COLS) */}
        <div className="lg:col-span-3 bg-[#0e1626] border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <h3 className="text-base font-bold text-white tracking-tight">Recent Activity</h3>

          <div className="space-y-3.5 flex-1">
            {recentActivityList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 font-medium">
                No recent activity recorded yet
              </div>
            ) : (
              recentActivityList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveView('chat')}
                  className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-slate-900/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.isGroup || !item.avatar ? (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                        <Users className="w-5 h-5" />
                      </div>
                    ) : (
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-blue-400 transition-colors truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">{item.message}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 shrink-0">{item.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 3: AI ASSISTANT PROMO & POPULAR LANGUAGES (4 COLS) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          {/* AI Assistant Banner Card */}
          <div className="bg-gradient-to-br from-[#271554] via-[#1a113d] to-[#0f0b24] border border-purple-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex items-center justify-between group">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-2 max-w-[62%] z-10">
              <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>AI Assistant</span>
              </h3>
              <p className="text-xs text-purple-200/80 leading-relaxed">
                Get instant help, translations and smart suggestions.
              </p>
              <button
                type="button"
                onClick={() => setActiveView('perception')}
                className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open Assistant</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3D Visual Illustration / Graphic */}
            <div className="w-28 h-24 relative flex items-center justify-center shrink-0 z-10">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-600/30 border border-purple-400/40 backdrop-blur-md flex items-center justify-center shadow-2xl transform rotate-6 group-hover:rotate-0 transition-transform">
                  <Sparkles className="w-8 h-8 text-cyan-300 animate-pulse" />
                </div>
                <div className="absolute top-1 left-0 p-1.5 rounded-lg bg-pink-500 text-white text-[9px] shadow-lg font-bold flex items-center gap-1">
                  <MessageSquare className="w-2.5 h-2.5" />
                  AI
                </div>
                <div className="absolute bottom-1 right-1 p-1.5 rounded-lg bg-blue-500 text-white text-[9px] shadow-lg font-bold">
                  文 A
                </div>
              </div>
            </div>
          </div>

          {/* Popular Languages Card */}
          <div className="bg-[#0e1626] border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-3 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-tight">Popular Languages</h3>
              <button
                type="button"
                onClick={() => setActiveView('translation')}
                className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View all</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {popularLanguages.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500 font-medium">
                  No language data accumulated yet
                </div>
              ) : (
                popularLanguages.map((lang) => (
                  <div key={lang.code} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-200 flex items-center gap-2">
                        <span className="text-base leading-none">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                      <span className="font-mono text-slate-400 font-bold">{lang.percentage}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full ${lang.color} rounded-full transition-all duration-500`}
                        style={{ width: `${lang.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM SECTION (QUICK ACTIONS, SCHEDULE, CALENDAR, RECENT MESSAGES & BANNER) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT BOTTOM COLUMN: QUICK ACTIONS & PROGRESS CARD (4 COLS) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          {/* Quick Actions Card */}
          <div className="bg-[#0e1626] border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight">Quick Actions</h3>

            <div className="grid grid-cols-5 gap-2.5">
              {/* 1. New Message */}
              <button
                type="button"
                onClick={() => setActiveView('chat')}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 hover:scale-105 transition-all cursor-pointer group"
                title="New Message"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5 fill-current" />
                </div>
                <span className="text-[10px] font-bold text-slate-300 mt-2 truncate w-full text-center">New Message</span>
              </button>

              {/* 2. Translate */}
              <button
                type="button"
                onClick={() => setActiveView('translation')}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-400 hover:scale-105 transition-all cursor-pointer group"
                title="Translate"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/30 group-hover:scale-110 transition-transform font-bold text-xs">
                  文 A
                </div>
                <span className="text-[10px] font-bold text-slate-300 mt-2 truncate w-full text-center">Translate</span>
              </button>

              {/* 3. Voice Call */}
              <button
                type="button"
                onClick={() => setActiveView('video_call')}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-400 hover:scale-105 transition-all cursor-pointer group"
                title="Voice Call"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <Mic className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-300 mt-2 truncate w-full text-center">Voice Call</span>
              </button>

              {/* 4. Video Call */}
              <button
                type="button"
                onClick={() => setActiveView('video_call')}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 text-pink-400 hover:scale-105 transition-all cursor-pointer group"
                title="Video Call"
              >
                <div className="w-9 h-9 rounded-xl bg-pink-600 text-white flex items-center justify-center shadow-md shadow-pink-500/30 group-hover:scale-110 transition-transform">
                  <Video className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-300 mt-2 truncate w-full text-center">Video Call</span>
              </button>

              {/* 5. Schedule Meeting */}
              <button
                type="button"
                onClick={() => setActiveView('calendar')}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 hover:scale-105 transition-all cursor-pointer group"
                title="Schedule Meeting"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/30 group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-300 mt-2 truncate w-full text-center">Schedule Meeting</span>
              </button>
            </div>
          </div>

          {/* Language Learning Progress Card */}
          <div className="bg-[#0e1626] border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-3">
            <h3 className="text-base font-bold text-white tracking-tight">Progress</h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300">Language Learning</span>
                <span className="font-mono text-cyan-400">{learningProgressPct}%</span>
              </div>

              <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${learningProgressPct}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 pt-1">
              <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Keep going! You're doing great!</span>
            </div>
          </div>
        </div>

        {/* MIDDLE BOTTOM COLUMN: TODAY'S SCHEDULE & CALENDAR WIDGET (4 COLS) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          {/* Today's Schedule Card */}
          <div className="bg-[#0e1626] border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white tracking-tight">Today's Schedule</h3>
              <button
                type="button"
                onClick={() => setActiveView('calendar')}
                className="text-[11px] font-bold text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
              >
                View all
              </button>
            </div>

            <div className="space-y-2.5 text-xs font-semibold">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
                <span className="font-mono text-slate-400 text-[11px] shrink-0">10:00 AM</span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-slate-200 truncate">Team Meeting <span className="text-slate-500 font-normal">(Online)</span></span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
                <span className="font-mono text-slate-400 text-[11px] shrink-0">01:00 PM</span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />
                  <span className="text-slate-200 truncate">Client Call <span className="text-slate-500 font-normal">(Zoom)</span></span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
                <span className="font-mono text-slate-400 text-[11px] shrink-0">04:00 PM</span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-slate-200 truncate">Project Discussion <span className="text-slate-500 font-normal">(Team)</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Mini Calendar Widget & Quick Stats Bar */}
          <div className="bg-[#0e1626] border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-4">
            {/* Month Header with Controls */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-tight">{monthYearDisplay}</h3>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Days Table Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-slate-500 py-1">
                  {day}
                </div>
              ))}

              {/* Offset for first day of month */}
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <div key={`empty-${idx}`} className="py-1 text-transparent">
                  0
                </div>
              ))}

              {/* Days of current month */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const isSelected = dayNum === selectedDay;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => setSelectedDay(dayNum)}
                    className={`py-1 text-xs rounded-full transition-all cursor-pointer flex items-center justify-center font-mono ${
                      isSelected
                        ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/40 ring-2 ring-blue-400'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            {/* Bottom Quick Stats Row */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] font-bold text-slate-400">Quick Stats</span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView('chat')}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-slate-300 hover:text-emerald-400 transition-all cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <span>New Message</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('translation')}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-slate-300 hover:text-purple-400 transition-all cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <span>Translate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('video_call')}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-slate-300 hover:text-blue-400 transition-all cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                    <Mic className="w-3.5 h-3.5" />
                  </div>
                  <span>Voice</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('video_call')}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-500/50 flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-slate-300 hover:text-pink-400 transition-all cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400">
                    <Video className="w-3.5 h-3.5" />
                  </div>
                  <span>Video Room</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT BOTTOM COLUMN: RECENT MESSAGES & SCENIC MOTIVATIONAL BANNER (4 COLS) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          {/* Recent Messages Card */}
          <div className="bg-[#0e1626] border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white tracking-tight">Recent Messages</h3>
              <button
                type="button"
                onClick={() => setActiveView('chat')}
                className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View all</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentMessagesList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 font-medium">
                  No recent messages sent or received
                </div>
              ) : (
                recentMessagesList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveView('chat')}
                    className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-slate-900/60 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.isGroup || !item.avatar ? (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                          <Users className="w-4 h-4" />
                        </div>
                      ) : (
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-blue-400 transition-colors truncate">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">{item.message}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 shrink-0">{item.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Motivational Hero Scenic Banner Card */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl h-44 border border-slate-800 flex items-end p-5 group">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080d19] via-[#080d19]/40 to-transparent" />

            <div className="relative z-10 space-y-1">
              <h2 className="text-lg md:text-xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                Speak with confidence.
              </h2>
              <p className="text-sm font-bold text-cyan-300 drop-shadow-md">
                Connect without limits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
