import { staticHintProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "../store";
import { orderedPages } from "../store/pages";
import { openBookmark } from "../bookmark-folders";
import { bridge } from "../bridge";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

type Bookmark = { nodeId?: string; url: string; title: string; folderPath?: string[] };

/** Reopen saved material in an existing Space without interrupting browsing. */
export function OpenBookmarkFolder({ bookmarks, folder }: { bookmarks: Bookmark[]; folder: string[] }) {
  const spaces = useStore(
    useShallow((state) => state.layout.spaces.map((space) => `${space.id}\u0001${space.name}`)),
  );
  const [spaceId, setSpaceId] = useState(() => useStore.getState().layout.activeSpaceId);
  const [expanded, setExpanded] = useState(false);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState<Bookmark[] | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const stopped = useRef(false);
  const active = useRef(false);
  const mounted = useRef(true);
  const done = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stopped.current = true;
    };
  }, []);
  const pages = bookmarks.filter((item) => !item.url.toLowerCase().startsWith("javascript:"));

  async function open() {
    if (active.current) return;
    const overlay = useStore.getState().overlay;
    active.current = true;
    stopped.current = false;
    setRunning(true);
    setError("");
    const queue = remaining ?? [...new Map(pages.map((page) => [page.url, page])).values()];
    const failed: Bookmark[] = [];
    let completed = 0;
    let failure = "";
    for (let index = 0; index < queue.length; index++) {
      if (stopped.current) {
        failed.push(...queue.slice(index));
        break;
      }
      setMessage(`Opening ${index + 1} of ${queue.length}…`);
      try {
        const item = queue[index]!;
        const state = useStore.getState();
        const existing = orderedPages(state.pages).some(
          (page) =>
            page.url === item.url &&
            !page.ownedByRuntime &&
            state.layout.tabSpace[page.pageId] === spaceId &&
            page.viewStatus !== "crashed",
        );
        if (!existing) await openBookmark(item, "background", undefined, spaceId);
        completed++;
      } catch (reason) {
        failed.push(queue[index]!);
        failure = errorMessage(reason);
      }
    }
    active.current = false;
    if (!mounted.current) return;
    setRunning(false);
    setRemaining(failed);
    const spaceName = useStore.getState().layout.spaces.find((space) => space.id === spaceId)?.name;
    setMessage(
      `${completed} ${completed === 1 ? "page is" : "pages are"} available in ${spaceName ?? "the selected Space"}.${failed.length ? ` ${failed.length} remaining.` : ""}`,
    );
    setError(failure);
    // Native background surfaces can take keyboard focus while attaching. Return it
    // only while this dialog is still present, never over a newer browsing action.
    if (useStore.getState().overlay === overlay) {
      await bridge.focusShell().catch(() => {});
      if (mounted.current && useStore.getState().overlay === overlay) done.current?.focus();
    }
  }

  if (!expanded)
    return (
      <button {...smallButtonProps} disabled={!pages.length} onClick={() => setExpanded(true)}>
        Open folder’s {pages.length} {pages.length === 1 ? "page" : "pages"}
      </button>
    );
  return (
    <section className="library-folder-open" aria-label="Open bookmark folder">
      <div>
        <strong>Open {folder.at(-1)}</strong>
        <p {...staticHintProps}>
          Includes subfolders. Pages open in background tabs; pages already open in this Space are reused.
          Bookmarklets must be opened individually.
        </p>
      </div>
      <div className="library-folder-open-actions">
        <select
          aria-label="Open bookmarks in Space"
          value={spaceId}
          disabled={running || remaining !== null}
          onChange={(event) => setSpaceId(event.target.value)}
        >
          {spaces.map((entry) => {
            const [id, name] = entry.split("\u0001");
            return (
              <option key={id} value={id}>
                {name}
              </option>
            );
          })}
        </select>
        <button
          {...smallButtonProps}
          disabled={
            running ||
            remaining?.length === 0 ||
            !spaces.some((entry) => entry.startsWith(`${spaceId}\u0001`))
          }
          onClick={() => void open()}
        >
          {remaining?.length ? `Open remaining ${remaining.length}` : "Open pages"}
        </button>
        {running ? (
          <button
            {...smallGhostButtonProps}
            onClick={() => {
              stopped.current = true;
              setMessage("Stopping after the current page…");
            }}
          >
            Stop
          </button>
        ) : (
          <button
            ref={done}
            {...smallGhostButtonProps}
            onClick={() => {
              setExpanded(false);
              setRemaining(null);
              setMessage("");
              setError("");
            }}
          >
            Done
          </button>
        )}
      </div>
      {message && (
        <output {...staticHintProps} data-block>
          {message}
        </output>
      )}
      {error && (
        <p {...staticHintProps} {...nativeAlertRoleProps}>
          {error}
        </p>
      )}
    </section>
  );
}
