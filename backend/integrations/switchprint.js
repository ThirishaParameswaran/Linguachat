import logger from '../utils/logger.js';

/**
 * SwitchPrint Code-Switching Radar Detection Adapter
 */
export const detectCodeSwitching = async (text, messageId = 'msg_custom') => {
  logger.info(`Analyzing code-switching token radar for message: ${messageId}`);

  const words = text.split(/\s+/).filter(Boolean);
  const tokens = words.map((w, idx) => {
    // Basic Unicode range check for non-Latin scripts (e.g., Tamil, Devanagari, Japanese, CJK)
    const isNonLatin = /[^\u0000-\u024F]/.test(w);
    const lang = isNonLatin ? 'ta' : 'en';
    const isSwitchPoint = idx > 0 && (
      (isNonLatin && !/[^\u0000-\u024F]/.test(words[idx - 1])) ||
      (!isNonLatin && /[^\u0000-\u024F]/.test(words[idx - 1]))
    );
    return {
      token: w,
      language: lang,
      confidence: 0.95,
      isSwitchPoint,
    };
  });

  const switchPoints = tokens.filter(t => t.isSwitchPoint).length;
  const isCodeMixed = switchPoints > 0 || new Set(tokens.map(t => t.language)).size > 1;

  const enCount = tokens.filter(t => t.language === 'en').length;
  const taCount = tokens.filter(t => t.language === 'ta').length;
  const total = tokens.length || 1;

  const languageDistribution = {
    en: Math.round((enCount / total) * 100),
    ta: Math.round((taCount / total) * 100),
  };

  return {
    radarId: 'rad_' + Date.now(),
    messageId,
    isCodeMixed,
    primaryLanguage: enCount >= taCount ? 'en' : 'ta',
    detectedLanguages: Array.from(new Set(tokens.map(t => t.language))),
    tokens,
    switchPoints,
    languageDistribution,
    switchCount: switchPoints,
    complexityScore: Math.min(100, switchPoints * 25 + (isCodeMixed ? 30 : 0)),
  };
};
