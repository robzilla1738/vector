import assert from 'node:assert/strict';
import test from 'node:test';
import { ManagedChromiumDriver } from '../packages/chromium-driver/dist/managed-chromium.js';

test('managed CDP rejects foreign markers and revoked native tabs before connecting', async () => {
  let pages = [{ pageId: 'aux-page', marker: 'atab-aux-page', cdpTargetId: 'native-target' }];
  let connections = 0;
  const driver = new ManagedChromiumDriver('http://127.0.0.1:1', {
    trustedPages: async () => pages,
    connectOverCDP: async () => { connections++; throw new Error('unexpected CDP connection'); },
  });

  await assert.rejects(driver.attach('atab-foreign', 'foreign-page', { cdpTargetId: 'native-target' }), /no longer owned by Aux/);
  await assert.rejects(driver.recoverPage('atab-foreign', 'foreign-page'), /no longer owned by Aux/);
  driver.jsonTargets = async () => [{ id: 'foreign-target', type: 'page', url: 'about:blank', title: 'foreign', webSocketDebuggerUrl: 'ws://127.0.0.1:1/foreign' }];
  assert.equal(await driver.attachDirect('atab-aux-page', 'aux-page'), null);
  assert.equal(connections, 0, 'direct fallback must not connect to an unregistered target');
  pages = [];
  await assert.rejects(driver.attach('atab-aux-page', 'aux-page', { cdpTargetId: 'native-target' }), /no longer owned by Aux/);
  await assert.rejects(driver.recoverPage('atab-aux-page', 'aux-page'), /no longer owned by Aux/);
  assert.equal(connections, 0);
});

test('internal broker capability is removed from connection failures', async () => {
  const secret = 'one-time-generation-capability';
  const driver = new ManagedChromiumDriver(`ws://127.0.0.1:1/aux-cdp/${secret}`, {
    connectOverCDP: async endpoint => { throw new Error(`Failed to connect to ${endpoint}`); },
  });
  await assert.rejects(driver.connect(), error => {
    assert.match(error.message, /Internal browser connection failed/);
    assert.equal(error.message.includes(secret), false);
    return true;
  });
});

test('native internal pages fail immediately without a CDP attachment', async () => {
  let connections = 0;
  const driver = new ManagedChromiumDriver('ws+unix:///tmp/fixture.sock', {
    trustedPages: async () => [{ pageId: 'internal', marker: 'atab-internal', url: 'chrome://newtab/', cdpTargetId: 'internal-target' }],
    connectOverCDP: async () => { connections++; throw new Error('unexpected CDP connection'); },
  });
  await assert.rejects(driver.attach('atab-internal', 'internal'), { code: 'permission_denied' });
  await assert.rejects(driver.recoverPage('atab-internal', 'internal'), { code: 'permission_denied' });
  assert.equal(await driver.attachDirect('atab-internal', 'internal'), null);
  assert.equal(connections, 0);
});

test('native recovery reuses its authenticated broker connection', async () => {
  let connections = 0;
  const driver = new ManagedChromiumDriver('ws+unix:///tmp/fixture.sock', {
    trustedPages: async () => [{ pageId: 'page', marker: 'atab-page', url: 'https://fixture.test/', cdpTargetId: 'native-target' }],
    connectOverCDP: async () => { connections++; throw new Error('unexpected CDP connection'); },
  });
  const recovered = {};
  driver.attach = async (marker, pageId, hint) => {
    assert.equal(marker, 'atab-page');
    assert.equal(pageId, 'page');
    assert.equal(hint.initialDocumentEpoch, 8);
    return recovered;
  };
  assert.equal(await driver.recoverPage('atab-page', 'page', 8), recovered);
  assert.equal(connections, 0);
});
