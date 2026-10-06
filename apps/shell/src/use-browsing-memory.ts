import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { bridge, inNativeHost } from "./bridge";
import { call, useStore } from "./store";

/** The main process independently checks real window/stage visibility before recording. */
export function useBrowsingMemory() {
  const page = useStore(
    useShallow((state) => {
      const page = state.pages.byId[state.activePageId ?? ""];
      return (
        page && {
          pageId: page.pageId,
          documentEpoch: page.documentEpoch,
          url: page.url,
          title: page.title,
          loading: page.loading,
          viewStatus: page.viewStatus,
          ownedByRuntime: page.ownedByRuntime,
          backend: page.backend,
        }
      );
    }),
  );
  const activeSpaceId = useStore((state) => state.layout.activeSpaceId);
  const spaceId = useStore((state) =>
    page ? (state.layout.tabSpace[page.pageId] ?? state.layout.activeSpaceId) : undefined,
  );
  const workspaceId = useStore(
    (state) => state.layout.spaces.find((space) => space.id === spaceId)?.workspaceId,
  );
  const mode = useStore((state) => state.mode);
  const overlay = useStore((state) => state.overlay);
  const [revision, refresh] = useState(0);
  useEffect(
    () =>
      bridge.onEvent((event) => {
        if (
          ["workspace.browsingMemory.updated", "workspace.memory.updated"].includes(event.type) &&
          event.payload.workspaceId === workspaceId
        )
          refresh((value) => value + 1);
      }),
    [workspaceId],
  );
  useEffect(() => {
    if (
      !inNativeHost ||
      bridge.privateMode ||
      !workspaceId ||
      spaceId !== activeSpaceId ||
      mode !== "focus" ||
      overlay ||
      !page ||
      page.backend !== "aux" ||
      page.ownedByRuntime ||
      page.loading ||
      page.viewStatus !== "visible"
    )
      return;
    let cancelled = false,
      recording = false,
      recorded = false;
    let interval: number | undefined;
    const record = async () => {
      if (cancelled || recording || recorded) return;
      recording = true;
      try {
        const result = await call("workspaces.browsingMemory.record", {
          workspaceId,
          pageId: page.pageId,
          expectedDocumentEpoch: page.documentEpoch,
        });
        recorded = result.recorded;
        if (recorded && interval !== undefined) window.clearInterval(interval);
      } catch {
        /* Reconnection or the next foreground check retries; never capture elsewhere. */
      } finally {
        recording = false;
      }
    };
    const timer = window.setTimeout(() => {
      void call("workspaces.browsingMemory.get", { workspaceId })
        .then((state) => {
          if (cancelled || !state.policy.enabled) return;
          void record();
          interval = window.setInterval(() => void record(), 15_000);
        })
        .catch(() => {});
    }, 5000);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [
    workspaceId,
    spaceId,
    activeSpaceId,
    mode,
    overlay,
    page?.pageId,
    page?.documentEpoch,
    page?.url,
    page?.title,
    page?.loading,
    page?.viewStatus,
    page?.ownedByRuntime,
    revision,
  ]);
}

/** Mounted beside the shell so memory bookkeeping never re-renders the app root. */
export function BrowsingMemoryWatch() {
  useBrowsingMemory();
  return null;
}
