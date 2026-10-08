import React, { useState } from 'react';
import { User, EchoResult, PerceptionPreview, CodeSwitchRadarData } from '../../types';
import {
  requestTranslation,
  requestEchoCheck,
  requestPerceptionAnalysis,
  requestCodeSwitchRadar,
} from '../../services/api';
import { FlaskConical, Languages, Repeat, Sparkles, Activity, Play, Loader2 } from 'lucide-react';

interface NlpTestingViewProps {
  currentUser: User;
}

export const NlpTestingView: React.FC<NlpTestingViewProps> = ({ currentUser }) => {
  const [text, setText] = useState('வணக்கம் நண்பர்களே, deploy process ready-யா இருக்கு.');
  const [targetLang, setTargetLang] = useState(currentUser.preferredLanguage || 'en');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translation, setTranslation] = useState<{
    translatedText: string;
    detectedLanguage: string;
    confidenceScore: number;
  } | null>(null);
  const [echo, setEcho] = useState<EchoResult | null>(null);
  const [perception, setPerception] = useState<PerceptionPreview | null>(null);
  const [radar, setRadar] = useState<CodeSwitchRadarData | null>(null);

  const handleRunTests = async () => {
    if (!text.trim()) return;
    setIsRunning(true);
    setError(null);
    try {
      const [tr, echoRes, perc, radarRes] = await Promise.all([
        requestTranslation(text.trim(), targetLang, currentUser.preferredLanguage),
        requestEchoCheck(text.trim(), targetLang, currentUser.preferredLanguage),
        requestPerceptionAnalysis(text.trim(), targetLang),
        requestCodeSwitchRadar(text.trim(), 'nlp_test_' + Date.now()),
      ]);
      setTranslation(tr);
      setEcho(echoRes);
      setPerception(perc);
      setRadar(radarRes);
      // #region agent log
      fetch('http://127.0.0.1:7357/ingest/964320c7-aa6c-499b-87b0-be74cb7cab77',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db8af2'},body:JSON.stringify({sessionId:'db8af2',hypothesisId:'E',location:'NlpTestingView.tsx:run',message:'NLP test completed',data:{detectedLanguage:tr.detectedLanguage,confidence:tr.confidenceScore,fidelity:echoRes?.fidelityScore,sentiment:perc?.sentimentLabel,switchCount:radarRes?.switchCount,isCodeMixed:radarRes?.isCodeMixed},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
    } catch (err: any) {
      setError(err?.message || 'NLP test failed');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5 text-slate-200">
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border border-cyan-500/30">
        <div className="flex items-center gap-2 text-cyan-300 font-bold text-lg">
          <FlaskConical className="w-6 h-6 text-cyan-400" />
          NLP Testing Lab
        </div>
        <p className="text-xs text-slate-300 mt-1">
          Run live translation, echo fidelity, sentiment, and code-switch detection on any sample. Results update from the server when available.
        </p>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <label className="text-xs font-bold text-white flex items-center gap-2">
          <Languages className="w-4 h-4 text-cyan-400" /> Sample utterance
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
          >
            <option value="en">English</option>
            <option value="ta">Tamil</option>
            <option value="hi">Hindi</option>
            <option value="es">Spanish</option>
            <option value="ja">Japanese</option>
            <option value="fr">French</option>
          </select>
          <button
            type="button"
            onClick={handleRunTests}
            disabled={isRunning}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white text-xs font-bold flex items-center justify-center gap-2"
          >
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run NLP Suite
          </button>
        </div>
        {error && <p className="text-xs text-rose-400">{error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <h3 className="text-xs font-bold text-indigo-300 flex items-center gap-2">
            <Languages className="w-4 h-4" /> Translation
          </h3>
          {translation ? (
            <>
              <p className="text-[11px] text-slate-400">
                Detected: <span className="text-white font-semibold uppercase">{translation.detectedLanguage}</span> · Confidence {translation.confidenceScore}%
              </p>
              <p className="text-sm text-white">{translation.translatedText}</p>
            </>
          ) : (
            <p className="text-xs text-slate-500">No translation yet.</p>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <h3 className="text-xs font-bold text-emerald-300 flex items-center gap-2">
            <Repeat className="w-4 h-4" /> Echo fidelity
          </h3>
          {echo ? (
            <>
              <p className="text-[11px] text-slate-400">Score {echo.fidelityScore}%</p>
              <p className="text-xs text-slate-300">Forward: {echo.translatedText}</p>
              <p className="text-xs text-slate-400">Back: {echo.backTranslatedText}</p>
            </>
          ) : (
            <p className="text-xs text-slate-500">No echo result yet.</p>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <h3 className="text-xs font-bold text-purple-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Sentiment
          </h3>
          {perception ? (
            <>
              <p className="text-sm text-white">
                {perception.sentimentEmoji} {perception.sentimentLabel} ({perception.sentimentScore})
              </p>
              <p className="text-xs text-slate-400">{perception.toneDetails.emotionalNuance}</p>
            </>
          ) : (
            <p className="text-xs text-slate-500">No perception yet.</p>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <h3 className="text-xs font-bold text-amber-300 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Code-switch radar
          </h3>
          {radar ? (
            <>
              <p className="text-xs text-slate-300">
                Mixed: {radar.isCodeMixed ? 'yes' : 'no'} · Switches {radar.switchCount} · Complexity {radar.complexityScore}
              </p>
              <p className="text-[11px] text-slate-400">Languages: {radar.detectedLanguages.join(', ')}</p>
            </>
          ) : (
            <p className="text-xs text-slate-500">No radar result yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
