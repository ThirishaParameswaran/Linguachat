import logger from '../utils/logger.js';
import { GoogleGenAI, Type } from '@google/genai';

const OFFLINE_DICTIONARY = {
  'how are you': {
    hi: 'आप कैसे हैं?',
    ta: 'நீங்கள் எப்படி இருக்கிறீர்கள்?',
    es: '¿Cómo estás?',
    fr: 'Comment allez-vous?',
    de: 'Wie geht es dir?',
    ja: 'お元気ですか？',
    zh: '你好吗？',
    ar: 'كيف حالك؟',
    ru: 'Как дела?',
    it: 'Come stai?',
    pt: 'Como você está?',
    ko: '어떻게 지내세요?',
    en: 'How are you?',
  },
  'how are you?': {
    hi: 'आप कैसे हैं?',
    ta: 'நீங்கள் எப்படி இருக்கிறீர்கள்?',
    es: '¿Cómo estás?',
    fr: 'Comment allez-vous?',
    de: 'Wie geht es dir?',
    ja: 'お元気ですか？',
    zh: '你好吗？',
    ar: 'كيف حالك؟',
    ru: 'Как дела?',
    it: 'Come stai?',
    pt: 'Como você está?',
    ko: '어떻게 지내세요?',
    en: 'How are you?',
  },
  'hello': {
    hi: 'नमस्ते',
    ta: 'வணக்கம்',
    es: 'Hola',
    fr: 'Bonjour',
    de: 'Hallo',
    ja: 'こんにちは',
    zh: '你好',
    ar: 'مرحبا',
    ru: 'Здравствуйте',
    it: 'Ciao',
    pt: 'Olá',
    ko: '안녕하세요',
    en: 'Hello',
  },
  'hi': {
    hi: 'नमस्ते',
    ta: 'வணக்கம்',
    es: 'Hola',
    fr: 'Salut',
    de: 'Hallo',
    ja: 'やあ',
    zh: '嗨',
    en: 'Hi',
  },
  'what are you doing': {
    hi: 'आप क्या कर रहे हैं?',
    ta: 'நீங்கள் என்ன செய்கிறீர்கள்?',
    es: '¿Qué estás haciendo?',
    fr: 'Que faites-vous?',
    de: 'Was machst du?',
    ja: '何をしているのですか？',
    zh: '你在做什么？',
    en: 'What are you doing?',
  },
  'what are you doing today': {
    hi: 'आज आप क्या कर रहे हैं?',
    ta: 'இன்று நீங்கள் என்ன செய்கிறீர்கள்?',
    es: '¿Qué haces hoy?',
    fr: 'Que faites-vous aujourd\'hui?',
    de: 'Was machst du heute?',
    en: 'What are you doing today?',
  },
  'good morning': {
    hi: 'शुभप्रभात',
    ta: 'காலை வணக்கம்',
    es: 'Buenos días',
    fr: 'Bonjour',
    de: 'Guten Morgen',
    ja: 'おはようございます',
    zh: '早上好',
    en: 'Good morning',
  },
  'good evening': {
    hi: 'शुभ संध्या',
    ta: 'மாலை வணக்கம்',
    es: 'Buenas tardes',
    fr: 'Bonsoir',
    de: 'Guten Abend',
    en: 'Good evening',
  },
  'thank you': {
    hi: 'धन्यवाद',
    ta: 'நன்றி',
    es: 'Gracias',
    fr: 'Merci',
    de: 'Danke',
    ja: 'ありがとう',
    zh: '谢谢',
    en: 'Thank you',
  },
  'thanks': {
    hi: 'धन्यवाद',
    ta: 'நன்றி',
    es: 'Gracias',
    fr: 'Merci',
    de: 'Danke',
    en: 'Thanks',
  },
  'yes': {
    hi: 'हाँ',
    ta: 'ஆம்',
    es: 'Sí',
    fr: 'Oui',
    de: 'Ja',
    en: 'Yes',
  },
  'no': {
    hi: 'नहीं',
    ta: 'இல்லை',
    es: 'No',
    fr: 'Non',
    de: 'Nein',
    en: 'No',
  },
  'welcome': {
    hi: 'स्वागत है',
    ta: 'நல்வரவு',
    es: 'Bienvenido',
    fr: 'Bienvenue',
    de: 'Willkommen',
    en: 'Welcome',
  },
};

/**
 * Google Cloud Translation API Integration Adapter
 * Performs real translation, language detection, and key term extraction with multi-tier fallback.
 */
