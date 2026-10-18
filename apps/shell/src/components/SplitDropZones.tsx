import { useShallow } from "zustand/react/shallow";
import { useEffect, useRef, useState } from "react";
import { TAB_DRAG_TYPE } from "../tab-drag";
import { orderedPages } from "../store/pages";
import { useStore } from "../store";
import { runCommand } from "../commands";
import { localSplitPage } from "../features/surfaces/split-actions";
import {
  getSurfaceState,
  setSurfaceState,
  useSurfaceState,
  type SplitEdge,
} from "../features/surfaces/drag-state";
import { Dialog } from "../ui/native-dialog";
import { addPane } from "../workspace";
import "./SplitStage.css";
import { staticButtonProps as auxClassButtonProps } from "../ui/class-props";

export function splitDropEdge(x: number, y: number, width: number, height: number): SplitEdge | null {
  const distances = [x / width, 1 - x / width, y / height, 1 - y / height];
  const nearest = Math.min(...distances);
  return nearest <= 0.25 ? (["left", "right", "top", "bottom"] as const)[distances.indexOf(nearest)]! : null;
}
export function SplitDropZones() {
  const state = useSurfaceState();
  const [ready, setReady] = useState(false);
  const started = useRef<{ x: number; y: number; at: number; edge: SplitEdge } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reset = () => {
    if (timer.current) clearTimeout(timer.current);
    started.current = null;
    setReady(false);
    setSurfaceState({ dragging: null, edge: null });
  };
  useEffect(() => {
    let owner: string | undefined;
    const identity = (id: string) => {
      const store = useStore.getState(),
        primary = store.activePageId;
      if (!primary || primary === id || store.overlay || store.mode !== "focus") return;
      const pair = [localSplitPage(primary), localSplitPage(id)];
      if (!pair[0] || !pair[1] || addPane(store.layout, primary, id, "right") === store.layout) return;
      return JSON.stringify([
        store.layout.activeSpaceId,
        pair.map((page) => [
          page!.pageId,
          page!.windowId,
          page!.windowKind,
          page!.targetId,
          page!.sessionId,
          page!.url,
          page!.documentEpoch,
          page!.controllerEpoch,
          store.layout.tabSpace[page!.pageId],
        ]),
      ]);
    };
    const begin = (event: DragEvent) => {
      const ids = event.dataTransfer?.getData(TAB_DRAG_TYPE).split("\n");
      if (ids?.length !== 1 || !(owner = identity(ids[0]!))) return;
      setSurfaceState({ dragging: ids[0]!, edge: null });
    };
    const unsubscribe = useStore.subscribe(() => {
      if (owner && identity(getSurfaceState().dragging ?? "") !== owner) {
        owner = undefined;
        reset();
      }
    });
    document.addEventListener("dragstart", begin);
    document.addEventListener("dragend", reset, true);
    return () => {
      document.removeEventListener("dragstart", begin);
      document.removeEventListener("dragend", reset, true);
      unsubscribe();
      reset();
    };
  }, []);
  if (!state.dragging) return null;
  const bounds = document.getElementById("stage")?.getBoundingClientRect();
  if (!bounds) return null;
  return (
    <section
      className="split-drop-cover"
      style={{ left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height }}
      aria-label="Split drop zones"
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        const stage = document.getElementById("stage")!.getBoundingClientRect();
        const x = event.clientX - stage.left,
          y = event.clientY - stage.top;
        if (x < 0 || y < 0 || x > stage.width || y > stage.height) {
          if (timer.current) clearTimeout(timer.current);
          started.current = null;
          setReady(false);
          setSurfaceState({ edge: null });
          return;
        }
        const edge = splitDropEdge(x, y, stage.width, stage.height);
        setSurfaceState({ edge });
        if (!edge) {
          started.current = null;
          setReady(false);
          if (timer.current) clearTimeout(timer.current);
          return;
        }
        if (!started.current || started.current.edge !== edge) {
          if (timer.current) clearTimeout(timer.current);
          setReady(false);
          started.current = { x, y, at: performance.now(), edge };
          timer.current = setTimeout(() => setReady(true), 1000);
        }
        const start = started.current;
        const movement =
          edge === "left"
            ? start.x - x
            : edge === "right"
              ? x - start.x
              : edge === "top"
                ? start.y - y
                : y - start.y;
        if (movement >= 20 || performance.now() - start.at >= 1000) setReady(true);
      }}
      onDrop={(event) => {
        event.preventDefault();
        const current = getSurfaceState();
        if (ready && current.dragging && current.edge)
          runCommand("split-add", { payload: { pageId: current.dragging, edge: current.edge } });
        reset();
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          started.current = null;
          setReady(false);
          if (timer.current) clearTimeout(timer.current);
          setSurfaceState({ edge: null });
        }
      }}
    >
      {ready && state.edge && (
        <output className={`split-drop-highlight ${state.edge}`}>Split {state.edge}</output>
      )}
    </section>
  );
}
export function SplitPicker() {
  const { picker } = useSurfaceState();
  const active = useStore((state) => state.activePageId),
    layout = useStore((state) => state.layout);
  const pages = useStore(
    useShallow((state) =>
      orderedPages(state.pages).filter(
        (page) =>
          page.pageId !== active &&
          localSplitPage(page.pageId) &&
          active &&
          addPane(layout, active, page.pageId, "right") !== layout,
      ),
    ),
  );
  if (!picker) return null;
  return (
    <Dialog label="Split with a tab" onClose={() => setSurfaceState({ picker: false })}>
      <h2>Split with a tab</h2>
      {pages.length ? (
        pages.map((page) => (
          <button
            key={page.pageId}
            {...auxClassButtonProps}
            data-command-id="split-add"
            onClick={() => {
              runCommand("split-add", { payload: { pageId: page.pageId } });
              setSurfaceState({ picker: false });
            }}
          >
            {page.title}
          </button>
        ))
      ) : (
        <p>Open another browser page in this Space to split it here.</p>
      )}
    </Dialog>
  );
}
