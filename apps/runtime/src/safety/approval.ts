import { exactOrigin } from "@aux/contracts/util/exact-origin";
import { createHash, randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import {
  ApprovalDecisionSchema,
  SafetyActionSchema,
  type ApprovalDecision,
  type AuthorizationProvenance,
  type SafetyAction,
} from "@aux/contracts";
import { agentPolicyCategoryFor, policyFor, type AgentPolicySettings } from "@aux/contracts";

export type AuthorizationDecision =
  | { status: "authorized"; provenance: AuthorizationProvenance }
  | { status: "ask"; guidance: string }
  | { status: "denied"; guidance: string }
  | { status: "touch_id"; guidance: string }
  | { status: "handoff"; guidance: string };

const DENIED =
  "Do not retry while this action is denied. Ask the user to change the permission or choose a permitted action.";
const ASK =
  "Pause this action and request approval from the user. Do not dispatch or retry while approval is pending.";

function fingerprint(action: SafetyAction, lifetime: "turn" | "thread"): string {
  return createHash("sha256")
    .update(
      JSON.stringify([
        action.profileId,
        action.scope.kind,
        action.scope.id,
        action.effect,
        action.action,
        action.invocationDigest,
        action.category ?? null,
        action.confirmation ?? null,
        action.authentication ?? null,
        action.policyRevision ?? 0,
        action.credentialTarget ?? null,
        action.amount ?? null,
        action.origin ?? null,
        action.recipient ?? null,
        lifetime === "turn" ? action.turnId : null,
        action.threadId,
      ]),
    )
    .digest("hex");
}

/** Local, durable authorization store. Call `authorize` again immediately before dispatch. */
export class ApprovalStore {
  private deviceSites = new Map<string, { revision: number; approvalId: string }>();
  constructor(
    private readonly db: DatabaseSync,
    private readonly audit: (event: Record<string, unknown>) => void = () => {},
    private readonly persistSitePolicy?: (action: SafetyAction) => void,
    private readonly currentPolicy: () => AgentPolicySettings = () => ({ agentMode: "auto", agentPolicyRevision: 0, agentPolicies: [] }),
  ) {}

  issue(actionInput: SafetyAction, lifetime: "turn" | "thread", now = Date.now()): string {
    const action = SafetyActionSchema.parse(actionInput);
    const existing = this.db
      .prepare(
        `SELECT approval_id AS approvalId FROM safety_approval_requests
      WHERE fingerprint=? AND thread_id=? AND turn_id=? AND lifetime=? AND state='pending' AND expires_at>?
      ORDER BY created_at DESC LIMIT 1`,
      )
      .get(fingerprint(action, lifetime), action.threadId, action.turnId, lifetime, now) as
      { approvalId: string } | undefined;
    if (existing) return existing.approvalId;
    const approvalId = randomUUID();
    // Thread approvals still expire; they may be used by the same thread for one dispatch.
    const expiresAt = now + (lifetime === "turn" ? 30 * 60_000 : 24 * 60 * 60_000);
    this.db
      .prepare(
        `INSERT INTO safety_approval_requests(approval_id,fingerprint,action_json,turn_id,thread_id,lifetime,expires_at,state,created_at)
      VALUES(?,?,?,?,?,?,?,'pending',?)`,
      )
      .run(
        approvalId,
        fingerprint(action, lifetime),
        JSON.stringify(action),
        action.turnId,
        action.threadId,
        lifetime,
        expiresAt,
        now,
      );
    this.audit({
      kind: "approval_issued",
      approvalId,
      action: action.action,
      effect: action.effect,
      at: now,
    });
    return approvalId;
  }

  /** An acceptance the person already gave for this exact action, still unused. */
  acceptedFor(actionInput: SafetyAction, lifetime: "turn" | "thread", now = Date.now()): string | undefined {
    const action = SafetyActionSchema.parse(actionInput);
    const row = this.db
      .prepare(
        `SELECT approval_id AS approvalId FROM safety_approval_requests
      WHERE fingerprint=? AND thread_id=? AND lifetime=? AND state='accepted' AND expires_at>?
        AND (lifetime='thread' OR turn_id=?)
      ORDER BY decided_at DESC LIMIT 1`,
      )
      .get(fingerprint(action, lifetime), action.threadId, lifetime, now, action.turnId) as
      { approvalId: string } | undefined;
    return row?.approvalId;
  }

  pending(
    threadId: string,
    now = Date.now(),
  ): Array<{ approvalId: string; action: SafetyAction; expiresAt: number }> {
    const rows = this.db
      .prepare(
        `SELECT approval_id AS approvalId,action_json AS actionJson,expires_at AS expiresAt
      FROM safety_approval_requests WHERE thread_id=? AND state='pending' AND expires_at>? ORDER BY created_at`,
      )
      .all(threadId, now) as { approvalId: string; actionJson: string; expiresAt: number }[];
    return rows.map((row) => ({
      approvalId: row.approvalId,
      action: SafetyActionSchema.parse(JSON.parse(row.actionJson)),
      expiresAt: row.expiresAt,
    }));
  }

  /** The native approval UI sends an ID and expected turn; the saved action is authoritative. */
  decideLocal(raw: ApprovalDecision, expectedTurnId: string, now = Date.now()): SafetyAction {
    const decision = ApprovalDecisionSchema.parse(raw);
    const row = this.db
      .prepare(
        "SELECT action_json AS actionJson,turn_id AS turnId FROM safety_approval_requests WHERE approval_id=?",
      )
      .get(decision.approvalId) as { actionJson: string; turnId: string } | undefined;
    if (!row || row.turnId !== expectedTurnId) throw new Error("Stale or unknown approval turn");
    const action = SafetyActionSchema.parse(JSON.parse(row.actionJson));
    this.recordLocalDecision(decision, action, now);
    return action;
  }

  /** Only a trusted native UI handler may call this method. Never expose it as a model tool. */
  recordLocalDecision(raw: ApprovalDecision, actionInput: SafetyAction, now = Date.now()): void {
    const decision = ApprovalDecisionSchema.parse(raw);
    const action = SafetyActionSchema.parse(actionInput);
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const row = this.db
        .prepare("SELECT * FROM safety_approval_requests WHERE approval_id=?")
        .get(decision.approvalId) as
        | {
            fingerprint: string;
            action_json: string;
            turn_id: string;
            thread_id: string;
            lifetime: "turn" | "thread";
            expires_at: number;
            state: string;
          }
        | undefined;

      if (
        !row ||
        row.state !== "pending" ||
        row.expires_at <= now ||
        row.fingerprint !== fingerprint(action, row.lifetime) ||
        row.turn_id !== action.turnId ||
        row.thread_id !== action.threadId
      )
        throw new Error("Forged, expired, or stale approval");
      const accepting = decision.decision === "accept" || decision.decision === "acceptForOrigin";
      if (accepting) this.assertPolicyRevision(action);
      if (accepting && action.authentication === "touch_id")
        throw new Error("This action requires trusted device authentication.");
      if (decision.decision === "acceptForOrigin" && (!action.origin || action.recipient || !this.persistSitePolicy))
        throw new Error("A site permission requires an exact origin and a trusted policy writer.");
      const state =
        decision.decision === "decline" || decision.decision === "acceptWithAmendment"
          ? "declined"
          : decision.decision === "cancel"
            ? "cancelled"
            : decision.decision === "acceptForOrigin"
              ? "consumed"
              : "accepted";
      this.db
        .prepare("UPDATE safety_approval_requests SET state=?,decision=?,decided_at=? WHERE approval_id=?")
        .run(state, decision.decision, now, decision.approvalId);
      if (decision.decision === "acceptForOrigin") this.persistSitePolicy!(action);
      this.db.exec("COMMIT");
      this.audit({
        kind: "approval_decided",
        approvalId: decision.approvalId,
        decision: decision.decision,
        at: now,
      });
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  /** Owner takeover/Stop retires pending and accepted authority before a late native reply can redeem it. */
  retireTurn(turnId: string, threadId: string, now = Date.now()): void {
    this.db.prepare("UPDATE safety_approval_requests SET state='cancelled',decision='cancel',decided_at=? WHERE turn_id=? AND thread_id=? AND state IN ('pending','accepted')").run(now, turnId, threadId);
    this.audit({ kind: "approval_turn_retired", turnId, threadId, at: now });
  }

  clearDeviceAuthentication(): void {
    this.deviceSites.clear();
  }

  private assertPolicyRevision(action: SafetyAction): void {
    if ((action.policyRevision ?? 0) !== this.currentPolicy().agentPolicyRevision)
      throw new Error("Agent permissions changed; refresh this approval.");
  }

  private deviceSiteKey(action: SafetyAction): string | undefined {
    const site = action.origin ? exactOrigin(action.origin) : undefined;
    return site ? JSON.stringify([action.profileId, site]) : undefined;
  }

  prepareDevice(approvalId: string, expectedTurnId: string, now = Date.now()): { action: SafetyAction; fingerprint: string; expiresAt: number; policyRevision: number } {
    const row = this.db.prepare("SELECT action_json,fingerprint,state,expires_at,turn_id FROM safety_approval_requests WHERE approval_id=?")
      .get(approvalId) as { action_json: string; fingerprint: string; state: string; expires_at: number; turn_id: string } | undefined;
    if (!row || row.state !== "pending" || row.expires_at <= now || row.turn_id !== expectedTurnId)
      throw new Error("Expired, replaced, or unknown device confirmation.");
    const action = SafetyActionSchema.parse(JSON.parse(row.action_json));
    if (action.authentication !== "touch_id") throw new Error("This action is not awaiting device authentication.");
    this.assertPolicyRevision(action);
    return { action, fingerprint: row.fingerprint, expiresAt: row.expires_at, policyRevision: action.policyRevision ?? 0 };
  }

  /** Called only after the native authentication channel verifies the original pending request. */
  confirmDevice(approvalId: string, expectedTurnId: string, expectedFingerprint: string, now = Date.now()): SafetyAction {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const row = this.db.prepare("SELECT action_json,fingerprint,state,expires_at,turn_id FROM safety_approval_requests WHERE approval_id=?")
        .get(approvalId) as { action_json: string; fingerprint: string; state: string; expires_at: number; turn_id: string } | undefined;
      if (!row || row.state !== "pending" || row.expires_at <= now || row.turn_id !== expectedTurnId || row.fingerprint !== expectedFingerprint)
        throw new Error("Expired, replaced, or unknown device confirmation.");
      const action = SafetyActionSchema.parse(JSON.parse(row.action_json));
      if (action.authentication !== "touch_id") throw new Error("This action is not awaiting device authentication.");
      this.assertPolicyRevision(action);
      this.db.prepare("UPDATE safety_approval_requests SET state='accepted',decision='device',decided_at=? WHERE approval_id=? AND state='pending'").run(now, approvalId);
      this.db.exec("COMMIT");
      if (agentPolicyCategoryFor(action.category ?? "external_tool", action.action) === "credentials") {
        const key = this.deviceSiteKey(action);
        if (key) {
          this.deviceSites.delete(key);
          this.deviceSites.set(key, { revision: action.policyRevision ?? 0, approvalId });
          if (this.deviceSites.size > 2048) this.deviceSites.delete(this.deviceSites.keys().next().value!);
        }
      }
      this.audit({ kind: "device_confirmation", approvalId, at: now });
      return action;
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }

  /** Policy is evaluated anew and exceptional one-time approval is consumed at dispatch. */
  authorize(input: {
    action: SafetyAction;
    settings: AgentPolicySettings;
    approvalId?: string;
    consume?: boolean;
    now?: number;
  }): AuthorizationDecision {
    const action = SafetyActionSchema.parse(input.action);
    const now = input.now ?? Date.now();
    if ((action.policyRevision ?? 0) !== input.settings.agentPolicyRevision)
      return this.auditDecision({ status: "denied", guidance: "Agent permissions changed; refresh this action." }, action, now);
    const category = agentPolicyCategoryFor(action.category ?? "external_tool", action.action);
    const policy = policyFor({
      mode: input.settings.agentMode,
      category,
      site: action.origin,
      amount: action.amount,
      overrides: input.settings.agentPolicies,
    });
    if (policy.disposition === "block") return this.auditDecision({ status: "denied", guidance: DENIED }, action, now);
    if (policy.disposition === "handoff") return this.auditDecision({ status: "handoff", guidance: "Complete this action directly in the site, then return to Aux." }, action, now);
    if (policy.disposition === "allow") return this.auditDecision({ status: "authorized", provenance: { authorizedBy: "policy", policySource: policy.source } }, action, now);
    this.db.exec("BEGIN IMMEDIATE");
    try {
      if (input.approvalId) {
        const row = this.db.prepare("SELECT fingerprint,turn_id,thread_id,lifetime,expires_at,state,decision FROM safety_approval_requests WHERE approval_id=?").get(input.approvalId) as {
          fingerprint: string; turn_id: string; thread_id: string; lifetime: "turn" | "thread"; expires_at: number; state: string; decision: string;
        } | undefined;
        if (row?.state === "accepted" && row.expires_at > now && row.fingerprint === fingerprint(action, row.lifetime) &&
          (row.lifetime === "thread" || row.turn_id === action.turnId) && row.thread_id === action.threadId &&
          (policy.disposition !== "touch_id" || (action.authentication === "touch_id" && row.decision === "device"))) {
          if (input.consume !== false) this.db.prepare("UPDATE safety_approval_requests SET state='consumed' WHERE approval_id=? AND state='accepted'").run(input.approvalId);
          this.db.exec("COMMIT");
          return this.auditDecision({ status: "authorized", provenance: { authorizedBy: "approval", approvalId: input.approvalId } }, action, now);
        }
      }
      this.db.exec("COMMIT");
      const key = this.deviceSiteKey(action);
      const memo = key ? this.deviceSites.get(key) : undefined;
      if (category === "credentials" && input.settings.agentMode === "auto" && policy.source === "default" && memo?.revision === input.settings.agentPolicyRevision) {
        this.audit({ kind: "credential_site_authenticated", profileId: action.profileId, origin: action.origin, policyRevision: memo.revision, deviceApprovalId: memo.approvalId, at: now });
        return this.auditDecision({ status: "authorized", provenance: { authorizedBy: "policy", policySource: "default" } }, action, now);
      }
      return this.auditDecision(policy.disposition === "touch_id" ? { status: "touch_id", guidance: "Confirm this action with Touch ID in Aux." } : { status: "ask", guidance: ASK }, action, now);
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }

  private auditDecision<T extends AuthorizationDecision>(decision: T, action: SafetyAction, at: number): T {
    this.audit({
      kind: "authorization_decision",
      status: decision.status,
      provenance: decision.status === "authorized" ? decision.provenance : undefined,
      profileId: action.profileId,
      scope: action.scope,
      effect: action.effect,
      action: action.action,
      origin: action.origin,
      recipient: action.recipient,
      at,
    });
    return decision;
  }
}
