import { createHash, randomUUID } from "node:crypto";
import { FOUNDATION_MODEL_ID } from "@aux/contracts/native-foundation-models";
import {
  AuxError,
  GoalSchema,
  ResourceLimitsReviewSchema,
  SubagentGroupSchema,
  SubagentSchema,
  type BudgetSuspension,
  type ResourceLimitsReview,
} from "@aux/contracts";
import {
  MODEL_REGISTRY,
  modelCapabilities,
  registryCostUsd,
  type ModelCapability,
} from "@aux/contracts/model-registry";
import { modelCallCost, type ModelAttempt } from "../agent/model-client.js";
import type { ResourceFundingAccounting } from "./resource-accounting.js";
import type { Repo } from "../store/repo.js";
import { lineageRuns, runAncestry, runRoot } from "./run-lineage.js";

type Kind = "goal" | "subagent" | "subagent_group";
type Limits = { maxTokens?: number; maxCostUsd?: number; deadlineMs?: number };
type Owner = {
  kind: Kind;
  ownerId: string;
  runId: string;
  body: Record<string, unknown>;
  limits: Limits;
  createdAt: number;
  digest: string;
  runs: string[];
};
export type FundingLimits = Limits;
export type FundingRequest = {
  modelId: string;
  promptBytes: number;
  toolsBytes: number;
  maxOutputTokens: number;
};
type ModelHold = {
  kind: "model";
  id: string;
  runId: string;
  modelId: string;
  tokens: number;
  costUsd: number;
  state: "pending" | "settled";
  beforeCalls: string[];
  calls?: string[];
  opaque?: boolean;
  tokenBound: boolean;
  costBound: boolean;
  inputPrice?: number;
  outputPrice?: number;
};
type ResourceHold = {
  kind: "resource";
  id: string;
  runId: string;
  resourceId: string;
  reservationUsd: number;
  tokens: 0;
  costUsd: number;
  state: "pending" | "settled";
  opaque?: boolean;
};
type Hold = ModelHold | ResourceHold;
type Ledger = { holds: Hold[] };
const active = new Set(["queued", "planning", "running", "paused", "needs_input"]);
const key = (owner: Pick<Owner, "kind" | "ownerId">) => `runFunding:${owner.kind}:${owner.ownerId}`;
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

export class FundingBudgetError extends AuxError {
  constructor(readonly budget: BudgetSuspension) {
    super("needs_input", "The original run funding needs review.");
  }
}

/** Capability review cannot be represented as a fabricated exhausted spend limit. */
export class ResourceFundingUnavailable extends AuxError {
  constructor(
    readonly runId: string,
    readonly funding: NonNullable<BudgetSuspension["funding"]>,
  ) {
    super(
      "needs_input",
      "This cloud session cannot enforce the resource envelope required by the original funding. Choose local execution or configure a verified cloud envelope.",
      { suspensionKind: "handoff" },
    );
  }
}

/** Ordinary user usage limits require a real resource bound as well. */
export class ResourceLimitsUnavailable extends AuxError {
  readonly proof: ResourceLimitsReview;
  constructor(
    readonly runId: string,
    proof: ResourceLimitsReview,
  ) {
    super(
      "needs_input",
      "This cloud session cannot enforce the resource envelope required by your usage limits. Choose local execution or configure a verified cloud envelope.",
      { suspensionKind: "handoff" },
    );
    if (
      proof.runId !== runId ||
      !proof.scopes.length ||
      !/^[a-f0-9]{64}$/.test(proof.originalDigest) ||
      !/^[a-f0-9]{64}$/.test(proof.quoteDigest) ||
      proof.scopes.some((scope) => !Number.isFinite(scope.limitUsd) || scope.limitUsd <= 0)
    )
      throw new AuxError("permission_denied", "The original cloud usage-limit proof is unavailable.");
    this.proof = ResourceLimitsReviewSchema.parse(proof);
  }
}

export class ModelFundingUnavailable extends AuxError {
  constructor(
    readonly runId: string,
    readonly proof: {
      runId: string;
      modelId: string;
      reasons: ("output-bound" | "monetary-bound" | "usage-unavailable")[];
      digest: string;
    },
  ) {
    super(
      "needs_input",
      "This model route cannot account for the original token or monetary envelope. Stop this run and choose a model connection that supports its limits.",
      { suspensionKind: "handoff" },
    );
  }
}

/** Capacity and receipts use the same protected profile ledger as other durable settings. */
export class RunFundingService {
  private live = new Set<string>();
  constructor(
    private repo: Repo,
    private resources: ResourceFundingAccounting,
    private models: () => Promise<readonly ModelCapability[]> = async () => MODEL_REGISTRY,
    private usageLimits?: (runId: string) => readonly { scope: string; scopeId?: string; limitUsd: number }[],
  ) {}

