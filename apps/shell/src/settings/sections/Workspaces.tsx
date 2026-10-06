import { staticFieldProps } from "../../ui/class-props";
import { staticHintProps, staticRowProps } from "../../ui/class-props";
import { smallButtonProps } from "../../ui/button-props";
import { errorMessage } from "../../error-message";
import { useEffect, useState } from "react";
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
    <SettingsSection name="Workspaces" title="Workspaces" hidden={!active}>
      <p {...staticHintProps}>
        Bind local folders to a Space. Read access lets the agent inspect files; read and write access also
        lets it change them. Network access stays off by default.
      </p>
      {error && <p {...nativeAlertRoleProps}>{error}</p>}
      <SettingsField
        label="Space"
        hint="Folder access and AGENTS.md context apply only to runs in this Space."
      >
        <select
          aria-label="Folder Space"
          value={workspaceId}
          onChange={(event) => {
            setWorkspaceId(event.target.value);
            setReview(null);
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
            }}
            placeholder="/Users/you/Projects/example"
          />
          <select
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
          <p>
            Review fingerprint: <code>{review.reviewDigest}</code>
          </p>
          <p>AGENTS.md: {review.agentsPreview ? "present" : "none"}</p>
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
                setPath("");
              })
            }
          >
            Grant reviewed folder access
          </button>
        </div>
      )}
      <SettingsField
        label="Bound folders"
        hint="Archiving immediately removes file and bash access. A changed folder or AGENTS.md pauses access until a fresh review."
      >
        {!folders.some((item) => !item.archivedAt) && (
          <p {...staticHintProps}>No active folders in this Space.</p>
        )}
        {folders
          .filter((item) => !item.archivedAt)
          .map((item) => (
            <div className="row" key={item.folderId}>
              <span {...auxClassGrowProps}>
                <code>{item.path}</code> · {item.access === "read" ? "Read only" : "Read and write"}
                {item.agentsChanged
                  ? " · Folder or AGENTS.md changed; access paused. Archive and review again."
                  : ""}
              </span>
              <button
                {...smallButtonProps}
                disabled={busy}
                onClick={() =>
                  void act(async () => {
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
    </SettingsSection>
  );
}
