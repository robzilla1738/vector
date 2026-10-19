/** Seed only pinned distribution caches into a new disposable Aux home. */
import { createHash } from 'node:crypto';
import { chmod, lstat, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');

export async function seedProvidedMemory({ stageRoot, home }) {
  const destination = resolve(home);
  try { await lstat(destination); throw new Error('Aux home must not already exist; existing state is never overwritten'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const pins = JSON.parse(await readFile(join(repository, 'docs/source/provided-runtime-inputs.json'), 'utf8')).components.memory;
  const source = join(resolve(stageRoot), 'distribution/memory');
  await mkdir(dirname(destination), { recursive: true });
  const temporary = await mkdtemp(join(dirname(destination), '.aux-memory-seed-'));
  let files = 0;
  try {
    for (const entry of pins.files) {
      if (entry.path.startsWith('/') || entry.path.split('/').some((part) => !part || part === '..' || part === '.')) throw new Error('Invalid pinned distribution path');
      let current = source;
      for (const part of ['', ...entry.path.split('/')]) {
        current = join(current, part);
        if ((await lstat(current)).isSymbolicLink()) throw new Error('Memory cache source contains a symbolic link');
      }
      const target = join(temporary, entry.path);
      if (entry.type === 'directory') { await mkdir(target, { recursive: true, mode: entry.mode }); continue; }
      if (entry.type !== 'file' || !(await lstat(current)).isFile()) throw new Error('Nonregular memory cache input');
      const bytes = await readFile(current);
      if (bytes.length !== entry.size || digest(bytes) !== entry.sourceSha256) throw new Error(`Memory cache pin mismatch: ${entry.path}`);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, bytes, { mode: entry.mode, flag: 'wx' });
      await chmod(target, entry.mode);
      files++;
    }
    await chmod(temporary, 0o700);
    await rename(temporary, destination);
    return { home: destination, files, catalogVersion: pins.sourceVersion };
  } catch (error) { await rm(temporary, { recursive: true, force: true }); throw error; }
}
