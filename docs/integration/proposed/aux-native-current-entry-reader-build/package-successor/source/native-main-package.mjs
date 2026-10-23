/** Inactive exact-build replacement, inside the assembler's private transaction. */
import { createHash } from 'node:crypto';
import { readFile, lstat, realpath, writeFile, chmod, truncate } from 'node:fs/promises';
import { dirname, join, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const pins = JSON.parse(await readFile(join(here, '../inputs.json'), 'utf8'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
async function pinned(path, expected) {
  const stat = await lstat(path);
  if (!stat.isFile() || stat.isSymbolicLink()) throw Error('Native-main input must be a regular file');
  const bytes = await readFile(path);
  if (sha(bytes) !== expected) throw Error('Native-main input hash mismatch: ' + path);
  return bytes;
}
export function verifyBuildReceipt(bytes) {
  if (sha(bytes) !== pins.buildReceiptSha256) throw Error('Exact fixed-reader build receipt required');
  const receipt = JSON.parse(bytes);
  if (receipt.format !== 'aux.current-native-reader.build.v1' || receipt.cppRecompiled !== false ||
      receipt.readerSha256 !== pins.fixedNativeEntryReaderSha256 || receipt.nodeArchivesChecked !== 42 ||
      receipt.passed !== true || receipt.inputsUnchanged !== true || receipt.executableRun !== false ||
      receipt.moduleLoaded !== false || receipt.signed !== false || receipt.nodeRebuilt !== false ||
      receipt.executableSha256 !== pins.executableSha256 || receipt.ptyExportMetadataExitCode !== 0 ||
      receipt.ptyExportMetadataSha256 !== pins.exportMetadataSha256 ||
      JSON.stringify(receipt.results) !== JSON.stringify([{command: 11, exitCode: 0}]))
    throw Error('Successful unexecuted native-main boundary required');
  return receipt;
}
export async function verifyNativeMainPackageInput({ repositoryRoot, receiptPath, compositionBytes, stage }) {
  const root = await realpath(repositoryRoot);
  if (!isAbsolute(receiptPath) || stage.identityProfile !== 'aux-v1' || stage.stateIdentityVersion !== 2 ||
      sha(compositionBytes) !== pins.compositionSha256) throw Error('Exact default-off state2 composition required');
  const receiptBytes = await pinned(receiptPath, pins.buildReceiptSha256);
  verifyBuildReceipt(receiptBytes);
  for (const [path, expected] of Object.entries(pins.sourceFiles)) {
    if (isAbsolute(path) || path.split('/').some(p => !p || p === '..' || p === '.')) throw Error('Invalid source pin');
    await pinned(join(root, path), expected);
  }
  for (const [path, expected] of Object.entries(pins.externalReferences)) await pinned(path, expected);
  await pinned(join(root, pins.nodeReceipt), pins.nodeReceiptSha256);
  await pinned(pins.exportMetadata, pins.exportMetadataSha256);
  const bytes = await pinned(pins.executable, pins.executableSha256);
  if (bytes.length !== pins.executableBytes || !((await lstat(pins.executable)).mode & 0o111))
    throw Error('Exact executable bytes/mode required');
  return Object.freeze({ receiptSha256: pins.buildReceiptSha256, outputSha256: pins.executableSha256,
    outputBytes: bytes.length, compositionSha256: pins.compositionSha256,
    sourceFiles: Object.keys(pins.sourceFiles).length, fixedNativeEntryReaderSha256: pins.fixedNativeEntryReaderSha256, authorityGranted: false, coldHookEnabled: false });
}
/** Only called on private assembled resources after the existing full supplied checker. */
export async function replaceCopiedDaemonWithNativeMain({ resources, assembled, evidence }) {
  if (!evidence || evidence.receiptSha256 !== pins.buildReceiptSha256 || evidence.outputSha256 !== pins.executableSha256 ||
      evidence.authorityGranted !== false || evidence.coldHookEnabled !== false ||
      evidence.fixedNativeEntryReaderSha256 !== pins.fixedNativeEntryReaderSha256 ||
      assembled.identityProfile !== 'aux-v1' || assembled.stateIdentityVersion !== 2 ||
      assembled.daemonRuntime !== 'provided-node-development' || assembled.nativeMainReplacement)
    throw Error('Inactive native-main preflight required');
  const matches = assembled.files.filter(file => file.path === pins.replacementPath);
  if (matches.length !== 1 || matches[0].type !== 'file') throw Error('Exactly one copied daemon main required');
  const entry = matches[0];
  const destination = join(resources, pins.replacementPath);
  await pinned(destination, entry.sha256);
  const bytes = await pinned(pins.executable, pins.executableSha256);
  const replacedSha256 = entry.sha256;
  // This code has no standalone command: existing package failure cleanup owns this private tree.
  await writeFile(destination, bytes, { flag: 'r+' });
  // r+ does not truncate larger supplied SEA files.
  await truncate(destination, bytes.length);
  await chmod(destination, pins.mode);
  await pinned(destination, pins.executableSha256);
  Object.assign(entry, { sha256: pins.executableSha256, mode: pins.mode, source: 'compiled-native-main',
    changeKinds: ['integration'] });
  const replacement = { mode: 'inactive-embedded-native-main', path: pins.replacementPath, replacedSha256,
    outputSha256: pins.executableSha256, outputBytes: pins.executableBytes, buildReceiptSha256: pins.buildReceiptSha256,
    sourceGraphFiles: evidence.sourceFiles, fixedNativeEntryReaderSha256: pins.fixedNativeEntryReaderSha256, authorityGranted: false, coldHookEnabled: false,
    fallbackRuntime: 'provided-node-development', defaultEntryRefusalPreserved: true };
  assembled.nativeMainReplacement = replacement;
  await writeFile(join(resources, 'bundle.json'), JSON.stringify(assembled, null, 2) + '\n');
  return replacement;
}