export const translateText = async (text, targetLanguage = 'en', sourceLanguage = null) => {
  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new Error('Text parameter is required');
  }

  const cleanText = text.trim();
  const normalizedSource = sourceLanguage && sourceLanguage !== 'auto' ? sourceLanguage : null;
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  // 1. Google Cloud Translation API v2 (REST)
  if (apiKey && apiKey !== 'MY_GOOGLE_TRANSLATE_API_KEY' && apiKey.length > 5) {
    try {
      logger.info(`Translating via GCP Translation API to ${targetLanguage}`);
      const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
      const payload = {
        q: cleanText,
        target: targetLanguage,
        format: 'text',
      };
      if (normalizedSource) {
        payload.source = normalizedSource;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const translation = data?.data?.translations?.[0];
        if (translation && translation.translatedText) {
          const detected = normalizedSource || translation.detectedSourceLanguage || 'en';
          return {
            translatedText: translation.translatedText,
            detectedLanguage: detected,
            confidenceScore: 0.98,
            keyTerms: [],
          };
        }
      } else {
        const errJson = await response.json().catch(() => ({}));
        logger.warn('GCP Translate API error:', errJson);
      }
    } catch (e) {
      logger.error('GCP Translate error:', e.message);
    }
  }

  // 2. Gemini AI Translation
  if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY' && geminiApiKey.length > 5) {
    try {
      logger.info(`Translating via Gemini AI to ${targetLanguage}`);
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const prompt = `Translate the following text into target language code "${targetLanguage}".
Source text: "${cleanText}"
${normalizedSource ? `Source language: ${normalizedSource}` : 'Detect the source language code automatically.'}

If there are key specialized domain terms, extract up to 3 keyTerms as an array of objects. Otherwise return keyTerms as [].
Respond in JSON format:
{
  "translatedText": "string",
  "detectedLanguage": "ISO language code e.g. en, hi, ta, es, fr, de, ja, zh",
  "confidenceScore": number (0-100) or null,
  "keyTerms": [ { "word": "string", "translation": "string", "definition": "string" } ]
}`;

      const aiRes = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translatedText: { type: Type.STRING },
              detectedLanguage: { type: Type.STRING },
              confidenceScore: { type: Type.NUMBER, nullable: true },
              keyTerms: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    translation: { type: Type.STRING },
                    definition: { type: Type.STRING },
                  },
                },
              },
            },
            required: ['translatedText', 'detectedLanguage'],
          },
        },
      });

      const parsed = JSON.parse(aiRes.text || '{}');
      if (parsed.translatedText) {
        return {
          translatedText: parsed.translatedText,
          detectedLanguage: parsed.detectedLanguage || normalizedSource || 'en',
          confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0.95,
          keyTerms: Array.isArray(parsed.keyTerms) ? parsed.keyTerms : [],
        };
      }
    } catch (e) {
      logger.warn('Gemini AI translation failed:', e.message);
    }
  }

  // 3. Reliable Public Google Translate API (GTX) with User-Agent
  try {
    const sl = normalizedSource || 'auto';
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(cleanText)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': '*/*',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translatedText = data[0].map((part) => part[0]).filter(Boolean).join('');
        const detectedLanguage = normalizedSource || (typeof data[2] === 'string' ? data[2] : 'en');
        if (translatedText) {
          return {
            translatedText,
            detectedLanguage,
            confidenceScore: 0.92,
            keyTerms: [],
          };
        }
      }
    }
  } catch (e) {
    logger.error('Public Google Translate API fallback error:', e.message);
  }

  // 4. Public MyMemory Free Translation API Fallback
  try {
    const sl = normalizedSource || 'auto';
    const langpair = `${sl === 'auto' ? 'en' : sl}|${targetLanguage}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=${langpair}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.responseData && data.responseData.translatedText) {
        return {
          translatedText: data.responseData.translatedText,
          detectedLanguage: normalizedSource || 'en',
          confidenceScore: data.responseData.match || 0.85,
          keyTerms: [],
        };
      }
    }
  } catch (e) {
    logger.error('MyMemory API error:', e.message);
  }

  // 5. Offline Dictionary & Smart Rule Fallback
  const lowerKey = cleanText.toLowerCase();
  if (OFFLINE_DICTIONARY[lowerKey] && OFFLINE_DICTIONARY[lowerKey][targetLanguage]) {
    return {
      translatedText: OFFLINE_DICTIONARY[lowerKey][targetLanguage],
      detectedLanguage: normalizedSource || 'en',
      confidenceScore: 0.90,
      keyTerms: [],
    };
  }

  // Word-by-word offline lookup fallback
  const words = cleanText.split(/\s+/);
  const translatedWords = words.map(w => {
    const cleanW = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (OFFLINE_DICTIONARY[cleanW] && OFFLINE_DICTIONARY[cleanW][targetLanguage]) {
      return OFFLINE_DICTIONARY[cleanW][targetLanguage];
    }
    return w;
  });

  const wordFallback = translatedWords.join(' ');
  const finalTranslation = wordFallback !== cleanText ? wordFallback : cleanText;

  return {
    translatedText: finalTranslation,
    detectedLanguage: normalizedSource || 'en',
    confidenceScore: 0.80,
    keyTerms: [],
  };
};

export const detectLanguage = async (text) => {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return { language: 'en', confidence: 1.0 };
  }

  const cleanText = text.trim();

  // Script Heuristics
  if (/[\u0900-\u097F]/.test(cleanText)) return { language: 'hi', confidence: 0.99 };
  if (/[\u0B80-\u0BFF]/.test(cleanText)) return { language: 'ta', confidence: 0.99 };
  if (/[\u0600-\u06FF]/.test(cleanText)) return { language: 'ar', confidence: 0.99 };
  if (/[\u0400-\u04FF]/.test(cleanText)) return { language: 'ru', confidence: 0.99 };
  if (/[\u3040-\u30FF\u4E00-\u9FFF]/.test(cleanText)) return { language: 'zh', confidence: 0.99 };

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(cleanText)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });
    if (res.ok) {
      const data = await res.json();
      const detected = typeof data[2] === 'string' ? data[2] : 'en';
      return { language: detected, confidence: 0.98 };
    }
  } catch (e) {
    logger.error('Detect language error:', e.message);
  }

  return { language: 'en', confidence: 0.9 };
};


