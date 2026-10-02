import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStartupNativeStream } from '../host/lib/startup-native-stream.mjs';
const refused = 'AUX_NATIVE_STARTUP_V1 {"producer":"aux-native-startup-presentation","version":1,"status":"refused","reason":"native_refused","measured":false,"earliestPresentationProven":false}\n';
const launch = { record: { kind: 'aux' }, receiptSha256: 'a'.repeat(64) };
const helper = { helperImageUuid: 'b'.repeat(32) };
test('original fragmented stream retains a truthful native refusal without log fallback', async () => {
  const stream = createStartupNativeStream(); stream.push(Buffer.from('ordinary native diagnostic\n' + refused.slice(0, 24)));
  stream.push(Buffer.from(refused.slice(24))); stream.finish();
  await assert.rejects(stream.measured(launch, helper), /Original native startup refusal/);
});
test('later duplicated native record remains failure after first delivery', async () => {
  const stream = createStartupNativeStream(); stream.push(Buffer.from(refused));
  assert.throws(() => stream.push(Buffer.from(refused)), /Repeated/); stream.finish();
  await assert.rejects(stream.measured(launch, helper), /Repeated/); assert.throws(() => stream.assertComplete(), /Repeated/);
});
test('missing, unterminated, oversized and retired original stream cannot count', async () => {
  for (const buffer of [Buffer.from('ordinary diagnostic\n'), Buffer.from(refused.slice(0, -1)), Buffer.alloc(16385, 65)]) {
    const stream = createStartupNativeStream();
    try { stream.push(buffer); } catch {}
    stream.finish();
    await assert.rejects(stream.measured(launch, helper)); assert.throws(() => stream.assertComplete());
    assert.throws(() => stream.push(Buffer.from(refused)), /Retired/);
  }
});
test('explicit cancellation rejects pending receipt without manufacturing native evidence', async () => {
  const stream = createStartupNativeStream(); const pending = stream.measured(launch, helper);
  stream.refuse(new Error('original launch cancelled')); await assert.rejects(pending, /cancelled/);
});
