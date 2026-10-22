/** Exact supplied daemon on unchanged Node; source-only local development output. */
import { createHash } from 'node:crypto';
import { adaptDaemonCode, DAEMON_BINARY_SHA256, DAEMON_CODE_SHA256 } from './daemon-adapter.mjs';
import { findMachOSeaSection, readSeaBlob } from '../aside/lib/sea.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const app = 'apps/daemon/Aux Daemon.app';
const directory = `${app}/Contents/Resources/node-development`;
export const daemonNodeDevelopmentPaths = Object.freeze({
  node: 'agent-runtime/node/bin/node', script: `${directory}/index.mjs`,
  execArgv: Object.freeze(['--disable-sigusr1', '--use-system-ca']),
});
const assetPins = Object.freeze({
  'quickjs-emscripten-module.wasm': Object.freeze({ bytes: 503134, sha256: '105c3bed22d457e43e3d1c3c1c6959fda62a8fe06f0fc8a985303c3a2be72232' }),
  'photon_rs_bg.wasm': Object.freeze({ bytes: 1881634, sha256: '10468181565c56004c867f3a4af96f89a0ef5a63a72f2b5fb12c1f1992a3615c' }),
});
const edit = (name, from, to, count = 1) => ({ name, from, to, count });
const edits = [
  edit('actual daemon app resources', 'EXEC_DIR=path.dirname(process.execPath??`/`)', 'EXEC_DIR=__auxDaemonMacOS'),
  edit('packaged resource mode, not executable identity', 'IS_COMPILED=!!process.execPath&&![`node`,`node.exe`].includes(path.basename(process.execPath).toLowerCase())&&!process.argv.includes(`--watch`)', 'IS_COMPILED=path.extname(__auxDaemonAppRoot)===`.app`&&!process.argv.includes(`--watch`)'),
  edit('same guarded original native binding', 'let ei=path.dirname(process.execPath);return[path.resolve(ei,`../Resources/native/aux-native.cjs`)]', 'return[path.join(__auxDaemonResources,`native/aux-native.cjs`)]'),
  ...['runtime-bootstrap.cjs', 'memory-bootstrap.cjs'].map(name => edit(`actual ${name} location`, `path.resolve(path.dirname(process.execPath),\`../Resources/native/${name}\`)`, `path.join(__auxDaemonResources,\`native/${name}\`)`)),
  edit('actual native diagnostic location', 'ti.resolve(ti.dirname(process.execPath),`../Resources/native/native-load-diagnostic.cjs`)', 'ti.join(__auxDaemonResources,`native/native-load-diagnostic.cjs`)'),
  edit('same packaged PTY module', 'catch(Cn){let ei=path.dirname(process.execPath),ti=[path.join(ei,`native/node-pty/package.json`)', 'catch(Cn){let ei=__auxDaemonMacOS,ti=[path.join(ei,`native/node-pty/package.json`)'),
  edit('same bundled importer app', 'BUNDLED_PASSWORD_IMPORTER_APP_PATH=resolve(dirname(process.execPath),`../Applications/Aux Password Importer.app`)', 'BUNDLED_PASSWORD_IMPORTER_APP_PATH=resolve(__auxDaemonMacOS,`../Applications/Aux Password Importer.app`)'),
  edit('actual app resource mode for importer', 'IS_DAEMON_APP_RUNTIME=process.platform===`darwin`&&!process.execPath.endsWith(`/node`)', 'IS_DAEMON_APP_RUNTIME=process.platform===`darwin`&&path.extname(__auxDaemonAppRoot)===`.app`'),
  edit('original Photon asset for worker', 'ti=isSea()?getAsset(`photon_rs_bg.wasm`):new Uint8Array(readFileSync(path.join(path.dirname(require$1.resolve(`@silvia-odwyer/photon-node`)),`photon_rs_bg.wasm`))).buffer', 'ti=__auxProvidedGetAsset(`photon_rs_bg.wasm`)'),
  edit('original Photon asset in process', 'if(isSea())return Buffer.from(getAsset(WASM_FILENAME));let ti=createRequire(import.meta.url).resolve(`@silvia-odwyer/photon-node`);return Cn(path.join(path.dirname(ti),WASM_FILENAME))', 'return Buffer.from(__auxProvidedGetAsset(WASM_FILENAME))'),
  edit('original QuickJS wasm', 'async function readWasm(){if(isSea())return getAsset(WASM_ASSET);let Cn=await readFile(createRequire(import.meta.url).resolve(`@jitl/quickjs-wasmfile-release-sync/wasm`));return Cn.buffer.slice(Cn.byteOffset,Cn.byteOffset+Cn.byteLength)}', 'async function readWasm(){return __auxProvidedGetAsset(WASM_ASSET)}'),
];

