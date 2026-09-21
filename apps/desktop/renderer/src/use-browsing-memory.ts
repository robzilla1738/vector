import { useEffect, useState } from "react";
import type { BrowsingMemoryPolicy } from "@vector/contracts";
import { bridge, inElectron } from "./bridge";
import { call, useStore } from "./store";

/** The main process independently checks real window/stage visibility before recording. */
export function useBrowsingMemory() {
  const page = useStore(state => state.pages.find(page => page.pageId === state.activePageId));
  const layout = useStore(state => state.layout);
  const mode = useStore(state => state.mode);
  const overlay = useStore(state => state.overlay);
  const spaceId = page ? layout.tabSpace[page.pageId] ?? layout.activeSpaceId : undefined;
  const workspaceId = layout.spaces.find(space => space.id === spaceId)?.workspaceId;
  const [revision, refresh] = useState(0);
  useEffect(() => bridge.onEvent(event => {
    if (["workspace.browsingMemory.updated", "workspace.memory.updated"].includes(event.type) && event.payload.workspaceId === workspaceId) refresh(value => value + 1);
  }), [workspaceId]);
  useEffect(() => {
    if (!inElectron || bridge.privateMode || !workspaceId || spaceId !== layout.activeSpaceId || mode !== "focus" || overlay || !page || page.backend !== "vector" || page.ownedByRuntime || page.loading || page.viewStatus !== "visible") return;
    let cancelled = false, recording = false, recorded = false;
    let interval: number | undefined;
    const record = async () => {
      if (cancelled || recording || recorded) return;
      recording = true;
      try {
        const result = await call<{ recorded: boolean }>("workspaces.browsingMemory.record", { workspaceId, pageId: page.pageId, expectedDocumentEpoch: page.documentEpoch });
        recorded = result.recorded;
        if (recorded && interval !== undefined) window.clearInterval(interval);
      } catch { /* Reconnection or the next foreground check retries; never capture elsewhere. */ }
      finally { recording = false; }
    };
    const timer = window.setTimeout(() => {
      void call<{ policy: BrowsingMemoryPolicy }>("workspaces.browsingMemory.get", { workspaceId }).then(state => {
        if (cancelled || !state.policy.enabled) return;
        void record();
        interval = window.setInterval(() => void record(), 15_000);
      }).catch(() => {});
    }, 5000);
    return () => { cancelled = true; window.clearTimeout(timer); if (interval !== undefined) window.clearInterval(interval); };
  }, [workspaceId, spaceId, layout.activeSpaceId, mode, overlay, page?.pageId, page?.documentEpoch, page?.url, page?.title, page?.loading, page?.viewStatus, page?.ownedByRuntime, revision]);
}
