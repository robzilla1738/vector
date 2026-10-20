import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { stageProvidedUi } from './provided-ui.mjs';
import { readAuxMark } from './aux-mark.mjs';

const pinned = JSON.parse(
  await readFile(
    new URL('../../docs/source/provided-ui-inputs.json', import.meta.url),
    'utf8',
  ),
);
const identities = JSON.parse(
  await readFile(
    new URL('../../docs/design/extension-identities.json', import.meta.url),
    'utf8',
  ),
);
const sourceRoots = Object.fromEntries(
  Object.entries(pinned.components).map(([name, component]) => [
    name,
    component.inputRoot,
  ]),
);
let missing = false;
try {
  for (const root of Object.values(sourceRoots)) await access(root);
} catch {
  missing = true;
}

test('pinned supplied UI stages deterministically and rejects unreported adaptations', {
  skip: missing ? 'Pinned external static inputs are unavailable' : false,
}, async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'aux-provided-ui-test-'));
  try {
    const first = await stageProvidedUi({
      sourceRoots,
      outputRoot: join(temporary, 'first'),
      identities,
    });
    const second = await stageProvidedUi({
      sourceRoots,
      outputRoot: join(temporary, 'second'),
      identities,
    });
    for (const component of ['agent', 'vault']) {
      assert.deepEqual(
        first.components[component].files,
        second.components[component].files,
      );
      const manifest = JSON.parse(
        await readFile(
          join(temporary, 'first', component, 'manifest.json'),
          'utf8',
        ),
      );
      assert.equal(manifest.key, identities[component].key);
      assert.equal(manifest.version, '1.26.1016.1852');
      assert.ok(manifest.name.startsWith('Aux'));
      assert.deepEqual(manifest.externally_connectable.ids, [
        identities[component === 'agent' ? 'vault' : 'agent'].id,
      ]);
      for (const file of first.components[component].files) {
        if (!file.changeKinds.length)
          assert.equal(file.sourceSha256, file.outputSha256);
        if (file.path.endsWith('.css')) {
          const source = await readFile(
            join(sourceRoots[component], file.sourcePath ?? file.path),
            'utf8',
          );
          const output = await readFile(
            join(temporary, 'first', component, file.path),
            'utf8',
          );
          assert.equal(output, source.replaceAll('Aside', 'Aux'));
        }
      }
      for (const file of pinned.components[component].files.filter(
        (entry) => entry.inlineMarkCount > 0,
      )) {
        const syntax = spawnSync(
          process.execPath,
          ['--check', join(temporary, 'first', component, file.path)],
          { encoding: 'utf8' },
        );
        assert.equal(syntax.status, 0, syntax.stderr);
      }
      const files = first.components[component].files.map((file) => file.path);
      assert.ok(!files.some((path) => path.startsWith('aux-private-shim')));
      const smallMarkPath = component === 'agent'
        ? 'assets/tag-icon-DeMC7uIN.js'
        : 'assets/popup-MxHiJ2Et.js';
      const smallMark = await readFile(join(temporary, 'first', component, smallMarkPath), 'utf8');
      for (const path of (await readAuxMark()).paths)
        assert.ok(smallMark.includes(JSON.stringify(path)));
      assert.ok(!smallMark.includes('M12 0.798752C18.0061'));
      assert.ok(smallMark.includes('fillOpacity:1,children:'));
      const smallSyntax = spawnSync(process.execPath,
        ['--check', join(temporary, 'first', component, smallMarkPath)],
        { encoding: 'utf8' });
      assert.equal(smallSyntax.status, 0, smallSyntax.stderr);
      if (component === 'agent') {
        for (const path of ['assets/splash-D666ivBP.js', 'assets/tool-definition-registry-Cc6FCFb2.js', 'remix.js']) {
          const target = join(temporary, 'first', component, path);
          const output = await readFile(target, 'utf8');
          assert.ok(!output.includes('M19.556 4.74023'));
          for (const geometry of (await readAuxMark()).paths)
            assert.ok(output.includes(JSON.stringify(geometry)));
          const syntax = spawnSync(process.execPath, ['--check', target], { encoding: 'utf8' });
          assert.equal(syntax.status, 0, syntax.stderr);
        }
      }
    }
    await assert.rejects(
      stageProvidedUi({
        sourceRoots,
        outputRoot: join(temporary, 'first'),
        identities,
      }),
      /must not already exist/,
    );
    await assert.rejects(
      stageProvidedUi({
        sourceRoots,
        outputRoot: join(temporary, 'hidden'),
        identities,
        transformText: ({ text }) => ({ text: `${text}\n`, anchors: [] }),
      }),
      /Unreported transformation/,
    );
    await assert.rejects(
      stageProvidedUi({
        sourceRoots,
        outputRoot: join(temporary, 'count'),
        identities,
        transformText: ({ text }) => ({
          text,
          anchors: [
            {
              kind: 'integration',
              find: 'not-an-input-anchor',
              replace: 'bad',
              count: 1,
            },
          ],
        }),
      }),
      /anchor count mismatch/,
    );
    await assert.rejects(
      stageProvidedUi({
        sourceRoots,
        outputRoot: join(temporary, 'identity'),
        identities: {
          ...identities,
          agent: { ...identities.agent, id: identities.vault.id },
        },
      }),
      /Invalid Aux agent public identity/,
    );
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
