import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { User } from '../../types';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  PhoneOff,
  Disc,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Users,
  Radio,
  AlertTriangle,
} from 'lucide-react';
import { chatService } from '../../services/chatService';
import { useTranslation } from '../../hooks/useTranslation';

interface VideoCallViewProps {
  currentUser: User;
}

interface RemotePeer {
  socketId: string;
  user: {
    userId: string;
    username: string;
    avatar?: string;
    preferredLanguage?: string;
  };
  stream?: MediaStream;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

interface SubtitleItem {
  id: string;
  speakerName: string;
  originalText: string;
  sourceLang: string;
  translatedText: string;
  targetLang: string;
  timestamp: string;
}

const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

const RemoteVideoTile: React.FC<{ peer: RemotePeer }> = ({ peer }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && peer.stream) {
      videoRef.current.srcObject = peer.stream;
    }
  }, [peer.stream]);

  return (
    <div className="relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center min-h-[200px] sm:min-h-[260px] w-full h-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover ${!peer.videoEnabled ? 'hidden' : ''}`}
      />
      {!peer.videoEnabled && (
        <div className="text-slate-500 text-xs font-bold flex flex-col items-center gap-2">
          <VideoOff className="w-8 h-8 text-slate-600" />
          <span>Camera Off</span>
        </div>
      )}
      <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-white border border-slate-800 flex items-center gap-2 z-10">
        <span>{peer.user.username}</span>
        {!peer.audioEnabled && <MicOff className="w-3.5 h-3.5 text-rose-400" />}
        {peer.user.preferredLanguage && (
          <span className="text-[10px] px-1 bg-indigo-500/20 text-indigo-300 rounded font-mono uppercase">
            {peer.user.preferredLanguage}
          </span>
        )}
      </div>
    </div>
  );
};

