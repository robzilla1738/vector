import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { chmod, cp, mkdir, mkdtemp, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { stagePoppler } from './build-poppler.mjs';

const root = resolve(import.meta.dirname, '..');
const sources = JSON.parse(await readFile(join(root, 'vendor/runtime/sources.json'), 'utf8'));
const args = process.argv.slice(2);
if (args.length && (args[0] !== '--components' || args.length !== 2)) throw new Error('Usage: build-runtime.mjs [--components node,python,rg,poppler]');
const components = args[1]?.split(',') ?? ['node', 'python', 'rg', 'poppler'];
for (const name of components) if (!sources[name]) throw new Error(`Pinned upstream source is missing for ${name}.`);
if (process.platform !== 'darwin' || process.arch !== 'arm64') throw new Error('The pinned runtime currently targets macOS arm64.');
const output = join(root, 'out/runtime');
const cache = join(root, 'out/runtime-downloads');
await mkdir(cache, { recursive: true });
await mkdir(output, { recursive: true });
async function digest(path) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}
function run(command, arguments_) {
  return new Promise((done, reject) => {
    const child = spawn(command, arguments_, { stdio: ['ignore', 'pipe', 'inherit'] });
    let output = '';
    child.stdout.on('data', (chunk) => { output += chunk; });
    child.once('error', reject);
    child.once('exit', (code) => code === 0 ? done(output) : reject(new Error(`${command} failed (${code}).`)));
  });
}
async function component(name) {
  const source = sources[name];
  if (name === 'poppler') return stagePoppler(source, { output, cache });
  if (!/^[a-f0-9]{64}$/.test(source.sha256)) throw new Error(`Invalid source digest for ${name}.`);
  const archive = join(cache, `${source.sha256}.tar.gz`);
  let present = false;
  try { present = await digest(archive) === source.sha256; }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (!present) {
    const url = new URL(source.url);
    if (url.protocol !== 'https:' || !['nodejs.org', 'github.com'].includes(url.hostname)) throw new Error('Runtime downloads require an approved upstream HTTPS origin.');
    const response = await fetch(url, { signal: AbortSignal.timeout(300_000) });
    if (!response.ok || !response.body) throw new Error(`${name} download failed (${response.status}).`);
    const temporary = `${archive}.partial`;
    await pipeline(Readable.fromWeb(response.body), createWriteStream(temporary, { mode: 0o600 }));
    if (await digest(temporary) !== source.sha256) { await rm(temporary); throw new Error(`${name} archive checksum mismatch.`); }
    await rename(temporary, archive);
  }
  const entries = (await run('/usr/bin/tar', ['-tzf', archive])).split('\n').filter(Boolean);
  if (entries.some((entry) => entry.startsWith('/') || entry.split('/').includes('..'))) throw new Error('Unsafe upstream archive paths.');
  const staging = await mkdtemp(join(cache, `${name}-`));
  try {
    await run('/usr/bin/tar', ['-xzf', archive, '-C', staging]);
    const directories = await readdir(staging);
    if (directories.length !== 1) throw new Error(`Unexpected ${name} archive layout.`);
    const unpacked = join(staging, directories[0]);
    if (!(await stat(unpacked)).isDirectory()) throw new Error(`Missing ${name} archive root.`);
    const target = join(output, name);
    if (name === 'python') {
      await rm(target, { recursive: true, force: true });
      await cp(unpacked, target, { recursive: true, verbatimSymlinks: true });
    } else {
      const binary = name === 'node' ? join(unpacked, 'bin/node') : join(unpacked, name);
      const temporary = `${target}.tmp`;
      await cp(binary, temporary); await chmod(temporary, 0o755); await rename(temporary, target);
    }
    const licenses = join(output, 'licenses', name);
    await mkdir(licenses, { recursive: true });
    for (const entry of await readdir(unpacked)) {
      if (/^(?:LICENSE|COPYING|NOTICE)/i.test(entry)) await cp(join(unpacked, entry), join(licenses, entry), { recursive: true });
    }
    console.log(`${name}: verified and staged pinned upstream runtime.`);
    return [name, { ...source, stagedAt: new Date().toISOString(), executable: name === 'python' ? 'python/bin/python3' : name }];
  } finally { await rm(staging, { recursive: true, force: true }); }
}
const results = await Promise.allSettled(components.map(component));
if (components.includes('python')) await cp(join(root, 'vendor/runtime/licenses/python'), join(output, 'licenses/python'), { recursive: true });
const failures = results.filter((result) => result.status === 'rejected');
if (failures.length) throw new AggregateError(failures.map((result) => result.reason), 'Runtime staging failed.');
const manifestPath = join(output, 'manifest.json');
let previous = {};
try { previous = JSON.parse(await readFile(manifestPath, 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const manifest = { ...previous, ...Object.fromEntries(results.map((result) => result.value)) };
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Runtime manifest: ${manifestPath}`);
