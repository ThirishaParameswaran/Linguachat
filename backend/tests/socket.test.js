import test from 'node:test';
import assert from 'node:assert';
import { initializeSocketIO } from '../sockets/socketHandler.js';

test('SOCKET.IO Event Registration Test Suite', async (t) => {
  await t.test('initializeSocketIO should be a function', async () => {
    assert.strictEqual(typeof initializeSocketIO, 'function');
  });
});
