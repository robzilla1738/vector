#!/usr/bin/env node
// Assemble only independent Aux builds and pinned upstream runtimes.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { constants, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const options = {};
for (let i = 0; i < args.length; i++) {
  const flag = args[i];
  if (flag === '--development') { options.development = true; continue; }
  if (flag === '--install-cli') { options.installCli = true; continue; }
  if (!['--app', '--chromium', '--bin'].includes(flag) || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error('Usage: package-aux.mjs [--development] [--app PATH] [--chromium Aux.app] [--install-cli] [--bin PATH]');
  options[flag.slice(2)] = resolve(args[++i]);
}
const native = options.chromium ?? join(homedir(), `Documents/Code/aux-chromium-security-155/chromium/src/out/${options.development ? 'AuxAside' : 'AuxFast'}/Aux.app`);
const destination = options.app ?? (options.development ? join(root, 'out/local/Aux.app') : join(homedir(), 'Applications/Aux.app'));
if (resolve(native) === destination) throw new Error('Package destination must differ from the native build.');
const flags = readFileSync(join(dirname(native), 'args.gn'), 'utf8');
if (!/^enable_aux_browser\s*=\s*true\s*$/m.test(flags)) throw new Error('Native build must enable the independent Aux browser.');
if (/^enable_aux_shell\s*=\s*true\s*$/m.test(flags)) throw new Error('Retired shell must be disabled.');
if (!options.development && !/^is_component_build\s*=\s*false\s*$/m.test(flags)) throw new Error('Production packaging requires is_component_build=false.');
for (const path of [join(native, 'Contents/MacOS/Aux'), 'out/sea/daemon/Aux Daemon.app/Contents/MacOS/aux-daemon', 'out/sea/cli/Aux CLI.app/Contents/MacOS/aux-cli', 'apps/computer-use/dist/Aux Computer Use.app/Contents/MacOS/aux-computer-use', 'apps/password-importer/dist/Aux Password Importer.app/Contents/MacOS/aux-password-importer', 'apps/extension/dist/manifest.json', 'apps/vault/dist/manifest.json', 'out/runtime/node', 'out/runtime/python/bin/python3', 'out/runtime/pdftotext', 'out/runtime/pdfinfo', 'out/runtime/pdftoppm']) {
  if (!existsSync(resolve(root, path))) throw new Error(`Build prerequisite missing: ${path}`);
}
const executableProvenance = {};
for (const target of ['daemon', 'cli']) {
  const provenance = JSON.parse(readFileSync(join(root, 'out/sea', target, 'sea-provenance.json'), 'utf8'));
  const staged = createHash('sha256').update(readFileSync(join(root, 'out/sea', target, 'dist/index.js'))).digest('hex');
  const current = createHash('sha256').update(readFileSync(join(root, 'apps', target, 'dist/index.js'))).digest('hex');
  if (provenance.entrySha256 !== staged || current !== staged) throw new Error(`Rebuild the ${target} SEA after the current workspace build.`);
  executableProvenance[target] = provenance;
}
const temporary = `${destination}.assembling`;
rmSync(temporary, { recursive: true, force: true });
mkdirSync(dirname(temporary), { recursive: true });
function copy(from, to) {
  mkdirSync(dirname(to), { recursive: true });
  if (process.platform === 'darwin') {
    execFileSync('/bin/cp', ['-cR', from, to]);
  } else {
    cpSync(from, to, { recursive: true, verbatimSymlinks: true, mode: constants.COPYFILE_FICLONE });
  }
}
console.log('Staging native app, independent executables and pinned runtimes…');
copy(native, temporary);
const bundle = join(temporary, 'Contents/Resources/aux');
rmSync(bundle, { recursive: true, force: true });
copy(join(root, 'out/sea/daemon'), join(bundle, 'apps/daemon'));
copy(join(root, 'out/sea/cli'), join(bundle, 'apps/cli'));
copy(join(root, 'out/runtime'), join(bundle, 'runtime'));
for (const name of ['extension', 'vault']) copy(join(root, `apps/${name}/dist`), join(bundle, `apps/${name}/dist`));
copy(join(root, 'apps/computer-use/dist/Aux Computer Use.app'), join(bundle, 'apps/computer-use/Aux Computer Use.app'));
copy(join(root, 'apps/password-importer/dist/Aux Password Importer.app'), join(bundle, 'apps/password-importer/Aux Password Importer.app'));
copy(join(root, 'apps/memory/models/minilm'), join(bundle, 'apps/memory/models/minilm'));
for (const name of ['NOTICE.md', 'manifest.json', 'LICENSE-APACHE-2.0.txt']) copy(join(root, 'apps/memory/models', name), join(bundle, 'apps/memory/models', name));
copy(join(root, 'packages/ui/NOTICE.md'), join(bundle, 'licenses/ui/NOTICE.md'));
copy(join(root, 'apps/daemon/src/passwords/WORDLIST-NOTICE.md'), join(bundle, 'licenses/passphrase-vocabulary.md'));
copy(join(root, 'packages/ui/licenses'), join(bundle, 'licenses/ui/fonts-icons'));
copy(join(root, 'vendor/runtime/sources.json'), join(bundle, 'licenses/runtime-sources.json'));
copy(join(root, 'assets/brand/Aux.icns'), join(temporary, 'Contents/Resources/Aux.icns'));
execFileSync('/usr/libexec/PlistBuddy', ['-c', 'Set :CFBundleIconFile Aux.icns', join(temporary, 'Contents/Info.plist')]);
// Upstream derives default profile/cache/Crashpad roots from this bundle key.
const appPlist = join(temporary, 'Contents/Info.plist');
const productDir = execFileSync('/usr/libexec/PlistBuddy', ['-c', 'Print', appPlist], { encoding: 'utf8' });
execFileSync('/usr/libexec/PlistBuddy', ['-c', `${productDir.includes('CrProductDirName =') ? 'Set' : 'Add'} :CrProductDirName ${productDir.includes('CrProductDirName =') ? '' : 'string '}Aux`, appPlist]);
if (execFileSync('/usr/libexec/PlistBuddy', ['-c', 'Print :CrProductDirName', appPlist], { encoding: 'utf8' }).trim() !== 'Aux') throw new Error('Assembled browser data directory is not isolated.');
for (const [directory, name] of [['computer-use', 'Aux Computer Use'], ['password-importer', 'Aux Password Importer']]) {
  const app = join(bundle, 'apps', directory, `${name}.app/Contents`);
  copy(join(root, 'assets/brand/Aux.icns'), join(app, 'Resources/Aux.icns'));
  execFileSync('/usr/libexec/PlistBuddy', ['-c', 'Add :CFBundleIconFile string Aux.icns', join(app, 'Info.plist')]);
}

const manifest = { version: '0.2.0', development: !!options.development, daemon: 'apps/daemon/Aux Daemon.app/Contents/MacOS/aux-daemon', cli: 'apps/cli/Aux CLI.app/Contents/MacOS/aux-cli', executables: executableProvenance, assemblyRevision: execFileSync('/usr/bin/git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), assembledAt: new Date().toISOString() };
writeFileSync(join(bundle, 'bundle.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('Applying local ad hoc signature…');
execFileSync('/usr/bin/codesign', ['--force', '--deep', '--sign', '-', temporary], { stdio: 'inherit' });
if (options.development) {
  // Intermediate component builds resolve their own libraries beside Aux.app.
  for (const entry of readdirSync(dirname(native))) {
    if (entry.endsWith('.dylib')) copy(join(dirname(native), entry), join(dirname(destination), entry));
  }
}
// Preserve an existing installation until assembly and local signing succeeded.
const previous = `${destination}.previous`;
if (existsSync(previous)) throw new Error(`Previous app backup already exists: ${previous}`);
if (existsSync(destination)) renameSync(destination, previous);
try { renameSync(temporary, destination); }
catch (error) { if (existsSync(previous)) renameSync(previous, destination); throw error; }
if (existsSync(previous)) rmSync(previous, { recursive: true, force: true });
if (options.installCli) {
  const bin = options.bin ?? join(homedir(), '.local/bin');
  mkdirSync(bin, { recursive: true });
  const command = join(bin, 'aux');
  if (existsSync(command)) throw new Error(`CLI command already exists; inspect it before replacing: ${command}`);
  symlinkSync(join(destination, 'Contents/Resources/aux/apps/cli/Aux CLI.app/Contents/MacOS/aux-cli'), command);
}
console.log(`Assembled ${destination}${options.development ? ' (intermediate component build)' : ''}`);
