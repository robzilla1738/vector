import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PageTarget } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { tabLabel } from "../workspace";
import { Dialog } from "../ui/native-dialog";
import { positionContextMenu } from "../position-context-menu";
import { FavIcon } from "./SiteTile";
import {
  cycleTabPreview,
  finishTabPreview,
  ownTabPreviewModal,
  reconcileTabPreview,
  selectTabPreview,
  useTabPreviewSelection,
} from "../tab-switcher-state";
import "./TabSwitcher.css";

function Preview({ page }: { page: PageTarget }) {
  const container = useRef<HTMLSpanElement>(null);
  const [image, setImage] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    setImage(null);
    const load = () =>
      void bridge
        .preview(page.pageId)
        .then((value) => {
          if (live) setImage(value);
        })
        .catch(() => {});
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              observer?.disconnect();
              load();
            }
          });
    if (observer && container.current) observer.observe(container.current);
    else load();
    return () => {
      live = false;
      observer?.disconnect();
    };
  }, [page.pageId, page.documentEpoch]);
  return (
    <span ref={container} className="tab-switcher-preview">
      {image ? (
        <img src={image} alt="" />
      ) : (
        <span className="tab-switcher-fallback">
          <FavIcon url={page.url} src={page.favicon} size="lg" />
        </span>
      )}
    </span>
  );
}

export function TabSwitcher() {
  const selection = useTabPreviewSelection();
  const dialog = useRef<HTMLDialogElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const pages = useStore((state) => state.pages);
  const layout = useStore((state) => state.layout);
  const modalScope = selection?.modalScope;
  useEffect(() => useStore.subscribe(reconcileTabPreview), []);
  useLayoutEffect(() => {
    if (modalScope && dialog.current) return ownTabPreviewModal(modalScope, dialog.current);
  }, [modalScope]);
  useLayoutEffect(() => {
    if (!selection || !dialog.current) return;
    const panel = dialog.current;
    const main = document.querySelector(".main-col");
    const place = () => {
      const rect = main?.getBoundingClientRect();
      panel.style.maxWidth = `${Math.max(0, Math.min(innerWidth - 16, Math.max(160, (rect?.width ?? innerWidth) - 32)))}px`;
      panel.style.maxHeight = `${Math.max(0, innerHeight - 16)}px`;
      positionContextMenu(
        panel,
        (rect ? rect.left + rect.width / 2 : innerWidth / 2) - panel.offsetWidth / 2,
        (rect ? rect.top + rect.height / 2 : innerHeight / 2) - panel.offsetHeight / 2,
      );
      list.current
        ?.querySelector<HTMLElement>('[aria-selected="true"]')
        ?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    };
    place();
    window.addEventListener("resize", place);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    if (main) observer?.observe(main);
    observer?.observe(panel);
    list.current?.focus({ preventScroll: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", place);
    };
  }, [selection]);
  if (!selection) return null;
  return (
    <Dialog
      label="Switch tabs"
      className="tab-switcher"
      dialogRef={dialog}
      onClose={() => finishTabPreview(false)}
    >
      <div
        ref={list}
        className="tab-switcher-list"
        role="listbox"
        aria-label="Tabs"
        aria-orientation="horizontal"
        aria-activedescendant={`switch-tab-${selection.selectedId}`}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.isDefaultPrevented() || event.nativeEvent.isComposing) return;
          if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
            event.preventDefault();
            event.stopPropagation();
            cycleTabPreview(event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1);
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            finishTabPreview(true);
          }
        }}
      >
        {selection.ids.map((id) => {
          const page = pages.byId[id];
          if (!page) return null;
          return (
            <button
              key={id}
              type="button"
              role="option"
              id={`switch-tab-${id}`}
              aria-selected={id === selection.selectedId}
              tabIndex={-1}
              title={tabLabel(layout, page)}
              onPointerMove={() => {
                if (id !== selection.selectedId) selectTabPreview(id);
              }}
              onClick={() => {
                selectTabPreview(id);
                finishTabPreview(true);
              }}
            >
              <Preview page={page} />
              <span className="tab-switcher-caption">
                <FavIcon url={page.url} src={page.favicon} size="sm" />
                <span>{tabLabel(layout, page)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </Dialog>
  );
}
