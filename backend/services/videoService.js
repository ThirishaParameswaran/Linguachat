import { mediasoupConfig } from '../config/mediasoup.js';

export const getWebRTCConfig = () => {
  return {
    iceServers: mediasoupConfig.iceServers,
    mediaCodecs: mediasoupConfig.router.mediaCodecs,
  };
};
