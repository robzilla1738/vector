/** Explicit ad hoc signing of copied supplied packages; never executes supplied code. */
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import {
  lstat,
  readdir,
  readlink,
  realpath,
  open,
  mkdtemp,
  writeFile,
  rm,
  readFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, sep, isAbsolute, basename } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const contained = (root, path) => {
  const p = relative(root, path);
  return (
    p === '' || (p !== '..' && !p.startsWith(`..${sep}`) && !isAbsolute(p))
  );
};
const safe = (path) => {
  if (
    typeof path !== 'string' ||
    !path ||
    isAbsolute(path) ||
    path.split('/').some((p) => !p || p === '.' || p === '..') ||
    path.includes('\\')
  )
    throw new Error('Invalid package-relative signing path');
  return path;
};
const machoMagics = new Set([
  'cffaedfe',
  'cefaedfe',
  'feedfacf',
  'feedface',
  'cafebabe',
  'bebafeca',
  'cafebabf',
  'bfbafeca',
]);
const digestFile = async (path) => {
  const h = createHash('sha256');
  for await (const chunk of createReadStream(path)) h.update(chunk);
  return h.digest('hex');
};
const codePath = (step) =>
  step.kind === 'bundle' ? `${step.path}/${step.executable}` : step.path;
const signaturePath = (step, path) =>
  step.kind === 'bundle' &&
  path.startsWith(`${step.path}/Contents/_CodeSignature/`);
function command(args, input) {
  return execFileSync('/usr/bin/codesign', args, {
    input,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    maxBuffer: 4 * 1024 * 1024,
  });
}
function jsonPlist(bytes) {
  return JSON.parse(
    execFileSync(
      '/usr/bin/plutil',
      ['-convert', 'json', '-o', '-', '--', '-'],
      { input: bytes, encoding: 'utf8' },
    ),
  );
}

export async function inspectProvidedSigningTree(root) {
  if (!isAbsolute(root) || (await lstat(root)).isSymbolicLink())
    throw new Error('Signing root must be an absolute real copied directory');
  root = await realpath(root);
  if (!(await lstat(root)).isDirectory())
    throw new Error('Signing root must be a directory');
  const files = [],
    bundles = [];
  async function walk(prefix = '') {
    for (const entry of (
      await readdir(join(root, prefix), { withFileTypes: true })
    ).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name,
        absolute = join(root, path),
        stat = await lstat(absolute);
      if (stat.isSymbolicLink()) {
        const link = await readlink(absolute);
        if (isAbsolute(link) || !contained(root, await realpath(absolute)))
          throw new Error(`Package symlink escapes copy: ${path}`);
        files.push({ path, kind: 'symlink', link, mode: stat.mode & 0o777 });
      } else if (stat.isDirectory()) {
        if (/\.(app|appex|xpc|framework)$/.test(entry.name)) bundles.push(path);
        await walk(path);
      } else if (stat.isFile()) {
        if (stat.nlink !== 1)
          throw new Error(
            `Signing copies cannot contain hardlinked files: ${path}`,
          );
        const handle = await open(absolute, 'r');
        let magic;
        try {
          const first = Buffer.alloc(4);
          await handle.read(first, 0, 4, 0);
          magic = first.toString('hex');
        } finally {
          await handle.close();
        }
        files.push({
          path,
          kind: machoMagics.has(magic) ? 'macho' : 'file',
          sha256: await digestFile(absolute),
          mode: stat.mode & 0o777,
        });
      } else throw new Error(`Unsupported package object: ${path}`);
    }
  }
  await walk();
  return { root, files, bundles };
}
export function applyProvidedEntitlementPolicy(values, policy, { canAddBoundaryDyld = false } = {}) {
  const preserve = policy?.preserveKeys ?? [],
    remove = policy?.removeKeys ?? [];
  if (
    !Array.isArray(preserve) ||
    !Array.isArray(remove) ||
    new Set([...preserve, ...remove]).size !== preserve.length + remove.length
  )
    throw new Error('Entitlement decisions must be distinct explicit keys');
  const keys = Object.keys(values).sort();
  if (JSON.stringify([...preserve, ...remove].sort()) !== JSON.stringify(keys))
    throw new Error('Exhaustive entitlement policy required');
  const result = {};
  for (const key of preserve) {
    if (
      !key.startsWith('com.apple.security.') ||
      key === 'com.apple.security.application-groups' ||
      typeof values[key] !== 'boolean'
    )
      throw new Error(
        `Ad hoc preservation supports explicit capability booleans only: ${key}`,
      );
    result[key] = values[key];
  }
  const addDyldEnvironmentForBoundary = policy?.addDyldEnvironmentForBoundary === true;
  if (addDyldEnvironmentForBoundary) {
    const key = 'com.apple.security.cs.allow-dyld-environment-variables';
    if (!canAddBoundaryDyld || keys.includes(key)) throw new Error('DYLD boundary exception requires a changed supplied hardened SEA host');
    result[key] = true;
  }
  return {
    observedKeys: keys,
    preserveKeys: preserve,
    removeKeys: remove,
    addDyldEnvironmentForBoundary,
    values: result,
  };
}

