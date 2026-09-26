/**
 * Privilege-independent permission checks (Gate D / H2-C4). Model text cannot grant.
 */
import type { Effect, Step } from "@aux/contracts";

/** Step classification subset of the unified contract `Effect` taxonomy (safety.ts). */
export type EffectClass = Extract<Effect, "read" | "write" | "destructive" | "egress">;

/** Structured grant. `origin`/`scope` `*` and `expiresAt` 0 mean unrestricted/session. */
export interface PermissionGrant {
  effect: EffectClass | "*";
  origin: string;
  scope: string;
  expiresAt: number;
}

export type GrantInput = string | Partial<PermissionGrant> & { effect: PermissionGrant["effect"] };

export const DEFAULT_GRANTS = ["effect:read"] as const;
/** User-started work may edit the current page. Navigation and destructive actions need explicit grants. */
export const USER_RUN_GRANTS = ["effect:read", "effect:write"] as const;
export const ALL_EFFECT_GRANTS = ["effect:read", "effect:write", "effect:destructive", "effect:egress"] as const;

/** Child profile restriction is applied at dispatch, after ambient settings grants. */
export function subagentGrants(profile: "explorer" | "read_only" | "default" | undefined,
  ambient?: GrantSource): GrantSource {
  return profile === "explorer" || profile === "read_only" ? DEFAULT_GRANTS : ambient ?? DEFAULT_GRANTS;
}

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
  "fillCredential",
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
  "upload",
  "dialog",
  "stop",
]);

const DESTRUCTIVE_OPS = new Set(["evaluate"]);
const EGRESS_OPS = new Set(["navigate", "back", "forward", "reload"]);

/** Write-class ops that only move the viewport or pointer — nothing reaches the site. */
const LOCAL_ONLY_OPS = new Set(["hover", "scroll", "stop"]);

/** Single source of step classification; executor, durable writes and verification derive from it. */
export function classifyStep(op: string): EffectClass {
  if (EGRESS_OPS.has(op)) return "egress";
  if (DESTRUCTIVE_OPS.has(op)) return "destructive";
  if (WRITE_OPS.has(op)) return "write";
  return "read";
}

/** The step can change remote or document state, so its outcome is uncertain until observed. */
export function isConsequential(op: string): boolean {
  return classifyStep(op) !== "read" && !LOCAL_ONLY_OPS.has(op);
}

export function authorizeProgram(
  steps: Step[],
  grants: GrantSource = DEFAULT_GRANTS,
  origin = "",
  now = Date.now(),
): { ok: true } | { ok: false; denied: string; effect: EffectClass } {
  const allowed = sanitizeGrants(resolveGrants(grants)).map(parseGrant).filter((g): g is PermissionGrant => g != null);
  for (const step of steps) {
    let effect = classifyStep(step.op);
    let effectOrigin = origin;
    // back/forward/reload stay on this page. A same-origin navigate is the
    // same transition as clicking one of its links, which a user run may
    // already do. Crossing to another origin stays egress.
    if (step.op === "back" || step.op === "forward" || step.op === "reload") effect = "read";
    if (effect === "egress" && "url" in step && typeof step.url === "string") {
      try {
        // Opaque pages (about:blank) have origin "null", which is not a URL base.
        // Absolute destinations must be checked independently of the current page.
        let destination: URL;
        try { destination = new URL(step.url); }
        catch { destination = new URL(step.url, origin || undefined); }
        effectOrigin = destination.origin;
        if (origin && destination.origin === origin) effect = "read";
      } catch {
        return { ok: false, denied: `permission denied for ${step.op} (invalid destination)`, effect };
      }
    }
    if (allowed.some((g) => grantAllows(g, effect, effectOrigin, now))) continue;
    return { ok: false, denied: `permission denied for ${step.op} (effect:${effect})`, effect };
  }
  return { ok: true };
}
