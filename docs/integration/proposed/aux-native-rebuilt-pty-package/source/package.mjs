/** Exact unsigned pairing, called only inside the existing assembler transaction. */
import { createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { readFile, lstat, realpath, writeFile, chmod, truncate } from 'node:fs/promises';
import { join, isAbsolute } from 'node:path';
import { currentNativeEntryResources, defaultIndexPath } from '../../aux-native-current-entry-package/source/resources.mjs';
const pins = JSON.parse(await readFile(new URL('../inputs.json', import.meta.url), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const preflights = new WeakSet();
async function pinned(path, expected) {
  const stat = await lstat(path);
  if (!stat.isFile() || stat.isSymbolicLink()) throw Error('Regular rebuilt-PTY input required: ' + path);
  const bytes = await readFile(path);
  if (hash(bytes) !== expected) throw Error('Rebuilt-PTY input hash mismatch: ' + path);
  return bytes;
}
function requireFields(actual, expected, label) {
  for (const [key, value] of Object.entries(expected)) {
    if (JSON.stringify(actual[key]) !== JSON.stringify(value)) throw Error(label + ': unexpected ' + key);
  }
}
async function destination(resources, relativePath) {
  const parts = relativePath.split('/');
  if (isAbsolute(relativePath) || parts.some(part => !part || part === '.' || part === '..'))
    throw Error('Fixed package-relative path required');
  let parent = resources;
  for (const part of parts.slice(0, -1)) {
    parent = join(parent, part);
    const stat = await lstat(parent);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw Error('Regular private assembly directory required');
  }
  return join(resources, relativePath);
}
export async function verifyRebuiltPtyPackageInput({ repositoryRoot, receiptPath, compositionBytes, stage }) {
  const root = await realpath(repositoryRoot);
  if (!isAbsolute(receiptPath) || stage.identityProfile !== 'aux-v1' || stage.stateIdentityVersion !== 2 ||
      hash(compositionBytes) !== pins.compositionSha256) throw Error('Exact inactive state2 composition required');
  const receipt = JSON.parse(await pinned(receiptPath, pins.buildReceipt.sha256));
  requireFields(receipt, pins.buildReceipt.fields, 'Actual v4 link receipt');
  for (const [path, expected] of Object.entries(pins.sourceFiles)) {
    if (isAbsolute(path) || path.split('/').some(part => !part || part === '.' || part === '..'))
      throw Error('Repository-relative source pin required');
    await pinned(join(root, path), expected);
  }
  for (const artifact of pins.receipts) {
    const bytes = await pinned(join(root, artifact.path), artifact.sha256);
    requireFields(JSON.parse(bytes), artifact.fields, artifact.path);
  }
  for (const [path, expected] of Object.entries(pins.externalReferences)) {
    const target = pins.externalSymlinks[path];
    if (target && await realpath(path) !== target) throw Error('Frozen tool symlink changed');
    const frozenPath = target ?? path;
    const stat = await lstat(frozenPath);
    if (!stat.isFile() || stat.isSymbolicLink()) throw Error('Regular frozen input required');
    const digest = createHash('sha256');
    for await (const chunk of createReadStream(frozenPath)) digest.update(chunk);
    if (digest.digest('hex') !== expected) throw Error('Frozen build input differs: ' + path);
  }
  for (const artifact of pins.replacements) {
    const bytes = await pinned(artifact.input, artifact.sha256);
    if (bytes.length !== artifact.bytes || !((await lstat(artifact.input)).mode & 0o111))
      throw Error('Exact compiled artifact bytes/mode required');
  }
  const evidence = Object.freeze({ format: pins.format, buildReceiptSha256: pins.buildReceipt.sha256,
    mainSha256: pins.replacements[0].sha256, moduleSha256: pins.replacements[1].sha256,
    policyFormat: 'aux.fresh.bootstrap.policy.v4', authorityGranted: false, coldHookEnabled: false });
  preflights.add(evidence);
  return evidence;
}
export async function replaceCopiedDaemonAndPty({ resources, assembled, evidence, repositoryRoot }) {
  if (!preflights.has(evidence) || assembled.identityProfile !== 'aux-v1' || assembled.stateIdentityVersion !== 2 ||
      assembled.daemonRuntime !== 'provided-node-development' || assembled.nativeMainReplacement ||
      assembled.nativePtyReplacement || assembled.nativeEntryProjection)
    throw Error('Fresh exact-byte inactive PTY preflight required');
  // Validate every old leaf and generate both resources before the first mutation.
  const replacements = [];
  for (const artifact of pins.replacements) {
    const entries = assembled.files.filter(file => file.path === artifact.path);
    if (entries.length !== 1 || entries[0].type !== 'file') throw Error('Exactly one native replacement leaf required');
    const entry = entries[0];
    if (entry.sha256 !== artifact.previousSha256) throw Error('Unexpected original PTY leaf');
    const path = await destination(resources, artifact.path);
    await pinned(path, entry.sha256);
    const bytes = await pinned(artifact.input, artifact.sha256);
    if (bytes.length !== artifact.bytes) throw Error('Compiled artifact changed after preflight');
    replacements.push({ artifact, entry, path, bytes, replacedSha256: entry.sha256 });
  }
  const helper = assembled.files.filter(file => file.path === pins.helper.path);
  if (helper.length !== 1 || helper[0].type !== 'file' || helper[0].sha256 !== pins.helper.sha256)
    throw Error('Exact original spawn helper required');
  await pinned(await destination(resources, pins.helper.path), pins.helper.sha256);
  const indexEntries = assembled.files.filter(file => file.path === defaultIndexPath);
  if (indexEntries.length !== 1 || indexEntries[0].type !== 'file' || indexEntries[0].sha256 !== pins.defaultIndexSha256)
    throw Error('Exact refused ordinary entry required');
  const index = await pinned(await destination(resources, defaultIndexPath), pins.defaultIndexSha256);
  const generated = await currentNativeEntryResources({ repositoryRoot, index });
  if (generated.length !== 2 || JSON.stringify(generated.map(({ path, sha256, mode }) => ({ path, sha256, mode }))) !==
      JSON.stringify(pins.dormantResources)) throw Error('Exactly two fixed dormant resources required');
  for (const file of generated) {
    if (assembled.files.some(entry => entry.path === file.path)) throw Error('Duplicate dormant entry resource');
    await destination(resources, file.path);
  }
  for (const { artifact, entry, path, bytes } of replacements) {
    await writeFile(path, bytes, { flag: 'r+' });
    await truncate(path, bytes.length);
    await chmod(path, artifact.mode);
    await pinned(path, artifact.sha256);
    if (((await lstat(path)).mode & 0o777) !== artifact.mode) throw Error('Replacement mode mismatch');
    Object.assign(entry, { sha256: artifact.sha256, mode: artifact.mode,
      source: artifact.source, changeKinds: ['integration'] });
  }
  for (const file of generated) {
    const path = await destination(resources, file.path);
    await writeFile(path, file.bytes, { flag: 'wx', mode: file.mode });
    await pinned(path, file.sha256);
    if (((await lstat(path)).mode & 0o777) !== file.mode) throw Error('Dormant resource mode mismatch');
    assembled.files.push({ path: file.path, type: 'file', sha256: file.sha256, mode: file.mode,
      source: 'reviewed-native-entry-projection', changeKinds: ['integration'] });
  }
  await pinned(await destination(resources, defaultIndexPath), pins.defaultIndexSha256);
  await pinned(await destination(resources, pins.helper.path), pins.helper.sha256);
  const nativeEntryProjection = { format: 'aux.dormant-native-entry.package.v2', dormant: true,
    sourceSha256: pins.defaultIndexSha256, files: generated.map(({ path, sha256, mode, bytes }) =>
      ({ path, sha256, mode, bytes: bytes.length })), requiredReaderSha256: pins.fixedReaderSha256,
    readerSourceLinked: true, pairedBuildReceiptSha256: pins.buildReceipt.sha256,
    pairedExecutableSha256: evidence.mainSha256, defaultEntryUnchanged: true,
    coldHookEnabled: false, runtimeAuthorityGranted: false };
  const report = { format: pins.format, mode: 'inactive-embedded-native-main-with-rebuilt-pty',
    buildReceiptSha256: pins.buildReceipt.sha256, policyFormatSupported: evidence.policyFormat,
    signedPolicyAccepted: false, authorityGranted: false, coldHookEnabled: false,
    fallbackRuntime: 'provided-node-development', defaultEntryRefusalPreserved: true,
    replacements: replacements.map(({ artifact, replacedSha256 }) => ({ path: artifact.path, replacedSha256,
      outputSha256: artifact.sha256, outputBytes: artifact.bytes })), helperUnchanged: true, nativeEntryProjection };
  assembled.nativePtyReplacement = report;
  assembled.nativeEntryProjection = nativeEntryProjection;
  await writeFile(join(resources, 'bundle.json'), JSON.stringify(assembled, null, 2) + '\n');
  preflights.delete(evidence);
  return report;
}
