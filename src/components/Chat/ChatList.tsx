import React, { useState } from 'react';
import { Chat } from '../../store/appState';
import { Search, Plus, Users, MessageSquare, Phone, Video, Circle } from 'lucide-react';

interface ChatListProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateNewChat?: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onCreateNewChat,
}) => {
  const [search, setSearch] = useState('');

  // Preset mock contacts if empty to match wireframe exactly
  const contactPresets = [
    { id: 'c_priya', name: 'Priya Sharma', status: 'online', statusColor: 'bg-emerald-500', unread: 0, lang: '🇮🇳 Tamil • 🇺🇸 EN', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', lastMsg: 'Shall we meet at the new café on Friday?' },
    { id: 'c_michael', name: 'Michael Chen', status: 'online', statusColor: 'bg-emerald-500', unread: 2, lang: '🇺🇸 English • 🇨🇳 ZH', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', lastMsg: 'Reviewed the translation audit trail.' },
    { id: 'c_yuki', name: 'Yuki Tanaka', status: 'away', statusColor: 'bg-amber-500', unread: 1, lang: '🇯🇵 Japanese • 🇺🇸 EN', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80', lastMsg: 'Konnichiwa! Presentation is ready.' },
    { id: 'c_sarah', name: 'Sarah Johnson', status: 'busy', statusColor: 'bg-rose-500', unread: 4, lang: '🇺🇸 English • 🇪🇸 ES', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', lastMsg: 'Can we check the Spanish phrases?' },
    { id: 'c_raj', name: 'Raj Kumar', status: 'online', statusColor: 'bg-emerald-500', unread: 0, lang: '🇮🇳 Hindi • 🇺🇸 EN', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80', lastMsg: 'Shared the vocabulary deck.' },
    { id: 'c_david', name: 'David Smith', status: 'offline', statusColor: 'bg-slate-400', unread: 0, lang: '🇬🇧 English', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80', lastMsg: 'Meeting rescheduled to 3 PM.' },
    { id: 'c_maria', name: 'Maria Garcia', status: 'offline', statusColor: 'bg-slate-400', unread: 5, lang: '🇪🇸 Spanish • 🇺🇸 EN', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80', lastMsg: 'Gracias por la traducción!' },
  ];

  const mergedChats = chats;

  const filtered = mergedChats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-full md:w-80 shrink-0">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Contacts</span>
          </h2>
          {onCreateNewChat && (
            <button
              type="button"
              onClick={onCreateNewChat}
              className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
              title="New Contact / Group"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search contacts..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.map((chat, idx) => {
          const isActive = activeChatId === chat.id || (!activeChatId && idx === 0);
          const status = idx % 4 === 0 ? 'online' : idx % 4 === 1 ? 'online' : idx % 4 === 2 ? 'away' : 'busy';
          const statusColor =
            status === 'online'
              ? 'bg-emerald-500'
              : status === 'away'
              ? 'bg-amber-500'
              : status === 'busy'
              ? 'bg-rose-500'
              : 'bg-slate-400';

          return (
            <button
              key={chat.id}
              type="button"
              onClick={() => onSelectChat(chat.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 shadow-xs'
                  : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              {/* Avatar with Status Indicator Dot */}
              <div className="relative shrink-0">
                <img
                  src={
                    chat.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                  }
                  alt={chat.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                />
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${statusColor} border-2 border-white dark:border-slate-900`}
                  title={status}
                />
              </div>

              {/* Name & Last Message */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-xs font-bold truncate ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {chat.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                    {chat.lastMessageTime || '10:30 AM'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {chat.lastMessage || 'Real-time translation active'}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary Indicators Footer */}
      {(() => {
        const totalUnread = mergedChats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
        return (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
              <MessageSquare className="w-3.5 h-3.5" /> {totalUnread} unread
            </span>
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
              <Phone className="w-3.5 h-3.5 text-emerald-500" /> Active Contacts ({filtered.length})
            </span>
          </div>
        );
      })()}
    </div>
  );
};
