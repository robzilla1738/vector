import { resolveAccount, rpc } from './daemon';

// Only the extension's native Profile identity and tab.incognito establish mode.
export async function readContextActivity(params: Record<string, unknown>) {
  if (chrome.extension.inIncognitoContext)
    throw new Error('Private browser activity is excluded.');
  async function authorize() {
    const account = await resolveAccount();
    if (
      params.browserMode !== 'default' ||
      params.accountId !== account.accountId ||
      params.profileId !== account.profile.profileId
    )
      throw new Error(
        'Activity route does not match the actual native Profile.',
      );
    const settings = await rpc<{ contextAwarenessEnabled?: boolean }>(
      'settings.get',
      { accountId: account.accountId },
    );
    if (settings.contextAwarenessEnabled !== true)
      throw new Error('Context capture requires explicit opt-in.');
    return account;
  }
  const account = await authorize();
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  if (
    !tab?.id ||
    tab.incognito !== false ||
    !tab.url ||
    !/^https?:\/\//i.test(tab.url)
  )
    return { state: 'skipped', reason: 'no-ordinary-http-tab' };
  if (!(await chrome.windows.get(tab.windowId)).focused)
    return { state: 'skipped', reason: 'browser-window-not-focused' };
  const parsed = new URL(tab.url);
  const domains = params.excludedDomains;
  if (
    !Array.isArray(domains) ||
    domains.some((domain) => typeof domain !== 'string')
  )
    throw new Error('Activity exclusion scope is missing.');
  const domain = parsed.hostname.toLowerCase();
  if (
    domains.some(
      (rule) =>
        domain === rule.toLowerCase() ||
        domain.endsWith(`.${rule.toLowerCase()}`),
    )
  )
    return { state: 'skipped', reason: 'excluded-domain' };

  if (parsed.username || parsed.password)
    return { state: 'skipped', reason: 'sensitive-url' };
  const target = (await chrome.debugger.getTargets()).find(
    (target) => target.tabId === tab.id && target.type === 'page',
  );
  if (!target || target.url !== tab.url)
    return { state: 'skipped', reason: 'unstable-debugger-target' };
  const current = await chrome.tabs.get(tab.id);
  const window = await chrome.windows.get(current.windowId);
  await authorize();
  if (
    !window.focused ||
    !current.active ||
    current.incognito !== false ||
    current.url !== tab.url ||
    current.title !== tab.title
  )
    throw new Error('Browser tab changed during activity capture.');
  const live = (await chrome.debugger.getTargets()).find(
    (candidate) =>
      candidate.id === target.id &&
      candidate.tabId === current.id &&
      candidate.url === current.url,
  );
  if (!live) throw new Error('Browser target changed during activity capture.');
  await authorize();
  return {
    state: 'captured',
    accountId: account.accountId,
    profileId: account.profile.profileId,
    browserMode: 'default',
    targetId: target.id,
    tabId: tab.id,
    url: tab.url,
    title: tab.title ?? '',
    occurredAt: Date.now(),
    content: '',
  };
}
