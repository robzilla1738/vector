/**
 * Privilege-independent permission checks (Gate D / H2-C4). Model text cannot grant.
 */
import type { Step } from "@vector/contracts";

export type EffectClass = "read" | "write" | "destructive" | "egress";

/** Structured grant. `origin`/`scope` `*` and `expiresAt` 0 mean unrestricted/session. */
export interface PermissionGrant {
  effect: EffectClass | "*";
  origin: string;
  scope: string;
  expiresAt: number;
}

export type GrantInput = string | Partial<PermissionGrant> & { effect: PermissionGrant["effect"] };

export const DEFAULT_GRANTS = ["effect:read"] as const;
/** User-started `runs.start` is the grant. Page text cannot expand this. */
export const USER_RUN_GRANTS = ["effect:read", "effect:write", "effect:egress"] as const;
export const ALL_EFFECT_GRANTS = ["effect:read", "effect:write", "effect:destructive", "effect:egress"] as const;

export const KNOWN_GRANTS = ["effect:read", "effect:write", "effect:destructive", "effect:egress", "effect:*"] as const;

export type GrantSource = readonly GrantInput[] | (() => readonly GrantInput[]);

/** Settings / PageService / coordinator share one grant list. Functions re-read after settings.set. */
export function resolveGrants(grants?: GrantSource): readonly GrantInput[] {
  if (typeof grants === "function") return grants();
  return grants ?? DEFAULT_GRANTS;
}

export function parseGrant(raw: unknown): PermissionGrant | null {
  if (typeof raw === "string") {
    if (raw === "effect:*") return { effect: "*", origin: "*", scope: "*", expiresAt: 0 };
    const m = /^effect:(read|write|destructive|egress)$/.exec(raw);
    if (!m) return null;
    return { effect: m[1] as EffectClass, origin: "*", scope: "*", expiresAt: 0 };
  }
  if (!raw || typeof raw !== "object" || !("effect" in raw)) return null;
  const effect = (raw as { effect: unknown }).effect;
  if (effect !== "*" && effect !== "read" && effect !== "write" && effect !== "destructive" && effect !== "egress") {
    return null;
  }
  const rec = raw as Record<string, unknown>;
  return {
    effect,
    origin: typeof rec.origin === "string" && rec.origin ? rec.origin : "*",
    scope: typeof rec.scope === "string" && rec.scope ? rec.scope : "*",
    expiresAt: typeof rec.expiresAt === "number" && rec.expiresAt > 0 ? rec.expiresAt : 0,
  };
}

export function grantAllows(grant: PermissionGrant, needed: EffectClass, origin: string, now: number): boolean {
  if (grant.expiresAt > 0 && now >= grant.expiresAt) return false;
  if (grant.origin !== "*" && grant.origin !== origin) return false;
  if (grant.scope !== "*" && grant.scope !== "page") return false;
  return grant.effect === "*" || grant.effect === needed;
}

/** Compact wildcard grants to `effect:…` strings; keep origin/expiry as objects. */
export function sanitizeGrants(raw: unknown): GrantInput[] {
  const parsed = (Array.isArray(raw) ? raw : []).map(parseGrant).filter((g): g is PermissionGrant => g != null);
  if (!parsed.some((g) => g.effect === "read" || g.effect === "*")) {
    parsed.unshift({ effect: "read", origin: "*", scope: "*", expiresAt: 0 });
  }
  const out = parsed.length ? parsed : [{ effect: "read" as const, origin: "*", scope: "*", expiresAt: 0 }];
  return out.map((g) =>
    g.origin === "*" && g.scope === "*" && g.expiresAt === 0
      ? g.effect === "*"
        ? "effect:*"
        : `effect:${g.effect}`
      : g,
  );
}

const WRITE_OPS = new Set([
  "click",
  "dblclick",
  "fill",
  "type",
  "press",
  "select",
  "check",
  "uncheck",
  "navigate",
  "submit",
  "hover",
  "scroll",
  "dragTo",
  "clickPoint",
]);

const DESTRUCTIVE_OPS = new Set(["evaluate"]);

export function classifyStep(op: string): EffectClass {
  if (op === "navigate") return "egress";
  if (DESTRUCTIVE_OPS.has(op)) return "destructive";
  if (WRITE_OPS.has(op)) return "write";
  return "read";
}

export function authorizeProgram(
  steps: Step[],
  grants: GrantSource = DEFAULT_GRANTS,
  origin = "",
  now = Date.now(),
): { ok: true } | { ok: false; denied: string; effect: EffectClass } {
  const allowed = sanitizeGrants(resolveGrants(grants)).map(parseGrant).filter((g): g is PermissionGrant => g != null);
  for (const step of steps) {
    const effect = classifyStep(step.op);
    if (allowed.some((g) => grantAllows(g, effect, origin, now))) continue;
    return { ok: false, denied: `permission denied for ${step.op} (effect:${effect})`, effect };
  }
  return { ok: true };
}
