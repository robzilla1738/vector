import { daemonUrl, getToken, resolveAccount } from './daemon';

function navigationUrl(value: unknown) {
  const url = new URL(String(value));
  if (!['http:', 'https:', 'about:'].includes(url.protocol))
    throw new Error('This navigation protocol is not permitted.');
  return url.href;
}
let socket: WebSocket | undefined;
let retry = 0;
const running = new Map<number, AbortController>();
const commands: Record<
  string,
  (params: Record<string, unknown>) => Promise<unknown>
> = {
  'tabs.query': (params) => chrome.tabs.query(params),
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
