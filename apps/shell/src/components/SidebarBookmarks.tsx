import { useEffect, useMemo, useRef, useState } from "react";
import type {
  BookmarkFolder,
  BookmarkFolderChange,
  BookmarkFolderSnapshot,
  BookmarkPlacement,
} from "@aux/contracts/bookmark-folder-methods";
import {
  bookmarkSource,
  removeBookmark,
  restoreBookmark,
  editBookmark,
  openBookmark,
  changeBookmarkFolder,
  folderDestination,
  folderDrop,
  folderSource,
  readBookmarkFolders,
  placeBookmark,
  type FolderDropPosition,
} from "../bookmark-folders";
import { backgroundLink } from "../browser-links";
import { orderedPages } from "../store/pages";
import { runCommand } from "../commands";
import { hintNavigation } from "../navigation-preload";
import { call, errToast, toast, useStore } from "../store";
import { Dialog, Menu } from "../ui";
import {
  shellIconPlus,
  shellIconMore,
  shellIconFolderClosed,
  shellIconFolder,
  shellIconDown,
} from "../ui/icons";
import { FavIcon } from "./SiteTile";

type SavedBookmark = ReturnType<typeof useStore.getState>["bookmarks"][number];
type Target = { item: SavedBookmark } | { folder: BookmarkFolder };
type Editor =
  | { mode: "create"; folder: BookmarkFolder; name: string }
  | { mode: "rename"; folder: BookmarkFolder; name: string }
  | { mode: "move-folder"; folder: BookmarkFolder; destinationId: string }
  | { mode: "move-bookmark"; source: BookmarkPlacement["source"]; destinationId: string }
  | { mode: "edit"; item: SavedBookmark; title: string; url: string };