  private modelLimitProof(runId: string, modelId: string, models: readonly ModelCapability[]) {
    const owners = this.owners(runId),
      model = modelCapabilities(modelId, models),
      limits = [...(this.usageLimits?.(runId) ?? [])];
    const rootId = runRoot(this.repo, runId, true),
      rootLimit = Number(this.repo.getRun(rootId)?.config?.maxCostUsd);
    if (
      Number.isFinite(rootLimit) &&
      rootLimit > 0 &&
      !limits.some((limit) => limit.scope === "run" && limit.limitUsd <= rootLimit)
    )
      limits.push({ scope: "run", scopeId: rootId, limitUsd: rootLimit });
    const reasons: ("output-bound" | "monetary-bound" | "usage-unavailable")[] = [];
    // This on-device route bounds its response but Apple exposes no complete
    // inference usage receipt. Token-funded owners cannot admit unknown usage.
    if (modelId === FOUNDATION_MODEL_ID && owners.some((owner) => owner.limits.maxTokens !== undefined))
      reasons.push("usage-unavailable");
    if (model?.billingKind === "subscription") {
      if (
        model.outputLimitSupported === false &&
        owners.some((owner) => owner.limits.maxTokens !== undefined)
      )
        reasons.push("output-bound");
      if (owners.some((owner) => owner.limits.maxCostUsd !== undefined) || limits.length)
        reasons.push("monetary-bound");
    }
    return {
      runId,
      modelId,
      reasons,
      digest: digest({
        runId,
        modelId,
        model: model
          ? { id: model.id, billingKind: model.billingKind, outputLimitSupported: model.outputLimitSupported }
          : undefined,
        owners: owners.map((owner) => owner.digest),
        limits,
        config: this.repo.getRun(runId)?.config,
      }),
    };
  }
  async assertModelUnavailable(error: ModelFundingUnavailable): Promise<void> {
    const proof = this.modelLimitProof(error.runId, error.proof.modelId, await this.models());
    if (!proof.reasons.length || JSON.stringify(proof) !== JSON.stringify(error.proof))
      throw new AuxError("permission_denied", "The original model-capability review changed.");
  }
  async assertModelAdmission(runId: string, modelId: string): Promise<void> {
    const proof = this.modelLimitProof(runId, modelId, await this.models());
    if (proof.reasons.length) throw new ModelFundingUnavailable(runId, proof);
  }

  private ledger(owner: Owner): Ledger {
    return this.repo.getSetting<Ledger>(key(owner)) ?? { holds: [] };
  }
  private save(owner: Owner, ledger: Ledger) {
    this.repo.setSetting(key(owner), ledger);
  }

  private owners(runId: string): Owner[] {
    const ancestry = runAncestry(this.repo, runId, true);
    const owners: Owner[] = [];
    const add = (
      kind: Kind,
      ownerId: string,
      ownerRun: string,
      body: Record<string, unknown>,
      limits: Limits,
      createdAt: number,
      runs: string[],
    ) => {
      if (owners.some((owner) => owner.kind === kind && owner.ownerId === ownerId)) return;
      owners.push({
        kind,
        ownerId,
        runId: ownerRun,
        body,
        limits,
        createdAt,
        runs,
        digest: digest({ kind, ownerId, runId: ownerRun, workspaceId: body.workspaceId, limits }),
      });
    };
    for (const id of ancestry) {
      const run = this.repo.getRun(id);
      if (!run || !active.has(run.status))
        throw new AuxError("permission_denied", "The original funded run is no longer active.");
      const goals = this.repo.db
        .prepare("SELECT goal_id,body,status FROM goals WHERE run_id=? LIMIT 2")
        .all(id) as { goal_id: string; body: string; status: string }[];
      if (goals.length > 1) throw new AuxError("permission_denied", "Goal funding ownership is ambiguous.");
      if (goals[0]) {
        const row = goals[0],
          raw = JSON.parse(row.body) as Record<string, unknown>,
          body = GoalSchema.parse({ ...raw, runId: id, status: row.status });
        if (
          body.goalId !== row.goal_id ||
          (raw.runId !== undefined && raw.runId !== id) ||
          ["cancelled", "completed", "failed"].includes(row.status)
        )
          throw new AuxError("permission_denied", "The original Goal funding changed.");
        add("goal", body.goalId, id, body, body.budget, run.createdAt, lineageRuns(this.repo, id));
      }
      const agents = this.repo.db
        .prepare("SELECT agent_id,group_id,body FROM subagents WHERE run_id=? OR reserved_run_id=? LIMIT 2")
        .all(id, id) as { agent_id: string; group_id: string; body: string }[];
      if (agents.length > 1)
        throw new AuxError("permission_denied", "Subagent funding ownership is ambiguous.");
      if (!agents[0]) continue;
      const agentRow = agents[0],
        agent = SubagentSchema.parse(
          JSON.parse(this.repo.revealRecordField("subagents", [agentRow.agent_id], "body", agentRow.body)),
        );
      const groupRow = this.repo.db
        .prepare("SELECT parent_run_id,body,state FROM subagent_groups WHERE group_id=?")
        .get(agentRow.group_id) as { parent_run_id: string; body: string; state: string } | undefined;
      if (!groupRow) throw new AuxError("permission_denied", "The original subagent group is unavailable.");
      const group = SubagentGroupSchema.parse(JSON.parse(groupRow.body));
      if (
        agent.agentId !== agentRow.agent_id ||
        agent.groupId !== group.groupId ||
        agent.runId !== id ||
        group.parentRunId !== groupRow.parent_run_id ||
        groupRow.state !== "active"
      )
        throw new AuxError("permission_denied", "The original subagent funding changed.");
      add(
        "subagent",
        agent.agentId,
        id,
        agent,
        {
          ...(agent.tokenAllocation > 0 ? { maxTokens: agent.tokenAllocation } : {}),
          ...(agent.costAllocationUsd > 0 ? { maxCostUsd: agent.costAllocationUsd } : {}),
        },
        agent.createdAt,
        lineageRuns(this.repo, id),
      );
      const members = this.repo.db
        .prepare("SELECT reserved_run_id AS run_id FROM subagents WHERE group_id=?")
        .all(group.groupId) as { run_id: string }[];
      const groupRuns = [...new Set(members.flatMap((member) => lineageRuns(this.repo, member.run_id)))];
      add(
        "subagent_group",
        group.groupId,
        group.parentRunId,
        group,
        {
          ...(group.tokenBudget > 0 ? { maxTokens: group.tokenBudget } : {}),
          ...(group.costBudgetUsd > 0 ? { maxCostUsd: group.costBudgetUsd } : {}),
          ...(group.timeBudgetMs > 0 ? { deadlineMs: group.timeBudgetMs } : {}),
        },
        group.createdAt,
        groupRuns,
      );
    }
    return owners;
  }

