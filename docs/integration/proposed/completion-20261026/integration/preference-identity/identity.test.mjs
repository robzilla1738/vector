import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { transformAuxPreferenceIdentity } from '../../../../../../vendor/provided/aux-password-preference-markers.mjs';
const repo = '/Users/rcourson/Documents/Vibe/web';
const originalRoot = repo + '/out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/';
test('actual paired preference writer normalizes one known block only on explicit operation', () => {
  for (const name of ['index.mjs', 'aux-native-entry.mjs']) {
    const source = readFileSync(originalRoot + name, 'utf8');
    const before = readFileSync(repo + '/out/completion-20261026-paired-source-a3/' + name, 'utf8');
    const result = transformAuxPreferenceIdentity({ text: before, source });
    const start = result.text.indexOf('function auxFindPasswordManagerMemoryBlock(');
    const end = result.text.indexOf('var PASSWORD_MANAGER_MEMORY_START', start);
    const api = runInNewContext(result.text.slice(start, end) + '\n({upsert:upsertPasswordManagerMemoryBlock,remove:removePasswordManagerMemoryBlock})');
    const legacy = '<!-- aside:password-manager-preference:start -->\nold\n<!-- aside:password-manager-preference:end -->';
    const current = '<!-- aux:password-manager-preference:v2:start -->\nnew\n<!-- aux:password-manager-preference:v2:end -->';
    const text = 'Before\n\n' + legacy + '\n\nAfter\n';
    assert.equal(api.upsert(text, current), 'Before\n\n' + current + '\n\nAfter\n\n');
    assert.equal(api.remove(text), 'Before\n\nAfter\n\n');
    assert.equal(api.remove('Before\n\n' + current + '\n\nAfter\n'), 'Before\n\nAfter\n\n');
    assert.equal(api.remove('Unrelated memory\n'), 'Unrelated memory\n');
    for (const ambiguous of [legacy + '\n' + current, legacy + '\n' + legacy, '<!-- aside:password-manager-preference:start -->\nunfinished']) {
      assert.throws(() => api.upsert(ambiguous, current), /preserved/);
      assert.throws(() => api.remove(ambiguous), /preserved/);
    }
    let reversed = result.text;
    for (const anchor of [...result.anchors].reverse()) reversed = reversed.replace(anchor.replace, () => anchor.find);
    assert.equal(reversed, before);
    assert.throws(() => transformAuxPreferenceIdentity({ text: result.text, source }), /fresh composition/);
  }
});
