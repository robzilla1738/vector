import assert from 'node:assert/strict';
const profile = { accountId: 1, profileId: 'fixture-profile', browserMode: 'default', isCurrent: true, isLocked: false };
const scope = { accountId: 1, profileId: profile.profileId, browserMode: 'default', targetId: 'fixture-target', documentId: 'frame:loader', documentUrl: 'https://example.com/' };
let loader = 'loader', effects = 0, lastClip: unknown, beyond: unknown;
Object.defineProperty(globalThis, 'chrome', { configurable: true, value: {
  extension: { inIncognitoContext: false },
  auxAccount: { getProfileContext: async () => ({ ...profile }), signDaemonAuthChallenge: async () => ({ signedChallenge: 'fixture-signature' }) },
  tabs: { get: async () => ({ id: 7, incognito: false, url: scope.documentUrl }), onRemoved: { addListener() {} }, onUpdated: { addListener() {} } },
  runtime: { id: 'fixture-extension', onMessage: { addListener() {} } },
  debugger: {
    getTargets: async () => [{ id: scope.targetId, tabId: 7 }],
    sendCommand: async (_source: unknown, method: string, params: Record<string, unknown>) => {
      if (method === 'Page.getFrameTree') return { frameTree: { frame: { id: 'frame', loaderId: loader, url: scope.documentUrl } } };
      if (method === 'Page.getLayoutMetrics') return { cssContentSize: { x: 0, y: 0, width: 800, height: 2400 }, cssVisualViewport: { pageX: 0, pageY: 100, clientWidth: 800, clientHeight: 600 } };
      assert.equal(method, 'Page.captureScreenshot'); effects++; lastClip = params.clip; beyond = params.captureBeyondViewport; return { data: 'fixture-png' };
    },
  },
} });
globalThis.fetch = async request => {
  const url = new URL(String(request));
  assert.equal(url.origin, 'http://127.0.0.1:21520');
  if (url.pathname === '/auth/daemon/challenge') return Response.json({ challengeId: 'fixture', challenge: 'fixture' });
  if (url.pathname === '/auth/daemon/session') return Response.json({ access_token: 'fixture-token' });
  assert.equal(url.pathname, '/trpc/accounts.resolveProfileAccount');
  return Response.json({ result: { data: { id: 1, name: 'Fixture' } } });
};
const { createCaptureBackground } = await import('../../apps/extension/src/capture-background.ts');
const capture = createCaptureBackground(async () => {});
const page = capture.handlers['capture.page']!;
await page({ ...scope, mode: 'fullPage' });
assert.deepEqual(lastClip, { x: 0, y: 0, width: 800, height: 2400, scale: 1 }); assert.equal(beyond, true);
await page({ ...scope, mode: 'viewport' });
assert.deepEqual(lastClip, { x: 0, y: 100, width: 800, height: 600, scale: 1 }); assert.equal(beyond, false);
await page({ ...scope, mode: 'region', region: { x: 20, y: 30, width: 120, height: 80 } });
assert.deepEqual(lastClip, { x: 20, y: 130, width: 120, height: 80, scale: 1 });
const validEffects = effects;
await assert.rejects(page({ ...scope, mode: 'region', region: { x: 790, y: 0, width: 100, height: 80 } }));
loader = 'navigated'; await assert.rejects(page({ ...scope, mode: 'fullPage' })); loader = 'loader';
profile.isLocked = true; await assert.rejects(page({ ...scope, mode: 'fullPage' })); profile.isLocked = false;
await assert.rejects(page({ ...scope, browserMode: 'incognito', mode: 'fullPage' }));
await assert.rejects(page({ ...scope, profileId: 'foreign', mode: 'fullPage' }));
assert.equal(effects, validEffects);
console.log('Synthetic capture scope, full-page/viewport/region geometry and stale-document refusal passed; no browser, desktop or clipboard accessed.');
