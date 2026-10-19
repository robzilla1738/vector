import { readContextActivity } from './context-bridge';
import { daemonUrl, getToken, resolveAccount } from './daemon';
import { readHistoryVisits } from './history-bridge';

function navigationUrl(value: unknown) {
  const url = new URL(String(value));
  if (!['http:', 'https:', 'about:'].includes(url.protocol))
    throw new Error('This navigation protocol is not permitted.');
  return url.href;
}
let socket: WebSocket | undefined;
let retry = 0;
const running = new Map<number, AbortController>();
const debuggedTabs = new Set<number>();
chrome.debugger.onDetach.addListener((source) => {
  if (source.tabId !== undefined) debuggedTabs.delete(source.tabId);
});
interface CreatedTarget {
  accountId: number;
  profileId: string;
  browserMode: 'default' | 'incognito';
  ownershipToken: string;
  sessionId: string;
  targetId: string;
  tabId: number;
  documentId: string;
  documentUrl: string;
  title: string;
  url: string;
}
const ownedStorageKey = `aux.agent-targets.v1.${chrome.extension.inIncognitoContext ? 'incognito' : 'default'}`;
let ownedSerial = Promise.resolve();
async function ownedCommand<T>(operation: () => Promise<T>): Promise<T> {
  const result = ownedSerial.then(operation, operation);
  ownedSerial = result.then(
    () => {},
    () => {},
  );
  return result;
}
async function ownedRecords(): Promise<CreatedTarget[]> {
  const values = (await chrome.storage.session.get(ownedStorageKey))[
    ownedStorageKey
  ];
  return Array.isArray(values)
    ? values.filter(
        (entry): entry is CreatedTarget =>
          !!entry &&
          typeof entry === 'object' &&
          Number.isInteger(entry.accountId) &&
          typeof entry.profileId === 'string' &&
          ['default', 'incognito'].includes(entry.browserMode) &&
          typeof entry.sessionId === 'string' &&
          typeof entry.ownershipToken === 'string' &&
          typeof entry.targetId === 'string' &&
          Number.isInteger(entry.tabId) &&
          typeof entry.documentId === 'string' &&
          typeof entry.documentUrl === 'string',
      )
    : [];
}
async function saveOwned(values: CreatedTarget[]) {
  await chrome.storage.session.set({ [ownedStorageKey]: values });
}
async function ownershipScope(params: Record<string, unknown>) {
  const context = await resolveAccount();
  const mode: 'default' | 'incognito' = chrome.extension.inIncognitoContext
    ? 'incognito'
    : 'default';
  if (
    params.accountId !== context.accountId ||
    params.profileId !== context.profile.profileId ||
    params.browserMode !== mode
  )
    throw new Error(
      'Agent tab ownership belongs to another account, profile or browsing mode.',
    );
  return {
    accountId: context.accountId,
    profileId: context.profile.profileId,
    browserMode: mode,
  };
}
async function ownershipInput(params: Record<string, unknown>) {
  const scope = await ownershipScope(params);
  if (
    typeof params.sessionId !== 'string' ||
    !params.sessionId ||
    typeof params.ownershipToken !== 'string' ||
    !/^[0-9a-f-]{36}$/i.test(params.ownershipToken)
  )
    throw new Error('A private agent creation receipt is required.');
  return {
    ...scope,
    sessionId: params.sessionId,
    ownershipToken: params.ownershipToken,
  };
}
async function liveIdentity(record: Pick<CreatedTarget, 'targetId' | 'tabId'>) {
  const target = (await chrome.debugger.getTargets()).find(
    (entry) => entry.id === record.targetId && entry.tabId === record.tabId,
  );
  if (!target)
    throw new Error('The exact created debugger target no longer exists.');
  const tab = await chrome.tabs.get(record.tabId);
  if (tab.incognito !== chrome.extension.inIncognitoContext)
    throw new Error('The created tab belongs to another browsing mode.');
  if (!debuggedTabs.has(record.tabId)) {
    await chrome.debugger.attach({ targetId: record.targetId }, '1.3');
    debuggedTabs.add(record.tabId);
  }
  const tree = (await chrome.debugger.sendCommand(
    { targetId: record.targetId },
    'Page.getFrameTree',
  )) as {
    frameTree?: { frame?: { id?: string; loaderId?: string; url?: string } };
  };
  const frame = tree.frameTree?.frame;
  if (!frame?.id || !frame.loaderId || typeof frame.url !== 'string')
    throw new Error('The created target has no verifiable committed document.');
  // Frame+loader identifies the document independently of reusable numeric tab IDs.
  return {
    targetId: record.targetId,
    tabId: record.tabId,
    documentId: `${frame.id}:${frame.loaderId}`,
    documentUrl: frame.url,
    title: tab.title ?? '',
    url: tab.url ?? frame.url,
  };
}
async function verifiedOwned(
  params: Record<string, unknown>,
  records: CreatedTarget[],
) {
  const owner = await ownershipInput(params);
  const record = records.find(
    (entry) =>
      entry.accountId === owner.accountId &&
      entry.profileId === owner.profileId &&
      entry.browserMode === owner.browserMode &&
      entry.sessionId === owner.sessionId &&
      entry.ownershipToken === owner.ownershipToken,
  );
  if (
    !record ||
    record.targetId !== params.targetId ||
    record.tabId !== params.tabId ||
    record.documentId !== params.documentId ||
    record.documentUrl !== params.documentUrl
  )
    throw new Error('The exact agent ownership receipt does not match.');
  const live = await liveIdentity(record);
  if (
    live.documentId !== record.documentId ||
    live.documentUrl !== record.documentUrl
  )
    throw new Error(
      'Document changed; agent cleanup ownership has been released.',
    );
  return { ...record, ...live };
}
async function settleOwned(
  record: CreatedTarget,
  loaderId: string | undefined,
  url: string,
) {
  for (let attempt = 0; attempt < 50; attempt++) {
    const tab = await chrome.tabs.get(record.tabId);
    try {
      const live = await liveIdentity(record);
      if (
        tab.status === 'complete' &&
        (loaderId
          ? live.documentId.endsWith(`:${loaderId}`)
          : live.documentUrl === url)
      )
        return { ...record, ...live };
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(
    'Navigation is not settled; ownership cannot be advanced safely.',
  );
}
const commands: Record<
  string,
  (params: Record<string, unknown>) => Promise<unknown>
> = {
  'context.activity': readContextActivity,
  'history.visits': readHistoryVisits,
  'tabs.owned.create': (params) =>
    ownedCommand(async () => {
      const owner = await ownershipInput(params),
        records = await ownedRecords();
      const previous = records.find(
        (entry) => entry.ownershipToken === owner.ownershipToken,
      );
      if (previous) {
        if (previous.sessionId !== owner.sessionId)
          throw new Error('Creation receipt belongs to another task.');
        return verifiedOwned({ ...previous }, records);
      }
      if (records.length >= 100)
        throw new Error(
          'Close or release existing agent tabs before creating more.',
        );
      const url = navigationUrl(params.url);
      if (!['http:', 'https:'].includes(new URL(url).protocol))
        throw new Error('Agent tabs require HTTP(S).');
      const tab = await chrome.tabs.create({
        url: 'about:blank',
        active: params.active === true,
      });
      if (tab.id === undefined)
        throw new Error('The created tab has no stable browser identity.');
      let targetId: string | undefined;
      for (let attempt = 0; attempt < 20 && !targetId; attempt++) {
        targetId = (await chrome.debugger.getTargets()).find(
          (target) => target.tabId === tab.id,
        )?.id;
        if (!targetId) await new Promise((resolve) => setTimeout(resolve, 50));
      }
      if (!targetId)
        throw new Error(
          'The created tab has no debugger target; it was left open without cleanup ownership.',
        );
      const record = {
        ...owner,
        ...(await liveIdentity({ targetId, tabId: tab.id })),
      };
      records.push(record);
      await saveOwned(records);
      const navigation = (await chrome.debugger.sendCommand(
        { targetId },
        'Page.navigate',
        { url },
      )) as { loaderId?: string; errorText?: string };
      if (navigation.errorText)
        throw new Error('Agent navigation failed; ownership was not advanced.');
      const settled = await settleOwned(record, navigation.loaderId, url);
      await saveOwned(
        records.map((entry) =>
          entry.ownershipToken === record.ownershipToken ? settled : entry,
        ),
      );
      return settled;
    }),
  'tabs.owned.list': (params) =>
    ownedCommand(async () => {
      if (typeof params.sessionId !== 'string')
        throw new Error('A task identity is required.');
      const scope = await ownershipScope(params);
      const records = await ownedRecords(),
        tabs: CreatedTarget[] = [],
        remaining: CreatedTarget[] = [];
      for (const record of records) {
        if (
          record.sessionId !== params.sessionId ||
          record.accountId !== scope.accountId ||
          record.profileId !== scope.profileId ||
          record.browserMode !== scope.browserMode
        ) {
          remaining.push(record);
          continue;
        }
        try {
          const live = await liveIdentity(record);
          if (
            live.documentId === record.documentId &&
            live.documentUrl === record.documentUrl
          ) {
            const current = { ...record, ...live };
            tabs.push(current);
            remaining.push(current);
          }
        } catch {
          /* An unverifiable target is never eligible for cleanup. */
        }
      }
      await saveOwned(remaining);
      return { tabs };
    }),
  'tabs.owned.close': (params) =>
    ownedCommand(async () => {
      const records = await ownedRecords(),
        record = await verifiedOwned(params, records);
      // Address the stable debugger target rather than a potentially reused tab number.
      await chrome.debugger.sendCommand(
        { targetId: record.targetId },
        'Page.close',
      );
      let remains = true;
      for (let attempt = 0; attempt < 20; attempt++) {
        remains = (await chrome.debugger.getTargets()).some(
          (target) => target.id === record.targetId,
        );
        if (!remains) break;
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      if (remains)
        throw new Error(
          'The created target did not close; ownership was retained.',
        );
      await saveOwned(
        records.filter(
          (entry) => entry.ownershipToken !== record.ownershipToken,
        ),
      );
      return { closed: true };
    }),
  'tabs.owned.navigate': (params) =>
    ownedCommand(async () => {
      const records = await ownedRecords(),
        record = await verifiedOwned(params, records),
        url = navigationUrl(params.url);
      if (!['http:', 'https:'].includes(new URL(url).protocol))
        throw new Error('Agent navigation requires HTTP(S).');
      const navigation = (await chrome.debugger.sendCommand(
        { targetId: record.targetId },
        'Page.navigate',
        { url },
      )) as { loaderId?: string; errorText?: string };
      if (navigation.errorText)
        throw new Error('Agent navigation failed; ownership was not advanced.');
      const settled = await settleOwned(record, navigation.loaderId, url);
      await saveOwned(
        records.map((entry) =>
          entry.ownershipToken === record.ownershipToken ? settled : entry,
        ),
      );
      return settled;
    }),
  'tabs.owned.release': (params) =>
    ownedCommand(async () => {
      const owner = await ownershipInput(params),
        records = await ownedRecords();
      await saveOwned(
        records.filter(
          (entry) =>
            entry.ownershipToken !== owner.ownershipToken ||
            entry.sessionId !== owner.sessionId,
        ),
      );
      return { released: true };
    }),
  'tabs.query': async (params) => {
    const [tabs, targets] = await Promise.all([
      chrome.tabs.query(params),
      chrome.debugger.getTargets(),
    ]);
    return tabs.map((tab) => ({
      ...tab,
      targetId: targets.find((target) => target.tabId === tab.id)?.id,
    }));
  },
  'tabs.create': (params) =>
    chrome.tabs.create({
      url: navigationUrl(params.url),
      active: params.active !== false,
    }),
  'tabs.update': (params) =>
    chrome.tabs.update(Number(params.tabId), {
      ...(typeof params.url === 'string'
        ? { url: navigationUrl(params.url) }
        : {}),
      ...(typeof params.active === 'boolean' ? { active: params.active } : {}),
    }),
  'tabs.remove': (params) => chrome.tabs.remove(Number(params.tabId)),
  'tabs.get': (params) => chrome.tabs.get(Number(params.tabId)),
  'tabs.reload': (params) => chrome.tabs.reload(Number(params.tabId)),
  'windows.update': (params) =>
    chrome.windows.update(Number(params.windowId), {
      focused: params.focused === true,
    }),
  'page.screenshot': async (params) => {
    const tabId = await targetTab(params);
    if (!debuggedTabs.has(tabId)) {
      await chrome.debugger.attach({ tabId }, '1.3');
      debuggedTabs.add(tabId);
    }
    const result = (await chrome.debugger.sendCommand(
      { tabId },
      'Page.captureScreenshot',
      { format: 'png' },
    )) as { data: string };
    return { mimeType: 'image/png', data: result.data };
  },
  'page.snapshot': async (params) =>
    chrome.tabs.sendMessage(
      await targetTab(params),
      { type: 'aux.snapshot' },
      { frameId: Number(params.frameId ?? 0) },
    ),
  'page.navigate': async (params) =>
    chrome.tabs.update(await targetTab(params), {
      url: navigationUrl(params.url),
    }),
  'page.click': (params) => pageAction(params, 'click'),
  'page.type': (params) => pageAction(params, 'fill'),
  'page.scroll': (params) => pageAction(params, 'scroll'),
};

chrome.tabs.onRemoved.addListener((tabId) => {
  debuggedTabs.delete(tabId);
  void ownedCommand(async () =>
    saveOwned(
      (await ownedRecords()).filter((record) => record.tabId !== tabId),
    ),
  );
});

async function targetTab(params: Record<string, unknown>) {
  let tabId: number | undefined;
  if (typeof params.targetId === 'string')
    tabId = (await chrome.debugger.getTargets()).find(
      (target) => target.id === params.targetId,
    )?.tabId;
  else if (Number.isInteger(params.tabId)) tabId = Number(params.tabId);
  if (tabId === undefined)
    throw new Error('The browser target is unavailable.');
  const tab = await chrome.tabs.get(tabId);
  if (tab.incognito !== chrome.extension.inIncognitoContext)
    throw new Error('The browser target belongs to a different browsing mode.');
  return tabId;
}
async function pageAction(params: Record<string, unknown>, kind: string) {
  const result = await chrome.tabs.sendMessage(
    await targetTab(params),
    {
      type: 'aux.action',
      documentUrl: params.documentUrl,
      action: {
        kind,
        ref: params.ref,
        text: params.text,
        x: params.x,
        y: params.y,
      },
    },
    { frameId: Number(params.frameId ?? 0) },
  );
  if (result?.error) throw new Error(String(result.error));
  return result;
}

async function connect() {
  try {
    const [context, token] = await Promise.all([resolveAccount(), getToken()]);
    socket = new WebSocket(
      `${daemonUrl.replace('http:', 'ws:')}/extension-bridge/extension`,
      [`aux.daemon.auth.${token}`],
    );
    socket.onopen = () => {
      retry = 0;
      socket?.send(
        JSON.stringify({
          method: 'register',
          connectionId: crypto.randomUUID(),
          route: {
            accountId: context.accountId,
            profileId: context.profile.profileId,
            browserMode: chrome.extension.inIncognitoContext
              ? 'incognito'
              : 'default',
          },
        }),
      );
    };
    socket.onmessage = (event) => {
      void handle(event.data);
    };
    socket.onclose = () => {
      socket = undefined;
      chrome.alarms.create('aux.reconnect', {
        delayInMinutes: Math.min(0.1 * 2 ** retry++, 1),
      });
    };
    socket.onerror = () => socket?.close();
  } catch {
    chrome.alarms.create('aux.reconnect', { delayInMinutes: 1 });
  }
}
async function handle(data: string) {
  const message = JSON.parse(data) as {
    method: string;
    id: number;
    command?: { method: string; params?: Record<string, unknown> };
  };
  if (message.method === 'ping') {
    socket?.send(JSON.stringify({ method: 'pong' }));
    return;
  }
  if (message.method === 'cancelCommand') {
    running.get(message.id)?.abort();
    return;
  }
  if (message.method !== 'runCommand' || !message.command) return;
  const controller = new AbortController();
  running.set(message.id, controller);
  try {
    const command = commands[message.command.method];
    if (!command) throw new Error('This browser command is not permitted.');
    const result = await command(message.command.params ?? {});
    if (!controller.signal.aborted)
      socket?.send(JSON.stringify({ id: message.id, result }));
  } catch (error) {
    socket?.send(
      JSON.stringify({
        id: message.id,
        error:
          error instanceof Error ? error.message : 'Browser command failed.',
      }),
    );
  } finally {
    running.delete(message.id);
  }
}
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'aux.reconnect' && !socket) void connect();
});
chrome.action.onClicked.addListener((tab) => {
  if (tab.windowId) void chrome.sidePanel.open({ windowId: tab.windowId });
});
chrome.runtime.onInstalled.addListener(() => {
  void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});
void connect();
