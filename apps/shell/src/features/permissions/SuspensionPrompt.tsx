import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { call, useStore } from "../../store";
import { suspensionController } from "../../action-approval";
import type { TrustConfirmation } from "../trust/confirmation";
import { Button, Kbd } from "../../ui";
import { GlassMaterial } from "../../components/GlassMaterial";
import "./SuspensionPrompt.css";
import { ActionReview } from "../coding/ActionReview";
import { FileChanges } from "../coding/FileChanges";
import { categoryLabels } from "./categories";

export function SuspensionPrompt({ runId, pill = false }: { runId?: string; pill?: boolean }) {
  const request = useStore((state) => state.confirmation);
  if (!request || (runId && request.turnId !== runId)) return null;
  return (
    <Prompt key={`${request.turnId}:${request.approvalId ?? request.pageId}`} request={request} pill={pill} />
  );
}
function Prompt({ request, pill }: { request: TrustConfirmation; pill: boolean }) {
  const controller = suspensionController(request);
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  const [options, setOptions] = useState(false);
  const [reviewedChanges, setReviewedChanges] =
    useState<import("@aux/contracts").SafetyAction["reviewedChanges"]>();
  const [reviewedActions, setReviewedActions] =
    useState<import("@aux/contracts").SafetyAction["reviewedActions"]>();
  const [reviewError, setReviewError] = useState("");
  useEffect(() => {
    if (!request.reviewedBatch) return;
    let live = true;
    void call("safety.approvals.pending", { threadId: request.threadId })
      .then((pending) => {
        if (!live || !controller.current()) return;
        const saved = pending.find((item) => item.approvalId === request.approvalId);
        if (!saved?.action.reviewedChanges && !saved?.action.reviewedActions)
          throw new Error("These actions must be reviewed again.");
        setReviewedChanges(saved.action.reviewedChanges);
        setReviewedActions(saved.action.reviewedActions);
      })
      .catch((error) => {
        if (live) setReviewError(error instanceof Error ? error.message : "Could not load reviewed changes.");
      });
    return () => {
      live = false;
    };
  }, [controller, request]);
  const handoff = request.kind === "handoff";
  const decide = useCallback(
    (action: "accept" | "acceptForOrigin" | "acceptForRun" | "acceptGlobally" | "decline") => {
      void controller.decide(action).catch(() => {});
    },
    [controller],
  );
  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.altKey ||
        event.shiftKey ||
        !controller.current()
      )
        return;
      if (document.querySelector("dialog[open]")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        decide("decline");
      } else if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        event.stopPropagation();
        if (handoff && request.pageId)
          void controller.takeover((pageId) => useStore.getState().activate(pageId)).catch(() => {});
        else if (!request.reviewedBatch || reviewedChanges || reviewedActions) decide("accept");
      }
    };
    document.addEventListener("keydown", keyboard);
    return () => document.removeEventListener("keydown", keyboard);
  }, [controller, handoff, request, decide, reviewedChanges, reviewedActions]);
  const site = request.site ? new URL(request.site).host : "";
  const confirmLabel = request.reviewedBatch
    ? reviewedActions
      ? "Approve these actions"
      : "Approve these changes"
    : request.kind === "touch-id"
      ? "Confirm with Touch ID"
      : "Allow once";
  const always = request.kind === "approval" && !!request.approvalId && !request.reviewedBatch;
  const category = categoryLabels[request.policyCategory].toLowerCase();
  return (
    <section
      className={`suspension-prompt${pill ? " suspension-prompt-pill liquid-glass" : ""}`}
      aria-label="Aux needs your input"
      aria-busy={state.busy}
    >
      {pill && <GlassMaterial />}
      <div className="suspension-prompt-message">
        <strong>
          {handoff ? "Your turn" : request.kind === "touch-id" ? "Confirm this action" : "Decision needed"}
        </strong>
        <p>{request.instruction}</p>
        {site && <span>{site}</span>}
      </div>
      {reviewedChanges && <FileChanges changes={reviewedChanges} />}
      {reviewedActions && <ActionReview actions={reviewedActions} />}
      {reviewError && <p role="alert">{reviewError}</p>}
      {state.error && <p role="alert">{state.error}</p>}
      <div className="suspension-prompt-actions">
        {!handoff && (
          <Button
            size={28}
            disabled={state.busy || (request.reviewedBatch && !reviewedChanges && !reviewedActions)}
            onClick={() => decide("accept")}
          >
            {confirmLabel}
            <Kbd>⌘↵</Kbd>
          </Button>
        )}
        {always && (
          <Button size={28} disabled={state.busy} onClick={() => setOptions(!options)}>
            More options
          </Button>
        )}
        {always && options && (
          <Button size={28} disabled={state.busy} onClick={() => decide("acceptForRun")}>
            Allow {category} for this run
          </Button>
        )}
        {((always && options) || request.kind === "touch-id") && !!site && (
          <Button size={28} disabled={state.busy} onClick={() => decide("acceptForOrigin")}>
            Always allow {category} on {site}
          </Button>
        )}
        {always && options && (
          <Button size={28} disabled={state.busy} onClick={() => decide("acceptGlobally")}>
            Always allow {category} everywhere
          </Button>
        )}
        <Button size={28} disabled={state.busy} onClick={() => decide("decline")}>
          Not now
        </Button>
        {request.pageId && (
          <Button
            size={28}
            disabled={state.busy}
            onClick={() =>
              void controller.takeover((pageId) => useStore.getState().activate(pageId)).catch(() => {})
            }
          >
            Take over{handoff && <Kbd>⌘↵</Kbd>}
          </Button>
        )}
      </div>
    </section>
  );
}
