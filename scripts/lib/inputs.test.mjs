import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inputs, inputPath, requireInput } from './inputs.mjs';
import { repoRoot } from './repo-root.mjs';

test('every input names a repository-relative path under out/ and how to restore it', () => {
  for (const [name, spec] of Object.entries(inputs)) {
    if (name.startsWith('_')) continue;
    assert.match(spec.path, /^out\/[^/]/, name);
    assert.ok(spec.backup, name);
    assert.equal(inputPath(name, undefined).startsWith(repoRoot) || spec.env?.some(key => process.env[key]), true, name);
  }
});

test('a missing input fails with its name, path and restore hint instead of skipping', async () => {
  const empty = await mkdtemp(join(tmpdir(), 'aux-inputs-'));
  try {
    assert.throws(() => requireInput('frozenSnapshot', join(empty, 'absent')),
      error => error.message.includes('"frozenSnapshot"') && error.message.includes(join(empty, 'absent')) && error.message.includes('docs/backup/2026-10-27.md'));
    assert.equal(requireInput('frozenSnapshot', empty), empty);
    assert.throws(() => inputPath('noSuchInput'), /Unknown input/);
  } finally {
    await rm(empty, { recursive: true });
  }
});

test('an env override replaces the default path', () => {
  const previous = process.env.AUX_PROVIDED_AGENT_ASSETS;
  process.env.AUX_PROVIDED_AGENT_ASSETS = '/nonexistent/aux-assets';
  try {
    assert.equal(inputPath('frozenAgentAssets'), '/nonexistent/aux-assets');
    assert.throws(() => requireInput('frozenAgentAssets'), /AUX_PROVIDED_AGENT_ASSETS/);
  } finally {
    if (previous === undefined) delete process.env.AUX_PROVIDED_AGENT_ASSETS;
    else process.env.AUX_PROVIDED_AGENT_ASSETS = previous;
  }
});
