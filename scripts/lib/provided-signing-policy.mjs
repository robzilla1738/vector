/** Read-only policy generation. Never signs, executes product code or grants access. */
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { lstat, open, readFile, realpath } from 'node:fs/promises';
import { isAbsolute, join, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

const prefix = 'Aux.app/Contents/Resources/aux';
const daemon = `${prefix}/apps/daemon/Aux Daemon.app`;
const cli = `${prefix}/apps/cli/Aux CLI.app`;
const importer = `${daemon}/Contents/Applications/Aux Password Importer.app`;
const provider = `${importer}/Contents/PlugIns/AsidePasswordImporterProvider.appex`;
const team = '8CPD4K4TBB';
const group = `${team}.at.studio.AsideBrowser.cryptography`;
const capabilities = ['com.apple.security.cs.allow-jit', 'com.apple.security.cs.allow-unsigned-executable-memory', 'com.apple.security.cs.disable-library-validation'];
const identities = ['com.apple.application-identifier', 'com.apple.developer.team-identifier', 'keychain-access-groups'];
const dyld = 'com.apple.security.cs.allow-dyld-environment-variables';
const canonical = value => JSON.stringify(Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))));
const identityValues = suffix => ({ 'com.apple.application-identifier': `${team}.at.studio.AsideBrowser.${suffix}`, 'com.apple.developer.team-identifier': team, 'keychain-access-groups': [group] });
const booleans = keys => Object.fromEntries(keys.map(key => [key, true]));
const definitions = [
  { path: 'Aux.app', kind: 'bundle', role: 'browser' },
  { path: cli, kind: 'bundle', executable: 'Contents/MacOS/aux-cli', role: 'new' },
  { path: daemon, kind: 'bundle', executable: 'Contents/MacOS/aux-daemon', role: 'sea', suffix: 'daemon' },
  { path: `${cli}/Contents/MacOS/aux-cli-sea`, kind: 'macho', role: 'sea', suffix: 'cli' },
  { path: importer, kind: 'bundle', executable: 'Contents/MacOS/aux-password-importer', role: 'importer', suffix: 'PasswordImporter' },
  { path: provider, kind: 'bundle', executable: 'Contents/MacOS/aux-password-importer-provider', role: 'provider', suffix: 'PasswordImporter.CredentialProvider' },
  { path: `${prefix}/apps/computer-use/Aux Computer Use.app`, kind: 'bundle', executable: 'Contents/MacOS/aux-computer-use', role: 'computer' },
  ...['aux-native-carrier', 'libaux-native-boundary.dylib'].map(name => ({ path: `${prefix}/native/${name}`, kind: 'macho', role: 'new' })),
  ...[daemon, cli].map(app => ({ path: `${app}/Contents/Resources/native/aux-native-guard.node`, kind: 'macho', role: 'new' })),
];
export const providedSigningTargets = definitions.map(({ path, kind, executable }) => ({ path, kind, ...(executable ? { executable } : {}) }));

