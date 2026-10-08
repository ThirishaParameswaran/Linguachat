import test from 'node:test';
import assert from 'node:assert';
import app from '../app.js';

test('CHAT API Test Suite', async (t) => {
  await t.test('App should be initialized for chat routes', async () => {
    assert.ok(app);
  });
});
