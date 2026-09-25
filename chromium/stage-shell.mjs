#!/usr/bin/env node
// Pin the built Aux WebUI and install exactly those bytes into Chromium source.
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

const chromium = import.meta.dirname;
const repo = resolve(chromium, '..');
const dist = resolve(repo, 'apps/desktop/dist/renderer');
const pinned = resolve(chromium, 'shell-assets');
const source = resolve(process.env.AUX_CHROMIUM_SRC ?? join(process.env.HOME, 'aux-chromium-stable/chromium/src'));
const destination = resolve(source, 'chrome/browser/resources/aux/assets');
const allowed = new Set(['.css', '.html', '.js', '.json', '.png', '.svg', '.woff', '.woff2']);

function files(root, prefix = '') {
  return readdirSync(join(root, prefix), { withFileTypes: true }).flatMap(entry => {
    const path = join(prefix, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlink in shell assets: ${path}`);
    if (entry.isDirectory()) return files(root, path);
    if (!entry.isFile()) throw new Error(`Unsupported shell asset: ${path}`);
    return [path.split(sep).join('/')];
  }).sort();
}

function digest(data) {
  return createHash('sha256').update(data).digest('hex');
}

function manifestFor(root) {
  const entries = files(root).filter(path => path !== 'manifest.json' && !path.startsWith('.vite/'));
  if (!entries.includes('index.html')) throw new Error('Missing shell index.html');
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  if (!html.includes('Content-Security-Policy') || !html.includes('object-src &#39;self&#39;')) {
    throw new Error('Chromium shell CSP must allow only self for SurfaceEmbed objects');
  }
  if (html.includes('aux-host.js')) throw new Error('Legacy proof bootstrap is not a production shell');
  const assets = entries.map(path => {
    const ext = path.slice(path.lastIndexOf('.'));
    if (!allowed.has(ext)) throw new Error(`Unsupported shell MIME type: ${path}`);
    const data = readFileSync(join(root, path));
    return { path, bytes: data.length, sha256: digest(data) };
  });
  if (!assets.some(asset => asset.path.endsWith('.js') &&
      readFileSync(join(root, asset.path), 'utf8').includes('auxChromiumHost'))) {
    throw new Error('Shell build lacks the Chromium host adapter');
  }
  return {
    kind: 'aux-webui-shell-v1',
    files: assets,
    sha256: digest(assets.map(({ path, bytes, sha256 }) => `${path}\t${bytes}\t${sha256}\n`).join('')),
  };
}

function verify(root) {
  const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
  const actual = manifestFor(root);
  if (manifest.kind !== actual.kind || manifest.sha256 !== actual.sha256 ||
      JSON.stringify(manifest.files) !== JSON.stringify(actual.files)) {
    throw new Error(`Pinned shell assets failed SHA-256 verification: ${root}`);
  }
  return manifest;
}

function replaceDirectory(from, to) {
  mkdirSync(dirname(to), { recursive: true });
  const temporary = `${to}.staging-${process.pid}`;
  rmSync(temporary, { recursive: true, force: true });
  mkdirSync(temporary, { recursive: true });
  for (const path of files(from)) {
    const target = join(temporary, path);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(join(from, path), target);
  }
  rmSync(to, { recursive: true, force: true });
  renameSync(temporary, to);
}

const mode = process.argv[2];
const output = process.argv[3] ? resolve(process.argv[3]) : mode === 'capture' ? pinned : mode === 'verify' ? pinned : destination;
if (mode === 'capture') {
  if (!existsSync(join(dist, '.vite/manifest.json'))) throw new Error('Build the Chromium renderer first');
  const builtAt = statSync(join(dist, '.vite/manifest.json')).mtimeMs;
  for (const path of files(join(repo, 'apps/desktop/renderer/src'))) {
    if (/\.(css|tsx?)$/.test(path) && statSync(join(repo, 'apps/desktop/renderer/src', path)).mtimeMs > builtAt) {
      throw new Error(`Renderer build is stale: ${path}`);
    }
  }
  const manifest = manifestFor(dist);
  replaceDirectory(dist, output);
  rmSync(join(output, '.vite'), { recursive: true, force: true });
  writeFileSync(join(output, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  verify(output);
  console.log(`Pinned ${manifest.files.length} WebUI assets at ${relative(repo, output)} (${manifest.sha256})`);
} else if (mode === 'verify') {
  const manifest = verify(output);
  console.log(`Verified ${manifest.files.length} pinned WebUI assets (${manifest.sha256})`);
} else if (mode === 'install') {
  const manifest = verify(pinned);
  replaceDirectory(pinned, output);
  verify(output);
  console.log(`Installed ${manifest.files.length} verified WebUI assets at ${output}`);
} else {
  throw new Error('Usage: node chromium/stage-shell.mjs capture [destination] | verify [directory] | install [destination]');
}
