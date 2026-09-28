import { bridge } from "./bridge";
import { browserLinkUrl } from "./browser-links";
import { useStore } from "./store";

const markerKey = `aux.peek.pending:${bridge.windowId}`;
let generation = 0;

function remember(id: string | null) {
  if (bridge.privateMode) return;
  try {
    if (id) localStorage.setItem(markerKey, id);
    else localStorage.removeItem(markerKey);
  } catch { /* A storage failure does not keep a preview open. */ }
}

/** A Peek is a background native page hidden from the shell tab strip until promotion. */
export async function openPeekLink(value: string): Promise<void> {
  const url = browserLinkUrl(value);
  if (!url) throw new Error("Only HTTP or HTTPS links without embedded credentials can be previewed.");
  const previous = useStore.getState().peekPageId;
  const token = ++generation;
  const id = `p_peek_${crypto.randomUUID().replaceAll("-", "")}`;
  useStore.setState({ peekPageId: id });
  remember(id);
  if (previous && previous !== id) void useStore.getState().closeTab(previous);
  try {
    const state = useStore.getState();
    const page = await state.openBackgroundTab(url, state.layout.activeSpaceId, false, id);
    if (token !== generation) {
      await useStore.getState().closeTab(page.pageId);
      return;
    }
    if (page.pageId !== id) {
      useStore.setState({ peekPageId: page.pageId });
      remember(page.pageId);
    }
  } catch (error) {
    if (token === generation) { useStore.setState({ peekPageId: null }); remember(null); }
    throw error;
  }
}

export async function closePeekLink(): Promise<void> {
  const id = useStore.getState().peekPageId;
  if (!id) return;
  ++generation;
  await useStore.getState().closeTab(id);
  if (!useStore.getState().pages.some(page => page.pageId === id)) {
    useStore.setState({ peekPageId: null });
    remember(null);
  }
}

export async function promotePeekLink(): Promise<void> {
  const id = useStore.getState().peekPageId;
  if (!id || !useStore.getState().pages.some(page => page.pageId === id)) return;
  ++generation;
  useStore.setState({ peekPageId: null });
  remember(null);
  try { await useStore.getState().activate(id); }
  catch (error) {
    if (useStore.getState().pages.some(page => page.pageId === id)) {
      useStore.setState({ peekPageId: id }); remember(id);
    }
    throw error;
  }
}

/** Close a disposable Peek left by a renderer crash before normal tab restore. */
export function recoverPeekLink(): () => void {
  if (bridge.privateMode) return () => {};
  let id: string | null = null;
  try { id = localStorage.getItem(markerKey); } catch { return () => {}; }
  if (!id) return () => {};
  let closing = false;
  let timeout = 0;
  const check = (state: ReturnType<typeof useStore.getState>) => {
    if (closing || !state.pages.some(page => page.pageId === id)) return;
    closing = true;
    void state.closeTab(id!).finally(() => {
      if (!useStore.getState().pages.some(page => page.pageId === id)) remember(null);
      window.clearTimeout(timeout);
      unsubscribe();
    });
  };
  const unsubscribe = useStore.subscribe(check);
  timeout = window.setTimeout(() => { unsubscribe(); }, 30_000);
  check(useStore.getState());
  return () => { window.clearTimeout(timeout); unsubscribe(); };
}
