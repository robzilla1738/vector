import type { WebContents } from "electron";

// Inspect the document in an isolated world. Return only a boolean, never form values.
// Editors remain active because their save state cannot be inferred from the DOM.
const HAS_ACTIVE_WORK = `(() => {
  const inspect = root => {
    for (const element of root.querySelectorAll('*')) {
      if (element.shadowRoot && inspect(element.shadowRoot)) return true;
      if (element.isContentEditable) return true;
      if (element instanceof HTMLMediaElement && !element.paused && !element.ended) return true;
      if (element instanceof HTMLInputElement) {
        if (element.type === 'file' && element.files?.length) return true;
        if (['checkbox', 'radio'].includes(element.type) ? element.checked !== element.defaultChecked : element.value !== element.defaultValue) return true;
      }
      if (element instanceof HTMLTextAreaElement && element.value !== element.defaultValue) return true;
      if (element instanceof HTMLSelectElement) {
        const options = [...element.options];
        if (element.multiple) { if (options.some(option => option.selected !== option.defaultSelected)) return true; }
        else {
          const explicit = options.findLastIndex(option => option.defaultSelected);
          const initial = explicit >= 0 ? explicit : element.size <= 1 ? options.findIndex(option => !option.disabled && !(option.parentElement instanceof HTMLOptGroupElement && option.parentElement.disabled)) : -1;
          if (element.selectedIndex !== initial) return true;
        }
      }
    }
    return false;
  };
  return inspect(document);
})()`;

// Minimal dirty-state hints: user editing gestures flip a flag in the same
// isolated world the probe runs in. Covers paste, autofill, drag/drop and
// rich editors without any DOM walk. A missed hint is still caught by the
// field probe + full walk — the flag only ever says "look closer".
const INSTALL_DIRTY_HINTS = `(() => {
  if (globalThis.__auxDirtyInstalled) return true;
  globalThis.__auxDirtyInstalled = true;
  globalThis.__auxDirtyHint = false;
  const mark = () => { globalThis.__auxDirtyHint = true; };
  for (const type of ['input', 'change', 'paste', 'drop']) {
    window.addEventListener(type, mark, { capture: true, passive: true });
  }
  return true;
})()`;

// Cheap structural probe: no dirty events and no editable surface at all
// means the expensive walk can be skipped for this routine decision.
const DIRTY_PROBE = `(() => {
  if (globalThis.__auxDirtyHint) return 'dirty';
  return document.querySelector('input,textarea,select,[contenteditable="true"],[contenteditable=""],[contenteditable="plaintext-only"]') ? 'fields' : 'clean';
})()`;

const lifecycleWorld = (contents: WebContents, code: string, timeoutMs = 2000): Promise<unknown> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    contents.executeJavaScriptInIsolatedWorld(996, [{ code }]),
    new Promise<unknown>(resolve => { timer = setTimeout(() => resolve(undefined), timeoutMs); }),
  ]).finally(() => clearTimeout(timer));
};

/** Unknown or changing documents stay awake. Freezing is an optimization, never required. */
export async function hasPageWork(contents: WebContents): Promise<boolean> {
  if (contents.isDestroyed() || contents.isLoading() || contents.isCurrentlyAudible() || contents.isBeingCaptured()) return true;
  const frames = contents.mainFrame.framesInSubtree;
  // Electron exposes isolated execution only on WebContents. Keep embedded apps
  // awake rather than evaluating a suspension decision in website-controlled code.
  if (frames.length !== 1) return true;
  const frame = frames[0]!;
  const url = frame.url;
  try {
    // Install the hint collector for next time — idempotent and safe to run
    // every check since it no-ops once present.
    await lifecycleWorld(contents, INSTALL_DIRTY_HINTS);
    const probe = await lifecycleWorld(contents, DIRTY_PROBE);
    if (probe === "clean") {
      const current = contents.mainFrame.framesInSubtree;
      return !(current.length === 1 && current[0] === frame && frame.url === url);
    }
    const busy = await lifecycleWorld(contents, HAS_ACTIVE_WORK);
    if (busy !== false || contents.isDestroyed()) return true;
    const current = contents.mainFrame.framesInSubtree;
    return current.length !== 1 || current[0] !== frame || frame.url !== url;
  } catch { return true; }
}

/** Scroll offset captured before discard — restored on materialization. */
const SCROLL_POSITION = `({x: globalThis.scrollX ?? 0, y: globalThis.scrollY ?? 0})`;

export async function captureScrollPosition(contents: WebContents, timeoutMs = 1500): Promise<{ x: number; y: number } | null> {
  if (contents.isDestroyed()) return null;
  const frames = contents.mainFrame.framesInSubtree;
  if (frames.length !== 1) return null;
  const value = await lifecycleWorld(contents, SCROLL_POSITION, timeoutMs).catch(() => null);
  if (!value || typeof value !== "object") return null;
  const { x, y } = value as { x?: unknown; y?: unknown };
  return typeof x === "number" && typeof y === "number" ? { x, y } : null;
}

const RESTORE_SCROLL = (x: number, y: number) => `(() => { try { globalThis.scrollTo(${x}, ${y}); } catch {} })()`;

export async function restoreScrollPosition(contents: WebContents, position: { x: number; y: number }) {
  if (contents.isDestroyed() || (!position.x && !position.y)) return;
  await lifecycleWorld(contents, RESTORE_SCROLL(position.x, position.y)).catch(() => {});
}
