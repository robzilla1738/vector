import type { ContextActionCapture } from "@aux/chromium-driver";
import { createHash, randomUUID } from "node:crypto";
import { AuxError, type Observation, type PlanStep } from "@aux/contracts";
import {
  LinkedInToolInputSchema,
  LinkedInWorkflowInputSchema,
  type LinkedInWorkflowInput,
  type LinkedInWorkflowSource,
  type LinkedInWorkflowResult,
  type LinkedInActionPrecondition,
} from "@aux/contracts/linkedin";
import type { LoopToolResult } from "./loop/types.js";
import { prepareLinkedInWorkflow } from "./linkedin-adapter.js";

type Capture = {
  source: LinkedInWorkflowSource;
  observation: Observation;
  observedScopeRef?: string;
  observedScopeRole?: string;
  unresolvedEffects: boolean;
  checkOwner?: () => void;
};
type Recipe = {
  request: LinkedInWorkflowInput;
  binding: string;
  expiresAt: number;
};
type Continuation = {
  captured: Capture;
  steps: PlanStep[];
  precondition: LinkedInActionPrecondition;
  native: ContextActionCapture;
  actionId: string;
  approvalId: string;
  identity: string;
  park: Extract<LoopToolResult, { park: unknown }>["park"];
};

/** Ephemeral plans are not action authority. Only the existing act executor can apply a sealed plan. */
export class LinkedInWorkflows {
  private recipes = new Map<string, Recipe>();
  private continuations = new Map<string, Continuation>();
  private closed = false;
  constructor(
    private deps: {
      checkOwner(): void | Promise<void>;
      capture(request: LinkedInWorkflowInput): Promise<Capture>;
      act(
        steps: PlanStep[],
        actionId: string,
        sourceCheck?: () => void,
        precondition?: LinkedInActionPrecondition,
        native?: ContextActionCapture,
      ): Promise<LoopToolResult>;
      approval(approvalId: string): ReturnType<import("../safety/approval.js").ApprovalStore["continuation"]>;
      undispatched(steps: PlanStep[], actionId: string, pageId: string): boolean;
      now?: () => number;
    },
  ) {}

