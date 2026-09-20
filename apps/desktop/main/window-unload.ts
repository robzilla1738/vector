import type { EventEmitter } from 'node:events';
import type { WebContents } from 'electron';

const pending = new WeakSet<WebContents>();

async function bounded<T>(operation: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([operation, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Unload check timed out')), 15000);
    })]);
  } finally { clearTimeout(timer); }
}

// Electron 43.6.0 emits this after Chromium's real beforeunload traversal and
// before destroying the document. Keep the version guard and native smoke test
// together when upgrading: this is deliberately an internal API dependency.
export async function approveWindowUnload(contents: WebContents[], isCurrent = () => true): Promise<boolean> {
  if (process.versions.electron !== '43.6.0') return false;
  for (const wc of contents) {
    if (!isCurrent() || wc.isDestroyed() || pending.has(wc)) return false;
    try {
      // A harmless listener forces the native traversal even on clean pages.
      // Isolated-world code cannot be replaced by website scripts. This does
      // not dispatch synthetic events or manufacture a dirty-page decision.
      await bounded(wc.executeJavaScriptInIsolatedWorld(998, [{code: `
        if (!globalThis.auxUnloadSentinel) {
          globalThis.auxUnloadSentinel = () => {};
          addEventListener('beforeunload', globalThis.auxUnloadSentinel);
        }
      `}]));
      if (!isCurrent() || wc.isDestroyed()) return false;
      const approved = await new Promise<boolean>(resolve => {
        pending.add(wc);
        const timer = setTimeout(() => resolve(false), 15000);
        const done = (event: Electron.Event, proceed: boolean) => {
          event.preventDefault();
          pending.delete(wc);
          clearTimeout(timer);
          wc.removeListener('destroyed', destroyed);
          resolve(proceed);
        };
        const destroyed = () => { pending.delete(wc); clearTimeout(timer); resolve(false); };
        // Keep the one-shot veto installed on timeout: a late acknowledgement
        // must never destroy a document after the exit attempt was canceled.
        (wc as EventEmitter).once('-before-unload-fired', done);
        wc.once('destroyed', destroyed);
        wc.close({waitForBeforeUnload: true});
      });
      if (!pending.has(wc) && !wc.isDestroyed()) {
        await bounded(wc.executeJavaScriptInIsolatedWorld(998, [{code: `
          removeEventListener('beforeunload', globalThis.auxUnloadSentinel);
          delete globalThis.auxUnloadSentinel;
        `}]));
      }
      if (!approved) return false;
    } catch { return false; }
  }
  return true;
}
