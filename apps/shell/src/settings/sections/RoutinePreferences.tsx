import { useEffect, useState } from "react";
import { isTextModelCandidate } from "@aux/contracts/model-registry";
import { call } from "../../store";
import { Switch } from "../../ui";

export type RoutinePreferences = { modelId?: string; notifications?: boolean };

/** Run choices are saved with the routine, independently of its task's authority. */
export function RoutinePreferencesFields({
  value,
  disabled,
  onChange,
}: {
  value: RoutinePreferences;
  disabled: boolean;
  onChange(patch: { modelId?: string | null; notifications?: boolean }): void;
}) {
  const [models, setModels] = useState<{ id: string; name?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    setLoading(true);
    setFailed(false);
    void call("models.list", {})
      .then((result) => {
        if (live) setModels(result.models.filter(isTextModelCandidate));
      })
      .catch(() => {
        if (live) setFailed(true);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [attempt]);
  return (
    <div className="routine-preferences">
      <label>
        Model
        <select
          aria-label="Routine model"
          value={value.modelId ?? ""}
          disabled={disabled || loading}
          onChange={(event) => onChange({ modelId: event.target.value || null })}
        >
          <option value="">{loading ? "Loading models…" : "Default model"}</option>
          {value.modelId && !models.some((model) => model.id === value.modelId) && (
            <option value={value.modelId}>{value.modelId} · unavailable</option>
          )}
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name ?? model.id}
            </option>
          ))}
        </select>
      </label>
      <label title="Completion alerts for this routine. Requests needing your attention remain visible.">
        Notifications
        <Switch
          aria-label="Routine completion notifications"
          disabled={disabled}
          checked={value.notifications !== false}
          onChange={(event) => onChange({ notifications: event.target.checked })}
        />
      </label>
      {failed && (
        <p role="alert">
          Models could not be loaded.{" "}
          <button type="button" disabled={disabled} onClick={() => setAttempt((current) => current + 1)}>
            Retry
          </button>
        </p>
      )}
    </div>
  );
}

export function RoutinePreferencesEditor(props: Parameters<typeof RoutinePreferencesFields>[0]) {
  const [open, setOpen] = useState(false);
  return (
    <details className="routine-run-preferences" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>Run preferences</summary>
      {open && <RoutinePreferencesFields {...props} />}
    </details>
  );
}
