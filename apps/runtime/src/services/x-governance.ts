import {
  AuxError,
  EffectRequestSchema,
  type EffectRequest,
  type Decision,
  type AgentPolicyCategory,
  type SafetyAction,
} from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { SafetyDispatchGate } from "../safety/dispatch.js";
import type { XDispatch } from "./x-operations.js";
import type { XGrantService } from "./x-grants.js";
/** Uses the same decide/park/policy fence as browser and coding actions. */
export function xAuthorizer(deps: {
  repo: Repo;
  profileId: string;
  privateProfile: boolean;
  closed(): boolean;
  grants: XGrantService;
  gate: SafetyDispatchGate;
  decide(
    request: EffectRequest,
    options: { policyCategories: AgentPolicyCategory[]; reviewedActions?: SafetyAction["reviewedActions"] },
  ): Promise<Decision>;
}) {
  return async (input: XDispatch, signal: AbortSignal): Promise<() => void> => {
    const original = deps.repo.getRun(input.runId);
    const check = () => {
      signal.throwIfAborted();
      if (deps.repo.getSetting<{ connectors?: boolean }>("featureOverrides")?.connectors === false)
        throw new AuxError("feature_unavailable", "Connected services are disabled in Labs.");
      const run = deps.repo.getRun(input.runId);
      if (
        deps.closed() ||
        deps.privateProfile ||
        !original ||
        !run ||
        run.status !== "running" ||
        run.config?.privateTask ||
        !run.config?.xGrantIds?.includes(input.grantId) ||
        run.config.nativeTurnContext !== original.config?.nativeTurnContext ||
        run.config.taskId !== input.taskId ||
        run.config.taskRevision !== input.taskRevision
      )
        throw new AuxError("permission_denied", "The original X run or account authority retired.");
      deps.grants.require(input);
    };
    check();
    const endpoint = new URL(input.request.url);
    const common = {
      profileId: deps.profileId,
      scope: { kind: "task", id: input.taskId },
      actor: "builtin_agent",
      action: `x.${input.operation}`,
      origin: endpoint.origin,
      destination: endpoint.href.slice(0, 2048),
      recipient: `${input.connectionId}:${input.request.objectId}`.slice(0, 200),
      dataClasses: input.request.body ? ["sensitive"] : [],
      provenance: "template",
      invocationDigest: input.request.sha256,
      turnId: input.runId,
      threadId: original!.config?.chatId ?? input.runId,
      runId: input.runId,
      requestedAt: Date.now(),
    };
    const fences: (() => void)[] = [];
    const dispatch = async (
      effect: "egress" | "read" | "write",
      category: "read" | "submit" | "external_tool",
      policyCategories: AgentPolicyCategory[],
    ) => {
      const request = EffectRequestSchema.parse({ ...common, effect, category });
      const preview = input.args;
      const decision = await deps.decide(request, {
        policyCategories,
        ...(input.effect !== "read"
          ? {
              reviewedActions: [
                {
                  action: input.operation,
                  target: `${input.source.username} / ${input.request.objectId}`,
                  arguments: JSON.stringify(preview),
                  destination: input.request.url,
                },
              ],
            }
          : {}),
      });
      check();
      if (decision.status === "deny") throw new AuxError("permission_denied", decision.guidance);
      if (decision.status === "ask") {
        deps.gate.park(request, request, decision.suspension);
        throw new AuxError("needs_input", decision.suspension.instruction, {
          park: {
            kind: decision.suspension.kind,
            instruction: decision.suspension.instruction,
            approvalId: decision.suspension.approvalId,
          },
        });
      }
      fences.push(deps.gate.policyFence(input.runId));
    };
    await dispatch("egress", "read", ["read"]);
    await dispatch(
      input.effect === "read" ? "read" : "write",
      input.effect === "send" ? "submit" : input.effect === "read" ? "read" : "external_tool",
      [input.effect === "send" ? "send" : input.effect === "read" ? "read" : "external_tool"],
    );
    return () => {
      check();
      for (const fence of fences) fence();
    };
  };
}
