import { type Effect, type OriginAccess, type OriginRule, OriginRuleSchema } from "@aux/contracts";

export type PolicySource = "managed" | "user" | "default";
export interface OriginPolicyDecision {
  access: OriginAccess;
  confirmation: "handoff" | "action" | "preapprovable" | "none";
  approvalLifetime: "turn" | "thread";
  grantLifetime: "session" | "always";
  source: PolicySource;
  reason: string;
  origin: string;
  effect: Effect;
}
export interface OriginPolicyAudit extends OriginPolicyDecision { at: number; action: string }

const ACCESS_RANK: Record<OriginAccess, number> = { deny: 0, ask: 1, allow: 2 };
const CONFIRM_RANK = { handoff: 0, action: 1, preapprovable: 2, none: 3 } as const;

/** Parse rather than normalize: scheme, credentials, paths and opaque origins must never broaden a rule. */
export function exactOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
    return url.origin;
  } catch { return null; }
}

function ruleAccess(rule: OriginRule | undefined, effect: Effect): OriginAccess | undefined {
  if (!rule) return undefined;
  if (rule.access === "deny") return "deny";
  return rule.effects?.[effect] ?? rule.access;
}

function mostRestrictive<T extends string>(a: T | undefined, b: T | undefined, rank: Record<T, number>, fallback: T): T {
  if (!a && !b) return fallback;
  if (!a) return b!;
  if (!b) return a;
  return rank[a] <= rank[b] ? a : b;
}

/** Managed policy and user settings can each tighten; neither can override a deny. */
export function evaluateOriginPolicy(input: {
  url: string;
  effect: Effect;
  action: string;
  managed?: readonly OriginRule[];
  user?: readonly OriginRule[];
  audit: (decision: OriginPolicyAudit) => void;
  now?: number;
}): OriginPolicyDecision {
  const normalized = exactOrigin(input.url);
  const managed = normalized ? input.managed?.map(rule => OriginRuleSchema.parse(rule)).find(rule => rule.origin === `${normalized}/`) : undefined;
  const user = normalized ? input.user?.map(rule => OriginRuleSchema.parse(rule)).find(rule => rule.origin === `${normalized}/`) : undefined;
  const managedAccess = ruleAccess(managed, input.effect);
  const userAccess = ruleAccess(user, input.effect);
  const access = normalized
    ? mostRestrictive(managedAccess, userAccess, ACCESS_RANK, "deny")
    : "deny";
  const source: PolicySource = managedAccess && (!userAccess || ACCESS_RANK[managedAccess] <= ACCESS_RANK[userAccess])
    ? "managed" : userAccess ? "user" : "default";
  const decision: OriginPolicyDecision = {
    access,
    confirmation: mostRestrictive(managed?.confirmation, user?.confirmation, CONFIRM_RANK, "action"),
    approvalLifetime: managed?.approvalLifetime === "turn" || user?.approvalLifetime === "turn" ? "turn" : managed?.approvalLifetime ?? user?.approvalLifetime ?? "turn",
    grantLifetime: managed?.grantLifetime === "session" || user?.grantLifetime === "session" ? "session" : managed?.grantLifetime ?? user?.grantLifetime ?? "session",
    source,
    reason: !normalized ? "invalid_origin" : !managedAccess && !userAccess ? "no_matching_rule" : access === "deny" ? "explicit_deny" : "matched_rule",
    origin: normalized ?? "invalid",
    effect: input.effect,
  };
  input.audit({ ...decision, action: input.action, at: input.now ?? Date.now() });
  return decision;
}