function assetModule() {
  return `// Original SEA asset bytes, exposed only to the supplied daemon's asset reads.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const directory = fs.realpathSync(fileURLToPath(new URL('.', import.meta.url)));
export const daemonResources = path.dirname(directory);
export const daemonMacOS = path.resolve(daemonResources, '../MacOS');
export const daemonAppRoot = path.resolve(daemonResources, '../..');
if (path.basename(directory) !== 'node-development' || path.basename(daemonAppRoot) !== 'Aux Daemon.app' ||
    path.basename(daemonResources) !== 'Resources' || path.basename(path.dirname(daemonResources)) !== 'Contents') {
  throw new Error('Unexpected supplied daemon development app layout');
}
const pins = Object.freeze(${JSON.stringify(assetPins)});
const cached = new Map();
export function getAsset(name, encoding) {
  if (typeof name !== 'string' || !Object.hasOwn(pins, name)) throw new Error('Unknown supplied SEA asset');
  let bytes = cached.get(name);
  if (!bytes) {
    const handle = fs.openSync(path.join(directory, 'assets', name), fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
    try {
      const stat = fs.fstatSync(handle), pin = pins[name];
      if (!stat.isFile() || (stat.mode & 0o022) || stat.size !== pin.bytes) throw new Error('Unsafe supplied SEA asset');
      bytes = fs.readFileSync(handle);
      if (createHash('sha256').update(bytes).digest('hex') !== pin.sha256) throw new Error('Supplied SEA asset hash mismatch');
      cached.set(name, bytes);
    } finally { fs.closeSync(handle); }
  }
  // node:sea getAsset returns a copy, or decoded text when encoding is supplied.
  // The genuine node:sea isSea remains false; no global/API impersonation.
  if (encoding !== undefined) return bytes.toString(encoding);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}
`;
}

export function buildDaemonNodeDevelopment(originalBinary, cloudOptions = {}, identityProfile = 'compatibility') {
  if (!Buffer.isBuffer(originalBinary) || hash(originalBinary) !== DAEMON_BINARY_SHA256) throw new Error('Supplied daemon binary hash mismatch');
  const section = findMachOSeaSection(originalBinary);
  const blob = readSeaBlob(originalBinary.subarray(section.offset, section.offset + section.size));
  if (hash(blob.code) !== DAEMON_CODE_SHA256 || blob.flags !== 25 || blob.assets.length !== 2) throw new Error('Unexpected supplied daemon SEA contract');
  for (const [name, bytes] of blob.assets) {
    const pin = assetPins[name];
    if (!pin || bytes.length !== pin.bytes || hash(bytes) !== pin.sha256) throw new Error('Supplied daemon asset mismatch');
  }
  if (new Set(blob.assets.map(([name]) => name)).size !== 2) throw new Error('Duplicate supplied daemon asset');
  const tail = Buffer.from('020000000000000011000000000000002d2d64697361626c652d736967757372310f000000000000002d2d7573652d73797374656d2d6361', 'hex');
  if (!blob.tail.equals(tail)) throw new Error('Unexpected supplied daemon Node execution arguments');
  const adapted = adaptDaemonCode(blob.code, cloudOptions, identityProfile);
  let code = adapted.code;
  if (code.includes('__auxDaemon') || code.includes('__auxProvidedGetAsset')) throw new Error('Development binding name collision');
  const applied = [];
  for (const change of edits) {
    const count = code.split(change.from).length - 1;
    if (count !== change.count) throw new Error(`${change.name}: expected ${change.count}, got ${count}`);
    code = code.split(change.from).join(change.to);
    applied.push({ name: change.name, count });
  }
  code = 'import { daemonResources as __auxDaemonResources, daemonMacOS as __auxDaemonMacOS, daemonAppRoot as __auxDaemonAppRoot, getAsset as __auxProvidedGetAsset } from "./assets.mjs";\n' + code;
  const files = [
    { path: daemonNodeDevelopmentPaths.script, bytes: Buffer.from(code), mode: 0o644 },
    { path: `${directory}/assets.mjs`, bytes: Buffer.from(assetModule()), mode: 0o644 },
    ...blob.assets.map(([name, bytes]) => ({ path: `${directory}/assets/${name}`, bytes: Buffer.from(bytes), mode: 0o644 })),
  ];
  return { files, manifest: {
    version: 1, implementation: 'supplied-daemon-js-on-unchanged-node', localDevelopmentOnly: true,
    ...(adapted.cloudPolicy ? { cloudPolicy: adapted.cloudPolicy, cloudAnchors: adapted.cloudAnchors } : {}),
    productionReady: false, runtimeTested: false, dpRuntimeAccepted: false,
    sourceBinarySha256: DAEMON_BINARY_SHA256, sourceCodeSha256: DAEMON_CODE_SHA256,
    baseAdaptedCodeSha256: adapted.sha256, baseEdits: adapted.applied, developmentEdits: applied,
    launch: daemonNodeDevelopmentPaths, seaFlags: blob.flags, originalSeaTailSha256: hash(blob.tail),
    files: files.map(({ path, bytes, mode }) => ({ path, bytes: bytes.length, mode, sha256: hash(bytes) })),
    nativeBinding: 'same apps/daemon/Aux Daemon.app/Contents/Resources/native/aux-native.cjs and daemon-role provided-native.node; never test adapter',
    limitations: ['No launcher/stage/assembly/native opt-in added', 'No native authority, signing or Keychain acceptance', 'SEA-only packaged-memory diagnostic still requires actual SEA; isSea is not spoofed', 'Original nullable-load/error semantics and all public wires/backend unchanged', 'Existing runtime bootstrap still requires canonical AUX_HOME/runtime destination', 'OS/helper/PTY actual behavior remains unverified'],
  } };
}
