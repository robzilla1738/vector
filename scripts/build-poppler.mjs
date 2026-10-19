import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { cp, mkdir, readFile, readdir, realpath, rename, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

function run(command, args) {
  return new Promise((done, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.on('data', value => { stdout += value; });
    child.stderr.on('data', value => { stderr += value; });
    child.once('error', reject);
    child.once('exit', code => code === 0 ? done(stdout) : reject(new Error(`${command} (${code}): ${stderr.slice(-2000)}`)));
  });
}
async function digest(path) {
  const hash = createHash('sha256');
  for await (const bytes of createReadStream(path)) hash.update(bytes);
  return hash.digest('hex');
}
async function files(path) {
  const output = [];
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const child = join(path, entry.name);
    if (entry.isDirectory()) output.push(...await files(child));
    else if (entry.isFile() || entry.isSymbolicLink()) output.push(child);
  }
  return output;
}
export async function stagePoppler(source, { output, cache }) {
  const target = join(output, 'poppler');
  const staging = `${target}.staging`;
  await rm(staging, { recursive: true, force: true });
  await mkdir(join(staging, 'Cellar'), { recursive: true });
  await mkdir(join(staging, 'opt'), { recursive: true });
  const bottles = [...source.bottles];
  const queue = [...bottles];
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const bottle = queue.shift();
      if (!/^[a-f0-9]{64}$/.test(bottle.sha256) || !/^[a-z0-9+@_.-]+$/.test(bottle.name)) throw new Error('Invalid bottle source pin.');
      const url = new URL(bottle.url);
      if (url.protocol !== 'https:' || url.hostname !== 'ghcr.io' || !url.pathname.startsWith('/v2/homebrew/core/')) throw new Error('Untrusted bottle origin.');
      const archive = join(cache, `${bottle.sha256}.tar.gz`);
      let present = false;
      try { present = await digest(archive) === bottle.sha256; }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
      if (!present) {
        const repository = url.pathname.slice(4, url.pathname.indexOf('/blobs/'));
        const tokenResponse = await fetch(`https://ghcr.io/token?service=ghcr.io&scope=repository:${repository}:pull`);
        if (!tokenResponse.ok) throw new Error(`Public bottle token failed: ${bottle.name}`);
        const { token } = await tokenResponse.json();
        const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(300000) });
        if (!response.ok || !response.body) throw new Error(`Bottle download failed: ${bottle.name} (${response.status})`);
        const temporary = `${archive}.partial`;
        await pipeline(Readable.fromWeb(response.body), createWriteStream(temporary, { mode: 0o600 }));
        if (await digest(temporary) !== bottle.sha256) { await rm(temporary); throw new Error(`Bottle hash mismatch: ${bottle.name}`); }
        await rename(temporary, archive);
      }
      const entries = (await run('/usr/bin/tar', ['-tzf', archive])).split('\n').filter(Boolean);
      if (entries.some(entry => entry.startsWith('/') || entry.split('/').includes('..') || entry.split('/')[0] !== bottle.name)) throw new Error(`Unsafe bottle paths: ${bottle.name}`);
      await run('/usr/bin/tar', ['-xzf', archive, '-C', join(staging, 'Cellar')]);
      const versions = await readdir(join(staging, 'Cellar', bottle.name));
      if (versions.length !== 1) throw new Error(`Ambiguous bottle root: ${bottle.name}`);
      await symlink(`../Cellar/${bottle.name}/${versions[0]}`, join(staging, 'opt', bottle.name));
    }
  }));
  // Relocate every Mach-O dependency to its bundled peer. No installed Homebrew
  // tree is consulted, and unresolved non-system references fail the build.
  console.log(`poppler: staged ${bottles.length} verified bottles; finding runtime libraries.`);
  const allFiles = await files(staging);
  const binaries = [];
  const aliases = new Map();
  for (const path of allFiles) {
    if (!(await stat(path)).isFile()) continue;
    const handle = await import('node:fs/promises').then(fs => fs.open(path, 'r'));
    const magic = Buffer.alloc(8);
    try { await handle.read(magic, 0, 8, 0); } finally { await handle.close(); }
    const signature = magic.subarray(0, 4).toString('hex');
    const thin = ['cffaedfe', 'feedfacf'].includes(signature);
    const fat = signature === 'cafebabe' ? magic.readUInt32BE(4) : signature === 'bebafeca' ? magic.readUInt32LE(4) : 0;
    if (thin || (fat > 0 && fat <= 32)) {
      const canonical = await realpath(path);
      aliases.set(path.split('/').at(-1), canonical);
      if (!binaries.includes(canonical)) binaries.push(canonical);
    }
  }

  console.log(`poppler: relocating ${binaries.length} Mach-O files.`);
  for (const binary of binaries) {
    const listing = await run('/usr/bin/otool', ['-L', binary]);
    const dependencies = listing.split('\n').slice(1).map(line => line.trim().split(' (')[0]).filter(Boolean);
    const changes = [];
    for (const dependency of dependencies) {
      if (dependency.startsWith('/usr/lib/') || dependency.startsWith('/System/Library/')) continue;
      let replacement;
      const match = dependency.match(/(?:@@HOMEBREW_PREFIX@@|\/opt\/homebrew|\/usr\/local)\/(opt|Cellar)\/(.+)/);
      if (match) replacement = join(staging, match[1], match[2]);
      else if (dependency.startsWith('@@HOMEBREW_CELLAR@@/')) replacement = join(staging, 'Cellar', dependency.slice('@@HOMEBREW_CELLAR@@/'.length));
      else if (dependency.startsWith('@loader_path/')) replacement = resolve(dirname(binary), dependency.slice(13));
      else if (dependency.startsWith('@rpath/') || dependency.startsWith('@executable_path/')) replacement = aliases.get(dependency.split('/').at(-1));
      if (!replacement) throw new Error(`Unresolved bundled library: ${dependency} (${relative(staging, binary)})`);
      const resolved = await realpath(replacement);
      if (!resolved.startsWith(staging + '/')) throw new Error('Bottle dependency escapes bundle.');
      changes.push('-change', dependency, `@loader_path/${relative(dirname(binary), resolved)}`);
    }
    if (binary.endsWith('.dylib')) changes.push('-id', `@loader_path/${binary.split('/').at(-1)}`);
    if (changes.length) await run('/usr/bin/install_name_tool', [...changes, binary]);
    await run('/usr/bin/codesign', ['--force', '--sign', '-', binary]);
  }
  // Preserve upstream license/configuration data alongside the actual bottles.
  const fonts = join(staging, 'etc/fonts');
  await mkdir(fonts, { recursive: true });
  await writeFile(join(fonts, 'fonts.conf'), '<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd"><fontconfig><dir>/System/Library/Fonts</dir><dir>/Library/Fonts</dir><cachedir prefix="xdg">fontconfig</cachedir></fontconfig>\n');
  await rm(target, { recursive: true, force: true });
  await rename(staging, target);
  for (const name of ['pdftotext', 'pdfinfo', 'pdftoppm']) {
    await rm(join(output, name), { force: true });
    await symlink(`poppler/opt/poppler/bin/${name}`, join(output, name));
  }
  console.log(`poppler: verified ${bottles.length} public bottles; relocated ${binaries.length} Mach-O files.`);
  return ['poppler', { ...source, stagedAt: new Date().toISOString(), executables: ['pdftotext', 'pdfinfo', 'pdftoppm'] }];
}
