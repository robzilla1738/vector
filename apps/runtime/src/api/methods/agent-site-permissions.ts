import { AuxError, EventTypes } from "@aux/contracts";
import type { MethodCtx } from "./context.js";
import { OriginPolicyStore } from "../../safety/origin-policy-store.js";

function owner(ctx: MethodCtx): OriginPolicyStore {
  if (ctx.client.external) throw new AuxError("permission_denied", "Manage agent access in Aux.");
  return new OriginPolicyStore(ctx.s.repo);
}

export const agentSitePermissionMethods = {
  "safety.originPolicies.list": async (ctx: MethodCtx) => owner(ctx).list(),
  "safety.originPolicies.set": async (ctx: MethodCtx) => {
    const saved = owner(ctx).set(ctx.params);
    ctx.s.events.emit(EventTypes.SettingsChanged, { settings: ctx.s.settings.all() });
    return saved;
  },
};
