import test from 'node:test';
import assert from 'node:assert';
import { processTranslation } from '../services/translationService.js';
import { processEchoCheck } from '../services/echoService.js';

test('TRANSLATION & ECHO Test Suite', async (t) => {
  await t.test('processTranslation should return translatedText and confidenceScore', async () => {
    const res = await processTranslation('Hello world', 'es');
    assert.ok(res.translatedText);
    assert.strictEqual(typeof res.confidenceScore, 'number');
  });

  await t.test('processEchoCheck should return fidelity score and back translation', async () => {
    const echo = await processEchoCheck('High priority release', 'ta', 'en');
    assert.ok(echo.backTranslatedText);
    assert.ok(echo.fidelityScore >= 0);
  });
});
