/** Disposable ad hoc signed actual SEA proof. No original command/PDF invocation. */
import fs from 'node:fs';
import path from 'node:path';
import { homedir } from 'node:os';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { adaptDaemonBinary } from './daemon-adapter.mjs';
import { adaptCliBinary } from './cli-adapter.mjs';
import { findMachOSeaSection, readSeaBlob } from '../aside/lib/sea.mjs';
import { createRequire } from 'node:module';
const { bindings: rolePins } = createRequire(import.meta.url)('./native-role-pins.cjs');
import { nativePackagingManifest } from './native-packaging-manifest.mjs';
const repository = fileURLToPath(new URL('../../', import.meta.url));
const hash = (b) => createHash('sha256').update(b).digest('hex');
const sha = (p) => hash(fs.readFileSync(p));
function command(executable, args, extra = {}) {
  const r = spawnSync(executable, args, { encoding: 'utf8', timeout: 20000, maxBuffer: 16384, ...extra });
  if (r.status !== 0) {
    const error = new Error(`SEA proof subprocess refused: ${path.basename(executable)} (exit ${r.status}, signal ${r.signal})`);
    error.proofDiagnostic = String(r.stderr ?? '').slice(0, 4096);
    throw error;
  }
  return r;
}
function regular(p) {
  const s = fs.lstatSync(p);
  if (!s.isFile() || s.isSymbolicLink() || (s.mode & 0o022)) throw new Error('Unsafe SEA proof input');
  return p;
}
const preserve = ['com.apple.security.cs.allow-jit', 'com.apple.security.cs.allow-unsigned-executable-memory', 'com.apple.security.cs.disable-library-validation'];
const remove = ['com.apple.application-identifier', 'com.apple.developer.team-identifier', 'keychain-access-groups'];
const dyld = 'com.apple.security.cs.allow-dyld-environment-variables';
function originalPolicy(original) {
  const xml = command('/usr/bin/codesign', ['-d', '--entitlements', '-', '--xml', original]).stdout;
  const values = JSON.parse(command('/usr/bin/plutil', ['-convert', 'json', '-o', '-', '-'], { input: xml }).stdout);
  if (JSON.stringify(Object.keys(values).sort()) !== JSON.stringify([...preserve, ...remove].sort()) || preserve.some((k) => values[k] !== true)) throw new Error('Original SEA entitlement policy drift');
  const display = command('/usr/bin/codesign', ['-dvvv', original]);
  if (!/flags=0x10000\(runtime\)/.test(display.stderr)) throw new Error('Unexpected original SEA signature flags');
  return { values: Object.fromEntries([...preserve.map((k) => [k, values[k]]), [dyld, true]]), originalEntitlementKeys: Object.keys(values).sort(), preserved: preserve, removed: remove, added: [dyld], options: ['runtime'] };
}
export function proveSuppliedSeaLoadOnly({ resourceRoot, nativeOutput, evidencePath, diagnosticBoundary }) {
  resourceRoot = fs.realpathSync(resourceRoot); nativeOutput = fs.realpathSync(nativeOutput);
  const receiptPath = regular(path.join(nativeOutput, 'native-build-receipt.json'));
  const receipt = JSON.parse(fs.readFileSync(receiptPath));
  if (receipt.version !== 1 || receipt.buildExitCode !== 0 || receipt.mapFixturePassed !== true) throw new Error('Successful current native build receipt required');
  for (const pin of nativePackagingManifest(nativeOutput).sources) if (!receipt.sources.some((e) => e.path === pin.path && e.sha256 === pin.sha256)) throw new Error('Current native source mismatch');
  function artifact(name) {
    const p = regular(path.join(nativeOutput, name));
    if (!receipt.outputs.some((e) => path.resolve(e.path) === p && e.sha256 === sha(p))) throw new Error('Native artifact mismatch');
    command('/usr/bin/codesign', ['--verify', '--strict', '--all-architectures', p]); return p;
  }
  let boundary = artifact('libaux-native-boundary.dylib');
  if (diagnosticBoundary) {
    const diagnostic = fs.realpathSync(diagnosticBoundary);
    if (diagnostic !== path.join(nativeOutput, 'libaux-sea-pointer-diagnostic.dylib')) throw new Error('Unexpected temporary diagnostic boundary');
    command('/usr/bin/codesign', ['--verify', '--strict', '--all-architectures', regular(diagnostic)]);
    boundary = diagnostic;
  }
  const guard = artifact('aux-native-guard.node'), launcher = artifact('aux-cli-launcher');
  const bindings = {};
  for (const [role, pin] of Object.entries(rolePins)) {
    const binding = regular(path.join(resourceRoot, pin.suffix.slice(1), 'provided-native.node'));
    if (sha(binding) !== pin.sha256) throw new Error('Supplied role binding pin drift');
    command('/usr/bin/codesign', ['--verify', '--strict', '--all-architectures', binding]);
    bindings[role] = binding;
  }
  const output = path.resolve(repository, 'out/provided-sea-proof'); fs.mkdirSync(output, { recursive: true });
  const temporary = fs.realpathSync(fs.mkdtempSync(path.join(output, 'disposable-'))); fs.chmodSync(temporary, 0o700);
  try {
    const root = path.join(temporary, 'Resources/aux'), library = path.join(root, 'native/libaux-native-boundary.dylib');
    fs.mkdirSync(path.dirname(library), { recursive: true, mode: 0o700 }); fs.copyFileSync(boundary, library);
    const hosts = [
      { name: 'cli', app: 'Aux CLI.app', original: path.join(homedir(), '.aside/cli/Aside CLI.app/Contents/MacOS/aside'), executable: 'aux-cli-sea', adapt: adaptCliBinary },
      { name: 'daemon', app: 'Aux Daemon.app', original: path.join(homedir(), 'Library/Application Support/Aside/AsideDaemon/mac-arm64/1.26.1016.1852/Aside Daemon.app/Contents/MacOS/aside-daemon'), executable: 'aux-daemon', adapt: adaptDaemonBinary },
    ];
    const results = [];
    for (const host of hosts) {
      const binding = bindings[host.name];
      const original = fs.readFileSync(regular(host.original)), adapted = host.adapt(original), policy = originalPolicy(host.original);
      const app = path.join(root, 'apps', host.name, host.app), executable = path.join(app, 'Contents/MacOS', host.executable), native = path.join(app, 'Contents/Resources/native');
      fs.mkdirSync(path.dirname(executable), { recursive: true, mode: 0o700 }); fs.mkdirSync(native, { recursive: true, mode: 0o700 });
      fs.writeFileSync(executable, adapted.binary, { flag: 'wx', mode: 0o755 });
      for (const [source, name] of [[guard, 'aux-native-guard.node'], [binding, 'provided-native.node'], ...['aux-native.cjs', 'native-role-pins.cjs', 'native-load-diagnostic.cjs', 'native-load-only-probe.cjs'].map((name) => [path.join(repository, 'vendor/provided', name), name])]) {
        fs.copyFileSync(regular(source), path.join(native, name));
        if (sha(source) !== sha(path.join(native, name))) throw new Error('Diagnostic staging byte drift');
      }
      const entitlementFile = path.join(temporary, `${host.name}-entitlements.plist`);
      const xml = command('/usr/bin/plutil', ['-convert', 'xml1', '-o', '-', '-'], { input: JSON.stringify(policy.values) }).stdout;
      fs.writeFileSync(entitlementFile, xml, { flag: 'wx', mode: 0o600 });
      command('/usr/bin/codesign', ['--force', '--sign', '-', '--timestamp=none', '--options', 'runtime', '--entitlements', entitlementFile, executable]);
      command('/usr/bin/codesign', ['--verify', '--strict', '--all-architectures', executable]);
      const signedDisplay = command('/usr/bin/codesign', ['-dvvv', executable]);
      if (!/\(.*runtime.*\)/.test(signedDisplay.stderr)) throw new Error('Signed SEA lost Runtime flag');
      const signedEntitlements = JSON.parse(command('/usr/bin/plutil', ['-convert', 'json', '-o', '-', '-'], { input: command('/usr/bin/codesign', ['-d', '--entitlements', '-', '--xml', executable]).stdout }).stdout);
      if (JSON.stringify(signedEntitlements) !== JSON.stringify(policy.values)) {
        for (const k of [...Object.keys(signedEntitlements), ...Object.keys(policy.values)]) if (signedEntitlements[k] !== policy.values[k]) throw new Error('Signed SEA entitlement drift');
      }
      const signedBytes = fs.readFileSync(executable), section = findMachOSeaSection(signedBytes);
      if (hash(readSeaBlob(signedBytes.subarray(section.offset, section.offset + section.size)).code) !== adapted.codeSha256) throw new Error('Signed SEA embedded code changed');
      let launch = executable;
      if (host.name === 'cli') {
        launch = path.join(path.dirname(executable), 'aux-cli'); fs.copyFileSync(launcher, launch);
        command('/usr/bin/codesign', ['--verify', '--strict', '--all-architectures', launch]);
      }
      const home = path.join(temporary, `${host.name}-home`), tmp = path.join(temporary, `${host.name}-tmp`);
      fs.mkdirSync(home, { mode: 0o700 }); fs.mkdirSync(tmp, { mode: 0o700 });
      const env = { HOME: home, AUX_HOME: home, TMPDIR: tmp, PATH: '/usr/bin:/bin', AUX_PROVIDED_NATIVE_LOAD_ONLY: '1' };
      if (diagnosticBoundary) env.AUX_DEBUG_SEA_POINTERS = '1';
      if (host.name === 'daemon') env.DYLD_INSERT_LIBRARIES = library;
      let execution, launcherPassed = host.name !== 'cli', launcherFailure;
      try { execution = command(launch, [], { cwd: temporary, env }); launcherPassed = true; }
      catch (error) {
        if (host.name !== 'cli') throw error;
        launcherFailure = { message: error.message, diagnostic: error.proofDiagnostic };
        try { execution = command(executable, [], { cwd: temporary, env: { ...env, DYLD_INSERT_LIBRARIES: library } }); }
        catch (directError) {
          try { command(executable, [], { cwd: temporary, env }); }
          catch (withoutDyld) { directError.proofDiagnostic += '\nWITHOUT_DYLD_DIAGNOSTIC:\n' + withoutDyld.proofDiagnostic; }
          throw directError;
        }
      }
      if (host.name === 'cli' && !launcherPassed) throw new Error('CLI native launcher proof failed; direct fallback is diagnostic only');
      const result = JSON.parse(execution.stdout);
      if (result.host !== 'supplied-sea' || result.productMainStarted !== false || result.dpRuntimeAccepted !== false) throw new Error('SEA diagnostic did not exit before product main');
      for (const p of [result.main, result.worker]) if (p?.bindingRole !== host.name || p?.importedPointersVerified !== true || p.denyAll !== true || p.canonicalScopeBound !== true || p.scopeChangeRefused !== true || p.originalCommandsInvoked !== false || p.originalPdfInvoked !== false || p.originalBindingLoaded !== true || p.runExportRegistered !== true || p.pdfExportRegistered !== true || !Number.isSafeInteger(p.refusedSecurityCalls)) throw new Error('SEA registration proof incomplete');
      results.push({ host: host.name, bindingSha256:sha(binding), originalBinarySha256: hash(original), adaptedCodeSha256: adapted.codeSha256, adaptedUnsignedBinarySha256: hash(adapted.binary), signedBinarySha256: sha(executable), launcherUsed: host.name === 'cli', launcherPassed, ...(launcherFailure ? { launcherFailure, directSeaFallbackUsed: true } : {}), signingPolicy: policy, result });
    }
    const evidence = { version: 1, nativeBuildReceiptSha256: sha(receiptPath), nativeBinariesRecompiled: false,
      diagnosticSources: ['native-diagnostic-hook.mjs', 'native-load-diagnostic.cjs', 'native-load-only-probe.cjs', 'daemon-adapter.mjs', 'cli-adapter.mjs', 'prove-sea-load-only.mjs'].map((name) => ({ path: `vendor/provided/${name}`, sha256: sha(path.join(repository, 'vendor/provided', name)) })), results,
      diagnosticBoundaryUsed: Boolean(diagnosticBoundary), boundarySha256: sha(boundary), guardSha256: sha(guard), bindingSha256ByRole: Object.fromEntries(Object.entries(bindings).map(([role,file])=>[role,sha(file)])), originalCommandsInvoked: false, dpRuntimeAccepted: false };
    fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`); return evidence;
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [resourceRoot, nativeOutput, evidencePath, diagnosticBoundary] = process.argv.slice(2);
  if (!resourceRoot || !nativeOutput || !evidencePath) throw new Error('Usage: prove-sea-load-only.mjs <resources> <native-output> <evidence-output>');
  try {
    const result = proveSuppliedSeaLoadOnly({ resourceRoot, nativeOutput, evidencePath, diagnosticBoundary });
    console.log(JSON.stringify({ hosts: result.results.map((e) => e.host), originalCommandsInvoked: false, dpRuntimeAccepted: false }));
  } catch (error) {
    console.error(error.message); if (error.proofDiagnostic) console.error(error.proofDiagnostic); process.exitCode = 1;
  }
}

// Pure staging helpers reused by the approval preparer; neither runs native code.
export { command as checkedSubprocess, originalPolicy as suppliedSeaSigningPolicy };
