import Message from '../models/Message.js';
import Group from '../models/Group.js';
import { processTranslation } from '../services/translationService.js';
import { processPerceptionAnalysis } from '../services/perceptionService.js';
import { processRadarAnalysis } from '../services/radarService.js';
import { calculateTranslationDebtScore } from '../services/debtService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const sendMessage = async (req, res) => {
  try {
    const {
      senderId,
      senderName,
      senderAvatar,
      receiverId,
      groupId,
      originalText,
      targetLanguage = 'en',
      sourceLanguage,
    } = req.body;

    if (!originalText) {
      return sendError(res, 'originalText is required', 'VALIDATION_ERROR', 400);
    }

    const messageId = 'msg_' + Date.now();

    // 1. Process Translation
    const trans = await processTranslation(originalText, targetLanguage, sourceLanguage);
    
    // 2. Process Perception Sentiment
    const perception = await processPerceptionAnalysis(trans.translatedText, targetLanguage);

    // 3. Process Code-Switch Radar
    const radar = await processRadarAnalysis(originalText, messageId);

    // 4. Process Debt Score
    const debt = calculateTranslationDebtScore({
      messageId,
      originalMessage: originalText,
      aiTranslation: trans.translatedText,
      confidenceScore: trans.confidenceScore,
      sourceLanguage: trans.detectedLanguage,
      targetLanguage,
    });

    const msgData = {
      messageId,
      senderId: senderId || 'usr_me',
      senderName: senderName || 'Alex Chen',
      senderAvatar: senderAvatar || '',
      receiverId,
      groupId,
      originalText,
      detectedLanguage: trans.detectedLanguage,
      translatedText: trans.translatedText,
      targetLanguage,
      confidenceScore: trans.confidenceScore,
      echoChecked: false,
      sentimentScore: perception.sentimentScore,
      sentimentLabel: perception.sentimentLabel,
      sentimentEmoji: perception.sentimentEmoji,
      radarId: radar.radarId,
      radarData: radar,
      debtId: debt.debtId,
      highlightedWords: trans.keyTerms,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    try {
      await Message.create(msgData);
    } catch (e) {
      // In-memory fallback
    }

    return sendSuccess(res, { message: msgData }, 'Message sent successfully', 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getMessagesForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    let messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: req.user?.userId },
        { senderId: req.user?.userId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 }).catch(() => []);

    return sendSuccess(res, { messages });
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getMessagesForGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    let messages = await Message.find({ groupId }).sort({ createdAt: 1 }).catch(() => []);

    return sendSuccess(res, { messages });
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const createGroup = async (req, res) => {
  try {
    const { name, description, members, languages } = req.body;
    const groupId = 'grp_' + Date.now();

    const newGroup = {
      groupId,
      name: name || 'New Global Team',
      description: description || '',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=200&q=80',
      members: members || [{ userId: 'usr_me', username: 'Alex Chen', preferredLanguage: 'en' }],
      languages: languages || ['en', 'ta', 'hi'],
      lastMessage: 'Group created',
      lastMessageTime: 'Just now',
      unreadCount: 0,
    };

    try {
      await Group.create(newGroup);
    } catch (e) {}

    return sendSuccess(res, { group: newGroup }, 'Group created', 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getGroups = async (req, res) => {
  try {
    let groups = await Group.find({}).catch(() => []);
    return sendSuccess(res, { groups });
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    let message = await Message.findOneAndUpdate({ messageId: id }, updates, { new: true }).catch(() => null);
    return sendSuccess(res, { message: message || { messageId: id, ...updates } }, 'Message updated');
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.deleteOne({ messageId: id }).catch(() => null);
    return sendSuccess(res, { messageId: id }, 'Message deleted');
  } catch (err) {
    return sendError(res, err.message);
  }
};