export function SidebarBookmarks() {
  const bookmarks = useStore((state) => state.bookmarks);
  const [snapshot, setSnapshot] = useState<BookmarkFolderSnapshot | null>(null);
  const folders = snapshot?.folders ?? [];
  const rootFolder = folders.find((folder) => folder.nodeId === snapshot?.rootId);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [dropTarget, setDropTarget] = useState<{ nodeId: string; position: FolderDropPosition } | null>(null);
  const nodes = useMemo(() => {
    const indexed = new Map<string, { children: BookmarkFolder[]; items: SavedBookmark[] }>();
    const rootId = snapshot?.rootId ?? "";
    indexed.set(rootId, { children: [], items: [] });
    if (!snapshot) {
      indexed.get(rootId)!.items = bookmarks;
      return indexed;
    }
    const parentByItem = new Map<string, string>();
    for (const folder of snapshot.folders) {
      indexed.set(folder.nodeId, { children: [], items: [] });
      for (const child of folder.childIds) parentByItem.set(child, folder.nodeId);
    }
    for (const folder of snapshot.folders) {
      if (folder.nodeId === rootId) continue;
      indexed.get(folder.parentId ?? rootId)?.children.push(folder);
    }
    for (const item of bookmarks) {
      const parent = parentByItem.get(item.nodeId ?? "") ?? rootId;
      indexed.get(parent)!.items.push(item);
    }
    return indexed;
  }, [snapshot, bookmarks]);
  const [menu, setMenu] = useState<{ target: Target; x: number; y: number } | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const trigger = useRef<HTMLElement | null>(null);
  const dragged = useRef<{ source: BookmarkPlacement["source"] } | { folder: BookmarkFolder } | null>(null);
  const folderRequest = useRef(0);
  const pending = useRef(false);
  useEffect(() => {
    let live = true;
    const request = ++folderRequest.current;
    void readBookmarkFolders()
      .then((value) => {
        if (live && request === folderRequest.current) setSnapshot(value);
      })
      .catch((reason) => {
        if (live && request === folderRequest.current) errToast(reason);
      });
    return () => {
      live = false;
    };
  }, [bookmarks]);

  async function refresh() {
    useStore.setState({ bookmarks: await call("bookmarks.list", {}) });
  }

  async function changeFolder(operation: BookmarkFolderChange, label: string) {
    const request = ++folderRequest.current;
    const result = await changeBookmarkFolder(operation);
    if (request === folderRequest.current) setSnapshot(result.snapshot);
    if (result.undo) {
      const inverse = result.undo;
      undo(label, async () => {
        const request = ++folderRequest.current;
        const restored = await changeBookmarkFolder(inverse);
        if (request === folderRequest.current) setSnapshot(restored.snapshot);
        await refresh();
      });
    }
    await refresh();
  }

  function action(work: () => Promise<unknown>) {
    setMenu(null);
    void work().catch(errToast);
  }
  function undo(label: string, work: () => Promise<unknown>) {
    toast(label, "info", {
      label: "Undo",
      run: () => {
        void work().catch(errToast);
      },
    });
  }
  function edit(next: Editor) {
    setMenu(null);
    setError("");
    setEditor(next);
  }
  function context(event: React.MouseEvent<HTMLElement>, target: Target) {
    event.preventDefault();
    event.stopPropagation();
    trigger.current = event.currentTarget;
    setMenu({ target, x: event.clientX, y: event.clientY });
  }
  function contextKey(event: React.KeyboardEvent<HTMLElement>, target: Target) {
    if (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10")) return;
    event.preventDefault();
    event.stopPropagation();
    trigger.current = event.currentTarget;
    const rect = event.currentTarget.getBoundingClientRect();
    setMenu({ target, x: rect.left, y: rect.bottom });
  }

  async function moveBookmark(operation: BookmarkPlacement) {
    const request = ++folderRequest.current;
    const result = await placeBookmark(operation);
    if (request === folderRequest.current) setSnapshot(result.snapshot);
    if (result.undo) {
      const inverse = result.undo;
      undo("Bookmark moved", async () => {
        const request = ++folderRequest.current;
        const restored = await placeBookmark(inverse);
        if (request === folderRequest.current) setSnapshot(restored.snapshot);
        await refresh();
      });
    }
    await refresh();
  }
  function dragPosition(event: React.DragEvent<HTMLElement>, folder: BookmarkFolder): FolderDropPosition {
    if (dragged.current && "folder" in dragged.current && !folder.permanent) {
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientY < rect.top + rect.height / 3) return "before";
      if (event.clientY > rect.bottom - rect.height / 3) return "after";
    }
    return "inside";
  }
  function dragOver(event: React.DragEvent<HTMLElement>, folder: BookmarkFolder) {
    if (!dragged.current || !snapshot) return;
    event.preventDefault();
    event.stopPropagation();
    const position = dragPosition(event, folder);
    const allowed =
      snapshot.editable &&
      ("source" in dragged.current || folderDrop(dragged.current.folder, folder, position, snapshot));
    event.dataTransfer.dropEffect = allowed ? "move" : "none";
    setDropTarget(allowed ? { nodeId: folder.nodeId, position } : null);
  }
  function drop(event: React.DragEvent<HTMLElement>, folder: BookmarkFolder) {
    const source = dragged.current;
    if (!source || !snapshot) return;
    event.preventDefault();
    event.stopPropagation();
    const position = dragPosition(event, folder);
    dragged.current = null;
    setDropTarget(null);
    if (!snapshot.editable) return;
    if ("source" in source) {
      action(() => moveBookmark({ source: source.source, destination: folderDestination(folder) }));
      return;
    }
    const operation = folderDrop(source.folder, folder, position, snapshot);
    if (operation) action(() => changeFolder(operation, "Folder moved"));
  }
  function endDrag() {
    dragged.current = null;
    setDropTarget(null);
  }
  function folderItems(folder: BookmarkFolder): SavedBookmark[] {
    const node = nodes.get(folder.nodeId);
    return [...(node?.items ?? []), ...(node?.children.flatMap(folderItems) ?? [])];
  }
  async function openFolder(folder: BookmarkFolder) {
    const state = useStore.getState();
    const items = [
      ...new Map(
        folderItems(folder)
          .filter((item) => !item.url.toLowerCase().startsWith("javascript:"))
          .map((item) => [item.url, item]),
      ).values(),
    ];
    let opened = 0;
    let stopped = false;
    toast(`Opening ${items.length} pages in background tabs`, "info", {
      label: "Stop",
      run: () => {
        stopped = true;
      },
    });
    try {
      for (const item of items) {
        if (stopped) break;
        const latest = useStore.getState();
        const existing = orderedPages(latest.pages).some(
          (page) =>
            page.url === item.url &&
            !page.ownedByRuntime &&
            latest.layout.tabSpace[page.pageId] === state.layout.activeSpaceId &&
            page.viewStatus !== "crashed",
        );
        if (!existing) await openBookmark(item, true, undefined, state.layout.activeSpaceId);
        ++opened;
      }
      toast(
        stopped
          ? `Stopped after opening ${opened} of ${items.length} pages`
          : `Opened ${opened} ${opened === 1 ? "page" : "pages"} in background tabs`,
      );
    } catch (reason) {
      throw new Error(
        `Opened ${opened} of ${items.length} pages. ${reason instanceof Error ? reason.message : String(reason)}`,
      );
    }
  }
  async function remove(item: SavedBookmark) {
    if (!snapshot) throw new Error("Bookmark folders are still loading.");
    const result = await removeBookmark(bookmarkSource(item, snapshot));
    setSnapshot(result.snapshot);
    undo("Bookmark removed", async () => {
      setSnapshot(await restoreBookmark(result.undoToken));
      await refresh();
    });
    await refresh();
  }
  function open(item: SavedBookmark, event: React.MouseEvent) {
    if (event.type === "auxclick" && event.button !== 1) return;
    event.preventDefault();
    const state = useStore.getState();
    void openBookmark(
      item,
      backgroundLink(event),
      state.activePageId ?? undefined,
      state.layout.activeSpaceId,
    ).catch(errToast);
  }
  async function save() {
    if (!editor || pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      if (editor.mode === "edit") {
        const { item, title, url } = editor;
        if (!snapshot) throw new Error("Bookmark folders are still loading.");
        const source = bookmarkSource(item, snapshot);
        const updated = await editBookmark({ source, url, title });
        setSnapshot(updated.snapshot);
        undo("Bookmark updated", async () => {
          setSnapshot(
            (await editBookmark({ source: updated.source, title: item.title, url: item.url })).snapshot,
          );
          await refresh();
        });
        await refresh();
      } else if (editor.mode === "rename") {
        await changeFolder(
          { kind: "rename", source: folderSource(editor.folder), title: editor.name.trim() },
          "Folder renamed",
        );
      } else {
        const parentId = editor.mode === "create" ? editor.folder.nodeId : editor.destinationId;
        const parent = folders.find((folder) => folder.nodeId === parentId);
        if (!parent) throw new Error("The destination folder no longer exists.");
        const destination = folderDestination(parent);
        if (editor.mode === "create")
          await changeFolder({ kind: "create", destination, title: editor.name.trim() }, "Folder created");
        else if (editor.mode === "move-bookmark") await moveBookmark({ source: editor.source, destination });
        else
          await changeFolder(
            { kind: "move", source: folderSource(editor.folder), destination },
            "Folder moved",
          );
      }
      setEditor(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  function tree(nodeId: string): React.ReactNode {
    const node = nodes.get(nodeId);
    return (
      <>
        {node?.children.map((child) => {
          const key = child.nodeId;
          return (
            <details
              className="sb-bookmark-folder"
              key={key}
              open={expanded.has(key)}
              onToggle={(event) => {
                const open = event.currentTarget.open;
                setExpanded((previous) => {
                  if (previous.has(key) === open) return previous;
                  const next = new Set(previous);
                  if (open) next.add(key);
                  else next.delete(key);
                  return next;
                });
              }}
            >
              <summary
                onContextMenu={(event) => context(event, { folder: child })}
                onKeyDown={(event) => {
                  contextKey(event, { folder: child });
                  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                    event.preventDefault();
                    (event.currentTarget.parentElement as HTMLDetailsElement).open =
                      event.key === "ArrowRight";
                  }
                }}
                draggable={!child.permanent && !!snapshot?.editable}
                onDragStart={(event) => {
                  dragged.current = { folder: child };
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", child.title);
                }}
                onDragEnd={endDrag}
                onDragOver={(event) => dragOver(event, child)}
                onDragLeave={() => setDropTarget(null)}
                data-folder-drop={dropTarget?.nodeId === child.nodeId ? dropTarget.position : undefined}
                onDrop={(event) => drop(event, child)}
              >
                <span className="sb-bookmark-folder-icon" aria-hidden="true">
                  {expanded.has(key) ? shellIconFolder : shellIconFolderClosed}
                </span>
                <span className="sb-bookmark-folder-name">{child.path.at(-1) || "Untitled folder"}</span>
                <span className="sb-bookmark-folder-chevron" aria-hidden="true">
                  {shellIconDown}
                </span>
              </summary>
              {expanded.has(key) && <div>{tree(key)}</div>}
            </details>
          );
        })}
        {node?.items.map((item) => (
          <button
            className="sb-link"
            key={item.nodeId ?? item.url}
            title={item.title || item.url}
            onPointerEnter={() => hintNavigation(item.url)}
            onFocus={() => hintNavigation(item.url)}
            onClick={(event) => open(item, event)}
            onAuxClick={(event) => open(item, event)}
            onContextMenu={(event) => context(event, { item })}
            onKeyDown={(event) => contextKey(event, { item })}
            draggable={!!snapshot?.editable}
            onDragStart={(event) => {
              if (!snapshot) return;
              try {
                dragged.current = { source: bookmarkSource(item, snapshot) };
              } catch (reason) {
                event.preventDefault();
                errToast(reason);
                return;
              }
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/uri-list", item.url);
            }}
            onDragEnd={endDrag}
          >
            <FavIcon url={item.url} />
            <span>{item.title || item.url}</span>
          </button>
        ))}
      </>
    );
  }
  const target = menu?.target;
  const item = target && "item" in target ? target.item : undefined;
  const folder = target && "folder" in target ? target.folder : undefined;
  const siblings = folder?.parentId ? (nodes.get(folder.parentId)?.children ?? []) : [];
  const siblingIndex = siblings.findIndex((item) => item.nodeId === folder?.nodeId);
  function reorder(position: "before" | "after") {
    const adjacent = siblings[siblingIndex + (position === "before" ? -1 : 1)];
    if (!folder || !adjacent || !snapshot) return;
    const operation = folderDrop(folder, adjacent, position, snapshot);
    if (operation) action(() => changeFolder(operation, "Folder moved"));
  }
  return (
    <div className="sb-bookmarks">
      <div
        className="sb-bookmark-list"
        onDragOver={(event) => {
          if (rootFolder) dragOver(event, rootFolder);
        }}
        onDrop={(event) => {
          if (rootFolder) drop(event, rootFolder);
        }}
        onKeyDown={(event) => {
          if (
            event.defaultPrevented ||
            event.altKey ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            !["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)
          )
            return;
          const rows = [...event.currentTarget.querySelectorAll<HTMLElement>("summary, .sb-link")].filter(
            (node) => !node.closest("details:not([open]) > div"),
          );
          const index = rows.indexOf(event.target as HTMLElement);
          if (index < 0) return;
          event.preventDefault();
          const next =
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? rows.length - 1
                : (index + (event.key === "ArrowUp" ? -1 : 1) + rows.length) % rows.length;
          rows[next]?.focus();
          rows[next]?.scrollIntoView({ block: "nearest" });
        }}
      >
        {tree(snapshot?.rootId ?? "")}
      </div>
      {!bookmarks.length && !folders.some((folder) => !folder.permanent) && (
        <div className="sb-bookmarks-empty">Right-click a tab to bookmark it</div>
      )}
      <div className="sb-bookmark-actions">
        <button
          className="icon-btn"
          aria-label="New bookmark folder"
          title="New bookmark folder"
          disabled={!snapshot?.editable || !rootFolder}
          onClick={(event) => {
            if (!rootFolder) return;
            trigger.current = event.currentTarget;
            edit({ mode: "create", folder: rootFolder, name: "" });
          }}
        >
          {shellIconPlus}
        </button>
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
      {menu && (
        <Menu label="Bookmark actions" point={menu} returnFocus={trigger} onClose={() => setMenu(null)}>
          {item && (
            <>
              <button
                className="menu-item"
                role="menuitem"
                disabled={item.url.toLowerCase().startsWith("javascript:")}
                onClick={() =>
                  action(async () => {
                    const spaceId = useStore.getState().layout.activeSpaceId;
                    await openBookmark(item, true, undefined, spaceId);
                  })
                }
              >
                Open in background tab
              </button>
              <button
                className="menu-item"
                role="menuitem"
                onClick={() =>
                  edit({
                    mode: "edit",
                    item,
                    title: item.title,
                    url: item.url,
                  })
                }
              >
                Edit bookmark…
              </button>
              <button
                className="menu-item"
                role="menuitem"
                disabled={!snapshot?.editable}
                onClick={() => {
                  if (!snapshot) return;
                  try {
                    const source = bookmarkSource(item, snapshot);
                    edit({ mode: "move-bookmark", source, destinationId: source.parentId });
                  } catch (reason) {
                    errToast(reason);
                  }
                }}
              >
                Move bookmark…
              </button>
              <button
                className="menu-item"
                role="menuitem"
                onClick={() => action(() => navigator.clipboard.writeText(item.url))}
              >
                Copy link
              </button>
              <button className="menu-item danger" role="menuitem" onClick={() => action(() => remove(item))}>
                Remove bookmark
              </button>
            </>
          )}
          {folder && (
            <>
              <button
                className="menu-item"
                role="menuitem"
                disabled={!folderItems(folder).length}
                onClick={() => action(() => openFolder(folder))}
              >
                Open folder in background tabs
              </button>
              <button
                className="menu-item"
                role="menuitem"
                disabled={!snapshot?.editable}
                onClick={() => edit({ mode: "create", folder, name: "" })}
              >
                New folder here…
              </button>
              {!folder.permanent && (
                <>
                  <button
                    className="menu-item"
                    role="menuitem"
                    disabled={!snapshot?.editable}
                    onClick={() => edit({ mode: "rename", folder, name: folder.title })}
                  >
                    Rename folder…
                  </button>
                  <button
                    className="menu-item"
                    role="menuitem"
                    disabled={!snapshot?.editable}
                    onClick={() => edit({ mode: "move-folder", folder, destinationId: folder.parentId! })}
                  >
                    Move folder…
                  </button>
                  <button
                    className="menu-item"
                    role="menuitem"
                    disabled={!snapshot?.editable || siblingIndex <= 0}
                    onClick={() => reorder("before")}
                  >
                    Move folder up
                  </button>
                  <button
                    className="menu-item"
                    role="menuitem"
                    disabled={!snapshot?.editable || siblingIndex < 0 || siblingIndex === siblings.length - 1}
                    onClick={() => reorder("after")}
                  >
                    Move folder down
                  </button>
                  <button
                    className="menu-item danger"
                    role="menuitem"
                    disabled={!snapshot?.editable || !!folder.childIds.length}
                    onClick={() =>
                      action(() =>
                        changeFolder({ kind: "remove", source: folderSource(folder) }, "Folder removed"),
                      )
                    }
                  >
                    Remove empty folder
                  </button>
                </>
              )}
            </>
          )}
        </Menu>
      )}
      {editor && (
        <Dialog
          label={
            editor.mode === "edit"
              ? "Edit bookmark"
              : editor.mode === "rename"
                ? "Rename bookmark folder"
                : editor.mode === "move-folder"
                  ? "Move bookmark folder"
                  : editor.mode === "move-bookmark"
                    ? "Move bookmark"
                    : "New bookmark folder"
          }
          returnFocus={trigger}
          onClose={() => {
            if (!pending.current) setEditor(null);
          }}
        >
          <form
            className="sb-bookmark-editor"
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            {editor.mode === "edit" ? (
              <>
                <label>
                  Title
                  <input
                    autoFocus
                    required
                    maxLength={1000}
                    value={editor.title}
                    disabled={busy}
                    onChange={(event) => setEditor({ ...editor, title: event.target.value })}
                  />
                </label>
                <label>
                  Address
                  <input
                    required
                    type="url"
                    maxLength={8192}
                    value={editor.url}
                    disabled={busy}
                    onChange={(event) => setEditor({ ...editor, url: event.target.value })}
                  />
                </label>
              </>
            ) : editor.mode === "move-folder" || editor.mode === "move-bookmark" ? (
              <label>
                Move into
                <select
                  value={editor.destinationId}
                  disabled={busy}
                  onChange={(event) => setEditor({ ...editor, destinationId: event.target.value })}
                >
                  {folders
                    .filter(
                      (folder) =>
                        editor.mode === "move-bookmark" ||
                        (snapshot && folderDrop(editor.folder, folder, "inside", snapshot)),
                    )
                    .map((folder) => (
                      <option key={folder.nodeId} value={folder.nodeId}>
                        {folder.path.join(" / ") || "Bookmarks"}
                      </option>
                    ))}
                </select>
              </label>
            ) : (
              <label>
                Folder name
                <input
                  autoFocus
                  required
                  maxLength={200}
                  value={editor.name}
                  disabled={busy}
                  onChange={(event) => setEditor({ ...editor, name: event.target.value })}
                />
              </label>
            )}
            {error && <p role="alert">{error}</p>}
            <div className="sb-bookmark-editor-actions">
              <button type="button" disabled={busy} onClick={() => setEditor(null)}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  busy ||
                  (editor.mode === "edit"
                    ? !editor.title.trim() || !editor.url.trim()
                    : editor.mode === "move-folder" || editor.mode === "move-bookmark"
                      ? !editor.destinationId
                      : !editor.name.trim())
                }
              >
                {busy ? "Saving…" : editor.mode === "create" ? "Create folder" : "Save"}
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
