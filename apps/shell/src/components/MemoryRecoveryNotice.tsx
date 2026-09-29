import { useState } from "react";
import { bridge } from "../bridge";

/** Displayed after a user action invalidates older Aux-managed backups. */
export function MemoryRecoveryNotice({ possible = false }: { possible?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [created, setCreated] = useState(false);
  if (created) return <output className="hint">Fresh local backup created for the current Memory state.</output>;
  return <div className="field">
    <p>{possible ? "If this change removed saved Memory, older Aux-managed backups can no longer restore." :
      "Older Aux-managed backups can no longer restore after this Memory removal."} Create a fresh local backup for the current state.</p>
    <p className="hint">Previously copied offline recovery packages and their phrases remain usable after Forget.
      For a current encrypted copy, open General → Protected recovery package and create a new package.</p>
    <button className="btn sm" disabled={busy} onClick={() => {
      setBusy(true); setMessage("");
      void bridge.exportRuntimeBackup().then(result => {
        if (result) setCreated(true);
        else setMessage("Backup cancelled; create one when ready.");
      }).catch(error => setMessage(error instanceof Error ? error.message : String(error)))
        .finally(() => setBusy(false));
    }}>Create fresh local backup…</button>
    {message && <output className="hint">{message}</output>}
  </div>;
}
