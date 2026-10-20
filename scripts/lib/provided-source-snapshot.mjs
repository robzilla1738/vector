/** Explicit frozen implementation inputs; canonical source pins remain authoritative. */
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { lstat, readFile, readdir, readlink, realpath } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';

const specifications = Object.freeze({
  agent: ['docs/source/provided-ui-inputs.json', 'agent'],
  vault: ['docs/source/provided-ui-inputs.json', 'vault'],
  daemon: ['docs/source/provided-app-inputs.json', 'daemon'],
  cli: ['docs/source/provided-app-inputs.json', 'cli'],
  runtime: ['docs/source/provided-runtime-inputs.json', 'runtime'],
  memory: ['docs/source/provided-runtime-inputs.json', 'memory'],
  computerUse: ['docs/source/provided-computer-use-inputs.json'],
});
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const inside = (root, path) => {
  const part = relative(root, path);
  return part === '' || (!isAbsolute(part) && part !== '..' && !part.startsWith(`..${sep}`));
};
const safe = path => typeof path === 'string' && path.length > 0 &&
  !isAbsolute(path) && !path.includes('\\') &&
  path.split('/').every(part => part && part !== '.' && part !== '..');

async function directoryWithoutLinks(root, path) {
  let current = root;
  for (const part of ['', ...relative(root, path).split(sep).filter(Boolean)]) {
    current = join(current, part);
    const stat = await lstat(current);
    if (!stat.isDirectory() || stat.isSymbolicLink())
      throw new Error(`Frozen source directory is not a real directory: ${current}`);
  }
}
async function fileDigest(path) {
  const hash = createHash('sha256');
  for await (const bytes of createReadStream(path)) hash.update(bytes);
  return hash.digest('hex');
}

async function verifyComponent(root, pinned) {
  const expected = new Map();
  const allowed = new Set();
  for (const file of pinned.files) {
    if (!safe(file.path) || expected.has(file.path)) throw new Error('Invalid canonical source inventory');
    const type = file.type ?? 'file';
    const hash = file.sourceSha256 ?? file.sha256;
    if (!['file', 'directory', 'symlink'].includes(type) ||
        (type === 'file' && !/^[a-f0-9]{64}$/.test(hash)))
      throw new Error('Incomplete canonical source pin');
    expected.set(file.path, { ...file, type, hash });
    const parts = file.path.split('/');
    while (parts.length) { allowed.add(parts.join('/')); parts.pop(); }
  }
  const seen = new Set();
  async function visit(directory = '') {
    for (const entry of await readdir(join(root, directory))) {
      const path = directory ? `${directory}/${entry}` : entry;
      if (!allowed.has(path)) throw new Error(`Unpinned frozen source path: ${path}`);
      const absolute = join(root, path), stat = await lstat(absolute), pin = expected.get(path);
      if (pin) {
        seen.add(path);
        const type = stat.isSymbolicLink() ? 'symlink' : stat.isFile() ? 'file' : stat.isDirectory() ? 'directory' : 'unsupported';
        if (type !== pin.type || (pin.mode !== undefined && (stat.mode & 0o777) !== pin.mode))
          throw new Error(`Frozen source type/mode differs: ${path}`);
        if (type === 'file' && ((pin.size ?? pin.bytes ?? stat.size) !== stat.size || await fileDigest(absolute) !== pin.hash))
          throw new Error(`Frozen source hash/size differs: ${path}`);
        if (type === 'symlink') {
          const target = await readlink(absolute);
          if (target !== pin.linkTarget || isAbsolute(target) || !inside(root, await realpath(absolute)))
            throw new Error(`Frozen dependency link escapes or differs: ${path}`);
        }
      } else if (!stat.isDirectory() || stat.isSymbolicLink()) {
        throw new Error(`Frozen source parent is not a directory: ${path}`);
      }
      if (stat.isDirectory()) await visit(path);
    }
  }
  await visit();
  if (seen.size !== expected.size) throw new Error('Missing frozen source inventory entries');
  return expected.size;
}

/** No implicit fallback. Each selected snapshot must contain all seven exact original components. */
export async function resolveProvidedSourceSnapshot({ snapshotRoot, repositoryRoot }) {
  if (snapshotRoot === undefined) return null;
  if (!isAbsolute(snapshotRoot) || !isAbsolute(repositoryRoot)) throw new Error('Frozen source roots must be absolute');
  const repository = await realpath(repositoryRoot);
  const lexical = resolve(snapshotRoot);
  if (!inside(resolve(repositoryRoot), lexical) || lexical === resolve(repositoryRoot))
    throw new Error('Frozen sources must be in the project workspace');
  const root = join(repository, relative(resolve(repositoryRoot), lexical));
  await directoryWithoutLinks(repository, root);
  const manifestPath = join(root, 'manifest.json');
  const manifestStat = await lstat(manifestPath);
  if (!manifestStat.isFile() || manifestStat.isSymbolicLink()) throw new Error('Invalid frozen source manifest');
  const bytes = await readFile(manifestPath), manifest = JSON.parse(bytes);
  if (manifest.version !== 1 || manifest.kind !== 'provided-source-snapshot' ||
      !manifest.components || JSON.stringify(Object.keys(manifest.components).sort()) !== JSON.stringify(Object.keys(specifications).sort()))
    throw new Error('Incomplete or unsupported frozen source manifest');
  const roots = {}, inventories = {};
  for (const [name, [pinFile, component]] of Object.entries(specifications)) {
    const entry = manifest.components[name];
    if (!entry || !safe(entry.path) || entry.pinFile !== pinFile) throw new Error(`Invalid frozen source descriptor: ${name}`);
    const canonicalBytes = await readFile(join(repository, pinFile));
    if (entry.pinSha256 !== digest(canonicalBytes)) throw new Error(`Frozen source canonical pin mismatch: ${name}`);
    const canonical = JSON.parse(canonicalBytes), pinned = component ? canonical.components[component] : canonical;
    if (!pinned || entry.sourceVersion !== pinned.sourceVersion) throw new Error(`Frozen source version mismatch: ${name}`);
    const componentRoot = join(root, entry.path);
    if (!inside(root, componentRoot) || Object.values(roots).some(other => inside(other, componentRoot) || inside(componentRoot, other)))
      throw new Error('Frozen component roots overlap or escape');
    await directoryWithoutLinks(root, componentRoot);
    inventories[name] = await verifyComponent(componentRoot, pinned);
    roots[name] = componentRoot;
  }
  return { root, manifestPath, manifestSha256: digest(bytes), roots, inventories };
}

export function parseProvidedCheckArguments(args, defaultOutput) {
  let output, sourceSnapshotRoot;
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (argument === '--source-snapshot') {
      if (sourceSnapshotRoot !== undefined || !args[index + 1] || args[index + 1].startsWith('--'))
        throw new Error('Expected one --source-snapshot ROOT');
      sourceSnapshotRoot = resolve(args[++index]);
    } else if (argument.startsWith('--') || output !== undefined) {
      throw new Error('Usage: check-provided.mjs [STAGE] [--source-snapshot ROOT]');
    } else output = argument;
  }
  return { output: resolve(output ?? defaultOutput), sourceSnapshotRoot };
}
