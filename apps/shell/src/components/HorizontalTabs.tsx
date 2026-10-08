import { useTabLayout } from "../use-tab-layout";
import { orderedPages } from "../store/pages";
import { staticIconButtonProps } from "../ui/class-props";
import { runCommand } from "../commands";
import { windowTabHint } from "../tab-window-transfer";
import "./HorizontalTabs.css";
import { isHomeAddress } from "../chrome";
import { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PageTarget } from "@aux/contracts";
import { errToast, useStore } from "../store";
import { groupedTabs, spaceThemeStyle, tabLabel, tabsInSpace } from "../workspace";
import { moveListFocus } from "../keyboard-list";
import { FolderContextMenu, SpaceEditor, SpaceMenu } from "./Sidebar";
import { TabPreview } from "./TabPreview";
import { HorizontalPins } from "./HorizontalPins";
import { AuxMark } from "./AuxMark";
import { FavIcon } from "./SiteTile";
import { TabAudioButton } from "./TabAudioButton";
import { useTabSelection } from "../use-tab-selection";
import { TabMenu } from "./TabMenu";
import {
  shellIconAlert,
  shellIconClose,
  shellIconDown,
  shellIconExternal,
  shellIconPause,
  shellIconPerson,
  shellIconPlus,
} from "../ui/icons";
import { TAB_DRAG_TYPE } from "../tab-drag";
import { useShortcutLabels, withShortcut } from "../use-shortcut-label";
import { useTabMembership } from "../use-tab-membership";

const HorizontalTabControls = memo(function HorizontalTabControls({
  pageId,
  active,
  focusable,
  selected,
  selecting,
  onSelect,
  onSelectionKey,
  onContext,
  onClose,
  onMove,
  onTabNode,
}: {
  pageId: string;
  active: boolean;
  focusable: boolean;
  selected: boolean;
  selecting: boolean;
  onSelect: (id: string, event: React.MouseEvent | React.KeyboardEvent) => boolean;
  onSelectionKey: (event: React.KeyboardEvent) => boolean;
  onContext: (page: PageTarget, x: number, y: number) => void;
  onClose: (id: string, refocus: boolean) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onTabNode: (id: string, node: HTMLButtonElement | null) => void;
}) {
  const page = useStore((state) => state.pages.byId[pageId ?? ""]);
  if (!page) return null;
  const title = useStore((state) => tabLabel(state.layout, page));
  const windowHint = windowTabHint(page);
  const sleeping =
    page.viewStatus !== "crashed" && ["discarded", "frozen", "placeholder"].includes(page.lifecycle ?? "");
  const sleepHint = sleeping
    ? page.lifecycle === "frozen"
      ? "Sleeping. Resumes when opened."
      : "Sleeping. Reloads when opened."
    : undefined;
  const description = [sleepHint, windowHint].filter(Boolean).join(" ") || undefined;
  return (
    <>
      <button
        ref={(node) => onTabNode(pageId, node)}
        className="horizontal-tab-select"
        role="tab"
        tabIndex={focusable ? 0 : -1}
        data-active={active}
        aria-selected={selecting ? selected : active}
        aria-label={page.loading && !sleeping ? `Loading ${title}`.trim() : undefined}
        title={windowHint}
        aria-description={description}
        onClick={(event) => {
          if (!onSelect(pageId, event)) void useStore.getState().activate(pageId).catch(errToast);
        }}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing || onSelectionKey(event)) return;
          if (
            (event.key === " " || event.key === "Enter") &&
            (event.metaKey || event.ctrlKey || event.shiftKey)
          ) {
            event.preventDefault();
            onSelect(pageId, event);
            return;
          }
          if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
            event.preventDefault();
            event.stopPropagation();
            const rect = event.currentTarget.getBoundingClientRect();
            onContext(page, rect.left, rect.bottom);
            return;
          }
          if (["Delete", "Backspace"].includes(event.key) && !event.metaKey && !event.ctrlKey) {
            event.preventDefault();
            event.stopPropagation();
            onClose(pageId, true);
            return;
          }
          if (event.altKey && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault();
            event.stopPropagation();
            onMove(pageId, event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
      >
        {page.viewStatus === "crashed" ? (
          shellIconAlert
        ) : sleeping ? (
          <span className="horizontal-sleep-icon" role="img" aria-label="Sleeping tab" title={sleepHint}>
            {shellIconPause}
          </span>
        ) : page.loading ? (
          <output className="spin" aria-label="Loading" />
        ) : isHomeAddress(page.url) ? (
          <span className="horizontal-empty-icon">
            <AuxMark />
          </span>
        ) : (
          <FavIcon url={page.url} src={page.favicon} size="sm" />
        )}
        <span className="horizontal-tab-title">{title}</span>
        {windowHint && (
          <span role="img" aria-label={windowHint} title={windowHint}>
            {shellIconExternal}
          </span>
        )}
      </button>
      <TabAudioButton pageId={pageId} title={title} />
      <button
        className="horizontal-tab-close"
        aria-label={`Close ${title}`}
        onClick={() => onClose(pageId, false)}
      >
        {shellIconClose}
      </button>
    </>
  );
});

