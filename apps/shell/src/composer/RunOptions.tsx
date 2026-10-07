import type { ModelCapability } from "@aux/contracts";
import { useEffect, useState } from "react";
import { call, useStore } from "../store";
import { bridge } from "../bridge";
import { Switch } from "../ui";
import { errorMessage } from "../error-message";
import "./RunOptions.css";
const DEFAULT: { privateTask: boolean; executionTarget?: "local" | "cloud"; modelId?: string; reasoning?: "low" | "medium" | "high" } = {
  privateTask: false,
};
/** A draft choice is not a route default or authority to change an existing chat's mode. */
export function RunOptions({
  draftKey,
  privateTask,
  privateTaskLocked,
  disabled,
}: {
  draftKey: string;
  privateTask: boolean;
  privateTaskLocked: boolean;
  disabled: boolean;
}) {
  const localOnly = useStore((state) => state.settings.localModelsOnly === true);
  const choice = useStore((state) => state.composerPreferences[draftKey] ?? DEFAULT);
  const [requested, setRequested] = useState(false),
    [catalog, setCatalog] = useState<{ generation: string; models: ModelCapability[] } | null>(
      null,
    ),
    [error, setError] = useState("");
  const catalogGeneration = useStore((state) =>
    JSON.stringify(state.settings),
  );
  const windowId = bridge.windowId,
    kind = bridge.windowKind,
    privateMode = bridge.privateMode;
  const identity = JSON.stringify([catalogGeneration, windowId, kind, privateMode]);
  useEffect(() => {
    if (!requested || disabled) return;
    let live = true;
    const current = () =>
      live &&
      bridge.windowId === windowId &&
      bridge.windowKind === kind &&
      bridge.privateMode === privateMode &&
      JSON.stringify(useStore.getState().settings) === catalogGeneration;
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
  }, [requested, disabled, windowId, kind, privateMode, catalogGeneration, identity]);
  const catalogItems = catalog?.generation === identity ? catalog.models : [];
  const selected = catalogItems.find((model) => model.id === choice.modelId);
  function patch(value: Partial<typeof choice>) {
    if (disabled || bridge.windowId !== windowId || bridge.windowKind !== kind ||
        bridge.privateMode !== privateMode || JSON.stringify(useStore.getState().settings) !== catalogGeneration) return;
    useStore.getState().setComposerPreferences(draftKey, { ...choice, ...value });
  }
  return (
    <div className="composer-run-options">
      {localOnly && <span className="chip" aria-label="Local models only">Local only</span>}
      <label>
        Model
        <select
          aria-label="Composer model"
          disabled={disabled}
          value={choice.modelId ?? ""}
          onFocus={() => setRequested(true)}
          onChange={(event) => {
            const modelId = event.target.value || undefined;
            const model = catalogItems.find((item) => item.id === modelId);
            if (modelId && !model) return;
            patch({ modelId, ...(model?.reasoning === "none" ? { reasoning: undefined } : {}) });
          }}
        >
          <option value="">Automatic</option>
          {choice.modelId && !catalogItems.some((model) => model.id === choice.modelId) && (
            <option value={choice.modelId}>{choice.modelId}</option>
          )}
          {catalogItems.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name ?? model.id}
            </option>
          ))}
        </select>
      </label>
      <label>
        Execution
        <select aria-label="Run execution" disabled={disabled} value={choice.executionTarget??"local"}
          onChange={event=>{if(event.target.value==="local"||event.target.value==="cloud")patch({executionTarget:event.target.value});}}>
          <option value="local">On this Mac</option><option value="cloud">Run in cloud</option>
        </select>
      </label>
      {choice.executionTarget==="cloud"&&<span>Uses your reviewed Vercel account and resource rates. Cloud compute and outbound traffic incur separate charges; configure them in Settings → Projects. Local files and credentials are not uploaded.</span>}
      <label>
        Thinking
        <select
          aria-label="Thinking level"
          disabled={disabled || selected?.reasoning === "none"}
          value={choice.reasoning ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            if (value === "" || value === "low" || value === "medium" || value === "high")
              patch({ reasoning: value || undefined });
          }}
        >
          <option value="">Auto</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      <label
        title={
          privateTaskLocked
            ? "This chat's task mode is fixed."
            : "Use isolated signed-out tabs for this task."
        }
      >
        <Switch
          aria-label="Private task"
          checked={privateTask}
          disabled={disabled || privateTaskLocked}
          onChange={(event) => patch({ privateTask: event.target.checked })}
        />
        Private task
      </label>
      {error && <span role="alert">Model catalog unavailable: {error}</span>}
    </div>
  );
}
