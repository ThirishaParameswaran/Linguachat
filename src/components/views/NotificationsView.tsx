import React, { useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Settings,
  Filter,
  MessageSquare,
  Languages,
  Calendar,
  Sliders,
  Users,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Trash2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useAppState } from '../../store/appState';

export interface NotificationRecord {
  id: string;
  category: 'messages' | 'system' | 'updates';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'message' | 'translation' | 'meeting' | 'system' | 'user' | 'security';
  dotColor: string;
  actionView?: string;
}

interface NotificationsViewProps {
  setActiveView: (view: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ setActiveView }) => {
  const { addNotification } = useAppState();

  const [activeTab, setActiveTab] = useState<'all' | 'messages' | 'system' | 'updates'>('all');
  const [filterOption, setFilterOption] = useState<'all' | 'unread' | 'read'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const [notifications, setNotifications] = useState<NotificationRecord[]>([
    {
      id: 'notif_1',
      category: 'messages',
      type: 'message',
      title: 'New message received',
      description: 'Sarah (English) sent you a message: "Hi, can you help me with the translation?"',
      timestamp: '10:24 AM',
      read: false,
      dotColor: 'bg-blue-500',
      actionView: 'chat',
    },
    {
      id: 'notif_2',
      category: 'system',
      type: 'translation',
      title: 'Translation completed',
      description: 'Your translation from English to Tamil is ready. View it now.',
      timestamp: '09:52 AM',
      read: false,
      dotColor: 'bg-emerald-500',
      actionView: 'translation',
    },
    {
      id: 'notif_3',
      category: 'system',
      type: 'meeting',
      title: 'Meeting reminder',
      description: 'Team meeting is scheduled at 11:00 AM today.',
      timestamp: '08:30 AM',
      read: false,
      dotColor: 'bg-indigo-500',
      actionView: 'calendar',
    },
    {
      id: 'notif_4',
      category: 'updates',
      type: 'system',
      title: 'System update',
      description: 'New features have been added to the AI Assistant module. Explore now!',
      timestamp: 'Yesterday',
      read: true,
      dotColor: 'bg-amber-500',
      actionView: 'dashboard',
    },
    {
      id: 'notif_5',
      category: 'messages',
      type: 'user',
      title: 'New user joined',
      description: 'Alex (Reviewer) has joined the LinguaChat team.',
      timestamp: 'Yesterday',
      read: true,
      dotColor: 'bg-blue-500',
      actionView: 'chat',
    },
    {
      id: 'notif_6',
      category: 'system',
      type: 'security',
      title: 'Security alert',
      description: 'Your account was successfully logged in from a new device.',
      timestamp: '2 days ago',
      read: true,
      dotColor: 'bg-slate-400',
      actionView: 'settings',
    },
  ]);

  // Counts for tabs
  const countAll = notifications.length;
  const countMessages = notifications.filter((n) => n.category === 'messages').length;
  const countSystem = notifications.filter((n) => n.category === 'system').length;
  const countUpdates = notifications.filter((n) => n.category === 'updates').length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addNotification({
      title: '✓ Notifications Updated',
      message: 'All notifications marked as read.',
      type: 'success',
    });
  };

  const handleToggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleNotificationClick = (n: NotificationRecord) => {
    // Mark as read when clicked
    setNotifications((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
    );

    if (n.actionView) {
      setActiveView(n.actionView);
    }
  };

  // Filtered notifications logic
  const filteredNotifications = notifications.filter((item) => {
    // Tab filter
    if (activeTab === 'messages' && item.category !== 'messages') return false;
    if (activeTab === 'system' && item.category !== 'system') return false;
    if (activeTab === 'updates' && item.category !== 'updates') return false;

    // Read/Unread dropdown filter
    if (filterOption === 'unread' && item.read) return false;
    if (filterOption === 'read' && !item.read) return false;

    return true;
  });

  const getNotificationIcon = (type: NotificationRecord['type']) => {
    switch (type) {
      case 'message':
        return (
          <div className="w-11 h-11 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5.5 h-5.5" />
          </div>
        );
      case 'translation':
        return (
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Languages className="w-5.5 h-5.5" />
          </div>
        );
      case 'meeting':
        return (
          <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Calendar className="w-5.5 h-5.5" />
          </div>
        );
      case 'system':
        return (
          <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Settings className="w-5.5 h-5.5" />
          </div>
        );
      case 'user':
        return (
          <div className="w-11 h-11 rounded-2xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
            <Users className="w-5.5 h-5.5" />
          </div>
        );
      case 'security':
        return (
          <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5.5 h-5.5" />
          </div>
        );
      default:
        return (
          <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Bell className="w-5.5 h-5.5" />
          </div>
        );
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100 font-sans">
      {/* 1. Header Banner matching wireframe screenshot */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-start md:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
            <Bell className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Notifications
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Stay updated with your latest activities, messages and system updates.
            </p>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Mark all as read</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('settings')}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-xs cursor-pointer"
            title="Notification Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Filter Tabs Bar matching wireframe screenshot */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>All</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'all'
                  ? 'bg-blue-500/40 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {countAll}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'messages'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>Messages</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'messages'
                  ? 'bg-blue-500/40 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {countMessages}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'system'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>System</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'system'
                  ? 'bg-blue-500/40 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {countSystem}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('updates')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'updates'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>Updates</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'updates'
                  ? 'bg-blue-500/40 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {countUpdates}
            </span>
          </button>
        </div>

        {/* Filter Dropdown */}
        <div className="relative self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter: {filterOption === 'all' ? 'All Items' : filterOption === 'unread' ? 'Unread Only' : 'Read Only'}</span>
          </button>

          {showFilterDropdown && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-40 text-xs font-medium animate-fade-in">
              <button
                type="button"
                onClick={() => {
                  setFilterOption('all');
                  setShowFilterDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer ${
                  filterOption === 'all'
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>All Items</span>
                {filterOption === 'all' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFilterOption('unread');
                  setShowFilterDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer ${
                  filterOption === 'unread'
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>Unread Only</span>
                {filterOption === 'unread' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFilterOption('read');
                  setShowFilterDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer ${
                  filterOption === 'read'
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>Read Only</span>
                {filterOption === 'read' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Notifications List matching wireframe screenshot */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No notifications found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              There are no notifications matching your selected filter parameters.
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`group bg-white dark:bg-slate-900 border transition-all rounded-2xl p-4.5 shadow-xs flex items-center justify-between gap-4 cursor-pointer hover:shadow-md ${
                !item.read
                  ? 'border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20'
                  : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700'
              }`}
            >
              {/* Left side: Icon + Content */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {getNotificationIcon(item.type)}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h4>
                    {!item.read && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-snug line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Right side: Timestamp + Status dot + Chevron */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">
                    {item.timestamp}
                  </span>
                </div>

                {/* Read / Unread Status Dot Indicator */}
                <button
                  type="button"
                  onClick={(e) => handleToggleRead(item.id, e)}
                  title={item.read ? 'Mark as unread' : 'Mark as read'}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full block transition-transform ${
                      item.read ? 'bg-slate-300 dark:bg-slate-700' : item.dotColor
                    } ${!item.read ? 'scale-110 shadow-xs' : ''}`}
                  />
                </button>

                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
