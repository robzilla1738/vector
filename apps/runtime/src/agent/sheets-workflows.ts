import { stepSignature } from "./durable.js";
import { createHash, randomUUID } from "node:crypto";
import { AuxError, SheetsNavigationInputSchema, type SheetsNavigationInput } from "@aux/contracts";
import type { captureSheetsNavigation } from "./sheets-navigation.js";
import type { LoopToolResult } from "./loop/types.js";

type Request = Extract<SheetsNavigationInput, { action: "prepare" }>;
type Capture = Awaited<ReturnType<typeof captureSheetsNavigation>> & {
  authority: string;
  unresolvedEffects: boolean;
};
type Recipe = { request: Request; binding: string; expiresAt: number };
type Continuation = {
  request: Request;
  binding: string;
  capture: Capture;
  actionId: string;
  approvalId: string;
  identity: string;
  park: Extract<LoopToolResult, { park: unknown }>["park"];
};

/** One-use browser recipes use the existing act gate and durable receipts. */
export class SheetsWorkflows {
  private recipes = new Map<string, Recipe>();
  private continuations = new Map<string, Continuation>();
  private closed = false;
  constructor(
    private deps: {
      checkOwner(): void;
      capture(request: Request): Promise<Capture>;
      act(capture: Capture, actionId: string): Promise<LoopToolResult>;
      confirm(capture: Capture, actionId: string, execution: unknown, evidence: Capture["selection"]): string;
      approval(approvalId: string): ReturnType<import("../safety/approval.js").ApprovalStore["continuation"]>;
      undispatched(capture: Capture, actionId: string): boolean;
      now?: () => number;
    },
  ) {}
  private async capture(request: Request) {
    this.deps.checkOwner();
    if (this.closed) throw new AuxError("cancelled", "The original Sheets workflow retired.");
    const result = await this.deps.capture(request);
    this.deps.checkOwner();
    result.check();
    if (this.closed) throw new AuxError("cancelled", "The original Sheets workflow retired.");
    return result;
  }
  private binding(capture: Capture) {
    return createHash("sha256")
      .update(JSON.stringify([capture.authority, capture.selection, capture.control, capture.preconditions]))
      .digest("hex");
  }
  private matches(capture: Capture) {
    const { selection, target } = capture;
    const range = selection.selection.range;
    return (
      range?.a1 === target.a1 &&
      selection.activeCell.row >= target.startRow &&
      selection.activeCell.row <= target.endRow &&
      selection.activeCell.column >= target.startColumn &&
      selection.activeCell.column <= target.endColumn
    );
  }
  async invoke(raw: unknown, actionId: string): Promise<LoopToolResult> {
    const input = SheetsNavigationInputSchema.parse(raw);
    if (input.action === "prepare") {
      const captured = await this.capture(input);
      if (captured.unresolvedEffects)
        throw new AuxError("conflict", "Reconcile original unresolved effects before navigating Sheets.");
      if (this.matches(captured))
        return { output: { status: "already-selected", selection: captured.selection } };
      if (captured.control.value === input.a1)
        throw new AuxError(
          "capability_unsupported",
          "The Name box already echoes the target without matching grid evidence. Use Take over; no input was dispatched.",
        );
      const recipeId = randomUUID();
      while (this.recipes.size >= 8) this.recipes.delete(this.recipes.keys().next().value!);
      this.recipes.set(recipeId, {
        request: structuredClone(input),
        binding: this.binding(captured),
        expiresAt: (this.deps.now?.() ?? Date.now()) + 60_000,
      });
      return {
        output: {
          status: "prepared",
          recipeId,
          target: captured.target,
          selection: captured.selection,
          steps: captured.steps,
        },
      };
    }
    const pending = this.continuations.get(input.recipeId);
    let request: Request, captured: Capture;
    if (pending) {
      this.continuations.delete(input.recipeId);
      this.deps.checkOwner();
      pending.capture.check();
      const approval = this.deps.approval(pending.approvalId);
      if (
        pending.actionId !== actionId ||
        !approval ||
        approval.identity !== pending.identity ||
        !this.deps.undispatched(pending.capture, actionId)
      ) {
        throw new AuxError(
          "ref_stale",
          "The exact original approval, source or undispatched action retired. No input was replayed.",
        );
      }
      if (approval.state === "pending") {
        this.continuations.set(input.recipeId, pending);
        return { park: pending.park };
      }
      // Acceptance authorizes one continuation of the original action, never a fresh target binding.
      const fresh = await this.capture(pending.request);
      const accepted = this.deps.approval(pending.approvalId);
      pending.capture.check();
      if (
        !accepted ||
        accepted.state !== "accepted" ||
        accepted.identity !== pending.identity ||
        fresh.unresolvedEffects ||
        this.binding(fresh) !== pending.binding ||
        !this.deps.undispatched(pending.capture, actionId)
      )
        throw new AuxError(
          "ref_stale",
          "The originally approved Sheets target changed. No input was dispatched.",
        );
      request = pending.request;
      captured = pending.capture;
    } else {
      const recipe = this.recipes.get(input.recipeId);
      this.recipes.delete(input.recipeId);
      if (!recipe || recipe.expiresAt < (this.deps.now?.() ?? Date.now()))
        throw new AuxError(
          "ref_stale",
          "Prepare a fresh Sheets recipe. Consumed recipes never replay input.",
        );
      captured = await this.capture(recipe.request);
      request = recipe.request;
      if (captured.unresolvedEffects || recipe.binding !== this.binding(captured))
        throw new AuxError(
          "ref_stale",
          "The original Sheets source, target or selection changed. Prepare again.",
        );
    }
    captured.check();
    const execution = await this.deps.act(captured, actionId);
    if ("park" in execution) {
      if (!pending && execution.park.approvalId && this.deps.undispatched(captured, actionId)) {
        const approval = this.deps.approval(execution.park.approvalId);
        if (approval) {
          while (this.continuations.size >= 8)
            this.continuations.delete(this.continuations.keys().next().value!);
          this.continuations.set(input.recipeId, {
            request,
            capture: captured,
            binding: this.binding(captured),
            actionId,
            approvalId: execution.park.approvalId,
            identity: approval.identity,
            park: execution.park,
          });
        }
      }
      return execution;
    }
    if (!("output" in execution)) return execution;
    const output = execution.output as { status?: string; steps?: { op?: string; status?: string }[] };
    if (
      output?.status !== "completed" ||
      output.steps?.length !== 2 ||
      output.steps[0]?.op !== "fill" ||
      output.steps[0].status !== "ok" ||
      output.steps[1]?.op !== "press" ||
      output.steps[1].status !== "ok"
    )
      return execution;
    try {
      captured.check();
      this.deps.checkOwner();
      const after = await this.capture(request);
      captured.check();
      const original = captured.selection,
        current = after.selection;
      if (
        after.authority !== captured.authority ||
        original.sessionId !== current.sessionId ||
        original.windowId !== current.windowId ||
        original.controllerEpoch !== current.controllerEpoch ||
        original.documentId !== current.documentId ||
        original.gridId !== current.gridId ||
        JSON.stringify(original.gridPath) !== JSON.stringify(current.gridPath) ||
        JSON.stringify(original.sheet) !== JSON.stringify(current.sheet) ||
        after.preconditions[0]?.nodeIdentity !== captured.preconditions[0]?.nodeIdentity ||
        !this.matches(after)
      )
        throw new AuxError(
          "ref_stale",
          "Independent actual grid readback did not prove the requested selection.",
        );
      const confirmedIntentId = this.deps.confirm(captured, actionId, execution.output, current);
      return {
        output: {
          status: "selection-observed",
          selection: current,
          confirmedIntentId,
          execution: execution.output,
        },
      };
    } catch (error) {
      return {
        output: {
          status: "uncertain",
          handback: true,
          reason: error instanceof Error ? error.message : String(error),
          execution: execution.output,
          instruction:
            "Inspect the actual grid. No input will be replayed; prepare a new recipe only after reconciling the original action.",
        },
      };
    }
  }
  close() {
    this.closed = true;
    this.recipes.clear();
    this.continuations.clear();
  }
}

