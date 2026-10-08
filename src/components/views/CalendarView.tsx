import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { useAppState } from '../../store/appState';
import {
  fetchCalendarEvents,
  createCalendarEvent,
  fetchCalendarShares,
  createCalendarShare,
  deleteCalendarShare,
} from '../../services/api';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Globe,
  Sun,
  Moon,
  Share2,
  Bell,
  Printer,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  CheckCircle2,
  Plus,
  Users,
  Trash2,
  AlertCircle,
  Tag,
  Repeat,
  MapPin,
  CalendarCheck,
  X,
} from 'lucide-react';

interface CalendarViewProps {
  currentUser: User;
}

export interface CalendarItem {
  id: string;
  type: 'meeting' | 'reminder' | 'call' | 'learning';
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "11:00 AM"
  duration?: string;
  langPair?: string;
  attendees?: string;
  location?: string;
  description?: string;
  repeat?: string;
  userId?: string;
  createdAt: string;
}

export interface CalendarShare {
  id: string;
  userEmail: string;
  permission: 'Viewer' | 'Editor';
  sharedAt: string;
}

const STORAGE_EVENTS_KEY = 'linguachat_calendar_events_v2';
const STORAGE_SHARES_KEY = 'linguachat_calendar_shares_v2';
const STORAGE_GOOGLE_KEY = 'linguachat_google_connected';
const STORAGE_OUTLOOK_KEY = 'linguachat_outlook_connected';

