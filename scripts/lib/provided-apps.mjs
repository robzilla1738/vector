/** Static app staging. Incomplete native integration is explicit and never silently substituted. */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstat, readdir, readFile, mkdir, mkdtemp, writeFile, rename, rm } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { adaptDaemonBinary } from '../../vendor/provided/daemon-adapter.mjs';
import { adaptCliBinary } from '../../vendor/provided/cli-adapter.mjs';
import { CLI_COMMAND } from '../../vendor/aside/patches/brand.mjs';
import { runtimeSourcePinsBytes } from '../../vendor/provided/runtime-pins.mjs';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
export const providedAppRoots = {
  daemon: join(homedir(), 'Library/Application Support/Aside/AsideDaemon/mac-arm64/1.26.1016.1852/Aside Daemon.app'),
  cli: join(homedir(), '.aside/cli/Aside CLI.app'),
};
export const providedIntegrationFiles = Object.freeze({
  daemon: ['aux-native.cjs', 'memory-bootstrap.cjs', 'memory-seed.cjs', 'memory-pins.json', 'runtime-bootstrap.cjs', 'runtime-seed.cjs', 'runtime-source-pins.json', 'native-load-diagnostic.cjs', 'native-load-only-probe.cjs'],
  cli: ['aux-native.cjs', 'native-load-diagnostic.cjs', 'native-load-only-probe.cjs'],
});
export async function providedIntegrationInput(name) {
  if (name === 'runtime-source-pins.json') {
    const generatedFrom = 'docs/source/provided-runtime-inputs.json';
    const inventory = JSON.parse(await readFile(join(repository, generatedFrom), 'utf8'));
    return { bytes: runtimeSourcePinsBytes(inventory.components.runtime), repositorySource: 'vendor/provided/runtime-pins.mjs', generatedFrom };
  }
  const repositorySource = `vendor/provided/${name}`;
  return { bytes: await readFile(join(repository, repositorySource)), repositorySource };
}
const targets = {
  daemon: { app: 'Aux Daemon.app', sourceExecutable: 'aside-daemon', executable: 'aux-daemon', adapt: adaptDaemonBinary },
  cli: { app: 'Aux CLI.app', sourceExecutable: 'aside', executable: 'aux-cli', adapt: adaptCliBinary },
};
async function inventoryTree(root, directory = '') {
  const result = [];
  if ((await lstat(join(root, directory))).isSymbolicLink()) throw new Error('Static application symlink rejected');
  for (const entry of (await readdir(join(root, directory), { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    const path = join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Static application symlink rejected: ${path}`);
    if (entry.isDirectory()) result.push(...await inventoryTree(root, path));
    else if (entry.isFile()) {
      const file = join(root, path), bytes = await readFile(file);
      result.push({ path, bytes: bytes.length, sha256: hash(bytes), mode: (await lstat(file)).mode & 0o777 });
    } else throw new Error(`Nonregular static application input: ${path}`);
  }
  return result;
}
export async function inventoryProvidedApps(sourceRoots = providedAppRoots) {
  const components = {};
  for (const component of Object.keys(targets)) components[component] = { files: await inventoryTree(resolve(sourceRoots[component])) };
  return { version: 1, components };
}

function outputPath(path, target) {
  return path
    .replace(`Contents/MacOS/${target.sourceExecutable}`, `Contents/MacOS/${target.executable}`)
    .replace('Aside Password Importer.app/', 'Aux Password Importer.app/')
    .replace('/MacOS/aside-password-importer', '/MacOS/aux-password-importer')
    .replace('/native/aside-native.node', '/native/provided-native.node');
}
function brandPlist(bytes, path, target) {
  const data = JSON.parse(execFileSync('/usr/bin/plutil', ['-convert', 'json', '-o', '-', '--', '-'], { input: bytes, encoding: 'utf8' }));
  for (const key of ['CFBundleName', 'CFBundleDisplayName', 'NSAccessibilityUsageDescription', 'NSAppleEventsUsageDescription', 'NSContactsUsageDescription', 'NSInputMonitoringUsageDescription'])
    if (typeof data[key] === 'string') data[key] = data[key].replaceAll('Aside', 'Aux');
  if (typeof data.CFBundleIdentifier === 'string') data.CFBundleIdentifier = data.CFBundleIdentifier.replace('at.studio.AsideBrowser', 'dev.aux.browser');
  if (data.CFBundleExecutable === target.sourceExecutable) data.CFBundleExecutable = target.executable;
  if (data.CFBundleExecutable === 'aside-password-importer') data.CFBundleExecutable = 'aux-password-importer';
  if (data.CFBundleExecutable === 'aside-password-importer-provider') data.CFBundleExecutable = 'aux-password-importer-provider';
  // Preserve compiled module/principal-class names, including the credential-provider extension.
  if (!path.includes('.appex/')) data.CFBundleIconFile = 'Aux.icns';
  return Buffer.from(JSON.stringify(data));
}

export async function stageProvidedApps({ sourceRoots = providedAppRoots, outputRoot }) {
  const pinned = JSON.parse(await readFile(join(repository, 'docs/source/provided-app-inputs.json'), 'utf8'));
  const actual = await inventoryProvidedApps(sourceRoots);
  if (JSON.stringify(actual) !== JSON.stringify(pinned)) throw new Error('Supplied app resources differ from pinned inputs');
  const destination = resolve(outputRoot);
  for (const root of Object.values(sourceRoots).map(resolvePath => resolve(resolvePath))) {
    if (!relative(root, destination).startsWith(`..${sep}`) || !relative(destination, root).startsWith(`..${sep}`))
      throw new Error('Static app input/output roots must not overlap');
  }
  try { await lstat(destination); throw new Error('Provided app output already exists'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  await mkdir(dirname(destination), { recursive: true });
  const temporary = await mkdtemp(join(dirname(destination), '.provided-apps-'));
  const report = { version: 1, productionReady: false, blockers: ['Faithful isolated native binding/carrier not yet installed', 'Local ad hoc signing and native/runtime acceptance required'], components: {} };
  try {
    for (const [component, target] of Object.entries(targets)) {
      const app = join(temporary, component, target.app), files = [], removed = [];
      let executable;
      for (const file of actual.components[component].files) {
        const source = await readFile(join(sourceRoots[component], file.path));
        if (hash(source) !== file.sha256) throw new Error('Static app input changed during staging');
        // Original signatures/profiles cannot authenticate modified local Aux artifacts.
        if (/(?:^|\/)_CodeSignature\/|(?:^|\/)CodeResources$|(?:^|\/)embedded\.provisionprofile$/.test(file.path)) {
          removed.push({ path: file.path, sha256: file.sha256, reason: 'Local rebranding requires fresh ad hoc signature' });
          continue;
        }
        const path = outputPath(file.path, target), kinds = [];
        let output = source;
        if (file.path === `Contents/MacOS/${target.sourceExecutable}`) {
          executable = target.adapt(source);
          output = executable.binary;
          kinds.push('identity', 'integration');
        } else if (file.path.endsWith('/Info.plist')) {
          output = brandPlist(source, path, target);
          kinds.push('branding', 'identity');
        } else if (file.path.endsWith('/Resources/AppIcon.icns')) {
          output = await readFile(join(repository, 'assets/brand/Aux.icns'));
          kinds.push('branding');
        } else if (file.path.startsWith('Contents/Resources/static/skills/') && file.path.endsWith('.md')) {
          output = Buffer.from(source.toString('utf8').replaceAll('Aside', 'Aux').replace(CLI_COMMAND, 'aux '));
          if (!source.equals(output)) kinds.push('branding');
        }
        if (path !== file.path) kinds.push('identity');
        const outputFile = join(app, path);
        await mkdir(dirname(outputFile), { recursive: true });
        await writeFile(outputFile, output, { mode: file.mode });
        if (path.endsWith('/Info.plist')) {
          execFileSync('/usr/bin/plutil', ['-convert', 'xml1', outputFile]);
          output = await readFile(outputFile);
        }
        files.push({ path, sourcePath: file.path, sourceSha256: file.sha256, outputSha256: hash(output), changeKinds: [...new Set(kinds)] });
      }
      const icons = ['Contents/Resources/Aux.icns'];
      if (component === 'daemon') icons.push('Contents/Applications/Aux Password Importer.app/Contents/Resources/Aux.icns');
      for (const path of icons) {
        const bytes = await readFile(join(repository, 'assets/brand/Aux.icns'));
        await mkdir(dirname(join(app, path)), { recursive: true });
        await writeFile(join(app, path), bytes);
        files.push({ path, outputSha256: hash(bytes), changeKinds: ['branding'], added: true });
      }
      for (const name of providedIntegrationFiles[component]) {
        const path = `Contents/Resources/native/${name}`;
        const { bytes, repositorySource, generatedFrom } = await providedIntegrationInput(name);
        await mkdir(dirname(join(app, path)), { recursive: true });
        await writeFile(join(app, path), bytes, { mode: 0o644 });
        files.push({ path, repositorySource, ...(generatedFrom ? { generatedFrom } : {}), outputSha256: hash(bytes), changeKinds: ['integration'], added: true });
      }
      for (const file of files.filter((entry) => entry.path.endsWith('/Info.plist'))) {
        const plist = JSON.parse(execFileSync('/usr/bin/plutil', ['-convert', 'json', '-o', '-', join(app, file.path)], { encoding: 'utf8' }));
        if (typeof plist.CFBundleExecutable !== 'string' || !/^[A-Za-z0-9_.-]+$/.test(plist.CFBundleExecutable)) throw new Error('Invalid staged bundle executable declaration');
        const binary = await lstat(join(app, dirname(file.path), 'MacOS', plist.CFBundleExecutable));
        if (!binary.isFile() || binary.isSymbolicLink() || !(binary.mode & 0o111)) throw new Error('Staged bundle executable declaration does not resolve to executable code');
      }
      report.components[component] = { app: `${component}/${target.app}`, files, removed,
        executable: { codeSha256: executable.codeSha256, applied: executable.applied, assets: executable.assets } };
    }
    await writeFile(join(temporary, 'manifest.json'), `${JSON.stringify(report, null, 2)}\n`);
    await rename(temporary, destination);
    return report;
  } catch (error) { await rm(temporary, { recursive: true, force: true }); throw error; }
}