  assertResourceOwner(error: ResourceFundingUnavailable): void {
    const owner = this.owners(error.runId).find(
      (value) => value.kind === error.funding.kind && value.ownerId === error.funding.ownerId,
    );
    if (
      error.funding.runId !== error.runId ||
      !owner ||
      owner.digest !== error.funding.budgetDigest ||
      owner.limits.maxCostUsd === undefined
    )
      throw new AuxError("permission_denied", "The original cloud funding owner changed.");
  }

  rootCostOwned(runId: string): boolean {
    const root = runRoot(this.repo, runId, true),
      run = this.repo.getRun(root);
    return this.owners(runId).some(
      (owner) =>
        owner.kind === "goal" &&
        owner.runId === root &&
        owner.limits.maxCostUsd !== undefined &&
        run?.config?.maxCostUsd === owner.limits.maxCostUsd,
    );
  }

  has(runId: string): boolean {
    return this.owners(runId).some(
      (owner) => owner.limits.maxTokens !== undefined || owner.limits.maxCostUsd !== undefined,
    );
  }

  private usage(owner: Owner, ledger = this.ledger(owner), excludedResources: readonly string[] = []) {
    const calls = owner.runs.flatMap((id) => this.repo.listModelCalls(id));
    const held = ledger.holds.filter((hold) => hold.state === "pending" || hold.opaque);
    if (held.some((hold) => hold.opaque || !this.live.has(hold.id)))
      throw new AuxError(
        "conflict",
        "A prior funded attempt has an uncertain charge. Review it before continuing.",
      );
    const covered = new Set(
      ledger.holds.flatMap((hold) => (hold.kind === "model" ? (hold.calls ?? []) : [])),
    );
    // A live reservation already bounds its invoice until synchronous settlement joins it.
    // Never count that same invoice a second time during a sibling admission.
    for (const hold of held)
      if (hold.kind === "model" && this.live.has(hold.id))
        for (const call of calls)
          if (call.runId === hold.runId && !hold.beforeCalls.includes(call.callId)) covered.add(call.callId);
    const unjoined = calls.filter((call) => !covered.has(call.callId));
    if (
      unjoined.some(
        (call) =>
          (owner.limits.maxTokens !== undefined &&
            (call.inputTokens === undefined || call.outputTokens === undefined)) ||
          (owner.limits.maxCostUsd !== undefined && call.costUsd === undefined),
      )
    )
      throw new AuxError(
        "conflict",
        "A funded descendant has an unjoined invoice. Review it before continuing.",
      );
    const resourceUsage = this.resources.usage(owner.runs, [
      ...excludedResources,
      ...ledger.holds.flatMap((hold) => (hold.kind === "resource" ? [hold.resourceId] : [])),
    ]);
    if (owner.limits.maxCostUsd !== undefined && resourceUsage.opaque)
      throw new AuxError(
        "conflict",
        "A funded descendant has an uncertain cloud resource charge. Review it before continuing.",
      );
    const known = ledger.holds.filter((hold) => hold.state === "settled" && !hold.opaque);
    return {
      tokens:
        unjoined.reduce((n, call) => n + (call.inputTokens ?? 0) + (call.outputTokens ?? 0), 0) +
        [...held, ...known].reduce((n, hold) => n + hold.tokens, 0),
      costUsd:
        resourceUsage.costUsd +
        unjoined.reduce((n, call) => n + (call.costUsd ?? 0), 0) +
        [...held, ...known].reduce((n, hold) => n + hold.costUsd, 0),
    };
  }

