import { translateText, detectLanguage } from '../integrations/googleTranslate.js';

export const processTranslation = async (text, targetLanguage, sourceLanguage) => {
  return await translateText(text, targetLanguage, sourceLanguage);
};

export const processLanguageDetection = async (text) => {
  return await detectLanguage(text);
};

export const processBatchTranslation = async (texts, targetLanguage, sourceLanguage) => {
  const results = await Promise.all(
    texts.map(text => translateText(text, targetLanguage, sourceLanguage))
  );
  return results;
};
