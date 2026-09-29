import { useEffect, useState } from "react";
import { bridge } from "../bridge";
import { call, useStore } from "../store";

/** Displayed after a user action invalidates older Aux-managed backups. */
export function MemoryRecoveryNotice({ possible = false }: { possible?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [issued, setIssued] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    const refresh = () => void call("installation.restoreStatus", {}).then(status => {
      if (live) setIssued(status.managedRecovery.freshBackupIssued);
    }).catch(() => { if (live) setIssued(false); });
    refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => { live = false; window.clearInterval(timer); };
  }, []);
  if (issued) return <div className="field">
    <output className="hint">Fresh Aux-managed task-data backup issued after Forget. Protected Space and page memory need a new encrypted offline package.</output>
    <p className="hint">Previously copied offline recovery packages and their original phrases remain usable after Forget. Copies and phrases outside Aux cannot be revoked.</p>
    <button className="btn sm ghost" onClick={() => { useStore.setState({ settingsCategory: "General" }); useStore.getState().setOverlay("settings"); }}>
      Create a fresh encrypted offline package…
    </button>
  </div>;
  return <div className="field">
    <p>{possible ? "If this change removed saved Memory, older Aux-managed backups can no longer restore." :
      "Older Aux-managed backups can no longer restore after this Memory removal."} A fresh backup has not been confirmed; create one for the current state.</p>
    <p className="hint">Previously copied offline recovery packages and their original phrases remain usable after Forget.
      Copies and phrases outside Aux cannot be revoked.</p>
    <button className="btn sm" disabled={busy} onClick={() => {
      setBusy(true); setMessage("");
      void bridge.exportRuntimeBackup().then(result => {
        if (result) void call("installation.restoreStatus", {}).then(status =>
          setIssued(status.managedRecovery.freshBackupIssued));
        else setMessage("Backup cancelled; create one when ready.");
      }).catch(error => setMessage(error instanceof Error ? error.message : String(error)))
        .finally(() => setBusy(false));
    }}>Create fresh local backup…</button>
    <button className="btn sm ghost" onClick={() => { useStore.setState({ settingsCategory: "General" }); useStore.getState().setOverlay("settings"); }}>
      Create a fresh encrypted offline package…
    </button>
    {message && <output className="hint">{message}</output>}
  </div>;
}
