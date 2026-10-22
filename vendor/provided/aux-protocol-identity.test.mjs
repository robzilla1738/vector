import assert from 'node:assert/strict';
import test from 'node:test';
import { AUX_PROTOCOL_NAMES, renameAuxProtocolNames } from './aux-protocol-identity.mjs';

test('coordinated protocol rename replays exact anchors and authenticates the complete Aux challenge domain', () => {
  const input = Object.keys(AUX_PROTOCOL_NAMES).join('|') + '|"Aside.getTabs"|<aside></aside>|aside.dk.wrap';
  const counts = Object.fromEntries(Object.keys(AUX_PROTOCOL_NAMES).map(name => [name, input.split(name).length - 1]));
  const result = renameAuxProtocolNames(input, counts);
  let replay = input;
  for (const anchor of result.anchors) {
    assert.equal(replay.split(anchor.find).length - 1, anchor.count);
    replay = replay.split(anchor.find).join(anchor.replace);
  }
  assert.equal(result.text, replay);
  assert.ok(result.text.includes('"Aux.getTabs"'));
  assert.ok(result.text.includes('<aside></aside>|aside.dk.wrap'));
  assert.equal(Buffer.byteLength(AUX_PROTOCOL_NAMES['Aside Daemon Auth v1'] + '\0'), 19);
  assert.equal(Buffer.byteLength(AUX_PROTOCOL_NAMES['Aside Daemon Dev Auth v1'] + '\0'), 23);
  assert.throws(() => renameAuxProtocolNames(input + 'Aside.getTab', counts), /drift/);
  assert.throws(() => renameAuxProtocolNames(input, {}), /drift/);
  assert.throws(() => renameAuxProtocolNames(input + '|AuxSessionToken', counts), /Mixed/);
});
