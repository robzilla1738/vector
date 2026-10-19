import { createHash } from 'node:crypto';
import { readFile, lstat, realpath } from 'node:fs/promises';
import { join, relative, sep, isAbsolute } from 'node:path';

export const providedComputerUseSha256 =
  'a17241d3149df77a8b05b17853053ca0318c7f78e6449800bafcfd3e14c97026';
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

export async function verifyProvidedComputerUse(appRoot) {
  if ((await lstat(appRoot)).isSymbolicLink())
    throw new Error('Helper root cannot be a symlink');
  appRoot = await realpath(appRoot);
  const inventory = JSON.parse(
    await readFile(
      new URL(
        '../../docs/source/provided-computer-use-inputs.json',
        import.meta.url,
      ),
      'utf8',
    ),
  );
  for (const file of inventory.files) {
    const path = join(appRoot, file.path),
      stat = await lstat(path);
    const location = relative(appRoot, await realpath(path));
    if (
      location === '..' ||
      location.startsWith(`..${sep}`) ||
      isAbsolute(location)
    )
      throw new Error('Helper input escapes its static app root');
    if (
      !stat.isFile() ||
      stat.isSymbolicLink() ||
      sha256(await readFile(path)) !== file.sha256
    )
      throw new Error(`Supplied Computer Use snapshot changed: ${file.path}`);
  }
  return inventory;
}

/** Offline candidate only: no execution/signing and no claim that remaining UI branding is complete. */
export function patchProvidedComputerUseIdentity(
  source,
  { browserBundleId, canaryBundleId },
) {
  if (!Buffer.isBuffer(source) || sha256(source) !== providedComputerUseSha256)
    throw new Error('Unexpected supplied Computer Use binary');
  if (
    !/^dev\.aux\.[a-z0-9.-]+$/.test(browserBundleId) ||
    !/^dev\.aux\.[a-z0-9.-]+$/.test(canaryBundleId) ||
    browserBundleId === canaryBundleId
  )
    throw new Error('Distinct explicit Aux browser bundle IDs are required');
  const output = Buffer.from(source),
    patches = [];
  function patch(offset, before, after, kind, reason) {
    if (
      before.length !== after.length ||
      !source.subarray(offset, offset + before.length).equals(before)
    )
      throw new Error(
        `Computer Use patch anchor changed at 0x${offset.toString(16)}`,
      );
    for (const existing of patches)
      if (
        offset < existing.offset + existing.beforeHex.length / 2 &&
        offset + before.length > existing.offset
      )
        throw new Error('Overlapping Computer Use patches');
    after.copy(output, offset);
    patches.push({
      offset,
      beforeHex: before.toString('hex'),
      afterHex: after.toString('hex'),
      count: 1,
      kind,
      reason,
    });
  }
  function literal(offset, oldValue, newValue) {
    const before = Buffer.from(`${oldValue}\0`),
      replacement = Buffer.from(newValue);
    if (
      replacement.length > before.length - 1 ||
      !/^[\x20-\x7e]+$/.test(newValue)
    )
      throw new Error('Aux literal must fit the original static string slot');
    if (
      source.indexOf(before) !== offset ||
      source.indexOf(before, offset + 1) !== -1
    )
      throw new Error(
        'Computer Use literal is not unique at its pinned offset',
      );
    const after = Buffer.alloc(before.length);
    replacement.copy(after);
    patch(
      offset,
      before,
      after,
      'identity',
      `${oldValue} → ${newValue}; zero-pad only within the original NUL-terminated slot`,
    );
  }
  const browserStrings = [
    {
      offset: 0x1699b0,
      oldValue: 'at.studio.AsideBrowser',
      value: browserBundleId,
      words: [0x1885b8, 0x1886d8],
      pointers: [0x1885c0, 0x1886e0],
    },
    {
      offset: 0x1699d0,
      oldValue: 'at.studio.AsideBrowserCanary',
      value: canaryBundleId,
      words: [0x1885c8, 0x1886e8],
      pointers: [0x1885d0, 0x1886f0],
    },
  ];
  for (const item of browserStrings) {
    const references = [];
    for (let offset = 0x178000; offset < 0x18c000; offset += 8) {
      if (
        (source.readBigUInt64LE(offset) & 0xfffffffffn) ===
        BigInt(item.offset - 0x20)
      )
        references.push(offset);
    }
    if (JSON.stringify(references) !== JSON.stringify(item.pointers))
      throw new Error(
        'Computer Use static Swift pointer reference count changed',
      );
    literal(item.offset, item.oldValue, item.value);
    for (const offset of item.words) {
      const before = Buffer.alloc(8),
        after = Buffer.alloc(8);
      before.writeBigUInt64LE(
        0xd000000000000000n | BigInt(Buffer.byteLength(item.oldValue)),
      );
      after.writeBigUInt64LE(
        0xd000000000000000n | BigInt(Buffer.byteLength(item.value)),
      );
      patch(
        offset,
        before,
        after,
        'swift-string-count',
        'Preserve immortal ASCII flags and chained pointer; update the exact UTF-8 count in both static sets',
      );
    }
  }
  literal(0x15e020, 'ASIDE_TCC_DISCLAIMED', 'AUX_TCC_DISCLAIMED');
  patch(
    0x11c4c,
    Buffer.from('800280d2', 'hex'),
    Buffer.from('400280d2', 'hex'),
    'instruction-immediate',
    'MOVZ x0 count20→18 for environment-key lookup; register/opcode unchanged',
  );
  patch(
    0x11eb8,
    Buffer.from('820280d2', 'hex'),
    Buffer.from('420280d2', 'hex'),
    'instruction-immediate',
    'MOVZ x2 count20→18 for environment-key assignment; register/opcode unchanged',
  );
  return {
    bytes: output,
    report: {
      version: 1,
      sourceSha256: providedComputerUseSha256,
      outputSha256: sha256(output),
      status: 'partial-identity-candidate',
      requiresAdHocResigning: true,
      browserBundleId,
      canaryBundleId,
      patches,
      remaining: [
        'Visible permission/menu prose and its compiled Swift length expressions are not yet patched',
        'Dispatch queue label branding remains',
        'Plist/app/menu icons require the separate branding pass',
        'No original helper execution, TCC behavior, self-suppression or permission acceptance has been observed',
      ],
    },
  };
}
