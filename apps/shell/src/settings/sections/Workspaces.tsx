import { CloudExecution } from "./CloudExecution";
import { staticFieldProps } from "../../ui/class-props";
import { staticHintProps, staticRowProps } from "../../ui/class-props";
import { smallButtonProps } from "../../ui/button-props";
import { errorMessage } from "../../error-message";
import { lazy, Suspense, useEffect, useState } from "react";
const ProjectWorkspace = lazy(() => import("../../features/projects/Project"));
const ProjectTerminal = lazy(() => import("../../features/terminal/Terminal"));
import type {
  Workspace,
  WorkspaceFolder,
  WorkspaceFolderAccess,
  WorkspaceFolderReview,
} from "@aux/contracts";
import { call } from "../../store";
import { SettingsField, SettingsSection } from "../primitives";
import { staticGrowProps as auxClassGrowProps } from "../../ui/class-props";
import { nativeAlertRoleProps, nativeGroupRoleProps } from "../../ui/native-attribute-props";

export function WorkspacesSettings({ active }: { active: boolean }) {
  const [projectFolder, setProjectFolder] = useState<WorkspaceFolder | null>(null);
  const [terminalFolder, setTerminalFolder] = useState<WorkspaceFolder | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [folders, setFolders] = useState<WorkspaceFolder[]>([]);
  const [path, setPath] = useState("");
  const [access, setAccess] = useState<WorkspaceFolderAccess>("read");
  const [review, setReview] = useState<WorkspaceFolderReview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!active) return;
    let live = true;
    void call("workspaces.list", {})
      .then((items) => {
        if (!live) return;
        setWorkspaces(items);
        setWorkspaceId((current) =>
          items.some((item) => item.workspaceId === current) ? current : (items[0]?.workspaceId ?? ""),
        );
      })
      .catch((reason) => {
        if (live) setError(String(reason));
      });
    return () => {
      live = false;
    };
  }, [active]);

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
      <p {...staticHintProps}>
        Add project folders to a Space. Read access lets the agent inspect files and instructions; read and
        write access also lets it change them. Your agent mode controls network access.
      </p>
      {error && <p {...nativeAlertRoleProps}>{error}</p>}
      <SettingsField
        compact
        label="Space"
        hint="Project roots and repository instructions apply only to runs in this Space. Aux Packages are selected per run."
      >
        <select
          aria-label="Folder Space"
          value={workspaceId}
          onChange={(event) => {
            setWorkspaceId(event.target.value);
            setReview(null);
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
      <SettingsField
        label="Local folder"
        hint="Choose an existing folder. Review its canonical path and AGENTS.md before granting access."
      >
        <div {...staticRowProps}>
          <input
            aria-label="Local folder path"
            value={path}
            onChange={(event) => {
              setPath(event.target.value);
              setReview(null);
              setTerminalFolder(null);
              setProjectFolder(null);
            }}
            placeholder="/Users/you/Projects/example"
          />
          <select
            aria-label="Folder access"
            value={access}
            onChange={(event) => {
              setAccess(event.target.value as WorkspaceFolderAccess);
              setReview(null);
              setTerminalFolder(null);
              setProjectFolder(null);
            }}
          >
            <option value="read">Read only</option>
            <option value="readWrite">Read and write</option>
          </select>
          <button
            {...smallButtonProps}
            disabled={!workspaceId || !path.trim() || busy}
            onClick={() =>
              void act(async () => {
                setReview(
                  await call("workspaces.folders.inspect", { workspaceId, path: path.trim(), access }),
                );
              })
            }
          >
            Review folder
          </button>
        </div>
      </SettingsField>
      {review && (
        <div {...staticFieldProps} {...nativeGroupRoleProps} aria-label="Folder access review">
          <strong>Review folder access</strong>
          <p>
            Space: {workspaces.find((item) => item.workspaceId === review.workspaceId)?.name} ·{" "}
            {review.access === "read" ? "Read only" : "Read and write"}
          </p>
          <p>
            Canonical path: <code>{review.path}</code>
          </p>
          <p>AGENTS.md: {review.agentsPreview ? "present" : "none"}</p>
          {review.skillsPath && (
            <p>
              Skills: <code>{review.skillsPath}</code>
            </p>
          )}
          {review.agentsPreview && <pre>{review.agentsPreview}</pre>}
          <button
            {...smallButtonProps}
            disabled={busy}
            onClick={() =>
              void act(async () => {
                await call("workspaces.folders.add", {
                  workspaceId: review.workspaceId,
                  path: review.path,
                  access: review.access,
                  expectedDigest: review.reviewDigest,
                });
                setFolders(await call("workspaces.folders.list", { workspaceId: review.workspaceId }));
                setReview(null);
                setTerminalFolder(null);
                setProjectFolder(null);
                setPath("");
              })
            }
          >
            Grant reviewed folder access
          </button>
        </div>
      )}
      <SettingsField
        label="Projects"
        hint="Archiving immediately removes file and bash access. A changed folder or AGENTS.md pauses access until a fresh review."
      >
        {!folders.some((item) => !item.archivedAt) && (
          <p {...staticHintProps}>No active projects in this Space.</p>
        )}
        {folders
          .filter((item) => !item.archivedAt)
          .map((item) => (
            <div className="row" key={item.folderId}>
              <span {...auxClassGrowProps}>
                <code>{item.path}</code> · {item.access === "read" ? "Read only" : "Read and write"}
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
      </SettingsField>
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
      {active && <CloudExecution />}
    </SettingsSection>
  );
}
