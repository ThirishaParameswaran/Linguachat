import CodeSwitchRadar from '../models/CodeSwitchRadar.js';
import { processRadarAnalysis } from '../services/radarService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const analyzeCodeSwitching = async (req, res) => {
  try {
    const { text, messageId = 'msg_' + Date.now() } = req.body;
    if (!text) {
      return sendError(res, 'Text parameter is required', 'VALIDATION_ERROR', 400);
    }
    const radarData = await processRadarAnalysis(text, messageId);

    try {
      await CodeSwitchRadar.create(radarData);
    } catch (e) {}

    return sendSuccess(res, { radarData });
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getRadarForMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    let radar = await CodeSwitchRadar.findOne({ messageId }).catch(() => null);
    if (!radar) {
      radar = await processRadarAnalysis('Sample multilingual message', messageId);
    }
    return sendSuccess(res, { radarData: radar });
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getRadarForGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    let radars = await CodeSwitchRadar.find({}).limit(10).catch(() => []);
    return sendSuccess(res, { radars, groupId });
  } catch (err) {
    return sendError(res, err.message);
  }
};
