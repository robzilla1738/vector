import { staticHintProps } from "../../ui/class-props";
import { smallButtonProps } from "../../ui/button-props";
import { errorMessage } from "../../error-message";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
const ProjectWorkspace = lazy(() => import("../../features/projects/Project"));
const ProjectTerminal = lazy(() => import("../../features/terminal/Terminal"));
import type { Workspace, WorkspaceFolder } from "@aux/contracts";
import { call, useStore } from "../../store";
import { SettingsField, SettingsSection } from "../primitives";
import { staticGrowProps as auxClassGrowProps } from "../../ui/class-props";
import { nativeAlertRoleProps } from "../../ui/native-attribute-props";

import { CreateProject } from "./CreateProject";
import { ProjectIcon } from "./ProjectIdentity";
import { Plus } from "../../ui/icons";
import "./Workspaces.css";

export function WorkspacesSettings({ active }: { active: boolean }) {
  const preferredWorkspaceId = useStore(
    (state) => state.layout.spaces.find((space) => space.id === state.layout.activeSpaceId)?.workspaceId,
  );
  const [projectFolder, setProjectFolder] = useState<WorkspaceFolder | null>(null);
  const [terminalFolder, setTerminalFolder] = useState<WorkspaceFolder | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [folders, setFolders] = useState<WorkspaceFolder[]>([]);
  const [creating, setCreating] = useState(false);
  const createTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!active) setCreating(false);
  }, [active]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!active) return;
    let live = true;
    void call("workspaces.list", {})
      .then((items) => {
        if (!live) return;
        setWorkspaces(items);
        setWorkspaceId(
          (current) =>
            items.find((item) => item.workspaceId === preferredWorkspaceId)?.workspaceId ??
            (items.some((item) => item.workspaceId === current) ? current : (items[0]?.workspaceId ?? "")),
        );
      })
      .catch((reason) => {
        if (live) setError(String(reason));
      });
    return () => {
      live = false;
    };
  }, [active, preferredWorkspaceId]);

  useEffect(() => {
    if (!active || !workspaceId) return;
    let live = true;
    void call("workspaces.folders.list", { workspaceId })
      .then((items) => {
        if (live) setFolders(items);
      })
      .catch((reason) => {
        if (live) setError(String(reason));
      });
    return () => {
      live = false;
    };
  }, [active, workspaceId]);

  async function act(work: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await work();
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SettingsSection name="Projects" hidden={!active}>
      {error && <p {...nativeAlertRoleProps}>{error}</p>}
      {workspaces.length > 1 && (
        <SettingsField compact label="Space">
          <select
            aria-label="Folder Space"
            value={workspaceId}
            disabled={busy}
            onChange={(event) => {
              setWorkspaceId(event.target.value);
              setCreating(false);
              setTerminalFolder(null);
              setProjectFolder(null);
              setFolders([]);
            }}
          >
            {workspaces.map((item) => (
              <option key={item.workspaceId} value={item.workspaceId}>
                {item.name}
              </option>
            ))}
          </select>
        </SettingsField>
      )}
      <button
        ref={createTrigger}
        type="button"
        className="project-create-row"
        disabled={!workspaceId || busy}
        onClick={() => setCreating(true)}
      >
        <Plus />
        Create
      </button>
      {active && creating && workspaces.find((item) => item.workspaceId === workspaceId) && (
        <CreateProject
          key={workspaceId}
          workspace={workspaces.find((item) => item.workspaceId === workspaceId)!}
          returnFocus={createTrigger}
          onClose={() => setCreating(false)}
          onCreated={(folder) => {
            setFolders((items) => [...items, folder]);
            setCreating(false);
          }}
        />
      )}
      {folders.some((item) => !item.archivedAt) && (
        <div className="project-list">
          {folders
            .filter((item) => !item.archivedAt)
            .map((item) => (
              <div className="project-card" key={item.folderId}>
                <ProjectIcon {...item} />
                <span {...auxClassGrowProps}>
                  <strong>{item.name ?? item.path.split("/").filter(Boolean).at(-1)}</strong>
                  <span className="project-path">{item.path}</span>
                  <small>{item.access === "read" ? "Read only" : "Read and write"}</small>
                  {item.skillsPath && (
                    <span>
                      {" "}
                      · Skills: <code>{item.skillsPath}</code>
                    </span>
                  )}
                  {item.agentsChanged
                    ? " · Folder or AGENTS.md changed; access paused. Archive and review again."
                    : ""}
                </span>
                {!item.agentsChanged && (
                  <button {...smallButtonProps} disabled={busy} onClick={() => setProjectFolder(item)}>
                    Open Project
                  </button>
                )}
                {item.access === "readWrite" && !item.agentsChanged && (
                  <button {...smallButtonProps} disabled={busy} onClick={() => setTerminalFolder(item)}>
                    Open Terminal
                  </button>
                )}
                <button
                  {...smallButtonProps}
                  disabled={busy}
                  onClick={() =>
                    void act(async () => {
                      if (terminalFolder?.folderId === item.folderId) setTerminalFolder(null);
                      if (projectFolder?.folderId === item.folderId) setProjectFolder(null);
                      await call("workspaces.folders.archive", { workspaceId, folderId: item.folderId });
                      setFolders(await call("workspaces.folders.list", { workspaceId }));
                    })
                  }
                >
                  Archive folder access
                </button>
              </div>
            ))}
          <p {...staticHintProps}>
            Archiving removes file and terminal access. Changed folders or instructions need a fresh review.
          </p>
        </div>
      )}
      {active && projectFolder && (
        <Suspense fallback={<p>Loading Project…</p>}>
          <ProjectWorkspace
            key={projectFolder.folderId}
            folder={projectFolder}
            close={() => setProjectFolder(null)}
          />
        </Suspense>
      )}
      {active && terminalFolder && (
        <Suspense fallback={<p>Loading Terminal…</p>}>
          <ProjectTerminal
            key={terminalFolder.folderId}
            workspaceId={terminalFolder.workspaceId}
            folderId={terminalFolder.folderId}
            path={terminalFolder.path}
          />
        </Suspense>
      )}
    </SettingsSection>
  );
}
