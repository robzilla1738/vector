import { jsonDigest as digest } from "@aux/contracts/util/digest";
import { randomUUID } from "node:crypto";
import {
  AuxError,
  HookCreateParams,
  HookDispatchContextSchema,
  HookInvocationSchema,
  HookSchema,
  type Hook,
  type HookDispatchContext,
  type HookHandler,
  type HookInvocation,
} from "@aux/contracts";
import type { Repo } from "../store/repo.js";

type HookRow = {
  hook_id: string;
  workspace_id: string;
  event: Hook["event"];
  trust: Hook["trust"];
  body: string;
  created_at: number;
  updated_at: number;
};
type InvocationRow = {
  invocation_id: string;
  hook_id: string;
  event_id: string;
  state: HookInvocation["state"];
  error: string | null;
  created_at: number;
  ended_at: number | null;
};
export type HookExecutor = (
  handler: HookHandler,
  context: HookDispatchContext,
  signal: AbortSignal,
) => Promise<void>;
export type HookAuthority = (
  handler: HookHandler,
  workspaceId: string,
) => void;

export class HookService {
  private active = new Map<string, Set<AbortController>>();

  private sealHook(hookId: string, body: object): string {
    return this.repo.protectRecordField("hooks", [hookId], "body", JSON.stringify(body));
  }

  private invocation(row: InvocationRow): HookInvocation {
    return HookInvocationSchema.parse({
      invocationId: row.invocation_id, hookId: row.hook_id, eventId: row.event_id,
      state: row.state,
      error: row.error === null ? undefined : this.repo.revealRecordField(
        "hook_invocations", [row.invocation_id], "error", row.error),
      createdAt: row.created_at, endedAt: row.ended_at ?? undefined,
    });
  }

  constructor(
    private repo: Repo,
    private readonly authorize?: HookAuthority,
  ) {
    // An interrupted hook may already have acted. Never run it again with the same event identity.
    this.repo.db
      .prepare("UPDATE hook_invocations SET state='uncertain', ended_at=? WHERE state='invoking'")
      .run(Date.now());
  }

  register(raw: unknown): Hook {
    const input = HookCreateParams.parse(raw);
    if (input.event !== "run.start" && input.event !== "run.end")
      throw new AuxError("capability_unsupported", "Only run lifecycle Hooks are available.");
    if (input.handler.type !== "mcp_tool" && input.handler.type !== "command")
      throw new AuxError(
        "capability_unsupported",
        "Only grant-bound MCP and reviewed command Hooks can run. Other handlers are unavailable.",
      );
    if (input.handler.type === "mcp_tool" && JSON.stringify(input.handler.arguments ?? {}).length > 64_000)
      throw new AuxError("invalid_params", "Hook tool arguments are too large.");
    if (!this.repo.db.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(input.workspaceId))
      throw new AuxError("not_found", "Space does not exist");
    if (
      input.sourcePluginId &&
      !this.repo.db
        .prepare(
          `SELECT 1 FROM plugins p JOIN plugin_assets a ON a.plugin_id=p.plugin_id
      WHERE p.plugin_id=? AND p.workspace_id=? AND p.uninstalled_at IS NULL AND a.kind='hook' AND a.name=? LIMIT 1`,
        )
        .get(input.sourcePluginId, input.workspaceId, input.event)
    )
      throw new AuxError("permission_denied", "That imported hook is unavailable in this Space.");
    const now = Date.now();
    const hook = HookSchema.parse({
      ...input,
      hookId: randomUUID(),
      handlerDigest: digest(input.handler),
      trust: "untrusted",
      createdAt: now,
      updatedAt: now,
    });
    this.repo.db
      .prepare(
        "INSERT INTO hooks(hook_id,workspace_id,event,trust,body,created_at,updated_at) VALUES(?,?,?,?,?,?,?)",
      )
      .run(hook.hookId, hook.workspaceId, hook.event, hook.trust, this.sealHook(hook.hookId, hook), now, now);
    return hook;
  }

