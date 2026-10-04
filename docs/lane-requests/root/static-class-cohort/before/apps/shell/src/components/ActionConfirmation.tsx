import { staticHintProps } from "../ui/class-props";
import { errorMessage } from "../error-message";
import { useEffect, useRef, useState } from "react";
import { isScrimOverlay } from "../chrome";
import { executeCommand } from "../commands";
import type { TrustConfirmation } from "../features/trust/confirmation";
import { useStore } from "../store";
import { bridge } from "../bridge";
import { Dialog } from "../ui";
import { useFeature } from "../use-feature";
import {
  nativeButtonTypeProps as auxNativeButtonTypeProps,
} from "../ui/native-attribute-props";

/** The person confirms a page action. Allow decides the approval once. */
export function ActionConfirmation() {
  const confirmation = useStore(s => s.confirmation);
  return confirmation ? <Confirm key={`${confirmation.turnId}:${confirmation.approvalId ?? confirmation.pageId}`} confirmation={confirmation} /> : null;
}

function Confirm({ confirmation }: { confirmation: TrustConfirmation }) {
  const sitePermissions = useFeature("agentSitePermissions");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const decline = useRef<HTMLButtonElement>(null);
  const deciding = useRef(false);
  useEffect(() => {
    let live = true;
    void bridge.overlay(true).then(() => { if (live) return bridge.focusShell(); }).then(() => {
      if (live) decline.current?.focus();
    }).catch(() => {});
    return () => {
      live = false;
      void bridge.overlay(isScrimOverlay(useStore.getState().overlay));
    };
  }, []);
  async function decide(decision: "accept" | "acceptForOrigin" | "decline" | "takeover") {
    if (deciding.current) return;
    deciding.current = true;
    setBusy(true);
    setError("");
    try {
      if (decision === "takeover") {
        if (!confirmation.pageId) throw new Error("The requested page is unavailable.");
        await executeCommand("take-over-agent-action", { payload: { pageId: confirmation.pageId, turnId: confirmation.turnId } });
      } else {
        if (!confirmation.approvalId) {
          if (decision !== "decline") throw new Error("This action requires you to take over.");
          await executeCommand("deny-agent-action", { payload: { turnId: confirmation.turnId } });
          return;
        }
        await executeCommand(decision === "accept" ? "approve-agent-action" : decision === "acceptForOrigin" ? "allow-agent-action-for-origin" : "deny-agent-action",
          { payload: { approvalId: confirmation.approvalId, turnId: confirmation.turnId } });
      }
    } catch (reason) {
      deciding.current = false;
      setError(errorMessage(reason));
      setBusy(false);
    }
  }
  const site = confirmation.origin.replace(/^https?:\/\//, "");
  const handoff = confirmation.confirmation === "handoff";
  const preapprovable = confirmation.confirmation === "preapprovable" && ["login", "upload", "permission"].includes(confirmation.category);
  return (
    <Dialog label={handoff ? "Take over this action" : "Allow this action"} onClose={() => void decide("decline")} initialFocusRef={decline} className="aux-dialog-surface http-auth-prompt">
      <form
        onSubmit={event => { event.preventDefault(); void decide(handoff ? "takeover" : "accept"); }}>
        <h3 id="action-confirm-title">{handoff ? "Take over this action" : "Allow this action"}</h3>
        <p>{confirmation.instruction}</p>
        {site && <p {...staticHintProps}>{site}</p>}
        {error && <p role="alert">{error}</p>}
        <div className="sheet-acts">
          <button ref={decline} {...auxNativeButtonTypeProps} className="btn" disabled={busy} data-command-id="deny-agent-action" onClick={() => void decide("decline")}>{handoff ? "Close" : "Deny"}</button>
          {sitePermissions && preapprovable && <button {...auxNativeButtonTypeProps} className="btn" disabled={busy} data-command-id="allow-agent-action-for-origin" onClick={() => void decide("acceptForOrigin")}>Always allow on {site.replace(/\/$/, "")}</button>}
          <button type="submit" className="btn primary" disabled={busy || (handoff && !confirmation.pageId)}
            data-command-id={handoff ? "take-over-agent-action" : "approve-agent-action"} aria-label={handoff ? "Take over" : "Allow once"}>{handoff ? "Take over" : "Allow once"}</button>
        </div>
      </form>
    </Dialog>
  );
}