function embeddedEntitlements(path, policy, options) {
  let xml;
  try {
    xml = command(['-d', '--entitlements', '-', '--xml', path]);
  } catch (error) {
    if (!String(error.stderr).includes('code object is not signed at all'))
      throw new Error(`Cannot inspect embedded signature: ${path}`);
    xml = '';
  }
  return applyProvidedEntitlementPolicy(xml.trim() ? jsonPlist(xml) : {}, policy, options);
}

function signingOptions(path) {
  const display = spawnSync('/usr/bin/codesign', ['-dvvv', path], {
    encoding: 'utf8',
  });
  if (display.status !== 0) {
    if (
      display.status === 1 &&
      String(display.stderr).includes('code object is not signed at all')
    )
      return [];
    throw new Error(`Cannot inspect signature flags: ${path}`);
  }
  const matched = display.stderr.match(/flags=0x[0-9a-f]+\(([^)]*)\)/i);
  if (!matched)
    throw new Error(`Unsupported signature flag representation: ${path}`);
  const flags = matched[1].split(',').filter(Boolean);
  if (
    flags.some(
      (flag) => !['adhoc', 'linker-signed', 'runtime', 'none'].includes(flag),
    )
  )
    throw new Error(`Unsupported signature flags: ${path}`);
  return flags.includes('runtime') ? ['runtime'] : [];
}

export async function planProvidedSigning({
  root,
  sourceRoots,
  targets,
  verifyPreserved = [],
}) {
  if (
    !Array.isArray(sourceRoots) ||
    !sourceRoots.length ||
    !Array.isArray(targets) ||
    !targets.length
  )
    throw new Error(
      'Explicit source roots and changed signing targets are required',
    );
  const snapshot = await inspectProvidedSigningTree(root);
  const sources = [];
  for (const source of sourceRoots) {
    if (!isAbsolute(source)) throw new Error('Source roots must be absolute');
    const canonical = await realpath(source);
    if (
      contained(canonical, snapshot.root) ||
      contained(snapshot.root, canonical)
    )
      throw new Error('Signing copy and source must be disjoint');
    sources.push(canonical);
  }
  const steps = [],
    byPath = new Map(snapshot.files.map((f) => [f.path, f]));
  for (const target of targets) {
    safe(target.path);
    if (steps.some((s) => s.path === target.path))
      throw new Error('Duplicate signing target');
    if (!['macho', 'bundle'].includes(target.kind))
      throw new Error('Unsupported signing target kind');
    if (
      target.kind === 'bundle' &&
      (!/\.(app|appex|xpc)$/.test(target.path) ||
        !snapshot.bundles.includes(target.path))
    )
      throw new Error('Unsupported or missing signing bundle');
    if (target.kind === 'bundle') safe(target.executable);
    const code = codePath(target),
      file = byPath.get(code);
    if (!file || file.kind !== 'macho' || file.sha256 !== target.sha256)
      throw new Error(`Changed Mach-O hash/type mismatch: ${code}`);
    if ((await lstat(join(snapshot.root, code))).nlink !== 1)
      throw new Error('Refuse signing hardlinked code');
    if (
      (code.endsWith('.node') && basename(code) !== 'aux-native-guard.node') ||
      /(?:^|\/)(?:agent-runtime|memory-distribution|distribution\/runtime|distribution\/memory)(?:\/|$)/.test(
        code,
      )
    )
      throw new Error(
        'Original native binding/runtime/memory cannot be a signing target',
      );
    if (target.kind === 'bundle') {
      const plist = byPath.get(`${target.path}/Contents/Info.plist`);
      if (!plist || plist.kind !== 'file')
        throw new Error('Signing bundle requires regular Contents/Info.plist');
      const metadata = jsonPlist(
        await readFile(join(snapshot.root, plist.path)),
      );
      if (target.executable !== `Contents/MacOS/${metadata.CFBundleExecutable}`)
        throw new Error('Bundle executable does not match Info.plist');
    }
    const options = signingOptions(join(snapshot.root, code));
    const suppliedBoundaryHost = target.kind === 'bundle' && options.includes('runtime') && (
      (target.path.endsWith('apps/daemon/Aux Daemon.app') && target.executable === 'Contents/MacOS/aux-daemon') ||
      (target.path.endsWith('apps/cli/Aux CLI.app') && target.executable === 'Contents/MacOS/aux-cli')
    );
    steps.push({
      ...target,
      options,
      entitlements: embeddedEntitlements(
        join(snapshot.root, code),
        target.entitlements,
        { canAddBoundaryDyld: suppliedBoundaryHost },
      ),
    });
  }
  // Dependencies first: all loose code before the deepest enclosing bundle, outer app last.
  steps.sort(
    (a, b) =>
      b.path.split('/').length - a.path.split('/').length ||
      (a.kind === 'macho' ? 0 : 1) - (b.kind === 'macho' ? 0 : 1) ||
      a.path.localeCompare(b.path),
  );
  for (const path of verifyPreserved) {
    safe(path);
    if (!byPath.has(path) && !snapshot.bundles.includes(path))
      throw new Error('Missing preserved-signature verification target');
    if (steps.some((s) => s.path === path || codePath(s) === path))
      throw new Error('Preserved-signature target overlaps signing target');
  }
  const plan = {
    version: 1,
    mode: 'plan',
    root: snapshot.root,
    sourceRoots: sources,
    steps,
    verifyPreserved,
    snapshot,
    productionReady: false,
    warning: 'Ad hoc signing does not establish helper/TCC/runtime acceptance',
  };
  return { ...plan, planSha256: hash(JSON.stringify(plan)) };
}

