import { speechToText, textToSpeech } from '../integrations/googleSpeech.js';

export const processSpeechToText = async (audioBuffer, languageCode) => {
  return await speechToText(audioBuffer, languageCode);
};

export const processTextToSpeech = async (text, languageCode) => {
  return await textToSpeech(text, languageCode);
};
