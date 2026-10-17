import { useEffect, useState } from "react";
import { isTextModelCandidate } from "@aux/contracts/model-registry";
import { call } from "../../store";
import { Switch } from "../../ui";
import type { ModelCapability } from "@aux/contracts";
import { ComposerModelPicker } from "../../composer/ComposerModelPicker";

export type RoutinePreferences = {
  modelId?: string;
  notifications?: boolean;
  reasoning?: "low" | "medium" | "high";
};
export type RoutinePreferencePatch = {
  modelId?: string | null;
  notifications?: boolean;
  reasoning?: "low" | "medium" | "high" | null;
};

/** Run choices are saved with the routine, independently of its task's authority. */
export function RoutinePreferencesFields({
  value,
  disabled,
  onChange,
}: {
  value: RoutinePreferences;
  disabled: boolean;
  onChange(patch: RoutinePreferencePatch): void;
}) {
  const [models, setModels] = useState<ModelCapability[]>([]);
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
      <div className="routine-model-row">
        <span>Model</span>
        <div className="routine-model-controls">
          <ComposerModelPicker
            label="Routine model"
            models={models}
            modelId={value.modelId}
            selectedModel={models.find((model) => model.id === value.modelId)}
            unsupported={false}
            disabled={disabled}
            loading={loading}
            error={failed ? "Try loading the catalog again." : undefined}
            onRetry={() => setAttempt((current) => current + 1)}
            onChange={(modelId) =>
              onChange({
                modelId: modelId ?? null,
                ...(models.find((model) => model.id === modelId)?.reasoning === "none"
                  ? { reasoning: null }
                  : {}),
              })
            }
          />
          <select
            aria-label="Routine thinking level"
            value={value.reasoning ?? ""}
            disabled={disabled || models.find((model) => model.id === value.modelId)?.reasoning === "none"}
            onChange={(event) =>
              onChange({ reasoning: (event.target.value || null) as RoutinePreferencePatch["reasoning"] })
            }
          >
            <option value="">Auto</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
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