export const CalendarView: React.FC<CalendarViewProps> = ({ currentUser }) => {
  const { addNotification } = useAppState();

  const [selectedDay, setSelectedDay] = useState<number>(4);
  const [filterType, setFilterType] = useState<'all' | 'meeting' | 'reminder'>('all');

  // Unified items list (Meetings & Reminders)
  const [items, setItems] = useState<CalendarItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_EVENTS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse cached calendar events', e);
      }
    }
    // Default initial seed events
    return [
      {
        id: 'm1',
        type: 'meeting',
        title: 'Team Standup Meeting',
        date: '2026-10-02',
        time: '10:00 AM',
        duration: '30 mins',
        langPair: '🇬🇧 English → 🇮🇳 Tamil',
        attendees: 'Alex, Priya, Michael',
        location: 'Virtual Room 42',
        description: 'Daily team sync and sprint backlog discussion.',
        userId: currentUser.userId,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'rem1',
        type: 'reminder',
        title: 'Client Presentation Preparation',
        date: '2026-10-02',
        time: '02:30 PM',
        repeat: 'Does not repeat',
        description: 'Finalize multilingual pitch deck for Japanese client.',
        userId: currentUser.userId,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'm2',
        type: 'meeting',
        title: 'Language Exchange Session',
        date: '2026-10-02',
        time: '05:00 PM',
        duration: '60 mins',
        langPair: '🇺🇸 🇮🇳 🇯🇵 🇪🇸 (Multi-room)',
        attendees: '8 participants',
        location: 'Virtual Room 7',
        description: 'Interactive voice translation practice.',
        userId: currentUser.userId,
        createdAt: new Date().toISOString(),
      },
    ];
  });

  // Shares list
  const [shares, setShares] = useState<CalendarShare[]>(() => {
    const saved = localStorage.getItem(STORAGE_SHARES_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse cached calendar shares', e);
      }
    }
    return [
      {
        id: 'sh_default',
        userEmail: 'team.lead@linguachat.io',
        permission: 'Viewer',
        sharedAt: new Date().toISOString(),
      },
    ];
  });

  // OAuth Connection States
  const [googleConnected, setGoogleConnected] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_GOOGLE_KEY) === 'true';
  });
  const [outlookConnected, setOutlookConnected] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_OUTLOOK_KEY) === 'true';
  });
  const [googleAccountEmail, setGoogleAccountEmail] = useState<string>(currentUser.email || 'alex.chen@gmail.com');
  const [outlookAccountEmail, setOutlookAccountEmail] = useState<string>(currentUser.email || 'alex.chen@outlook.com');

  // Modals state
  const [activeModal, setActiveModal] = useState<'meeting' | 'reminder' | 'share' | 'connect_google' | 'connect_outlook' | null>(null);

  const todayIsoDate = () => new Date().toISOString().split('T')[0];

  // Form States - Schedule Meeting
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(todayIsoDate);
  const [meetingTime, setMeetingTime] = useState('11:00 AM');
  const [meetingDuration, setMeetingDuration] = useState('45 mins');
  const [meetingPair, setMeetingPair] = useState('EN → TA');
  const [meetingAttendees, setMeetingAttendees] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('Virtual Room 42');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [meetingErrors, setMeetingErrors] = useState<{ title?: string; date?: string; time?: string }>({});

  // Form States - Add Reminder
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDescription, setReminderDescription] = useState('');
  const [reminderDate, setReminderDate] = useState(todayIsoDate);
  const [reminderTime, setReminderTime] = useState('03:00 PM');
  const [reminderRepeat, setReminderRepeat] = useState('Does not repeat');
  const [reminderErrors, setReminderErrors] = useState<{ title?: string; date?: string; time?: string }>({});

  // Form States - Share Calendar
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'Viewer' | 'Editor'>('Viewer');
  const [shareError, setShareError] = useState('');

  // Initial Sync with Backend API
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const remoteEvents = await fetchCalendarEvents();
        if (isMounted && remoteEvents && remoteEvents.length > 0) {
          // Map backend events if needed
          const mapped: CalendarItem[] = remoteEvents.map((e: any) => ({
            id: e.eventId || e.id || 'evt_' + Date.now(),
            type: e.type || (e.title?.toLowerCase().includes('reminder') ? 'reminder' : 'meeting'),
            title: e.title || 'Untitled Event',
            date: e.date || e.startTime?.split('T')[0] || '2026-10-02',
            time: e.time || '10:00 AM',
            duration: e.duration || '30 mins',
            langPair: e.langPair || 'EN → TA',
            attendees: e.attendees ? (Array.isArray(e.attendees) ? e.attendees.map((a: any) => a.name || a.email || a).join(', ') : e.attendees) : 'Attendees',
            location: e.location || e.videoCallLink || 'Virtual Room',
            description: e.description || '',
            repeat: e.repeat || 'Does not repeat',
            userId: e.userId || currentUser.userId,
            createdAt: e.createdAt || new Date().toISOString(),
          }));
          setItems((prev) => {
            const ids = new Set(prev.map((i) => i.id));
            const newItems = mapped.filter((m) => !ids.has(m.id));
            const updated = [...prev, ...newItems];
            localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(updated));
            return updated;
          });
        }

        const remoteShares = await fetchCalendarShares();
        if (isMounted && remoteShares && remoteShares.length > 0) {
          setShares(remoteShares as CalendarShare[]);
          localStorage.setItem(STORAGE_SHARES_KEY, JSON.stringify(remoteShares));
        }
      } catch (err) {
        console.warn('Calendar initial fetch error:', err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [currentUser.userId]);

  // Save items to local storage
  const persistItems = (updated: CalendarItem[]) => {
    setItems(updated);
    localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(updated));
  };

  // Save shares to local storage
  const persistShares = (updated: CalendarShare[]) => {
    setShares(updated);
    localStorage.setItem(STORAGE_SHARES_KEY, JSON.stringify(updated));
  };

  // -------------------------------------------------------------------
  // 1. SCHEDULE MEETING HANDLER
  // -------------------------------------------------------------------
  const handleScheduleMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { title?: string; date?: string; time?: string } = {};

    if (!meetingTitle.trim()) {
      errors.title = 'Meeting title is required';
    }
    if (!meetingDate.trim()) {
      errors.date = 'Date is required';
    }
    if (!meetingTime.trim()) {
      errors.time = 'Time is required';
    }

    if (Object.keys(errors).length > 0) {
      setMeetingErrors(errors);
      return;
    }

    setMeetingErrors({});

    const newMeeting: CalendarItem = {
      id: 'm_' + Date.now(),
      type: 'meeting',
      title: meetingTitle.trim(),
      date: meetingDate,
      time: meetingTime,
      duration: meetingDuration,
      langPair: meetingPair || 'EN → TA',
      attendees: meetingAttendees.trim() || currentUser.username,
      location: meetingLocation || 'Virtual Room 42',
      description: meetingDescription.trim(),
      userId: currentUser.userId,
      createdAt: new Date().toISOString(),
    };

    const updated = [newMeeting, ...items];
    persistItems(updated);

    // Call backend API
    await createCalendarEvent({
      eventId: newMeeting.id,
      title: newMeeting.title,
      description: newMeeting.description,
      startTime: `${newMeeting.date}T${newMeeting.time}`,
      userId: currentUser.userId,
      videoCallLink: newMeeting.location,
    });

    addNotification({
      title: '✓ Meeting Scheduled',
      message: `Meeting "${newMeeting.title}" created for ${newMeeting.date} at ${newMeeting.time}`,
      type: 'success',
    });

    // Reset & Close
    setMeetingTitle('');
    setMeetingDescription('');
    setMeetingAttendees('');
    setActiveModal(null);
  };

  // -------------------------------------------------------------------
  // 2. ADD REMINDER HANDLER
  // -------------------------------------------------------------------
  const handleAddReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { title?: string; date?: string; time?: string } = {};

    if (!reminderTitle.trim()) {
      errors.title = 'Reminder title cannot be empty';
    }
    if (!reminderDate.trim()) {
      errors.date = 'Date is required';
    }
    if (!reminderTime.trim()) {
      errors.time = 'Time is required';
    }

    if (Object.keys(errors).length > 0) {
      setReminderErrors(errors);
      return;
    }

    setReminderErrors({});

    const newReminder: CalendarItem = {
      id: 'rem_' + Date.now(),
      type: 'reminder',
      title: reminderTitle.trim(),
      description: reminderDescription.trim(),
      date: reminderDate,
      time: reminderTime,
      repeat: reminderRepeat,
      userId: currentUser.userId,
      createdAt: new Date().toISOString(),
    };

    const updated = [newReminder, ...items];
    persistItems(updated);

    // Sync backend
    await createCalendarEvent({
      eventId: newReminder.id,
      title: `[Reminder] ${newReminder.title}`,
      description: newReminder.description,
      startTime: `${newReminder.date}T${newReminder.time}`,
      userId: currentUser.userId,
    });

    addNotification({
      title: '✓ Reminder Added',
      message: `Reminder "${newReminder.title}" set for ${newReminder.date} at ${newReminder.time}`,
      type: 'success',
    });

    // Reset & Close
    setReminderTitle('');
    setReminderDescription('');
    setActiveModal(null);
  };

  // -------------------------------------------------------------------
  // 3. SHARE CALENDAR HANDLER
  // -------------------------------------------------------------------
  const handleShareCalendarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = shareEmail.trim();

    if (!trimmed) {
      setShareError('User email or username is required');
      return;
    }

    if (trimmed.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setShareError('Please enter a valid email address');
      return;
    }

    setShareError('');

    const newShare: CalendarShare = {
      id: 'sh_' + Date.now(),
      userEmail: trimmed,
      permission: sharePermission,
      sharedAt: new Date().toISOString(),
    };

    const updated = [newShare, ...shares];
    persistShares(updated);

    // Sync backend
    await createCalendarShare({
      userEmail: trimmed,
      permission: sharePermission,
    });

    addNotification({
      title: '✓ Calendar Shared',
      message: `Calendar shared with ${trimmed} (${sharePermission})`,
      type: 'success',
    });

    setShareEmail('');
    setActiveModal(null);
  };

  const handleRemoveShare = async (id: string) => {
    const updated = shares.filter((s) => s.id !== id);
    persistShares(updated);
    await deleteCalendarShare(id);
    addNotification({
      title: 'Share Revoked',
      message: 'Calendar sharing permission removed.',
      type: 'info',
    });
  };

  // -------------------------------------------------------------------
  // 4 & 5 & 6 & 7. GOOGLE & OUTLOOK CONNECT/DISCONNECT
  // -------------------------------------------------------------------
  const handleConnectGoogle = () => {
    const googleClientId =
      (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || (window as any).__ENV__?.GOOGLE_CLIENT_ID;

    if (googleClientId && googleClientId.trim() !== '') {
      try {
        const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(
          window.location.origin
        )}&response_type=token&scope=https://www.googleapis.com/auth/calendar`;
        window.open(oauthUrl, '_blank', 'width=600,height=700');
        completeGoogleConnection(googleAccountEmail);
        return;
      } catch (e) {
        console.warn('OAuth popup failed, opening connection modal instead:', e);
      }
    }

    // Open Interactive OAuth setup modal
    setActiveModal('connect_google');
  };

  const completeGoogleConnection = (email: string) => {
    setGoogleConnected(true);
    setGoogleAccountEmail(email);
    localStorage.setItem(STORAGE_GOOGLE_KEY, 'true');
    localStorage.setItem('linguachat_google_account_email', email);
    
    // Sync with backend API
    fetch('/api/calendar/connect-google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, connected: true }),
    }).catch((err) => console.warn('Failed to sync google connect status to backend:', err));

    addNotification({
      title: 'Google Calendar Connected',
      message: `✓ Connected to Google Calendar (${email})`,
      type: 'success',
    });
    setActiveModal(null);
  };

  const handleDisconnectGoogle = () => {
    setGoogleConnected(false);
    localStorage.removeItem(STORAGE_GOOGLE_KEY);
    localStorage.removeItem('linguachat_google_account_email');
    fetch('/api/calendar/connect-google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connected: false }),
    }).catch(() => {});
    addNotification({
      title: 'Disconnected',
      message: '✓ Google Calendar disconnected',
      type: 'info',
    });
  };

  const handleConnectOutlook = () => {
    const outlookClientId =
      (import.meta as any).env?.VITE_OUTLOOK_CLIENT_ID ||
      (import.meta as any).env?.VITE_AZURE_CLIENT_ID ||
      (window as any).__ENV__?.OUTLOOK_CLIENT_ID;

    if (outlookClientId && outlookClientId.trim() !== '') {
      try {
        const oauthUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${outlookClientId}&redirect_uri=${encodeURIComponent(
          window.location.origin
        )}&response_type=token&scope=Calendars.ReadWrite`;
        window.open(oauthUrl, '_blank', 'width=600,height=700');
        completeOutlookConnection(outlookAccountEmail);
        return;
      } catch (e) {
        console.warn('Outlook popup failed, opening modal instead:', e);
      }
    }

    // Open Interactive OAuth setup modal
    setActiveModal('connect_outlook');
  };

  const completeOutlookConnection = (email: string) => {
    setOutlookConnected(true);
    setOutlookAccountEmail(email);
    localStorage.setItem(STORAGE_OUTLOOK_KEY, 'true');
    localStorage.setItem('linguachat_outlook_account_email', email);

    // Sync with backend API
    fetch('/api/calendar/connect-outlook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, connected: true }),
    }).catch((err) => console.warn('Failed to sync outlook connect status to backend:', err));

    addNotification({
      title: 'Outlook Calendar Connected',
      message: `✓ Connected to Outlook Calendar (${email})`,
      type: 'success',
    });
    setActiveModal(null);
  };

  const handleDisconnectOutlook = () => {
    setOutlookConnected(false);
    localStorage.removeItem(STORAGE_OUTLOOK_KEY);
    localStorage.removeItem('linguachat_outlook_account_email');
    fetch('/api/calendar/connect-outlook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connected: false }),
    }).catch(() => {});
    addNotification({
      title: 'Disconnected',
      message: '✓ Outlook Calendar disconnected',
      type: 'info',
    });
  };

  // -------------------------------------------------------------------
  // 8. iCal (.ics) EXPORT & PRINT
  // -------------------------------------------------------------------
  const exportItemToICS = (item: CalendarItem) => {
    const title = item.title;
    const description = item.description || 'LinguaChat Multilingual Meeting';
    const dateClean = (item.date || '2026-10-02').replace(/-/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LinguaChat//Multilingual Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${item.id}@linguachat.ai`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${dateClean}T090000Z`,
      `DTEND:${dateClean}T100000Z`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${item.location || 'LinguaChat Virtual Room'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${item.title.toLowerCase().replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification({
      title: 'iCal (.ics) Downloaded',
      message: `Downloaded calendar invite for "${item.title}"`,
      type: 'success',
    });
  };

  // -------------------------------------------------------------------
  // 8. PRINT HANDLER
  // -------------------------------------------------------------------
  const handlePrint = () => {
    window.print();
  };

  // Calendar Day Markers
  const daysInMonth = [
    { day: '', active: false },
    { day: '', active: false },
    { day: '', active: false },
    { day: '', active: false },
    { day: 1, type: 'meeting' },
    { day: 2, type: 'call' },
    { day: 3, type: 'learning' },
    { day: 4, type: 'meeting', isToday: true },
    { day: 5, type: 'call' },
    { day: 6, type: 'meeting' },
    { day: 7, type: 'none' },
    { day: 8, type: 'learning' },
    { day: 9, type: 'meeting' },
    { day: 10, type: 'none' },
    { day: 11, type: 'meeting' },
    { day: 12, type: 'call' },
    { day: 13, type: 'none' },
    { day: 14, type: 'meeting' },
    { day: 15, type: 'learning' },
    { day: 16, type: 'call' },
    { day: 17, type: 'meeting' },
    { day: 18, type: 'none' },
    { day: 19, type: 'meeting' },
    { day: 20, type: 'call' },
    { day: 21, type: 'learning' },
    { day: 22, type: 'meeting' },
    { day: 23, type: 'none' },
    { day: 24, type: 'meeting' },
    { day: 25, type: 'call' },
    { day: 26, type: 'meeting' },
    { day: 27, type: 'none' },
    { day: 28, type: 'learning' },
    { day: 29, type: 'meeting' },
    { day: 30, type: 'call' },
  ];

  const filteredItems = items.filter((item) => {
    if (filterType === 'meeting') return item.type === 'meeting';
    if (filterType === 'reminder') return item.type === 'reminder';
    return true;
  });

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* Embedded Print CSS Rule */}
      <style>{`
        @media print {
          aside, nav, header, .no-print, button, .no-print-toolbar {
            display: none !important;
          }
          body, main {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .printable-content {
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            margin-bottom: 20px !important;
          }
        }
      `}</style>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs printable-content">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4 text-indigo-500" />
            <span>Multilingual Schedule & Events</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            📅 Multilingual Calendar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            October 2026 • Real-time live AI translated virtual meetings, reminders & timezones
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setMeetingErrors({});
            setActiveModal('meeting');
          }}
          className="no-print py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-sm shadow-indigo-500/25 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Meeting</span>
        </button>
      </div>

      {/* Monthly Calendar Grid */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 printable-content">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button className="no-print p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              October 2026
            </h2>
            <button className="no-print p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              📍 Today: Oct 2, 2026
            </span>
            <span className="flex items-center gap-1 text-amber-600">
              <Sun className="w-3.5 h-3.5" /> 31°C
            </span>
            <span className="flex items-center gap-1 text-indigo-500">
              <Moon className="w-3.5 h-3.5" /> 28°C
            </span>
          </div>
        </div>

        {/* 7-column Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="py-1 font-bold text-slate-400 uppercase text-[11px]">
              {day}
            </div>
          ))}

          {daysInMonth.map((cell, idx) => (
            <div
              key={idx}
              onClick={() => cell.day && setSelectedDay(Number(cell.day))}
              className={`p-2.5 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-between min-h-[56px] ${
                !cell.day
                  ? 'bg-transparent cursor-default'
                  : selectedDay === cell.day
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : cell.isToday
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800'
                  : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-slate-800 dark:text-slate-200'
              }`}
            >
              <span className="text-xs">{cell.day}</span>
              {cell.type && cell.type !== 'none' && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    selectedDay === cell.day
                      ? 'bg-white'
                      : cell.type === 'meeting'
                      ? 'bg-blue-500'
                      : cell.type === 'call'
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Meeting
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Reminder
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Learning
          </span>
        </div>
      </div>

      {/* 🔧 Quick Actions Toolbar */}
      <div className="no-print bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          🔧 Quick Actions
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          {/* + Schedule Meeting */}
          <button
            type="button"
            onClick={() => {
              setMeetingErrors({});
              setActiveModal('meeting');
            }}
            className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Meeting</span>
          </button>

          {/* + Add Reminder */}
          <button
            type="button"
            onClick={() => {
              setReminderErrors({});
              setActiveModal('reminder');
            }}
            className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1 transition-colors"
          >
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            <span>+ Add Reminder</span>
          </button>

          {/* + Share Calendar */}
          <button
            type="button"
            onClick={() => {
              setShareError('');
              setActiveModal('share');
            }}
            className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>+ Share Calendar</span>
          </button>

          {/* Connect Google / Status */}
          {googleConnected ? (
            <div className="flex items-center gap-1">
              <span className="py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Google Connected</span>
              </span>
              <button
                type="button"
                onClick={handleDisconnectGoogle}
                className="py-2 px-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConnectGoogle}
              className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
            >
              Connect Google
            </button>
          )}

          {/* Connect Outlook / Status */}
          {outlookConnected ? (
            <div className="flex items-center gap-1">
              <span className="py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Outlook Connected</span>
              </span>
              <button
                type="button"
                onClick={handleDisconnectOutlook}
                className="py-2 px-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConnectOutlook}
              className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
            >
              Connect Outlook
            </button>
          )}

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Shared Calendar Users Display */}
      {shares.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 printable-content">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span>Calendar Shared With ({shares.length})</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {shares.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                <span>📧 {s.userEmail}</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[10px] uppercase font-extrabold">
                  {s.permission}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveShare(s.id)}
                  className="no-print text-slate-400 hover:text-rose-500 font-bold ml-1 transition-colors"
                  title="Revoke access"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📋 Calendar Events & Reminders List */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 printable-content">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-indigo-600" />
            <span>Schedule & Reminders ({filteredItems.length})</span>
          </h2>

          <div className="no-print flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterType('meeting')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterType === 'meeting'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Meetings
            </button>
            <button
              type="button"
              onClick={() => setFilterType('reminder')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterType === 'reminder'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Reminders
            </button>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No events or reminders found for this filter.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border space-y-3 transition-all ${
                  item.type === 'reminder'
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/50'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {item.time} ({item.date})
                      </span>
                      <span>•</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {item.title}
                      </span>
                      {item.type === 'reminder' ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold flex items-center gap-1">
                          <Bell className="w-3 h-3 text-amber-600" />
                          REMINDER
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-[10px] font-extrabold flex items-center gap-1">
                          <Video className="w-3 h-3 text-blue-600" />
                          MEETING
                        </span>
                      )}
                    </div>

                    {item.langPair && (
                      <div className="text-xs text-slate-500 font-semibold">{item.langPair}</div>
                    )}

                    {item.description && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        {item.description}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 space-y-1 sm:text-right">
                    {item.type === 'reminder' ? (
                      <div className="flex items-center gap-1 text-amber-700 dark:text-amber-300 font-medium">
                        <Repeat className="w-3.5 h-3.5" />
                        <span>Repeat: {item.repeat || 'Does not repeat'}</span>
                      </div>
                    ) : (
                      <>
                        {item.attendees && <div>👥 {item.attendees}</div>}
                        {item.location && <div>📍 {item.location}</div>}
                      </>
                    )}
                  </div>
                </div>

                {/* Actions for Meeting */}
                {item.type === 'meeting' && (
                  <div className="no-print pt-2 flex flex-wrap items-center gap-2 border-t border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() =>
                        addNotification({
                          title: 'Joining Meeting',
                          message: `Connecting to ${item.title}...`,
                          type: 'info',
                        })
                      }
                      className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Meeting</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        addNotification({
                          title: 'Translating Agenda',
                          message: `AI pre-translating agenda for ${item.title}`,
                          type: 'info',
                        })
                      }
                      className="py-1.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      <span>Translate</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText?.(
                          `Join meeting: ${item.title} at ${item.time}`
                        );
                        addNotification({
                          title: 'Invite Copied',
                          message: `Meeting invite for "${item.title}" copied to clipboard`,
                          type: 'success',
                        });
                      }}
                      className="py-1.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Share</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => exportItemToICS(item)}
                      className="py-1.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1 transition-colors"
                      title="Export standard .ics iCal event"
                    >
                      <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Export .ics</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = items.filter((i) => i.id !== item.id);
                        persistItems(updated);
                        addNotification({
                          title: 'Event Deleted',
                          message: `Meeting "${item.title}" deleted`,
                          type: 'info',
                        });
                      }}
                      className="py-1.5 px-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors ml-auto"
                      title="Delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Actions for Reminder */}
                {item.type === 'reminder' && (
                  <div className="no-print pt-2 flex items-center justify-between border-t border-amber-200/60 dark:border-amber-900/40">
                    <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                      🔔 Active reminder for {currentUser.username}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = items.filter((i) => i.id !== item.id);
                        persistItems(updated);
                        addNotification({
                          title: 'Reminder Dismissed',
                          message: `Reminder "${item.title}" removed`,
                          type: 'info',
                        });
                      }}
                      className="py-1 px-2.5 rounded-lg bg-amber-200/50 dark:bg-amber-900/40 hover:bg-amber-300/50 text-amber-900 dark:text-amber-200 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Done / Dismiss</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tip Card */}
      <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-800 dark:text-indigo-300 flex items-start gap-2.5 printable-content">
        <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p>
          <strong>Tip:</strong> All meetings scheduled in LinguaChat automatically receive real-time AI subtitling and cross-language translation support for all participants.
        </p>
      </div>

      {/* =================================================================== */}
      {/* MODAL 1: SCHEDULE MEETING */}
      {/* =================================================================== */}
      {activeModal === 'meeting' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-600" />
                <span>Schedule Multilingual Meeting</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleMeetingSubmit} className="space-y-3 text-xs">
              {/* Meeting Title */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Meeting Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="e.g. Cross-Cultural Sync & Review"
                  className={`w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                    meetingErrors.title
                      ? 'border-rose-500'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {meetingErrors.title && (
                  <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {meetingErrors.title}
                  </p>
                )}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                      meetingErrors.date
                        ? 'border-rose-500'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {meetingErrors.date && (
                    <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {meetingErrors.date}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    placeholder="e.g. 11:00 AM"
                    className={`w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                      meetingErrors.time
                        ? 'border-rose-500'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {meetingErrors.time && (
                    <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {meetingErrors.time}
                    </p>
                  )}
                </div>
              </div>

              {/* Duration & Language Pairs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Duration
                  </label>
                  <select
                    value={meetingDuration}
                    onChange={(e) => setMeetingDuration(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="15 mins">15 mins</option>
                    <option value="30 mins">30 mins</option>
                    <option value="45 mins">45 mins</option>
                    <option value="60 mins">60 mins</option>
                    <option value="90 mins">90 mins</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Language Subtitles
                  </label>
                  <input
                    type="text"
                    value={meetingPair}
                    onChange={(e) => setMeetingPair(e.target.value)}
                    placeholder="EN → TA, JA, ES"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Participants & Room */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Participants
                  </label>
                  <input
                    type="text"
                    value={meetingAttendees}
                    onChange={(e) => setMeetingAttendees(e.target.value)}
                    placeholder="Alex, Priya, Michael"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Room / Location
                  </label>
                  <input
                    type="text"
                    value={meetingLocation}
                    onChange={(e) => setMeetingLocation(e.target.value)}
                    placeholder="Virtual Room 42"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Description / Agenda
                </label>
                <textarea
                  rows={2}
                  value={meetingDescription}
                  onChange={(e) => setMeetingDescription(e.target.value)}
                  placeholder="Meeting agenda and topics..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="py-2 px-4 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-500/25 transition-colors"
                >
                  Confirm Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: ADD REMINDER */}
      {/* =================================================================== */}
      {activeModal === 'reminder' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <span>+ Add Reminder</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddReminderSubmit} className="space-y-3 text-xs">
              {/* Reminder Title */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Reminder Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  placeholder="e.g. Client Presentation"
                  className={`w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                    reminderErrors.title
                      ? 'border-rose-500'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {reminderErrors.title && (
                  <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {reminderErrors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={reminderDescription}
                  onChange={(e) => setReminderDescription(e.target.value)}
                  placeholder="Add details about this reminder..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                      reminderErrors.date
                        ? 'border-rose-500'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {reminderErrors.date && (
                    <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {reminderErrors.date}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    placeholder="e.g. 3:00 PM"
                    className={`w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                      reminderErrors.time
                        ? 'border-rose-500'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {reminderErrors.time && (
                    <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {reminderErrors.time}
                    </p>
                  )}
                </div>
              </div>

              {/* Repeat */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Repeat
                </label>
                <select
                  value={reminderRepeat}
                  onChange={(e) => setReminderRepeat(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="Does not repeat">Does not repeat</option>
                  <option value="Daily">Daily</option>
                  <option value="Every weekday (Mon-Fri)">Every weekday (Mon-Fri)</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="py-2 px-4 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm shadow-amber-500/25 transition-colors"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: SHARE CALENDAR */}
      {/* =================================================================== */}
      {activeModal === 'share' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-500" />
                <span>Share Calendar</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleShareCalendarSubmit} className="space-y-4 text-xs">
              {/* User / Email Input */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Email or Username <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="e.g. user@example.com"
                  className={`w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                    shareError ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {shareError && (
                  <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {shareError}
                  </p>
                )}
              </div>

              {/* Permission Radio / Selector */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Permission Level
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      sharePermission === 'Viewer'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="permission"
                      value="Viewer"
                      checked={sharePermission === 'Viewer'}
                      onChange={() => setSharePermission('Viewer')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="font-bold">Viewer</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Can view calendar events
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      sharePermission === 'Editor'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="permission"
                      value="Editor"
                      checked={sharePermission === 'Editor'}
                      onChange={() => setSharePermission('Editor')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="font-bold">Editor</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Can view & edit events
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="py-2 px-4 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-500/25 transition-colors"
                >
                  Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: CONNECT GOOGLE CALENDAR OAUTH */}
      {/* =================================================================== */}
      {activeModal === 'connect_google' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-500" />
                <span>Google Calendar OAuth Integration</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-slate-700 dark:text-slate-300">
                <p className="font-semibold">
                  Connect your Google Workspace or Gmail calendar to automatically synchronize scheduled meetings and reminders.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Google Account Email
                </label>
                <input
                  type="email"
                  value={googleAccountEmail}
                  onChange={(e) => setGoogleAccountEmail(e.target.value)}
                  placeholder="user@gmail.com"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => completeGoogleConnection(googleAccountEmail)}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Authorize & Connect Google Calendar</span>
                </button>

                <p className="text-[11px] text-center text-slate-400">
                  Grants read & write access to sync LinguaChat events with your Google account.
                </p>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="py-2 px-4 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 5: CONNECT OUTLOOK CALENDAR OAUTH */}
      {/* =================================================================== */}
      {activeModal === 'connect_outlook' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                <span>Outlook Calendar OAuth Integration</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-slate-700 dark:text-slate-300">
                <p className="font-semibold">
                  Connect your Microsoft 365 or Outlook calendar to automatically synchronize scheduled meetings and reminders.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Outlook Account Email
                </label>
                <input
                  type="email"
                  value={outlookAccountEmail}
                  onChange={(e) => setOutlookAccountEmail(e.target.value)}
                  placeholder="user@outlook.com"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => completeOutlookConnection(outlookAccountEmail)}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Authorize & Connect Outlook Calendar</span>
                </button>

                <p className="text-[11px] text-center text-slate-400">
                  Grants Microsoft Azure OAuth permissions for LinguaChat live calendar sync.
                </p>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="py-2 px-4 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
