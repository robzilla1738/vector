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

/** "Browse freely, confirm consequences": unruled origins allow reads, writes and
 * navigation, ask for external tools, and deny only page-JS evaluation, which is
 * unreachable by model/MCP callers. Explicit rules can only tighten this. */
export function defaultAccessFor(effect: Effect): OriginAccess {
  if (effect === "destructive") return "deny";
  if (effect === "external_tool") return "ask";
  return "allow";
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
  const matching = (rules?: readonly OriginRule[]) => normalized
    ? rules?.map(rule => OriginRuleSchema.parse(rule)).filter(rule => rule.origin === `${normalized}/`) ?? [] : [];
  const managed = matching(input.managed);
  const user = matching(input.user);
  const accessFor = (rules: readonly OriginRule[]) => rules.reduce<OriginAccess | undefined>(
    (current, rule) => mostRestrictive(current, ruleAccess(rule, input.effect), ACCESS_RANK, "deny"), undefined);
  const managedAccess = accessFor(managed);
  const userAccess = accessFor(user);
  const access = normalized
    ? mostRestrictive(managedAccess, userAccess, ACCESS_RANK, defaultAccessFor(input.effect))
    : "deny";
  const source: PolicySource = managedAccess && (!userAccess || ACCESS_RANK[managedAccess] <= ACCESS_RANK[userAccess])
    ? "managed" : userAccess ? "user" : "default";
  const all = [...managed, ...user];
  const confirmation = all.reduce<OriginPolicyDecision["confirmation"] | undefined>(
    (current, rule) => rule.confirmation === undefined ? current
      : mostRestrictive(current, rule.confirmation, CONFIRM_RANK, "action"), undefined) ?? "action";
  const decision: OriginPolicyDecision = {
    access,
    confirmation,
    approvalLifetime: all.some(rule => rule.approvalLifetime === "turn") ? "turn"
      : all.some(rule => rule.approvalLifetime === "thread") ? "thread" : "turn",
    grantLifetime: all.some(rule => rule.grantLifetime === "session") ? "session"
      : all.some(rule => rule.grantLifetime === "always") ? "always" : "session",
    source,
    reason: !normalized ? "invalid_origin" : !managedAccess && !userAccess ? "no_matching_rule" : access === "deny" ? "explicit_deny" : "matched_rule",
    origin: normalized ?? "invalid",
    effect: input.effect,
  };
  input.audit({ ...decision, action: input.action, at: input.now ?? Date.now() });
  return decision;
}
