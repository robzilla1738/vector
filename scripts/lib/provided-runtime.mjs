import { createHash } from 'node:crypto';
import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  readlink,
  realpath,
  rename,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const version = '1.26.1019.335';
const directories = ['bin', 'native', 'node', 'python'];
const topFiles = [
  'env.sh',
  'manifest.txt',
  'openssl.cnf',
  'prepare-python.py',
  'version.txt',
];
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const inside = (root, path) => {
  const part = relative(root, path);
  return (
    part === '' ||
    (!part.startsWith(`..${sep}`) && part !== '..' && !isAbsolute(part))
  );
};
const permitted = (path) =>
  topFiles.includes(path) || directories.includes(path.split(sep)[0]);
const npmConfig = 'fund=false\naudit=false\nupdate-notifier=false\n';

async function futurePath(path) {
  let parent = resolve(path);
  const tail = [];
  while (true) {
    try {
      return join(await realpath(parent), ...tail.reverse());
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    tail.push(basename(parent));
    parent = dirname(parent);
  }
}

async function distributionStat(root, path) {
  safePayloadPath(path);
  let current = root,
    stat;
  for (const part of ['', ...path.split(sep)]) {
    current = join(current, part);
    stat = await lstat(current);
    if (stat.isSymbolicLink())
      throw new Error(`Symlink in distribution metadata path: ${path}`);
  }
  return stat;
}
async function readDistributionFile(root, path) {
  if (!(await distributionStat(root, path)).isFile())
    throw new Error(`Nonregular distribution metadata: ${path}`);
  return readFile(join(root, path));
}
async function listDistributionDirectory(root, path) {
  if (!(await distributionStat(root, path)).isDirectory())
    throw new Error(`Non-directory distribution metadata: ${path}`);
  return readdir(join(root, path));
}

async function walk(root, path, allowed, annotate) {
  const full = join(root, path),
    stat = await lstat(full),
    mode = stat.mode & 0o777;
  if (!allowed(path))
    throw new Error(`Unallowlisted distribution path: ${path}`);
  if (stat.isSymbolicLink()) {
    const target = await readlink(full),
      resolved = resolve(dirname(full), target);
    if (
      !inside(root, resolved) ||
      !allowed(relative(root, resolved)) ||
      !inside(root, await realpath(full))
    )
      throw new Error(`Distribution symlink escapes allowed roots: ${path}`);
    return [{ path, type: 'symlink', mode, linkTarget: target }];
  }
  if (stat.isDirectory()) {
    const files = [{ path, type: 'directory', mode }];
    for (const name of (await readdir(full)).sort())
      files.push(...(await walk(root, join(path, name), allowed, annotate)));
    return files;
  }
  if (!stat.isFile()) throw new Error(`Nonregular distribution input: ${path}`);
  const bytes = await readFile(full);
  return [
    {
      path,
      type: 'file',
      mode,
      size: bytes.length,
      sourceSha256: digest(bytes),
      ...(annotate?.(bytes) ?? {}),
    },
  ];
}

function anchorsFor(bytes, sourceRoot, buildRoot) {
  if (bytes.includes(0)) return [];
  const text = bytes.toString('utf8');
  if (!Buffer.from(text).equals(bytes)) return [];
  const anchors = [];
  for (const find of [...new Set([sourceRoot, buildRoot])]) {
    const count = text.split(find).length - 1;
    if (count)
      anchors.push({
        kind: 'integration',
        find,
        replacement: 'runtimeRoot',
        count,
      });
  }
  const count = text.split('ASIDE_').length - 1;
  if (count)
    anchors.push({ kind: 'identity', find: 'ASIDE_', replace: 'AUX_', count });
  return anchors;
}

export async function inventoryProvidedRuntime(sourceRoot) {
  sourceRoot = resolve(sourceRoot);
  if ((await lstat(sourceRoot)).isSymbolicLink())
    throw new Error('Runtime root cannot be a symlink');
  sourceRoot = await realpath(sourceRoot);
  if (
    (await readDistributionFile(sourceRoot, 'version.txt'))
      .toString('utf8')
      .trim() !== version
  )
    throw new Error('Unexpected supplied runtime version');
  const config = (
    await readDistributionFile(sourceRoot, 'python/venv/pyvenv.cfg')
  ).toString('utf8');
  const buildRoot = config.match(/^home = (.+)\/python\/runtime\/bin$/m)?.[1];
  if (!buildRoot || !isAbsolute(buildRoot))
    throw new Error('Missing supplied Python build-prefix anchor');
  const files = [];
  const annotate = (bytes) => {
    const anchors = anchorsFor(bytes, sourceRoot, buildRoot);
    return anchors.length ? { anchors } : {};
  };
  for (const path of [...directories, ...topFiles])
    files.push(...(await walk(sourceRoot, path, permitted, annotate)));
  return { sourceVersion: version, inputRoot: sourceRoot, buildRoot, files };
}

function safePayloadPath(path) {
  if (
    !path ||
    isAbsolute(path) ||
    path.split(/[\\/]/).some((part) => !part || part === '..' || part === '.')
  )
    throw new Error('Unsafe catalog payload path');
}

/** Reads only catalog-described distributions, never user/index/u trees. Catalog bytes stay signed and unchanged. */
export async function inventoryProvidedMemory(memoryRoot) {
  memoryRoot = resolve(memoryRoot);
  if ((await lstat(memoryRoot)).isSymbolicLink())
    throw new Error('Memory root cannot be a symlink');
  memoryRoot = await realpath(memoryRoot);
  const allowedPaths = new Set(['memory-catalog.json']);
  const catalogBytes = await readDistributionFile(
    memoryRoot,
    'memory-catalog.json',
  );
  const envelope = JSON.parse(catalogBytes),
    catalog = JSON.parse(envelope.payload);
  if (
    envelope.formatVersion !== 1 ||
    !envelope.signature ||
    catalog.formatVersion !== 1 ||
    !Array.isArray(catalog.runtimes) ||
    !Array.isArray(catalog.models)
  )
    throw new Error('Not a static memory distribution catalog');
  const payloadHashes = new Map();
  for (const [directory, candidates, metadataName] of [
    ['memory-runtimes', catalog.runtimes, 'runtime.json'],
    ['models', catalog.models, 'model.json'],
  ]) {
    allowedPaths.add(directory);
    for (const hash of (
      await listDistributionDirectory(memoryRoot, directory)
    ).sort()) {
      if (!/^[a-f0-9]{64}$/.test(hash))
        throw new Error(`Non-distribution entry in ${directory}`);
      const base = join(directory, hash);
      allowedPaths.add(base);
      allowedPaths.add(join(base, 'CURRENT'));
      const current = (
        await readDistributionFile(memoryRoot, join(base, 'CURRENT'))
      )
        .toString('utf8')
        .trim();
      if (!/^[a-f0-9-]{36}$/.test(current))
        throw new Error('Invalid static distribution generation');
      const generation = join(base, current),
        metadataPath = join(generation, metadataName);
      allowedPaths.add(generation);
      allowedPaths.add(metadataPath);
      if (
        (await listDistributionDirectory(memoryRoot, base)).some(
          (entry) => !['CURRENT', current].includes(entry),
        )
      )
        throw new Error('Uncataloged distribution generation');
      const metadata = JSON.parse(
        (await readDistributionFile(memoryRoot, metadataPath)).toString('utf8'),
      );
      const match = candidates.find(
        (candidate) =>
          candidate.id === metadata.id && candidate.target === metadata.target,
      );
      if (
        !match ||
        metadata.formatVersion !== 1 ||
        (metadata.executable && metadata.executable !== match.executable)
      )
        throw new Error('Distribution metadata does not match catalog');
      if (Object.keys(metadata).some((key) => !Object.hasOwn(match, key)))
        throw new Error('Unexpected distribution metadata fields');
      for (const [key, value] of Object.entries(match)) {
        if (
          key !== 'files' &&
          JSON.stringify(metadata[key]) !== JSON.stringify(value)
        )
          throw new Error('Distribution metadata fields differ from catalog');
      }
      const declared = Object.keys(match.files).sort(),
        installed = Object.keys(metadata.files).sort();
      if (JSON.stringify(declared) !== JSON.stringify(installed))
        throw new Error('Distribution payload inventory differs from catalog');
      for (const path of declared) {
        safePayloadPath(path);
        const expected = match.files[path],
          local = metadata.files[path];
        if (
          local.sha256 !== expected.sha256 ||
          local.bytes !== expected.bytes ||
          !/^[a-f0-9]{64}$/.test(expected.sha256)
        )
          throw new Error('Distribution payload metadata differs from catalog');
        const relativePath = join(generation, path);
        payloadHashes.set(relativePath, expected);
        let parent = relativePath;
        while (parent !== '.') {
          allowedPaths.add(parent);
          parent = dirname(parent);
        }
      }
    }
  }
  const allowed = (path) => allowedPaths.has(path),
    files = [];
  for (const path of ['memory-catalog.json', 'memory-runtimes', 'models'])
    files.push(...(await walk(memoryRoot, path, allowed)));
  for (const file of files) {
    const expected = payloadHashes.get(file.path);
    if (file.type === 'symlink')
      throw new Error('Memory distributions must not contain symlinks');
    if (
      expected &&
      (file.size !== expected.bytes || file.sourceSha256 !== expected.sha256)
    )
      throw new Error(`Memory payload hash mismatch: ${file.path}`);
  }
  return {
    sourceVersion: `catalog-${catalog.sequence}`,
    inputRoot: memoryRoot,
    files,
  };
}

export async function stageProvidedRuntime({
  sourceRoot,
  outputRoot,
  runtimeRoot,
  memoryRoot,
}) {
  if (
    !runtimeRoot ||
    !isAbsolute(runtimeRoot) ||
    !/^\/[A-Za-z0-9_./-]+$/.test(runtimeRoot) ||
    resolve(runtimeRoot) !== runtimeRoot
  )
    throw new Error(
      'Explicit normalized shell-safe absolute Aux runtimeRoot is required',
    );
  const pinned = JSON.parse(
    await readFile(
      join(repository, 'docs/source/provided-runtime-inputs.json'),
      'utf8',
    ),
  );
  const components = { runtime: await inventoryProvidedRuntime(sourceRoot) };
  if (memoryRoot) components.memory = await inventoryProvidedMemory(memoryRoot);
  const destination = await futurePath(outputRoot);
  const installation = await futurePath(runtimeRoot);
  for (const [name, component] of Object.entries(components)) {
    if (
      JSON.stringify(component.files) !==
      JSON.stringify(pinned.components[name]?.files)
    )
      throw new Error(`Supplied ${name} differs from pinned distribution`);
    if (
      inside(component.inputRoot, destination) ||
      inside(destination, component.inputRoot) ||
      inside(component.inputRoot, installation) ||
      inside(installation, component.inputRoot)
    )
      throw new Error('Runtime input/output/install roots overlap');
  }
  await mkdir(dirname(destination), { recursive: true });
  try {
    await lstat(destination);
    throw new Error('Runtime staging destination already exists');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const temporary = await mkdtemp(
    join(dirname(destination), '.provided-runtime-'),
  );
  const report = { version: 1, runtimeRoot, components: {} };
  try {
    for (const [name, component] of Object.entries(components)) {
      const files = [];
      for (const entry of component.files) {
        const source = join(component.inputRoot, entry.path),
          target = join(temporary, name, entry.path);
        await mkdir(dirname(target), { recursive: true });
        if (entry.type === 'directory') {
          await mkdir(target, { recursive: true });
          files.push({ ...entry, changeKinds: [] });
          continue;
        }
        if (entry.type === 'symlink') {
          if ((await readlink(source)) !== entry.linkTarget)
            throw new Error('Runtime source link changed during staging');
          const outputLinkTarget = isAbsolute(entry.linkTarget)
            ? join(runtimeRoot, relative(component.inputRoot, entry.linkTarget))
            : entry.linkTarget;
          await symlink(outputLinkTarget, target);
          files.push({
            ...entry,
            outputLinkTarget,
            changeKinds:
              outputLinkTarget === entry.linkTarget ? [] : ['integration'],
          });
          continue;
        }
        const input = await readFile(source);
        if (digest(input) !== entry.sourceSha256)
          throw new Error(
            `Runtime input changed during staging: ${entry.path}`,
          );
        let output = input;
        const anchors = (entry.anchors ?? []).map((anchor) => ({
          kind: anchor.kind,
          find: anchor.find,
          replace:
            anchor.replacement === 'runtimeRoot' ? runtimeRoot : anchor.replace,
          count: anchor.count,
        }));
        if (anchors.length) {
          let text = input.toString('utf8');
          for (const anchor of anchors) {
            if (text.split(anchor.find).length - 1 !== anchor.count)
              throw new Error(`Runtime relocation anchor drift: ${entry.path}`);
            text = text.split(anchor.find).join(anchor.replace);
          }
          output = Buffer.from(text);
        }
        await writeFile(target, output, { mode: entry.mode });
        await chmod(target, entry.mode);
        files.push({
          path: entry.path,
          type: entry.type,
          mode: entry.mode,
          sourceSha256: entry.sourceSha256,
          outputSha256: digest(output),
          changeKinds: [...new Set(anchors.map((anchor) => anchor.kind))],
          ...(anchors.length ? { anchors } : {}),
        });
      }
      for (const directory of component.files
        .filter((entry) => entry.type === 'directory')
        .reverse())
        await chmod(join(temporary, name, directory.path), directory.mode);
      report.components[name] = {
        sourceVersion: component.sourceVersion,
        inputRoot: component.inputRoot,
        outputRoot: join(destination, name),
        files,
      };
    }
    await mkdir(join(temporary, 'runtime/tmp'), { mode: 0o700 });
    await writeFile(join(temporary, 'runtime/.npmrc'), npmConfig, {
      mode: 0o600,
    });
    report.components.runtime.files.push(
      {
        path: 'tmp',
        type: 'directory',
        mode: 0o700,
        changeKinds: ['generated-empty-state'],
      },
      {
        path: '.npmrc',
        type: 'file',
        mode: 0o600,
        outputSha256: digest(npmConfig),
        changeKinds: ['generated-config'],
      },
    );
    await writeFile(
      join(temporary, 'manifest.json'),
      JSON.stringify(report, null, 2) + '\n',
    );
    await rename(temporary, destination);
    return report;
  } catch (error) {
    await rm(temporary, { recursive: true, force: true });
    throw error;
  }
}
