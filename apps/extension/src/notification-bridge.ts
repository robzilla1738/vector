import { rpc } from './daemon';
import { requireAccount } from './native';

/** Only a verified activation of an issued notification may invoke this bridge. */
export async function activateNotificationChat(
  params: Record<string, unknown>,
) {
  if (
    chrome.extension.inIncognitoContext ||
    params.browserMode !== 'default' ||
    !Number.isSafeInteger(params.accountId) ||
    typeof params.profileId !== 'string' ||
    typeof params.sessionId !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      params.sessionId,
    )
  )
    throw new Error('Notification activation requires an ordinary bound task.');
  const check = async () => {
    const profile = await requireAccount().getProfileContext();
    if (
      profile.profileId !== params.profileId ||
      profile.accountId !== params.accountId ||
      profile.browserMode !== 'default' ||
      profile.isCurrent !== true ||
      profile.isLocked !== false
    )
      throw new Error('The notification account or browser profile changed.');
  };
  await check();
  const session = await rpc<{
    id: string;
    accountId: number;
    incognito: boolean;
    browserBinding?: { profileId: string; browserMode: string };
  }>('sessions.get', {
    accountId: params.accountId,
    sessionId: params.sessionId,
  });
  if (
    session.id !== params.sessionId ||
    session.accountId !== params.accountId ||
    session.incognito !== false ||
    session.browserBinding?.profileId !== params.profileId ||
    session.browserBinding.browserMode !== 'default'
  )
    throw new Error('The notification task no longer matches this profile.');
  const url = chrome.runtime.getURL(`index.html#/chat/${session.id}`);
  const existing = (await chrome.tabs.query({})).find(
    (tab) => !tab.incognito && tab.url === url,
  );
  await check();
  if (existing?.id !== undefined) {
    const current = await chrome.tabs.get(existing.id);
    if (current.incognito || current.url !== url)
      throw new Error('The notification destination tab changed.');
    await check();
    await chrome.tabs.update(existing.id, { active: true });
    if (current.windowId !== undefined)
      await chrome.windows.update(current.windowId, { focused: true });
    return { activated: true, tabId: existing.id };
  }
  const created = await chrome.tabs.create({ url, active: true });
  return { activated: true, tabId: created.id };
}