  private stop(
    runId: string,
    owner: Owner,
    reason: "tokens" | "spend" | "time",
    used: number,
    limit: number,
    required: number,
  ): never {
    throw new FundingBudgetError({
      reason,
      used,
      limit,
      funding: { runId, kind: owner.kind, ownerId: owner.ownerId, budgetDigest: owner.digest },
      ...(reason === "tokens" && required > 0
        ? { requiredTokens: required }
        : reason === "spend" && required > 0
          ? { requiredUsd: required }
          : {}),
    });
  }

  reserve(runId: string, request: FundingRequest): Promise<string | undefined> {
    return this.reserveRequest(runId, request);
  }

  reserveEstimated(
    runId: string,
    request: { modelId: string; estimatedCostUsd: number },
  ): Promise<string | undefined> {
    if (!Number.isFinite(request.estimatedCostUsd) || request.estimatedCostUsd <= 0)
      throw new AuxError("invalid_params", "Image funding requires a positive bounded cost.");
    return this.reserveRequest(
      runId,
      { modelId: request.modelId, promptBytes: 0, toolsBytes: 0, maxOutputTokens: 1 },
      request.estimatedCostUsd,
    );
  }

  private async reserveRequest(
    runId: string,
    request: FundingRequest,
    imageCost?: number,
  ): Promise<string | undefined> {
    const original = this.owners(runId).filter((owner) => Object.keys(owner.limits).length);
    const models = await this.models();
    if (imageCost === undefined) {
      const proof = this.modelLimitProof(runId, request.modelId, models);
      if (proof.reasons.length) throw new ModelFundingUnavailable(runId, proof);
    }
    if (!original.length) return undefined;
    const inputTokens = Math.ceil(request.promptBytes + request.toolsBytes + 1024),
      outputTokens = request.maxOutputTokens;
    if (
      !Number.isSafeInteger(inputTokens) ||
      inputTokens < 1 ||
      !Number.isSafeInteger(outputTokens) ||
      outputTokens < 1 ||
      !Number.isSafeInteger(inputTokens + outputTokens)
    )
      throw new AuxError("invalid_params", "The funded model request cannot be bounded.");
    const tokens = inputTokens + outputTokens;
    const cost = imageCost ?? registryCostUsd(request.modelId, { inputTokens, outputTokens }, models);
    const price = modelCapabilities(request.modelId, models);
    return this.repo.transaction(() => {
      const owners = this.owners(runId).filter((owner) => Object.keys(owner.limits).length);
      if (
        JSON.stringify(owners.map((owner) => owner.digest)) !==
        JSON.stringify(original.map((owner) => owner.digest))
      )
        throw new AuxError("permission_denied", "The original funding changed before provider dispatch.");
      const id = randomUUID();
      const ledgers = owners.map((owner) => ({ owner, ledger: this.ledger(owner) }));
      if (
        ledgers.some(({ ledger }) =>
          ledger.holds.some(
            (hold) =>
              hold.kind === "model" &&
              hold.runId === runId &&
              hold.state === "pending" &&
              this.live.has(hold.id),
          ),
        )
      )
        throw new AuxError("conflict", "The original funded run already has a provider attempt in flight.");
      for (const { owner, ledger } of ledgers) {
        const usage = this.usage(owner, ledger),
          elapsed = Date.now() - owner.createdAt;
        if (owner.limits.deadlineMs !== undefined && elapsed >= owner.limits.deadlineMs)
          this.stop(runId, owner, "time", elapsed, owner.limits.deadlineMs, 0);
        if (
          owner.limits.maxTokens !== undefined &&
          usage.tokens + (imageCost === undefined ? tokens : 1) > owner.limits.maxTokens
        )
          this.stop(
            runId,
            owner,
            "tokens",
            usage.tokens,
            owner.limits.maxTokens,
            imageCost === undefined ? tokens : 1,
          );
        if (owner.limits.maxCostUsd !== undefined) {
          if (cost === undefined || !Number.isFinite(cost))
            throw new AuxError("permission_denied", "Funded cost requires a priced model before dispatch.");
          if (usage.costUsd + cost > owner.limits.maxCostUsd)
            this.stop(runId, owner, "spend", usage.costUsd, owner.limits.maxCostUsd, cost);
        }
      }
      const funded = ledgers.filter(
        ({ owner }) => owner.limits.maxTokens !== undefined || owner.limits.maxCostUsd !== undefined,
      );
      if (!funded.length) return undefined;
      const beforeCalls = this.repo.listModelCalls(runId).map((call) => call.callId);
      for (const { owner, ledger } of funded) {
        ledger.holds.push({
          kind: "model",
          id,
          runId,
          modelId: request.modelId,
          tokens:
            imageCost !== undefined && owner.limits.maxTokens !== undefined
              ? owner.limits.maxTokens - this.usage(owner, ledger).tokens
              : tokens,
          costUsd: cost ?? 0,
          state: "pending",
          beforeCalls,
          tokenBound: owner.limits.maxTokens !== undefined,
          costBound: owner.limits.maxCostUsd !== undefined,
          inputPrice: price?.inputUsdPerMTok,
          outputPrice: price?.outputUsdPerMTok,
        });
        this.save(owner, ledger);
      }
      this.repo.setSetting(`fundingReservation:${id}`, {
        runId,
        ownerKeys: funded.map(({ owner }) => key(owner)),
      });
      this.live.add(id);
      return id;
    });
  }

