import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  copyFile,
  rm,
  symlink,
  link,
} from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import {
  planProvidedSigning,
  runProvidedSigning,
  inspectProvidedSigningTree,
} from './provided-signing.mjs';
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const options = {
  skip:
    process.platform !== 'darwin'
      ? 'macOS static signing tools required'
      : process.env.AUX_RUN_SIGNING_FIXTURES !== '1'
        ? 'Opt in after the active native build: AUX_RUN_SIGNING_FIXTURES=1'
        : false,
};
const nativeBuild = fileURLToPath(new URL('../native-build.py', import.meta.url));
const policies = {
  preserveKeys: ['com.apple.security.cs.allow-jit'],
  removeKeys: ['com.apple.application-identifier'],
};
async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), 'aux-signing-fixture-')),
    source = join(directory, 'source'),
    root = join(directory, 'copy');
  await mkdir(source);
  await mkdir(root);
  const c = join(directory, 'fixture.c'),
    code = join(directory, 'fixture-code');
  await writeFile(c, 'int main(void) { return 0; }\n');
  execFileSync('python3', [nativeBuild, '/usr/bin/clang', c, '-o', code], { stdio: 'pipe' });
  const entitlements = join(directory, 'fixture-entitlements.plist');
  await writeFile(
    entitlements,
    '<?xml version="1.0"?><plist version="1.0"><dict><key>com.apple.security.cs.allow-jit</key><true/><key>com.apple.application-identifier</key><string>FIXTURE.example.original</string></dict></plist>',
  );
  // Sign only newly compiled fixture code, never any supplied source or owner artifact.
  execFileSync(
    '/usr/bin/codesign',
    [
      '--force',
      '--sign',
      '-',
      '--timestamp=none',
      '--options',
      'runtime',
      '--entitlements',
      entitlements,
      code,
    ],
    { stdio: 'pipe' },
  );
  await copyFile(code, join(source, 'original-fixture'));
  const app = 'Aux Fixture.app',
    child = `${app}/Contents/Applications/Aux Child.app`;
  for (const [path, name] of [
    [app, 'fixture'],
    [child, 'child'],
  ]) {
    await mkdir(join(root, path, 'Contents/MacOS'), { recursive: true });
    await copyFile(code, join(root, path, 'Contents/MacOS', name));
    await writeFile(
      join(root, path, 'Contents/Info.plist'),
      `<?xml version="1.0"?><plist version="1.0"><dict><key>CFBundleExecutable</key><string>${name}</string><key>CFBundleIdentifier</key><string>dev.aux.fixture.${name}</string><key>CFBundlePackageType</key><string>APPL</string></dict></plist>`,
    );
  }
  const native = `${app}/Contents/Resources/provided-native.node`,
    tool = `${app}/Contents/Resources/carrier`;
  await mkdir(join(root, app, 'Contents/Resources/agent-runtime/bin'), {
    recursive: true,
  });
  await copyFile(code, join(root, native));
  await copyFile(code, join(root, tool));
  await copyFile(
    code,
    join(root, app, 'Contents/Resources/agent-runtime/bin/node'),
  );
  await writeFile(
    join(root, app, 'Contents/Resources/catalog.json'),
    'immutable fixture catalog\n',
  );
  const guard = `${app}/Contents/Resources/libaux-native-boundary.dylib`;
  execFileSync('python3', [nativeBuild, '/usr/bin/clang', '-dynamiclib', c, '-o', join(root, guard)], {
    stdio: 'pipe',
  });
  const guardSha256 = digest(await readFile(join(root, guard)));
  const sha256 = digest(await readFile(code));
  const targets = [
    {
      path: guard,
      kind: 'macho',
      sha256: guardSha256,
      entitlements: { preserveKeys: [], removeKeys: [] },
    },
    {
      path: app,
      kind: 'bundle',
      executable: 'Contents/MacOS/fixture',
      sha256,
      entitlements: policies,
    },
    {
      path: child,
      kind: 'bundle',
      executable: 'Contents/MacOS/child',
      sha256,
      entitlements: policies,
    },
    { path: tool, kind: 'macho', sha256, entitlements: policies },
  ];
  return { directory, source, root, app, child, native, tool, sha256, targets };
}
test(
  'explicit copied fixture plan signs inside out, retains declared booleans, and preserves native/runtime/catalog bytes',
  options,
  async () => {
    const f = await fixture();
    try {
      const before = await inspectProvidedSigningTree(f.root);
      const plan = await planProvidedSigning({
        root: f.root,
        sourceRoots: [f.source],
        targets: f.targets,
        verifyPreserved: [f.native],
      });
      assert.equal(plan.steps.at(-1).path, f.app);
      assert.deepEqual(plan.steps.find((s) => s.path === f.tool).options, [
        'runtime',
      ]);
      assert.ok(
        plan.steps.findIndex((s) => s.path === f.child) <
          plan.steps.findIndex((s) => s.path === f.app),
      );
      assert.equal((await runProvidedSigning(plan)).mode, 'verify-only');
      assert.deepEqual(await inspectProvidedSigningTree(f.root), before);
      const result = await runProvidedSigning(plan, { mode: 'sign' });
      assert.equal(result.signed.length, 4);
      assert.equal(result.productionReady, false);
      const after = await inspectProvidedSigningTree(f.root);
      for (const path of [
        f.native,
        `${f.app}/Contents/Resources/agent-runtime/bin/node`,
        `${f.app}/Contents/Resources/catalog.json`,
      ])
        assert.deepEqual(
          after.files.find((x) => x.path === path),
          before.files.find((x) => x.path === path),
        );
      for (const step of plan.steps) {
        const path = join(
          f.root,
          step.kind === 'bundle'
            ? `${step.path}/${step.executable}`
            : step.path,
        );
        const xml = execFileSync(
          '/usr/bin/codesign',
          ['-d', '--entitlements', '-', '--xml', path],
          { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
        );
        const values = xml.trim()
          ? JSON.parse(
              execFileSync(
                '/usr/bin/plutil',
                ['-convert', 'json', '-o', '-', '--', '-'],
                { input: xml, encoding: 'utf8' },
              ),
            )
          : {};
        assert.deepEqual(values, step.entitlements.values);
      }
      assert.equal(
        digest(await readFile(join(f.source, 'original-fixture'))),
        f.sha256,
      );
      await assert.rejects(
        runProvidedSigning(plan, { mode: 'sign' }),
        /changed after signing plan/,
      );
    } finally {
      await rm(f.directory, { recursive: true, force: true });
    }
  },
);
test(
  'planner fails closed for altered inputs, owner-source overlap, protected code and unaccounted entitlement claims',
  options,
  async () => {
    const f = await fixture();
    const opts = { root: f.root, sourceRoots: [f.source], targets: f.targets };
    try {
      await assert.rejects(
        planProvidedSigning({ ...opts, sourceRoots: [f.root] }),
        /disjoint/,
      );
      await assert.rejects(
        planProvidedSigning({
          ...opts,
          targets: [{ ...f.targets[3], sha256: '0'.repeat(64) }],
        }),
        /hash\/type/,
      );
      await assert.rejects(
        planProvidedSigning({
          ...opts,
          targets: [{ ...f.targets[3], path: f.native }],
        }),
        /cannot be a signing target/,
      );
      await assert.rejects(
        planProvidedSigning({
          ...opts,
          targets: [
            {
              ...f.targets[3],
              entitlements: { preserveKeys: [], removeKeys: [] },
            },
          ],
        }),
        /Exhaustive/,
      );
      await assert.rejects(
        planProvidedSigning({
          ...opts,
          targets: [
            {
              ...f.targets[3],
              entitlements: {
                preserveKeys: ['com.apple.application-identifier'],
                removeKeys: ['com.apple.security.cs.allow-jit'],
              },
            },
          ],
        }),
        /capability booleans only/,
      );
      await assert.rejects(
        planProvidedSigning({
          ...opts,
          targets: [
            {
              ...f.targets[3],
              path: `${f.app}/Contents/Resources/catalog.json`,
            },
          ],
        }),
        /hash\/type/,
      );
      await assert.rejects(
        planProvidedSigning({
          ...opts,
          targets: [{ ...f.targets[3], path: '../source/original-fixture' }],
        }),
        /relative signing path/,
      );
      const plan = await planProvidedSigning(opts);
      await assert.rejects(
        runProvidedSigning({ ...plan, root: f.source }, { mode: 'sign' }),
        /plan was modified/,
      );
      await writeFile(join(f.root, 'new-resource'), 'changed');
      await assert.rejects(
        runProvidedSigning(plan),
        /changed after signing plan/,
      );
      await symlink(f.source, join(f.root, 'escape'));
      await assert.rejects(
        inspectProvidedSigningTree(f.root),
        /symlink escapes/,
      );
      await rm(join(f.root, 'escape'));
      await link(join(f.source, 'original-fixture'), join(f.root, 'hardlink'));
      await assert.rejects(inspectProvidedSigningTree(f.root), /hardlinked/);
    } finally {
      await rm(f.directory, { recursive: true, force: true });
    }
  },
);
