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

test('native permission identity changes are distinct from quoted command wire names', () => {
  const original = '"at.studio.Aside.blink.expose-wv" "Aside.controlTab"';
  const branded = '"dev.aux.blink.expose-wv" "Aux.controlTab"';
  assert.equal(restoreProvidedWireNames(original, branded).text, '"dev.aux.blink.expose-wv" "Aside.controlTab"');
});

test('new reviewed integration commands retain their protocol names through UI branding',()=>{
  const integrated='Welcome to Aside. "Aside.listTabs" "Aside.getCookieSyncContext" "Aside.restoreCookieSnapshot"';
  const result=restoreProvidedWireNames(integrated,integrated.replaceAll('Aside','Aux'));
  assert.equal(result.text,integrated.replace('Welcome to Aside.','Welcome to Aux.'));
  assert.equal(result.text.includes('Aux.restoreCookieSnapshot'),false);
});
