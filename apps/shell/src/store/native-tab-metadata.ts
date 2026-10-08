import type { PageTarget } from "@aux/contracts";

/** Runtime content updates cannot overwrite native placement or ordinary tab lifecycle. */
export const retainNativeTabMetadata = (
  previous: PageTarget,
  next: PageTarget,
  catalogVersion: number,
): PageTarget =>
  catalogVersion > 0
    ? {
        ...next,
        windowId: previous.windowId,
        windowKind: previous.windowKind,
        anchor: previous.anchor,
        split: previous.split,
        lastActiveAt: previous.lastActiveAt,
        ...(!previous.ownedByRuntime && previous.backend === "aux" && previous.lifecycle !== undefined
          ? {
              lifecycle: previous.lifecycle,
              viewStatus: next.viewStatus === "detached" ? previous.viewStatus : next.viewStatus,
            }
          : {}),
      }
    : next;
