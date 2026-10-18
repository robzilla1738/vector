import type { ModelCapability } from "@aux/contracts";
import { useEffect, useState } from "react";
import { call, useStore } from "../store";
import { bridge } from "../bridge";
import { errorMessage } from "../error-message";
import { runCommand } from "../commands";
import { ComposerModelPicker } from "./ComposerModelPicker";
import { ComposerChevron } from "./ComposerChevron";
import "./ComposerModelControls.css";

const DEFAULT: {
  privateTask: boolean;
  executionTarget?: "local" | "cloud";
  profile?: string;
  projectRoot?: string;
  packageNames?: string[];
  modelId?: string;
  reasoning?: "low" | "medium" | "high";
} = {
  privateTask: false,
};
/** Direct model and thinking controls retain catalog and native-window authority checks. */
export function ComposerModelControls({ draftKey, disabled }: { draftKey: string; disabled: boolean }) {
  const localOnly = useStore((state) => state.settings.localModelsOnly === true);
  const choice = useStore((state) => state.composerPreferences[draftKey] ?? DEFAULT);
  const [requested, setRequested] = useState(false),
    [catalog, setCatalog] = useState<{ generation: string; models: ModelCapability[] } | null>(null),
    [catalogFailure, setCatalogFailure] = useState<{ generation: string; message: string } | null>(null),
    [catalogAttempt, setCatalogAttempt] = useState(0);
  const catalogGeneration = useStore((state) => JSON.stringify(state.settings));
  const windowId = bridge.windowId,
    kind = bridge.windowKind,
    privateMode = bridge.privateMode;
  const identity = JSON.stringify([catalogGeneration, windowId, kind, privateMode]);
  useEffect(() => {
    if (!requested || disabled) return;
    let live = true;
    setCatalogFailure(null);
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
          setCatalogFailure(null);
        }
      })
      .catch((reason) => {
        if (current()) setCatalogFailure({ generation: identity, message: errorMessage(reason) });
      });
    return () => {
      live = false;
    };
  }, [requested, disabled, windowId, kind, privateMode, catalogGeneration, identity, catalogAttempt]);
  const catalogItems = catalog?.generation === identity ? catalog.models : [];
  const catalogError = catalogFailure?.generation === identity ? catalogFailure.message : undefined;
  const selected = catalogItems.find((model) => model.id === choice.modelId);
  // Missing provider metadata does not blacklist a newly configured/local model.
  // Explicit non-streaming/non-text catalog entries are not conversational routes.
  const conversational = (model: ModelCapability) =>
    model.streaming !== false && (model.modalities === undefined || model.modalities.includes("text"));
  const chatModels = catalogItems.filter(conversational);
  const unsupportedSelection = !!selected && !conversational(selected);
  function patch(value: Partial<typeof choice>) {
    if (
      disabled ||
      bridge.windowId !== windowId ||
      bridge.windowKind !== kind ||
      bridge.privateMode !== privateMode ||
      JSON.stringify(useStore.getState().settings) !== catalogGeneration
    )
      return;
    useStore.getState().setComposerPreferences(draftKey, { ...choice, ...value });
  }
  return (
    <div className="composer-model-controls">
      {localOnly && (
        <span className="chip" aria-label="Local models only">
          Local only
        </span>
      )}
      <div className="composer-run-option">
        <ComposerModelPicker
          menuSize={kind === "quick-ask" ? "md" : "sm"}
          models={chatModels}
          modelId={choice.modelId}
          selectedModel={selected}
          unsupported={unsupportedSelection}
          disabled={disabled}
          loading={requested && catalog?.generation !== identity && !catalogError}
          error={catalogError}
          onSettings={() => {
            useStore.setState({ settingsCategory: "Models" });
            runCommand("settings");
          }}
          onRequest={() => setRequested(true)}
          onRetry={() => setCatalogAttempt((attempt) => attempt + 1)}
          onChange={(modelId) => {
            const model = chatModels.find((item) => item.id === modelId);
            if (modelId && !model) return;
            patch({ modelId, ...(model?.reasoning === "none" ? { reasoning: undefined } : {}) });
          }}
        />
      </div>
      {unsupportedSelection && (
        <span role="alert">
          This selected model is not supported for chat. Choose Automatic or a conversational model.
        </span>
      )}
      <label className="composer-control composer-thinking-control">
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
        <ComposerChevron />
      </label>
    </div>
  );
}
