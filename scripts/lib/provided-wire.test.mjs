import assert from 'node:assert/strict';
import test from 'node:test';
import { restoreProvidedWireNames } from './provided-wire.mjs';

test('wire methods, prefix dispatch and authentication retain original bytes while visible prose uses Aux', () => {
  const original = 'Welcome to Aside. "Aside.getTab" "Aside.getTabs" `Aside.` AsideDaemonSessionToken AsideSessionToken Aside Daemon Auth v1\\0 Aside Daemon Dev Auth v1';
  const branded = original.replaceAll('Aside', 'Aux');
  const result = restoreProvidedWireNames(original, branded);
  assert.equal(result.text, original.replace('Welcome to Aside.', 'Welcome to Aux.'));
  let replayed = branded;
  for (const anchor of result.anchors) {
    assert.equal(replayed.split(anchor.find).length - 1, anchor.count);
    replayed = replayed.split(anchor.find).join(anchor.replace);
  }
  assert.equal(replayed, result.text);
  assert.throws(() => restoreProvidedWireNames(original, branded + ' Aux.getTab'), /drift/);
});
