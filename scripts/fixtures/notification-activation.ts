import assert from 'node:assert/strict';

const sessionId = '87ab4388-3f38-41c3-ae98-20a11c42dc2a';
const input = { accountId: 1, profileId: 'fixture-profile', browserMode: 'default', sessionId };
const profile = { ...input, isCurrent: true, isLocked: false };
const session = { id: sessionId, accountId: 1, incognito: false, browserBinding: { profileId: input.profileId, browserMode: 'default' } };
const destination = `chrome-extension://fixture/index.html#/chat/${sessionId}`;
let existing = false;
let stale = false;
let effects = 0;
Object.defineProperty(globalThis, 'chrome', { configurable: true, value: {
  extension: { inIncognitoContext: false },
  auxAccount: {
    getProfileContext: async () => ({ ...profile }),
    signDaemonAuthChallenge: async () => ({ signedChallenge: 'fixture-signature' }),
  },
  runtime: { getURL: (path: string) => `chrome-extension://fixture/${path}` },
  tabs: {
    query: async () => existing ? [{ id: 7, incognito: false, url: destination }] : [],
    get: async () => ({ id: 7, windowId: 8, incognito: false, url: stale ? 'https://changed.invalid/' : destination }),
    update: async (id: number) => { assert.equal(id, 7); effects++; },
    create: async (options: { url: string; active: boolean }) => {
      assert.deepEqual(options, { url: destination, active: true }); effects++; return { id: 9 };
    },
  },
  windows: { update: async (id: number) => { assert.equal(id, 8); effects++; } },
} });
globalThis.fetch = async (request) => {
  const url = new URL(String(request));
  assert.equal(url.origin, 'http://127.0.0.1:21520');
  if (url.pathname === '/auth/daemon/challenge') return Response.json({ challengeId: 'fixture', challenge: 'fixture' });
  if (url.pathname === '/auth/daemon/session') return Response.json({ access_token: 'fixture-token' });
  assert.equal(url.pathname, '/trpc/sessions.get');
  return Response.json({ result: { data: session } });
};
const { activateNotificationChat } = await import('../../apps/extension/src/notification-bridge.ts');
async function rejected() {
  await assert.rejects(activateNotificationChat(input));
  assert.equal(effects, 0, 'A rejected scope must not focus or create a browser target.');
}
await assert.rejects(activateNotificationChat({ ...input, browserMode: 'incognito' }));
profile.isLocked = true; await rejected(); profile.isLocked = false;
profile.isCurrent = false; await rejected(); profile.isCurrent = true;
profile.profileId = 'another-profile'; await rejected(); profile.profileId = input.profileId;
session.incognito = true; await rejected(); session.incognito = false;
session.browserBinding.profileId = 'another-profile'; await rejected(); session.browserBinding.profileId = input.profileId;
existing = true; stale = true; await rejected(); stale = false; existing = false;
assert.deepEqual(await activateNotificationChat(input), { activated: true, tabId: 9 });
assert.equal(effects, 1);
existing = true;
assert.deepEqual(await activateNotificationChat(input), { activated: true, tabId: 7 });
assert.equal(effects, 3);
console.log('Notification activation scope, stale-target rejection, create and focus fixtures passed.');
