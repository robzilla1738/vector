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
import {
  agentPolicyCategoryFor,
  policyFor,
  policyForCategories,
  type AgentPolicySettings,
  type Run,
} from "@aux/contracts";

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
        action.runId ?? null,
        action.runAuthorityRevision ?? 0,
        action.policyCategories ?? null,
        action.reviewedChanges ?? null,
        action.reviewedActions ?? null,
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
    private readonly persistSitePolicy?: (action: SafetyAction, scope?: "site" | "global") => void,
    private readonly currentPolicy: () => AgentPolicySettings = () => ({
      agentMode: "ask",
      agentPolicyRevision: 0,
      agentPolicies: [],
    }),
    private readonly resolveRun?: (runId: string) => Pick<Run, "status" | "config"> | undefined,
    private readonly records?: Pick<
      import("../store/repo.js").Repo,
      "protectRecordField" | "revealRecordField"
    >,
  ) {}

  private serializeAction(action: SafetyAction, approvalId: string): string {
    const json = JSON.stringify(action);
    return this.records
      ? this.records.protectRecordField("safety_approval_requests", [approvalId], "action_json", json)
      : json;
  }

  private parseAction(json: string, approvalId: string): SafetyAction {
    const plain = this.records
      ? this.records.revealRecordField("safety_approval_requests", [approvalId], "action_json", json)
      : json;
    return SafetyActionSchema.parse(JSON.parse(plain));
  }

  effectivePolicy(settings: AgentPolicySettings, runId?: string): AgentPolicySettings {
    const mode = runId ? this.resolveRun?.(runId)?.config?.agentMode : undefined;
    return mode ? { ...settings, agentMode: mode } : settings;
  }

  runAuthorityRevision(runId?: string): number {
    if (!runId) return 0;
    const row = this.db.prepare("SELECT revision FROM safety_run_authority WHERE run_id=?").get(runId) as
      { revision: number } | undefined;
    return row?.revision ?? 0;
  }

  revokeRunGrants(runId: string, now = Date.now()): void {
    this.db.exec("SAVEPOINT revoke_run_grants");
    try {
      this.db
        .prepare("UPDATE safety_run_grants SET revoked_at=? WHERE run_id=? AND revoked_at IS NULL")
        .run(now, runId);
      this.db
        .prepare(
          "INSERT INTO safety_run_authority(run_id,revision) VALUES(?,1) ON CONFLICT(run_id) DO UPDATE SET revision=revision+1",
        )
        .run(runId);
      this.db.exec("RELEASE revoke_run_grants");
      this.audit({ kind: "run_grants_revoked", runId, at: now });
    } catch (error) {
      this.db.exec("ROLLBACK TO revoke_run_grants; RELEASE revoke_run_grants");
      throw error;
    }
  }

  private runIsActive(runId: string): boolean {
    const run = this.resolveRun?.(runId);
    return !!run && !["completed", "partially_completed", "cancelled", "failed"].includes(run.status);
  }

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
        this.serializeAction(action, approvalId),
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

  issueBatch(
    actions: SafetyAction[],
    summaries: NonNullable<SafetyAction["reviewedActions"]>,
    now = Date.now(),
  ): string {
    if (!actions.length) throw new Error("A reviewed batch requires an action.");
    const primary = actions[0]!;
    if (
      actions.some(
        (action) =>
          action.profileId !== primary.profileId ||
          action.runId !== primary.runId ||
          action.turnId !== primary.turnId ||
          action.threadId !== primary.threadId ||
          action.authentication,
      )
    )
      throw new Error("A reviewed batch must belong to one ordinary run.");
    const parent = { ...primary, reviewedActions: summaries };
    this.db.exec("SAVEPOINT issue_reviewed_batch");
    try {
      const approvalId = this.issue(parent, "turn", now);
      for (const action of actions) {
        const digest = fingerprint(action, "turn");
        this.db
          .prepare("INSERT OR IGNORE INTO safety_approval_batch_members(approval_id,fingerprint) VALUES(?,?)")
          .run(approvalId, digest);
        this.db
          .prepare(
            "UPDATE safety_approval_requests SET state='cancelled',decision='cancel',decided_at=? WHERE fingerprint=? AND state='pending' AND approval_id<>?",
          )
          .run(now, digest, approvalId);
      }
      this.db.exec("RELEASE issue_reviewed_batch");
      return approvalId;
    } catch (error) {
      this.db.exec("ROLLBACK TO issue_reviewed_batch; RELEASE issue_reviewed_batch");
      throw error;
    }
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
      action: this.parseAction(row.actionJson, row.approvalId),
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
    const action = this.parseAction(row.actionJson, decision.approvalId);
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
      const accepting = ["accept", "acceptForOrigin", "acceptForRun", "acceptGlobally"].includes(
        decision.decision,
      );
      if (accepting) this.assertPolicyRevision(action);
      if (
        (action.reviewedChanges || action.reviewedActions) &&
        ["acceptForRun", "acceptForOrigin", "acceptGlobally"].includes(decision.decision)
      )
        throw new Error("Approve the displayed batch once; broader permissions are managed separately.");
      if (accepting && action.authentication === "touch_id")
        throw new Error("This action requires trusted device authentication.");
      if (
        decision.decision === "acceptForOrigin" &&
        (!action.origin || action.recipient || !this.persistSitePolicy)
      )
        throw new Error("A site permission requires an exact origin and a trusted policy writer.");
      if (decision.decision === "acceptGlobally" && !this.persistSitePolicy)
        throw new Error("A global permission requires a trusted policy writer.");
      if (decision.decision === "acceptForRun" && (!action.runId || !this.runIsActive(action.runId)))
        throw new Error("A run permission requires its original active run.");
      const state =
        decision.decision === "decline" || decision.decision === "acceptWithAmendment"
          ? "declined"
          : decision.decision === "cancel"
            ? "cancelled"
            : ["acceptForOrigin", "acceptForRun", "acceptGlobally"].includes(decision.decision)
              ? "consumed"
              : "accepted";
      this.db
        .prepare("UPDATE safety_approval_requests SET state=?,decision=?,decided_at=? WHERE approval_id=?")
        .run(state, decision.decision, now, decision.approvalId);
      if (decision.decision === "acceptForOrigin") this.persistSitePolicy!(action, "site");
      if (decision.decision === "acceptGlobally") this.persistSitePolicy!(action, "global");
      if (decision.decision === "acceptForRun") {
        const category = agentPolicyCategoryFor(action.category ?? "external_tool", action.action);
        const policy = policyFor({
          mode: this.effectivePolicy(this.currentPolicy(), action.runId).agentMode,
          category,
          site: action.origin,
          overrides: this.currentPolicy().agentPolicies,
        });
        if (
          policy.disposition === "block" ||
          policy.disposition === "handoff" ||
          category === "money" ||
          category === "credentials"
        )
          throw new Error("This action cannot receive a run permission.");
        this.db
          .prepare(
            "INSERT INTO safety_run_grants(grant_id,run_id,profile_id,category,origin,policy_revision,authority_revision,created_at) VALUES(?,?,?,?,?,?,?,?)",
          )
          .run(
            randomUUID(),
            action.runId!,
            action.profileId,
            category,
            action.origin ? exactOrigin(action.origin) : null,
            action.policyRevision ?? 0,
            this.runAuthorityRevision(action.runId),
            now,
          );
      }
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
    this.db
      .prepare(
        "UPDATE safety_approval_requests SET state='cancelled',decision='cancel',decided_at=? WHERE turn_id=? AND thread_id=? AND state IN ('pending','accepted')",
      )
      .run(now, turnId, threadId);
    this.revokeRunGrants(turnId, now);
    this.audit({ kind: "approval_turn_retired", turnId, threadId, at: now });
  }

  clearDeviceAuthentication(): void {
    this.deviceSites.clear();
  }

  private assertPolicyRevision(action: SafetyAction): void {
    if (action.runId && this.resolveRun && !this.runIsActive(action.runId))
      throw new Error("The original run ended; this approval is no longer available.");
    if ((action.runAuthorityRevision ?? 0) !== this.runAuthorityRevision(action.runId))
      throw new Error("Run permissions changed; refresh this approval.");
    if ((action.policyRevision ?? 0) !== this.currentPolicy().agentPolicyRevision)
      throw new Error("Agent permissions changed; refresh this approval.");
  }

  private deviceSiteKey(action: SafetyAction): string | undefined {
    const site = action.origin ? exactOrigin(action.origin) : undefined;
    return site ? JSON.stringify([action.profileId, site]) : undefined;
  }

  prepareDevice(
    approvalId: string,
    expectedTurnId: string,
    now = Date.now(),
  ): { action: SafetyAction; fingerprint: string; expiresAt: number; policyRevision: number } {
    const row = this.db
      .prepare(
        "SELECT action_json,fingerprint,state,expires_at,turn_id FROM safety_approval_requests WHERE approval_id=?",
      )
      .get(approvalId) as
      | { action_json: string; fingerprint: string; state: string; expires_at: number; turn_id: string }
      | undefined;
    if (!row || row.state !== "pending" || row.expires_at <= now || row.turn_id !== expectedTurnId)
      throw new Error("Expired, replaced, or unknown device confirmation.");
    const action = this.parseAction(row.action_json, approvalId);
    if (action.authentication !== "touch_id")
      throw new Error("This action is not awaiting device authentication.");
    this.assertPolicyRevision(action);
    return {
      action,
      fingerprint: row.fingerprint,
      expiresAt: row.expires_at,
      policyRevision: action.policyRevision ?? 0,
    };
  }

  /** Called only after the native authentication channel verifies the original pending request. */
  confirmDevice(
    approvalId: string,
    expectedTurnId: string,
    expectedFingerprint: string,
    now = Date.now(),
  ): SafetyAction {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const row = this.db
        .prepare(
          "SELECT action_json,fingerprint,state,expires_at,turn_id FROM safety_approval_requests WHERE approval_id=?",
        )
        .get(approvalId) as
        | { action_json: string; fingerprint: string; state: string; expires_at: number; turn_id: string }
        | undefined;
      if (
        !row ||
        row.state !== "pending" ||
        row.expires_at <= now ||
        row.turn_id !== expectedTurnId ||
        row.fingerprint !== expectedFingerprint
      )
        throw new Error("Expired, replaced, or unknown device confirmation.");
      const action = this.parseAction(row.action_json, approvalId);
      if (action.authentication !== "touch_id")
        throw new Error("This action is not awaiting device authentication.");
      this.assertPolicyRevision(action);
      this.db
        .prepare(
          "UPDATE safety_approval_requests SET state='accepted',decision='device',decided_at=? WHERE approval_id=? AND state='pending'",
        )
        .run(now, approvalId);
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
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  /** Policy is evaluated anew and exceptional one-time approval is consumed at dispatch. */
  authorize(input: {
    action: SafetyAction;
    trustedUserAction?: boolean;
    settings: AgentPolicySettings;
    approvalId?: string;
    consume?: boolean;
    now?: number;
  }): AuthorizationDecision {
    const action = SafetyActionSchema.parse(input.action);
    const now = input.now ?? Date.now();
    input = { ...input, settings: this.effectivePolicy(input.settings, action.runId) };
    if ((action.runAuthorityRevision ?? 0) !== this.runAuthorityRevision(action.runId))
      return this.auditDecision(
        { status: "denied", guidance: "Run permissions changed; refresh this action." },
        action,
        now,
      );
    if ((action.policyRevision ?? 0) !== input.settings.agentPolicyRevision)
      return this.auditDecision(
        { status: "denied", guidance: "Agent permissions changed; refresh this action." },
        action,
        now,
      );
    const category = agentPolicyCategoryFor(action.category ?? "external_tool", action.action);
    const policy = policyForCategories({
      mode: input.settings.agentMode,
      categories: action.policyCategories ?? [category],
      site: action.origin,
      amount: action.amount,
      overrides: input.settings.agentPolicies,
    });
    if (policy.disposition === "block")
      return this.auditDecision({ status: "denied", guidance: DENIED }, action, now);
    if (policy.disposition === "handoff")
      return this.auditDecision(
        { status: "handoff", guidance: "Complete this action directly in the site, then return to Aux." },
        action,
        now,
      );
    if (
      input.trustedUserAction === true &&
      (action.policyCategories ?? [category]).every(
        (value) => value === "file_write" || value === "file_delete",
      )
    )
      return this.auditDecision(
        { status: "authorized", provenance: { authorizedBy: "policy", policySource: "user" } },
        action,
        now,
      );
    if (policy.disposition === "allow")
      return this.auditDecision(
        { status: "authorized", provenance: { authorizedBy: "policy", policySource: policy.source } },
        action,
        now,
      );
    if (policy.disposition === "ask" && action.runId && this.runIsActive(action.runId)) {
      const required = (action.policyCategories ?? [category]).filter(
        (value) =>
          policyFor({
            mode: input.settings.agentMode,
            category: value,
            site: action.origin,
            overrides: input.settings.agentPolicies,
          }).disposition === "ask",
      );
      const grants = required.map(
        (value) =>
          this.db
            .prepare(
              "SELECT grant_id AS grantId FROM safety_run_grants WHERE run_id=? AND profile_id=? AND category=? AND (origin IS NULL OR origin=?) AND policy_revision=? AND authority_revision=? AND revoked_at IS NULL ORDER BY created_at DESC LIMIT 1",
            )
            .get(
              action.runId!,
              action.profileId,
              value,
              action.origin ? exactOrigin(action.origin) : null,
              input.settings.agentPolicyRevision,
              this.runAuthorityRevision(action.runId),
            ) as { grantId: string } | undefined,
      );
      if (grants.length && grants.every((grant) => grant !== undefined))
        return this.auditDecision(
          { status: "authorized", provenance: { authorizedBy: "standing", grantId: grants[0]!.grantId } },
          action,
          now,
        );
    }
    this.db.exec("BEGIN IMMEDIATE");
    try {
      if (policy.disposition === "ask") {
        const batch = this.db
          .prepare(
            "SELECT m.approval_id AS approvalId FROM safety_approval_batch_members m JOIN safety_approval_requests a ON a.approval_id=m.approval_id WHERE m.fingerprint=? AND m.consumed_at IS NULL AND a.state='accepted' AND a.expires_at>? AND a.turn_id=? AND a.thread_id=? ORDER BY a.decided_at DESC LIMIT 1",
          )
          .get(fingerprint(action, "turn"), now, action.turnId, action.threadId) as
          { approvalId: string } | undefined;
        if (batch) {
          if (input.consume !== false) {
            this.db
              .prepare(
                "UPDATE safety_approval_batch_members SET consumed_at=? WHERE approval_id=? AND fingerprint=? AND consumed_at IS NULL",
              )
              .run(now, batch.approvalId, fingerprint(action, "turn"));
            this.db
              .prepare(
                "UPDATE safety_approval_requests SET state='consumed' WHERE approval_id=? AND NOT EXISTS(SELECT 1 FROM safety_approval_batch_members WHERE approval_id=? AND consumed_at IS NULL)",
              )
              .run(batch.approvalId, batch.approvalId);
          }
          this.db.exec("COMMIT");
          return this.auditDecision(
            { status: "authorized", provenance: { authorizedBy: "approval", approvalId: batch.approvalId } },
            action,
            now,
          );
        }
      }
      if (input.approvalId) {
        const row = this.db
          .prepare(
            "SELECT fingerprint,turn_id,thread_id,lifetime,expires_at,state,decision FROM safety_approval_requests WHERE approval_id=?",
          )
          .get(input.approvalId) as
          | {
              fingerprint: string;
              turn_id: string;
              thread_id: string;
              lifetime: "turn" | "thread";
              expires_at: number;
              state: string;
              decision: string;
            }
          | undefined;
        if (
          row?.state === "accepted" &&
          row.expires_at > now &&
          row.fingerprint === fingerprint(action, row.lifetime) &&
          (row.lifetime === "thread" || row.turn_id === action.turnId) &&
          row.thread_id === action.threadId &&
          (policy.disposition !== "touch_id" ||
            (action.authentication === "touch_id" && row.decision === "device"))
        ) {
          if (input.consume !== false)
            this.db
              .prepare(
                "UPDATE safety_approval_requests SET state='consumed' WHERE approval_id=? AND state='accepted'",
              )
              .run(input.approvalId);
          this.db.exec("COMMIT");
          return this.auditDecision(
            { status: "authorized", provenance: { authorizedBy: "approval", approvalId: input.approvalId } },
            action,
            now,
          );
        }
      }
      this.db.exec("COMMIT");
      const key = this.deviceSiteKey(action);
      const memo = key ? this.deviceSites.get(key) : undefined;
      if (
        category === "credentials" &&
        input.settings.agentMode === "auto" &&
        policy.source === "default" &&
        memo?.revision === input.settings.agentPolicyRevision
      ) {
        this.audit({
          kind: "credential_site_authenticated",
          profileId: action.profileId,
          origin: action.origin,
          policyRevision: memo.revision,
          deviceApprovalId: memo.approvalId,
          at: now,
        });
        return this.auditDecision(
          { status: "authorized", provenance: { authorizedBy: "policy", policySource: "default" } },
          action,
          now,
        );
      }
      return this.auditDecision(
        policy.disposition === "touch_id"
          ? { status: "touch_id", guidance: "Confirm this action with Touch ID in Aux." }
          : { status: "ask", guidance: ASK },
        action,
        now,
      );
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
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
