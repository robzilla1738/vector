import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { VaultItem } from '../src/client';
import {
  createInlineAutofill,
  type InlineTarget,
} from '../src/inline-autofill';

function fixture() {
  let locked = false,
    current = true,
    profileId = 'fixture-profile',
    verifications = 0,
    secretReads = 0,
    fills = 0;
  let afterRead: (() => void) | undefined;
  const scope = {
    accountId: 0,
    profile: {
      accountId: 0,
      profileId,
      browserMode: 'default' as const,
      isCurrent: true,
      isLocked: false,
    },
  };
  const target: InlineTarget = {
    tabId: 2,
    frameId: 3,
    documentId: 'fixture-document',
    documentUrl: 'https://example.com/login',
    topLevelUrl: 'https://example.com/',
    createdAt: Date.now(),
  };
  const item = {
    id: 'fixture-item',
    revision: 1,
    state: 'active',
    category: 'login',
    reprompt: false,
    urls: ['https://example.com/login'],
    loginFields: {
      username: 'fixture-user',
      password: 'synthetic-not-a-credential',
    },
    sections: [],
  } as VaultItem;
  const service = createInlineAutofill({
    incognito: false,
    resolveAccount: async () => ({
      ...scope,
      profile: {
        ...scope.profile,
        profileId,
        isCurrent: current,
        isLocked: locked,
      },
    }),
    rpc: async <T>(method: string) => {
      if (method === 'settings.get') return 'light' as T;
      if (method === 'passwordManager.auth.status') return { locked } as T;
      if (method === 'vault.getAutofillCandidates')
        return {
          items: [
            {
              id: item.id,
              title: 'Fixture login',
              username: 'fixture-user',
              revision: item.revision,
              reprompt: item.reprompt,
              password: 'must-not-cross-metadata-boundary',
            },
          ],
        } as T;
      if (method === 'vault.getItem') {
        secretReads++;
        afterRead?.();
        return item as T;
      }
      throw new Error('Unknown fixture RPC');
    },
    live: async () => {},
    openPopup: async () => {},
    send: async <T>(_target, message) => {
      if (message.type === 'aux.vault.context')
        return {
          contextToken: 'fixture-context',
          documentUrl: target.documentUrl,
          category: 'login',
          fields: [
            { key: 'username', label: 'Username' },
            { key: 'password', label: 'Password' },
          ],
        } as T;
      if (message.type === 'aux.vault.verify') {
        verifications++;
        return true as T;
      }
      if (message.type === 'aux.vault.fill') {
        fills++;
        return { filled: true, fieldCount: 2 } as T;
      }
      throw new Error('Unexpected fixture content message');
    },
  });
  return {
    service,
    target,
    item,
    get secretReads() {
      return secretReads;
    },
    get fills() {
      return fills;
    },
    get verifications() {
      return verifications;
    },
    set locked(value: boolean) {
      locked = value;
    },
    set current(value: boolean) {
      current = value;
    },
    set profileId(value: string) {
      profileId = value;
    },
    set afterRead(value: () => void) {
      afterRead = value;
    },
  };
}
test('inline list is metadata-only; exact item/fields consent is one-use and cross-frame rejected', async () => {
  const f = fixture();
  const reply = await f.service.handle(
    { type: 'aux.vault.inline.list' },
    f.target,
  );
  assert.equal(f.secretReads, 0);
  assert.equal(JSON.stringify(reply).includes('must-not-cross'), false);
  await assert.rejects(
    f.service.handle(
      {
        type: 'aux.vault.inline.fill',
        requestToken: 'fixture-context',
        itemId: f.item.id,
        selectedFields: ['password'],
      },
      { ...f.target, frameId: 4 },
    ),
    /document changed/,
  );
  await assert.rejects(
    f.service.handle(
      {
        type: 'aux.vault.inline.fill',
        requestToken: 'fixture-context',
        itemId: f.item.id,
        selectedFields: ['cc-number'],
      },
      f.target,
    ),
    /exact login fields/,
  );
  assert.equal(f.secretReads, 0);
  assert.deepEqual(
    await f.service.handle(
      {
        type: 'aux.vault.inline.fill',
        requestToken: 'fixture-context',
        itemId: f.item.id,
        selectedFields: ['password'],
      },
      f.target,
    ),
    { filled: true, fieldCount: 2 },
  );
  assert.equal(f.secretReads, 1);
  assert.equal(f.fills, 1);
  await assert.rejects(
    f.service.handle(
      {
        type: 'aux.vault.inline.fill',
        requestToken: 'fixture-context',
        itemId: f.item.id,
        selectedFields: ['password'],
      },
      f.target,
    ),
    /expired/,
  );
});
test('locked resume retains exact pending target, reprompt stays disabled and account/profile changes fail closed', async () => {
  const f = fixture();
  f.locked = true;
  assert.equal(
    (
      (await f.service.handle({ type: 'aux.vault.inline.list' }, f.target)) as {
        state: string;
      }
    ).state,
    'locked',
  );
  assert.equal(f.secretReads, 0);
  f.locked = false;
  assert.equal(
    (
      (await f.service.handle(
        { type: 'aux.vault.inline.refresh', requestToken: 'fixture-context' },
        f.target,
      )) as { state: string }
    ).state,
    'ready',
  );
  f.item.reprompt = true;
  await assert.rejects(
    f.service.handle(
      {
        type: 'aux.vault.inline.fill',
        requestToken: 'fixture-context',
        itemId: f.item.id,
        selectedFields: ['password'],
      },
      f.target,
    ),
    /fresh password prompt/,
  );
  assert.equal(f.fills, 0);
  await f.service.handle({ type: 'aux.vault.inline.list' }, f.target);
  f.profileId = 'different-profile';
  await assert.rejects(
    f.service.handle(
      { type: 'aux.vault.inline.refresh', requestToken: 'fixture-context' },
      f.target,
    ),
    /profile or account changed/,
  );
});
test('lock after secret acquisition discards actuation and stale/unknown native proof cannot list', async () => {
  const f = fixture();
  f.current = false;
  await assert.rejects(
    f.service.handle({ type: 'aux.vault.inline.list' }, f.target),
    /current Aux profile/,
  );
  f.current = true;
  await f.service.handle({ type: 'aux.vault.inline.list' }, f.target);
  f.afterRead = () => {
    f.locked = true;
  };
  await assert.rejects(
    f.service.handle(
      {
        type: 'aux.vault.inline.fill',
        requestToken: 'fixture-context',
        itemId: f.item.id,
        selectedFields: ['password'],
      },
      f.target,
    ),
    /locked before filling/,
  );
  assert.equal(f.fills, 0);
});

test('dismissal while a secret read completes cancels future actuation', async () => {
  const f = fixture();
  await f.service.handle({ type: 'aux.vault.inline.list' }, f.target);
  f.afterRead = () => f.service.clear();
  await assert.rejects(
    f.service.handle(
      {
        type: 'aux.vault.inline.fill',
        requestToken: 'fixture-context',
        itemId: f.item.id,
        selectedFields: ['password'],
      },
      f.target,
    ),
    /dismissed or superseded/,
  );
  assert.equal(f.fills, 0);
});