  settle(
    runId: string,
    reservationId: string | undefined,
    attempts: ModelAttempt[],
    image?: { costUsd: number; costEstimated: boolean },
  ): void {
    if (!reservationId) return;
    // Accounting survives retirement; invoice ownership does not require a live dispatch lease.
    runAncestry(this.repo, runId);
    const receipt = this.repo.getSetting<{
      runId: string;
      ownerKeys: string[];
    }>(`fundingReservation:${reservationId}`);
    if (!receipt || receipt.runId !== runId)
      throw new AuxError("permission_denied", "The original funding receipt is unavailable.");
    this.repo.transaction(() => {
      for (const ownerKey of receipt.ownerKeys) {
        const ledger = this.repo.getSetting<Ledger>(ownerKey);
        if (!ledger) throw new AuxError("conflict", "The original funded ledger is unavailable.");
        const hold = ledger.holds.find(
          (entry): entry is ModelHold =>
            entry.kind === "model" && entry.id === reservationId && entry.runId === runId,
        );
        if (!hold) continue;
        if (hold.state !== "pending")
          throw new AuxError("conflict", "The original funding reservation already settled.");
        const calls = this.repo
          .listModelCalls(runId)
          .filter((call) => !hold.beforeCalls.includes(call.callId));
        if (!calls.length) continue;
        const attempt = attempts[0];
        const sameCall = calls.length === 1 && calls[0]!.modelId === hold.modelId;
        const sameAttempt = attempts.length === 1 && attempt?.modelId === hold.modelId;
        const tokenUsage =
          sameAttempt &&
          Number.isFinite(attempt.inputTokens) &&
          Number.isFinite(attempt.outputTokens) &&
          attempt.inputTokens! >= 0 &&
          attempt.outputTokens! >= 0;
        const exact = sameCall && tokenUsage;
        const imageKnown =
          sameCall &&
          image !== undefined &&
          !image.costEstimated &&
          Number.isFinite(image.costUsd) &&
          image.costUsd >= 0;
        const reported = sameCall && sameAttempt ? modelCallCost(hold.modelId, attempt!) : undefined;
        const estimate =
          exact && hold.inputPrice !== undefined && hold.outputPrice !== undefined
            ? (attempt!.inputTokens! * hold.inputPrice + attempt!.outputTokens! * hold.outputPrice) /
              1_000_000
            : undefined;
        const invoice = sameCall ? calls[0] : undefined;
        const invoicedCost =
          invoice?.costUsd !== undefined &&
          !invoice.costEstimated &&
          Number.isFinite(invoice.costUsd) &&
          invoice.costUsd >= 0
            ? invoice.costUsd
            : undefined;
        const actualCost = imageKnown
          ? image!.costUsd
          : (invoicedCost ??
            (reported?.costUsd !== undefined && !reported.costEstimated ? reported.costUsd : estimate));
        hold.calls = calls.map((call) => call.callId);
        hold.state = "settled";
        hold.opaque =
          !sameCall ||
          (hold.tokenBound && !tokenUsage) ||
          (hold.costBound && (actualCost === undefined || !Number.isFinite(actualCost)));
        if (!hold.opaque) {
          hold.tokens = tokenUsage ? attempt!.inputTokens! + attempt!.outputTokens! : 0;
          hold.costUsd = actualCost ?? 0;
        }
        this.repo.setSetting(ownerKey, ledger);
      }
    });
    this.live.delete(reservationId);
  }

