/** Dedicated unchanged-Node proof only; never enables native command execution. */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { nativePackagingManifest } from './native-packaging-manifest.mjs';
const repository = fileURLToPath(new URL('../../', import.meta.url));
const digest = (p) => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function regular(p) {
  const s = fs.lstatSync(p);
  if (!s.isFile() || s.isSymbolicLink() || (s.mode & 0o022)) throw new Error('Nonregular or writable proof input');
  return p;
}
function signed(p) {
  const r = spawnSync('/usr/bin/codesign', ['--verify', '--strict', '--all-architectures', regular(p)], { timeout: 10000, maxBuffer: 8192 });
  if (r.status !== 0) throw new Error('Signed proof artifact verification failed');
}
export function proveNativeLoadOnly({ resourceRoot, nativeOutput, runtimeInventory }) {
  resourceRoot = fs.realpathSync(resourceRoot); nativeOutput = fs.realpathSync(nativeOutput);
  const receiptPath = regular(path.join(nativeOutput, 'native-build-receipt.json'));
  const receipt = JSON.parse(fs.readFileSync(receiptPath));
  if (receipt.version !== 1 || receipt.implementation !== 'supplied-boundary' || receipt.buildExitCode !== 0 || receipt.mapFixturePassed !== true) throw new Error('Successful source-matching native receipt required');
  for (const pin of nativePackagingManifest(nativeOutput).sources) {
    if (!receipt.sources?.some((p) => p.path === pin.path && p.sha256 === pin.sha256)) throw new Error('Receipt source does not match current implementation');
  }
  const artifact = (name) => {
    const p = regular(path.join(nativeOutput, name));
    if (!receipt.outputs?.some((e) => path.resolve(e.path) === p && e.sha256 === digest(p))) throw new Error('Receipt output mismatch');
    return p;
  };
  const guard = artifact('aux-native-guard.node'), boundary = artifact('libaux-native-boundary.dylib');
  const node = regular(path.join(resourceRoot, 'agent-runtime/node/bin/node'));
  const inventory = JSON.parse(fs.readFileSync(regular(runtimeInventory))).components?.runtime;
  const nodePin = inventory?.files?.find((e) => e.path === 'node/bin/node');
  if (inventory?.sourceVersion !== '1.26.1019.335' || !nodePin || digest(node) !== nodePin.sourceSha256) throw new Error('Unchanged supplied runtime Node required');
  const binding = regular(path.join(resourceRoot, 'apps/daemon/Aux Daemon.app/Contents/Resources/native/provided-native.node'));
  if (digest(binding) !== 'bfe946e05fbaf2ae68d0560258f50e63a6c3ff6da2937e0aa8f9f19016e1f7fb') throw new Error('Original supplied binding pin mismatch');
  for (const p of [node, guard, boundary, binding]) signed(p);
  const root = fs.realpathSync(fs.mkdtempSync(path.join(tmpdir(), 'aux-native-load-proof-')));
  fs.chmodSync(root, 0o700);
  try {
    const home = path.join(root, 'home'), otherHome = path.join(root, 'other-home'), directory = path.join(root, 'native'), temporary = path.join(root, 'tmp');
    for (const p of [home, otherHome, directory, temporary]) fs.mkdirSync(p, { mode: 0o700 });
    const copies = [[guard, 'aux-native-guard.node'], [boundary, 'libaux-native-boundary.dylib'], [binding, 'provided-native.node'], [path.join(repository, 'vendor/provided/aux-native.cjs'), 'aux-native.cjs'], [path.join(repository, 'vendor/provided/native-load-only-probe.cjs'), 'probe.cjs']];
    for (const [source, name] of copies) {
      const target = path.join(directory, name); fs.copyFileSync(regular(source), target, fs.constants.COPYFILE_EXCL);
      if (digest(source) !== digest(target)) throw new Error('Proof copy mismatch');
      fs.chmodSync(target, name.endsWith('.cjs') ? 0o600 : 0o755);
    }
    const r = spawnSync(node, [path.join(directory, 'probe.cjs'), directory, otherHome], {
      cwd: root, timeout: 20000, maxBuffer: 8192, encoding: 'utf8',
      env: { HOME: home, AUX_HOME: home, TMPDIR: temporary, PATH: '/usr/bin:/bin',
        AUX_PROVIDED_NATIVE_LOAD_ONLY: '1', DYLD_INSERT_LIBRARIES: path.join(directory, 'libaux-native-boundary.dylib') },
    });
    if (r.status !== 0) throw new Error('Dedicated Node load-only proof refused (no SEA acceptance implied)');
    const result = JSON.parse(r.stdout);
    for (const p of [result.main, result.worker]) {
      if (p?.importedPointersVerified !== true || p.denyAll !== true || p.canonicalScopeBound !== true || p.scopeChangeRefused !== true || p.originalBindingLoaded !== true || p.runExportRegistered !== true || p.originalCommandsInvoked !== false || p.originalPdfInvoked !== false || !Number.isSafeInteger(p.refusedSecurityCalls)) throw new Error('Incomplete load-only proof');
    }
    return { ...result, nativeBuildReceiptSha256: digest(receiptPath), nodeSha256: digest(node), bindingSha256: digest(binding),
      guardSha256: digest(guard), boundarySha256: digest(boundary), shimSha256: digest(path.join(directory, 'aux-native.cjs')),
      proofSha256: digest(path.join(directory, 'probe.cjs')), signedInputsVerified: true, suppliedSeaLoadingProven: false, dpRuntimeAccepted: false };
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [resourceRoot, nativeOutput, runtimeInventory] = process.argv.slice(2);
  if (!resourceRoot || !nativeOutput || !runtimeInventory) throw new Error('Usage: prove-native-load-only.mjs <resource-root> <native-output> <runtime-inventory>');
  console.log(JSON.stringify(proveNativeLoadOnly({ resourceRoot, nativeOutput, runtimeInventory }), null, 2));
}
