import React, { useState, useRef, useEffect } from 'react';
import { Chat, useAppState } from '../../store/appState';
import { Message, User } from '../../types';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { fetchContactDetails } from '../../services/api';
import {
  Phone,
  Video,
  MoreVertical,
  Globe,
  ArrowLeft,
  AlertTriangle,
  BookOpen,
  Activity,
  X,
  Trash2,
} from 'lucide-react';

interface ChatWindowProps {
  chat: Chat | null;
  messages: Message[];
  currentUser: User | null;
  typingUsers: string[];
  isLoading: boolean;
  onSendMessage: (text: string, targetLanguage: string, useEcho?: boolean) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
  onBack?: () => void;
  onOpenAudit?: (message: Message) => void;
  onOpenRadar?: (message: Message) => void;
  onLearnWord?: (term: { word: string; translation: string; definition: string; phonetic?: string }) => void;
  onStartVideoCall?: () => void;
  onStartVoiceCall?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  messages,
  currentUser,
  typingUsers,
  isLoading,
  onSendMessage,
  onTyping,
  onBack,
  onOpenAudit,
  onOpenRadar,
  onLearnWord,
  onStartVideoCall,
  onStartVoiceCall,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Mock messages matching wireframe if chat is empty
  const defaultMessages: Message[] = [
    {
      messageId: 'msg_1',
      senderId: 'usr_priya',
      senderName: 'Priya',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      originalText: 'Hello! How are you today?',
      translatedText: 'இன்று எப்படி இருக்கிறீர்கள்?',
      detectedLanguage: 'en',
      targetLanguage: 'ta',
      confidenceScore: 96,
      timestamp: '10:30 AM',
      status: 'read',
      echoChecked: true,
      sentimentScore: 0.8,
      sentimentLabel: 'positive',
      sentimentEmoji: '😊',
    },
    {
      messageId: 'msg_2',
      senderId: currentUser?.userId || 'usr_me',
      senderName: currentUser?.username || 'You',
      senderAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      originalText: "I'm doing great! Planning to visit Chennai next week.",
      translatedText: 'நான் நன்றாக இருக்கிறேன்! அடுத்த வாரம் சென்னைக்கு வர திட்டமிட்டுள்ளேன்.',
      detectedLanguage: 'en',
      targetLanguage: 'ta',
      confidenceScore: 94,
      timestamp: '10:32 AM',
      status: 'read',
      echoChecked: true,
      sentimentScore: 0.9,
      sentimentLabel: 'positive',
      sentimentEmoji: '🌸',
    },
    {
      messageId: 'msg_3',
      senderId: 'usr_priya',
      senderName: 'Priya',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      originalText: 'Shall we meet at the new café on Friday?',
      translatedText: 'வெள்ளிக்கிழமை புதிய கபேவில் சந்திப்போமா?',
      detectedLanguage: 'en',
      targetLanguage: 'ta',
      confidenceScore: 98,
      timestamp: '10:33 AM',
      status: 'read',
      echoChecked: true,
      sentimentScore: 0.85,
      sentimentLabel: 'positive',
      sentimentEmoji: '☕',
    },
  ];

