import type { PageTarget, WindowKind } from "@aux/contracts";
import { bridge } from "./bridge";

type WindowPage = Pick<PageTarget, "windowId" | "ownedByRuntime" | "viewStatus"> & {
  anchor?: boolean;
  windowKind?: WindowKind;
};

/** Surface and lifecycle work belongs to the window that owns the WebContents. */
export const isLocal = (page: WindowPage, windowId = bridge.windowId) =>
  (page.windowId ?? "main") === windowId && !page.anchor && page.viewStatus !== "detached";

export const ownPages = <T extends WindowPage>(pages: readonly T[], windowId = bridge.windowId): T[] =>
  pages.filter(page => isLocal(page, windowId));

/** Normal windows share only the normal human strip; special windows stay local. */
export const inSharedSidebar = (page: WindowPage, windowId = bridge.windowId, kind: WindowKind = "normal") =>
  !page.anchor && !page.ownedByRuntime && page.viewStatus !== "detached" &&
  (kind === "normal" ? (page.windowKind ?? "normal") === "normal" : isLocal(page, windowId));

export const canClaim = (page: WindowPage & Pick<PageTarget, "controller">) =>
  !page.anchor && !page.ownedByRuntime && page.viewStatus !== "detached" &&
  (page.windowKind ?? "normal") === "normal" && page.controller !== "agent" && page.controller !== "external";

export const windowTabHint = (page: WindowPage & Pick<PageTarget, "controller">, windowId = bridge.windowId) =>
  !page.windowId || page.anchor || page.viewStatus === "detached" || (page.windowKind ?? "normal") !== "normal" || isLocal(page, windowId) ? undefined : canClaim(page)
    ? `Open in Window ${page.windowId} · click to move here`
    : `Aux is working in this tab in Window ${page.windowId}`;
