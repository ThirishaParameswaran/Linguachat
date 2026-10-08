import { analyzeSentiment } from '../integrations/huggingface.js';

export const processPerceptionAnalysis = async (text, targetLanguage = 'en') => {
  return await analyzeSentiment(text, targetLanguage);
};