/** Default verifies the plan only; mode:'sign' is the sole mutation opt-in. No --deep or identities. */
export async function runProvidedSigning(plan, { mode = 'verify-only' } = {}) {
  if (!['verify-only', 'sign'].includes(mode))
    throw new Error('Explicit supported signing mode required');
  const { planSha256, ...body } = plan;
  if (body.version !== 1 || hash(JSON.stringify(body)) !== planSha256)
    throw new Error('Signing plan was modified');
  const live = await inspectProvidedSigningTree(plan.root);
  if (JSON.stringify(live) !== JSON.stringify(plan.snapshot))
    throw new Error('Copied package changed after signing plan');
  // Re-plan the same explicit targets, including exhaustive entitlement choices.
  const checked = await planProvidedSigning({
    root: plan.root,
    sourceRoots: plan.sourceRoots,
    targets: plan.steps.map((s) => ({
      ...s,
      entitlements: {
        preserveKeys: s.entitlements.preserveKeys,
        removeKeys: s.entitlements.removeKeys,
        addDyldEnvironmentForBoundary: s.entitlements.addDyldEnvironmentForBoundary,
      },
    })),
    verifyPreserved: plan.verifyPreserved,
  });
  if (JSON.stringify(checked.steps) !== JSON.stringify(plan.steps))
    throw new Error('Signing target metadata changed');
  for (const path of plan.verifyPreserved)
    command(['--verify', '--strict', join(plan.root, path)]);
  if (mode === 'verify-only')
    return {
      mode,
      planSha256,
      steps: plan.steps.length,
      productionReady: false,
    };
  const temporary = await mkdtemp(join(tmpdir(), 'aux-adhoc-signing-')),
    signed = [];
  try {
    for (const [index, step] of plan.steps.entries()) {
      const path = join(plan.root, step.path);
      const args = ['--force', '--sign', '-', '--timestamp=none'];
      if (step.options.length) args.push('--options', step.options.join(','));
      {
        const entitlements = join(temporary, `${index}.plist`);
        const xml = execFileSync(
          '/usr/bin/plutil',
          ['-convert', 'xml1', '-o', '-', '--', '-'],
          { input: JSON.stringify(step.entitlements.values) },
        );
        await writeFile(entitlements, xml, { mode: 0o600 });
        args.push('--entitlements', entitlements);
      }
      args.push(path);
      command(args);
      command(['--verify', '--strict', path]);
      const observed = embeddedEntitlements(path, {
        preserveKeys: Object.keys(step.entitlements.values),
        removeKeys: [],
      });
      if (
        JSON.stringify(observed.values) !==
          JSON.stringify(step.entitlements.values) ||
        JSON.stringify(signingOptions(path)) !== JSON.stringify(step.options)
      )
        throw new Error(
          'Signed capabilities or runtime flags differ from the approved plan',
        );
      signed.push({ path: step.path, kind: step.kind });
    }
    for (const path of plan.verifyPreserved)
      command(['--verify', '--strict', join(plan.root, path)]);
    const after = await inspectProvidedSigningTree(plan.root),
      beforeMap = new Map(plan.snapshot.files.map((f) => [f.path, f])),
      afterMap = new Map(after.files.map((f) => [f.path, f]));
    const changed = [];
    for (const path of new Set([...beforeMap.keys(), ...afterMap.keys()])) {
      const before = beforeMap.get(path),
        output = afterMap.get(path);
      if (JSON.stringify(before) === JSON.stringify(output)) continue;
      const allowed = plan.steps.some(
        (s) => codePath(s) === path || signaturePath(s, path),
      );
      if (
        !allowed ||
        !output ||
        output.kind === 'symlink' ||
        (before && before.mode !== output.mode)
      )
        throw new Error(`Signing changed protected bytes or modes: ${path}`);
      changed.push({
        path,
        beforeSha256: before?.sha256 ?? null,
        outputSha256: output.sha256,
      });
    }
    return {
      version: 1,
      mode,
      planSha256,
      signed,
      changed,
      immutableFilesVerified: after.files.length - changed.length,
      productionReady: false,
    };
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}
