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

/** Unknown or changing documents stay awake. Freezing is an optimization, never required. */
export async function hasPageWork(contents: WebContents): Promise<boolean> {
  if (contents.isDestroyed() || contents.isLoading() || contents.isCurrentlyAudible() || contents.isBeingCaptured()) return true;
  const frames = contents.mainFrame.framesInSubtree;
  // Electron exposes isolated execution only on WebContents. Keep embedded apps
  // awake rather than evaluating a suspension decision in website-controlled code.
  if (frames.length !== 1) return true;
  const frame = frames[0]!;
  const url = frame.url;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const busy = await Promise.race([
      contents.executeJavaScriptInIsolatedWorld(996, [{ code: HAS_ACTIVE_WORK }]).then(value => value !== false),
      new Promise<boolean>(resolve => { timer = setTimeout(() => resolve(true), 2000); }),
    ]);
    if (busy || contents.isDestroyed()) return true;
    const current = contents.mainFrame.framesInSubtree;
    return current.length !== 1 || current[0] !== frame || frame.url !== url;
  } catch { return true; }
  finally { clearTimeout(timer); }
}
