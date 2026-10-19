import { createHash } from 'node:crypto';
import {
  readFile,
  lstat,
  realpath,
  mkdir,
  writeFile,
  chmod,
  readdir,
} from 'node:fs/promises';
import { join, relative, sep, isAbsolute, resolve, dirname } from 'node:path';

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
  const actualPaths = [];
  async function walk(directory, prefix = '') {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      const stat = await lstat(join(appRoot, path));
      if (stat.isDirectory() && !stat.isSymbolicLink())
        await walk(join(appRoot, path), path);
      else if (stat.isFile() && !stat.isSymbolicLink()) actualPaths.push(path);
      else
        throw new Error(
          'Helper snapshot contains a symlink or nonregular input',
        );
    }
  }
  await walk(appRoot);
  if (
    JSON.stringify(actualPaths.sort()) !==
    JSON.stringify(inventory.files.map((file) => file.path).sort())
  )
    throw new Error('Helper static bundle inventory changed');
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
      stat.size !== file.size ||
      (stat.mode & 0o777) !== file.mode ||
      sha256(await readFile(path)) !== file.sha256
    )
      throw new Error(`Supplied Computer Use snapshot changed: ${file.path}`);
  }
  return inventory;
}

/** Offline binary adaptation only; execution, signing and TCC acceptance are separate. */
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
  function literal(offset, oldValue, newValue, expectedOccurrences = [offset]) {
    const before = Buffer.from(`${oldValue}\0`),
      replacement = Buffer.from(newValue);
    if (replacement.length > before.length - 1 || /[\x00-\x1f]/.test(newValue))
      throw new Error('Aux literal must fit the original static string slot');
    const occurrences = [];
    for (
      let at = source.indexOf(before);
      at !== -1;
      at = source.indexOf(before, at + 1)
    )
      occurrences.push(at);
    if (JSON.stringify(occurrences) !== JSON.stringify(expectedOccurrences))
      throw new Error('Computer Use literal occurrence anchors changed');
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
  // Counts are UTF-8 bytes, not JS character counts. Preserve every pointer and allocation.
  function instruction(offset, beforeHex, afterWord, reason) {
    const after = Buffer.alloc(4);
    after.writeUInt32LE(afterWord >>> 0);
    patch(
      offset,
      Buffer.from(beforeHex, 'hex'),
      after,
      'instruction-immediate',
      reason,
    );
  }
  function movCount(offset, register, oldCount, newCount, reason) {
    const word = (0xd2800000 | (oldCount << 5) | register) >>> 0;
    const before = Buffer.alloc(4);
    before.writeUInt32LE(word);
    instruction(
      offset,
      before.toString('hex'),
      0xd2800000 | (newCount << 5) | register,
      reason,
    );
  }
  function addCount(
    offset,
    register,
    baseRegister,
    oldImmediate,
    newImmediate,
    reason,
  ) {
    const word =
      (0x91000000 | (oldImmediate << 10) | (baseRegister << 5) | register) >>>
      0;
    const before = Buffer.alloc(4);
    before.writeUInt32LE(word);
    instruction(
      offset,
      before.toString('hex'),
      0x91000000 | (newImmediate << 10) | (baseRegister << 5) | register,
      reason,
    );
  }
  const strings = [
    {
      offset: 0x15d790,
      old: 'Missing command. Usage: aside-computer-use <command> [--json <payload>]',
      value:
        'Missing command. Usage: aux-computer-use <command> [--json <payload>]',
      adds: [[0x1f60, 8, 8, 53]],
    },
    {
      offset: 0x15f100,
      old: 'Library/Messages/.aside-send-staging',
      value: 'Library/Messages/.aux-send-staging',
      counts: [[0x25270, 0]],
    },
    {
      offset: 0x15d5f0,
      old: 'Sending requires Automation permission for Messages. Enable Aside Computer Use → Messages in System Settings → Privacy & Security → Automation.',
      counts: [
        [0x1e90, 0],
        [0x2e18, 9],
      ],
    },
    {
      offset: 0x15df90,
      old: 'Enable Aside with Messages',
      adds: [[0xf554, 0, 8, 10]],
    },
    {
      offset: 0x15dfb0,
      old: 'Aside needs macOS permissions to send messages, find contacts by name, and search your messages when asked.',
      adds: [[0xf55c, 2, 8, 91]],
    },
    {
      offset: 0x15e1a0,
      old: 'Aside Computer Use',
      counts: [
        [0x15204, 23],
        [0x12ad54, 0],
      ],
    },
    { offset: 0x1693e0, old: 'Aside Context Awareness' },
    {
      offset: 0x169440,
      old: 'Quit Aside Computer Use',
      adds: [[0x12aa98, 0, 8, 7]],
    },
    {
      offset: 0x1698d0,
      old: 'Aside needs macOS permissions to read on-screen app content and record short typed runs.',
      adds: [[0x131a44, 2, 26, 72]],
    },
    {
      offset: 0x169d40,
      old: 'Aside Computer Use AX observer',
      counts: [[0x13ca20, 0]],
    },
    {
      offset: 0x16a250,
      old: 'Aside Computer Use input event tap',
      counts: [[0x1474cc, 0]],
    },
    {
      offset: 0x169980,
      old: 'at.studio.aside.computer-use.output',
      counts: [
        [0x1339b8, 0],
        [0x133fbc, 0],
      ],
    },
    {
      offset: 0x16a1f0,
      old: 'at.studio.aside.computer-use.input-state',
      counts: [
        [0x146b70, 0],
        [0x146e30, 0],
        [0x1471a4, 0],
      ],
    },
    {
      offset: 0x16a2d0,
      old: 'at.studio.aside.computer-use.browser-signal-state',
      counts: [
        [0x14b7a4, 0],
        [0x14b9e0, 0],
      ],
    },
  ];
  for (const item of strings) {
    const value =
      item.value ??
      item.old.replace('Aside', 'Aux').replace('at.studio.aside', 'dev.aux');
    const oldCount = Buffer.byteLength(item.old),
      newCount = Buffer.byteLength(value);
    literal(
      item.offset,
      item.old,
      value,
      item.offset === 0x15e1a0 ? [0x15e1a0, 0x169445] : [item.offset],
    );
    for (const [offset, register] of item.counts ?? [])
      movCount(
        offset,
        register,
        oldCount,
        newCount,
        `Exact UTF-8 count for ${value}`,
      );
    for (const [offset, register, baseRegister, immediate] of item.adds ?? [])
      addCount(
        offset,
        register,
        baseRegister,
        immediate,
        immediate + newCount - oldCount,
        `Preserve shared 0xd000…0010 base; exact UTF-8 count for ${value}`,
      );
  }
  // x28 remains shared 0xd000…0010. ADD #5 gives21; ORR #5 is not an A64 logical immediate.
  instruction(
    0x129dd0,
    '800b40b2',
    0x91001780,
    'ADD x0,x28,#5 replaces ORR #7: shared flags/base16 unchanged, Context Awareness count23→21',
  );
  instruction(
    0x15238,
    'e00240b2',
    0x91000ee0,
    'ADD x0,x23,#3 preserves CFBundleDisplayName count19 after shared fallback count18→16; key bytes/pointer unchanged',
  );
  return {
    bytes: output,
    report: {
      version: 1,
      sourceSha256: providedComputerUseSha256,
      outputSha256: sha256(output),
      status: 'branded-static-candidate',
      productionReady: false,
      requiresAdHocResigning: true,
      browserBundleId,
      canaryBundleId,
      patches,
      remaining: [
        'No original helper execution, TCC behavior, self-suppression or permission acceptance has been observed',
        'Swift module/type and ABI symbols intentionally retain their internally consistent names',
      ],
    },
  };
}

