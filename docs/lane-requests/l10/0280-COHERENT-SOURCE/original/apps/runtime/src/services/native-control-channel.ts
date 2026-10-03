import { AuxError, type AuxErrorCode, type RpcChannel } from "@aux/contracts";
import type { PageService } from "./pages.js";

type NativeControlPages = Pick<PageService, "get" | "livePageIds" | "takeover">;

/** Bind only to the authenticated Profile host channel, never the public API. */
export function registerNativeControlChannel(
  channel: RpcChannel,
  pages: NativeControlPages,
  onNoteError: (code: AuxErrorCode) => void,
): void {
  const takeover = async (raw: unknown) => {
    if (
      !raw ||
      typeof raw !== "object" ||
      Array.isArray(raw) ||
      Object.keys(raw).length !== 1 ||
      !("pageId" in raw) ||
      typeof raw.pageId !== "string" ||
      !/^\S{1,256}$/.test(raw.pageId)
    )
      throw new AuxError("invalid_params", "Native takeover requires one page identity.");
    const pageId = raw.pageId;
    if (!pages.livePageIds().includes(pageId))
      throw new AuxError("not_found", "The native page is no longer live.");
    const page = pages.get(pageId);
    if (page.backend !== "aux")
      throw new AuxError("permission_denied", "This page does not belong to the native host.");
    if (page.viewStatus === "detached" || page.viewStatus === "crashed")
      throw new AuxError("conflict", "The native page is no longer available for input.");
    if (page.controller !== "agent" && page.controller !== "external" && page.controller !== "human")
      return {
        accepted: false,
        reason: "not_automated",
        pageId,
        controller: page.controller,
        controllerEpoch: page.controllerEpoch,
      };
    // Await the state transition so failure cannot become an accepted receipt.
    // An already human-held page is idempotent in ControlAuthority.takeover.
    const held = await pages.takeover(pageId);
    if (held.controller !== "human") throw new AuxError("conflict", "Native takeover was not applied.");
    // This acknowledges runtime control state, not completion of native egress
    // revocation or an end-to-end physical-input latency measurement.
    return { accepted: true, pageId, controller: held.controller, controllerEpoch: held.controllerEpoch };
  };
  channel.onMethod("view.takeover", takeover);
  channel.onNotify((type, payload) => {
    if (type === "view.takeover")
      void takeover(payload).catch((error) =>
        onNoteError(error instanceof AuxError ? error.code : "internal"),
      );
  });
}
