import { useEffect, useState } from "react";
import type { ModelCapability } from "@aux/contracts";
import { call, useStore } from "../store";
import { bridge } from "../bridge";
import { errorMessage } from "../error-message";

export type ModelRunSelection = {
  modelId?: string;
  reasoning?: "low" | "medium" | "high";
};
/** A draft override does not change provider defaults or an active turn. */
export function ModelRunChoice({
  value,
  disabled,
  onChange,
}: {
  value: ModelRunSelection;
  disabled: boolean;
  onChange(value: ModelRunSelection): void;
}) {
  const [requested, setRequested] = useState(false);
  const [catalog, setCatalog] = useState<{
    generation: string;
    models: ModelCapability[];
  } | null>(null);
  const [error, setError] = useState("");
  const generation = useStore((state) => JSON.stringify(state.settings));
  const windowId = bridge.windowId,
    windowKind = bridge.windowKind,
    privateMode = bridge.privateMode;
  const identity = JSON.stringify([
    generation,
    windowId,
    windowKind,
    privateMode,
  ]);
  useEffect(() => {
    if (!requested || disabled) return;
    let live = true;
    const current = () =>
      live &&
      bridge.windowId === windowId &&
      bridge.windowKind === windowKind &&
      bridge.privateMode === privateMode &&
      JSON.stringify(useStore.getState().settings) === generation;
    void call("models.list")
      .then((result) => {
        if (current()) {
          setCatalog({ generation: identity, models: result.models });
          setError("");
        }
      })
      .catch((reason) => {
        if (current()) setError(errorMessage(reason));
      });
    return () => {
      live = false;
    };
  }, [
    requested,
    disabled,
    identity,
    generation,
    windowId,
    windowKind,
    privateMode,
  ]);
  const models = catalog?.generation === identity ? catalog.models : [];
  const selected = models.find((model) => model.id === value.modelId);
  const current = () =>
    !disabled &&
    bridge.windowId === windowId &&
    bridge.windowKind === windowKind &&
    bridge.privateMode === privateMode &&
    JSON.stringify(useStore.getState().settings) === generation;
  return (
    <div className="row">
      <label className="field">
        Model
        <select
          aria-label="Composer model"
          value={value.modelId ?? ""}
          disabled={disabled}
          onFocus={() => setRequested(true)}
          onChange={(event) => {
            if (!current()) return;
            const modelId = event.target.value || undefined;
            const model = models.find((item) => item.id === modelId);
            if (modelId && !model) return;
            onChange({
              ...value,
              modelId,
              ...(model?.reasoning === "none" ? { reasoning: undefined } : {}),
            });
          }}
        >
          <option value="">Automatic</option>
          {value.modelId && !selected && (
            <option value={value.modelId}>
              {value.modelId} (previous selection)
            </option>
          )}
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name ?? model.id}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Thinking
        <select
          aria-label="Thinking level"
          value={value.reasoning ?? ""}
          disabled={disabled || selected?.reasoning === "none"}
          onChange={(event) => {
            if (!current()) return;
            const reasoning = event.target.value;
            if (
              reasoning === "" ||
              reasoning === "low" ||
              reasoning === "medium" ||
              reasoning === "high"
            )
              onChange({ ...value, reasoning: reasoning || undefined });
          }}
        >
          <option value="">Auto</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      {error && <span role="alert">Model catalog unavailable: {error}</span>}
    </div>
  );
}
