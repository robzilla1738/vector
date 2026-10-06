import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useStore } from "../../store";
import { suspensionController } from "../../action-approval";
import type { TrustConfirmation } from "../trust/confirmation";
import { Button, Kbd } from "../../ui";
import { GlassMaterial } from "../../components/GlassMaterial";
import "./SuspensionPrompt.css";

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
  const handoff = request.kind === "handoff";
  const decide = useCallback(
    (action: "accept" | "acceptForOrigin" | "decline") => {
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
        else decide("accept");
      }
    };
    document.addEventListener("keydown", keyboard);
    return () => document.removeEventListener("keydown", keyboard);
  }, [controller, handoff, request, decide]);
  const site = request.site ? new URL(request.site).host : "";
  const confirmLabel = request.kind === "touch-id" ? "Confirm with Touch ID" : "Allow once";
  const always = !handoff && !!request.approvalId && !!request.site;
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
      {state.error && <p role="alert">{state.error}</p>}
      <div className="suspension-prompt-actions">
        {!handoff && (
          <Button size={28} disabled={state.busy} onClick={() => decide("accept")}>
            {confirmLabel}
            <Kbd>⌘↵</Kbd>
          </Button>
        )}
        {always && (
          <Button size={28} disabled={state.busy} onClick={() => decide("acceptForOrigin")}>
            Always allow on {site}
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
