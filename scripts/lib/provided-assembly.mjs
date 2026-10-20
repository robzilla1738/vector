/** Assemble verified staged components into Chromium's Resources/aux layout. */
import { constants, createReadStream } from 'node:fs';
import { chmod, copyFile, lstat, mkdir, mkdtemp, readFile, readdir, readlink, realpath, rename, rm, symlink, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, isAbsolute, join, resolve, sep } from 'node:path';

const digest = async (path) => {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
};
const json = async (path) => JSON.parse(await readFile(path, 'utf8'));
const safe = (path) => typeof path === 'string' && path.length && !isAbsolute(path) && !path.split('/').some((part) => ['', '.', '..'].includes(part));
const inside = (parent, child) => child === parent || child.startsWith(parent + sep);
async function mapFiles(entries, visit) {
  const result = new Array(entries.length);
  let next = 0, failure;
  const workers = Array.from({ length: Math.min(8, entries.length) }, async () => {
    while (!failure && next < entries.length) {
      const index = next++;
      try { result[index] = await visit(entries[index]); }
      catch (error) { failure ??= error; }
    }
  });
  await Promise.all(workers);
  if (failure) throw failure;
  return result.filter(Boolean);
}
async function absent(path) {
  try { await lstat(path); throw new Error(`Assembly output already exists: ${path}`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
async function regularRoot(path) {
  const stat = await lstat(path);
  if (!stat.isDirectory() || stat.isSymbolicLink() || await realpath(path) !== path) throw new Error(`Assembly root must be a canonical directory: ${path}`);
}
async function tree(root, directory = '') {
  const result = [];
  for (const item of await readdir(join(root, directory), { withFileTypes: true })) {
    const path = join(directory, item.name);
    if (item.isDirectory()) result.push(...await tree(root, path));
    else result.push(path);
  }
  return result.sort();
}

export async function assembleProvidedResources({ stageRoot, outputRoot }) {
  stageRoot = resolve(stageRoot);
  outputRoot = resolve(outputRoot);
  await regularRoot(stageRoot);
  await mkdir(dirname(outputRoot), { recursive: true });
  const canonicalParent = await realpath(dirname(outputRoot));
  if (canonicalParent !== dirname(outputRoot) || inside(stageRoot, outputRoot) || inside(outputRoot, stageRoot)) throw new Error('Assembly input/output roots overlap or traverse a symlink');
  await absent(outputRoot);
  const stack = await json(join(stageRoot, 'manifest.json'));
  if (stack.version !== 1 || stack.implementation !== 'supplied' || !isAbsolute(stack.finalApp)) throw new Error('A supplied implementation stage with a final app path is required');
  const ui = await json(join(stageRoot, 'ui/manifest.json'));
  const apps = await json(join(stageRoot, 'apps/manifest.json'));
  const distribution = await json(join(stageRoot, 'distribution/manifest.json'));
  const computerUse = await json(join(stageRoot, 'computer-use/manifest.json'));
  if (distribution.runtimeRoot !== join(stack.finalApp, 'Contents/Resources/aux/agent-runtime')) throw new Error('Runtime relocation does not match the final app path');
  const components = [
    ...['agent', 'vault'].map((name) => ({ source: `ui/${name}`, target: `apps/${name === 'agent' ? 'extension' : 'vault'}/dist`, files: ui.components[name].files })),
    ...['daemon', 'cli'].map((name) => {
      const component = apps.components[name];
      if (component.app !== `${name}/Aux ${name === 'daemon' ? 'Daemon' : 'CLI'}.app`) throw new Error('Unexpected supplied application layout');
      return { source: `apps/${component.app}`, target: `apps/${component.app}`, files: component.files };
    }),
    ...['runtime', 'memory'].map((name) => ({ source: `distribution/${name}`, target: name === 'runtime' ? 'agent-runtime' : 'memory-distribution', files: distribution.components[name].files })),
    { source: 'computer-use/Aux Computer Use.app', target: 'apps/computer-use/Aux Computer Use.app', files: computerUse.files },
  ];
  const temporary = await mkdtemp(join(dirname(outputRoot), '.provided-resources-'));
  const report = {
    version: 1, implementation: 'supplied', productionReady: false, finalApp: stack.finalApp,
    brandInputs: stack.brandInputs, adaptationInputs: stack.adaptationInputs, files: [], components: [],
    localDevelopmentOnly: true, daemonRuntime: apps.components.daemon.nodeDevelopment ? 'provided-node-development' : 'provided-sea',
    blockers: [...new Set([...stack.blockers, 'Compiled native guard/carrier and reviewed Chromium integration', 'Disposable packaged UI/runtime acceptance'])],
  };
  try {
    for (const component of components) {
      const sourceRoot = join(stageRoot, component.source), destination = join(temporary, component.target);
      await regularRoot(sourceRoot);
      const checkedParents = new Set([sourceRoot]);
      const leaves = component.files.filter((file) => file.type !== 'directory').map((file) => file.path).sort();
      if (new Set(leaves).size !== leaves.length || JSON.stringify(await tree(sourceRoot)) !== JSON.stringify(leaves)) throw new Error(`Incomplete staged component inventory: ${component.source}`);
      await mkdir(destination, { recursive: true });
      const copied = await mapFiles(component.files, async (file) => {
        if (!safe(file.path)) throw new Error('Unsafe staged resource path');
        // Every parent is checked, so a staged symlink cannot redirect a later copy.
        let parent = sourceRoot;
        for (const part of file.path.split('/').slice(0, -1)) {
          parent = join(parent, part);
          if (!checkedParents.has(parent)) { await regularRoot(parent); checkedParents.add(parent); }
        }
        const source = join(sourceRoot, file.path), target = join(destination, file.path), stat = await lstat(source);
        const mode = file.outputMode ?? file.mode ?? (stat.mode & 0o777);
        if ((stat.mode & 0o777) !== mode) throw new Error(`Staged resource mode changed: ${file.path}`);
        await mkdir(dirname(target), { recursive: true });
        if (file.type === 'directory') {
          if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Staged directory changed');
          await mkdir(target, { recursive: true });
          await chmod(target, mode);
        } else if (file.type === 'symlink') {
          const link = file.outputLinkTarget ?? file.linkTarget;
          if (!stat.isSymbolicLink() || await readlink(source) !== link || isAbsolute(link) || !inside(sourceRoot, resolve(dirname(source), link))) throw new Error('Staged link changed or escapes its component');
          await symlink(link, target);
          return { path: join(component.target, file.path), type: 'symlink', linkTarget: link };
        } else {
          if (!stat.isFile() || stat.isSymbolicLink() || !/^[a-f0-9]{64}$/.test(file.outputSha256)) throw new Error('Staged resource is not a pinned regular file');
          if (await digest(source) !== file.outputSha256) throw new Error(`Staged resource hash changed: ${file.path}`);
          await copyFile(source, target, constants.COPYFILE_FICLONE);
          await chmod(target, mode);
          if (await digest(target) !== file.outputSha256) throw new Error('Resource changed during assembly');
          return { path: join(component.target, file.path), type: 'file', sha256: file.outputSha256, mode, source: join(component.source, file.path), changeKinds: file.changeKinds ?? [] };
        }
      });
      report.files.push(...copied);
      report.components.push({ source: component.source, target: component.target, records: component.files.length });
    }
    const provenance = join(temporary, 'provenance');
    await mkdir(provenance);
    for (const path of ['manifest.json', 'ui/manifest.json', 'apps/manifest.json', 'distribution/manifest.json', 'computer-use/manifest.json']) {
      const bytes = await readFile(join(stageRoot, path));
      const target = path.replaceAll('/', '-');
      await writeFile(join(provenance, target), bytes, { flag: 'wx' });
      await chmod(join(provenance, target), 0o644);
      report.files.push({ path: `provenance/${target}`, type: 'file', sha256: createHash('sha256').update(bytes).digest('hex'), mode: 0o644 });
    }
    await writeFile(join(temporary, 'bundle.json'), `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' });
    await absent(outputRoot);
    await rename(temporary, outputRoot);
    return report;
  } catch (error) { await rm(temporary, { recursive: true, force: true }); throw error; }
}
