import { AuxError } from "@aux/contracts";
import type { MethodCtx } from "./context.js";
import { listSafetyActivity } from "../../services/safety-activity.js";

export async function safetyActivity(ctx: MethodCtx) {
  if (ctx.client.external || ctx.client.codeMode)
    throw new AuxError("permission_denied", "Agent activity is available in the Aux interface.");
  return listSafetyActivity(ctx.s.repo.db, ctx.s.featureProfileId ?? "default", ctx.params);
}