export function HorizontalTabs() {
  const key = useShortcutLabels();
  const layout = useTabLayout();
  const pages = useTabMembership();
  const activePageId = useStore((state) => state.activePageId);
  const mode = useStore((state) => state.mode);
  const allTabs = useMemo(() => tabsInSpace(layout, pages, layout.activeSpaceId), [layout, pages]);
  const folders = layout.folders.filter((folder) => folder.spaceId === layout.activeSpaceId);
  const ordered = groupedTabs(layout, allTabs);
  const groupCount = folders.filter((folder) =>
    allTabs.some((page) => layout.tabFolder[page.pageId] === folder.id),
  ).length;
  const tabs = ordered.filter(
    (page) =>
      !folders.find((folder) => folder.id === layout.tabFolder[page.pageId])?.collapsed ||
      page.pageId === activePageId,
  );
  const [groupMenu, setGroupMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [spaceMenuOpen, setSpaceMenuOpen] = useState(false);
  const spaceTrigger = useRef<HTMLButtonElement>(null);
  const [editingSpace, setEditingSpace] = useState<(typeof layout.spaces)[number] | "new" | null>(null);
  const [preview, setPreview] = useState<{ page: PageTarget; x: number; y: number } | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hidePreview = useCallback(() => {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = null;
    setPreview(null);
  }, []);
  const showPreview = useCallback(
    (pageId: string, element: HTMLElement) => {
      hidePreview();
      const rect = element.getBoundingClientRect();
      previewTimer.current = setTimeout(() => {
        previewTimer.current = null;
        const page = useStore.getState().pages.byId[pageId ?? ""];
        if (page) setPreview({ page, x: rect.left, y: rect.bottom });
      }, 450);
    },
    [hidePreview],
  );
  useEffect(() => {
    const hide = () => hidePreview();
    window.addEventListener("resize", hide);
    window.addEventListener("blur", hide);
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    window.addEventListener("keydown", key);
    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
      window.removeEventListener("resize", hide);
      window.removeEventListener("blur", hide);
      window.removeEventListener("keydown", key);
    };
  }, [hidePreview]);
  useEffect(() => {
    hidePreview();
  }, [activePageId, layout.activeSpaceId, hidePreview]);
  const pins = layout.pins[layout.activeSpaceId] ?? [];
  const space = layout.spaces.find((item) => item.id === layout.activeSpaceId);
  const [menu, setMenu] = useState<{ page: PageTarget; x: number; y: number } | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const dragging = useRef<string | null>(null);
  const dragIds = useRef<string[]>([]);
  const strip = useRef<HTMLDivElement>(null);
  const tabNodes = useRef(new Map<string, HTMLButtonElement>());
  const onTabNode = useCallback((id: string, node: HTMLButtonElement | null) => {
    if (node) tabNodes.current.set(id, node);
    else tabNodes.current.delete(id);
  }, []);
  const focusAfterClose = useCallback(() => {
    const state = useStore.getState();
    const fallback = tabsInSpace(state.layout, orderedPages(state.pages), state.layout.activeSpaceId)[0]
      ?.pageId;
    tabNodes.current.get(state.activePageId ?? fallback ?? "")?.focus();
  }, []);
  const selection = useTabSelection(tabs, layout.activeSpaceId, activePageId, focusAfterClose);
  useEffect(() => {
    if (activePageId && mode === "focus")
      tabNodes.current.get(activePageId)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activePageId, mode, layout.order]);

  const focusablePage = tabs.some((page) => page.pageId === activePageId) ? activePageId : tabs[0]?.pageId;
  const onContext = useCallback(
    (page: PageTarget, x: number, y: number) => {
      hidePreview();
      setMenu({ page, x, y });
    },
    [hidePreview, setMenu],
  );
  const onClose = useCallback((pageId: string, refocus: boolean) => {
    void useStore
      .getState()
      .closeTab(pageId)
      .then(() => {
        if (refocus)
          requestAnimationFrame(() => {
            const state = useStore.getState();
            const fallback = tabsInSpace(
              state.layout,
              orderedPages(state.pages),
              state.layout.activeSpaceId,
            )[0]?.pageId;
            tabNodes.current.get(state.activePageId ?? fallback ?? "")?.focus();
          });
      })
      .catch(errToast);
  }, []);
  const onMove = useCallback(
    (pageId: string, direction: -1 | 1) => {
      const folderId = layout.tabFolder[pageId] ?? null;
      const peers = allTabs.filter((item) => (layout.tabFolder[item.pageId] ?? null) === folderId);
      const from = peers.findIndex((item) => item.pageId === pageId);
      const to = direction === -1 ? from - 1 : from + 2;
      if (to >= 0 && to <= peers.length)
        useStore.getState().reorderGroup(layout.activeSpaceId, folderId, from, to);
    },
    [allTabs, layout],
  );
  const previewPage = useStore((state) =>
    preview ? state.pages.byId[preview.page.pageId ?? ""] : undefined,
  );

  return (
    <>
      <div className="horizontal-tabs-row">
        <HorizontalPins pins={pins} spaceId={layout.activeSpaceId} activePageId={activePageId} />
        <div
          ref={strip}
          className="horizontal-tabs"
          style={{ width: Math.max(1, tabs.length) * 200 + groupCount * 96 + 24 }}
          onScroll={hidePreview}
          role="tablist"
          aria-multiselectable="true"
          aria-label="Browser tabs"
          aria-orientation="horizontal"
          onKeyDown={(event) => {
            if (selection.keyDown(event)) return;
            moveListFocus(event, '[role="tab"], .horizontal-group-chip', false);
          }}
        >
          {allTabs.length === 0 && (
            <button
              className="horizontal-tab empty"
              role="tab"
              aria-selected="true"
              data-command-id="new-tab"
              onClick={() => runCommand("new-tab")}
            >
              <span className="horizontal-empty-icon">
                <AuxMark />
              </span>
              <span>New Tab</span>
            </button>
          )}
          {ordered.map((page) => {
            const folder = folders.find((item) => item.id === layout.tabFolder[page.pageId]);
            const first =
              folder &&
              ordered.find((item) => layout.tabFolder[item.pageId] === folder.id)?.pageId === page.pageId;
            const index = tabs.indexOf(page);
            return (
              <Fragment key={page.pageId}>
                {first && (
                  <div className="horizontal-group" data-space={folder.color}>
                    {renaming === folder.id ? (
                      <input
                        autoFocus
                        aria-label="Tab group name"
                        defaultValue={folder.name}
                        maxLength={200}
                        onBlur={(event) => {
                          useStore.getState().renameFolder(folder.id, event.target.value);
                          setRenaming(null);
                        }}
                        onKeyDown={(event) => {
                          event.stopPropagation();
                          if (event.key === "Enter") event.currentTarget.blur();
                          if (event.key === "Escape") {
                            event.currentTarget.value = folder.name;
                            event.currentTarget.blur();
                          }
                        }}
                      />
                    ) : (
                      <button
                        className="horizontal-group-chip"
                        aria-expanded={!folder.collapsed}
                        aria-label={`${folder.name} tab group`}
                        title={`${folder.name} · Double-click to rename`}
                        onContextMenu={(event) => {
                          event.preventDefault();
                          setGroupMenu({ id: folder.id, x: event.clientX, y: event.clientY });
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "F2") {
                            event.preventDefault();
                            setRenaming(folder.id);
                          }
                          if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
                            event.preventDefault();
                            const rect = event.currentTarget.getBoundingClientRect();
                            setGroupMenu({ id: folder.id, x: rect.left, y: rect.bottom });
                          }
                        }}
                        onDoubleClick={() => setRenaming(folder.id)}
                        onClick={() => useStore.getState().toggleFolder(folder.id)}
                        onDragOver={(event) => {
                          if (dragging.current) event.preventDefault();
                        }}
                        onDrop={(event) => {
                          if (!dragging.current) return;
                          event.preventDefault();
                          useStore.getState().moveTabs(dragIds.current, layout.activeSpaceId, folder.id);
                          dragging.current = null;
                          setDropIndex(null);
                        }}
                      >
                        <span>{folder.name}</span>
                        <small>
                          {allTabs.filter((item) => layout.tabFolder[item.pageId] === folder.id).length}
                        </small>
                      </button>
                    )}
                  </div>
                )}
                {index >= 0 && (
                  <div
                    className={`horizontal-tab ${selection.ids.includes(page.pageId) ? "multi-selected" : ""} ${dropIndex === index ? "drop-before" : ""} ${dropIndex === tabs.length && index === tabs.length - 1 ? "drop-after" : ""}`}
                    onMouseEnter={(event) => showPreview(page.pageId, event.currentTarget)}
                    onMouseMove={(event) => {
                      if (!preview && !previewTimer.current && !dragging.current)
                        showPreview(page.pageId, event.currentTarget);
                    }}
                    onMouseLeave={hidePreview}
                    onFocus={(event) => showPreview(page.pageId, event.currentTarget)}
                    onBlur={hidePreview}
                    onPointerDown={hidePreview}
                    draggable
                    onDragStart={(event) => {
                      hidePreview();
                      dragging.current = page.pageId;
                      dragIds.current = selection.ids.includes(page.pageId)
                        ? [...selection.ids]
                        : [page.pageId];
                      event.dataTransfer.effectAllowed = "copyMove";
                      event.dataTransfer.setData("text/plain", dragIds.current.join("\n"));
                      event.dataTransfer.setData(TAB_DRAG_TYPE, dragIds.current.join("\n"));
                    }}
                    onDragOver={(event) => {
                      if (!dragging.current) return;
                      event.preventDefault();
                      const bounds = event.currentTarget.getBoundingClientRect();
                      setDropIndex(index + (event.clientX > bounds.x + bounds.width / 2 ? 1 : 0));
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (dragging.current && dropIndex !== null) {
                        const before = tabs
                          .slice(dropIndex)
                          .find((tab) => !dragIds.current.includes(tab.pageId));
                        useStore
                          .getState()
                          .moveTabs(
                            dragIds.current,
                            layout.activeSpaceId,
                            folder?.id ?? null,
                            before?.pageId ?? null,
                          );
                      }
                      dragging.current = null;
                      setDropIndex(null);
                    }}
                    onDragEnd={() => {
                      dragging.current = null;
                      setDropIndex(null);
                    }}
                    onAuxClick={(event) => {
                      if (event.button === 1) {
                        event.preventDefault();
                        void useStore.getState().closeTab(page.pageId).catch(errToast);
                      }
                    }}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      const current = useStore.getState().pages.byId[page.pageId ?? ""];
                      if (current) onContext(current, event.clientX, event.clientY);
                    }}
                  >
                    <HorizontalTabControls
                      pageId={page.pageId}
                      active={activePageId === page.pageId && mode === "focus"}
                      focusable={focusablePage === page.pageId}
                      selected={selection.ids.includes(page.pageId)}
                      selecting={selection.ids.length > 0}
                      onSelect={selection.select}
                      onSelectionKey={selection.keyDown}
                      onContext={onContext}
                      onClose={onClose}
                      onMove={onMove}
                      onTabNode={onTabNode}
                    />
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
        <div className="horizontal-tab-tools">
          <button
            {...staticIconButtonProps}
            aria-label="New tab"
            title={withShortcut("New tab", key("new-tab"))}
            data-command-id="new-tab"
            onClick={() => runCommand("new-tab")}
          >
            {shellIconPlus}
          </button>
        </div>
        <div className="horizontal-tabs-spacer" />
        <div className="horizontal-space" data-space={space?.color} style={spaceThemeStyle(space)}>
          <button
            ref={spaceTrigger}
            className="horizontal-profile"
            aria-label={`Switch space, current: ${space?.name ?? "Personal"}`}
            aria-haspopup="menu"
            aria-expanded={spaceMenuOpen}
            title="Switch space"
            onClick={() => setSpaceMenuOpen((open) => !open)}
          >
            {shellIconPerson}
            <span className="horizontal-space-name">{space?.name ?? "Personal"}</span>
            {shellIconDown}
          </button>
          {spaceMenuOpen && (
            <SpaceMenu
              anchor={spaceTrigger}
              spaces={layout.spaces}
              archivedSpaces={layout.archivedSpaces ?? []}
              active={layout.activeSpaceId}
              onPick={(id) => useStore.getState().switchSpace(id)}
              onNew={() => setEditingSpace("new")}
              onEdit={setEditingSpace}
              onDelete={(id) => void useStore.getState().deleteSpace(id).catch(errToast)}
              onRestore={(id) => void useStore.getState().restoreSpace(id).catch(errToast)}
              onHistory={() => useStore.getState().setOverlay("history")}
              onDownloads={() => useStore.getState().setOverlay("downloads")}
              onSettings={() => useStore.getState().setOverlay("settings")}
              onClose={() => setSpaceMenuOpen(false)}
            />
          )}
        </div>
      </div>
      {editingSpace && (
        <SpaceEditor
          space={editingSpace === "new" ? null : editingSpace}
          onClose={() => setEditingSpace(null)}
          returnFocus={spaceTrigger}
          onSave={(name, color, grain, theme) =>
            editingSpace === "new"
              ? useStore.getState().addSpace(name, color, grain, theme)
              : useStore.getState().editSpace(editingSpace.id, name, color, grain, theme)
          }
        />
      )}
      {groupMenu && folders.some((folder) => folder.id === groupMenu.id) && (
        <FolderContextMenu
          group
          folder={folders.find((folder) => folder.id === groupMenu.id)!}
          x={groupMenu.x}
          y={groupMenu.y}
          onClose={() => setGroupMenu(null)}
          onRename={() => setRenaming(groupMenu.id)}
          onDelete={() => {
            useStore.getState().deleteFolder(groupMenu.id);
            setGroupMenu(null);
          }}
        />
      )}
      {preview && previewPage && !groupMenu && !menu && <TabPreview {...preview} page={previewPage} />}
      {menu && (
        <TabMenu
          selectedPages={selection.pagesFor(menu.page)}
          onSelectionDone={selection.clear}
          page={menu.page}
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
        />
      )}
    </>
  );
}
