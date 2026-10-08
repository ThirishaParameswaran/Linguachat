import { useEffect, useCallback, useState } from 'react';
import { useAppState, Chat } from '../store/appState';
import { chatService } from '../services/chatService';
import { Message } from '../types';
import { requestTranslation, requestPerceptionAnalysis, requestCodeSwitchRadar } from '../services/api';

export function useChat() {
  const {
    user,
    token,
    chats,
    activeChatId,
    messages,
    typingUsers,
    setChats,
    addChat,
    removeChat,
    setActiveChatId,
    setMessagesForChat,
    addMessage,
    updateMessage,
    deleteMessage: storeDeleteMessage,
    setTyping,
  } = useAppState();

  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  // Initialize socket connection and event listeners
  useEffect(() => {
    chatService.connect(token || undefined);

    const unsubNewMessage = chatService.onNewMessage(({ chatId, message }) => {
      addMessage(chatId, message);
    });

    const unsubTyping = chatService.onTypingStatus(({ chatId, username, isTyping }) => {
      if (username !== user?.username) {
        setTyping(chatId, username, isTyping);
      }
    });

    return () => {
      unsubNewMessage();
      unsubTyping();
    };
  }, [token, user?.username, addMessage, setTyping]);

  // Join room when activeChatId changes
  useEffect(() => {
    if (activeChatId && user?.userId) {
      chatService.joinChat(activeChatId, user.userId);
      loadMessages(activeChatId);
    }
  }, [activeChatId, user?.userId]);

  const loadChats = useCallback(async () => {
    try {
      const res = await fetch('/api/chats', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.chats) {
          setChats(data.chats);
        }
      }
    } catch (err) {
      console.warn('Failed to load chats from server:', err);
    }
  }, [token, setChats]);

  const DEFAULT_PRESET_MESSAGES: Record<string, Message[]> = {
    grp_global_project: [
      {
        messageId: 'msg_gt_1',
        senderId: 'usr_karthik',
        senderName: 'Karthik',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
        originalText: 'வணக்கம்! Let us review the high-debt translation entries in Tamil.',
        translatedText: 'Hello! Let us review the high-debt translation entries in Tamil.',
        detectedLanguage: 'ta',
        targetLanguage: 'en',
        confidenceScore: 95,
        timestamp: '10:40 AM',
        status: 'read',
        echoChecked: true,
        sentimentScore: 0.9,
        sentimentLabel: 'positive',
        sentimentEmoji: '🚀',
      },
      {
        messageId: 'msg_gt_2',
        senderId: 'usr_priya',
        senderName: 'Priya',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
        originalText: 'Thanks! All team updates synced.',
        translatedText: 'நன்றி! அனைத்து குழு புதுப்பிப்புகளும் ஒத்திசைக்கப்பட்டன.',
        detectedLanguage: 'en',
        targetLanguage: 'ta',
        confidenceScore: 96,
        timestamp: '10:45 AM',
        status: 'read',
        echoChecked: true,
        sentimentScore: 0.85,
        sentimentLabel: 'positive',
        sentimentEmoji: '✨',
      },
    ],
    c_priya: [
      {
        messageId: 'msg_p_1',
        senderId: 'usr_priya',
        senderName: 'Priya Sharma',
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
        messageId: 'msg_p_2',
        senderId: 'usr_me',
        senderName: 'You',
        senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80',
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
        messageId: 'msg_p_3',
        senderId: 'usr_priya',
        senderName: 'Priya Sharma',
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
    ],
  };

  const loadMessages = useCallback(
    async (chatId: string) => {
      setIsLoadingMessages(true);
      try {
        const res = await fetch(`/api/chats/${chatId}/messages`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            setMessagesForChat(chatId, data.messages);
            setIsLoadingMessages(false);
            return;
          }
        }
      } catch (err) {
        console.warn(`Failed to load messages for chat ${chatId}:`, err);
      }

      const existingInStore = messages[chatId];
      if (!existingInStore) {
        setMessagesForChat(chatId, []);
      }
      setIsLoadingMessages(false);
    },
    [token, messages, setMessagesForChat]
  );

  const createChat = useCallback(
    async (chatData: {
      name: string;
      isGroup?: boolean;
      participantIds: string[];
      languages?: string[];
      avatar?: string;
    }): Promise<Chat | null> => {
      try {
        const res = await fetch('/api/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(chatData),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.chat) {
            addChat(data.chat);
            return data.chat;
          }
        }
      } catch (err) {
        console.warn('Failed to create chat:', err);
      }
      return null;
    },
    [token, addChat]
  );

  const deleteChat = useCallback(
    async (chatId: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/chats/${chatId}`, {
          method: 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          removeChat(chatId);
          return true;
        }
      } catch (err) {
        console.warn(`Failed to delete chat ${chatId}:`, err);
      }
      return false;
    },
    [token, removeChat]
  );

  const sendMessage = useCallback(
    async (
      chatId: string,
      text: string,
      targetLanguage: string = 'en',
      options?: {
        detectedLanguage?: string;
        isVoiceMessage?: boolean;
      }
    ): Promise<Message | null> => {
      if (!text.trim() || !user) return null;

      setIsSending(true);
      const tempId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

      try {
        // Parallel translation, perception preview, and radar analysis
        const [transResult, perceptionResult, radarResult] = await Promise.all([
          requestTranslation(text, targetLanguage, options?.detectedLanguage),
          requestPerceptionAnalysis(text, targetLanguage),
          requestCodeSwitchRadar(text, tempId),
        ]);

        const isTransSuccess = transResult.success && Boolean(transResult.translatedText);
        const isoTimestamp = new Date().toISOString();

        const newMessage: Message = {
          messageId: tempId,
          senderId: user.userId,
          senderName: user.username,
          senderAvatar: user.avatar,
          originalText: text,
          detectedLanguage: transResult.detectedLanguage || 'auto',
          translatedText: isTransSuccess ? transResult.translatedText : '',
          targetLanguage,
          confidenceScore: isTransSuccess ? transResult.confidenceScore : 0,
          translationStatus: isTransSuccess ? 'translated' : 'failed',
          translationError: isTransSuccess ? undefined : (transResult.error || 'Translation unavailable. Please try again.'),
          echoChecked: false,
          sentimentScore: perceptionResult.sentimentScore,
          sentimentLabel: perceptionResult.sentimentLabel,
          sentimentEmoji: perceptionResult.sentimentEmoji,
          radarId: radarResult.radarId,
          radarData: radarResult,
          timestamp: isoTimestamp,
          status: isTransSuccess ? 'sent' : 'failed',
          highlightedWords: isTransSuccess ? transResult.keyTerms : [],
          isVoiceMessage: options?.isVoiceMessage,
        };

        // 1. Add to local Zustand state
        const currentMsgs = messages[chatId];
        if (!currentMsgs || currentMsgs.length === 0) {
          const presets = DEFAULT_PRESET_MESSAGES[chatId] || [];
          setMessagesForChat(chatId, [...presets, newMessage]);
        } else {
          addMessage(chatId, newMessage);
        }

        // 2. Broadcast via Socket.io
        chatService.sendMessage(chatId, newMessage);

        // 3. Persist to Express backend
        fetch(`/api/chats/${chatId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            message: newMessage,
          }),
        }).catch((e) => console.warn('Sync message to backend error:', e));

        setIsSending(false);
        return newMessage;
      } catch (err) {
        console.error('Error sending message:', err);
        setIsSending(false);
        return null;
      }
    },
    [user, token, addMessage]
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (activeChatId && user?.username) {
        chatService.sendTyping(activeChatId, user.username, isTyping);
      }
    },
    [activeChatId, user?.username]
  );

  return {
    chats,
    activeChatId,
    activeChat: chats.find((c) => c.id === activeChatId) || null,
    messages: activeChatId ? messages[activeChatId] || [] : [],
    typingUsers: activeChatId ? typingUsers[activeChatId] || [] : [],
    isLoadingMessages,
    isSending,
    setActiveChatId,
    loadChats,
    loadMessages,
    createChat,
    deleteChat,
    sendMessage,
    sendTyping,
    updateMessage,
    deleteMessage: storeDeleteMessage,
  };
}
