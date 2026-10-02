import { useState } from "react";
import { DEFAULT_NIGHT_SHIFT, NightShiftSettingsSchema } from "@aux/contracts";
import { useStore } from "../../store";
import { executeCommand } from "../../commands";
export function NightSettings() {
  const saved = useStore(state => state.settings.nightShift);
  const [draft, setDraft] = useState(() => NightShiftSettingsSchema.parse(saved ?? DEFAULT_NIGHT_SHIFT));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function save() {
    if (busy) return;
    const parsed = NightShiftSettingsSchema.safeParse(draft);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Review these settings."); return; }
    setError(""); setBusy(true);
    try { await executeCommand("configure-night-shift", { payload: { nightShift: parsed.data } }); }
    catch (reason) { setError(`Night shift settings could not be saved. ${reason instanceof Error ? reason.message : "Try again."}`); }
    finally { setBusy(false); }
  }
  return <section className="field" aria-label="Night shift settings">
    <h3>Night shift</h3>
    <p className="hint">Aux works within this local time window while your Mac is awake. Only work you queue can run. Actions that need your approval wait for morning.</p>
    <label><input disabled={busy} type="checkbox" checked={draft.enabled} onChange={event => setDraft({ ...draft, enabled: event.target.checked })}/>Enable overnight work</label>
    <label>Start<input disabled={busy} type="time" value={draft.start} onChange={event => setDraft({ ...draft, start: event.target.value })}/></label>
    <label>End<input disabled={busy} type="time" value={draft.end} onChange={event => setDraft({ ...draft, end: event.target.value })}/></label>
    <label>Nightly limit ($)<input disabled={busy} type="number" min="0.01" step="0.01" value={draft.nightlyUsd} onChange={event => setDraft({ ...draft, nightlyUsd: event.target.valueAsNumber })}/></label>
    <label>Per-task limit ($)<input disabled={busy} type="number" min="0.01" step="0.01" value={draft.perTaskUsd} onChange={event => setDraft({ ...draft, perTaskUsd: event.target.valueAsNumber })}/></label>
    <label><input disabled={busy} type="checkbox" checked={draft.requireAC} onChange={event => setDraft({ ...draft, requireAC: event.target.checked })}/>Require AC power</label>
    <p className="hint">Allow Aux to continue in the background in Profile settings. Aux does not schedule a wake or change your Mac’s power settings.</p>
    <button className="btn sm" disabled={busy} onClick={() => void save()}>{busy ? "Saving…" : "Save night shift settings"}</button>
    {error && <p role="alert">{error}</p>}
  </section>;
}