function command(executable, args) {
  const result = spawnSync(executable, args, { encoding: 'utf8', timeout: 20000, maxBuffer: 1024 * 1024 });
  if (result.error || result.signal) throw new Error(`Static signing inspection failed: ${executable}`);
  return result;
}
function plist(bytes) {
  const result = spawnSync('/usr/bin/plutil', ['-convert', 'json', '-o', '-', '--', '-'], { input: bytes, encoding: 'utf8', timeout: 20000, maxBuffer: 1024 * 1024 });
  if (result.status !== 0) throw new Error('Invalid static signing plist');
  return JSON.parse(result.stdout);
}
export function inspectSigningCode(path) {
  const display = command('/usr/bin/codesign', ['-dvvv', path]);
  if (display.status !== 0) {
    if (display.status === 1 && display.stderr.includes('code object is not signed at all')) return { flags: [], entitlements: {}, unsigned: true };
    throw new Error('Cannot statically inspect copied signature');
  }
  const match = display.stderr.match(/flags=0x[0-9a-f]+\(([^)]*)\)/i);
  if (!match) throw new Error('Unrecognized copied signature flags');
  const flags = match[1].split(',').filter(flag => flag && flag !== 'none').sort();
  if (flags.some(flag => !['adhoc', 'linker-signed', 'runtime'].includes(flag))) throw new Error('Unreviewed copied signature flags');
  const embedded = command('/usr/bin/codesign', ['-d', '--entitlements', '-', '--xml', path]);
  if (embedded.status !== 0) throw new Error('Cannot statically inspect copied entitlements');
  return { flags, entitlements: embedded.stdout.trim() ? plist(embedded.stdout) : {}, unsigned: false };
}
function partition(values, preserveKeys, removeKeys) {
  if (!Array.isArray(preserveKeys) || !Array.isArray(removeKeys) || new Set([...preserveKeys, ...removeKeys]).size !== preserveKeys.length + removeKeys.length || canonical(booleans([...preserveKeys, ...removeKeys])) !== canonical(booleans(Object.keys(values)))) throw new Error('Explicit exhaustive distinct entitlement decisions required');
  for (const key of preserveKeys) if (!key.startsWith('com.apple.security.') || key === 'com.apple.security.application-groups' || typeof values[key] !== 'boolean') throw new Error('Unreviewed entitlement preservation');
  return { preserveKeys, removeKeys };
}
/** Pure role/metadata policy; tests need no real package, compiler or signing. */
export function policyForSigningTarget(targetPath, observation, browserReview) {
  const def = definitions.find(target => target.path === targetPath);
  if (!def) throw new Error('Unknown signing target');
  const { flags, entitlements: values, sha256 } = observation;
  if (!/^[a-f0-9]{64}$/.test(sha256) || !Array.isArray(flags) || !values || typeof values !== 'object' || Array.isArray(values)) throw new Error('Invalid static code observation');
  let expected, preserve = [], remove = [], add = false;
  if (def.role === 'browser') {
    if (browserReview?.version !== 1 || browserReview.sha256 !== sha256 || canonical(browserReview.observedEntitlements ?? {}) !== canonical(values) || JSON.stringify(browserReview.signatureFlags) !== JSON.stringify(flags)) throw new Error('Actual copied browser SHA, flags and entitlements need explicit review');
    if (flags.some(flag => !['adhoc', 'linker-signed', 'runtime'].includes(flag))) throw new Error('Unreviewed browser signature flags');
    if (browserReview.entitlements?.addDyldEnvironmentForBoundary) throw new Error('Browser cannot add the SEA-only boundary exception');
    return partition(values, browserReview.entitlements?.preserveKeys, browserReview.entitlements?.removeKeys);
  }
  if (def.role === 'new') {
    expected = {};
    if (flags.some(flag => !['adhoc', 'linker-signed'].includes(flag))) throw new Error('New boundary/wrapper code has unreviewed runtime flags');
  } else {
    if (JSON.stringify(flags) !== JSON.stringify(['runtime'])) throw new Error('Supplied host lost original hardened runtime flags');
    if (def.role === 'sea') { preserve = capabilities; remove = identities; add = true; }
    if (def.role === 'importer' || def.role === 'provider') {
      preserve = ['com.apple.security.app-sandbox', ...(def.role === 'importer' ? ['com.apple.security.network.client'] : [])];
      remove = [...identities, 'com.apple.developer.authentication-services.autofill-credential-provider'];
    }
    if (def.role === 'computer') preserve = ['com.apple.security.automation.apple-events', 'com.apple.security.personal-information.addressbook'];
    expected = { ...booleans(preserve), ...(def.suffix ? identityValues(def.suffix) : {}), ...(['importer', 'provider'].includes(def.role) ? { 'com.apple.developer.authentication-services.autofill-credential-provider': true } : {}) };
  }
  if (canonical(values) !== canonical(expected)) throw new Error(`Unreviewed supplied entitlement values: ${def.role}`);
  return { ...partition(values, preserve, remove), ...(add ? { addDyldEnvironmentForBoundary: true } : {}) };
}
async function regular(path) {
  const stat = await lstat(path);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1 || stat.mode & 0o022 || await realpath(path) !== path) throw new Error('Signing policy requires private regular copied inputs');
}
async function digest(path) { const hash = createHash('sha256'); for await (const bytes of createReadStream(path)) hash.update(bytes); return hash.digest('hex'); }
export async function generateProvidedSigningPolicy({ root, browserReview }) {
  if (!isAbsolute(root) || await realpath(root) !== root || !(await lstat(root)).isDirectory()) throw new Error('Canonical copied package required');
  await regular(join(root, 'package.json'));
  const report = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  if (report.version !== 1 || report.implementation !== 'supplied' || report.signed !== false || report.app !== 'Aux.app' || !Array.isArray(report.sourceRoots) || !report.sourceRoots.length) throw new Error('Unsigned copied supplied package report required');
  for (const source of report.sourceRoots) {
    if (typeof source !== 'string' || !isAbsolute(source)) throw new Error('Explicit absolute source roots required');
    const original = await realpath(source), rel = relative(original, root), reverse = relative(root, original);
    if (!rel || !reverse || (!rel.startsWith(`..${sep}`) && rel !== '..' && !isAbsolute(rel)) || (!reverse.startsWith(`..${sep}`) && reverse !== '..' && !isAbsolute(reverse))) throw new Error('Copied package and sources overlap');
  }
  const targets = [], observations = [];
  for (const original of definitions) {
    const def = original.role === 'browser' ? { ...original, executable: browserReview?.executable } : original;
    if (def.role === 'browser' && (typeof def.executable !== 'string' || !/^Contents\/MacOS\/[A-Za-z0-9._ -]+$/.test(def.executable) || def.executable.endsWith('/.') || def.executable.endsWith('/..'))) throw new Error('Explicit actual browser bundle executable required');
    const code = join(root, def.path, ...(def.executable ? [def.executable] : []));
    await regular(code);
    const handle = await open(code, 'r');
    try {
      const magic = Buffer.alloc(4); await handle.read(magic, 0, 4, 0);
      if (!['cffaedfe', 'cefaedfe', 'feedfacf', 'feedface', 'cafebabe', 'bebafeca', 'cafebabf', 'bfbafeca'].includes(magic.toString('hex'))) throw new Error('Signing target must be copied Mach-O code');
    } finally { await handle.close(); }
    if (def.kind === 'bundle') {
      const info = join(root, def.path, 'Contents/Info.plist'); await regular(info);
      if (`Contents/MacOS/${plist(await readFile(info)).CFBundleExecutable}` !== def.executable) throw new Error('Copied bundle executable does not match fixed signing layout');
    }
    const observation = { ...inspectSigningCode(code), sha256: await digest(code) };
    const entitlements = policyForSigningTarget(def.path, observation, browserReview);
    targets.push({ path: def.path, kind: def.kind, ...(def.executable ? { executable: def.executable } : {}), sha256: observation.sha256, entitlements });
    observations.push({ path: def.path, ...observation, permittedAdditions: entitlements.addDyldEnvironmentForBoundary ? { [dyld]: true } : {} });
  }
  return { version: 1, implementation: 'supplied', operation: 'explicit-policy-only-no-signing', packageRoot: root, packageReportSha256: await digest(join(root, 'package.json')), targets, observations, preserved: 'All untargeted original addon/framework/runtime/memory bytes; no recursive signing', productionReady: false };
}