export const VideoCallView: React.FC<VideoCallViewProps> = ({ currentUser }) => {
  const { translate } = useTranslation();

  const [roomId, setRoomId] = useState('LC-4821');
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [subtitlesLang, setSubtitlesLang] = useState(currentUser.preferredLanguage || 'en');
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [callSeconds, setCallSeconds] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Dynamic Remote Peers map: socketId -> RemotePeer
  const [remotePeers, setRemotePeers] = useState<Map<string, RemotePeer>>(() => new Map<string, RemotePeer>());
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  const [liveSubtitles, setLiveSubtitles] = useState<SubtitleItem[]>([]);

  const totalParticipantCount = useMemo(() => {
    return isInCall ? 1 + remotePeers.size : 0;
  }, [isInCall, remotePeers.size]);

  // Clean up WebRTC peer connection for a specific socket
  const cleanupPeerConnection = useCallback((socketId: string) => {
    const pc = peerConnectionsRef.current.get(socketId);
    if (pc) {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.close();
      peerConnectionsRef.current.delete(socketId);
    }
    setRemotePeers((prev: Map<string, RemotePeer>) => {
      const next = new Map<string, RemotePeer>(prev);
      next.delete(socketId);
      return next;
    });
  }, []);

  // Create or retrieve RTCPeerConnection for a remote peer socket
  const createPeerConnection = useCallback(
    (remoteSocketId: string, socket: any, remoteUser: any) => {
      if (peerConnectionsRef.current.has(remoteSocketId)) {
        return peerConnectionsRef.current.get(remoteSocketId)!;
      }

      const pc = new RTCPeerConnection(STUN_SERVERS);
      peerConnectionsRef.current.set(remoteSocketId, pc);

      // Add local tracks to peer connection
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, streamRef.current!);
        });
      }

      // Handle ICE Candidate generation
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice_candidate', {
            toSocketId: remoteSocketId,
            candidate: event.candidate,
          });
        }
      };

      // Handle remote track reception
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0] || new MediaStream([event.track]);
        setRemotePeers((prev: Map<string, RemotePeer>) => {
          const next = new Map<string, RemotePeer>(prev);
          const existingPeer: RemotePeer = next.get(remoteSocketId) || {
            socketId: remoteSocketId,
            user: remoteUser,
            audioEnabled: true,
            videoEnabled: true,
          };
          const updatedPeer: RemotePeer = {
            socketId: existingPeer.socketId,
            user: existingPeer.user,
            audioEnabled: existingPeer.audioEnabled,
            videoEnabled: existingPeer.videoEnabled,
            stream: remoteStream,
          };
          next.set(remoteSocketId, updatedPeer);
          return next;
        });
      };

      pc.oniceconnectionstatechange = () => {
        if (
          pc.iceConnectionState === 'disconnected' ||
          pc.iceConnectionState === 'failed' ||
          pc.iceConnectionState === 'closed'
        ) {
          cleanupPeerConnection(remoteSocketId);
        }
      };

      return pc;
    },
    [cleanupPeerConnection]
  );

  const stopStream = (stream: MediaStream | null) => {
    stream?.getTracks().forEach((t) => t.stop());
  };

  const leaveCall = useCallback(() => {
    const socket = chatService.getRawSocket();
    if (socket) {
      socket.emit('leave_video_room', { roomId });
      socket.off('video_room_users');
      socket.off('user_joined_video');
      socket.off('video_offer');
      socket.off('video_answer');
      socket.off('ice_candidate');
      socket.off('user_media_changed');
      socket.off('user_left_video');
      socket.off('video_subtitle_received');
    }

    // Stop recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    // Close all peer connections
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    setRemotePeers(new Map());

    // Stop streams
    stopStream(streamRef.current);
    stopStream(screenRef.current);
    streamRef.current = null;
    screenRef.current = null;

    setIsInCall(false);
    setIsScreenSharing(false);
    setIsRecording(false);
    setCallSeconds(0);
  }, [roomId]);

  const joinCall = async () => {
    setMediaError(null);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
    } catch (err: any) {
      console.warn('getUserMedia error:', err);
      setMediaError('Camera and microphone permission is required for video calls.');
      return;
    }

    streamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    setIsVideoOff(false);
    setIsMuted(false);
    setIsInCall(true);

    const socket = chatService.getRawSocket();
    if (!socket) {
      setMediaError('Could not establish real-time signaling connection.');
      return;
    }

    const cleanRoomId = roomId.trim().toUpperCase();

    // 1. Listen for existing users in room
    socket.on('video_room_users', async ({ users }: { users: Array<{ socketId: string; user: any }> }) => {
      users.forEach(async ({ socketId: remoteSocketId, user: remoteUser }) => {
        setRemotePeers((prev: Map<string, RemotePeer>) => {
          const next = new Map<string, RemotePeer>(prev);
          const existing = next.get(remoteSocketId);
          next.set(remoteSocketId, {
            socketId: remoteSocketId,
            user: remoteUser,
            stream: existing?.stream,
            audioEnabled: true,
            videoEnabled: true,
          });
          return next;
        });

        const pc = createPeerConnection(remoteSocketId, socket, remoteUser);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('video_offer', {
            toSocketId: remoteSocketId,
            offer,
            fromUser: {
              userId: currentUser.userId,
              username: currentUser.username,
              avatar: currentUser.avatar,
              preferredLanguage: currentUser.preferredLanguage,
            },
          });
        } catch (e) {
          console.error('Error creating WebRTC offer:', e);
        }
      });
    });

    // 2. Listen for new user joining
    socket.on('user_joined_video', ({ socketId: remoteSocketId, user: remoteUser }: any) => {
      setRemotePeers((prev: Map<string, RemotePeer>) => {
        const next = new Map<string, RemotePeer>(prev);
        const existing = next.get(remoteSocketId);
        next.set(remoteSocketId, {
          socketId: remoteSocketId,
          user: remoteUser,
          stream: existing?.stream,
          audioEnabled: true,
          videoEnabled: true,
        });
        return next;
      });
    });

    // 3. Handle incoming SDP Offer
    socket.on('video_offer', async ({ offer, fromSocketId: remoteSocketId, fromUser: remoteUser }: any) => {
      setRemotePeers((prev: Map<string, RemotePeer>) => {
        const next = new Map<string, RemotePeer>(prev);
        const existing = next.get(remoteSocketId);
        next.set(remoteSocketId, {
          socketId: remoteSocketId,
          user: remoteUser,
          stream: existing?.stream,
          audioEnabled: true,
          videoEnabled: true,
        });
        return next;
      });

      const pc = createPeerConnection(remoteSocketId, socket, remoteUser);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('video_answer', {
          toSocketId: remoteSocketId,
          answer,
        });
      } catch (e) {
        console.error('Error handling WebRTC offer:', e);
      }
    });

    // 4. Handle incoming SDP Answer
    socket.on('video_answer', async ({ answer, fromSocketId: remoteSocketId }: any) => {
      const pc = peerConnectionsRef.current.get(remoteSocketId);
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (e) {
          console.error('Error setting remote description answer:', e);
        }
      }
    });

    // 5. Handle ICE Candidates
    socket.on('ice_candidate', async ({ candidate, fromSocketId: remoteSocketId }: any) => {
      const pc = peerConnectionsRef.current.get(remoteSocketId);
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding ICE candidate:', e);
        }
      }
    });

    // 6. Handle Media Status Toggles from Remote Users
    socket.on('user_media_changed', ({ socketId: remoteSocketId, audioEnabled, videoEnabled }: any) => {
      setRemotePeers((prev: Map<string, RemotePeer>) => {
        const next = new Map<string, RemotePeer>(prev);
        const existing: RemotePeer | undefined = next.get(remoteSocketId);
        if (existing) {
          const updatedPeer: RemotePeer = {
            socketId: existing.socketId,
            user: existing.user,
            stream: existing.stream,
            audioEnabled: audioEnabled !== undefined ? audioEnabled : existing.audioEnabled,
            videoEnabled: videoEnabled !== undefined ? videoEnabled : existing.videoEnabled,
          };
          next.set(remoteSocketId, updatedPeer);
        }
        return next;
      });
    });

    // 7. Handle Subtitles Received from Remote Users
    socket.on('video_subtitle_received', (sub: SubtitleItem) => {
      setLiveSubtitles((prev) => [...prev.slice(-4), sub]);
    });

    // 8. Handle Remote User Disconnection / Leaving
    socket.on('user_left_video', ({ socketId: remoteSocketId }: any) => {
      cleanupPeerConnection(remoteSocketId);
    });

    // Join Video Room
    socket.emit('join_video_room', {
      roomId: cleanRoomId,
      user: {
        userId: currentUser.userId,
        username: currentUser.username,
        avatar: currentUser.avatar,
        preferredLanguage: currentUser.preferredLanguage,
      },
    });

    // Start Live Speech Recognition Subtitle Pipeline
    startSpeechRecognitionSubtitles(cleanRoomId);
  };

  // Live Speech Recognition Subtitles
  const startSpeechRecognitionSubtitles = (cleanRoomId: string) => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;

    try {
      const rec = new SpeechRec();
      recognitionRef.current = rec;
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = currentUser.preferredLanguage === 'ta' ? 'ta-IN' : currentUser.preferredLanguage === 'hi' ? 'hi-IN' : 'en-US';

      rec.onresult = async (event: any) => {
        const lastIndex = event.results.length - 1;
        const speechText = event.results[lastIndex][0].transcript.trim();
        if (speechText) {
          const transRes = await translate(speechText, subtitlesLang, currentUser.preferredLanguage || 'en');
          const subItem: SubtitleItem = {
            id: 'sub_' + Date.now(),
            speakerName: currentUser.username,
            originalText: speechText,
            sourceLang: currentUser.preferredLanguage || 'en',
            translatedText: transRes?.translatedText || speechText,
            targetLang: subtitlesLang,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          setLiveSubtitles((prev) => [...prev.slice(-4), subItem]);

          const socket = chatService.getRawSocket();
          if (socket) {
            socket.emit('video_subtitle', { roomId: cleanRoomId, subtitle: subItem });
          }
        }
      };

      rec.onerror = () => {};
      rec.onend = () => {
        if (isInCall && recognitionRef.current === rec) {
          try {
            rec.start();
          } catch {}
        }
      };

      rec.start();
    } catch (e) {
      console.warn('Speech recognition subtitle start error:', e);
    }
  };

  // Toggle Mute Audio
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !newMuted;
      });
    }
    const socket = chatService.getRawSocket();
    if (socket) {
      socket.emit('toggle_media', { roomId, audioEnabled: !newMuted, videoEnabled: !isVideoOff });
    }
  };

  // Toggle Video Camera
  const toggleVideo = () => {
    const newVideoOff = !isVideoOff;
    setIsVideoOff(newVideoOff);
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !newVideoOff;
      });
    }
    const socket = chatService.getRawSocket();
    if (socket) {
      socket.emit('toggle_media', { roomId, audioEnabled: !isMuted, videoEnabled: !newVideoOff });
    }
  };

  useEffect(() => {
    if (!isInCall) return;
    const timer = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isInCall]);

  useEffect(() => {
    return () => {
      leaveCall();
    };
  }, [leaveCall]);

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      stopStream(screenRef.current);
      screenRef.current = null;
      if (streamRef.current && localVideoRef.current) {
        localVideoRef.current.srcObject = streamRef.current;
      }
      setIsScreenSharing(false);
      return;
    }
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenRef.current = display;
      if (localVideoRef.current) localVideoRef.current.srcObject = display;
      setIsScreenSharing(true);
      display.getVideoTracks()[0].onended = () => {
        if (streamRef.current && localVideoRef.current) {
          localVideoRef.current.srcObject = streamRef.current;
        }
        setIsScreenSharing(false);
      };
    } catch {
      setMediaError('Screen share was cancelled or is not available.');
    }
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/video/' + roomId);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const remotePeersList: RemotePeer[] = Array.from(remotePeers.values()) as RemotePeer[];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 text-slate-200">
      {/* Top Header Card */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-lg">
            <Video className="w-6 h-6 text-indigo-400" />
            Subtitled Video Conference Studio
          </div>
          <p className="text-xs text-slate-300">
            Real WebRTC multi-user video room with dynamic peer streams and live translation subtitles.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-indigo-300 font-mono">
            <span className="flex items-center gap-1 font-bold">
              Room: <span className="text-white bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-500/40">{roomId}</span>
            </span>
            <span>•</span>
            <span>{totalParticipantCount} {totalParticipantCount === 1 ? 'participant' : 'participants'}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Radio className={`w-3.5 h-3.5 ${isInCall ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
              {isInCall ? `Connected (${formatDuration(callSeconds)})` : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Room Joining Form & Action */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {!isInCall && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Room ID (e.g. LC-4821)"
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white uppercase focus:ring-2 focus:ring-indigo-500 w-32"
              />
              <button
                type="button"
                onClick={joinCall}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 shrink-0"
              >
                <Video className="w-4 h-4" /> Join Room
              </button>
            </div>
          )}

          {isInCall && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={copyRoomLink}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center gap-1.5"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
                <span>{copiedLink ? 'Copied Link!' : 'Share Room'}</span>
              </button>
              <button
                type="button"
                onClick={leaveCall}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 shrink-0"
              >
                <PhoneOff className="w-4 h-4" /> Leave Room
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Permission & Media Error Banner */}
      {mediaError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
            <span className="text-xs font-semibold">{mediaError}</span>
          </div>
          <button
            type="button"
            onClick={joinCall}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Active Call View */}
      {isInCall ? (
        <div className="space-y-4">
          {/* Waiting for Others Banner if Alone in Room */}
          {remotePeersList.length === 0 && (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs font-medium flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>You're the only person in this room. Share room ID <strong>{roomId}</strong> with another user to join.</span>
              </div>
              <button
                type="button"
                onClick={copyRoomLink}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Room Link</span>
              </button>
            </div>
          )}

          {/* Dynamic WebRTC Video Grid */}
          <div
            className={`grid gap-4 min-h-[300px] ${
              totalParticipantCount === 1
                ? 'grid-cols-1 max-w-4xl mx-auto'
                : totalParticipantCount === 2
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {/* Local Video Tile */}
            <div className="relative rounded-2xl bg-slate-900 border border-indigo-500/40 overflow-hidden flex items-center justify-center min-h-[220px] sm:min-h-[280px] w-full h-full shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
              />
              {isVideoOff && (
                <div className="text-slate-500 text-xs font-bold flex flex-col items-center gap-2">
                  <VideoOff className="w-8 h-8 text-slate-600" />
                  <span>Camera Off</span>
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-white border border-slate-800 flex items-center gap-2 z-10">
                <span>{currentUser.username} (You)</span>
                {isMuted && <MicOff className="w-3.5 h-3.5 text-rose-400" />}
              </div>
            </div>

            {/* Remote Video Tiles */}
            {remotePeersList.map((peer) => (
              <RemoteVideoTile key={peer.socketId} peer={peer} />
            ))}
          </div>

          {/* Subtitle Panel */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/40 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-purple-300">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                AI Real-Time Live Subtitles Overlay
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-normal">Subtitle Target Language:</span>
                <select
                  value={subtitlesLang}
                  onChange={(e) => setSubtitlesLang(e.target.value)}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="en">🇬🇧 English</option>
                  <option value="ta">🇮🇳 Tamil</option>
                  <option value="hi">🇮🇳 Hindi</option>
                  <option value="es">🇪🇸 Spanish</option>
                  <option value="fr">🇫🇷 French</option>
                  <option value="de">🇩🇪 German</option>
                  <option value="ja">🇯🇵 Japanese</option>
                  <option value="zh">🇨🇳 Chinese</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
              {liveSubtitles.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500 italic">
                  Live translation subtitles will appear here automatically as participants speak...
                </div>
              ) : (
                liveSubtitles.slice(-4).map((sub) => (
                  <div key={sub.id} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs leading-relaxed">
                    <span className="font-bold text-indigo-300 mr-2">{sub.speakerName}:</span>
                    <span className="text-slate-300 mr-2">"{sub.originalText}"</span>
                    <span className="text-emerald-400 font-semibold block sm:inline mt-0.5 sm:mt-0">
                      ↳ {sub.translatedText}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Video Room Control Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleMute}
                className={`p-3 min-h-11 min-w-11 rounded-xl border transition-all ${
                  isMuted ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                }`}
                aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={toggleVideo}
                className={`p-3 min-h-11 min-w-11 rounded-xl border transition-all ${
                  isVideoOff ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                }`}
                aria-label={isVideoOff ? 'Turn camera on' : 'Turn camera off'}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={toggleScreenShare}
                className={`p-3 min-h-11 min-w-11 rounded-xl border transition-all ${
                  isScreenSharing ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
                aria-label="Screen share"
              >
                <Monitor className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setIsRecording(!isRecording)}
                className={`p-3 min-h-11 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold ${
                  isRecording ? 'bg-rose-600 text-white border-rose-500 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Disc className="w-5 h-5" />
                <span>{isRecording ? 'REC' : 'Record'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={leaveCall}
              className="px-6 py-3 min-h-11 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <PhoneOff className="w-4 h-4" /> Leave Room
            </button>
          </div>
        </div>
      ) : (
        /* Empty / Idle State */
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 max-w-xl mx-auto shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto">
            <Video className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Join Real Video Conference Room</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enter a Room ID below and click <strong>Join Room</strong> to connect to a live WebRTC video room with real participants and instant translated subtitles.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              placeholder="Room ID (e.g. LC-4821)"
              className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white uppercase focus:ring-2 focus:ring-indigo-500 text-center tracking-wider w-40"
            />
            <button
              type="button"
              onClick={joinCall}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <Video className="w-4 h-4" /> Join Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
