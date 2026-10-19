import { useEffect, useState } from "react";
import type { WorkspaceFolder } from "@aux/contracts";
import { bridge } from "../bridge";
import { call, useStore } from "../store";
import { runCommand } from "../commands";
import { pushSettingsPath } from "../settings/routes";
import { errorMessage } from "../error-message";
import { moveListFocus } from "../keyboard-list";
import { Popover } from "../ui/popover";
import { shellIconCheck, shellIconFolder } from "../ui/icons";
import { shellIconProject } from "../ui/icons/project";
import { ComposerChevron } from "./ComposerChevron";
import "./ComposerProjectControl.css";

const folderName = (path: string) => path.split("/").filter(Boolean).at(-1) ?? path;

/** Selects existing reviewed access; opening this control never grants access or starts a run. */
export function ComposerProjectControl({
  draftKey,
  workspaceId,
  disabled,
}: {
  draftKey: string;
  workspaceId?: string;
  disabled: boolean;
}) {
  const choice = useStore((state) => state.composerPreferences[draftKey]);
  if (bridge.privateMode) return null;
  return (
    <Popover
      key={JSON.stringify([draftKey, workspaceId, bridge.windowId, bridge.windowKind])}
      label="Composer project"
      title={choice?.projectRoot ? `Project: ${folderName(choice.projectRoot)}` : "Project: Automatic"}
      className="composer-control composer-project-trigger"
      disabled={disabled || !workspaceId || choice?.executionTarget === "cloud"}
      trigger={
        <>
          {choice?.projectRoot ? shellIconFolder : shellIconProject}
          <span className="composer-project-label">
            {choice?.projectRoot ? folderName(choice.projectRoot) : "Project"}
          </span>
          <ComposerChevron />
        </>
      }
    >
      {(close) =>
        workspaceId && <ProjectChoices draftKey={draftKey} workspaceId={workspaceId} close={close} />
      }
    </Popover>
  );
}

function ProjectChoices({
  draftKey,
  workspaceId,
  close,
}: {
  draftKey: string;
  workspaceId: string;
  close(): void;
}) {
  const [folders, setFolders] = useState<WorkspaceFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const selected = useStore((state) => state.composerPreferences[draftKey]?.projectRoot);
  const windowId = bridge.windowId,
    kind = bridge.windowKind;
  const current = () => !bridge.privateMode && bridge.windowKind === kind && bridge.windowId === windowId;
  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");
    setFolders([]);
    void call("workspaces.folders.list", { workspaceId })
      .then((items) => {
        if (live && current())
          setFolders(
            items.filter((item) => item.access === "readWrite" && !item.archivedAt && !item.agentsChanged),
          );
      })
      .catch((reason) => {
        if (live && current()) setError(errorMessage(reason));
      })
      .finally(() => {
        if (live && current()) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [workspaceId, windowId, kind, attempt]);
  const choose = (projectRoot?: string) => {
    const state = useStore.getState();
    if (!current() || state.composerPreferences[draftKey]?.executionTarget === "cloud") return;
    if (projectRoot && !folders.some((item) => item.path === projectRoot)) return;
    state.setComposerPreferences(draftKey, {
      ...(state.composerPreferences[draftKey] ?? { privateTask: false }),
      projectRoot,
    });
    close();
  };
  return (
    <div
      className="composer-project-menu"
      onKeyDown={(event) => moveListFocus(event, "button:not(:disabled)")}
    >
      <header>Projects</header>
      <button type="button" aria-pressed={!selected} onClick={() => choose()}>
        <span>Automatic</span>
        {!selected && shellIconCheck}
      </button>
      <p>Use the only reviewed project in this Space, when available.</p>
      {loading && <output>Loading projects…</output>}
      {error && (
        <div role="alert">
          Projects couldn’t load. {error}
          <button type="button" onClick={() => setAttempt((value) => value + 1)}>
            Retry
          </button>
        </div>
      )}
      {!loading && !error && !folders.length && <p>No reviewed read/write projects in this Space.</p>}
      {!loading && selected && !folders.some((item) => item.path === selected) && (
        <p>The selected project is unavailable. Review its access or choose another.</p>
      )}
      {folders.map((folder) => (
        <button
          type="button"
          key={folder.folderId}
          title={folder.path}
          aria-pressed={selected === folder.path}
          onClick={() => choose(folder.path)}
        >
          {shellIconFolder}
          <span>{folder.name ?? folderName(folder.path)}</span>
          {selected === folder.path && shellIconCheck}
        </button>
      ))}
      <hr />
      <button
        type="button"
        onClick={() => {
          if (!current()) return;
          close();
          pushSettingsPath("Projects");
          useStore.setState({ settingsCategory: "Projects" });
          runCommand("settings");
        }}
      >
        {shellIconFolder}
        <span>Use an existing folder</span>
      </button>
    </div>
  );
}
