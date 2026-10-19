import {
  CLIPBOARD_LIFETIME_MS,
  type ClipboardLease,
  isClipboardLease,
} from './clipboard-state';

const ALARM = 'aux-vault-sensitive-clipboard';
const STATE = 'auxVaultClipboardLease';
let creating: Promise<void> | undefined;
let operations: Promise<unknown> = Promise.resolve();
function enqueue<T>(operation: () => Promise<T>) {
  const result = operations.then(operation);
  operations = result.catch(() => undefined);
  return result;
}
async function offscreen() {
  if (!chrome.offscreen || !chrome.alarms || !chrome.storage?.session)
    throw new Error('This browser does not support secure clipboard expiry.');
  if (
    (
      await chrome.runtime.getContexts({
        contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
        documentUrls: [chrome.runtime.getURL('offscreen.html')],
      })
    ).length
  )
    return;
  creating ??= chrome.offscreen
    .createDocument({
      url: 'offscreen.html',
      reasons: [chrome.offscreen.Reason.CLIPBOARD],
      justification:
        'Clear a sensitive Vault copy after its short clipboard lifetime.',
    })
    .finally(() => {
      creating = undefined;
    });
  await creating;
}
async function send<T>(message: Record<string, unknown>) {
  await offscreen();
  const response = (await chrome.runtime.sendMessage({
    ...message,
    target: 'aux-vault-clipboard-offscreen',
  })) as { result?: T; error?: string };
  if (response?.error || response?.result === undefined)
    throw new Error(
      response?.error ?? 'The clipboard operation is unavailable.',
    );
  return response.result;
}
async function expire() {
  const state = (await chrome.storage.session.get(STATE))[STATE];
  if (!isClipboardLease(state)) return;
  if (state.deadline > Date.now()) {
    await chrome.alarms.create(ALARM, { when: state.deadline });
    return;
  }
  const result = await send<{ done: boolean }>({
    type: 'aux.vault.clipboard.expire',
    lease: state,
  });
  if (result.done) await chrome.storage.session.remove(STATE);
  else await chrome.alarms.create(ALARM, { delayInMinutes: 0.5 });
}
function popup(sender: chrome.runtime.MessageSender) {
  if (sender.id !== chrome.runtime.id || sender.tab || !sender.url)
    return false;
  const expected = new URL(chrome.runtime.getURL('index.html')),
    actual = new URL(sender.url);
  return (
    actual.protocol === expected.protocol &&
    actual.host === expected.host &&
    actual.pathname === expected.pathname
  );
}
export function installClipboardLifetime() {
  chrome.runtime.onMessage.addListener((message: unknown, sender, respond) => {
    if (!message || typeof message !== 'object') return;
    const request = message as {
      type?: string;
      value?: string;
      generation?: string;
    };
    if (request.type === 'aux.vault.clipboard.expired') {
      if (
        sender.id !== chrome.runtime.id ||
        sender.tab ||
        sender.url !== chrome.runtime.getURL('offscreen.html')
      )
        return;
      void enqueue(async () => {
        const state = (await chrome.storage.session.get(STATE))[STATE];
        if (
          isClipboardLease(state) &&
          state.generation === request.generation
        ) {
          await chrome.storage.session.remove(STATE);
          await chrome.alarms.clear(ALARM);
        }
      });
      return;
    }
    if (request.type !== 'aux.vault.clipboard.copy' || !popup(sender)) return;
    void enqueue(async () => {
      if (
        typeof request.value !== 'string' ||
        !request.value.length ||
        request.value.length > 1048576
      )
        throw new Error('The sensitive field is unavailable.');
      const previous = (await chrome.storage.session.get(STATE))[STATE];
      try {
        // Alarm exists before the write. The offscreen timer is a second path.
        await chrome.alarms.create(ALARM, {
          when: Date.now() + CLIPBOARD_LIFETIME_MS,
        });
        const result = await send<{ lease: ClipboardLease }>({
          type: 'aux.vault.clipboard.write',
          value: request.value,
        });
        if (!isClipboardLease(result.lease))
          throw new Error('Clipboard expiry could not be established.');
        await chrome.storage.session.set({ [STATE]: result.lease });
        await chrome.alarms.create(ALARM, { when: result.lease.deadline });
      } catch (error) {
        // A refused copy must not extend an earlier sensitive copy's lease.
        if (isClipboardLease(previous))
          await chrome.alarms.create(ALARM, { when: previous.deadline });
        throw error;
      }
      return { copied: true, clearAfterMs: CLIPBOARD_LIFETIME_MS };
    })
      .then((result) => respond({ result }))
      .catch(() =>
        respond({
          error:
            'The sensitive copy could not be completed with clipboard expiry. Try again.',
        }),
      );
    return true;
  });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM)
      void enqueue(expire).catch(() =>
        chrome.alarms.create(ALARM, { delayInMinutes: 0.5 }),
      );
  });
  // Restore a missed/restarted worker deadline without a plaintext cache.
  void enqueue(expire).catch(() => undefined);
}
