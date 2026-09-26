import { createHash, randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { ApprovalDecisionSchema, SafetyActionSchema, type ApprovalDecision, type AuthorizationProvenance, type SafetyAction, type StandingGrant } from "@aux/contracts";
import type { OriginPolicyDecision } from "./origin-policy.js";

export type LocalCeiling = "never" | "ask" | "always";
export type AuthorizationDecision =
  | { status: "authorized"; provenance: AuthorizationProvenance }
  | { status: "ask"; guidance: string }
  | { status: "denied"; guidance: string };

const DENIED = "Do not retry while this action is denied. Ask the user to change the permission or choose a permitted action.";
const ASK = "Pause this action and request approval from the user. Do not dispatch or retry while approval is pending.";

function fingerprint(action: SafetyAction, lifetime: "turn" | "thread"): string {
  return createHash("sha256").update(JSON.stringify([
    action.profileId, action.scope.kind, action.scope.id, action.effect, action.action,
    action.invocationDigest, action.origin ?? null, action.recipient ?? null, lifetime === "turn" ? action.turnId : null, action.threadId,
  ])).digest("hex");
}

type GrantRow = { grant_id: string; profile_id: string; scope_kind: string; scope_id: string; effect: string; action: string; origin: string | null; recipient: string | null; lifetime: string; session_id: string | null; created_at: number; revoked_at: number | null };

/** Local, durable authorization store. Call `authorize` again immediately before dispatch. */
export class ApprovalStore {
  constructor(private readonly db: DatabaseSync, private readonly audit: (event: Record<string, unknown>) => void = () => {}) {
    db.exec(`CREATE TABLE IF NOT EXISTS safety_approval_requests(
      approval_id TEXT PRIMARY KEY, fingerprint TEXT NOT NULL, action_json TEXT NOT NULL, turn_id TEXT NOT NULL, thread_id TEXT NOT NULL,
      lifetime TEXT NOT NULL CHECK(lifetime IN ('turn','thread')), expires_at INTEGER NOT NULL,
      state TEXT NOT NULL CHECK(state IN ('pending','accepted','declined','cancelled','consumed')),
      decision TEXT, created_at INTEGER NOT NULL, decided_at INTEGER);
      CREATE TABLE IF NOT EXISTS safety_standing_grants(
      grant_id TEXT PRIMARY KEY, profile_id TEXT NOT NULL, scope_kind TEXT NOT NULL, scope_id TEXT NOT NULL,
      effect TEXT NOT NULL, action TEXT NOT NULL, origin TEXT, recipient TEXT,
      lifetime TEXT NOT NULL CHECK(lifetime IN ('session','always')), session_id TEXT,
      created_at INTEGER NOT NULL, revoked_at INTEGER);
      CREATE INDEX IF NOT EXISTS idx_safety_grants_lookup ON safety_standing_grants(profile_id,scope_kind,scope_id,effect,action,origin,recipient,revoked_at);
      CREATE INDEX IF NOT EXISTS idx_safety_approvals_turn ON safety_approval_requests(turn_id,state);`);
  }

  issue(actionInput: SafetyAction, lifetime: "turn" | "thread", now = Date.now()): string {
    const action = SafetyActionSchema.parse(actionInput);
    const existing = this.db.prepare(`SELECT approval_id AS approvalId FROM safety_approval_requests
      WHERE fingerprint=? AND thread_id=? AND turn_id=? AND lifetime=? AND state='pending' AND expires_at>?
      ORDER BY created_at DESC LIMIT 1`).get(fingerprint(action, lifetime), action.threadId, action.turnId, lifetime, now) as { approvalId: string } | undefined;
    if (existing) return existing.approvalId;
    const approvalId = randomUUID();
    // Thread approvals still expire; they may be used by the same thread for one dispatch.
    const expiresAt = now + (lifetime === "turn" ? 30 * 60_000 : 24 * 60 * 60_000);
    this.db.prepare(`INSERT INTO safety_approval_requests(approval_id,fingerprint,action_json,turn_id,thread_id,lifetime,expires_at,state,created_at)
      VALUES(?,?,?,?,?,?,?,'pending',?)`).run(approvalId, fingerprint(action, lifetime), JSON.stringify(action), action.turnId, action.threadId, lifetime, expiresAt, now);
    this.audit({ kind: "approval_issued", approvalId, action: action.action, effect: action.effect, at: now });
    return approvalId;
  }

  /** An acceptance the person already gave for this exact action, still unused. */
  acceptedFor(actionInput: SafetyAction, lifetime: "turn" | "thread", now = Date.now()): string | undefined {
    const action = SafetyActionSchema.parse(actionInput);
    const row = this.db.prepare(`SELECT approval_id AS approvalId FROM safety_approval_requests
      WHERE fingerprint=? AND thread_id=? AND lifetime=? AND state='accepted' AND expires_at>?
        AND (lifetime='thread' OR turn_id=?)
      ORDER BY decided_at DESC LIMIT 1`).get(fingerprint(action, lifetime), action.threadId, lifetime, now, action.turnId) as { approvalId: string } | undefined;
    return row?.approvalId;
  }

  pending(threadId: string, now = Date.now()): Array<{ approvalId: string; action: SafetyAction; expiresAt: number }> {
    const rows = this.db.prepare(`SELECT approval_id AS approvalId,action_json AS actionJson,expires_at AS expiresAt
      FROM safety_approval_requests WHERE thread_id=? AND state='pending' AND expires_at>? ORDER BY created_at`)
      .all(threadId, now) as { approvalId: string; actionJson: string; expiresAt: number }[];
    return rows.map(row => ({ approvalId: row.approvalId, action: SafetyActionSchema.parse(JSON.parse(row.actionJson)), expiresAt: row.expiresAt }));
  }

  /** The native approval UI sends an ID and expected turn; the saved action is authoritative. */
  decideLocal(raw: ApprovalDecision, expectedTurnId: string, now = Date.now()): void {
    const decision = ApprovalDecisionSchema.parse(raw);
    const row = this.db.prepare("SELECT action_json AS actionJson,turn_id AS turnId FROM safety_approval_requests WHERE approval_id=?")
      .get(decision.approvalId) as { actionJson: string; turnId: string } | undefined;
    if (!row || row.turnId !== expectedTurnId) throw new Error("Stale or unknown approval turn");
    this.recordLocalDecision(decision, SafetyActionSchema.parse(JSON.parse(row.actionJson)), now);
  }

  /** Only a trusted native UI handler may call this method. Never expose it as a model tool. */
  recordLocalDecision(raw: ApprovalDecision, actionInput: SafetyAction, now = Date.now()): void {
    const decision = ApprovalDecisionSchema.parse(raw);
    const action = SafetyActionSchema.parse(actionInput);
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const row = this.db.prepare("SELECT * FROM safety_approval_requests WHERE approval_id=?").get(decision.approvalId) as {
        fingerprint: string; turn_id: string; thread_id: string; lifetime: "turn" | "thread"; expires_at: number; state: string;
      } | undefined;
      if (!row || row.state !== "pending" || row.expires_at <= now || row.fingerprint !== fingerprint(action, row.lifetime)
        || row.turn_id !== action.turnId || row.thread_id !== action.threadId) throw new Error("Forged, expired, or stale approval");
      const state = decision.decision === "decline" || decision.decision === "acceptWithAmendment" ? "declined"
        : decision.decision === "cancel" ? "cancelled" : decision.decision === "acceptForSession" ? "consumed" : "accepted";
      this.db.prepare("UPDATE safety_approval_requests SET state=?,decision=?,decided_at=? WHERE approval_id=?")
        .run(state, decision.decision, now, decision.approvalId);
      if (decision.decision === "acceptForSession") {
        this.db.prepare(`INSERT INTO safety_standing_grants(
          grant_id,profile_id,scope_kind,scope_id,effect,action,origin,recipient,lifetime,session_id,created_at)
          VALUES(?,?,?,?,?,?,?,?,?,?,?)`)
          .run(randomUUID(), action.profileId, action.scope.kind, action.scope.id, action.effect,
            action.action, action.origin ?? null, action.recipient ?? null, "session", decision.sessionId, now);
      }
      this.db.exec("COMMIT");
      this.audit({ kind: "approval_decided", approvalId: decision.approvalId, decision: decision.decision, at: now });
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }

  grant(actionInput: SafetyAction, lifetime: "session" | "always", sessionId?: string, now = Date.now()): StandingGrant {
    const action = SafetyActionSchema.parse(actionInput);
    if (lifetime === "session" && !sessionId) throw new Error("Session grant requires a session ID");
    const grantId = randomUUID();
    this.db.prepare(`INSERT INTO safety_standing_grants(
      grant_id,profile_id,scope_kind,scope_id,effect,action,origin,recipient,lifetime,session_id,created_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?)`)
      .run(grantId, action.profileId, action.scope.kind, action.scope.id, action.effect, action.action,
        action.origin ?? null, action.recipient ?? null, lifetime, sessionId ?? null, now);
    this.audit({ kind: "grant_created", grantId, effect: action.effect, action: action.action, at: now });
    return { grantId, profileId: action.profileId, scope: action.scope, effect: action.effect,
      action: action.action, ...(action.origin ? { origin: action.origin } : {}), ...(action.recipient ? { recipient: action.recipient } : {}),
      lifetime, ...(sessionId ? { sessionId } : {}), createdAt: now };
  }

  listGrants(profileId: string): StandingGrant[] {
    const rows = this.db.prepare(`SELECT * FROM safety_standing_grants WHERE profile_id=? AND revoked_at IS NULL ORDER BY created_at DESC`)
      .all(profileId) as GrantRow[];
    return rows.map(row => ({
      grantId: row.grant_id, profileId: row.profile_id,
      scope: { kind: row.scope_kind as "workspace" | "task", id: row.scope_id },
      effect: row.effect as StandingGrant["effect"], action: row.action,
      ...(row.origin ? { origin: row.origin } : {}), ...(row.recipient ? { recipient: row.recipient } : {}),
      lifetime: row.lifetime as "session" | "always", ...(row.session_id ? { sessionId: row.session_id } : {}),
      createdAt: row.created_at,
    }));
  }

  revoke(filter: { profileId: string; scope?: SafetyAction["scope"]; effect?: SafetyAction["effect"]; grantId?: string }, now = Date.now()): number {
    const clauses = ["profile_id=?", "revoked_at IS NULL"];
    const values: Array<string | number> = [filter.profileId];
    if (filter.scope) { clauses.push("scope_kind=?", "scope_id=?"); values.push(filter.scope.kind, filter.scope.id); }
    if (filter.effect) { clauses.push("effect=?"); values.push(filter.effect); }
    if (filter.grantId) { clauses.push("grant_id=?"); values.push(filter.grantId); }
    const changed = this.db.prepare(`UPDATE safety_standing_grants SET revoked_at=? WHERE ${clauses.join(" AND ")}`).run(now, ...values).changes;
    this.audit({ kind: "grants_revoked", count: changed, profileId: filter.profileId, at: now });
    return Number(changed);
  }

  /** Atomically consumes one-time approvals. A revoked grant is rejected at dispatch time. */
  authorize(input: { action: SafetyAction; policy: OriginPolicyDecision; ceiling: LocalCeiling; sessionId?: string; approvalId?: string; approvalOnly?: boolean; consume?: boolean; now?: number }): AuthorizationDecision {
    const action = SafetyActionSchema.parse(input.action);
    const now = input.now ?? Date.now();
    if (input.ceiling === "never" || input.policy.access === "deny") return this.auditDecision({ status: "denied", guidance: DENIED }, action, now);
    if (!input.approvalOnly && input.policy.access === "allow" && input.ceiling === "always") {
      return this.auditDecision({ status: "authorized", provenance: { authorizedBy: "policy", policySource: input.policy.source } }, action, now);
    }
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const grants = this.db.prepare(`SELECT * FROM safety_standing_grants WHERE profile_id=? AND scope_kind=? AND scope_id=?
        AND effect=? AND action=? AND origin IS ? AND recipient IS ? AND revoked_at IS NULL ORDER BY created_at DESC`)
        .all(action.profileId, action.scope.kind, action.scope.id, action.effect, action.action, action.origin ?? null, action.recipient ?? null) as GrantRow[];
      const grant = input.approvalOnly ? undefined : grants.find(row => row.lifetime === "always" || row.session_id === input.sessionId && !!input.sessionId);
      if (grant) {
        this.db.exec("COMMIT");
        return this.auditDecision({ status: "authorized", provenance: { authorizedBy: "standing", grantId: grant.grant_id } }, action, now);
      }
      if (input.approvalId) {
        const row = this.db.prepare("SELECT * FROM safety_approval_requests WHERE approval_id=?").get(input.approvalId) as {
          fingerprint: string; turn_id: string; thread_id: string; lifetime: "turn" | "thread"; expires_at: number; state: string;
        } | undefined;
        if (row?.state === "accepted" && row.expires_at > now && row.fingerprint === fingerprint(action, row.lifetime)
          && (row.lifetime === "thread" || row.turn_id === action.turnId) && row.thread_id === action.threadId) {
          if (input.consume !== false) this.db.prepare("UPDATE safety_approval_requests SET state='consumed' WHERE approval_id=? AND state='accepted'").run(input.approvalId);
          this.db.exec("COMMIT");
          return this.auditDecision({ status: "authorized", provenance: { authorizedBy: "approval", approvalId: input.approvalId } }, action, now);
        }
      }
      this.db.exec("COMMIT");
      return this.auditDecision({ status: "ask", guidance: ASK }, action, now);
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }

  private auditDecision<T extends AuthorizationDecision>(decision: T, action: SafetyAction, at: number): T {
    this.audit({ kind: "authorization_decision", status: decision.status, provenance: decision.status === "authorized" ? decision.provenance : undefined,
      profileId: action.profileId, scope: action.scope, effect: action.effect, action: action.action, origin: action.origin, recipient: action.recipient, at });
    return decision;
  }
}