/** Copy only the pinned static bundle. Never run it, request grants, or sign it. */
export async function stageProvidedComputerUse({
  sourceRoot,
  outputRoot,
  identities,
}) {
  const inventory = await verifyProvidedComputerUse(sourceRoot);
  sourceRoot = await realpath(sourceRoot);
  if (!isAbsolute(outputRoot))
    throw new Error('Absolute helper output root is required');
  const parent = await realpath(dirname(resolve(outputRoot)));
  outputRoot = join(parent, resolve(outputRoot).split(sep).at(-1));
  for (const [a, b] of [
    [sourceRoot, outputRoot],
    [outputRoot, sourceRoot],
  ]) {
    const child = relative(a, b);
    if (
      child === '' ||
      (!child.startsWith(`..${sep}`) && child !== '..' && !isAbsolute(child))
    )
      throw new Error('Helper source/output roots must be disjoint');
  }
  const executableName = identities?.executableName ?? 'aux-computer-use';
  if (
    executableName !== 'aux-computer-use' ||
    !/^dev\.aux\.[a-z0-9.-]+$/.test(identities?.bundleId ?? '')
  )
    throw new Error(
      'Explicit Aux helper bundle identity and executable name are required',
    );
  const sourceBinary = await readFile(
    join(sourceRoot, 'Contents/MacOS/aside-computer-use'),
  );
  const binary = patchProvidedComputerUseIdentity(sourceBinary, identities);
  const brand = JSON.parse(
    await readFile(
      new URL('../../assets/brand/inventory.json', import.meta.url),
      'utf8',
    ),
  );
  const iconSources = {
    'Contents/Resources/AppIcon.icns': 'Aux.icns',
    'Contents/Resources/MenuBarIcon.png': 'MenuBarIcon.png',
    'Contents/Resources/MenuBarIcon@2x.png': 'MenuBarIcon@2x.png',
  };
  const prepared = [],
    files = [];
  for (const file of inventory.files) {
    const source = await readFile(join(sourceRoot, file.path));
    if (sha256(source) !== file.sha256)
      throw new Error('Helper input changed during staging');
    let bytes = source,
      path = file.path;
    const changeKinds = [],
      anchors = [];
    if (path === 'Contents/MacOS/aside-computer-use') {
      bytes = binary.bytes;
      path = `Contents/MacOS/${executableName}`;
      changeKinds.push('identity', 'branding', 'path');
    } else if (path === 'Contents/Info.plist') {
      let text = source.toString('utf8');
      for (const [find, replace, count] of [
        ['at.studio.AsideBrowser.computer-use', identities.bundleId, 1],
        ['aside-computer-use', executableName, 1],
        ['Aside', 'Aux', 7],
      ]) {
        if (text.split(find).length - 1 !== count)
          throw new Error('Helper plist branding anchor changed');
        text = text.split(find).join(replace);
        anchors.push({ find, replace, count });
      }
      bytes = Buffer.from(text);
      changeKinds.push('identity', 'branding');
    } else if (iconSources[path]) {
      const assetPath = `assets/brand/${iconSources[path]}`;
      const pinned = brand.outputs.find(
        (entry) => entry.path === assetPath || entry.path === iconSources[path],
      );
      bytes = await readFile(new URL(`../../${assetPath}`, import.meta.url));
      if (!pinned || sha256(bytes) !== pinned.sha256)
        throw new Error(`Canonical helper artwork changed: ${assetPath}`);
      anchors.push({ assetPath, sha256: sha256(bytes) });
      changeKinds.push('branding');
    }
    prepared.push({ path, bytes, mode: file.mode });
    files.push({
      path,
      sourcePath: file.path,
      sourceSha256: file.sha256,
      outputSha256: sha256(bytes),
      sourceMode: file.mode,
      outputMode: file.mode,
      changeKinds,
      ...(anchors.length ? { anchors } : {}),
    });
  }
  // Verify the complete snapshot again before writing any output.
  await verifyProvidedComputerUse(sourceRoot);
  await mkdir(outputRoot, { mode: 0o700 }); // Refuse existing outputs rather than overwrite anything.
  for (const file of prepared) {
    await mkdir(dirname(join(outputRoot, file.path)), {
      recursive: true,
      mode: 0o700,
    });
    await writeFile(join(outputRoot, file.path), file.bytes, {
      flag: 'wx',
      mode: file.mode,
    });
    await chmod(join(outputRoot, file.path), file.mode);
  }
  return {
    version: 1,
    component: 'computer-use',
    sourceVersion: inventory.sourceVersion,
    sourceBuild: inventory.sourceBuild,
    inputRoot: sourceRoot,
    outputRoot,
    productionReady: false,
    requiresAdHocResigning: true,
    identities: { ...identities, executableName },
    files,
    binary: binary.report,
    remaining: [
      'Root must replace the invalidated source signature with ad hoc signing after staging',
      'Actual helper behavior, TCC responsibility/grants and browser self-capture suppression are unobserved',
    ],
  };
}