  const activeMessages = messages;

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showClearChatConfirmModal, setShowClearChatConfirmModal] = useState(false);
  const [contactDetailData, setContactDetailData] = useState<any>(null);
  const [isLoadingContact, setIsLoadingContact] = useState(false);

  const { debtItems, learningWords, setMessagesForChat, addNotification } = useAppState();
  const pendingDebtCount = debtItems.filter(
    (i) => i.remediationStatus !== 'remediated' && i.remediationStatus !== 'dismissed' && i.status !== 'resolved'
  ).length;
  const learnWordsCount = learningWords.length;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeMessages, typingUsers]);

  const contactName = chat ? chat.name : 'Priya Sharma';

  const handleOpenContactDetails = async () => {
    setShowMoreMenu(false);
    setShowContactModal(true);
    setIsLoadingContact(true);
    const targetId = chat?.id || 'usr_priya';
    const data = await fetchContactDetails(targetId);
    setContactDetailData(data);
    setIsLoadingContact(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/70 dark:bg-slate-900/70 overflow-hidden relative">
      {/* Chat Window Header (as specified in Wireframe) */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 -ml-1 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="relative">
            <img
              src={
                chat?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
              }
              alt={contactName}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                💬 Chat with {contactName}
              </h3>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span>🟢</span> Online
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>{contactName}</span>
              <span>•</span>
              <span>🇮🇳 Tamil</span>
              <span>•</span>
              <span>🇺🇸 English</span>
            </div>
          </div>
        </div>

        {/* Action icons: Call 📞, Video 📹, More ⋮ */}
        <div className="flex items-center gap-1 relative">
          <button
            type="button"
            onClick={onStartVoiceCall || onStartVideoCall}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Voice Call"
          >
            <Phone className="w-4 h-4 text-emerald-600" />
          </button>

          <button
            type="button"
            onClick={onStartVideoCall || onStartVoiceCall}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Video Call"
          >
            <Video className="w-4 h-4 text-blue-600" />
          </button>

          <button
            type="button"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="More Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Three Dots More Options Dropdown Menu */}
          {showMoreMenu && (
            <div className="absolute right-0 top-11 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-56 py-2 text-xs font-semibold animate-fade-in">
              <button
                type="button"
                onClick={handleOpenContactDetails}
                className="w-full px-4 py-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <span>👤</span>
                <span>View Contact Details</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  if (chat?.id) {
                    const exportData = JSON.stringify(activeMessages, null, 2);
                    const blob = new Blob([exportData], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `chat_transcript_${chat.id}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    addNotification({
                      title: '📥 Export Chat',
                      message: '✓ Chat transcript exported successfully.',
                      type: 'success',
                    });
                  }
                }}
                className="w-full px-4 py-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <span>📥</span>
                <span>Export Chat Transcript</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  addNotification({
                    title: '🔔 Chat notifications muted',
                    message: 'Notifications are paused.',
                    type: 'info',
                  });
                }}
                className="w-full px-4 py-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <span>🔔</span>
                <span>Mute Notifications</span>
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  setShowClearChatConfirmModal(true);
                }}
                className="w-full px-4 py-2.5 text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
              >
                <span>🗑️</span>
                <span>Clear Chat History</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Scroll Thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Today Timestamp divider */}
        <div className="text-center my-2">
          <span className="px-3 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            📅 Today 10:30 AM
          </span>
        </div>

        {activeMessages.map((msg) => (
          <MessageBubble
            key={msg.messageId}
            message={msg}
            isMe={msg.senderId === currentUser?.userId}
            currentUser={currentUser}
            onOpenAudit={onOpenAudit}
            onOpenRadar={onOpenRadar}
            onLearnWord={onLearnWord}
          />
        ))}

        {/* Animated Typing Indicator — Only rendered when typingUsers exist */}
        {typingUsers && typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 pt-1 px-1 animate-fade-in">
            <span>⚡ {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing</span>
            <span className="inline-flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 typing-dot-1" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 typing-dot-2" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 typing-dot-3" />
            </span>
          </div>
        )}
      </div>

      {/* Message Composer Bottom Input */}
      <MessageInput
        onSendMessage={async (txt, lang) => {
          await onSendMessage(txt, lang);
        }}
        onTyping={onTyping}
        defaultTargetLanguage="ta"
        isLoading={isLoading}
      />

      {/* Bottom Status Indicators Bar (Dynamic values) */}
      <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <span className="font-semibold text-amber-600 dark:text-amber-400">
          Conversation Ledger: {pendingDebtCount} pending
        </span>
        <span className="flex items-center gap-1 font-semibold text-teal-600 dark:text-teal-400">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Learn: {learnWordsCount} new words</span>
        </span>
      </div>

      {/* Contact Info DB-Driven Modal Popup */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <span>👤 Contact Info</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isLoadingContact ? (
              <div className="p-8 text-center text-slate-500 font-semibold space-y-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Fetching contact details from MongoDB...</p>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <img
                    src={contactDetailData?.avatar || contactDetailData?.profilePicture || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'}
                    alt={contactDetailData?.name || contactName}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {contactDetailData?.name || contactName}
                    </h4>
                    <p className="text-slate-500 text-xs">
                      @{contactDetailData?.username || 'priyasharma'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Name</label>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {contactDetailData?.name || contactName}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Languages</label>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {Array.isArray(contactDetailData?.languages)
                        ? contactDetailData.languages.join(', ')
                        : 'Tamil (IN), English (US)'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Status</label>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <span>🟢 {contactDetailData?.status || 'Active'} & Online</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clear Chat History Custom Confirmation Modal */}
      {showClearChatConfirmModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 text-xs space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 font-bold text-base">
              <Trash2 className="w-5 h-5" />
              <span>Clear Chat History?</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
              This action will clear all messages in this conversation. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowClearChatConfirmModal(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowClearChatConfirmModal(false);
                  if (chat?.id) {
                    setMessagesForChat(chat.id, []);
                    addNotification({
                      title: '🗑️ History Cleared',
                      message: 'Chat history cleared for this conversation.',
                      type: 'info',
                    });
                  }
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
