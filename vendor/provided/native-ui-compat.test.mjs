import assert from 'node:assert/strict';
import { test } from 'node:test';
import { transformProvidedNativeUi } from './native-ui-compat.mjs';

function replay(input, anchors) {
  return anchors.reduce((text, anchor) => {
    assert.equal(text.split(anchor.find).length - 1, anchor.count);
    return text.split(anchor.find).join(anchor.replace);
  }, input);
}
test('every native and isolation edit is replayable; HTML/CSS geometry and third-party IDs survive', () => {
  const input = '<aside style="width:600px;font-size:11.2px">Aside. Following</aside> chrome.asideAccount.getProfileContext(); "at.studio.Aside.ext.private.account" "at.studio.Aside.blink.expose-wv" "Aside.listTabs" "http://127.0.0.1:21420" "21420" "eiaeiblijfjekdanodkjadfinkhbfgcd"';
  const result = transformProvidedNativeUi({ component: 'agent', path: 'fixture.html', text: input });
  assert.equal(result.text, replay(input, result.anchors));
  assert.match(result.text, /chrome\.auxAccount/);
  assert.match(result.text, /"Aside.listTabs"/);
  assert.match(result.text, /21520/);
  assert.match(result.text, /"21420"/);
  assert.match(result.text, /<aside style="width:600px;font-size:11.2px">Aside\. Following<\/aside>/);
  assert.match(result.text, /dev\.aux\.blink\.expose-wv/);
  assert.match(result.text, /eiaeiblijfjekdanodkjadfinkhbfgcd/);
});
test('page actor sender/receiver identities move together without changing profile wire schema', () => {
  const input = '"aside:google-docs-selection-request" "data-aside-react-grab-target" asideUserId __asideGoogleDocsSelectionBridgeInstalled document.createElement(`aside-${e}`)';
  const result = transformProvidedNativeUi({ component: 'vault', path: 'content.js', text: input });
  assert.equal(result.text, replay(input, result.anchors));
  assert.match(result.text, /aux:google-docs-selection-request/);
  assert.match(result.text, /data-aux-react-grab-target/);
  assert.match(result.text, /asideUserId/);
  assert.match(result.text, /createElement\(`aside-/);
});
