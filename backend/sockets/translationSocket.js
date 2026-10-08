import { processTranslation } from '../services/translationService.js';
import { processEchoCheck } from '../services/echoService.js';

export const registerTranslationSocketHandlers = (io, socket) => {
  socket.on('translation-request', async (data) => {
    try {
      const { text, targetLanguage, sourceLanguage } = data;
      const res = await processTranslation(text, targetLanguage, sourceLanguage);
      socket.emit('translation-response', res);
    } catch (e) {
      socket.emit('translation-response', { error: e.message });
    }
  });

  socket.on('echo-mode-check', async (data) => {
    try {
      const { text, targetLanguage, sourceLanguage } = data;
      const echoResult = await processEchoCheck(text, targetLanguage, sourceLanguage);
      socket.emit('echo-mode-result', { echoResult });
    } catch (e) {
      socket.emit('echo-mode-result', { error: e.message });
    }
  });
};
