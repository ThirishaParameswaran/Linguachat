import React, { useState, useRef, useEffect } from 'react';
import { User, Message, GroupChat, EchoResult, CodeSwitchRadarData } from '../../types';
import { requestTranslation, requestEchoCheck, requestPerceptionAnalysis, requestCodeSwitchRadar, requestDebtCalculation } from '../../services/api';
import { useAppState } from '../../store/appState';
import {
  Send,
  Mic,
  Volume2,
  Repeat,
  Sparkles,
  Activity,
  CheckCheck,
  Languages,
  BookOpen,
  Info,
  Square,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface ChatViewProps {
  currentUser: User;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  groups: GroupChat[];
  onAddDebtItem: (item: any) => void;
  onOpenAuditForMessage: (msg: Message) => void;
  onOpenRadarForMessage: (msg: Message) => void;
  onLearnWord: (word: any) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  currentUser,
  messages,
  setMessages,
  groups,
  onAddDebtItem,
  onOpenAuditForMessage,
  onOpenRadarForMessage,
  onLearnWord,
}) => {
  const { addNotification } = useAppState();
  const [selectedGroup, setSelectedGroup] = useState<GroupChat>(groups[0]);
  const [inputText, setInputText] = useState('');
  const [targetLang, setTargetLang] = useState(currentUser.preferredLanguage || 'en');
  const [isEchoEnabled, setIsEchoEnabled] = useState(true);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [echoModalData, setEchoModalData] = useState<{
    text: string;
    result: EchoResult;
  } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedWordDrawer, setSelectedWordDrawer] = useState<{
    word: string;
    translation: string;
    definition: string;
    phonetic?: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Speech Recognition (Voice-to-Text)
  const handleVoiceRecord = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      addNotification({
        title: '🎙️ Voice Input Unsupported',
        message: 'Speech recognition is not supported in this browser.',
        type: 'warning',
      });
      return;
    }

    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      return;
    }

    setIsRecordingVoice(true);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = targetLang === 'ta' ? 'ta-IN' : targetLang === 'hi' ? 'hi-IN' : targetLang === 'es' ? 'es-ES' : 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsRecordingVoice(false);
    };

    recognition.onerror = () => {
      setIsRecordingVoice(false);
    };

    recognition.start();
  };

  // Text to Speech Read Aloud
  const handleReadAloud = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ta' ? 'ta-IN' : lang === 'hi' ? 'hi-IN' : lang === 'es' ? 'es-ES' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Dispatch Message
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true);

    const textToSend = inputText.trim();
    setInputText('');

    // If Echo Mode is enabled, run echo check first
    if (isEchoEnabled) {
      const echoRes = await requestEchoCheck(textToSend, targetLang, currentUser.preferredLanguage);
      setIsTranslating(false);
      setEchoModalData({ text: textToSend, result: echoRes });
      return;
    }

    await finalizeAndPushMessage(textToSend, null);
    setIsTranslating(false);
  };

  const finalizeAndPushMessage = async (textToSend: string, echoResult: EchoResult | null) => {
    // Run AI Translation, Perception, and Code-Switch Radar
    const translationRes = await requestTranslation(textToSend, targetLang, currentUser.preferredLanguage);
    const perceptionRes = await requestPerceptionAnalysis(translationRes.translatedText, targetLang);
    const msgId = 'msg_' + Date.now();
    const radarRes = await requestCodeSwitchRadar(textToSend, msgId);

    const newMsg: Message = {
      messageId: msgId,
      senderId: currentUser.userId,
      senderName: currentUser.username,
      senderAvatar: currentUser.avatar,
      groupId: selectedGroup.groupId,
      originalText: textToSend,
      detectedLanguage: translationRes.detectedLanguage,
      translatedText: translationRes.translatedText,
      targetLanguage: targetLang,
      confidenceScore: translationRes.confidenceScore,
      echoChecked: !!echoResult,
      echoResult: echoResult || undefined,
      sentimentScore: perceptionRes.sentimentScore,
      sentimentLabel: perceptionRes.sentimentLabel,
      sentimentEmoji: perceptionRes.sentimentEmoji,
      radarId: radarRes.radarId,
      radarData: radarRes,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
      highlightedWords: translationRes.keyTerms.length > 0 ? translationRes.keyTerms : undefined,
    };

    setMessages((prev) => [...prev, newMsg]);

    // Compute & evaluate Translation Debt Item
    const debtRes = await requestDebtCalculation({
      messageId: msgId,
      originalMessage: textToSend,
      aiTranslation: translationRes.translatedText,
      confidenceScore: translationRes.confidenceScore,
      codeSwitchComplexity: radarRes.complexityScore,
      sourceLanguage: translationRes.detectedLanguage,
      targetLanguage: targetLang,
    });

    onAddDebtItem(debtRes);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100dvh-65px)] md:h-[calc(100vh-65px)] max-md:h-[calc(100dvh-130px)] bg-slate-950 text-slate-200">
      {/* Group / Channel Selector Sidebar */}
      <div className="w-full lg:w-72 bg-slate-900 border-r border-slate-800 p-4 space-y-4 shrink-0 overflow-y-auto">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Active Chat Rooms</span>
          <span className="text-indigo-400 font-mono text-[10px]">{groups.length} Channels</span>
        </div>

        <div className="space-y-2">
          {groups.map((grp) => (
            <button
              key={grp.groupId}
              onClick={() => setSelectedGroup(grp)}
              className={`w-full p-3 rounded-xl border text-left transition-all ${
                selectedGroup.groupId === grp.groupId
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <img src={grp.avatar} alt={grp.name} className="w-9 h-9 rounded-xl object-cover" />
                <div className="overflow-hidden flex-1">
                  <div className="text-xs font-bold truncate">{grp.name}</div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{grp.lastMessage}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Target Translation Selector */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
          <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 uppercase">
            <Languages className="w-3.5 h-3.5 text-indigo-400" /> Target Output Language
          </label>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="en">English (US)</option>
            <option value="ta">Tamil (தமிழ்)</option>
            <option value="hi">Hindi (हिंदी)</option>
            <option value="es">Spanish (Español)</option>
            <option value="ja">Japanese (日本語)</option>
            <option value="fr">French (Français)</option>
            <option value="zh">Mandarin (中文)</option>
            <option value="ar">Arabic (العربية)</option>
          </select>
        </div>
      </div>

      {/* Main Chat Thread Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
        {/* Chat Room Header */}
        <div className="px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={selectedGroup.avatar} alt={selectedGroup.name} className="w-8 h-8 rounded-lg object-cover" />
            <div>
              <h2 className="text-sm font-bold text-white">{selectedGroup.name}</h2>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>{selectedGroup.members.length} participants</span>
                <span>•</span>
                <span className="text-emerald-400">AI Auto-Translate Enabled</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEchoEnabled(!isEchoEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                isEchoEnabled
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Echo Mode: {isEchoEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Message History List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUser.userId;

            return (
              <div
                key={msg.messageId}
                className={`flex gap-3 max-w-3xl ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  className="w-8 h-8 rounded-xl object-cover shrink-0 mt-1"
                />

                <div className={`space-y-1.5 ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Sender Label */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
                    <span className="font-semibold text-slate-300">{msg.senderName}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300">
                      {msg.detectedLanguage} → {msg.targetLanguage}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Bubble Card */}
                  <div
                    className={`p-4 rounded-2xl border text-xs space-y-2.5 shadow-md ${
                      isMe
                        ? 'bg-indigo-950/80 border-indigo-700/60 text-indigo-100 rounded-tr-none'
                        : 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {/* Original Text */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Original Input</span>
                        <button
                          onClick={() => handleReadAloud(msg.originalText, msg.detectedLanguage)}
                          className="p-1 hover:text-white transition-colors"
                          title="Read aloud original"
                        >
                          <Volume2 className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>
                      <p className="text-xs font-normal text-slate-200 leading-relaxed">{msg.originalText}</p>
                    </div>

                    {/* AI Translation Output */}
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                      <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> AI Translation Output
                        </span>
                        <button
                          onClick={() => handleReadAloud(msg.translatedText, msg.targetLanguage)}
                          className="p-1 hover:text-white transition-colors"
                          title="Read aloud translation"
                        >
                          <Volume2 className="w-3 h-3 text-indigo-400" />
                        </button>
                      </div>
                      <p className="text-xs font-medium text-white leading-relaxed">{msg.translatedText}</p>
                    </div>

                    {/* Key Words Highlight Bar (Learn As You Chat) */}
                    {msg.highlightedWords && msg.highlightedWords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] text-slate-400 self-center">Vocab:</span>
                        {msg.highlightedWords.map((kw, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedWordDrawer(kw);
                              onLearnWord({
                                wordId: 'learn_' + Date.now(),
                                word: kw.word,
                                translation: kw.translation,
                                definition: kw.definition,
                                phonetic: kw.phonetic || '',
                                sourceLanguage: msg.detectedLanguage,
                                targetLanguage: msg.targetLanguage,
                                masteryLevel: 1,
                              });
                            }}
                            className="px-2 py-0.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-medium transition-all"
                          >
                            {kw.word} ({kw.translation})
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Transparency Badges Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[10px]">
                      <div className="flex items-center gap-2">
                        {/* Perception Sentiment Badge */}
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                          {msg.sentimentEmoji} {msg.sentimentLabel} ({Math.round(msg.sentimentScore * 100)}%)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Audit Trail Button */}
                        <button
                          onClick={() => onOpenAuditForMessage(msg)}
                          className="text-indigo-400 hover:text-indigo-300 font-semibold underline"
                        >
                          Audit / Correct
                        </button>

                        <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Word Definition Modal/Drawer */}
        {selectedWordDrawer && (
          <div className="mx-6 mb-2 p-3 bg-purple-950/90 border border-purple-500/40 rounded-xl flex items-center justify-between text-xs text-purple-100">
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <div>
                <span className="font-bold text-white">{selectedWordDrawer.word}</span> →{' '}
                <span className="text-purple-300 font-semibold">{selectedWordDrawer.translation}</span>
                <p className="text-[11px] text-purple-200 mt-0.5">{selectedWordDrawer.definition}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedWordDrawer(null)}
              className="text-purple-300 hover:text-white text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Echo Mode Pre-Sending Confirmation Overlay Modal */}
        {echoModalData && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 max-w-lg w-full space-y-4 text-slate-200 shadow-2xl">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Repeat className="w-5 h-5" />
                Echo Mode Verification Required
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Original Text</span>
                <p className="text-slate-200">{echoModalData.text}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                <span className="text-[10px] text-indigo-400 uppercase font-semibold">
                  Translated ({echoModalData.result.targetLanguage})
                </span>
                <p className="text-white font-semibold">{echoModalData.result.translatedText}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                <span className="text-[10px] text-emerald-400 uppercase font-semibold">Back Translation to Source</span>
                <p className="text-emerald-200">{echoModalData.result.backTranslatedText}</p>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <span>Semantic Fidelity Score:</span>
                <span className="font-bold text-indigo-300 text-sm">{echoModalData.result.fidelityScore}%</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEchoModalData(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Edit Input
                </button>
                <button
                  onClick={async () => {
                    const data = echoModalData;
                    setEchoModalData(null);
                    await finalizeAndPushMessage(data.text, data.result);
                  }}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Confirm & Dispatch
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            {/* Voice Record Button */}
            <button
              onClick={handleVoiceRecord}
              className={`p-3 rounded-xl border transition-colors ${
                isRecordingVoice
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title="Record Voice to Text"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Type message in any language (Auto-translates to ${(targetLang || 'es').toUpperCase()})...`}
              className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={isTranslating || !inputText.trim()}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              {isTranslating ? (
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
