import { AuxError, EventTypes, newStepId } from "@aux/contracts";
import { MODEL_REGISTRY } from "@aux/contracts/model-registry";
import {
  attemptsOf,
  modelCallCost,
  modelUndispatched,
  type ModelAttempt,
  type ModelClient,
} from "../agent/model-client.js";
import type { Repo } from "../store/repo.js";
import type { EventBus } from "../events.js";
import type { BudgetsService } from "./budgets.js";
import type { SettingsService } from "./settings.js";
import { estimatedPromptTokens, projectedModelCostUsd } from "../store/spend-ledger.js";
import { withRunAuthorityMutation } from "./overnight-authority.js";
import { RunFundingService, ModelFundingUnavailable } from "./run-funding.js";

type Route = NonNullable<Awaited<ReturnType<SettingsService["utilityModel"]>>>;
type Request = {
  modelId: string;
  system?: string;
  prompt: string;
  maxOutputTokens?: number;
};

/** Cache misses enter the original run ledger; the SDK owns the global transport ledger. */
export function accountableUtilityModel(input: {
  repo: Repo;
  events: EventBus;
  settings: SettingsService;
  budgets?: BudgetsService;
  accountBudget?: import("./private-budget.js").PrivateBudgetClient;
  funding: RunFundingService;
  pauseFunding: (error: ModelFundingUnavailable) => Promise<void>;
  runId: string;
  route: Route;
  signal: AbortSignal;
  bestEffort?: boolean;
  checkOwner: () => void | Promise<void>;
  authorize: () => Promise<void>;
  reserveCall: () => Promise<() => void>;
  continueSpend: (error: AuxError, requiredUsd: number) => Promise<void>;
}): ModelClient {
  const generation = input.settings.modelCacheGeneration();
  const revision = input.settings.agentPolicy().agentPolicyRevision;
  const check = async () => {
    input.signal.throwIfAborted();
    await input.checkOwner();
    input.signal.throwIfAborted();
    if (
      input.settings.modelCacheGeneration() !== generation ||
      input.settings.agentPolicy().agentPolicyRevision !== revision
    )
      throw new AuxError("cancelled", "The original utility account or policy changed.");
  };
  async function invoke<T extends ModelAttempt>(
    request: Request,
    call: (beforeDispatch: () => Promise<void>, signal: AbortSignal) => Promise<T>,
  ): Promise<T> {
    await check();
    const subscription = input.settings
      .registryModels()
      .some((model) => model.id === request.modelId && model.billingKind === "subscription");
    try {
      await input.funding.assertModelAdmission(input.runId, request.modelId);
    } catch (error) {
      if (error instanceof ModelFundingUnavailable && !input.bestEffort) {
        await check();
        await input.pauseFunding(error);
        throw new AuxError("cancelled", "Model capability continuation requires a fresh admission.");
      }
      throw error;
    }
    const onDevice = input.route.kind === "on-device";
    const projected = onDevice
      ? 0
      : subscription
        ? undefined
        : projectedModelCostUsd(
            request.modelId,
            estimatedPromptTokens(request.system ?? "", request.prompt),
            request.maxOutputTokens ?? 128,
            [...MODEL_REGISTRY, ...input.settings.registryModels()],
          );
    if (projected === undefined && input.bestEffort)
      throw new AuxError(
        "backend_unavailable",
        "This optional utility request has no verified price estimate.",
      );
    // Unknown pricing is held conservatively, never reported as a free provider call.
    const estimate = subscription ? undefined : (projected ?? 1);
    await check();
    await input.authorize();
    await check();
    const release = await input.reserveCall();
    let callId: string | undefined;
    const accountBudgetId = newStepId();
    let accountReserved = false;
    let receipt: ModelAttempt | undefined;
    let failure: unknown;
    const started = Date.now();
    const cancel = new AbortController();
    const signal = AbortSignal.any([input.signal, cancel.signal]);
    const unsubscribe = input.events.subscribe(() => {
      const run = input.repo.getRun(input.runId);
      if (
        !run ||
        !["running", "needs_input", "paused"].includes(run.status) ||
        input.settings.modelCacheGeneration() !== generation ||
        input.settings.agentPolicy().agentPolicyRevision !== revision
      )
        cancel.abort(new AuxError("cancelled", "The original utility run or account changed."));
    });
    try {
      const beforeDispatch = async () => {
        if (callId) throw new AuxError("conflict", "A utility request cannot dispatch twice.");
        while (true) {
          await check();
          await input.authorize();
          await check();
          try {
            await withRunAuthorityMutation(input.repo, async () => {
              await check();
              await input.accountBudget?.refresh();
              input.budgets?.assertWithin({ runId: input.runId, requiredUsd: estimate });
              if (input.accountBudget) {
                accountReserved = true;
                await input.accountBudget.reserve(accountBudgetId, "model", projected);
              }
              await check();
              input.repo.transaction(() => {
                const invoiceId = newStepId();
                callId = invoiceId;
                const writeInvoice = () =>
                  input.repo.saveModelCall({
                    callId: invoiceId,
                    runId: input.runId,
                    role: "agent",
                    modelId: request.modelId,
                    providerMetadata: {
                      aux: {
                        kind: "utility_generation",
                        ...(input.route.kind === "network"
                          ? {
                              provider: input.route.provider,
                              destination: input.route.destination,
                            }
                          : {
                              backend: "apple-foundation-models",
                              transport: "on-device",
                            }),
                      },
                    },
                    durationMs: 0,
                    costUsd: estimate,
                    costEstimated: !onDevice,
                    createdAt: Date.now(),
                  });
                if (input.accountBudget) input.accountBudget.record(accountBudgetId, writeInvoice);
                else writeInvoice();
              });
            });
            release(); // The durable reservation now accounts for this slot.
            return;
          } catch (error) {
            if (accountReserved && !callId) {
              await input.accountBudget?.cancel(accountBudgetId);
              accountReserved = false;
            }
            if (input.bestEffort || !(error instanceof AuxError)) throw error;
            if (estimate === undefined) throw error;
            await input.continueSpend(error, estimate);
          }
        }
      };
      const result = await call(beforeDispatch, signal);
      receipt = result;
      if (!callId) throw new AuxError("conflict", "The utility transport did not acknowledge dispatch.");
      await check();
      return result;
    } catch (error) {
      failure = error;
      receipt ??= attemptsOf(error).at(-1);
      throw error;
    } finally {
      try {
        if (callId && modelUndispatched(failure)) {
          await withRunAuthorityMutation(input.repo, async () =>
            input.repo.discardModelCallReservation(callId!, input.runId),
          );
          if (accountReserved) await input.accountBudget?.cancel(accountBudgetId);
          accountReserved = false;
        } else if (callId) {
          const cost = receipt
            ? modelCallCost(receipt.modelId ?? request.modelId, receipt, input.settings.registryModels())
            : {};
          const settled = {
            costUsd: onDevice ? 0 : cost.costUsd,
            costEstimated: onDevice ? false : (cost.costEstimated ?? true),
            durationMs: receipt?.durationMs ?? Date.now() - started,
            inputTokens: receipt?.inputTokens,
            outputTokens: receipt?.outputTokens,
            ...(failure ? { error: failure instanceof Error ? failure.message : String(failure) } : {}),
          };
          await withRunAuthorityMutation(input.repo, async () =>
            input.repo.settleModelCall(callId!, input.runId, settled),
          );
          if (accountReserved)
            await input.accountBudget?.settle(accountBudgetId, {
              costUsd: onDevice ? 0 : cost.costUsd,
              costEstimated: onDevice ? false : (cost.costEstimated ?? true),
            });
          input.events.emit(
            EventTypes.ModelCall,
            { runId: input.runId, callId, modelId: request.modelId, ...settled },
            input.runId,
          );
        }
      } finally {
        if (accountReserved && !callId) await input.accountBudget?.cancel(accountBudgetId);
        unsubscribe();
        release();
      }
    }
  }
  return {
    generateStructured: (opts) =>
      invoke(opts, (beforeDispatch, signal) =>
        input.route.model.generateStructured({
          ...opts,
          signal,
          maxAttempts: 1,
          beforeDispatch,
        }),
      ),
    generateText: (opts) =>
      invoke(opts, (beforeDispatch, signal) =>
        input.route.model.generateText({
          ...opts,
          signal,
          maxAttempts: 1,
          beforeDispatch,
        }),
      ),
    listModels: () => input.route.model.listModels(),
  };
}