  cancelUnsent(runId: string, reservationId: string | undefined): void {
    if (!reservationId) return;
    this.repo.transaction(() => {
      const receipt = this.repo.getSetting<{
        runId: string;
        ownerKeys: string[];
      }>(`fundingReservation:${reservationId}`);
      if (!receipt || receipt.runId !== runId)
        throw new AuxError("permission_denied", "Original unsent funding receipt is unavailable.");
      for (const ownerKey of receipt.ownerKeys) {
        const ledger = this.repo.getSetting<Ledger>(ownerKey);
        if (!ledger) throw new AuxError("conflict", "Original funded ledger is unavailable.");
        const hold = ledger.holds.find(
          (entry): entry is ModelHold =>
            entry.kind === "model" && entry.id === reservationId && entry.runId === runId,
        );
        if (!hold || hold.state !== "pending") continue;
        if (this.repo.listModelCalls(runId).some((call) => !hold.beforeCalls.includes(call.callId)))
          throw new AuxError("conflict", "An invoiced funding hold cannot be released as unsent.");
        ledger.holds = ledger.holds.filter((entry) => entry !== hold);
        this.repo.setSetting(ownerKey, ledger);
      }
    });
    this.live.delete(reservationId);
  }

  /** The priced provider resource row and this admission share the caller's SQLite transaction. */
  reserveResource(
    runId: string,
    request: { resourceId: string; estimatedCostUsd?: number },
  ): string | undefined {
    return this.repo.transaction(() => {
      const receipt = this.resources.receipt(request.resourceId);
      if (
        !receipt ||
        receipt.runId !== runId ||
        receipt.state !== "reserved" ||
        receipt.reservationUsd !== request.estimatedCostUsd ||
        (request.estimatedCostUsd !== undefined &&
          (!Number.isFinite(request.estimatedCostUsd) || request.estimatedCostUsd < 0))
      )
        throw new AuxError("permission_denied", "The original cloud resource reservation is unavailable.");
      const owners = this.owners(runId);
      for (const owner of owners) {
        const elapsed = Date.now() - owner.createdAt;
        if (owner.limits.deadlineMs !== undefined && elapsed >= owner.limits.deadlineMs)
          this.stop(runId, owner, "time", elapsed, owner.limits.deadlineMs, 0);
      }
      const funded = owners.filter((owner) => owner.limits.maxCostUsd !== undefined);
      if (!funded.length) return undefined;
      const id = randomUUID();
      const ledgers = funded.map((owner) => ({ owner, ledger: this.ledger(owner) }));
      for (const { owner, ledger } of ledgers) {
        if (ledger.holds.some((hold) => hold.kind === "resource" && hold.resourceId === request.resourceId))
          throw new AuxError("conflict", "The original cloud resource already has a funding hold.");
        if (receipt.financialBound !== "verified" || request.estimatedCostUsd === undefined)
          throw new ResourceFundingUnavailable(runId, {
            runId,
            kind: owner.kind,
            ownerId: owner.ownerId,
            budgetDigest: owner.digest,
          });
        const usage = this.usage(owner, ledger, [request.resourceId]);
        if (usage.costUsd + request.estimatedCostUsd > owner.limits.maxCostUsd!)
          this.stop(runId, owner, "spend", usage.costUsd, owner.limits.maxCostUsd!, request.estimatedCostUsd);
      }
      for (const { owner, ledger } of ledgers) {
        ledger.holds.push({
          kind: "resource",
          id,
          runId,
          resourceId: request.resourceId,
          reservationUsd: request.estimatedCostUsd!,
          tokens: 0,
          costUsd: request.estimatedCostUsd!,
          state: "pending",
        });
        this.save(owner, ledger);
      }
      this.repo.setSetting(`fundingReservation:${id}`, {
        kind: "resource",
        resourceId: request.resourceId,
        runId,
        ownerKeys: funded.map(key),
      });
      this.live.add(id);
      return id;
    });
  }

  /** Exact original resource accounting remains valid after the dispatch owner retires. */
  settleResource(runId: string, reservationId: string | undefined, resourceId: string): void {
    if (!reservationId) return;
    runAncestry(this.repo, runId);
    const receipt = this.resources.receipt(resourceId);
    const reservation = this.repo.getSetting<{
      kind: string;
      resourceId: string;
      runId: string;
      ownerKeys: string[];
    }>(`fundingReservation:${reservationId}`);
    if (
      !reservation ||
      reservation.kind !== "resource" ||
      reservation.resourceId !== resourceId ||
      reservation.runId !== runId ||
      !receipt ||
      receipt.runId !== runId ||
      receipt.state === "reserved"
    )
      throw new AuxError(
        "permission_denied",
        "The final cloud receipt does not belong to the original resource.",
      );
    const known =
      receipt.state === "settled" &&
      !receipt.costEstimated &&
      receipt.costUsd !== undefined &&
      Number.isFinite(receipt.costUsd) &&
      receipt.costUsd >= 0;
    this.repo.transaction(() => {
      for (const ownerKey of reservation.ownerKeys) {
        const ledger = this.repo.getSetting<Ledger>(ownerKey);
        const hold = ledger?.holds.find(
          (entry): entry is ResourceHold =>
            entry.kind === "resource" &&
            entry.id === reservationId &&
            entry.runId === runId &&
            entry.resourceId === resourceId,
        );
        if (!ledger || !hold || hold.reservationUsd !== receipt.reservationUsd)
          throw new AuxError("permission_denied", "The original cloud funding envelope changed.");
        if (hold.state === "settled" && !hold.opaque) {
          if (!known || hold.costUsd !== receipt.costUsd)
            throw new AuxError("conflict", "The original final cloud charge changed.");
          continue;
        }
        hold.state = receipt.state === "settled" ? "settled" : "pending";
        hold.opaque = !known;
        if (known) hold.costUsd = receipt.costUsd!;
        this.repo.setSetting(ownerKey, ledger);
      }
    });
    this.live.delete(reservationId);
    if (receipt.state !== "settled")
      throw new AuxError(
        "conflict",
        "The original cloud stop acknowledgement is unavailable; its funding remains held.",
      );
  }

