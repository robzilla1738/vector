// Stage the current production Aux renderer for the isolated Chromium WebUI.
// Run after `pnpm --filter @aux/shell build`, never against the mock preview.
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';

const repo = resolve(import.meta.dirname, '../..');
const source = resolve(process.env.AUX_SHELL_DIST ?? join(repo, 'apps/shell/dist'));
const rendererSource = join(repo, 'apps/shell/src');
const stageRoot = resolve(process.env.AUX_SHELL_STAGE_ROOT ?? join(tmpdir(), 'aux-chromium-shell'));
const mime = {
  '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.woff': 'font/woff', '.woff2': 'font/woff2',
};

function filesAt(root, prefix = '') {
  return readdirSync(join(root, prefix), { withFileTypes: true }).flatMap(entry => {
    const path = join(prefix, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Refusing symlink in shell build: ${path}`);
    if (entry.isDirectory()) return filesAt(root, path);
    if (!entry.isFile()) throw new Error(`Unsupported shell build entry: ${path}`);
    return [path];
  });
}

function assertCurrentBuild() {
  const index = join(source, 'index.html');
  const viteManifest = join(source, '.vite/manifest.json');
  if (!existsSync(index) || !existsSync(viteManifest)) {
    throw new Error('Production Aux renderer is missing; build @aux/shell first');
  }
  const builtAt = statSync(viteManifest).mtimeMs;
  for (const path of filesAt(rendererSource)) {
    if (!/\.(css|tsx?|html)$/.test(path)) continue;
    if (statSync(join(rendererSource, path)).mtimeMs > builtAt) {
      throw new Error(`Renderer build is stale: ${path} changed after the Vite manifest`);
    }
  }
  const html = readFileSync(index, 'utf8');
  if (!html.includes('Content-Security-Policy') || !html.includes('script-src &#39;self&#39;')) {
    throw new Error('Production Aux shell CSP is missing');
  }
  for (const match of html.matchAll(/(?:href|src)="\.\/([^"]+)"/g)) {
    if (!existsSync(join(source, match[1]))) throw new Error(`Shell entry references missing ${match[1]}`);
  }
  const manifest = JSON.parse(readFileSync(viteManifest, 'utf8'));
  if (!manifest['index.html']?.file) throw new Error('Vite entry is missing');
  if (Object.keys(manifest).some(key => key.includes('mock/bridge.ts'))) {
    throw new Error('Mock bridge is present in the production manifest');
  }
  return manifest;
}

function main() {
  const manifest = assertCurrentBuild();
  const paths = filesAt(source).filter(path => !path.startsWith(`.vite${sep}`)).sort();
  const assets = paths.map(path => {
    const data = readFileSync(join(source, path));
    const extension = path.slice(path.lastIndexOf('.'));
    const contentType = mime[extension];
    if (!contentType) throw new Error(`No WebUI MIME type for ${path}`);
    return { path: path.split(sep).join('/'), bytes: data.length,
      sha256: createHash('sha256').update(data).digest('hex'), contentType };
  });
  const js = assets.filter(asset => asset.path.endsWith('.js'));
  if (!js.some(asset => readFileSync(join(source, asset.path), 'utf8').includes('auxChromiumHost'))) {
    throw new Error('Production renderer lacks the Chromium host adapter; rebuild current Aux source');
  }
  mkdirSync(stageRoot, { recursive: true });
  const stage = mkdtempSync(join(stageRoot, 'aux-shell-'));
  for (const asset of assets) {
    const target = join(stage, asset.path);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(join(source, asset.path), target);
  }
  const bootstrap = readFileSync(join(import.meta.dirname, "native/aux-host.js"));
  writeFileSync(join(stage, "aux-host.js"), bootstrap);
  assets.push({ path: "aux-host.js", bytes: bootstrap.length, sha256: createHash("sha256").update(bootstrap).digest("hex"), contentType: "text/javascript" });
  const result = {
    kind: 'aux-chromium-webui-assets-v1', source: relative(repo, source), stage,
    entry: manifest['index.html'].file, assets,
  };
  writeFileSync(join(stage, 'aux-shell-assets.json'), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify({ stage, files: assets.length, bytes: assets.reduce((sum, asset) => sum + asset.bytes, 0) }));
}

main();
