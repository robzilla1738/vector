import type { ModelCapability } from "@aux/contracts";
import { useEffect, useState } from "react";
import { call, useStore } from "../store";
import { bridge } from "../bridge";
import { Switch } from "../ui";
import { errorMessage } from "../error-message";
import "./RunOptions.css";
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
/** A draft choice is not a route default or authority to change an existing chat's mode. */
export function RunOptions({
  draftKey,
  workspaceId,
  privateTask,
  privateTaskLocked,
  disabled,
}: {
  draftKey: string;
  workspaceId?: string;
  privateTask: boolean;
  privateTaskLocked: boolean;
  disabled: boolean;
}) {
  const [projectCatalog, setProjectCatalog] = useState<{
    workspaceId?: string;
    items: { path: string; label: string }[];
  }>({ items: [] });
  const projects = projectCatalog.workspaceId === workspaceId ? projectCatalog.items : [];
  const [packages, setPackages] = useState<{ name: string; version: string; profiles: { name: string }[] }[]>(
    [],
  );
  const [packageDefaults, setPackageDefaults] = useState<string[]>(["aux-core"]);
  useEffect(() => {
    let live = true;
    void Promise.all([
      workspaceId ? call("workspaces.folders.list", { workspaceId }) : Promise.resolve([]),
      call("packages.list"),
    ])
      .then(([folders, library]) => {
        if (!live) return;
        setProjectCatalog({
          workspaceId,
          items: folders
            .filter((folder) => folder.access === "readWrite" && !folder.archivedAt && !folder.agentsChanged)
            .map((folder) => ({ path: folder.path, label: folder.path.split("/").pop() ?? folder.path })),
        });
        setPackages(library.packages);
        setPackageDefaults(library.defaults);
      })
      .catch((reason) => {
        if (live) {
          setProjectCatalog({ workspaceId, items: [] });
          setPackages([]);
          setError(errorMessage(reason));
        }
      });
    return () => {
      live = false;
    };
  }, [workspaceId]);
  const localOnly = useStore((state) => state.settings.localModelsOnly === true);
  const choice = useStore((state) => state.composerPreferences[draftKey] ?? DEFAULT);
  const [requested, setRequested] = useState(false),
    [catalog, setCatalog] = useState<{ generation: string; models: ModelCapability[] } | null>(null),
    [error, setError] = useState("");
  const catalogGeneration = useStore((state) => JSON.stringify(state.settings));
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
    <div className="composer-run-options">
      {localOnly && (
        <span className="chip" aria-label="Local models only">
          Local only
        </span>
      )}
      <label>
        Model
        <select
          aria-label="Composer model"
          disabled={disabled}
          value={choice.modelId ?? ""}
          onFocus={() => setRequested(true)}
          onChange={(event) => {
            const modelId = event.target.value || undefined;
            const model = chatModels.find((item) => item.id === modelId);
            if (modelId && !model) return;
            patch({ modelId, ...(model?.reasoning === "none" ? { reasoning: undefined } : {}) });
          }}
        >
          <option value="">Automatic</option>
          {choice.modelId && !chatModels.some((model) => model.id === choice.modelId) && (
            <option value={choice.modelId} disabled={unsupportedSelection}>
              {selected?.name ?? choice.modelId}
              {unsupportedSelection ? " · not supported for chat" : ""}
            </option>
          )}
          {chatModels.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name ?? model.id}
            </option>
          ))}
        </select>
      </label>
      {unsupportedSelection && (
        <span role="alert">
          This selected model is not supported for chat. Choose Automatic or a conversational model.
        </span>
      )}
      <label>
        Execution
        <select
          aria-label="Run execution"
          disabled={disabled}
          value={choice.executionTarget ?? "local"}
          onChange={(event) => {
            if (event.target.value === "local" || event.target.value === "cloud")
              patch({ executionTarget: event.target.value });
          }}
        >
          <option value="local">On this Mac</option>
          <option value="cloud">Run in cloud</option>
        </select>
      </label>
      {choice.executionTarget === "cloud" && (
        <span>
          Uses your reviewed Vercel account and resource rates. Cloud compute and outbound traffic incur
          separate charges; configure them in Settings → Projects. Local files and credentials are not
          uploaded.
        </span>
      )}
      <label>
        Agent
        <select
          aria-label="Agent profile"
          value={choice.profile ?? "default"}
          disabled={disabled || choice.executionTarget === "cloud"}
          onChange={(event) => {
            const profile = event.target.value;
            const owner = packages.find((item) => item.profiles.some((item) => item.name === profile));
            patch({
              profile,
              ...(owner
                ? { packageNames: [...new Set([...(choice.packageNames ?? packageDefaults), owner.name])] }
                : {}),
            });
          }}
        >
          <option value="default">Aux</option>
          <option value="coder">Coder</option>
          <option value="explorer">Explorer</option>
          <option value="read_only">Read only</option>
          {packages
            .flatMap((item) => item.profiles)
            .map((profile) => (
              <option key={profile.name} value={profile.name}>
                {profile.name}
              </option>
            ))}
        </select>
      </label>
      {projects.length > 0 && (
        <label>
          Project
          <select
            aria-label="Coding project"
            value={choice.projectRoot ?? (projects.length === 1 ? projects[0]!.path : "")}
            disabled={disabled || choice.executionTarget === "cloud"}
            onChange={(event) => patch({ projectRoot: event.target.value || undefined })}
          >
            <option value="">Choose project</option>
            {projects.map((project) => (
              <option key={project.path} value={project.path}>
                {project.label}
              </option>
            ))}
          </select>
        </label>
      )}
      {packages.length > 0 && (
        <fieldset disabled={disabled}>
          <legend>Aux Packages</legend>
          {packages.map((item) => (
            <label key={item.name}>
              <input
                type="checkbox"
                checked={(choice.packageNames ?? packageDefaults).includes(item.name)}
                onChange={(event) => {
                  const selected = new Set(choice.packageNames ?? packageDefaults);
                  if (event.target.checked) selected.add(item.name);
                  else selected.delete(item.name);
                  patch({ packageNames: [...selected] });
                }}
              />
              {item.name}
            </label>
          ))}
        </fieldset>
      )}
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
      {bridge.privateMode ? (
        <span
          className="chip"
          title="Chats stay in this private session and disappear when its last window closes."
        >
          Private session · {localOnly ? "local models" : "configured AI provider"}
        </span>
      ) : (
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
      )}
      {error && <span role="alert">Model catalog unavailable: {error}</span>}
    </div>
  );
}