  private async capture(request: LinkedInWorkflowInput) {
    if (this.closed) throw new AuxError("cancelled", "The original LinkedIn workflow ended.");
    await this.deps.checkOwner();
    const captured = await this.deps.capture(request);
    await this.deps.checkOwner();
    captured.checkOwner?.();
    if (this.closed) throw new AuxError("cancelled", "The original LinkedIn workflow ended.");
    return {
      captured,
      result: prepareLinkedInWorkflow({ ...captured, request }),
    };
  }
  private binding(capture: Capture, result: LinkedInWorkflowResult) {
    const { observationId: _id, observationRevision: _revision, ...owner } = result.source;
    const step = result.next?.steps[0];
    const target =
      step && "target" in step
        ? capture.observation.content.elements.find((element) => element.ref === step.target)
        : undefined;
    return createHash("sha256")
      .update(
        JSON.stringify({
          owner,
          scope: capture.observedScopeRef,
          scopeRole: capture.observedScopeRole,
          next: result.next
            ? {
                ...result.next,
                steps: result.next.steps.map((step) =>
                  "target" in step ? { ...step, target: undefined } : step,
                ),
              }
            : null,
          target: target
            ? {
                tag: target.tag,
                role: target.role,
                name: target.name,
                type: target.type,
                value:
                  target.value ??
                  capture.observation.content.formFields.find((field) => field.ref === target.ref)?.value,
                href: target.href,
                frame: target.frame,
                disabled: target.disabled,
                hidden: target.hidden,
              }
            : null,
          // Each recipient link is observed inside the exact native subtree, not supplied as proof by the model.
          recipients: result.read.links
            .filter((link) => link.kind === "profile")
            .map((link) => [link.url, link.text])
            .sort(),
        }),
      )
      .digest("hex");
  }
  async invoke(raw: unknown, actionId: string): Promise<LoopToolResult> {
    const input = LinkedInToolInputSchema.parse(raw);
    if (input.action === "prepare") {
      const request = LinkedInWorkflowInputSchema.parse(input.request);
      const { captured, result } = await this.capture(request);
      if (!result.next) return { output: result };
      const recipeId = randomUUID();
      while (this.recipes.size >= 8) this.recipes.delete(this.recipes.keys().next().value!);
      this.recipes.set(recipeId, {
        request: structuredClone(request),
        binding: this.binding(captured, result),
        expiresAt: (this.deps.now?.() ?? Date.now()) + 5 * 60_000,
      });
      return { output: { ...result, recipeId } };
    }
    const pending = this.continuations.get(input.recipeId);
    if (pending) {
      this.continuations.delete(input.recipeId);
      try {
        if (this.closed) throw new AuxError("cancelled", "The original LinkedIn workflow ended.");
        await this.deps.checkOwner();
        if (this.closed) throw new AuxError("cancelled", "The original LinkedIn workflow ended.");
        pending.captured.checkOwner?.();
        const approval = this.deps.approval(pending.approvalId);
        if (
          pending.actionId !== actionId ||
          !approval ||
          approval.identity !== pending.identity ||
          !this.deps.undispatched(pending.steps, actionId, pending.captured.source.pageId)
        )
          throw new AuxError(
            "ref_stale",
            "The original LinkedIn approval/source/action retired. No input was replayed.",
          );
        if (approval.state === "pending") {
          this.continuations.set(input.recipeId, pending);
          return { park: pending.park };
        }
        pending.native.approvalId = pending.approvalId;
        // Original backend nodes are retained privately; accepted review never resolves new refs.
        return await this.deps.act(
          pending.steps,
          actionId,
          pending.captured.checkOwner,
          pending.precondition,
          pending.native,
        );
      } finally {
        if (this.continuations.get(input.recipeId) !== pending) pending.native.source?.retire();
      }
    }
    const recipe = this.recipes.get(input.recipeId);
    if (!recipe || recipe.expiresAt < (this.deps.now?.() ?? Date.now())) {
      this.recipes.delete(input.recipeId);
      throw new AuxError(
        "ref_stale",
        "Prepare a fresh LinkedIn recipe. Old, resumed or consumed recipes cannot execute.",
      );
    }
    const { captured, result } = await this.capture(recipe.request);
    if (!result.next || recipe.binding !== this.binding(captured, result)) {
      this.recipes.delete(input.recipeId);
      throw new AuxError(
        "ref_stale",
        "The original Profile, task, document, recipient or draft changed. Inspect before preparing a new action.",
      );
    }
    await this.deps.checkOwner();
    if (this.closed) throw new AuxError("cancelled", "The original LinkedIn workflow ended.");
    if (this.recipes.get(input.recipeId) !== recipe || recipe.expiresAt < (this.deps.now?.() ?? Date.now()))
      throw new AuxError("ref_stale", "This recipe was consumed or expired while re-observing.");
    captured.checkOwner?.();
    // Consume before dispatch/approval parking. Neither a resume nor an uncertain result can replay it.
    this.recipes.delete(input.recipeId);
    const next = result.next;
    const step = next.steps[0]!;
    const precondition: LinkedInActionPrecondition | undefined =
      (next.effect === "draft" ||
        next.effect === "external-message" ||
        next.effect === "external-invitation") &&
      (step.op === "click" || step.op === "fill") &&
      typeof step.target === "string"
        ? {
            kind: "linkedin",
            source: result.source,
            recipientUrl: next.recipientUrl!,
            exactContent: next.exactContent ?? "",
            targetRef: step.target,
            effect: next.effect,
            actionId,
            invitation: recipe.request.operation === "draft-invitation",
            context: (() => {
              const rootRef = captured.observedScopeRef;
              if (!rootRef) return undefined;
              const elements = captured.observation.content.elements.filter(
                (element) => !element.hidden && !element.disabled && element.frame === "main",
              );
              const recipients = elements.filter(
                (element) =>
                  element.href &&
                  (() => {
                    try {
                      return (
                        new URL(element.href).pathname.replace(/\/$/, "") ===
                        new URL(next.recipientUrl!).pathname.replace(/\/$/, "")
                      );
                    } catch {
                      return false;
                    }
                  })(),
              );
              const editors = elements.filter((element) =>
                step.op === "fill"
                  ? element.ref === step.target
                  : (element.role === "textbox" || element.tag === "textarea") &&
                    (element.value ??
                      captured.observation.content.formFields.find((field) => field.ref === element.ref)
                        ?.value) === (next.exactContent ?? ""),
              );
              if (recipients.length !== 1 || editors.length !== 1) return undefined;
              const editor = editors[0]!;
              const beforeContent =
                editor.value ??
                captured.observation.content.formFields.find((field) => field.ref === editor.ref)?.value;
              if (beforeContent === undefined) return undefined;
              return {
                rootRef,
                recipientRef: recipients[0]!.ref,
                editorRef: editor.ref,
                actionRef: step.target,
                beforeContent,
              };
            })(),
          }
        : undefined;
    const native: ContextActionCapture = {};
    let retained = false;
    try {
      const execution = await this.deps.act(next.steps, actionId, captured.checkOwner, precondition, native);
      if (
        "park" in execution &&
        execution.park.approvalId &&
        precondition &&
        native.source &&
        this.deps.undispatched(next.steps, actionId, captured.source.pageId)
      ) {
        const approval = this.deps.approval(execution.park.approvalId);
        if (approval) {
          captured.checkOwner?.();
          await this.deps.checkOwner();
          if (this.closed) throw new AuxError("cancelled", "The original LinkedIn workflow ended.");
          while (this.continuations.size >= 8) {
            const oldest = this.continuations.keys().next().value!;
            this.continuations.get(oldest)!.native.source?.retire();
            this.continuations.delete(oldest);
          }
          this.continuations.set(input.recipeId, {
            captured,
            steps: next.steps,
            precondition,
            native,
            actionId,
            approvalId: execution.park.approvalId,
            identity: approval.identity,
            park: execution.park,
          });
          retained = true;
        }
      }
      return execution;
    } finally {
      if (!retained) native.source?.retire();
    }
  }
  close() {
    this.closed = true;
    this.recipes.clear();
    for (const pending of this.continuations.values()) pending.native.source?.retire();
    this.continuations.clear();
  }
}
