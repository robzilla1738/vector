import { useEffect, useRef, useState } from "react";
import { isScrimOverlay } from "../chrome";
import { call, useStore } from "../store";
import { bridge } from "../bridge";
import { Dialog } from "../ui";

/** The person confirms a page action. Allow decides the approval once. */
export function ActionConfirmation() {
  const confirmation = useStore(s => s.confirmation);
  return confirmation ? <Confirm key={confirmation.approvalId} confirmation={confirmation} /> : null;
}

function Confirm({ confirmation }: { confirmation: NonNullable<ReturnType<typeof useStore.getState>["confirmation"]> }) {
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
  async function decide(accept: boolean) {
    if (deciding.current) return;
    deciding.current = true;
    setBusy(true);
    setError("");
    try {
      await call("safety.approvals.decide", {
        decision: accept
          ? { decision: "accept", approvalId: confirmation.approvalId }
          : { decision: "decline", approvalId: confirmation.approvalId },
        expectedTurnId: confirmation.turnId,
      });
      if (useStore.getState().confirmation?.approvalId === confirmation.approvalId) {
        useStore.setState({ confirmation: null });
      }
    } catch (reason) {
      deciding.current = false;
      setError(reason instanceof Error ? reason.message : String(reason));
      setBusy(false);
    }
  }
  const site = confirmation.origin.replace(/^https?:\/\//, "");
  return (
    <Dialog label="Allow this action" onClose={() => void decide(false)} initialFocusRef={decline} className="aux-dialog-surface http-auth-prompt">
      <form
        onSubmit={event => { event.preventDefault(); void decide(true); }}
        onKeyDown={event => event.stopPropagation()}>
        <h3 id="action-confirm-title">Allow this action</h3>
        <p>{confirmation.instruction}</p>
        {site && <p className="hint">{site}</p>}
        {error && <p role="alert">{error}</p>}
        <div className="sheet-acts">
          <button ref={decline} type="button" className="btn" disabled={busy} onClick={() => void decide(false)}>Don't allow</button>
          <button type="submit" className="btn primary" disabled={busy} aria-label="Allow" onClick={() => void decide(true)}>Allow</button>
        </div>
      </form>
    </Dialog>
  );
}
