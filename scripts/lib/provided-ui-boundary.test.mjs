import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import {
  transformProvidedUiBoundary,
  providedUiBoundaryRules,
  providedUiUnavailableOrigin,
} from './provided-ui-boundary.mjs';
const pins = JSON.parse(
  await readFile(
    new URL('../../docs/source/provided-ui-inputs.json', import.meta.url),
    'utf8',
  ),
);
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

test('actual pinned consumers replay counted boundary anchors without changing third-party URLs, wire tokens or other bytes', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'aux-ui-boundary-'));
  try {
    let files = 0,
      anchors = 0,
      replacements = 0;
    for (const [key, rules] of Object.entries(providedUiBoundaryRules)) {
      const [component, ...parts] = key.split('/'),
        path = parts.join('/');
      const snapshot = pins.components[component];
      const pin = snapshot.files.find((file) => file.path === path);
      const bytes = await readFile(join(snapshot.inputRoot, path));
      assert.equal(sha256(bytes), pin.sourceSha256);
      const text = bytes.toString('utf8'),
        output = transformProvidedUiBoundary({ component, path, text });
      let replay = text;
      for (const anchor of output.anchors) {
        assert.equal(replay.split(anchor.find).length - 1, anchor.count);
        replay = replay.split(anchor.find).join(anchor.replace);
        replacements += anchor.count;
      }
      assert.equal(replay, output.text);
      assert.equal(output.anchors.length, rules.length);
      const urls = (t) =>
        (t.match(/https?:\/\/[^\s"'`<>\\)]+/g) ?? []).filter(
          (u) => !/(?:aside(?:hq)?\.(?:com|at)|127\.0\.0\.1:9)/.test(u),
        );
      assert.deepEqual(urls(output.text), urls(text));
      assert.deepEqual(
        output.text.match(/Aside\.[A-Za-z]+/g),
        text.match(/Aside\.[A-Za-z]+/g),
      );
      if (path === 'content/content.js') {
        assert.ok(!output.text.includes('"https://aside.at"'));
        assert.ok(
          output.text.includes(
            '"http://localhost:5175","http://127.0.0.1:5175","http://0.0.0.0:5175"',
          ),
        );
      }
      if (path === 'assets/channels-CJn5l9_T.js') {
        assert.equal(
          output.text.split('https://static.asidehq.com/bots/').length - 1,
          4,
        );
      }
      const file = join(directory, `${files++}.mjs`);
      await writeFile(file, output.text);
      execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
      anchors += output.anchors.length;
      await assert.rejects(
        async () =>
          transformProvidedUiBoundary({ component, path, text: output.text }),
        /anchor changed/,
      );
    }
    assert.equal(files, 7);
    assert.equal(anchors, 7);
    assert.equal(replacements, 8);
    assert.equal(
      new URL('/tabs-tidy/plan', providedUiUnavailableOrigin + '/api/').origin,
      'http://127.0.0.1:9',
    );
    assert.equal(
      new URL(providedUiUnavailableOrigin + '/api/remote/hosts/id').origin,
      'http://127.0.0.1:9',
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
test('unaffected docs/legal hyperlinks, first-party samples, third-party provider links and CSS remain exact', async () => {
  const inventory = JSON.parse(
    await readFile(
      new URL(
        '../../docs/source/provided-ui-hosted-inputs.json',
        import.meta.url,
      ),
      'utf8',
    ),
  );
  assert.equal(inventory.files.length, 15);
  for (const file of inventory.files) {
    const bytes = await readFile(
      join(pins.components[file.component].inputRoot, file.path),
    );
    assert.equal(sha256(bytes), file.sourceSha256);
    for (const occurrence of file.occurrences)
      assert.equal(
        bytes
          .subarray(
            occurrence.byteOffset,
            occurrence.byteOffset + Buffer.byteLength(occurrence.literal),
          )
          .toString('utf8'),
        occurrence.literal,
      );
  }

  for (const path of [
    'assets/route-TQyeTEXE.js',
    'assets/ai-CzEX5E7S.js',
    'assets/add-on-credits-dialog-Dn5FxOyZ.js',
    'assets/artifact-test-CdjpLuI1.js',
    'assets/subscription-C_XzJh5Z.js',
    'manifest.json',
  ]) {
    const text = await readFile(
      join(pins.components.agent.inputRoot, path),
      'utf8',
    );
    assert.deepEqual(
      transformProvidedUiBoundary({ component: 'agent', path, text }),
      { text, anchors: [] },
    );
  }
  const text =
    'https://api.openai.com https://api.anthropic.com https://docs.aside.com Aside.foo';
  assert.deepEqual(
    transformProvidedUiBoundary({
      component: 'agent',
      path: 'styles.css',
      text,
    }),
    { text, anchors: [] },
  );
});
