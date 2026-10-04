// Original mailbox and dirfd writer controls with disposable files; no native run.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { createPerformanceMailbox } from './performance-mailbox.mjs';
async function fixture(run) { const root = mkdtempSync('/private/tmp/aux-native-journey-guest-bytes-'); const profile = join(root, 'profile'); mkdirSync(profile, { mode: 0o700 }); const mailbox = createPerformanceMailbox({ userDataDir: profile, pid: 42, generation: 1 }); try { await run(mailbox); } finally { mailbox.dispose(); rmSync(root, { recursive: true, force: true }); } }
const record = '{"windowId":7,"status":"measured","drawn":[{"visibleBounds":{"x":0.0}}]}';
const wrapper = body => 'AUX_NATIVE_FIXTURE_REPLY_V1 {"producer":"aux-native-fixture-reply","version":1,"pid":42,"windowId":7,"sequence":"1","operation":"completeGuestPresentation","record":' + body + '}';
test('real guest mailbox returns exact nested .0 original substring', () => fixture(async mailbox => { const pending = mailbox.invoke('completeGuestPresentation'); const raw = wrapper(record); mailbox.write(Buffer.from(raw + '\n'), { pid: 42, generation: 1 }); assert.equal(await pending, record); assert.equal(mailbox.lastReceipt.raw, raw); assert.equal(mailbox.lastReceipt.recordRaw, record); }));
for (const [name, raw] of [['nested duplicate', wrapper(record.replace('"x":0.0', '"x":1,"x":0.0'))], ['wrapper duplicate', wrapper(record).replace('"pid":42', '"pid":42,"pid":42')]]) test(`real original guest transport refuses ${name}`, () => fixture(async mailbox => { const pending = mailbox.invoke('completeGuestPresentation'); mailbox.write(Buffer.from(raw + '\n'), { pid: 42, generation: 1 }); await assert.rejects(pending, /Duplicate/); assert.equal(mailbox.lastReceipt, undefined); }));
