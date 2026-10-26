import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
import { transformAuxFinalRuntimeIdentity } from './aux-final-runtime-identity.mjs';
import { upgradeCloudTransfers } from '../../docs/integration/proposed/completion-20261026/integration/transform.mjs';

const root = '/Users/rcourson/Documents/Vibe/web/out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux';
const daemon = join(root, 'apps/daemon/Aux Daemon.app/Contents/Resources/node-development');
const count = (text, token) => text.split(token).length - 1;

test('both current daemon leaves compose after cloud binding and preserve persisted/native/HTML contracts', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'aux-final-runtime-identity-'));
  try {
    for (const file of ['index.mjs', 'aux-native-entry.mjs']) {
      const source = readFileSync(join(daemon, file), 'utf8');
      const cloud = upgradeCloudTransfers(source).text;
      const result = transformAuxFinalRuntimeIdentity({ component: 'daemon', path: file, text: cloud });
      const beforeCloud = transformAuxFinalRuntimeIdentity({ component: 'daemon', path: file, text: source });
      assert.equal(result.anchors.length, 28);
      for (const token of ['asideCode', 'aside_suspension', 'aside:worker:', 'aside.dk.', 'EMBEDDED_BINDING_ASSET=`aside-native.node`', 'case`article`:case`aside`', 'generatedAlwaysAsIdentity', 'PASSWORD_MANAGER_MEMORY_START'])
        assert.equal(count(result.text, token), count(source, token), token);
      assert.equal(count(result.text, 'init_aside'), 0);
      assert.equal(count(result.text, 'init_aux'), 15);
      assert.equal(count(beforeCloud.text, 'init_aux'), 15);
      assert.equal(count(result.text, 'auxComponentVersion'), 2);
      const functionText = result.text.match(/function isAuxDaemonCommand\(Cn\)\{return\/aux\[- \]\?daemon\/i\.test\(Cn\)\}/)?.[0];
      assert.ok(functionText);
      const context = vm.createContext({});
      new vm.Script(functionText).runInContext(context);
      assert.equal(context.isAuxDaemonCommand('/private/disposable/Aux Daemon.app/Contents/MacOS/aux-daemon'), true);
      assert.equal(context.isAuxDaemonCommand('/Applications/Aside.app/Contents/MacOS/aside-daemon'), false);
      assert.throws(() => transformAuxFinalRuntimeIdentity({ component: 'daemon', text: result.text }), /pinned/);
      assert.throws(() => transformAuxFinalRuntimeIdentity({ component: 'daemon', text: cloud + '\nconst init_auxExisting = 1;', source: cloud }), /collide/);
      const output = join(temporary, file);
      writeFileSync(output, result.text);
      execFileSync(process.execPath, ['--check', output]);
    }
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});

test('feedback UI producer pairs with both daemon fields without changing classes or semantic aside tags', () => {
  const path = 'assets/session-feedback-dialog-BjDg0W8m.js';
  const source = readFileSync(join(root, 'apps/extension/dist', path), 'utf8');
  const result = transformAuxFinalRuntimeIdentity({ component: 'agent', path, text: source });
  assert.equal(result.anchors.length, 1);
  assert.equal(count(result.text, 'asideComponentVersion'), 0);
  assert.equal(count(result.text, 'auxComponentVersion'), 1);
  assert.deepEqual([...result.text.matchAll(/className:"([^"]+)"/g)].map(match => match[1]), [...source.matchAll(/className:"([^"]+)"/g)].map(match => match[1]));
  execFileSync(process.execPath, ['--check', '--input-type=module'], { input: result.text });
  assert.throws(() => transformAuxFinalRuntimeIdentity({ component: 'agent', path, text: source.replace('asideComponentVersion', 'unknownComponentVersion') }), /pinned/);
});
