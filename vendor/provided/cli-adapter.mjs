/** Rebrand the pinned supplied CLI without replacing its commands or RPC implementation. */
import { createHash } from 'node:crypto';
import { brandProductPreservingWires } from './wire-brand.mjs';
import { CLI_COMMAND } from '../aside/patches/brand.mjs';
import { findMachOSeaSection, readSeaBlob, writeSeaBlob, injectMachOSeaBlob } from '../aside/lib/sea.mjs';

export const CLI_VERSION = '1.26.1015';
export const CLI_BINARY_SHA256 = '17a9477fd0e3fe523ff439b76823d7d44e8f3de49cca38b79bc7bed3c599320a';
export const CLI_CODE_SHA256 = '013dbd114ac574df1e4c72f53fd438d4b7da4d2aebbf3c45fa22a6fb2fe1dd62';
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');

export function adaptCliCode(original) {
  if (sha(original) !== CLI_CODE_SHA256) throw new Error('Supplied CLI code hash mismatch');
  let code = original;
  const applied = [];
  function edit(name, kind, find, replace, count) {
    const actual = code.split(find).length - 1;
    if (actual !== count) throw new Error(`${name}: expected ${count}, found ${actual}`);
    code = code.split(find).join(replace);
    applied.push({ name, kind, find, replace, count });
  }
  edit('environment namespace', 'identity', 'ASIDE_', 'AUX_', 49);
  edit('stable daemon port', 'identity', '21420', '21520', 2);
  edit('development daemon port', 'identity', '21421', '21521', 2);
  edit('CLI state directory', 'identity', 'path.join(os.homedir(), ".aside", "cli")', 'path.join(os.homedir(), ".aux", "cli")', 1);
  edit('skill identity', 'identity', 'aside-browser', 'aux-browser', 7);
  edit('program command', 'identity', '.name("aside")', '.name("aux")', 1);
  edit('usage command', 'branding', '       aside [options]', '       aux [options]', 1);
  // Keep the original failed-request behavior at the explicit local-only cloud boundary.
  edit('hosted API unavailable locally', 'integration', 'https://api.aside.com', 'http://127.0.0.1:9/aux-unavailable/api', 1);
  edit('hosted release/installer unavailable locally', 'integration', 'https://releases.aside.com', 'http://127.0.0.1:9/aux-unavailable/releases', 2);
  const binding = code.match(/function candidateBindingPaths\(\) \{[\s\S]*?\n\}/)?.[0];
  if (!binding) throw new Error('Supplied CLI native loader anchor missing');
  edit('isolated native binding', 'integration', binding,
    'function candidateBindingPaths() {\n\treturn [path.resolve(path.dirname(process.execPath), "../Resources/native/aux-native.cjs")];\n}', 1);
  const branded = brandProductPreservingWires(code, { productCount: 101, wireCounts: {
    'AsideDaemonSessionToken ': 2, 'AsideSessionToken': 0,
    'Aside Daemon Auth v1': 1, 'Aside Daemon Dev Auth v1': 0, 'Aside.': 0,
  } });
  code = branded.code; applied.push(...branded.edits);
  const commands = [...code.matchAll(CLI_COMMAND)];
  if (commands.length !== 82) throw new Error(`CLI command branding drift: ${commands.length}`);
  for (const find of new Set(commands.map((match) => match[0])))
    edit('documented CLI command', 'branding', find, 'aux ', code.split(find).length - 1);
  return { code, applied, sha256: sha(code) };
}

export function adaptCliBinary(original) {
  if (sha(original) !== CLI_BINARY_SHA256) throw new Error('Supplied CLI binary hash mismatch');
  const section = findMachOSeaSection(original);
  const blob = readSeaBlob(original.subarray(section.offset, section.offset + section.size));
  const result = adaptCliCode(blob.code);
  const binary = Buffer.from(original);
  injectMachOSeaBlob(binary, writeSeaBlob({ ...blob, code: result.code }));
  return { binary, codeSha256: result.sha256, applied: result.applied,
    assets: blob.assets.map(([name, bytes]) => ({ name, bytes: bytes.length, sha256: sha(bytes) })) };
}
