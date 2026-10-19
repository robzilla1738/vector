import {
  type FieldKey,
  fillValues,
  type PageFillContext,
  type SaveSuggestion,
} from './autofill-protocol';
import type { VaultItem } from './client';
import { resolveAccount, rpc } from './client';
import { installPasskeyLifecycle } from './passkeys/lifecycle';

installPasskeyLifecycle(rpc, resolveAccount);

type Target = {
  tabId: number;
  frameId: number;
  documentId: string;
  documentUrl: string;
  topLevelUrl: string;
  createdAt: number;
};
type Request = {
  type?: string;
  contextToken?: string;
  itemId?: string;
  accountId?: number;
  selectedFields?: FieldKey[];
  suggestionToken?: string;
  vaultId?: string;
  title?: string;
  baseRevision?: number;
};
const focused = new Map<number, Omit<Target, 'topLevelUrl' | 'createdAt'>>();
const pending = new Map<
  string,
  Target & { context: PageFillContext; accountId: number }
>();
const suggestions = new Map<
  number,
  Target & { token: string; accountId: number }
>();
function popupSender(sender: chrome.runtime.MessageSender) {
  if (sender.id !== chrome.runtime.id || !sender.url) return false;
  const url = new URL(sender.url);
  const extensionUrl = new URL(chrome.runtime.getURL('index.html'));
  return (
    url.protocol === extensionUrl.protocol &&
    url.host === extensionUrl.host &&
    url.pathname === '/index.html'
  );
}
function contentTarget(sender: chrome.runtime.MessageSender) {
  if (
    sender.tab?.id === undefined ||
    !sender.documentId ||
    !sender.url ||
    !/^https?:/.test(sender.url) ||
    sender.tab.incognito !== chrome.extension.inIncognitoContext
  )
    return;
  return {
    tabId: sender.tab.id,
    frameId: sender.frameId ?? 0,
    documentId: sender.documentId,
    documentUrl: sender.url,
  };
}
async function send<T>(target: Target, message: Record<string, unknown>) {
  const reply = (await chrome.tabs.sendMessage(target.tabId, message, {
    documentId: target.documentId,
  })) as { result?: T; error?: string };
  if (reply.error || reply.result === undefined)
    throw new Error(reply.error ?? 'The selected form is unavailable.');
  return reply.result;
}
async function dismiss(target: Target & { token: string }) {
  suggestions.delete(target.tabId);
  await send(target, {
    type: 'aux.vault.dismissSubmission',
    suggestionToken: target.token,
  }).catch(() => undefined);
}
async function currentAccount(accountId?: number, unlocked = true) {
  const account = await resolveAccount();
  if (accountId !== undefined && accountId !== account.accountId)
    throw new Error('The local account changed. Open Vault again.');
  for (const target of suggestions.values())
    if (target.accountId !== account.accountId) await dismiss(target);
  for (const [token, target] of pending)
    if (target.accountId !== account.accountId) pending.delete(token);
  const status = await rpc<{ locked: boolean }>('passwordManager.auth.status', {
    accountId: account.accountId,
  });
  if (status.locked) {
    for (const target of suggestions.values()) await dismiss(target);
    if (unlocked) throw new Error('Unlock your Vault before continuing.');
  }
  return account;
}
async function live(target: Target) {
  if (Date.now() - target.createdAt > 120000)
    throw new Error('This request expired. Select the form again.');
  const tab = await chrome.tabs.get(target.tabId);
  if (
    tab.url !== target.topLevelUrl ||
    tab.incognito !== chrome.extension.inIncognitoContext
  )
    throw new Error('This page changed. Open the form menu again.');
}
chrome.runtime.onMessage.addListener((message: unknown, sender, respond) => {
  if (
    sender.id !== chrome.runtime.id ||
    !message ||
    typeof message !== 'object'
  )
    return;
  const request = message as Request;
  const target = contentTarget(sender);
  if (request.type === 'aux.vault.focus' && target) {
    focused.set(target.tabId, target);
    respond({ result: true });
    return;
  }
  if (
    request.type === 'aux.vault.submitted' &&
    target &&
    typeof request.suggestionToken === 'string' &&
    request.suggestionToken.length < 100
  ) {
    void (async () => {
      const account = await currentAccount(undefined, false);
      const tab = await chrome.tabs.get(target.tabId);
      if (!tab.url) throw new Error('This page is unavailable.');
      const previous = suggestions.get(target.tabId);
      if (previous) await dismiss(previous);
      suggestions.set(target.tabId, {
        ...target,
        token: String(request.suggestionToken),
        accountId: account.accountId,
        topLevelUrl: tab.url,
        createdAt: Date.now(),
      });
      return true;
    })()
      .then((result) => respond({ result }))
      .catch((error) => respond({ error: error.message }));
    return true;
  }
  if (request.type === 'aux.vault.open' && target) {
    void chrome.action
      .openPopup()
      .then(() => respond({ result: true }))
      .catch((error) => respond({ error: error.message }));
    return true;
  }
  if (!popupSender(sender)) return;
  void handle(request)
    .then((result) => respond({ result }))
    .catch((error) =>
      respond({
        error:
          error instanceof Error ? error.message : 'The Vault action failed.',
      }),
    );
  return true;
});
async function activeTab() {
  const tab = (
    await chrome.tabs.query({ active: true, lastFocusedWindow: true })
  ).find((tab) => tab.incognito === chrome.extension.inIncognitoContext);
  if (tab?.id === undefined || !tab.url || !/^https?:/.test(tab.url))
    throw new Error('Focus a field on an HTTP or HTTPS page.');
  return tab as chrome.tabs.Tab & { id: number; url: string };
}
async function handle(request: Request) {
  if (request.type === 'aux.vault.pageContext') {
    const tab = await activeTab();
    const target = focused.get(tab.id);
    if (!target)
      throw new Error('Focus a field on this page, then open Aux Vault again.');
    const account = await currentAccount(request.accountId, false);
    const bound = { ...target, topLevelUrl: tab.url, createdAt: Date.now() };
    const context = await send<PageFillContext>(bound, {
      type: 'aux.vault.context',
    });
    if (context.documentUrl !== target.documentUrl)
      throw new Error('This page changed. Focus its field again.');
    for (const [token, value] of pending)
      if (Date.now() - value.createdAt > 120000) pending.delete(token);
    pending.set(context.contextToken, {
      ...bound,
      context,
      accountId: account.accountId,
    });
    return context;
  }
  if (request.type === 'aux.vault.pendingSave') {
    await currentAccount(request.accountId);
    const tab = await activeTab();
    const target = suggestions.get(tab.id);
    if (!target) return null;
    try {
      await live(target);
      const metadata = await send<{ username: string; title: string }>(target, {
        type: 'aux.vault.saveMetadata',
        suggestionToken: target.token,
      });
      return {
        suggestionToken: target.token,
        documentUrl: target.documentUrl,
        ...metadata,
      } satisfies SaveSuggestion;
    } catch (error) {
      await dismiss(target);
      throw error;
    }
  }
  if (
    request.type === 'aux.vault.dismissSave' ||
    request.type === 'aux.vault.acceptSave'
  ) {
    const account = await currentAccount(request.accountId);
    const tab = await activeTab();
    const target = suggestions.get(tab.id);
    if (
      !target ||
      target.token !== request.suggestionToken ||
      target.accountId !== account.accountId
    )
      throw new Error('This save suggestion expired. Submit the form again.');
    if (request.type === 'aux.vault.dismissSave') {
      await dismiss(target);
      return true;
    }
    await live(target);
    const captured = await send<{ username: string; password: string }>(
      target,
      { type: 'aux.vault.captureSubmission', suggestionToken: target.token },
    );
    await currentAccount(request.accountId);
    await live(target);
    const origin = new URL(target.documentUrl).origin;
    let result: VaultItem;
    if (request.itemId) {
      const item = await rpc<VaultItem>('vault.getItem', {
        accountId: account.accountId,
        itemId: request.itemId,
      });
      if (item.reprompt)
        throw new Error(
          'This item requires a fresh password prompt, which form updates do not support yet.',
        );
      if (
        item.state !== 'active' ||
        item.category !== 'login' ||
        !item.urls.some((url) => new URL(url).origin === origin) ||
        item.revision !== request.baseRevision
      )
        throw new Error('Choose the current matching login to update.');
      await currentAccount(request.accountId);
      await live(target);
      await send(target, {
        type: 'aux.vault.saveMetadata',
        suggestionToken: target.token,
      });
      result = await rpc<VaultItem>(
        'vault.updateItem',
        {
          accountId: account.accountId,
          itemId: item.id,
          baseRevision: item.revision,
          patch: { loginFields: { ...item.loginFields, ...captured } },
        },
        true,
      );
    } else {
      if (!request.vaultId || !request.title?.trim())
        throw new Error('Choose a Vault and a title for the new login.');
      result = await rpc<VaultItem>(
        'vault.createItem',
        {
          accountId: account.accountId,
          item: {
            vaultId: request.vaultId,
            category: 'login',
            title: request.title.trim(),
            urls: [origin],
            loginFields: captured,
          },
        },
        true,
      );
    }
    await dismiss(target);
    return { id: result.id, revision: result.revision };
  }
  if (
    request.type !== 'aux.vault.fill' ||
    !request.itemId ||
    !request.contextToken
  )
    throw new Error('This Vault action is not permitted.');
  const target = pending.get(request.contextToken);
  if (!target)
    throw new Error('This fill request expired. Focus the field again.');
  await live(target);
  const account = await currentAccount(request.accountId);
  if (target.accountId !== account.accountId)
    throw new Error('The local account changed. Select the form again.');
  const item = await rpc<VaultItem>('vault.getItem', {
    accountId: account.accountId,
    itemId: request.itemId,
  });
  if (
    target.context.category === 'login' &&
    !item.urls.some(
      (url) => new URL(url).origin === new URL(target.documentUrl).origin,
    )
  )
    throw new Error('This login does not match the selected page.');
  const allowed = target.context.fields.map((field) => field.key);
  const keys =
    request.selectedFields ??
    (target.context.category === 'login' ? allowed : []);
  if (
    !keys.length ||
    new Set(keys).size !== keys.length ||
    keys.some((key) => !allowed.includes(key))
  )
    throw new Error('Choose the matching fields you want to fill.');
  const values = fillValues(item, target.context.category, keys);
  await send(target, {
    type: 'aux.vault.verify',
    contextToken: request.contextToken,
    documentUrl: target.documentUrl,
  });
  await currentAccount(request.accountId);
  await live(target);
  pending.delete(request.contextToken);
  return send<{ filled: boolean; fieldCount: number }>(target, {
    type: 'aux.vault.fill',
    contextToken: request.contextToken,
    documentUrl: target.documentUrl,
    values,
  });
}
chrome.tabs.onRemoved.addListener((tabId) => {
  focused.delete(tabId);
  for (const [token, target] of pending)
    if (target.tabId === tabId) pending.delete(token);
  suggestions.delete(tabId);
});
chrome.tabs.onUpdated.addListener((tabId, change) => {
  if (!change.url && change.status !== 'loading') return;
  focused.delete(tabId);
  for (const [token, target] of pending)
    if (target.tabId === tabId) pending.delete(token);
  const target = suggestions.get(tabId);
  if (target) void dismiss(target);
});
