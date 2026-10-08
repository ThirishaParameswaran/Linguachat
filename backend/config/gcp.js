import logger from '../utils/logger.js';

/**
 * Google Cloud Credentials Config
 * Manages Google Cloud Translation, Speech-to-Text, and Text-to-Speech credentials.
 */
export const getGCPConfig = () => {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || process.env.GEMINI_API_KEY;
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  const isConfigured = Boolean(apiKey || credentialsPath);
  
  if (!isConfigured) {
    logger.info('Google Cloud API credentials not detected. Falling back to built-in simulation/Gemini translation service.');
  }

  return {
    apiKey,
    credentialsPath,
    isConfigured,
  };
};
