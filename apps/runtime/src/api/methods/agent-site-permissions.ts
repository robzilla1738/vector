import { AuxError, EventTypes } from "@aux/contracts";
import type { MethodCtx } from "./context.js";
import { OriginPolicyStore } from "../../safety/origin-policy-store.js";

function owner(ctx: MethodCtx): OriginPolicyStore {
  if (ctx.client.external) throw new AuxError("permission_denied", "Manage agent access in Aux.");
  return new OriginPolicyStore(ctx.s.repo);
}

async function h_safety_originPolicies_list(ctx: MethodCtx) {
  return owner(ctx).list();
}

async function h_safety_originPolicies_set(ctx: MethodCtx) {
  const store = owner(ctx);
  const before = store.list();
  const saved = store.set(ctx.params);
  await ctx.s.safetyAuthority.policies(before.rules, saved.rules);
  ctx.s.events.emit(EventTypes.SettingsChanged, { settings: ctx.s.settings.all() });
  return saved;
}

export const agentSitePermissionMethods = {
  "safety.originPolicies.list": h_safety_originPolicies_list,
  "safety.originPolicies.set": h_safety_originPolicies_set,
};
