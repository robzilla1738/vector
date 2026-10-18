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
type Recipe = { request: LinkedInWorkflowInput; binding: string; expiresAt: number };

/** Ephemeral plans are not action authority. Only the existing act executor can apply a sealed plan. */
export class LinkedInWorkflows {
  private recipes = new Map<string, Recipe>();
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
      ): Promise<LoopToolResult>;
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
    return { captured, result: prepareLinkedInWorkflow({ ...captured, request }) };
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
          }
        : undefined;
    return this.deps.act(next.steps, actionId, captured.checkOwner, precondition);
  }
  close() {
    this.closed = true;
    this.recipes.clear();
  }
}
