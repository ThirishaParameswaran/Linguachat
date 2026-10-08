import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getUserAnalytics = async (req, res) => {
  try {
    const summary = {
      totalMessagesSent: 1420,
      translationSuccessRate: 96.4,
      correctionsSuggested: 48,
      correctionsApproved: 41,
      newWordsLearned: 38,
      codeSwitchingIndex: 42,
      totalDebtScore: 342,
      activeLanguagePairsCount: 5,
      messagesByLanguage: {
        en: 620,
        ta: 310,
        hi: 240,
        es: 150,
        ja: 100,
      },
    };
    return sendSuccess(res, { analytics: summary });
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getGroupAnalytics = async (req, res) => {
  try {
    const { groupId } = req.params;
    const summary = {
      groupId,
      totalGroupMessages: 3850,
      translationFidelityAverage: 94.2,
      activeLanguages: ['en', 'ta', 'hi', 'es', 'ja'],
      mostActiveLanguagePair: 'ta ↔ en',
      codeSwitchComplexityAvg: 54,
    };
    return sendSuccess(res, { analytics: summary });
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getTranslationAnalytics = async (req, res) => {
  try {
    return sendSuccess(res, {
      totalTranslations: 4820,
      confidenceAverage: 92.5,
      topSourceLanguages: ['ta', 'hi', 'es', 'ja'],
      topTargetLanguages: ['en', 'es'],
    });
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getLearningAnalytics = async (req, res) => {
  try {
    return sendSuccess(res, {
      vocabularyGrowth: [
        { week: 'W1', count: 10 },
        { week: 'W2', count: 22 },
        { week: 'W3', count: 35 },
        { week: 'W4', count: 48 },
      ],
      masteryBreakdown: { level1: 5, level2: 8, level3: 12, level4: 15, level5: 8 },
    });
  } catch (err) {
    return sendError(res, err.message);
  }
};
