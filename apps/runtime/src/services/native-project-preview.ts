import { AuxError, type RpcChannel } from "@aux/contracts";
import { z } from "zod";
import type { TerminalService } from "./terminals.js";
const admission = z
  .object({ terminalId: z.string().uuid(), previewId: z.string().uuid(), token: z.string().uuid() })
  .strict();
/** No public API can grant the native guest's original Project authority. */
export function registerNativeProjectPreview(
  channel: Pick<RpcChannel, "onMethod">,
  deps: { current: () => boolean; terminals: () => TerminalService },
) {
  let stopped = false;
  channel.onMethod("projects.preview.admit", async (raw) => {
    if (stopped || !deps.current()) throw new AuxError("ref_stale", "Original Preview connection retired.");
    const p = admission.parse(raw);
    const allowed = await deps.terminals().admitPreview(p.terminalId, p.previewId, p.token);
    return allowed && !stopped && deps.current();
  });
  return () => {
    stopped = true;
  };
}
