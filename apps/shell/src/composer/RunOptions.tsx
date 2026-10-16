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
  const choice = useStore((state) => state.composerPreferences[draftKey] ?? DEFAULT);
  const [error, setError] = useState("");
  const catalogGeneration = useStore((state) => JSON.stringify(state.settings));
  const windowId = bridge.windowId,
    kind = bridge.windowKind,
    privateMode = bridge.privateMode;
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
      {!bridge.privateMode && (
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
      {error && <span role="alert">Run options unavailable: {error}</span>}
    </div>
  );
}
