import { useState, useCallback } from 'react';
import { useAppState } from '../store/appState';
import {
  requestTranslation,
  requestEchoCheck,
  requestPerceptionAnalysis,
  requestCodeSwitchRadar,
  requestDebtCalculation,
} from '../services/api';
import { EchoResult, PerceptionPreview, CodeSwitchRadarData, TranslationDebtItem } from '../types';

export function useTranslation() {
  const {
    sourceLanguage,
    targetLanguage,
    setSourceLanguage,
    setTargetLanguage,
    currentTranslation,
    setCurrentTranslation,
    addTranslationHistory,
    addDebtItem,
  } = useAppState();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = useCallback(
    async (
      text: string,
      tgtLang: string = targetLanguage,
      srcLang: string = sourceLanguage
    ) => {
      if (!text.trim()) return null;
      setIsLoading(true);
      setError(null);
      setCurrentTranslation({ isLoading: true, text });

      try {
        const result = await requestTranslation(text, tgtLang, srcLang === 'auto' ? undefined : srcLang);
        if (result.success && result.translatedText) {
          setCurrentTranslation({
            text,
            translated: result.translatedText,
            detectedLang: result.detectedLanguage,
            confidence: result.confidenceScore,
            keyTerms: result.keyTerms,
            isLoading: false,
          });

          addTranslationHistory({
            sourceText: text,
            translatedText: result.translatedText,
            sourceLang: result.detectedLanguage,
            targetLang: tgtLang,
            confidenceScore: result.confidenceScore,
          });

          setIsLoading(false);
          return result;
        } else {
          const errMessage = result.error || 'Translation unavailable. Please try again.';
          setError(errMessage);
          setCurrentTranslation({ isLoading: false, translated: '', confidence: 0, keyTerms: [] });
          setIsLoading(false);
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Translation failed');
        setCurrentTranslation({ isLoading: false });
        setIsLoading(false);
        return null;
      }
    },
    [targetLanguage, sourceLanguage, setCurrentTranslation, addTranslationHistory]
  );

  const batchTranslate = useCallback(
    async (texts: string[], tgtLang: string = targetLanguage) => {
      if (!texts.length) return [];
      setIsLoading(true);
      try {
        const res = await fetch('/api/translate/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts, targetLanguage: tgtLang }),
        });
        if (res.ok) {
          const data = await res.json();
          setIsLoading(false);
          return data.translations || [];
        }
      } catch (err: any) {
        setError(err.message || 'Batch translation failed');
      }
      setIsLoading(false);
      return [];
    },
    [targetLanguage]
  );

  const echoCheck = useCallback(
    async (
      text: string,
      tgtLang: string = targetLanguage,
      srcLang: string = sourceLanguage
    ): Promise<EchoResult> => {
      setIsLoading(true);
      try {
        const res = await requestEchoCheck(text, tgtLang, srcLang === 'auto' ? undefined : srcLang);
        setIsLoading(false);
        return res;
      } catch (err: any) {
        setIsLoading(false);
        throw err;
      }
    },
    [targetLanguage, sourceLanguage]
  );

  const analyzePerception = useCallback(
    async (text: string, tgtLang: string = targetLanguage): Promise<PerceptionPreview> => {
      return requestPerceptionAnalysis(text, tgtLang);
    },
    [targetLanguage]
  );

  const detectCodeSwitch = useCallback(
    async (text: string, messageId: string = 'msg_radar'): Promise<CodeSwitchRadarData> => {
      return requestCodeSwitchRadar(text, messageId);
    },
    []
  );

  const calculateDebt = useCallback(
    async (payload: {
      messageId: string;
      originalMessage: string;
      aiTranslation: string;
      confidenceScore: number;
      correctionCount?: number;
      isAuditApproved?: boolean;
      codeSwitchComplexity?: number;
      hoursSinceReview?: number;
      sourceLanguage?: string;
      targetLanguage?: string;
    }): Promise<TranslationDebtItem> => {
      const item = await requestDebtCalculation(payload);
      addDebtItem(item);
      return item;
    },
    [addDebtItem]
  );

  return {
    sourceLanguage,
    targetLanguage,
    currentTranslation,
    isLoading,
    error,
    setSourceLanguage,
    setTargetLanguage,
    translate,
    batchTranslate,
    echoCheck,
    analyzePerception,
    detectCodeSwitch,
    calculateDebt,
  };
}
