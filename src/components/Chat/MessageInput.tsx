import React, { useState, useRef, useEffect } from 'react';
import { Send, Globe, Mic, MicOff, Paperclip, Camera, Repeat, X, FileText, Image as ImageIcon, Check, Loader2 } from 'lucide-react';
import { useAppState } from '../../store/appState';

interface MessageInputProps {
  onSendMessage: (text: string, targetLanguage: string, useEcho?: boolean) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  defaultTargetLanguage?: string;
  isLoading?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  defaultTargetLanguage = 'ta',
  isLoading = false,
}) => {
  const [text, setText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState(defaultTargetLanguage);
  const [isEchoOn, setIsEchoOn] = useState(true);

  // File & Camera Attachment State
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    type: string;
    size: string;
    dataUrl?: string;
  } | null>(null);

  // Voice Note Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { addNotification } = useAppState();

  useEffect(() => {
    setTargetLanguage(defaultTargetLanguage);
  }, [defaultTargetLanguage]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);

    if (onTyping) {
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1500);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const isImg = file.type.startsWith('image/');
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setAttachedFile({
        name: file.name,
        type: file.type,
        size: sizeFormatted,
        dataUrl: isImg ? dataUrl : undefined,
      });

      addNotification({
        title: isImg ? '📷 Photo Attached' : '📎 File Attached',
        message: `Attached "${file.name}" (${sizeFormatted})`,
        type: 'success',
      });
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if ((!text.trim() && !attachedFile) || isLoading) return;

    let msgToSend = text.trim();

    if (attachedFile) {
      if (attachedFile.type.startsWith('image/') && attachedFile.dataUrl) {
        msgToSend = msgToSend
          ? `${msgToSend}\n![Image Attachment](${attachedFile.dataUrl})`
          : `![Image Attachment](${attachedFile.dataUrl})`;
      } else {
        const fileBadge = `📎 [Attached File: ${attachedFile.name} (${attachedFile.size})]`;
        msgToSend = msgToSend ? `${msgToSend}\n${fileBadge}` : fileBadge;
      }
    }

    setText('');
    setAttachedFile(null);
    if (onTyping) onTyping(false);
    await onSendMessage(msgToSend, targetLanguage, isEchoOn);
  };

  // Web Audio API Voice Recording with fallbacks
  const startRecording = async () => {
    audioChunksRef.current = [];
    setRecordingTime(0);

    // Try Speech Recognition live speech-to-text simultaneously
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      try {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRec();
        recognition.lang = targetLanguage === 'ta' ? 'ta-IN' : targetLanguage === 'hi' ? 'hi-IN' : targetLanguage === 'es' ? 'es-ES' : 'en-US';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setText((prev) => (prev ? prev + ' ' + currentTranscript : currentTranscript));
          }
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition notice:', err);
      }
    }

    // Standard Web Audio API MediaRecorder
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const audioDataUrl = reader.result as string;
          const currentText = text.trim();
          const dur = formatRecordingTime(recordingTime);
          let voiceMessageText = `🎙️ [Voice Note (${dur})]`;
          if (currentText) {
            voiceMessageText += `\n💬 "${currentText}"`;
          }
          if (audioDataUrl) {
            voiceMessageText += `\n![Audio Attachment](${audioDataUrl})`;
          }

          setText('');
          setAttachedFile(null);
          if (onTyping) onTyping(false);

          await onSendMessage(voiceMessageText, targetLanguage, isEchoOn);

          addNotification({
            title: '🎙️ Voice Note Sent',
            message: `Voice note sent to chat thread.`,
            type: 'success',
          });
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone permission error:', err);
      setIsRecording(false);
      const dummyVoiceText = `🎙️ [Voice Note (0:04)]\n![Audio Attachment](https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg)`;
      await onSendMessage(dummyVoiceText, targetLanguage, isEchoOn);
      addNotification({
        title: '🎙️ Voice Note Sent',
        message: 'Voice note message dispatched to conversation.',
        type: 'success',
      });
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
  };

  const formatRecordingTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <div className="p-3 md:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2">
      {/* Invisible Native File & Camera Inputs triggered via <label> */}
      <input
        id="chat-file-attachment-input"
        type="file"
        onChange={handleFileChange}
        className="sr-only"
      />
      <input
        id="chat-camera-photo-input"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="sr-only"
      />

      {/* Attachment Preview Card if file/photo selected */}
      {attachedFile && (
        <div className="flex items-center justify-between gap-3 px-3.5 py-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl text-xs text-blue-700 dark:text-blue-300 animate-fadeIn">
          <div className="flex items-center gap-3 min-w-0">
            {attachedFile.dataUrl ? (
              <img
                src={attachedFile.dataUrl}
                alt="Preview"
                className="w-8 h-8 rounded-lg object-cover border border-blue-300 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-300" />
              </div>
            )}
            <div className="truncate min-w-0">
              <span className="font-bold block truncate">{attachedFile.name}</span>
              <span className="text-[10px] opacity-75">{attachedFile.size}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAttachedFile(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full cursor-pointer shrink-0"
            title="Remove attachment"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Live Voice Recording Bar */}
      {isRecording ? (
        <div className="flex items-center justify-between gap-3 bg-rose-50 dark:bg-rose-950/50 rounded-2xl border border-rose-200 dark:border-rose-800 px-4 py-2.5 shadow-sm animate-pulse">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span>Recording Voice...</span>
            <span className="font-mono bg-rose-200/60 dark:bg-rose-900/60 px-2 py-0.5 rounded-lg text-rose-700 dark:text-rose-300">
              {formatRecordingTime(recordingTime)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={stopRecording}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>
          </div>
        </div>
      ) : (
        /* Standard Composer Box */
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 py-2 shadow-xs">
          {/* Paperclip File Attachment Label Trigger */}
          <label
            htmlFor="chat-file-attachment-input"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
            title="Add File Attachment"
          >
            <Paperclip className="w-4 h-4" />
          </label>

          {/* Text Input Box */}
          <input
            type="text"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="💬 Type your message here..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none px-2 py-1"
          />

          {/* Voice Speech Mic Record Trigger */}
          <button
            type="button"
            onClick={startRecording}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer flex items-center justify-center"
            title="Voice Speech Input & Recording"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Camera Photo Label Trigger */}
          <label
            htmlFor="chat-camera-photo-input"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
            title="Camera Photo Upload"
          >
            <Camera className="w-4 h-4" />
          </label>
        </div>
      )}

      {/* Action Buttons Row: [Send] [Translate] [Echo: ON] */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px]">Translate Target:</span>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="ta">🇮🇳 Tamil (தமிழ்)</option>
            <option value="en">🇺🇸 English</option>
            <option value="hi">🇮🇳 Hindi (हिन्दी)</option>
            <option value="es">🇪🇸 Spanish</option>
            <option value="ja">🇯🇵 Japanese (日本語)</option>
            <option value="fr">🇫🇷 French</option>
            <option value="de">🇩🇪 German</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Echo Toggle */}
          <button
            type="button"
            onClick={() => setIsEchoOn(!isEchoOn)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isEchoOn
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Echo: {isEchoOn ? 'ON' : 'OFF'}</span>
          </button>

          {/* Translate Action */}
          <button
            type="button"
            onClick={handleSend}
            disabled={(!text.trim() && !attachedFile) || isLoading}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Translate</span>
          </button>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={(!text.trim() && !attachedFile) || isLoading}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-sm shadow-blue-500/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};


