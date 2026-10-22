import { test } from 'node:test';
import assert from 'node:assert/strict';
import { attachmentRoutes, parseByteRange, rangeStream } from './attachments';

test('attachment ranges are bounded single byte ranges', () => {
  assert.deepEqual(parseByteRange('bytes=2-5', 10), { start: 2, end: 5 });
  assert.deepEqual(parseByteRange('bytes=-3', 10), { start: 7, end: 9 });
  assert.deepEqual(parseByteRange('bytes=7-', 10), { start: 7, end: 9 });
  assert.deepEqual(parseByteRange('bytes=7-999', 10), { start: 7, end: 9 });
  for (const invalid of ['bytes=0-1,3-4', 'bytes=-0', 'bytes=10-', 'bytes=5-2', 'bytes=9007199254740993-']) assert.throws(() => parseByteRange(invalid, 10));
  assert.throws(() => parseByteRange('bytes=0-', 0));
});

test('range streaming slices across chunks and cancels upstream', async () => {
  let canceled = false;
  const chunks = [Buffer.from('012'), Buffer.from('345'), Buffer.from('6789'), Buffer.from('unread trailing content')];
  const source = new ReadableStream<Uint8Array>({ pull(c) { const chunk = chunks.shift(); if (chunk) c.enqueue(chunk); else c.close(); }, cancel() { canceled = true; } });
  assert.equal(await new Response(rangeStream(source, 2, 6)).text(), '23456');
  assert.equal(canceled, true);
});

test('attachment routes refuse unauthenticated access before storage', async () => {
  for (const path of ['/attachments/intents', '/attachments/upload', '/attachments/00000000-0000-4000-8000-000000000001/content']) {
    const response = await attachmentRoutes.request(path, { method: path.endsWith('/content') ? 'GET' : 'POST' });
    assert.equal(response.status, 401);
  }
});
