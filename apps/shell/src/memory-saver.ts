import type { PageTarget } from "@aux/contracts";
import { bridge, inNativeHost } from "./bridge";
import { useStore } from "./store";
import { featureStage } from "./use-feature";
import { recordMemorySaverCycle } from "./memory-saver-report";

type State = {
  pages: PageTarget[];
  activePageId: string | null;
  splitPageId: string | null;
  tabAudio: Record<string, { audible: boolean }>;
  settings: Record<string, unknown>;
  connected: boolean;
  restoringTabs: boolean;
};

export function nextMemorySaverAction(state: State, retryAfter: ReadonlyMap<string, number>) {
  const minutes = Number(state.settings.memorySaverMinutes ?? 0);
  if (!state.connected || state.restoringTabs || ![1, 15, 30, 60].includes(minutes)) return null;
  const candidates = state.pages.flatMap(page => {
    if (page.backend !== "aux" || !/^https?:\/\//.test(page.url) || page.ownedByRuntime ||
        page.pageId === state.activePageId || page.pageId === state.splitPageId ||
        page.controller !== "none" || page.loading || page.viewStatus === "crashed" || page.viewStatus === "detached" ||
        (page.lifecycle && page.lifecycle !== "live") || state.tabAudio[page.pageId]?.audible) return [];
    const dueAt = Math.max(page.lastActiveAt, page.createdAt) + minutes * 60_000;
    return [{ pageId: page.pageId, url: page.url, dueAt: Math.max(dueAt, retryAfter.get(`${page.pageId}\n${page.url}`) ?? 0) }];
  });
  candidates.sort((a, b) => a.dueAt - b.dueAt);
  return candidates[0] ?? null;
}

/** One timer per shell window; Chromium makes the final unsaved-work and media decision. */
export function installMemorySaver() {
  if (!inNativeHost || bridge.privateMode || bridge.quickAskMode || featureStage("tabLifecycle") !== "on") return () => {};
  const retryAfter = new Map<string, number>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running = false;
  let stopped = false;
  const schedule = () => {
    if (timer) clearTimeout(timer);
    if (stopped || running) return;
    const next = nextMemorySaverAction(useStore.getState(), retryAfter);
    if (!next) return;
    timer = setTimeout(async () => {
      timer = undefined;
      running = true;
      try {
        // The native method rechecks ownership, URL, focus, media and all frames.
        const result = await bridge.tabSleep(next.pageId, next.url);
        recordMemorySaverCycle(next, result);
      } catch { /* A reconnect or changed tab is retried after the quiet period. */ }
      finally {
        retryAfter.set(`${next.pageId}\n${next.url}`, Date.now() + 10 * 60_000);
        running = false;
        if (!stopped) schedule();
      }
    }, Math.max(0, next.dueAt - Date.now()));
  };
  const unsubscribe = useStore.subscribe((state, previous) => {
    if (state.pages !== previous.pages || state.activePageId !== previous.activePageId ||
        state.splitPageId !== previous.splitPageId || state.tabAudio !== previous.tabAudio ||
        state.settings !== previous.settings || state.connected !== previous.connected ||
        state.restoringTabs !== previous.restoringTabs) schedule();
  });
  schedule();
  return () => { stopped = true; if (timer) clearTimeout(timer); unsubscribe(); };
}
