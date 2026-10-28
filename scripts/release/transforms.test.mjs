// Host-only: runs transforms.mjs on a minimal staged app holding only the candidate files it touches.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import test from 'node:test';
import {requireInput} from '../lib/inputs.mjs';
import {repoRoot} from '../lib/repo-root.mjs';
import {RUNTIME_FILES} from '../../vendor/provided/provider-cli/integration.mjs';

const candidate = requireInput('candidateApp');
const daemon = 'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development';
const touched = [`${daemon}/aux-native-entry.mjs`, 'Contents/Resources/aux/apps/extension/dist/assets/strip-markdown-DRcmtuJc.js',
  'Contents/Resources/aux/apps/extension/dist/assets/connect-dialog-CacgpFap.js'];
const scratch = mkdtempSync(path.join(tmpdir(), 'aux-release-transforms-'));
test.after(() => rmSync(scratch, {recursive: true, force: true}));
const app = path.join(scratch, 'Aux.app');
for (const relative of touched) {
  mkdirSync(path.dirname(path.join(app, relative)), {recursive: true});
  copyFileSync(path.join(candidate, relative), path.join(app, relative));
}
const transform = () => spawnSync(process.execPath, [path.join(repoRoot, 'scripts/release/transforms.mjs'), app], {encoding: 'utf8'});

test('transforms.mjs adds the provider CLI runtime and applies every transform once', async () => {
  const result = transform();
  assert.equal(result.status, 0, result.stderr);
  const applied = JSON.parse(result.stdout);
  assert.deepEqual(applied.filter(entry => entry.added).map(entry => path.basename(entry.path)), RUNTIME_FILES);
  assert.deepEqual(applied.filter(entry => !entry.added).map(entry => entry.path), touched);
  for (const file of RUNTIME_FILES) {
    assert.deepEqual(readFileSync(path.join(app, daemon, 'provider-cli', file)), readFileSync(path.join(repoRoot, 'vendor/provided/provider-cli', file)), file);
  }
  for (const relative of touched) assert.equal(spawnSync(process.execPath, ['--check', path.join(app, relative)]).status, 0, relative);
  // The composed entry loads the module by this URL; it resolves to the staged copy and imports cleanly.
  const entry = path.join(app, daemon, 'aux-native-entry.mjs');
  assert.ok(readFileSync(entry, 'utf8').includes('await import(new URL("./provider-cli/aux-daemon.mjs",import.meta.url))'));
  const staged = await import(new URL('./provider-cli/aux-daemon.mjs', pathToFileURL(entry)).href);
  const instance = staged.createAuxProviderCli({detect: async () => ({directories: [], providers: []})});
  assert.equal((await instance.status()).rows['claude-code'].state, 'not-installed');
});

test('a second run stops: the runtime files already exist', () => {
  const result = transform();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /already exists/);
});
