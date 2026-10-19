/** Assemble a copied native app and the supplied resources. Never install or launch. */
import { createHash } from 'node:crypto';
import { createReadStream, constants } from 'node:fs';
import { chmod, copyFile, cp, lstat, mkdir, mkdtemp, readFile, readdir, readlink, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { assembleProvidedResources } from './provided-assembly.mjs';
import { nativePackagingManifest } from '../../vendor/provided/native-packaging-manifest.mjs';
import { xmlPlist } from '../../vendor/provided/prepare-development-dp.mjs';

const repository = fileURLToPath(new URL('../../', import.meta.url));
const execute = promisify(execFile);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const digest = async path => {
  const value = createHash('sha256');
  for await (const bytes of createReadStream(path)) value.update(bytes);
  return value.digest('hex');
};
const inside = (root, path) => path === root || path.startsWith(root + sep);
const safe = path => typeof path === 'string' && path.length && !isAbsolute(path) && !path.split('/').some(part => ['', '.', '..'].includes(part));
async function absent(path) {
  try { await lstat(path); throw new Error(`Package output already exists: ${path}`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
async function root(path) {
  if (!isAbsolute(path) || await realpath(path) !== path || !(await lstat(path)).isDirectory()) throw new Error('Canonical real package input directory required');
  return path;
}
async function pinnedFile(path, expected) {
  const stat = await lstat(path);
  if (!stat.isFile() || stat.isSymbolicLink() || !/^[a-f0-9]{64}$/.test(expected) || await digest(path) !== expected) throw new Error(`Package input hash/type mismatch: ${path}`);
}
/** Full leaf coverage is required, including native resources and dependency links. */
export async function verifyPackageInventory(directory, entries) {
  await root(directory);
  if (!Array.isArray(entries) || !entries.length) throw new Error('A complete package inventory is required');
  const byPath = new Map();
  for (const entry of entries) {
    if (!safe(entry.path) || byPath.has(entry.path)) throw new Error('Invalid or duplicate package inventory path');
    byPath.set(entry.path, entry);
  }
  const observed = [];
  async function walk(prefix = '') {
    for (const name of await readdir(join(directory, prefix))) {
      const path = prefix ? `${prefix}/${name}` : name, absolute = join(directory, path), stat = await lstat(absolute);
      if (stat.isDirectory() && !stat.isSymbolicLink()) { await walk(path); continue; }
      const entry = byPath.get(path);
      if (!entry || (stat.mode & 0o777) !== entry.mode) throw new Error(`Unreported package leaf or changed mode: ${path}`);
      if (entry.type === 'symlink') {
        const link = await readlink(absolute);
        if (!stat.isSymbolicLink() || link !== entry.linkTarget || isAbsolute(link) || !inside(directory, await realpath(absolute))) throw new Error('Package dependency link changed or escapes its root');
      } else if (entry.type === 'file') await pinnedFile(absolute, entry.sha256);
      else throw new Error('Unsupported package inventory object');
      observed.push(path);
    }
  }
  await walk();
  if (observed.length !== entries.length) throw new Error('Package inventory contains missing leaves');
}

export async function packageProvidedApp({ stageRoot, nativeReceiptPath, compositionRoot, boundaryReceiptPath, outputRoot, developmentDpLayout = false }) {
  if (typeof developmentDpLayout !== 'boolean') throw new Error('Explicit boolean development layout required');
  stageRoot = await root(resolve(stageRoot));
  compositionRoot = await root(resolve(compositionRoot));
  outputRoot = resolve(outputRoot);
  await mkdir(dirname(outputRoot), { recursive: true });
  if (await realpath(dirname(outputRoot)) !== dirname(outputRoot)) throw new Error('Package output parent must be canonical');
  await absent(outputRoot);
  const nativeRaw = await readFile(nativeReceiptPath), native = JSON.parse(nativeRaw);
  const compositionRaw = await readFile(join(compositionRoot, 'manifest.json')), composition = JSON.parse(compositionRaw);
  const boundaryRaw = await readFile(boundaryReceiptPath), boundary = JSON.parse(boundaryRaw);
  if (native.version !== 1 || native.implementation !== 'supplied' || native.buildExitCode !== 0 || native.generatedKeyProbePassed !== true || native.compositionSha256 !== hash(compositionRaw) || native.app !== 'Aux.app') throw new Error('An actual matching supplied native build receipt is required');
  if (boundary.version !== 1 || boundary.implementation !== 'supplied-boundary' || boundary.buildExitCode !== 0 || boundary.mapFixturePassed !== true) throw new Error('An actual native boundary build and pure-map fixture receipt is required');
  const buildRoot = await root(native.buildRoot), nativeRoot = await root(native.nativeRoot), seed = await root(join(buildRoot, 'Aux.app'));
  if (nativeRoot !== composition.sourceRoot || !inside(nativeRoot, buildRoot)) throw new Error('Native build and composition roots disagree');
  await pinnedFile(join(buildRoot, 'args.gn'), native.argsSha256);
  for (const item of composition.files) {
    if (!safe(item.path)) throw new Error('Unsafe composition input');
    await pinnedFile(join(nativeRoot, item.path), item.outputSha256);
  }
  for (const item of composition.binaryAssets) {
    if (!safe(item.target)) throw new Error('Unsafe artwork input');
    await pinnedFile(join(nativeRoot, item.target), item.replacementSha256);
  }
  for (const item of native.files) {
    if (!safe(item.path)) throw new Error('Unsafe native receipt artifact');
    await pinnedFile(join(buildRoot, item.path), item.sha256);
  }
  await verifyPackageInventory(seed, native.appFiles);
  const requiredSources = nativePackagingManifest().sources;
  for (const expected of requiredSources) {
    if (!boundary.sources.some(item => item.path === expected.path && item.sha256 === expected.sha256)) throw new Error(`Boundary was not built from current source: ${expected.path}`);
  }
  for (const source of boundary.sources) {
    if (!safe(source.path)) throw new Error('Unsafe boundary source');
    await pinnedFile(join(repository, source.path), source.sha256);
  }
  const artifacts = new Map();
  for (const item of boundary.outputs) {
    if (!isAbsolute(item.path)) throw new Error('Boundary artifact must be absolute');
    await pinnedFile(item.path, item.sha256);
    const name = item.path.split('/').at(-1);
    if (artifacts.has(name)) throw new Error('Duplicate boundary build output');
    artifacts.set(name, item);
  }
  for (const name of ['aux-native-carrier', 'libaux-native-boundary.dylib', 'aux-native-guard.node', 'aux-cli-launcher']) if (!artifacts.has(name)) throw new Error(`Missing boundary build artifact: ${name}`);
  const sources = [stageRoot, seed, compositionRoot, ...[...artifacts.values()].map(item => dirname(item.path))];
  if (sources.some(source => inside(source, outputRoot) || inside(outputRoot, source))) throw new Error('Package sources and output overlap');
  const audit = await execute(process.execPath, [join(repository, 'scripts/check-provided.mjs'), stageRoot], { cwd: repository, maxBuffer: 1024 * 1024 });
  const temporary = await mkdtemp(join(dirname(outputRoot), '.provided-package-'));
  try {
    const app = join(temporary, 'Aux.app');
    await cp(seed, app, { recursive: true, verbatimSymlinks: true, mode: constants.COPYFILE_FICLONE });
    await verifyPackageInventory(app, native.appFiles);
    const resources = join(app, 'Contents/Resources/aux');
    await absent(resources); // Never merge retired independent runtime components.
    const assembled = await assembleProvidedResources({ stageRoot, outputRoot: resources });
    const additions = [];
    async function add(name, destination) {
      const artifact = artifacts.get(name), target = join(resources, destination);
      await absent(target);
      await mkdir(dirname(target), { recursive: true });
      await copyFile(artifact.path, target, constants.COPYFILE_FICLONE);
      await chmod(target, 0o755);
      await pinnedFile(target, artifact.sha256);
      additions.push({ path: destination, sha256: artifact.sha256, mode: 0o755 });
    }
    await add('aux-native-carrier', developmentDpLayout ? 'native/Aux Native Carrier.app/Contents/MacOS/aux-native-carrier' : 'native/aux-native-carrier');
    await add('libaux-native-boundary.dylib', 'native/libaux-native-boundary.dylib');
    for (const role of ['daemon', 'cli']) await add('aux-native-guard.node', `apps/${role}/Aux ${role === 'daemon' ? 'Daemon' : 'CLI'}.app/Contents/Resources/native/aux-native-guard.node`);
    const cliExecutable = 'apps/cli/Aux CLI.app/Contents/MacOS/aux-cli';
    await absent(join(resources, `${cliExecutable}-sea`));
    await rename(join(resources, cliExecutable), join(resources, `${cliExecutable}-sea`));
    await add('aux-cli-launcher', cliExecutable);
    const layoutChanges = [];
    if (developmentDpLayout) {
      const cliInfo = join(resources, 'apps/cli/Aux CLI.app/Contents/Info.plist');
      const inspected = await execute('/usr/bin/plutil', ['-convert', 'json', '-o', '-', '--', cliInfo]);
      const info = JSON.parse(inspected.stdout);
      if (info.CFBundleIdentifier !== 'dev.aux.browser.cli' || info.CFBundleExecutable !== 'aux-cli') throw new Error('Unexpected supplied CLI bundle identity/main');
      const beforeSha256 = await digest(cliInfo);
      await writeFile(cliInfo, xmlPlist({ ...info, CFBundleExecutable: 'aux-cli-sea' }));
      layoutChanges.push({ path: 'apps/cli/Aux CLI.app/Contents/Info.plist', beforeSha256, sha256: await digest(cliInfo) });
      const carrierInfo = 'native/Aux Native Carrier.app/Contents/Info.plist';
      await writeFile(join(resources, carrierInfo), xmlPlist({ CFBundleIdentifier: 'dev.aux.browser.native-carrier', CFBundleExecutable: 'aux-native-carrier', CFBundleName: 'Aux Native Carrier', CFBundlePackageType: 'APPL', CFBundleVersion: '1', CFBundleShortVersionString: '1.0', LSUIElement: true }), { flag: 'wx' });
      layoutChanges.push({ path: carrierInfo, sha256: await digest(join(resources, carrierInfo)) });
      const bundleFile = join(resources, 'bundle.json');
      const bundle = JSON.parse(await readFile(bundleFile, 'utf8'));
      await writeFile(bundleFile, JSON.stringify({ ...bundle, nativeCarrierLayout: 'profile-bundle' }, null, 2) + '\n');
      layoutChanges.push({ path: 'bundle.json', sha256: await digest(bundleFile) });
    }
    // Recheck input provenance after copying. A concurrent build/source change
    // must not publish a mixed candidate as the recorded native artifact.
    await verifyPackageInventory(seed, native.appFiles);
    for (const item of artifacts.values()) await pinnedFile(item.path, item.sha256);
    const report = {
      version: 1, implementation: 'supplied', productionReady: false, signed: false,
      app: 'Aux.app', finalApp: assembled.finalApp,
      nativeReceiptSha256: hash(nativeRaw), compositionSha256: hash(compositionRaw), boundaryReceiptSha256: hash(boundaryRaw),
      preservationAudit: audit.stdout.trim(),
      nativeFiles: native.appFiles.length, suppliedResources: assembled.files.length, additions,
      sourceRoots: sources,
      cliSea: `${cliExecutable}-sea`,
      developmentDpLayout, layoutChanges,
      remaining: [developmentDpLayout ? 'Authenticated profiles and separate inside-out development signing plan; default ad hoc signer is incompatible' : 'Explicit inside-out ad hoc signing', 'Guarded original-native loading and common Aux authority', 'Disposable packaged UI/runtime and functional acceptance'],
    };
    await writeFile(join(temporary, 'package.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
    await absent(outputRoot);
    await rename(temporary, outputRoot);
    return report;
  } catch (error) {
    await rm(temporary, { recursive: true, force: true });
    throw error;
  }
}