  /** Release only while the exact original ledger still proves no provider create dispatch. */
  cancelResourceUnsent(runId: string, reservationId: string | undefined, resourceId: string): void {
    this.repo.transaction(() => {
      const receipt = this.resources.receipt(resourceId);
      if (!receipt || receipt.runId !== runId || receipt.state !== "reserved")
        throw new AuxError(
          "permission_denied",
          "This cloud resource may already have started; its funding remains held.",
        );
      if (!reservationId) return;
      const reservation = this.repo.getSetting<{
        kind: string;
        resourceId: string;
        runId: string;
        ownerKeys: string[];
      }>(`fundingReservation:${reservationId}`);
      if (
        !receipt ||
        receipt.runId !== runId ||
        receipt.state !== "reserved" ||
        !reservation ||
        reservation.kind !== "resource" ||
        reservation.resourceId !== resourceId ||
        reservation.runId !== runId
      )
        throw new AuxError(
          "permission_denied",
          "This cloud resource may already have started; its funding remains held.",
        );
      for (const ownerKey of reservation.ownerKeys) {
        const ledger = this.repo.getSetting<Ledger>(ownerKey);
        const hold = ledger?.holds.find(
          (entry): entry is ResourceHold =>
            entry.kind === "resource" &&
            entry.id === reservationId &&
            entry.runId === runId &&
            entry.resourceId === resourceId,
        );
        if (
          !ledger ||
          !hold ||
          hold.state !== "pending" ||
          hold.opaque ||
          hold.reservationUsd !== receipt.reservationUsd
        )
          throw new AuxError("conflict", "The original unsent cloud funding envelope is unavailable.");
        ledger.holds = ledger.holds.filter((entry) => entry !== hold);
        this.repo.setSetting(ownerKey, ledger);
      }
      this.repo.deleteSetting(`fundingReservation:${reservationId}`);
    });
    if (reservationId) this.live.delete(reservationId);
  }

  timeBudget(runId: string, budget: BudgetSuspension): BudgetSuspension {
    if (budget.reason !== "time" || budget.funding) return budget;
    const owners = this.owners(runId);
    const owner =
      owners.find(
        (candidate) => candidate.kind === "subagent_group" && candidate.limits.deadlineMs !== undefined,
      ) ??
      owners.find(
        (candidate) =>
          candidate.kind === "goal" && candidate.runId === runId && candidate.limits.deadlineMs !== undefined,
      );
    if (!owner) return budget;
    return {
      ...budget,
      limit: owner.limits.deadlineMs!,
      used: Date.now() - owner.createdAt,
      funding: { runId, kind: owner.kind, ownerId: owner.ownerId, budgetDigest: owner.digest },
    };
  }

