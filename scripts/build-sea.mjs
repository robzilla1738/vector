import { spawn } from 'node:child_process';
import { cp, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const node = join(root, 'out/runtime/node');
const sources = JSON.parse(await readFile(join(root, 'vendor/runtime/sources.json'), 'utf8'));
const output = join(root, 'out/sea');
await mkdir(output, { recursive: true });
function run(command, args, cwd = root) {
  return new Promise((done, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit' });
    child.once('error', reject);
    child.once('exit', (code) => code === 0 ? done() : reject(new Error(`${command} failed (${code}).`)));
  });
}
const requested = process.argv.slice(2);
const targets = requested.length ? requested : ['daemon', 'cli'];
if (targets.some((target) => !['daemon', 'cli'].includes(target))) throw new Error('SEA target must be daemon or cli.');
for (const target of targets) {
  const directory = join(output, target);
  if (target === 'daemon') {
    try {
      await run('pnpm', ['--filter', '@aux/daemon', 'deploy', '--legacy', '--prod', '--force', directory]);
    } finally {
      // pnpm legacy deployment leaves its shared dependency-state cache in prod
      // mode. Restore the developer install state so later scripts never prune it.
      await run('pnpm', ['install', '--prod=false', '--frozen-lockfile']);
    }
    const memoryPackage = await realpath(join(directory, 'node_modules/@aux/memory'));
    if (!memoryPackage.startsWith(await realpath(directory) + sep)) throw new Error('Deployed dependency escapes its self-contained runtime.');
    await cp(join(root, 'apps/memory/models/minilm'), join(memoryPackage, 'models/minilm'), { recursive: true });
  } else {
    await mkdir(directory, { recursive: true });
    await cp(join(root, 'apps/cli/dist'), join(directory, 'dist'), { recursive: true });
  }
  const appName = target === 'daemon' ? 'Aux Daemon' : 'Aux CLI';
  const contents = join(directory, `${appName}.app/Contents`);
  await mkdir(join(contents, 'MacOS'), { recursive: true });
  const executable = join(contents, 'MacOS', `aux-${target}`);
  // SEA's embedded loader exposes builtin modules. A normal on-disk CJS
  // trampoline enters Node's filesystem module loader for the external ESM app.
  const trampoline = join(directory, 'dist/sea-loader.cjs');
  await writeFile(trampoline, `import('./index.js').then(async runtime => { ${target === 'daemon' ? 'await runtime.runDaemon();' : ''} }).catch(error => { console.error(error.message); process.exitCode = 1; });\n`);
  const loader = join(output, `${target}-loader.cjs`);
  await writeFile(loader, `const {dirname,resolve} = require('node:path');\nconst {createRequire} = require('node:module');\nconst entry = resolve(dirname(process.execPath), '../../../dist/sea-loader.cjs');\ncreateRequire(entry)(entry);\n`);
  const config = join(output, `${target}-config.json`);
  await writeFile(config, JSON.stringify({ main: loader, mainFormat: 'commonjs', executable: node, output: executable, disableExperimentalSEAWarning: true, useCodeCache: false, execArgvExtension: 'none' }, null, 2));
  await run(node, ['--build-sea', config]);
  await run('/usr/bin/codesign', ['--force', '--sign', '-', executable]);
  await writeFile(join(contents, 'Info.plist'), `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict><key>CFBundleIdentifier</key><string>dev.aux.${target}</string><key>CFBundleName</key><string>${appName}</string><key>CFBundleExecutable</key><string>aux-${target}</string><key>CFBundlePackageType</key><string>APPL</string><key>CFBundleShortVersionString</key><string>0.2.0</string><key>LSUIElement</key><true/></dict></plist>\n`);
  await writeFile(join(directory, 'sea-provenance.json'), JSON.stringify({ target, node: sources.node, entry: 'dist/index.js', format: 'module', localSignature: 'ad-hoc', builtAt: new Date().toISOString() }, null, 2) + '\n');
  console.log(`Built independent ${appName} SEA at ${executable}`);
}
