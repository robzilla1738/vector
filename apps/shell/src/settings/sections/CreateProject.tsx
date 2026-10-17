import { useEffect, useRef, useState, type RefObject } from "react";
import type {
  Workspace,
  WorkspaceFolder,
  WorkspaceFolderAccess,
  WorkspaceFolderPresentation,
  WorkspaceFolderReview,
} from "@aux/contracts";
import { call } from "../../store";
import { bridge } from "../../bridge";
import { featureAvailable } from "../../feature-availability";
import { errorMessage } from "../../error-message";
import { Dialog } from "../../ui/dialog";
import { FolderOpen } from "../../ui/icons";
import { ProjectIdentityPicker } from "./ProjectIdentity";

export function CreateProject({
  workspace,
  onCreated,
  onClose,
  returnFocus,
}: {
  workspace: Workspace;
  onCreated(folder: WorkspaceFolder): void;
  onClose(): void;
  returnFocus: RefObject<HTMLButtonElement | null>;
}) {
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [identity, setIdentity] = useState<WorkspaceFolderPresentation>({ icon: "folder", color: "neutral" });
  const [access, setAccess] = useState<WorkspaceFolderAccess>("read");
  const [review, setReview] = useState<WorkspaceFolderReview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const live = useRef(true),
    pending = useRef(false);
  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);
  async function act(work: () => Promise<void>) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      await work();
    } catch (reason) {
      if (live.current) {
        setError(errorMessage(reason));
        setReview(null);
      }
    } finally {
      pending.current = false;
      if (live.current) setBusy(false);
    }
  }
  const close = () => {
    if (!pending.current) onClose();
  };
  return (
    <Dialog
      label="Create Project"
      className="aux-dialog-surface project-create-dialog"
      onClose={close}
      returnFocus={returnFocus}
      initialFocusRef={input}
    >
      <header>
        <h3>Create Project</h3>
        <p>Group related tasks and working context.</p>
      </header>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim() || !path.trim()) return;
          void act(async () => {
            if (!review) {
              const next = await call("workspaces.folders.inspect", {
                workspaceId: workspace.workspaceId,
                path: path.trim(),
                access,
              });
              if (live.current) setReview(next);
              return;
            }
            const folder = await call("workspaces.folders.add", {
              workspaceId: review.workspaceId,
              path: review.path,
              access: review.access,
              expectedDigest: review.reviewDigest,
              name: name.trim(),
              ...identity,
            });
            if (live.current) onCreated(folder);
          });
        }}
      >
        <fieldset disabled={busy}>
          <label htmlFor="project-name">Name</label>
          <div className="project-name-row">
            <ProjectIdentityPicker value={identity} onChange={setIdentity} disabled={busy} />
            <input
              ref={input}
              id="project-name"
              value={name}
              maxLength={100}
              onChange={(event) => setName(event.target.value)}
              required
              autoComplete="off"
            />
          </div>
          <label htmlFor="project-directory">Working directory</label>
          <div className="project-directory" data-input-surface>
            <input
              id="project-directory"
              aria-label="Local folder path"
              value={path}
              onChange={(event) => {
                setPath(event.target.value);
                setReview(null);
              }}
              placeholder="Choose an existing folder"
              required
              autoComplete="off"
            />
            {featureAvailable("skills") && (
              <button
                type="button"
                className="icon-btn"
                aria-label="Choose working directory"
                onClick={() =>
                  void act(async () => {
                    const folder = await bridge.openPluginDirectory();
                    if (folder && live.current) {
                      setPath(folder);
                      setReview(null);
                    }
                  })
                }
              >
                <FolderOpen />
              </button>
            )}
          </div>
          <div className="project-access">
            <label htmlFor="project-access">Folder access</label>
            <select
              id="project-access"
              aria-label="Folder access"
              value={access}
              onChange={(event) => {
                setAccess(event.target.value as WorkspaceFolderAccess);
                setReview(null);
              }}
            >
              <option value="read">Read only</option>
              <option value="readWrite">Read and write</option>
            </select>
          </div>
          {review && (
            <section className="project-access-review" role="group" aria-label="Folder access review">
              <strong>Review folder access</strong>
              <p>
                {workspace.name} · {review.access === "read" ? "Read only" : "Read and write"}
              </p>
              <code>{review.path}</code>
              <p>AGENTS.md: {review.agentsPreview ? "present" : "none"}</p>
              {review.skillsPath && (
                <p>
                  Skills: <code>{review.skillsPath}</code>
                </p>
              )}
              {review.agentsPreview && <pre>{review.agentsPreview}</pre>}
              <p>Creating grants this Space the reviewed folder access.</p>
            </section>
          )}
        </fieldset>
        {error && <p role="alert">{error}</p>}
        <footer>
          <button type="button" className="btn" disabled={busy} onClick={close}>
            Cancel
          </button>
          <button className="btn primary" type="submit" disabled={busy || !name.trim() || !path.trim()}>
            {busy ? "Working…" : review ? "Create" : "Review folder"}
          </button>
        </footer>
      </form>
    </Dialog>
  );
}