  continue(
    runId: string,
    budget: BudgetSuspension,
    limits: Limits | undefined,
  ): { runId: string; deadlineMs: number }[] {
    const proof = budget.funding;
    if (!proof || !limits || Object.keys(limits).length !== 1)
      throw new AuxError("invalid_params", "Raise only this original funding limit.");
    if (runRoot(this.repo, proof.runId, true) !== runRoot(this.repo, runId, true))
      throw new AuxError("permission_denied", "The original funding belongs to another family.");
    const owner = this.owners(proof.runId).find(
      (candidate) => candidate.kind === proof.kind && candidate.ownerId === proof.ownerId,
    );
    if (!owner || owner.digest !== proof.budgetDigest)
      throw new AuxError("conflict", "The original funding budget changed.");
    const field =
      budget.reason === "tokens"
        ? "maxTokens"
        : budget.reason === "spend"
          ? "maxCostUsd"
          : budget.reason === "time"
            ? "deadlineMs"
            : undefined;
    if (!field || Object.keys(limits)[0] !== field)
      throw new AuxError("invalid_params", "Raise only the requested funding limit.");
    const limit = limits[field];
    const usage = this.usage(owner);
    const used =
      field === "maxTokens"
        ? usage.tokens
        : field === "maxCostUsd"
          ? usage.costUsd
          : Date.now() - owner.createdAt;
    const required =
      field === "maxTokens"
        ? (budget.requiredTokens ?? 0)
        : field === "maxCostUsd"
          ? (budget.requiredUsd ?? 0)
          : 0;
    if (
      limit === undefined ||
      !Number.isFinite(limit) ||
      limit <= budget.limit ||
      limit <= used ||
      limit < used + required ||
      (field !== "maxCostUsd" && !Number.isSafeInteger(limit))
    )
      throw new AuxError("conflict", "Raise the original funding above its actual use and next request.");
    const body = { ...owner.body };
    const deadlines: { runId: string; deadlineMs: number }[] = [];
    if (owner.kind === "goal") {
      body.budget = { ...(body.budget as Limits), [field]: limit };
      GoalSchema.parse(body);
      this.repo.db
        .prepare("UPDATE goals SET body=?,updated_at=? WHERE goal_id=?")
        .run(JSON.stringify(body), Date.now(), owner.ownerId);
      const original = this.repo.getRun(owner.runId)!;
      if (field === "maxCostUsd") original.config = { ...original.config, maxCostUsd: limit };
      if (field === "deadlineMs") {
        original.config = { ...original.config, deadlineMs: limit };
        deadlines.push({ runId: original.runId, deadlineMs: limit });
      }
      this.repo.saveRun(original);
    } else if (owner.kind === "subagent") {
      const name = field === "maxTokens" ? "tokenAllocation" : "costAllocationUsd";
      body[name] = limit;
      const group = SubagentGroupSchema.parse(
        JSON.parse(
          (
            this.repo.db
              .prepare("SELECT body FROM subagent_groups WHERE group_id=?")
              .get(body.groupId as string) as { body: string }
          ).body,
        ),
      );
      const cap = field === "maxTokens" ? group.tokenBudget : group.costBudgetUsd;
      if (cap > 0) {
        const siblings = this.repo.db
          .prepare("SELECT agent_id,body FROM subagents WHERE group_id=? AND agent_id<>?")
          .all(group.groupId, owner.ownerId) as { agent_id: string; body: string }[];
        const allocated = siblings.reduce((sum, row) => {
          const sibling = SubagentSchema.parse(
            JSON.parse(this.repo.revealRecordField("subagents", [row.agent_id], "body", row.body)),
          );
          const runs = sibling.runId ? lineageRuns(this.repo, sibling.runId) : [];
          const calls = runs.flatMap((id) => this.repo.listModelCalls(id));
          const resource = this.resources.usage(runs, []);
          const amount =
            field === "maxTokens"
              ? calls.reduce((n, call) => n + (call.inputTokens ?? 0) + (call.outputTokens ?? 0), 0)
              : calls.reduce((n, call) => n + (call.costUsd ?? 0), 0) + resource.costUsd;
          const allocation = field === "maxTokens" ? sibling.tokenAllocation : sibling.costAllocationUsd;
          const unknown =
            calls.some((call) =>
              field === "maxTokens"
                ? call.inputTokens === undefined || call.outputTokens === undefined
                : call.costUsd === undefined,
            ) ||
            (field === "maxCostUsd" && resource.opaque);
          return (
            sum +
            (["starting", "running"].includes(sibling.state) || unknown
              ? Math.max(amount, allocation)
              : amount)
          );
        }, 0);
        if (allocated + limit > cap)
          throw new AuxError("conflict", "Raise the containing group budget before this allocation.");
      }
      SubagentSchema.parse(body);
      this.repo.db
        .prepare("UPDATE subagents SET body=? WHERE agent_id=?")
        .run(
          this.repo.protectRecordField("subagents", [owner.ownerId], "body", JSON.stringify(body)),
          owner.ownerId,
        );
    } else {
      body[
        field === "maxTokens" ? "tokenBudget" : field === "maxCostUsd" ? "costBudgetUsd" : "timeBudgetMs"
      ] = limit;
      if (field === "deadlineMs") body.deadlineAt = owner.createdAt + limit;
      SubagentGroupSchema.parse(body);
      this.repo.db
        .prepare("UPDATE subagent_groups SET body=? WHERE group_id=?")
        .run(JSON.stringify(body), owner.ownerId);
      if (field === "deadlineMs")
        for (const id of owner.runs) {
          const run = this.repo.getRun(id);
          if (!run || !active.has(run.status)) continue;
          const deadlineMs = Math.max(1, owner.createdAt + limit - (run.startedAt ?? run.createdAt));
          run.config = { ...run.config, deadlineMs };
          this.repo.saveRun(run);
          deadlines.push({ runId: id, deadlineMs });
        }
    }
    return deadlines;
  }
}
