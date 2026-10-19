import assert from 'node:assert/strict';
import { access, readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import {
  patchProvidedComputerUseIdentity,
  verifyProvidedComputerUse,
} from './provided-computer-use.mjs';
const inventory = JSON.parse(
  await readFile(
    new URL(
      '../../docs/source/provided-computer-use-inputs.json',
      import.meta.url,
    ),
    'utf8',
  ),
);
const identities = {
  browserBundleId: 'dev.aux.browser',
  canaryBundleId: 'dev.aux.browser.canary',
};
let missing = false;
try {
  await access(inventory.inputRoot);
} catch {
  missing = true;
}
test('pinned helper identity candidate updates strings, both Swift sets and both TCC lengths without other edits', {
  skip: missing ? 'Pinned static helper is unavailable' : false,
}, async () => {
  await verifyProvidedComputerUse(inventory.inputRoot);
  const source = await readFile(
    join(inventory.inputRoot, 'Contents/MacOS/aside-computer-use'),
  );
  const { bytes, report } = patchProvidedComputerUseIdentity(
    source,
    identities,
  );
  assert.equal(bytes.length, source.length);
  assert.equal(report.patches.length, 9);
  const replayed = Buffer.from(source);
  for (const patch of report.patches) {
    assert.ok(
      replayed
        .subarray(patch.offset, patch.offset + patch.beforeHex.length / 2)
        .equals(Buffer.from(patch.beforeHex, 'hex')),
    );
    Buffer.from(patch.afterHex, 'hex').copy(replayed, patch.offset);
  }
  assert.ok(replayed.equals(bytes));
  assert.equal(
    bytes.subarray(0x1699b0, 0x1699bf).toString(),
    identities.browserBundleId,
  );
  assert.equal(
    bytes.subarray(0x1699d0, 0x1699e6).toString(),
    identities.canaryBundleId,
  );
  for (const offset of [0x1885b8, 0x1886d8])
    assert.equal(bytes.readBigUInt64LE(offset), 0xd00000000000000fn);
  for (const offset of [0x1885c8, 0x1886e8])
    assert.equal(bytes.readBigUInt64LE(offset), 0xd000000000000016n);
  for (const offset of [0x1885c0, 0x1885d0, 0x1886e0, 0x1886f0])
    assert.ok(
      bytes
        .subarray(offset, offset + 8)
        .equals(source.subarray(offset, offset + 8)),
    );
  assert.equal((bytes.readUInt32LE(0x11c4c) >>> 5) & 0xffff, 18);
  assert.equal((bytes.readUInt32LE(0x11eb8) >>> 5) & 0xffff, 18);
  assert.equal(report.status, 'partial-identity-candidate');
  assert.equal(report.requiresAdHocResigning, true);
  assert.throws(
    () => patchProvidedComputerUseIdentity(Buffer.from('wrong'), identities),
    /Unexpected/,
  );
  assert.throws(
    () =>
      patchProvidedComputerUseIdentity(source, {
        ...identities,
        browserBundleId: 'at.studio.AsideBrowser',
      }),
    /Aux browser/,
  );
  assert.throws(
    () =>
      patchProvidedComputerUseIdentity(source, {
        ...identities,
        canaryBundleId: 'dev.aux.browser.' + 'long'.repeat(10),
      }),
    /fit the original/,
  );
  const directory = await mkdtemp(join(tmpdir(), 'aux-computer-use-static-'));
  try {
    const candidate = join(directory, 'candidate');
    await writeFile(candidate, bytes, { mode: 0o600 });
    const disassembly = spawnSync('/usr/bin/otool', ['-tvV', candidate], {
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
    });
    assert.equal(disassembly.status, 0);
    assert.match(disassembly.stdout, /0000000100011c4c\s+mov\s+x0, #0x12/);
    assert.match(disassembly.stdout, /0000000100011eb8\s+mov\s+x2, #0x12/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
