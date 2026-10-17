import { useState } from "react";
import { SettingsField } from "../primitives";

export function AgentBehaviorSettings({
  active,
  settings,
  onSave,
}: {
  active: boolean;
  settings: Record<string, unknown>;
  onSave(patch: Record<string, unknown>): Promise<boolean>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(patch: Record<string, unknown>) {
    if (!active || busy) return;
    setBusy(true);
    setError("");
    try {
      if (!(await onSave(patch))) setError("The preference was not saved. Try again.");
    } catch {
      setError("The preference was not saved. Try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <SettingsField
        compact
        label="Follow-up behavior"
        hint="Queue follow-ups while Aux runs or steer the current run."
      >
        <select
          aria-label="Follow-up behavior"
          disabled={!active || busy}
          value={settings.followUpBehavior === "steer" ? "steer" : "queue"}
          onChange={(event) => void save({ followUpBehavior: event.target.value })}
        >
          <option value="queue">Queue</option>
          <option value="steer">Steer</option>
        </select>
      </SettingsField>
      <SettingsField
        compact
        label="Ask Aux on tab switch"
        hint="When you switch tabs, use a separate chat for each tab or keep the current chat."
      >
        <select
          aria-label="Ask Aux on tab switch"
          disabled={!active || busy}
          value={settings.askTabSwitch === "keep-current" ? "keep-current" : "per-tab"}
          onChange={(event) => void save({ askTabSwitch: event.target.value })}
        >
          <option value="per-tab">New chat per tab</option>
          <option value="keep-current">Keep current chat</option>
        </select>
      </SettingsField>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
