import { useEffect, useRef, useState } from "react";
import type { ProjectChanges, ProjectFile, ProjectFiles, WorkspaceFolder } from "@aux/contracts";
import { call } from "../../store";
import { errorMessage } from "../../error-message";
import { smallButtonProps } from "../../ui/button-props";
/** Project text stays in this local panel; opening a file never asks a model. */
export default function Project({ folder, close }: { folder: WorkspaceFolder; close: () => void }) {
  const [tab, setTab] = useState<"files" | "changes">("files");
  const [path, setPath] = useState("");
  const [files, setFiles] = useState<ProjectFiles>();
  const [file, setFile] = useState<ProjectFile>();
  const [changes, setChanges] = useState<ProjectChanges>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const generation = useRef(0);
  const input = { workspaceId: folder.workspaceId, folderId: folder.folderId };
  async function load(selected: typeof tab, directory = path) {
    const request = ++generation.current;
    setBusy(true);
    setError("");
    try {
      if (selected === "files") {
        const result = await call("projects.files", {
          ...input,
          path: directory,
        });
        if (generation.current === request) {
          setFiles(result);
          setFile(undefined);
          setPath(directory);
        }
      } else if (selected === "changes") {
        const result = await call("projects.changes", input);
        if (generation.current === request) setChanges(result);
      }
    } catch (reason) {
      if (generation.current === request) setError(errorMessage(reason));
    } finally {
      if (generation.current === request) setBusy(false);
    }
  }
  useEffect(() => {
    void load("files", "");
    return () => {
      generation.current++;
    };
  }, [folder.workspaceId, folder.folderId]);
  async function read(selected: string) {
    const request = ++generation.current;
    setBusy(true);
    setError("");
    try {
      const result = await call("projects.file", { ...input, path: selected });
      if (generation.current === request) setFile(result);
    } catch (reason) {
      if (generation.current === request) setError(errorMessage(reason));
    } finally {
      if (generation.current === request) setBusy(false);
    }
  }
  return (
    <section aria-label="Project workspace">
      <div className="row">
        <strong>{folder.path}</strong>
        <button {...smallButtonProps} onClick={close}>
          Close Project
        </button>
      </div>
      <div role="tablist" aria-label="Project views">
        {(["files", "changes"] as const).map((view) => (
          <button
            {...smallButtonProps}
            key={view}
            role="tab"
            aria-selected={tab === view}
            onClick={() => {
              generation.current++;
              setTab(view);
              setError("");
              setBusy(false);
              if (view === "files" || view === "changes") void load(view);
            }}
          >
            {view === "files" ? "Files" : "Changes"}
          </button>
        ))}
      </div>
      {error && <p role="alert">{error}</p>}
      {busy && <p role="status">Loading Project…</p>}
      {tab === "files" && (
        <div>
          <div className="row">
            <code>{path || "/"}</code>
            {path && (
              <button
                {...smallButtonProps}
                disabled={busy}
                onClick={() => void load("files", path.split("/").slice(0, -1).join("/"))}
              >
                Up
              </button>
            )}
            <button {...smallButtonProps} disabled={busy} onClick={() => void load("files")}>
              Refresh files
            </button>
          </div>
          <ul>
            {files?.entries.map((entry) => (
              <li key={entry.path}>
                <button
                  {...smallButtonProps}
                  disabled={busy || !["file", "directory"].includes(entry.type)}
                  onClick={() =>
                    void (entry.type === "directory" ? load("files", entry.path) : read(entry.path))
                  }
                >
                  {entry.name}
                  {entry.type === "directory" ? "/" : ""}
                </button>
                {entry.type === "symlink" && <span> · Symbolic link</span>}
              </li>
            ))}
          </ul>
          {files && !files.entries.length && <p>This folder is empty.</p>}
          {files?.truncated && <p>The first 1,000 entries are shown.</p>}
          {file && (
            <div>
              <strong>{file.path}</strong>
              <pre>{file.text}</pre>
              {file.truncated && <p>File preview stops after 1 MB.</p>}
            </div>
          )}
        </div>
      )}
      {tab === "changes" && (
        <div>
          <button {...smallButtonProps} disabled={busy} onClick={() => void load("changes")}>
            Refresh changes
          </button>
          {changes && (
            <>
              <pre>{changes.status || "Working tree is clean."}</pre>
              <pre>{changes.diff}</pre>
              {changes.truncated && <p>The diff exceeds the preview limit.</p>}
            </>
          )}
        </div>
      )}
    </section>
  );
}
