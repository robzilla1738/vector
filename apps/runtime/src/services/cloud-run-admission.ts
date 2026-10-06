import { createHash } from "node:crypto";
import { AuxError, EffectRequestSchema, type EffectRequest } from "@aux/contracts";
import type { NativeBridge } from "../native.js";
import type { Repo } from "../store/repo.js";
import type { TurnMentionService } from "./turn-mention-service.js";
import { cloudQuoteIdentity, type CloudResourceQuote } from "./cloud-resource-quote.js";
import type { CloudExecutionContext } from "./cloud-execution.js";

interface OriginalOwner {
  sourceToken: symbol;
  contextToken: string;
  windowId: string;
  activePageId: string | null;
  spaceId: string | undefined;
  scope: string;
}

/** Cloud authority belongs to the original live turn, never a foreground window. */
export class CloudRunAdmission {
  private readonly owners = new Map<string, OriginalOwner>();

  constructor(
    private readonly deps: {
      repo: Repo;
      native: NativeBridge;
      turns: TurnMentionService;
      profileId: string;
      taskRevision(taskId: string): number;
      checkMoney(request: EffectRequest): Promise<void>;
    },
  ) {}

  async assertOwner(ctx: CloudExecutionContext): Promise<void> {
    await this.check(ctx, false);
  }

  /** A parked owner may answer its original review; it still cannot dispatch. */
  async assertOriginal(ctx: CloudExecutionContext): Promise<void> {
    await this.check(ctx, true);
  }

  private async check(ctx: CloudExecutionContext, originalOnly: boolean): Promise<void> {
    if (originalOnly && !this.owners.has(ctx.runId))
      throw new AuxError("ref_stale", "The original cloud admission is unavailable.");
    const read = () => {
      const run = this.deps.repo.getRun(ctx.runId);
      const states = originalOnly
        ? ["running", "planning", "needs_input", "paused"]
        : ["running", "planning"];
      if (
        !run ||
        !states.includes(run.status) ||
        (!originalOnly && run.config?.executionTarget !== "cloud") ||
        !run.config ||
        ctx.threadId !== (run.config.chatId ?? run.runId) ||
        ctx.turnId !== run.runId
      )
        throw new AuxError("cancelled", "The original cloud turn is no longer active.");
      if (run.config.taskId && this.deps.taskRevision(run.config.taskId) !== run.config.taskRevision)
        throw new AuxError("ref_stale", "The original cloud task changed.");
      return run;
    };
    const run = read();
    const contextToken = run.config!.nativeTurnContext;
    if (!contextToken || !this.deps.native.turnSourceContext)
      throw new AuxError("needs_input", "Choose Run in cloud from the original Aux conversation window.");
    const sourceToken = this.deps.turns.capture(ctx.runId);
    const scope = JSON.stringify([
      run.config!.taskId,
      run.config!.taskRevision,
      run.config!.contextWorkspaceId,
      run.config!.contextWorkspaceRevision,
      run.config!.externalConnectionId,
      run.config!.externalParentRunId,
    ]);
    const current = await this.deps.native.turnSourceContext(contextToken);
    const latest = read();
    if (
      this.deps.turns.capture(ctx.runId) !== sourceToken ||
      latest.config!.nativeTurnContext !== contextToken ||
      JSON.stringify([
        latest.config!.taskId,
        latest.config!.taskRevision,
        latest.config!.contextWorkspaceId,
        latest.config!.contextWorkspaceRevision,
        latest.config!.externalConnectionId,
        latest.config!.externalParentRunId,
      ]) !== scope
    )
      throw new AuxError("ref_stale", "The original cloud source changed during admission.");
    const captured: OriginalOwner = {
      sourceToken,
      contextToken,
      scope,
      windowId: current.windowId,
      activePageId: current.activePageId,
      spaceId: current.layout?.window.activeSpaceId,
    };
    const original = this.owners.get(ctx.runId);
    if (
      original &&
      (original.sourceToken !== sourceToken ||
        original.contextToken !== contextToken ||
        original.scope !== scope ||
        original.windowId !== captured.windowId ||
        original.activePageId !== captured.activePageId ||
        original.spaceId !== captured.spaceId)
    )
      throw new AuxError("ref_stale", "The original cloud window or selected Space changed.");
    if (!original) this.owners.set(ctx.runId, captured);
  }

  async authorizeCreate(
    ctx: CloudExecutionContext,
    quote: CloudResourceQuote,
    quoteDigest: string,
  ): Promise<void> {
    if (cloudQuoteIdentity(quote).digest !== quoteDigest)
      throw new AuxError("ref_stale", "The reviewed cloud resource quote changed before authorization.");
    await this.assertOwner(ctx);
    const run = this.deps.repo.getRun(ctx.runId)!;
    const request = EffectRequestSchema.parse({
      profileId: this.deps.profileId,
      scope: run.config?.taskId
        ? { kind: "task", id: run.config.taskId }
        : { kind: "workspace", id: run.config?.contextWorkspaceId ?? "default" },
      actor: "builtin_agent",
      effect: "external_tool",
      category: "purchase",
      action: "agent.cloud.create",
      origin: "https://api.vercel.com",
      destination: "https://api.vercel.com",
      dataClasses: [],
      provenance: "template",
      invocationDigest: createHash("sha256")
        .update(JSON.stringify([ctx, quoteDigest, quote.accountDigest, this.owners.get(ctx.runId)?.scope]))
        .digest("hex"),
      turnId: ctx.turnId,
      threadId: ctx.threadId,
      runId: ctx.runId,
      requestedAt: Date.now(),
    });
    await this.deps.checkMoney(request);
    await this.assertOwner(ctx);
  }

  /** Retire only after exact original VM cleanup, or before any provider dispatch. */
  release(runId: string): void {
    this.owners.delete(runId);
  }
}
