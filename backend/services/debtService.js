/**
 * 5-Factor Translation Debt Engine
 */
export const calculateTranslationDebtScore = (payload) => {
  const {
    messageId = 'msg_' + Date.now(),
    originalMessage,
    aiTranslation,
    confidenceScore = 80,
    correctionCount = 0,
    isAuditApproved = false,
    codeSwitchComplexity = 50,
    hoursSinceReview = 2,
    sourceLanguage = 'ta',
    targetLanguage = 'en',
  } = payload;

  const confidenceDebt = Number(((100 - Math.min(100, Math.max(0, confidenceScore))) * 0.30).toFixed(1));
  const correctionDebt = Number((Math.min(correctionCount * 12.5, 25)).toFixed(1));
  const auditApprovalDebt = isAuditApproved ? 0 : 20;
  const complexityDebt = Number(((Math.min(100, Math.max(0, codeSwitchComplexity)) / 100) * 15).toFixed(1));
  const timeDebt = Number((Math.min((hoursSinceReview / 24) * 10, 10)).toFixed(1));

  const totalDebtScore = Math.round(confidenceDebt + correctionDebt + auditApprovalDebt + complexityDebt + timeDebt);

  let debtCategory = 'quick_fix';
  if (totalDebtScore > 75) debtCategory = 'rewrite';
  else if (totalDebtScore > 45) debtCategory = 'structural';

  let riskSeverity = 'low';
  if (totalDebtScore >= 80) riskSeverity = 'critical';
  else if (totalDebtScore >= 60) riskSeverity = 'high';
  else if (totalDebtScore >= 35) riskSeverity = 'medium';

  return {
    debtId: 'debt_' + Date.now(),
    messageId,
    originalMessage,
    aiTranslation,
    sourceLanguage,
    targetLanguage,
    debtScore: totalDebtScore,
    confidenceDebt,
    correctionDebt,
    auditApprovalDebt,
    complexityDebt,
    timeDebt,
    debtCategory,
    riskSeverity,
    remediationStatus: totalDebtScore > 50 ? 'in_queue' : 'unassigned',
    evaluatedBy: 'LinguaChat Debt Engine',
    evaluatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
};
