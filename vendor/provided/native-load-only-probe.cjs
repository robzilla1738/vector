'use strict';
// This file deliberately never invokes an original command or PDF export.
const { Worker, isMainThread, parentPort, workerData } = require('node:worker_threads');
const path = require('node:path');
const crypto = require('node:crypto');
const fs = require('node:fs');
function proof({ directory, otherHome }) {
  if (process.env.AUX_PROVIDED_NATIVE_LOAD_ONLY !== '1' || process.env.AUX_ENABLE_PROVIDED_NATIVE_CARRIER) throw new Error('Dedicated load-only process required');
  const home = fs.realpathSync(process.env.AUX_HOME);
  const guard = require(path.join(directory, 'aux-native-guard.node'));
  const prepared = guard.prepare(home, true);
  if (prepared.boundaryActive !== true || prepared.denyAll !== true) throw new Error('Imported-pointer deny-all handshake failed');
  const binding = require(path.join(directory, 'aux-native.cjs'));
  if (binding.registration?.originalBindingLoaded !== true || binding.registration.runExportRegistered !== true) throw new Error('Original NAPI run export not registered');
  let scopeChangeRefused = false;
  try { guard.prepare(otherHome, true); } catch { scopeChangeRefused = true; }
  const status = binding.boundaryStatus;
  const canonicalScopeBound = process.env.AUX_NATIVE_KEYCHAIN_SCOPE === crypto.createHash('sha256').update(home).digest('hex');
  if (!scopeChangeRefused || !canonicalScopeBound || status.denyAll !== true || !Number.isSafeInteger(status.refusedSecurityCalls)) throw new Error('Native scope/latch proof failed');
  return { importedPointersVerified: true, denyAll: true, canonicalScopeBound, scopeChangeRefused,
    originalBindingLoaded: true, runExportRegistered: true, pdfExportRegistered: binding.registration.pdfExportRegistered,
    refusedSecurityCalls: status.refusedSecurityCalls, originalCommandsInvoked: false, originalPdfInvoked: false };
}
if (!isMainThread) {
  try { parentPort.postMessage({ proof: proof(workerData) }); } catch { parentPort.postMessage({ failed: true }); }
} else {
  (async () => {
    const directory = path.resolve(process.argv[2]), otherHome = path.resolve(process.argv[3]);
    const main = proof({ directory, otherHome });
    const worker = await new Promise((resolve, reject) => {
      const instance = new Worker(__filename, { workerData: { directory, otherHome } });
      instance.once('message', (value) => value.failed ? reject(new Error('Worker load-only proof failed')) : resolve(value.proof));
      instance.once('error', () => reject(new Error('Worker load-only proof failed')));
      instance.once('exit', (code) => { if (code) reject(new Error('Worker load-only proof failed')); });
    });
    process.stdout.write(`${JSON.stringify({ version: 1, host: 'unchanged-bundled-node', main, worker })}\n`);
  })().catch(() => { process.stderr.write('Load-only native proof refused\n'); process.exitCode = 1; });
}
