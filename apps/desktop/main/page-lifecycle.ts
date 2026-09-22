/**
 * Tab lifecycle policy (BR-03): placeholder → live → frozen → discarded.
 *
 * The policy is pure — index.ts feeds it current signals and performs the
 * actuation (CDP freeze, view destroy, materialize). Freezing is always an
 * optimization, never required: any uncertainty keeps the page live.
 */

export type TabLifecycle = "placeholder" | "live" | "frozen" | "discarded";

/** Hidden for this long → freeze (suspends timers, keeps the renderer). */
export const IDLE_FREEZE_MS = 10 * 60_000;
/** Frozen for this long → discard (destroys the renderer, record survives). */
export const FROZEN_DISCARD_MS = 30 * 60_000;
/** Restored tabs materialize at this cadence under idle — never a boot herd. */
export const IDLE_MATERIALIZE_MS = 1_500;
export const IDLE_MATERIALIZE_MAX = 20;

export interface FreezeSignals {
  popup: boolean;
  /** Owning runtime is trusted; a paused run's pages become freezable. */
  runtimeOwned: boolean;
  agentPaused: boolean;
  focused: boolean;
  split: boolean;
  offscreenHold: boolean;
  downloading: boolean;
  mediaAllowed: boolean;
  /** Dirty-state probe result — dirty or unknown stays live. */
  busy: boolean;
  audible: boolean;
  loading: boolean;
  captured: boolean;
  destroyed: boolean;
}

/** Every reason a page must stay live. Frozen is the exception. */
export function freezeBlockedReason(s: FreezeSignals): string | null {
  if (s.destroyed) return "destroyed";
  if (s.focused) return "focused";
  if (s.split) return "split";
  if (s.popup) return "popup";
  if (s.offscreenHold) return "offscreen-hold";
  if (s.downloading) return "downloading";
  if (s.runtimeOwned && !s.agentPaused) return "agent-active";
  if (s.mediaAllowed) return "media-permission";
  if (s.busy) return "busy";
  if (s.audible) return "audible";
  if (s.loading) return "loading";
  if (s.captured) return "captured";
  return null;
}

export const canFreeze = (s: FreezeSignals) => freezeBlockedReason(s) === null;

/** Discard candidates: already frozen and still protected by nothing new.
 *  Agent pages are never discarded — the runtime driver would lose its
 *  target; a paused agent freezes instead. Popups own their window. */
export function discardBlockedReason(s: Omit<FreezeSignals, "busy" | "audible" | "loading" | "captured" | "mediaAllowed">): string | null {
  if (s.destroyed) return "destroyed";
  if (s.focused) return "focused";
  if (s.split) return "split";
  if (s.popup) return "popup";
  if (s.offscreenHold) return "offscreen-hold";
  if (s.downloading) return "downloading";
  if (s.runtimeOwned) return "agent-owned";
  return null;
}

export const canDiscard = (s: Parameters<typeof discardBlockedReason>[0]) => discardBlockedReason(s) === null;

/**
 * Tracks which agent-owned pages belong to paused runs — those pages release
 * resources until the run resumes. Fed by `run.updated` events.
 */
export function createPausedAgentTracker() {
  const pausedPages = new Set<string>();
  const byRun = new Map<string, Set<string>>();

  /** A page stays paused while any paused run still lists it. */
  const unhold = (pageId: string) => {
    for (const set of byRun.values()) if (set.has(pageId)) return;
    pausedPages.delete(pageId);
  };

  /** Returns the pageIds that left the paused set (callers wake them). */
  const observe = (runId: string | undefined, pageIds: readonly string[] | undefined, status: string | undefined): string[] => {
    if (!runId) return [];
    const previous = byRun.get(runId) ?? new Set<string>();
    const next = status === "paused" && pageIds?.length ? new Set(pageIds) : new Set<string>();
    if (next.size) byRun.set(runId, next);
    else byRun.delete(runId);
    const left = [...previous].filter(id => !next.has(id));
    for (const id of left) unhold(id);
    for (const id of next) pausedPages.add(id);
    return left;
  };

  const isPaused = (pageId: string) => pausedPages.has(pageId);
  const forget = (pageId: string) => {
    if (!pausedPages.has(pageId)) return;
    for (const [runId, set] of byRun) {
      set.delete(pageId);
      if (!set.size) byRun.delete(runId);
    }
    pausedPages.delete(pageId);
  };

  return { observe, isPaused, forget };
}
