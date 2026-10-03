import type { Effect, OriginAccess } from "@aux/contracts";
import { call, useStore } from "../../store";

/** Preserve the revision captured by the control; never overwrite a newer window's rule. */
export const DEFAULT_SITE_ACCESS: Record<Effect, OriginAccess> = {
  read: "allow",
  write: "allow",
  egress: "allow",
  credential: "ask",
  external_tool: "ask",
  destructive: "deny",
};
export async function setSiteAccess(input: {
  origin: string;
  effect: Effect;
  access: OriginAccess;
  expectedRevision: number;
}) {
  const snapshot = await call("safety.originPolicies.list", {});
  if (snapshot.revision !== input.expectedRevision)
    throw new Error("Site permissions changed in another window. Review the latest rules and try again.");
  const previous = snapshot.rules.find((rule) => rule.origin === input.origin);
  const replacement = {
    ...(previous ?? { origin: input.origin, access: "allow" as const, confirmation: "none" as const }),
    effects: { ...(previous ? previous.effects : DEFAULT_SITE_ACCESS), [input.effect]: input.access },
  };
  return call("safety.originPolicies.set", {
    expectedRevision: input.expectedRevision,
    rules: [...snapshot.rules.filter((rule) => rule.origin !== input.origin), replacement],
  });
}
export async function deleteSiteRule(input: { origin: string; expectedRevision: number }) {
  const snapshot = await call("safety.originPolicies.list", {});
  if (snapshot.revision !== input.expectedRevision)
    throw new Error("Site permissions changed in another window. Review the latest rules and try again.");
  return call("safety.originPolicies.set", {
    expectedRevision: input.expectedRevision,
    rules: snapshot.rules.filter((rule) => rule.origin !== input.origin),
  });
}
export async function setEffectGrants(input: { effectGrants: string[] }) {
  const allowed = new Set(["effect:read", "effect:write", "effect:egress", "effect:destructive"]);
  if (!input.effectGrants.includes("effect:read") || input.effectGrants.some((value) => !allowed.has(value)))
    throw new Error("Choose a valid set of agent permissions.");
  const result = await call("settings.set", { effectGrants: [...new Set(input.effectGrants)] });
  useStore.setState((state) => ({
    settings: { ...state.settings, effectGrants: [...new Set(input.effectGrants)] },
  }));
  return result;
}