/** Settle only the original Enter intent after independent browser selection evidence. */
export function confirmSheetsSelection(
  ledger: import("./durable.js").DurableWriteLedger,
  input: {
    runId: string;
    pageId: string;
    documentEpoch: number;
    actionId: string;
    steps: import("@aux/contracts").PlanStep[];
    execution: unknown;
    selection: Capture["selection"];
  },
) {
  const key = createHash("sha256")
    .update(
      JSON.stringify([
        "logical-action",
        `${input.actionId}:${input.actionId}:step:1:0:${stepSignature(input.steps.map(({ id: _id, ...step }) => step))}`,
      ]),
    )
    .digest("hex");
  const intent = ledger.get(key);
  const ids = (input.execution as { uncertainIntentIds?: string[] }).uncertainIntentIds ?? [];
  if (
    !intent ||
    ids.length !== 1 ||
    ids[0] !== intent.id ||
    intent.runId !== input.runId ||
    intent.pageId !== input.pageId ||
    intent.documentEpoch !== input.documentEpoch ||
    intent.summary?.ops.join(",") !== "press"
  )
    throw new AuxError("conflict", "Independent grid evidence cannot settle unrelated original effects.");
  ledger.reconcile(
    intent.id,
    "applied",
    JSON.stringify({
      stepId: `${input.actionId}:step:1`,
      op: "press",
      effect: "observed",
      receipt: {
        observed: "Actual accessible grid selection " + input.selection.selection.range?.a1,
        remoteConfirmed: false,
        uncertain: false,
        unconfirmed: false,
        dispatchedBeforeTakeover: false,
        identity: { pageId: input.pageId, documentEpoch: input.documentEpoch, target: "css:#t-name-box" },
      },
      sheetsSelection: input.selection,
    }),
  );
  return intent.id;
}

/** A continuation may authorize only steps that have never been dispatched. */
export function sheetsInputsUndispatched(
  ledger: import("./durable.js").DurableWriteLedger,
  steps: import("@aux/contracts").PlanStep[],
  actionId: string,
) {
  const signature = stepSignature(steps.map(({ id: _id, ...step }) => step));
  return steps.every((_step, index) => {
    const key = createHash("sha256")
      .update(JSON.stringify(["logical-action", `${actionId}:${actionId}:step:${index}:0:${signature}`]))
      .digest("hex");
    const intent = ledger.get(key);
    return !intent || intent.status === "not_applied";
  });
}
