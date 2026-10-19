import { resolveAccount, rpc } from './daemon';
import { requireAccount } from './native';

type Scope = {
  accountId: number;
  profileId: string;
  browserMode: 'default' | 'incognito';
  targetId: string;
  documentId: string;
  documentUrl: string;
};
type Receipt = { nonce: string; scope: Scope; expiresAt: number };
type ImageResult = {
  data: string;
  mimeType: 'image/png';
  width: number;
  height: number;
};
type Rectangle = { x: number; y: number; width: number; height: number };
const receipts = new Map<number, Receipt>();
async function identity(
  params: Record<string, unknown>,
  attach: (tabId: number) => Promise<void>,
) {
  const profile = await requireAccount().getProfileContext();
  const account = await resolveAccount();
  const mode = chrome.extension.inIncognitoContext ? 'incognito' : 'default';
  if (
    profile.isCurrent !== true ||
    profile.isLocked !== false ||
    profile.profileId !== params.profileId ||
    profile.accountId !== params.accountId ||
    account.accountId !== params.accountId ||
    params.browserMode !== mode ||
    profile.browserMode !== mode
  )
    throw new Error('Capture requires this current unlocked browser profile.');
  const target = (await chrome.debugger.getTargets()).find(
    (t) => t.id === params.targetId,
  );
  if (target?.tabId === undefined) throw new Error('Capture target closed.');
  const tab = await chrome.tabs.get(target.tabId);
  if (
    tab.incognito !== chrome.extension.inIncognitoContext ||
    !/^https?:/.test(tab.url ?? '')
  )
    throw new Error(
      'Capture target belongs to another mode or is not a web page.',
    );
  await attach(target.tabId);
  const tree = (await chrome.debugger.sendCommand(
    { tabId: target.tabId },
    'Page.getFrameTree',
  )) as {
    frameTree?: { frame?: { id?: string; loaderId?: string; url?: string } };
  };
  const frame = tree.frameTree?.frame;
  if (
    !frame?.id ||
    !frame.loaderId ||
    frame.url !== params.documentUrl ||
    `${frame.id}:${frame.loaderId}` !== params.documentId
  )
    throw new Error('The page changed. Open capture again.');
  return { tabId: target.tabId };
}
export function createCaptureBackground(
  attach: (tabId: number) => Promise<void>,
) {
  const handlers: Record<
    string,
    (params: Record<string, unknown>) => Promise<unknown>
  > = {
    'capture.verify': async (params) => {
      await identity(params, attach);
      return { valid: true };
    },
    'capture.page': async (params) => {
      const { tabId } = await identity(params, attach);
      const metrics = (await chrome.debugger.sendCommand(
        { tabId },
        'Page.getLayoutMetrics',
      )) as {
        cssContentSize?: {
          x: number;
          y: number;
          width: number;
          height: number;
        };
        cssVisualViewport?: {
          pageX: number;
          pageY: number;
          clientWidth: number;
          clientHeight: number;
        };
      };
      const viewport = metrics.cssVisualViewport,
        content = metrics.cssContentSize;
      if (!viewport || !content)
        throw new Error('Page capture metrics are unavailable.');
      let clip =
        params.mode === 'fullPage'
          ? {
              x: content.x,
              y: content.y,
              width: content.width,
              height: content.height,
              scale: 1,
            }
          : {
              x: viewport.pageX,
              y: viewport.pageY,
              width: viewport.clientWidth,
              height: viewport.clientHeight,
              scale: 1,
            };
      if (params.mode === 'region') {
        const r = params.region as Rectangle | undefined;
        if (
          !r ||
          ![r.x, r.y, r.width, r.height].every(Number.isFinite) ||
          r.x < 0 ||
          r.y < 0 ||
          r.width <= 0 ||
          r.height <= 0 ||
          r.x + r.width > viewport.clientWidth + 1 ||
          r.y + r.height > viewport.clientHeight + 1
        )
          throw new Error('Select a region inside the current page viewport.');
        clip = {
          x: viewport.pageX + r.x,
          y: viewport.pageY + r.y,
          width: r.width,
          height: r.height,
          scale: 1,
        };
      } else if (params.mode !== 'fullPage' && params.mode !== 'viewport')
        throw new Error('Unknown page capture mode.');
      if (
        ![clip.x, clip.y, clip.width, clip.height].every(Number.isFinite) ||
        clip.width <= 0 ||
        clip.height <= 0 ||
        clip.width > 16384 ||
        clip.height > 16384 ||
        clip.width * clip.height > 40_000_000
      )
        throw new Error(
          'Page is too large for one capture. Select a smaller region.',
        );
      await identity(params, attach);
      const result = (await chrome.debugger.sendCommand(
        { tabId },
        'Page.captureScreenshot',
        {
          format: 'png',
          captureBeyondViewport: params.mode === 'fullPage',
          fromSurface: true,
          clip,
        },
      )) as { data?: string };
      await identity(params, attach);
      if (
        typeof result.data !== 'string' ||
        result.data.length > 32 * 1024 * 1024
      )
        throw new Error('Captured image exceeds the transfer limit.');
      return { data: result.data };
    },
  };
  async function launch(tab: chrome.tabs.Tab) {
    if (
      tab.id === undefined ||
      tab.incognito !== chrome.extension.inIncognitoContext ||
      !/^https?:/.test(tab.url ?? '')
    )
      throw new Error('Open capture from an ordinary web page.');
    const account = await resolveAccount(),
      target = (await chrome.debugger.getTargets()).find(
        (t) => t.tabId === tab.id,
      );
    if (!target) throw new Error('The page target is unavailable.');
    await attach(tab.id);
    const tree = (await chrome.debugger.sendCommand(
      { tabId: tab.id },
      'Page.getFrameTree',
    )) as {
      frameTree?: { frame?: { id?: string; loaderId?: string; url?: string } };
    };
    const frame = tree.frameTree?.frame;
    if (!frame?.id || !frame.loaderId || !frame.url)
      throw new Error('The page has no committed document.');
    const scope: Scope = {
      accountId: account.accountId,
      profileId: account.profile.profileId,
      browserMode: chrome.extension.inIncognitoContext
        ? 'incognito'
        : 'default',
      targetId: target.id,
      documentId: `${frame.id}:${frame.loaderId}`,
      documentUrl: frame.url,
    };
    await identity(scope, attach);
    const receipt = {
      nonce: crypto.randomUUID(),
      scope,
      expiresAt: Date.now() + 5 * 60_000,
    };
    if (receipts.size >= 32)
      receipts.delete(receipts.keys().next().value as number);
    receipts.set(tab.id, receipt);
    await chrome.tabs.sendMessage(
      tab.id,
      { type: 'aux.capture.open', nonce: receipt.nonce },
      { frameId: 0 },
    );
  }
  chrome.tabs.onRemoved.addListener((tabId) => receipts.delete(tabId));
  chrome.tabs.onUpdated.addListener((tabId, change) => {
    if (change.status === 'loading' || change.url) receipts.delete(tabId);
  });
  chrome.runtime.onMessage.addListener((message: unknown, sender, respond) => {
    if (
      !message ||
      typeof message !== 'object' ||
      !('type' in message) ||
      message.type !== 'aux.capture.request'
    )
      return;
    const request = message as {
      type: string;
      nonce?: string;
      mode?: string;
      region?: Rectangle;
      data?: string;
    };
    const perform = async () => {
      const tabId = sender.tab?.id,
        receipt = tabId === undefined ? undefined : receipts.get(tabId);
      if (
        sender.id !== chrome.runtime.id ||
        sender.frameId !== 0 ||
        !sender.documentId ||
        !receipt ||
        receipt.nonce !== request.nonce ||
        receipt.expiresAt < Date.now() ||
        sender.url !== receipt.scope.documentUrl ||
        sender.tab?.incognito !== chrome.extension.inIncognitoContext
      )
        throw new Error('Open capture again from this page.');
      await identity(receipt.scope, attach);
      if (request.mode === 'dismiss') {
        receipts.delete(tabId as number);
        return { dismissed: true };
      }
      if (request.mode === 'cancel') {
        receipts.delete(tabId as number);
        return rpc(
          'capture.cancel',
          { accountId: receipt.scope.accountId },
          true,
        );
      }
      if (request.mode === 'download') {
        if (
          typeof request.data !== 'string' ||
          request.data.length > 32 * 1024 * 1024 ||
          !request.data.startsWith('iVBORw0KGgo')
        )
          throw new Error('Download requires the captured PNG image.');
        const downloadId = await chrome.downloads.download({
          url: `data:image/png;base64,${request.data}`,
          filename: `Aux capture ${new Date().toISOString().replaceAll(':', '-')}.png`,
          saveAs: true,
          conflictAction: 'uniquify',
        });
        return { downloadId, state: 'started' };
      }
      if (
        !['screen', 'fullPage', 'viewport', 'region'].includes(
          request.mode ?? '',
        )
      )
        throw new Error('Unknown capture mode.');
      return rpc<ImageResult>(
        `capture.${request.mode}`,
        {
          ...receipt.scope,
          ...(request.mode === 'region' ? { region: request.region } : {}),
        },
        true,
      );
    };
    void perform().then(
      (result) => respond({ result }),
      (error) =>
        respond({
          error: error instanceof Error ? error.message : 'Capture failed.',
        }),
    );
    return true;
  });
  return { handlers, launch };
}
