import logger from '../utils/logger.js';

/**
 * HuggingFace & VADER Sentiment Analysis Adapter
 */
export const analyzeSentiment = async (text, targetLanguage = 'en') => {
  logger.info(`Analyzing sentiment for text: "${text.substring(0, 30)}..."`);
  
  // Rule-based heuristic fallback + VADER style scoring
  let score = 0.5;
  let label = 'positive';
  let emoji = '🌸';

  const lower = text.toLowerCase();
  if (lower.includes('error') || lower.includes('blocker') || lower.includes('fail') || lower.includes('delay') || lower.includes('bad')) {
    score = -0.6;
    label = 'negative';
    emoji = '⚠️';
  } else if (lower.includes('ready') || lower.includes('good') || lower.includes('thanks') || lower.includes('hello') || lower.includes('great')) {
    score = 0.8;
    label = 'positive';
    emoji = '🌸';
  } else {
    score = 0.1;
    label = 'neutral';
    emoji = '😐';
  }

  return {
    sentimentScore: score,
    sentimentLabel: label,
    sentimentEmoji: emoji,
    toneDetails: {
      politeness: Math.round(75 + score * 20),
      formality: 70,
      urgency: score < 0 ? 80 : 25,
      emotionalNuance: label === 'positive' ? 'Constructive collaborative tone.' : label === 'negative' ? 'Urgent technical escalation required.' : 'Balanced neutral informational tone.',
    },
  };
};
