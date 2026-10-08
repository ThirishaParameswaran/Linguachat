import VideoCall from '../models/VideoCall.js';
import { getWebRTCConfig } from '../services/videoService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const initiateCall = async (req, res) => {
  try {
    const { callType = '1-on-1', groupId, title, participants, initiatorId } = req.body;
    const callId = 'call_' + Date.now();

    const session = {
      callId,
      callType,
      groupId,
      title: title || 'Multilingual Video Call',
      participants: participants || [
        {
          userId: initiatorId || req.user?.userId || 'usr_me',
          username: req.user?.username || 'Alex Chen',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          preferredLanguage: 'en',
          isMuted: false,
          isVideoOff: false,
          isScreenSharing: false,
        },
      ],
      initiatorId: initiatorId || req.user?.userId || 'usr_me',
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      status: 'connecting',
      isRecording: false,
      liveSubtitles: [],
      webrtcConfig: getWebRTCConfig(),
    };

    try {
      await VideoCall.create(session);
    } catch (e) {}

    return sendSuccess(res, { session }, 'Call initiated successfully', 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const answerCall = async (req, res) => {
  try {
    const { callId } = req.body;
    let session = await VideoCall.findOneAndUpdate(
      { callId },
      { status: 'active' },
      { new: true }
    ).catch(() => null);

    return sendSuccess(res, { session: session || { callId, status: 'active' } }, 'Call answered');
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const endCall = async (req, res) => {
  try {
    const { callId } = req.body;
    const endedAt = new Date().toISOString();
    let session = await VideoCall.findOneAndUpdate(
      { callId },
      { status: 'ended', endedAt },
      { new: true }
    ).catch(() => null);

    return sendSuccess(res, { session: session || { callId, status: 'ended', endedAt } }, 'Call ended');
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getCallHistory = async (req, res) => {
  try {
    let history = await VideoCall.find({}).sort({ createdAt: -1 }).limit(20).catch(() => []);
    return sendSuccess(res, { history });
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const recordingConsent = async (req, res) => {
  try {
    const { callId, consentGiven } = req.body;
    return sendSuccess(res, { callId, isRecording: consentGiven }, 'Recording status updated');
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const toggleScreenShare = async (req, res) => {
  try {
    const { callId, isScreenSharing } = req.body;
    return sendSuccess(res, { callId, isScreenSharing }, 'Screen sharing updated');
  } catch (err) {
    return sendError(res, err.message);
  }
};
