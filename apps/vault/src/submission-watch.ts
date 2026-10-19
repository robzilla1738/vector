export type SubmissionTarget = {
  tabId: number;
  frameId: number;
  documentId: string;
  documentUrl: string;
  topLevelUrl: string;
  createdAt: number;
  token: string;
  accountId: number;
};
const STATE = 'auxVaultSubmissionTargets';
const ALARM = 'aux-vault-submission-security';
function valid(value: unknown): value is SubmissionTarget {
  if (!value || typeof value !== 'object') return false;
  const target = value as SubmissionTarget;
  return (
    Number.isInteger(target.tabId) &&
    Number.isInteger(target.frameId) &&
    Number.isInteger(target.accountId) &&
    Number.isFinite(target.createdAt) &&
    typeof target.token === 'string' &&
    target.token.length <= 100 &&
    typeof target.documentId === 'string' &&
    target.documentId.length <= 100 &&
    typeof target.documentUrl === 'string' &&
    /^https?:/.test(target.documentUrl) &&
    target.documentUrl.length <= 16384 &&
    typeof target.topLevelUrl === 'string' &&
    /^https?:/.test(target.topLevelUrl) &&
    target.topLevelUrl.length <= 16384
  );
}
export function installSubmissionWatch(
  targets: Map<number, SubmissionTarget>,
  dismiss: (target: SubmissionTarget) => Promise<void>,
  security: () => Promise<{ accountId: number; locked: boolean }>,
) {
  let writes: Promise<unknown> = Promise.resolve();
  const ready = chrome.storage.session.get(STATE).then((state) => {
    const rows = state[STATE];
    if (Array.isArray(rows))
      for (const row of rows.slice(0, 100))
        if (valid(row)) targets.set(row.tabId, row);
  });
  function changed() {
    const rows = Array.from(targets.values());
    writes = writes
      .catch(() => undefined)
      .then(async () => {
        if (rows.length) {
          await chrome.storage.session.set({ [STATE]: rows });
          await chrome.alarms.create(ALARM, { delayInMinutes: 0.5 });
        } else {
          await chrome.storage.session.remove(STATE);
          await chrome.alarms.clear(ALARM);
        }
      });
    return writes;
  }
  async function check() {
    await ready;
    if (!targets.size) return;
    let state: { accountId: number; locked: boolean } | undefined;
    try {
      state = await security();
    } catch {
      /* Fail closed; no credential data in the watcher. */
    }
    for (const target of Array.from(targets.values()))
      if (
        !state ||
        state.locked ||
        target.accountId !== state.accountId ||
        Date.now() - target.createdAt >= 120000
      )
        await dismiss(target);
    await changed();
  }
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM) void check().catch(() => undefined);
  });
  void ready.then(check).catch(() => undefined);
  return {
    ready,
    changed,
    clear: async () => {
      await ready;
      for (const target of Array.from(targets.values())) await dismiss(target);
      await changed();
    },
  };
}
