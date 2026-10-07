import { useEffect, useState } from "react";
import type { Bookmark } from "@aux/contracts";
import { bridge } from "../bridge";
import { runCommand } from "../commands";
import { hintNavigation } from "../navigation-preload";
import { call, errToast, useStore } from "../store";
import { shellIconPlus, shellIconMore } from "../ui/icons";
import { FavIcon } from "./SiteTile";

type OpenLink = (link: Pick<Bookmark, "url" | "title">, event: React.MouseEvent) => void;

export function SidebarBookmarks({ onOpen }: { onOpen: OpenLink }) {
  const bookmarks = useStore((state) => state.bookmarks);
  const connected = useStore((state) => state.connected);
  const [folders, setFolders] = useState<string[][]>([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!connected) return;
    let live = true;
    let revision = 0;
    const refresh = () => {
      const current = ++revision;
      void call("bookmarks.folders.list", {})
        .then((paths) => {
          if (live && current === revision) setFolders(paths);
        })
        .catch((error) => {
          if (live && current === revision) errToast(error);
        });
    };
    const unsubscribe = bridge.onEvent((event) => {
      if (event.type === "bookmarks.changed") refresh();
    });
    refresh();
    return () => {
      live = false;
      unsubscribe();
    };
  }, [connected]);

  function tree(path: string[]): React.ReactNode {
    const matches = (candidate: string[]) => path.every((part, index) => candidate[index] === part);
    const children = [
      ...new Set(
        [...folders, ...bookmarks.map((item) => item.folderPath ?? [])]
          .filter((candidate) => candidate.length > path.length && matches(candidate))
          .map((candidate) => candidate[path.length]!),
      ),
    ];
    const items = bookmarks.filter(
      (item) => (item.folderPath ?? []).length === path.length && matches(item.folderPath ?? []),
    );
    return (
      <>
        {children.map((child) => (
          <details className="sb-bookmark-folder" key={child}>
            <summary>{child}</summary>
            <div>{tree([...path, child])}</div>
          </details>
        ))}
        {items.map((item) => (
          <button
            className="sb-link"
            key={item.nodeId ?? item.url}
            title={item.title || item.url}
            onPointerEnter={() => hintNavigation(item.url)}
            onFocus={() => hintNavigation(item.url)}
            onClick={(event) => onOpen(item, event)}
            onAuxClick={(event) => onOpen(item, event)}
          >
            <FavIcon url={item.url} />
            <span>{item.title || item.url}</span>
          </button>
        ))}
      </>
    );
  }
  return (
    <div className="sb-bookmarks">
      <div className="sb-bookmark-list">{tree([])}</div>
      {!bookmarks.length && !folders.length && (
        <div className="sb-bookmarks-empty">Right-click a tab to bookmark it</div>
      )}
      <div className="sb-bookmark-actions">
        {creating ? (
          <form
            className="sb-bookmark-create"
            onSubmit={(event) => {
              event.preventDefault();
              if (!name.trim() || busy) return;
              setBusy(true);
              void call("bookmarks.folders.create", { path: [name.trim()] })
                .then((paths) => {
                  setFolders(paths);
                  setName("");
                  setCreating(false);
                })
                .catch(errToast)
                .finally(() => setBusy(false));
            }}
          >
            <input
              aria-label="Bookmark folder name"
              placeholder="Folder name"
              value={name}
              maxLength={200}
              onChange={(event) => setName(event.target.value)}
              disabled={busy}
              autoFocus
            />
            <button type="submit" disabled={busy || !name.trim()}>
              Add
            </button>
            <button type="button" disabled={busy} onClick={() => setCreating(false)}>
              Cancel
            </button>
          </form>
        ) : (
          <button
            className="icon-btn"
            aria-label="New bookmark folder"
            title="New bookmark folder"
            disabled={!connected}
            onClick={() => setCreating(true)}
          >
            {shellIconPlus}
          </button>
        )}
        <button
          className="icon-btn"
          aria-label="Manage bookmarks"
          title="Manage bookmarks"
          data-command-id="command-bookmarks"
          onClick={() => runCommand("command-bookmarks")}
        >
          {shellIconMore}
        </button>
      </div>
    </div>
  );
}
