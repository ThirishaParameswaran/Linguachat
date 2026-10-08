import logger from '../utils/logger.js';

/**
 * Mediasoup & WebRTC Coturn Configuration
 * Defines router media codecs and WebRTC transport options.
 */
export const mediasoupConfig = {
  // Worker settings
  worker: {
    rtcMinPort: parseInt(process.env.MEDIASOUP_MIN_PORT || '40000', 10),
    rtcMaxPort: parseInt(process.env.MEDIASOUP_MAX_PORT || '49999', 10),
    logLevel: 'debug',
    logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp'],
  },
  // Router settings
  router: {
    mediaCodecs: [
      {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
        parameters: {
          'x-google-start-bitrate': 1000,
        },
      },
      {
        kind: 'video',
        mimeType: 'video/h264',
        clockRate: 90000,
        parameters: {
          'packetization-mode': 1,
          'profile-level-id': '42e01f',
          'level-asymmetry-allowed': 1,
        },
      },
    ],
  },
  // WebRtcTransport settings
  webRtcTransport: {
    listenIps: [
      {
        ip: process.env.MEDIASOUP_LISTEN_IP || '0.0.0.0',
        announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP || '127.0.0.1',
      },
    ],
    maxIncomingBitrate: 1500000,
    initialAvailableOutgoingBitrate: 1000000,
  },
  // STUN/TURN Ice Servers
  iceServers: [
    { urls: process.env.STUN_SERVER_URL || 'stun:stun.l.google.com:19302' },
    {
      urls: process.env.TURN_SERVER_URL || 'turn:turn.linguachat.ai:3478',
      username: process.env.TURN_USERNAME || 'linguachat_user',
      credential: process.env.TURN_CREDENTIAL || 'linguachat_secret_pass',
    },
  ],
};

logger.info('Mediasoup WebRTC configuration initialized.');
