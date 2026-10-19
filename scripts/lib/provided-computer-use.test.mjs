import assert from 'node:assert/strict';
import { access, readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import {
  patchProvidedComputerUseIdentity,
  stageProvidedComputerUse,
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
test('pinned helper branding updates exact strings/counts and preserves all bytes outside44 ranges', {
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
  assert.equal(report.patches.length, 44);
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
  assert.equal(report.status, 'branded-static-candidate');
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
    const decoded = [
      [0x1f60, 'add', 'x8, x8, #0x33'],
      [0x25270, 'mov', 'x0, #0x22'],
      [0x1e90, 'mov', 'x0, #0x93'],
      [0x2e18, 'mov', 'x9, #0x93'],
      [0xf554, 'add', 'x0, x8, #0x8'],
      [0xf55c, 'add', 'x2, x8, #0x59'],
      [0x15204, 'mov', 'x23, #0x10'],
      [0x12ad54, 'mov', 'x0, #0x10'],
      [0x12aa98, 'add', 'x0, x8, #0x5'],
      [0x131a44, 'add', 'x2, x26, #0x46'],
      [0x13ca20, 'mov', 'x0, #0x1c'],
      [0x1474cc, 'mov', 'x0, #0x20'],
      [0x1339b8, 'mov', 'x0, #0x1b'],
      [0x133fbc, 'mov', 'x0, #0x1b'],
      [0x146b70, 'mov', 'x0, #0x20'],
      [0x146e30, 'mov', 'x0, #0x20'],
      [0x1471a4, 'mov', 'x0, #0x20'],
      [0x14b7a4, 'mov', 'x0, #0x29'],
      [0x14b9e0, 'mov', 'x0, #0x29'],
      [0x129dd0, 'add', 'x0, x28, #0x5'],
      [0x15238, 'add', 'x0, x23, #0x3'],
    ];
    for (const [offset, mnemonic, operands] of decoded) {
      const address = (0x100000000 + offset).toString(16).padStart(16, '0');
      const line = disassembly.stdout
        .split('\n')
        .find((line) => line.startsWith(address));
      assert.equal(line, `${address}\t${mnemonic}\t${operands}`);
    }
    assert.equal(
      report.patches.filter((p) => p.kind === 'instruction-immediate').length,
      23,
    );
    assert.equal(report.productionReady, false);
    const originalSymbols = spawnSync(
      '/usr/bin/nm',
      ['-nm', join(inventory.inputRoot, 'Contents/MacOS/aside-computer-use')],
      { encoding: 'utf8' },
    );
    const candidateSymbols = spawnSync('/usr/bin/nm', ['-nm', candidate], {
      encoding: 'utf8',
    });
    assert.equal(originalSymbols.status, 0);
    assert.equal(candidateSymbols.status, 0);
    assert.equal(candidateSymbols.stdout, originalSymbols.stdout);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('static bundle staging changes only identity/prose/art, preserves resources/modes, and refuses overwrite', {
  skip: missing ? 'Pinned static helper is unavailable' : false,
}, async () => {
  const directory = await mkdtemp(join(tmpdir(), 'aux-helper-bundle-'));
  const options = {
    sourceRoot: inventory.inputRoot,
    outputRoot: join(directory, 'Aux Computer Use.app'),
    identities: { ...identities, bundleId: 'dev.aux.browser.computer-use' },
  };
  try {
    const report = await stageProvidedComputerUse(options);
    assert.equal(report.files.length, 11);
    assert.equal(report.productionReady, false);
    assert.equal(report.requiresAdHocResigning, true);
    const sourcePlist = spawnSync(
      '/usr/bin/plutil',
      [
        '-convert',
        'json',
        '-o',
        '-',
        join(inventory.inputRoot, 'Contents/Info.plist'),
      ],
      { encoding: 'utf8' },
    );
    const stagedPlist = spawnSync(
      '/usr/bin/plutil',
      [
        '-convert',
        'json',
        '-o',
        '-',
        join(options.outputRoot, 'Contents/Info.plist'),
      ],
      { encoding: 'utf8' },
    );
    assert.equal(sourcePlist.status, 0);
    assert.equal(stagedPlist.status, 0);
    const before = JSON.parse(sourcePlist.stdout),
      after = JSON.parse(stagedPlist.stdout);
    for (const [key, value] of Object.entries(before)) {
      const expected =
        key === 'CFBundleExecutable'
          ? 'aux-computer-use'
          : key === 'CFBundleIdentifier'
            ? options.identities.bundleId
            : typeof value === 'string'
              ? value.replaceAll('Aside', 'Aux')
              : value;
      assert.deepEqual(after[key], expected);
    }
    const { createHash } = await import('node:crypto');
    const { stat } = await import('node:fs/promises');
    for (const file of report.files) {
      const bytes = await readFile(join(report.outputRoot, file.path));
      assert.equal(
        createHash('sha256').update(bytes).digest('hex'),
        file.outputSha256,
      );
      assert.equal(
        (await stat(join(report.outputRoot, file.path))).mode & 0o777,
        file.sourceMode,
      );
      if (!file.changeKinds.length)
        assert.equal(file.sourceSha256, file.outputSha256);
    }
    assert.equal(report.files.filter((f) => !f.changeKinds.length).length, 6);
    await assert.rejects(stageProvidedComputerUse(options), /EEXIST/);
    await assert.rejects(
      stageProvidedComputerUse({ ...options, outputRoot: inventory.inputRoot }),
      /disjoint/,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
