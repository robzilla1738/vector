import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { bridge, type OmniboxResult } from "../../bridge";
import { useStore } from "../../store";

// Monotonic within this shell document, including unmount/remount and retries.
let nextQueryId = 0;
const empty: OmniboxResult["items"] = [];

type Snapshot = {
  query: string;
  generation: number;
  queryId: number;
  sequenceId: number;
  items: OmniboxResult["items"];
  error: string | null;
  ready: boolean;
};

/** Native browser providers stream independently of runtime work providers. */
export function useNativeOmnibox(enabled: boolean, query: string, generation: number) {
  const [retry, setRetry] = useState(0);
  const [snapshot, setSnapshot] = useState<Snapshot>({
    query: "",
    generation: -1,
    queryId: 0,
    sequenceId: 0,
    items: empty,
    error: null,
    ready: false,
  });
  const retried = useRef<Snapshot | null>(null);
  const windowId = bridge.windowId;
  const windowKind = bridge.windowKind;
  const privateMode = bridge.privateMode;
  const sameOwner = useCallback(
    () =>
      bridge.windowId === windowId && bridge.windowKind === windowKind && bridge.privateMode === privateMode,
    [windowId, windowKind, privateMode],
  );
  useLayoutEffect(() => {
    if (!enabled) return;
    const queryId = ++nextQueryId;
    let live = true;
    let latestSequence = -1;
    const current = () =>
      live &&
      bridge.windowId === windowId &&
      bridge.windowKind === windowKind &&
      bridge.privateMode === privateMode;
    const initial = { query, generation, queryId, sequenceId: 0, items: empty, error: null, ready: false };
    setSnapshot(initial);
    const unsubscribe = bridge.onOmniboxResult((result) => {
      if (
        !current() ||
        result.queryId !== queryId ||
        result.input !== query ||
        result.sequenceId < latestSequence
      )
        return;
      latestSequence = result.sequenceId;
      setSnapshot((current) => ({
        ...initial,
        ready: current.queryId === queryId && current.ready,
        sequenceId: result.sequenceId,
        items: result.items,
      }));
    });
    void Promise.resolve()
      .then(() =>
        current() ? bridge["omnibox.start"]({ queryId, input: query, onFocus: query.length === 0 }) : false,
      )
      .then((accepted) => {
        if (!current()) return;
        if (!accepted) setSnapshot({ ...initial, error: "The current browser query could not be started." });
        else setSnapshot((value) => (value.queryId === queryId ? { ...value, ready: true } : value));
      })
      .catch((error: unknown) => {
        if (current())
          setSnapshot({ ...initial, error: error instanceof Error ? error.message : String(error) });
      });
    return () => {
      live = false;
      unsubscribe();
      void bridge["omnibox.stop"](queryId).catch(() => {});
    };
  }, [enabled, query, generation, retry, windowId, windowKind, privateMode]);
  const isCurrent = enabled && snapshot.query === query && snapshot.generation === generation;
  const retryCurrent = useCallback(() => {
    if (!sameOwner() || !isCurrent || !snapshot.error || retried.current === snapshot)
      throw new Error("Choose the current browser suggestions Retry control.");
    retried.current = snapshot;
    setRetry((value) => value + 1);
  }, [isCurrent, snapshot, sameOwner]);
  const accept = useCallback(
    async (input: Parameters<(typeof bridge)["omnibox.open"]>[0]) => {
      const origin = useStore.getState(),
        path = window.location.href;
      const ownsView = () => {
        const current = useStore.getState();
        return (
          sameOwner() &&
          window.location.href === path &&
          current.mode === origin.mode &&
          current.conversationId === origin.conversationId &&
          current.overlay === origin.overlay &&
          current.focusRequest === origin.focusRequest &&
          (origin.overlay !== "settings" ||
            (current.settingsPageTitle === origin.settingsPageTitle &&
              current.settingsCategory === origin.settingsCategory))
        );
      };
      let retired = false;
      const unsubscribe = useStore.subscribe(() => {
        if (!ownsView()) retired = true;
      });
      const retireRoute = () => {
        retired = true;
      };
      const retireEditor = (event: Event) => {
        if (
          origin.overlay === "settings" &&
          event.target instanceof Element &&
          event.target.closest(".settings-page")
        )
          retired = true;
      };
      window.addEventListener("popstate", retireRoute);
      document.addEventListener("input", retireEditor, true);
      document.addEventListener("pointerdown", retireEditor, true);
      document.addEventListener("keydown", retireEditor, true);
      try {
        const accepted = await bridge["omnibox.open"](input);
        // Native acceptance bypasses activate(); reveal its foreground page through the same ordinary overlay retirement.
        // A newer route/editor remains owned by the user even if an earlier native acknowledgement arrives later.
        if (accepted && input.disposition !== "new-background-tab" && !retired && ownsView()) {
          const current = useStore.getState();
          if (current.overlay !== "find") current.setOverlay(null);
          current.setMode("focus");
        }
        return accepted;
      } finally {
        unsubscribe();
        window.removeEventListener("popstate", retireRoute);
        document.removeEventListener("input", retireEditor, true);
        document.removeEventListener("pointerdown", retireEditor, true);
        document.removeEventListener("keydown", retireEditor, true);
      }
    },
    [sameOwner],
  );
  const open = useCallback(
    async (
      match: OmniboxResult["items"][number],
      disposition: "current-tab" | "new-foreground-tab" | "new-background-tab",
    ) => {
      if (!sameOwner() || !isCurrent || !snapshot.items.some((item) => item.id === match.id))
        throw new Error("The browser suggestion changed. Choose it again.");
      const accepted = await accept({
        queryId: snapshot.queryId,
        match: { sequenceId: snapshot.sequenceId, index: match.index, url: match.url },
        disposition,
      });
      if (!accepted) throw new Error("The browser suggestion changed. Choose it again.");
    },
    [isCurrent, snapshot, sameOwner, accept],
  );
  const openInput = useCallback(
    async (disposition: "current-tab" | "new-foreground-tab" | "new-background-tab") => {
      if (!sameOwner() || !isCurrent) throw new Error("The browser query changed. Try again.");
      if (!(await accept({ queryId: snapshot.queryId, disposition })))
        throw new Error("The browser query changed. Try again.");
    },
    [isCurrent, snapshot.queryId, sameOwner, accept],
  );
  return {
    queryId: isCurrent ? snapshot.queryId : 0,
    items: isCurrent ? snapshot.items : empty,
    error: isCurrent ? snapshot.error : null,
    current: isCurrent,
    ready: isCurrent && snapshot.ready,
    retry: retryCurrent,
    open,
    openInput,
  };
}
