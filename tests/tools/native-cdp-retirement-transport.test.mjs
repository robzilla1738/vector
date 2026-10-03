// Synthetic protocol controls crossing the actual fixed dirfd writer, not native performance proof.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createPerformanceMailbox } from '../host/lib/performance-mailbox.mjs';
for (const operation of ['prepareCdpStopMeasurement', 'prepareCdpTakeoverMeasurement', 'completeCdpRetirementMeasurement']) {
  test(`fixed no-selector ${operation} retains original native refusal`, async () => {
    const root = mkdtempSync('/private/tmp/aux-native-journey-cdp-source-');
    const profile = join(root, 'profile'); mkdirSync(profile, { mode: 0o700 });
    const mailbox = createPerformanceMailbox({ userDataDir: profile, pid: 123, generation: 2 });
    try {
      const pending = mailbox.invoke(operation);
      assert.deepEqual(JSON.parse(readFileSync(join(root, 'performance-request.json'))), { sequence: '1', operation });
      const original = { producer: 'aux-native-fixture-reply', version: 1, pid: 123, windowId: 7, sequence: '1', operation,
        record: { producer: 'aux-native-cdp-retirement', version: 1, status: 'refused' } };
      const raw = 'AUX_NATIVE_FIXTURE_REPLY_V1 ' + JSON.stringify(original);
      mailbox.write(Buffer.from(raw + '\n'), { pid: 123, generation: 2 });
      assert.deepEqual(JSON.parse(await pending), original.record);
      assert.equal(mailbox.lastReceipt.raw, raw);
    } finally { mailbox.dispose(); rmSync(root, { recursive: true, force: true }); }
  });
}
