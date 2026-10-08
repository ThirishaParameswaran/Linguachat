import React, { useState, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAppState } from '../../store/appState';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import { useMobile } from '../../hooks/useMobile';
import { Message, LearningWord, User } from '../../types';
import { ButtonValidator } from '../ButtonValidator';
import { searchUsers, fetchUsers } from '../../services/api';
import { X, Users, Globe, Plus, Search, Check } from 'lucide-react';

interface ChatManagerProps {
  onOpenAudit?: (message: Message) => void;
  onOpenRadar?: (message: Message) => void;
  onLearnWord?: (word: LearningWord) => void;
  onStartVideoCall?: () => void;
  onStartVoiceCall?: () => void;
}

export const ChatManager: React.FC<ChatManagerProps> = ({
  onOpenAudit,
  onOpenRadar,
  onLearnWord,
  onStartVideoCall,
  onStartVoiceCall,
}) => {
  const { isMobile } = useMobile();
  const { user } = useAppState();
  const {
    chats,
    activeChatId,
    activeChat,
    messages,
    typingUsers,
    isSending,
    setActiveChatId,
    sendMessage,
    sendTyping,
    loadChats,
    createChat,
  } = useChat();

  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [newChatLanguages, setNewChatLanguages] = useState('en, es');
  const [isGroup, setIsGroup] = useState(true);
  const [userQuery, setUserQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (!activeChatId && chats.length > 0) {
      setActiveChatId(chats[0].id);
    }
  }, [chats, activeChatId, setActiveChatId]);

  useEffect(() => {
    if (isNewChatModalOpen) {
      fetchUsers().then((u) => {
        if (u) setAvailableUsers(u.filter((x) => x.userId !== user?.userId));
      });
    }
  }, [isNewChatModalOpen, user?.userId]);

  const handleSendMessage = async (text: string, targetLanguage: string) => {
    if (!activeChatId) return;
    await sendMessage(activeChatId, text, targetLanguage);
  };

  const handleToggleUserSelect = (uid: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleCreateChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatName.trim()) return;

    const langs = newChatLanguages
      .split(',')
      .map((l) => l.trim().toLowerCase())
      .filter(Boolean);

    const participantIds = Array.from(
      new Set([user?.userId || 'usr_me', ...selectedUserIds])
    );

    await createChat({
      name: newChatName.trim(),
      isGroup,
      participantIds,
      languages: langs.length ? langs : ['en', 'es'],
      avatar: isGroup
        ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    });

    setNewChatName('');
    setSelectedUserIds([]);
    setIsNewChatModalOpen(false);
  };

  const filteredUsers = availableUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(userQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userQuery.toLowerCase()) ||
      u.preferredLanguage?.toLowerCase().includes(userQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100dvh-4rem)] md:h-[calc(100vh-4rem)] overflow-hidden bg-slate-100 dark:bg-slate-900">
      {/* Sidebar List (hidden on mobile if activeChat is selected) */}
      {(!isMobile || !activeChatId) && (
        <ChatList
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={(id) => setActiveChatId(id)}
          onCreateNewChat={() => setIsNewChatModalOpen(true)}
        />
      )}

      {/* Main Chat Window (hidden on mobile if no activeChat) */}
      {(!isMobile || activeChatId) && (
        <ChatWindow
          chat={activeChat}
          messages={messages}
          currentUser={user}
          typingUsers={typingUsers}
          isLoading={isSending}
          onSendMessage={handleSendMessage}
          onTyping={sendTyping}
          onBack={isMobile ? () => setActiveChatId(null) : undefined}
          onOpenAudit={onOpenAudit}
          onOpenRadar={onOpenRadar}
          onLearnWord={(term) => {
            if (onLearnWord && user) {
              onLearnWord({
                wordId: 'w_' + Date.now(),
                userId: user.userId,
                word: term.word,
                sourceLanguage: 'auto',
                translation: term.translation,
                targetLanguage: user.preferredLanguage || 'es',
                definition: term.definition,
                phonetic: term.phonetic || '',
                exampleSentence: `Learned in conversation: ${term.word}`,
                masteryLevel: 1,
                nextReviewDate: 'Tomorrow',
                timesReviewed: 1,
                lastTestedAt: 'Just now',
              });
            }
          }}
          onStartVideoCall={onStartVideoCall}
          onStartVoiceCall={onStartVoiceCall}
        />
      )}

      {/* Create New Chat Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Start New Conversation</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewChatModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChatSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Channel / Chat Name
                </label>
                <input
                  type="text"
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  placeholder="e.g. APAC Engineering Hub or Direct Chat"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Languages (comma separated)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={newChatLanguages}
                    onChange={(e) => setNewChatLanguages(e.target.value)}
                    placeholder="en, es, ta, zh, fr"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Add Members from Database */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Add Members ({selectedUserIds.length} selected)
                </label>
                <div className="relative mb-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Search users by name, email, language..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1 p-1 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800">
                  {filteredUsers.length === 0 ? (
                    <div className="text-[11px] text-slate-400 text-center py-3">No matching users</div>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSelected = selectedUserIds.includes(u.userId);
                      return (
                        <button
                          key={u.userId}
                          type="button"
                          onClick={() => handleToggleUserSelect(u.userId)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                            isSelected
                              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200'
                              : 'hover:bg-slate-200/60 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                              alt={u.username}
                              className="w-6 h-6 rounded-full object-cover shrink-0"
                            />
                            <div className="truncate">
                              <span className="font-semibold">{u.username}</span>
                              <span className="text-[10px] text-slate-400 ml-1.5">({u.preferredLanguage || 'en'})</span>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="groupCheck"
                  checked={isGroup}
                  onChange={(e) => setIsGroup(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="groupCheck" className="text-xs text-slate-600 dark:text-slate-400">
                  Multilingual Group Channel (Multiple Participants)
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <ButtonValidator
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setIsNewChatModalOpen(false)}
                >
                  Cancel
                </ButtonValidator>
                <ButtonValidator
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Create Conversation
                </ButtonValidator>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
