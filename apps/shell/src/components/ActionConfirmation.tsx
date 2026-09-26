import { useEffect, useRef, useState } from "react";
import { isScrimOverlay } from "../chrome";
import { call, useStore } from "../store";
import { bridge } from "../bridge";

/** The person confirms a page action. Allow decides the approval once. */
export function ActionConfirmation() {
  const confirmation = useStore(s => s.confirmation);
  return confirmation ? <Confirm key={confirmation.approvalId} confirmation={confirmation} /> : null;
}

function Confirm({ confirmation }: { confirmation: NonNullable<ReturnType<typeof useStore.getState>["confirmation"]> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const allow = useRef<HTMLButtonElement>(null);
  const deciding = useRef(false);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const body = document.querySelector<HTMLElement>(".app-body");
    const wasInert = body?.inert;
    if (body) body.inert = true;
    let live = true;
    void bridge.overlay(true).then(() => { if (live) return bridge.focusShell(); }).then(() => {
      if (live) allow.current?.focus();
    }).catch(() => {});
    return () => {
      live = false;
      if (body) body.inert = !!wasInert;
      void bridge.overlay(isScrimOverlay(useStore.getState().overlay));
      if (previous?.isConnected) previous.focus();
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
    <div className="scrim-soft">
      <form className="sheet pop-in http-auth-prompt" role="dialog" aria-modal="true" aria-labelledby="action-confirm-title"
        onSubmit={event => { event.preventDefault(); void decide(true); }}
        onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); void decide(false); } }}>
        <h3 id="action-confirm-title">Allow this action</h3>
        <p>{confirmation.instruction}</p>
        {site && <p className="hint">{site}</p>}
        {error && <p role="alert">{error}</p>}
        <div className="sheet-acts">
          <button type="button" className="btn" disabled={busy} onClick={() => void decide(false)}>Don't allow</button>
          <button ref={allow} type="submit" className="btn primary" disabled={busy} aria-label="Allow" onClick={() => void decide(true)}>Allow</button>
        </div>
      </form>
    </div>
  );
}
