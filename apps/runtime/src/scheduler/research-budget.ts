import { MODEL_REGISTRY, registryCostUsd, type ModelCapability } from "@aux/contracts/model-registry";
import { modelCallCost, type ModelAttempt } from "../agent/model-client.js";

export interface ResearchLimits {
  maxModelCalls: number;
  maxTokens: number;
  deadlineMs: number;
  maxCostUsd?: number;
}

/** One admission gate shared by every member of a set run. All mutations are synchronous. */
export class ResearchBudget {
  readonly signal: AbortSignal;
  private readonly deadline = new AbortController();
  private readonly timer: ReturnType<typeof setTimeout>;
  private calls = 0;
  private tokens = 0;
  private cost = 0;

  constructor(readonly limits: ResearchLimits, parentSignal: AbortSignal,
    private readonly models: readonly ModelCapability[]=MODEL_REGISTRY) {
    this.signal = AbortSignal.any([parentSignal, this.deadline.signal]);
    this.timer = setTimeout(() => this.deadline.abort(new Error("Research deadline exceeded")), limits.deadlineMs);
  }

  close(): void { clearTimeout(this.timer); }

  reason(): string | undefined {
    if (this.deadline.signal.aborted) return "shared research deadline exhausted";
    if (this.signal.aborted) return "research run cancelled";
    return undefined;
  }

  reserveModel(modelId: string, prompt: string, system: string, maxOutputTokens: number):
    { reason: string } | { finish: (attempts?: ModelAttempt[]) => void } {
    const reason = this.reason();
    if (reason) return { reason };
    if (this.calls >= this.limits.maxModelCalls) return { reason: "shared research model-call budget exhausted" };
    // UTF-8 bytes conservatively bound prompt tokens for the supported text
    // providers. Reserve the full output allowance before concurrent dispatch.
    const reservedTokens = Buffer.byteLength(`${system}\n${prompt}`, "utf8") + maxOutputTokens;
    if (this.tokens + reservedTokens > this.limits.maxTokens) return { reason: "shared research token budget exhausted" };
    const reservedCost = registryCostUsd(modelId, {
      inputTokens: reservedTokens - maxOutputTokens, outputTokens: maxOutputTokens,
    },this.models);
    if (this.limits.maxCostUsd !== undefined && reservedCost === undefined)
      return { reason: "This model has no catalog price; choose a priced model or remove the USD cap" };
    if (this.limits.maxCostUsd !== undefined && this.cost + reservedCost! > this.limits.maxCostUsd)
      return { reason: "shared research USD budget exhausted" };
    this.calls++;
    this.tokens += reservedTokens;
    this.cost += reservedCost ?? 0;
    let finished = false;
    return { finish: (attempts = []) => {
      if (finished) return;
      finished = true;
      // A failed/opaque provider call retains its reservation because its
      // actual bill is unknown. Complete usage refunds unused capacity.
      if (attempts.length && attempts.every(attempt => attempt.inputTokens !== undefined && attempt.outputTokens !== undefined)) {
        this.tokens += attempts.reduce((total,attempt)=>total+attempt.inputTokens!+attempt.outputTokens!,0)-reservedTokens;
      }
      if (attempts.length && reservedCost !== undefined) {
        const actual = attempts.map(attempt => {
          const reported=modelCallCost(modelId,attempt);
          return reported.costEstimated ? registryCostUsd(modelId,attempt,this.models) :
            reported.costUsd ?? registryCostUsd(modelId,attempt,this.models);
        });
        if (actual.every(value => value !== undefined)) this.cost += actual.reduce((sum,value)=>sum+value!,0)-reservedCost;
      }
      this.calls += Math.max(0,attempts.length-1);
    } };
  }

  snapshot() { return { modelCalls:this.calls,tokens:this.tokens,estimatedCostUsd:this.cost,deadlineExceeded:this.deadline.signal.aborted }; }
}
