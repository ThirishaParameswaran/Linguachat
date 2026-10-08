import { detectCodeSwitching } from '../integrations/switchprint.js';

export const processRadarAnalysis = async (text, messageId = 'msg_custom') => {
  return await detectCodeSwitching(text, messageId);
};
