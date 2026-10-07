import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { bridge, type OmniboxResult } from "../../bridge";

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
    const initial = { query, generation, queryId, sequenceId: 0, items: empty, error: null };
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
      setSnapshot({ ...initial, sequenceId: result.sequenceId, items: result.items });
    });
    void Promise.resolve()
      .then(() =>
        current() ? bridge["omnibox.start"]({ queryId, input: query, onFocus: query.length === 0 }) : false,
      )
      .then((accepted) => {
        if (!accepted && current())
          setSnapshot({ ...initial, error: "The current browser query could not be started." });
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
  const open = useCallback(
    async (
      match: OmniboxResult["items"][number],
      disposition: "current-tab" | "new-foreground-tab" | "new-background-tab",
    ) => {
      if (!sameOwner() || !isCurrent || !snapshot.items.some((item) => item.id === match.id))
        throw new Error("The browser suggestion changed. Choose it again.");
      const accepted = await bridge["omnibox.open"]({
        queryId: snapshot.queryId,
        match: { sequenceId: snapshot.sequenceId, index: match.index, url: match.url },
        disposition,
      });
      if (!accepted) throw new Error("The browser suggestion changed. Choose it again.");
    },
    [isCurrent, snapshot, sameOwner],
  );
  const openInput = useCallback(
    async (disposition: "current-tab" | "new-foreground-tab" | "new-background-tab") => {
      if (!sameOwner() || !isCurrent) throw new Error("The browser query changed. Try again.");
      if (!(await bridge["omnibox.open"]({ queryId: snapshot.queryId, disposition })))
        throw new Error("The browser query changed. Try again.");
    },
    [isCurrent, snapshot.queryId, sameOwner],
  );
  return {
    queryId: isCurrent ? snapshot.queryId : 0,
    items: isCurrent ? snapshot.items : empty,
    error: isCurrent ? snapshot.error : null,
    current: isCurrent,
    retry: retryCurrent,
    open,
    openInput,
  };
}
