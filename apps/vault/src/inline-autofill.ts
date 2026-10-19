/** vault.md Generator/autofill: metadata before choice, exact-target actuation after choice. */
import {
  type FieldKey,
  fillValues,
  type PageFillContext,
} from './autofill-protocol';
import type { VaultItem } from './client';

export type InlineTarget = {
  tabId: number;
  frameId: number;
  documentId: string;
  documentUrl: string;
  topLevelUrl: string;
  createdAt: number;
};
export type InlineCandidate = {
  id: string;
  title: string;
  username: string;
  revision: number;
  reprompt: boolean;
};
export type InlineReply = {
  state: 'ready' | 'locked';
  theme: 'light' | 'dark' | 'system';
  requestToken: string;
  documentUrl: string;
  fields: { key: FieldKey; label: string }[];
  items?: InlineCandidate[];
};
type Scope = {
  accountId: number;
  profileId: string;
  browserMode: 'default' | 'incognito';
};
type Request = {
  type?: string;
  requestToken?: string;
  itemId?: string;
  selectedFields?: FieldKey[];
};
type Intent = InlineTarget & {
  scope: Scope;
  context: PageFillContext;
  items: InlineCandidate[];
  locked: boolean;
  theme: InlineReply['theme'];
  filling?: boolean;
};
type Dependencies = {
  incognito: boolean;
  resolveAccount: () => Promise<{
    accountId: number;
    profile: {
      profileId: string;
      accountId?: number;
      browserMode?: 'default' | 'incognito';
      isCurrent?: boolean;
      isLocked?: boolean;
    };
  }>;
  rpc: <T>(
    path: string,
    input: Record<string, unknown>,
    mutation?: boolean,
  ) => Promise<T>;
  send: <T>(
    target: InlineTarget,
    message: Record<string, unknown>,
  ) => Promise<T>;
  live: (target: InlineTarget) => Promise<void>;
  openPopup: () => Promise<void>;
};
export function createInlineAutofill(dependencies: Dependencies) {
  const intents = new Map<string, Intent>();
  async function security(
    expected?: Scope,
  ): Promise<{ scope: Scope; locked: boolean }> {
    const account = await dependencies.resolveAccount(),
      profile = account.profile;
    const mode = dependencies.incognito ? 'incognito' : 'default';
    if (
      !profile.profileId ||
      profile.isCurrent !== true ||
      profile.browserMode !== mode ||
      profile.accountId !== account.accountId ||
      (expected &&
        (expected.accountId !== account.accountId ||
          expected.profileId !== profile.profileId ||
          expected.browserMode !== mode))
    )
      throw new Error(
        'The current Aux profile or account changed. Select the form again.',
      );
    const status = await dependencies.rpc<{ locked: boolean }>(
      'passwordManager.auth.status',
      { accountId: account.accountId },
    );
    const after = await dependencies.resolveAccount();
    if (
      after.accountId !== account.accountId ||
      after.profile.profileId !== profile.profileId ||
      after.profile.browserMode !== mode ||
      after.profile.isCurrent !== true ||
      after.profile.accountId !== account.accountId
    )
      throw new Error(
        'The current Aux profile or account changed. Select the form again.',
      );
    return {
      scope: {
        accountId: account.accountId,
        profileId: profile.profileId,
        browserMode: mode,
      },
      locked: status.locked || after.profile.isLocked !== false,
    };
  }
  function prune() {
    for (const [token, target] of intents)
      if (Date.now() - target.createdAt >= 120000) intents.delete(token);
  }
  function targetFor(request: Request, sender: InlineTarget) {
    prune();
    const target =
      typeof request.requestToken === 'string'
        ? intents.get(request.requestToken)
        : undefined;
    if (
      !target ||
      target.tabId !== sender.tabId ||
      target.frameId !== sender.frameId ||
      target.documentId !== sender.documentId ||
      target.documentUrl !== sender.documentUrl
    )
      throw new Error(
        'This inline request expired or its document changed. Select the form again.',
      );
    return target;
  }
  function requireIntent(target: Intent) {
    if (intents.get(target.context.contextToken) !== target)
      throw new Error(
        'This inline request was dismissed or superseded. Select the form again.',
      );
  }
  async function verify(target: Intent) {
    requireIntent(target);
    await dependencies.live(target);
    await dependencies.send(target, {
      type: 'aux.vault.verify',
      contextToken: target.context.contextToken,
      documentUrl: target.documentUrl,
    });
    requireIntent(target);
  }
  const reply = (target: Intent, items?: InlineCandidate[]): InlineReply => ({
    state: target.locked ? 'locked' : 'ready',
    theme: target.theme,
    requestToken: target.context.contextToken,
    documentUrl: target.documentUrl,
    fields: target.context.fields,
    ...(items ? { items } : {}),
  });
  async function candidates(target: Intent) {
    await verify(target);
    const before = await security(target.scope);
    if (before.locked) {
      target.locked = true;
      target.items = [];
      return reply(target, []);
    }
    const metadata = await dependencies.rpc<{ items: InlineCandidate[] }>(
      'vault.getAutofillCandidates',
      { accountId: target.scope.accountId, documentUrl: target.documentUrl },
    );
    await verify(target);
    const after = await security(target.scope);
    if (after.locked) {
      target.locked = true;
      target.items = [];
      return reply(target, []);
    }
    if (
      !Array.isArray(metadata.items) ||
      metadata.items.length > 100 ||
      metadata.items.some(
        (item) =>
          typeof item.id !== 'string' ||
          typeof item.title !== 'string' ||
          typeof item.username !== 'string' ||
          typeof item.reprompt !== 'boolean' ||
          !Number.isInteger(item.revision) ||
          item.revision < 1,
      )
    )
      throw new Error('The Vault returned an invalid suggestion list.');
    requireIntent(target);
    // Retain only explicitly permitted metadata, even if a future API adds fields.
    target.items = metadata.items.map(
      ({ id, title, username, revision, reprompt }) => ({
        id,
        title,
        username,
        revision,
        reprompt,
      }),
    );
    target.locked = false;
    return reply(target, target.items);
  }
  function clear(tabId?: number) {
    for (const [token, target] of intents)
      if (tabId === undefined || target.tabId === tabId) intents.delete(token);
  }
  return {
    clear,
    async handle(request: Request, sender: InlineTarget) {
      prune();
      if (request.type === 'aux.vault.inline.list') {
        const account = await security();
        await dependencies.live(sender);
        const context = await dependencies.send<PageFillContext>(sender, {
          type: 'aux.vault.context',
        });
        if (
          context.documentUrl !== sender.documentUrl ||
          context.category !== 'login' ||
          typeof context.contextToken !== 'string' ||
          !context.contextToken ||
          context.contextToken.length > 100 ||
          !context.fields.length ||
          context.fields.length > 2 ||
          context.fields.some(
            (field) => !['username', 'password'].includes(field.key),
          )
        )
          throw new Error(
            'Inline suggestions support the selected login form. Use Vault for cards and identities.',
          );
        const theme = await dependencies.rpc<unknown>('settings.get', {
          accountId: account.scope.accountId,
          key: 'theme',
        });
        const after = await security(account.scope);
        clear(sender.tabId);
        if (intents.size >= 64)
          throw new Error('Too many inline requests. Close another form menu.');
        const target: Intent = {
          ...sender,
          scope: account.scope,
          context,
          items: [],
          theme: theme === 'light' || theme === 'dark' ? theme : 'system',
          locked: after.locked,
        };
        intents.set(context.contextToken, target);
        return candidates(target);
      }
      const target = targetFor(request, sender);
      if (request.type === 'aux.vault.inline.dismiss') {
        intents.delete(target.context.contextToken);
        return { dismissed: true };
      }
      if (request.type === 'aux.vault.inline.refresh') {
        const status = await security(target.scope);
        await verify(target);
        if (status.locked) {
          target.locked = true;
          target.items = [];
          return reply(target, []);
        }
        if (target.locked) return candidates(target);
        return reply(target);
      }
      if (request.type === 'aux.vault.inline.unlock') {
        await security(target.scope);
        await verify(target);
        await dependencies.openPopup();
        return { opened: true };
      }
      if (request.type !== 'aux.vault.inline.fill')
        throw new Error('Unknown inline Vault action.');
      const candidate = target.items.find((item) => item.id === request.itemId);
      if (!candidate || candidate.reprompt || target.locked)
        throw new Error(
          'Choose an available matching login after unlocking Vault.',
        );
      const keys = request.selectedFields;
      if (
        !Array.isArray(keys) ||
        !keys.length ||
        keys.length > 2 ||
        new Set(keys).size !== keys.length ||
        keys.some(
          (key) => !target.context.fields.some((field) => field.key === key),
        )
      )
        throw new Error('Choose the exact login fields you want to fill.');
      if (target.filling) throw new Error('This fill is already in progress.');
      target.filling = true;
      try {
        await verify(target);
        if ((await security(target.scope)).locked)
          throw new Error('Unlock Vault before filling.');
        requireIntent(target);
        const item = await dependencies.rpc<VaultItem>('vault.getItem', {
          accountId: target.scope.accountId,
          itemId: candidate.id,
        });
        if (
          item.id !== candidate.id ||
          item.revision !== candidate.revision ||
          !item.urls.some(
            (url) => new URL(url).origin === new URL(target.documentUrl).origin,
          )
        )
          throw new Error(
            'This saved login changed or no longer matches. Open suggestions again.',
          );
        const values = fillValues(item, 'login', keys);
        await verify(target);
        await dependencies.live(target);
        if ((await security(target.scope)).locked)
          throw new Error('Vault locked before filling.');
        requireIntent(target);
        return await dependencies.send<{ filled: boolean; fieldCount: number }>(
          target,
          {
            type: 'aux.vault.fill',
            contextToken: target.context.contextToken,
            documentUrl: target.documentUrl,
            values,
          },
        );
      } finally {
        intents.delete(target.context.contextToken);
      }
    },
  };
}
