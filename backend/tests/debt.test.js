import test from 'node:test';
import assert from 'node:assert';
import { calculateTranslationDebtScore } from '../services/debtService.js';

test('TRANSLATION DEBT LEDGER Test Suite', async (t) => {
  await t.test('calculateTranslationDebtScore formula validation', async () => {
    const debt = calculateTranslationDebtScore({
      originalMessage: 'வணக்கம் நண்பர்களே',
      aiTranslation: 'Hello friends',
      confidenceScore: 70,
      correctionCount: 2,
      isAuditApproved: false,
      codeSwitchComplexity: 60,
      hoursSinceReview: 5,
    });

    assert.ok(debt.debtId);
    assert.ok(debt.debtScore > 0 && debt.debtScore <= 100);
    assert.ok(['quick_fix', 'structural', 'rewrite'].includes(debt.debtCategory));
    assert.ok(['low', 'medium', 'high', 'critical'].includes(debt.riskSeverity));
  });
});
