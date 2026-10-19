import type { FillContext, VaultItem } from './client';
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
const focused = new Map<number, Omit<Target, 'topLevelUrl' | 'createdAt'>>();
const pending = new Map<string, Target>();
function popupSender(sender: chrome.runtime.MessageSender) {
  if (sender.id !== chrome.runtime.id || !sender.url) return false;
  const url = new URL(sender.url);
  return (
    url.origin === new URL(chrome.runtime.getURL('index.html')).origin &&
    url.pathname === '/index.html'
  );
}
chrome.runtime.onMessage.addListener((message: unknown, sender, respond) => {
  if (
    sender.id !== chrome.runtime.id ||
    !message ||
    typeof message !== 'object'
  )
    return;
  const request = message as {
    type?: string;
    contextToken?: string;
    itemId?: string;
    accountId?: number;
  };
  if (
    request.type === 'aux.vault.focus' &&
    sender.tab?.id !== undefined &&
    sender.documentId &&
    sender.url &&
    /^https?:/.test(sender.url) &&
    sender.tab.incognito === chrome.extension.inIncognitoContext
  ) {
    focused.set(sender.tab.id, {
      tabId: sender.tab.id,
      frameId: sender.frameId ?? 0,
      documentId: sender.documentId,
      documentUrl: sender.url,
    });
    respond({ result: true });
    return;
  }
  if (request.type === 'aux.vault.open' && sender.tab?.id !== undefined) {
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
async function handle(request: {
  type?: string;
  contextToken?: string;
  itemId?: string;
  accountId?: number;
}) {
  if (request.type === 'aux.vault.pageContext') {
    const tab = (
      await chrome.tabs.query({ active: true, lastFocusedWindow: true })
    ).find((tab) => tab.incognito === chrome.extension.inIncognitoContext);
    if (tab?.id === undefined || !tab.url || !/^https?:/.test(tab.url))
      throw new Error(
        'Focus a login field on an HTTP or HTTPS page to fill it.',
      );
    const target = focused.get(tab.id);
    if (!target)
      throw new Error(
        'Focus a login field on this page, then open Aux Vault again.',
      );
    const result = (await chrome.tabs.sendMessage(
      tab.id,
      { type: 'aux.vault.context' },
      { documentId: target.documentId },
    )) as { result?: FillContext; error?: string };
    if (result.error || !result.result)
      throw new Error(result.error ?? 'The selected field is unavailable.');
    const context = result.result;
    if (context.documentUrl !== target.documentUrl)
      throw new Error('This page changed. Focus its login field again.');
    for (const [token, value] of pending)
      if (Date.now() - value.createdAt > 120000) pending.delete(token);
    pending.set(context.contextToken, {
      ...target,
      topLevelUrl: tab.url,
      createdAt: Date.now(),
    });
    return context;
  }
  if (
    request.type !== 'aux.vault.fill' ||
    !request.itemId ||
    !request.contextToken
  )
    throw new Error('This Vault action is not permitted.');
  const target = pending.get(request.contextToken);
  if (!target || Date.now() - target.createdAt > 120000)
    throw new Error('This fill request expired. Focus the login field again.');
  const tab = await chrome.tabs.get(target.tabId);
  if (
    tab.url !== target.topLevelUrl ||
    tab.incognito !== chrome.extension.inIncognitoContext
  )
    throw new Error('This page changed. Open the fill menu again.');
  const account = await resolveAccount();
  if (request.accountId !== account.accountId)
    throw new Error('The local account changed. Open the Vault again.');
  const item = await rpc<VaultItem>('vault.getItem', {
    accountId: account.accountId,
    itemId: request.itemId,
  });
  const targetUrl = new URL(target.documentUrl);
  if (
    item.state !== 'active' ||
    !item.loginFields ||
    !item.urls.some((url) => new URL(url).origin === targetUrl.origin)
  )
    throw new Error('This login does not match the selected page.');
  const verified = (await chrome.tabs.sendMessage(
    target.tabId,
    {
      type: 'aux.vault.verify',
      contextToken: request.contextToken,
      documentUrl: target.documentUrl,
    },
    { documentId: target.documentId },
  )) as { result?: boolean; error?: string };
  if (!verified.result)
    throw new Error(verified.error ?? 'The selected login field changed.');
  const status = await rpc<{ locked: boolean }>('passwordManager.auth.status', {
    accountId: account.accountId,
  });
  if (status.locked) throw new Error('Unlock your Vault before filling.');
  pending.delete(request.contextToken);
  const response = (await chrome.tabs.sendMessage(
    target.tabId,
    {
      type: 'aux.vault.fill',
      contextToken: request.contextToken,
      documentUrl: target.documentUrl,
      username: item.loginFields.username,
      password: item.loginFields.password,
    },
    { documentId: target.documentId },
  )) as { result?: { filled: boolean }; error?: string };
  if (response.error || !response.result?.filled)
    throw new Error(
      response.error ?? 'The selected fields could not be filled.',
    );
  return { filled: true };
}
chrome.tabs.onRemoved.addListener((tabId) => {
  focused.delete(tabId);
  for (const [token, target] of pending)
    if (target.tabId === tabId) pending.delete(token);
});