  get(hookId: string): Hook {
    const row = this.repo.db.prepare("SELECT * FROM hooks WHERE hook_id=?").get(hookId) as
      HookRow | undefined;
    if (!row) throw new AuxError("not_found", "Hook does not exist");
    return HookSchema.parse({
      ...JSON.parse(this.repo.revealRecordField("hooks", [row.hook_id], "body", row.body)),
      hookId: row.hook_id,
      workspaceId: row.workspace_id,
      event: row.event,
      trust: row.trust,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  list(workspaceId: string): Hook[] {
    return (
      this.repo.db
        .prepare("SELECT hook_id FROM hooks WHERE workspace_id=? ORDER BY created_at DESC")
        .all(workspaceId) as { hook_id: string }[]
    ).map((row) => this.get(row.hook_id));
  }

  /** Approval is bound to the exact reviewed handler bytes. Imported hooks remain untrusted. */
  approve(hookId: string, expectedDigest: string): Hook {
    const hook = this.get(hookId);
    if (hook.trust !== "untrusted" || hook.handlerDigest !== expectedDigest ||
      digest(hook.handler) !== hook.handlerDigest)
      throw new AuxError("conflict", "This hook changed. Review its handler before approval.");
    if (!this.authorize)
      throw new AuxError("capability_unsupported", "A supervised Hook executor is unavailable.");
    this.authorize(hook.handler, hook.workspaceId);
    this.repo.db
      .prepare("UPDATE hooks SET trust='approved',updated_at=? WHERE hook_id=? AND trust='untrusted'")
      .run(Date.now(), hookId);
    return this.get(hookId);
  }

  revoke(hookId: string): Hook {
    const hook = this.get(hookId);
    if (hook.trust === "revoked") return hook;
    this.repo.db
      .prepare("UPDATE hooks SET trust='revoked',updated_at=? WHERE hook_id=?")
      .run(Date.now(), hookId);
    for (const controller of this.active.get(hookId) ?? []) controller.abort();
    return this.get(hookId);
  }

  invocations(hookId: string, limit = 100): HookInvocation[] {
    this.get(hookId);
    return (
      this.repo.db
        .prepare("SELECT * FROM hook_invocations WHERE hook_id=? ORDER BY created_at DESC LIMIT ?")
        .all(hookId, limit) as InvocationRow[]
    ).map(row => this.invocation(row));
  }

  /** A reviewed Hook can be tried once through the same executor used by automatic dispatch. */
  async test(hookId: string, executor: HookExecutor): Promise<HookInvocation> {
    const hook = this.get(hookId);
    if (hook.trust !== "approved") throw new AuxError("permission_denied", "Approve this Hook before testing it.");
    const result = await this.dispatch({
      eventId: `manual:${randomUUID()}`,
      workspaceId: hook.workspaceId,
      event: hook.event,
      at: Date.now(),
    }, executor, hookId);
    if (!result[0]) throw new AuxError("conflict", "Hook approval changed during the test.");
    return result[0];
  }

  /** A trusted host injects the executor. No shell, MCP or model call exists in this service. */
  async dispatch(raw: unknown, executor: HookExecutor, onlyHookId?: string): Promise<HookInvocation[]> {
    const context = HookDispatchContextSchema.parse(raw);
    const rows = this.repo.db
      .prepare(
        `SELECT * FROM hooks WHERE workspace_id=? AND event=? AND trust='approved'
          ${onlyHookId ? "AND hook_id=?" : ""} ORDER BY created_at`,
      )
      .all(context.workspaceId, context.event, ...(onlyHookId ? [onlyHookId] : [])) as HookRow[];
    const result: HookInvocation[] = [];
    for (const row of rows) {
      const hook = this.get(row.hook_id);
      const now = Date.now();
      const invocationId = randomUUID();
      const inserted = this.repo.db
        .prepare(
          `INSERT OR IGNORE INTO hook_invocations(invocation_id,hook_id,event_id,state,created_at)
        VALUES(?,?,?,'invoking',?)`,
        )
        .run(invocationId, hook.hookId, context.eventId, now);
      if (inserted.changes !== 1) continue;
      const controller = new AbortController();
      const controllers = this.active.get(hook.hookId) ?? new Set<AbortController>();
      controllers.add(controller);
      this.active.set(hook.hookId, controllers);
      let state: HookInvocation["state"] = "completed";
      let error: string | undefined;
      let modified = false;
      try {
        const current = this.get(hook.hookId);
        if (current.trust !== "approved")
          throw new AuxError("permission_denied", "Hook approval was revoked.");
        if (digest(current.handler) !== current.handlerDigest) {
          modified = true;
          throw new AuxError("permission_denied", "Hook handler changed after approval.");
        }
        if (!this.authorize)
          throw new AuxError("permission_denied", "Supervised Hook authority is unavailable.");
        this.authorize(current.handler, current.workspaceId);
        await executor(current.handler, context, controller.signal);
        if (controller.signal.aborted) state = "uncertain";
      } catch {
        state = controller.signal.aborted ? "uncertain" : "failed";
        error =
          state === "uncertain"
            ? "Hook outcome needs reconciliation after interruption."
            : "Hook execution failed.";
      } finally {
        controllers.delete(controller);
        if (!controllers.size) this.active.delete(hook.hookId);
      }
      if (modified) this.revoke(hook.hookId);
      this.repo.db
        .prepare("UPDATE hook_invocations SET state=?,error=?,ended_at=? WHERE invocation_id=?")
        .run(state, error === undefined ? null : this.repo.protectRecordField(
          "hook_invocations", [invocationId], "error", error), Date.now(), invocationId);
      const saved = this.repo.db
        .prepare("SELECT * FROM hook_invocations WHERE hook_id=? AND event_id=?")
        .get(hook.hookId, context.eventId) as InvocationRow;
      result.push(this.invocation(saved));
    }
    return result;
  }
}
