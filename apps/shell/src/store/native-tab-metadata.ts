import type { PageTarget } from "@aux/contracts";

/** Runtime content updates cannot overwrite the native catalog's placement. */
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
      }
    : next;
