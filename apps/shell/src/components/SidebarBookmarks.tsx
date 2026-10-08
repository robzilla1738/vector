import { useEffect, useMemo, useRef, useState } from "react";
import type { Bookmark } from "@aux/contracts";
import { bookmarkWebUrl } from "../bookmark-files";
import { runCommand } from "../commands";
import { hintNavigation } from "../navigation-preload";
import { call, errToast, toast, useStore } from "../store";
import { Dialog, Menu } from "../ui";
import { shellIconPlus, shellIconMore } from "../ui/icons";
import { FavIcon } from "./SiteTile";

type SavedBookmark = ReturnType<typeof useStore.getState>["bookmarks"][number];
type OpenLink = (link: Pick<Bookmark, "url" | "title">, event: React.MouseEvent) => void;
type Target = { item: SavedBookmark } | { path: string[] };
type Editor =
  | { mode: "create" | "rename"; path: string[]; name: string }
  | { mode: "edit"; item: SavedBookmark; title: string; url: string; folder: string };
const samePath = (left: string[], right: string[]) => JSON.stringify(left) === JSON.stringify(right);
const inside = (path: string[], parent: string[]) => parent.every((part, index) => path[index] === part);

export function SidebarBookmarks({ onOpen }: { onOpen: OpenLink }) {
  const bookmarks = useStore((state) => state.bookmarks);
  const [folders, setFolders] = useState<string[][]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const nodes = useMemo(() => {
    const indexed = new Map<string, { children: Set<string>; items: SavedBookmark[] }>();
    const folder = (path: string[]) => {
      for (let depth = 0; depth <= path.length; ++depth) {
        const key = JSON.stringify(path.slice(0, depth));
        let node = indexed.get(key);
        if (!node) {
          node = { children: new Set(), items: [] };
          indexed.set(key, node);
        }
        if (depth < path.length) node.children.add(path[depth]!);
      }
      return indexed.get(JSON.stringify(path))!;
    };
    folder([]);
    folders.forEach(folder);
    for (const item of bookmarks) folder(item.folderPath ?? []).items.push(item);
    return indexed;
  }, [folders, bookmarks]);
  const [menu, setMenu] = useState<{ target: Target; x: number; y: number } | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const trigger = useRef<HTMLElement | null>(null);
  const dragged = useRef<SavedBookmark | null>(null);
  const pending = useRef(false);
  useEffect(() => {
    let live = true;
    void call("bookmarks.folders.list", {})
      .then((paths) => {
        if (live) setFolders(paths);
      })
      .catch((reason) => {
        if (live) errToast(reason);
      });
    return () => {
      live = false;
    };
  }, [bookmarks]);

  async function refresh() {
    const [items, paths] = await Promise.all([
      call("bookmarks.list", {}),
      call("bookmarks.folders.list", {}),
    ]);
    useStore.setState({ bookmarks: items });
    setFolders(paths);
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

  async function move(item: SavedBookmark, folderPath: string[]) {
    const previous = item.folderPath ?? [];
    if (samePath(previous, folderPath)) return;
    await call("bookmarks.move", {
      bookmarks: [{ url: item.url, nodeId: item.nodeId, folderPath: previous }],
      folderPath,
    });
    undo("Bookmark moved", async () => {
      await call("bookmarks.move", {
        bookmarks: [{ url: item.url, nodeId: item.nodeId, folderPath }],
        folderPath: previous,
      });
      await refresh();
    });
    await refresh();
  }
  function drop(event: React.DragEvent, path: string[]) {
    if (!dragged.current) return;
    event.preventDefault();
    event.stopPropagation();
    const item = dragged.current;
    dragged.current = null;
    action(() => move(item, path));
  }
  function dragOver(event: React.DragEvent) {
    if (!dragged.current) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
  }
  async function openFolder(path: string[]) {
    const state = useStore.getState();
    const urls = [
      ...new Set(
        state.bookmarks
          .filter((item) => inside(item.folderPath ?? [], path))
          .map((item) => bookmarkWebUrl(item.url))
          .filter((url): url is string => !!url),
      ),
    ];
    let opened = 0;
    let stopped = false;
    toast(`Opening ${urls.length} pages in background tabs`, "info", {
      label: "Stop",
      run: () => {
        stopped = true;
      },
    });
    try {
      for (const url of urls) {
        if (stopped) break;
        await state.openBackgroundTab(url, state.layout.activeSpaceId, true);
        ++opened;
      }
      toast(
        stopped
          ? `Stopped after opening ${opened} of ${urls.length} pages`
          : `Opened ${opened} ${opened === 1 ? "page" : "pages"} in background tabs`,
      );
    } catch (reason) {
      throw new Error(
        `Opened ${opened} of ${urls.length} pages. ${reason instanceof Error ? reason.message : String(reason)}`,
      );
    }
  }
  async function remove(item: SavedBookmark) {
    await call("bookmarks.remove", { nodeId: item.nodeId, url: item.url });
    undo("Bookmark removed", async () => {
      const previousIds = item.readAt
        ? new Set((await call("bookmarks.list", {})).map((saved) => saved.nodeId))
        : null;
      await call("bookmarks.add", {
        url: item.url,
        title: item.title,
        folderPath: item.folderPath,
        readingList: item.readingList,
        forceNew: true,
      });
      if (previousIds) {
        const restored = (await call("bookmarks.list", {})).filter(
          (saved) =>
            saved.nodeId &&
            !previousIds.has(saved.nodeId) &&
            saved.url === item.url &&
            saved.title === item.title &&
            samePath(saved.folderPath ?? [], item.folderPath ?? []),
        );
        if (restored.length !== 1)
          throw new Error("Bookmark restored, but its reading status could not be restored.");
        await call("bookmarks.markRead", { url: item.url, nodeId: restored[0]!.nodeId, read: true });
      }
      await refresh();
    });
    await refresh();
  }
  async function save() {
    if (!editor || pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      if (editor.mode === "edit") {
        const { item, title, url, folder } = editor;
        const folderPath = JSON.parse(folder) as string[];
        await call("bookmarks.update", {
          nodeId: item.nodeId,
          originalUrl: item.url,
          url,
          title,
          folderPath,
          expected: { title: item.title, folderPath: item.folderPath ?? [] },
        });
        undo("Bookmark updated", async () => {
          await call("bookmarks.update", {
            nodeId: item.nodeId,
            originalUrl: url,
            url: item.url,
            title: item.title,
            folderPath: item.folderPath ?? [],
            expected: { title: title.trim(), folderPath },
          });
          await refresh();
        });
      } else if (editor.mode === "create") {
        setFolders(await call("bookmarks.folders.create", { path: [...editor.path, editor.name.trim()] }));
      } else {
        const previous = editor.path;
        const next = [...previous.slice(0, -1), editor.name.trim()];
        setFolders(await call("bookmarks.folders.rename", { path: previous, name: editor.name.trim() }));
        undo("Folder renamed", async () => {
          setFolders(await call("bookmarks.folders.rename", { path: next, name: previous.at(-1)! }));
          await refresh();
        });
      }
      setEditor(null);
      await refresh().catch(errToast);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  function tree(path: string[]): React.ReactNode {
    const node = nodes.get(JSON.stringify(path));
    return (
      <>
        {[...(node?.children ?? [])].map((child) => {
          const nested = [...path, child];
          const key = JSON.stringify(nested);
          return (
            <details
              className="sb-bookmark-folder"
              key={child}
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
                onContextMenu={(event) => context(event, { path: nested })}
                onKeyDown={(event) => {
                  contextKey(event, { path: nested });
                  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                    event.preventDefault();
                    (event.currentTarget.parentElement as HTMLDetailsElement).open =
                      event.key === "ArrowRight";
                  }
                }}
                onDragOver={dragOver}
                onDrop={(event) => drop(event, nested)}
              >
                {child}
              </summary>
              {expanded.has(key) && <div>{tree(nested)}</div>}
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
            onClick={(event) => onOpen(item, event)}
            onAuxClick={(event) => onOpen(item, event)}
            onContextMenu={(event) => context(event, { item })}
            onKeyDown={(event) => contextKey(event, { item })}
            draggable
            onDragStart={(event) => {
              dragged.current = item;
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/uri-list", item.url);
            }}
            onDragEnd={() => {
              dragged.current = null;
            }}
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
  const path = target && "path" in target ? target.path : undefined;
  return (
    <div className="sb-bookmarks">
      <div
        className="sb-bookmark-list"
        onDragOver={dragOver}
        onDrop={(event) => drop(event, [])}
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
        {tree([])}
      </div>
      {!bookmarks.length && !folders.length && (
        <div className="sb-bookmarks-empty">Right-click a tab to bookmark it</div>
      )}
      <div className="sb-bookmark-actions">
        <button
          className="icon-btn"
          aria-label="New bookmark folder"
          title="New bookmark folder"
          onClick={(event) => {
            trigger.current = event.currentTarget;
            edit({ mode: "create", path: [], name: "" });
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
                onClick={() =>
                  action(async () => {
                    const url = bookmarkWebUrl(item.url);
                    if (!url) throw new Error("This saved address is not a web page.");
                    const state = useStore.getState();
                    await state.openBackgroundTab(url, state.layout.activeSpaceId, false);
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
                    folder: JSON.stringify(item.folderPath ?? []),
                  })
                }
              >
                Edit or move bookmark…
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
          {path && (
            <>
              <button
                className="menu-item"
                role="menuitem"
                disabled={!bookmarks.some((item) => inside(item.folderPath ?? [], path))}
                onClick={() => action(() => openFolder(path))}
              >
                Open folder in background tabs
              </button>
              <button
                className="menu-item"
                role="menuitem"
                onClick={() => edit({ mode: "create", path, name: "" })}
              >
                New folder here…
              </button>
              <button
                className="menu-item"
                role="menuitem"
                onClick={() => edit({ mode: "rename", path, name: path.at(-1)! })}
              >
                Rename folder…
              </button>
              <button
                className="menu-item danger"
                role="menuitem"
                disabled={
                  bookmarks.some((item) => inside(item.folderPath ?? [], path)) ||
                  folders.some((folder) => folder.length > path.length && inside(folder, path))
                }
                onClick={() =>
                  action(async () => {
                    setFolders(await call("bookmarks.folders.remove", { path }));
                    undo("Folder removed", async () => {
                      setFolders(await call("bookmarks.folders.create", { path }));
                    });
                  })
                }
              >
                Remove empty folder
              </button>
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
                <label>
                  Folder
                  <select
                    value={editor.folder}
                    disabled={busy}
                    onChange={(event) => setEditor({ ...editor, folder: event.target.value })}
                  >
                    <option value="[]">Bookmarks</option>
                    {folders.map((folder) => (
                      <option key={JSON.stringify(folder)} value={JSON.stringify(folder)}>
                        {folder.join(" / ")}
                      </option>
                    ))}
                  </select>
                </label>
              </>
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
                    ? !editor.title.trim() || !bookmarkWebUrl(editor.url)
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
