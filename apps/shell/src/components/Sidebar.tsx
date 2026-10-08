import { deferNamedSurface } from "./DeferredSurface";
const SidebarAddress = deferNamedSurface(
  () => import("./CommandBar"),
  "CommandBar",
  "Address field",
  true,
  true,
);
import { useTabLayout } from "../use-tab-layout";
import { orderedPages } from "../store/pages";
import { staticMenuItemProps, staticIconButtonProps } from "../ui/class-props";
import { ReturnControlButton } from "./ReturnControlButton";
import { runCommand } from "../commands";
import { useSidebarControl } from "./use-sidebar-control";
import { windowTabHint } from "../tab-window-transfer";
import { FeatureSlots } from "../features/registry";
import "./Sidebar.css";
import { SidebarChats } from "../chat-list/SidebarChats";
import { TabPreview, useSidebarTabPreview } from "./TabPreview";
import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useShallow } from "zustand/react/shallow";
import type { PageTarget, ShellCommandId } from "@aux/contracts";
import type { SpaceTheme } from "@aux/contracts/spaces";
import { bridge, inNativeHost } from "../bridge";
import { useStore, errToast } from "../store";
import {
  SPACE_COLORS,
  foldersInSpace,
  hostOf,
  spaceThemeStyle,
  tabLabel,
  tabsInFolder,
  tabsInSpace,
  unfiledTabs,
  type Folder,
  type Pin,
  type Space,
  type SpaceColor,
} from "../workspace";

import { TAB_DRAG_TYPE } from "../tab-drag";
import { bookmarkWebUrl } from "../bookmark-files";
import { SidebarBookmarks } from "./SidebarBookmarks";
import { moveListFocus } from "../keyboard-list";
import { ResizeHandle } from "./ResizeHandle";
import { SidebarSection } from "./SidebarSection";
import { FavIcon, SiteTile } from "./SiteTile";
import { useTabSelection } from "../use-tab-selection";
import { backgroundLink, openBrowserLink } from "../browser-links";
import { boundPin, pinnedPage } from "../pinned-apps";
import { LiveFolderRows } from "./LiveFolderRows";
import { executeCommand } from "../commands";
import { PinMenu } from "./PinMenu";
import { TabMenu } from "./TabMenu";
import { TabAudioButton } from "./TabAudioButton";
import {
  shellIconAgent,
  shellIconPause,
  shellIconAgentSm,
  shellIconAlert,
  shellIconBookmark,
  shellIconClock,
  shellIconClockSm,
  shellIconClose,
  shellIconDown,
  shellIconDownloadSm,
  shellIconExternal,
  shellIconFolderClosed,
  shellIconGear,
  shellIconGearSm,
  shellIconGrid,
  shellIconHandSm,
  shellIconLayersSm,
  shellIconMore,
  shellIconPencil,
  shellIconPerson,
  shellIconPin,
  shellIconPlus,
  shellIconPlusSm,
  shellIconReload,
  shellIconSearch,
  shellIconSidebarClose,
  shellIconSidebarCloseSm,
  shellIconTrash,
} from "../ui/icons";
import { VirtualList } from "./VirtualList";
import { acquireFloatingSidebarLock, useFloatingSidebar } from "../floating-sidebar";
import { useShortcutLabels, withShortcut } from "../use-shortcut-label";
import { useTabMembership, type TabMembership } from "../use-tab-membership";
import { Menu } from "../ui";
import {
  nativeAriaHiddenProps as auxNativeAriaHiddenProps,
  nativeButtonTypeProps as auxNativeButtonTypeProps,
} from "../ui/native-attribute-props";
import {
  staticTextProps as auxClassTextProps,
  staticExtraSmallIconButtonProps as auxClassExtraSmallIconButtonProps,
} from "../ui/class-props";
import { nativeMenuItemRoleProps } from "../ui/native-attribute-props";

const IDLE_DRAG = {
  folderId: null as string | null,
  from: -1,
  to: null as number | null,
  pageId: "",
  over: null as string | null,
};

function FolderKids({
  collapsed,
  count,
  children,
}: {
  collapsed: boolean;
  count: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const animRef = useRef<Animation | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fromH = el.getBoundingClientRect().height;
    const fromOp = Number.parseFloat(getComputedStyle(el).opacity);
    animRef.current?.cancel();
    const target = collapsed ? 0 : (contentRef.current?.scrollHeight ?? 0);
    el.style.height = `${target}px`;
    el.style.opacity = target > 0 ? "1" : "0";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const skip = first.current || reduce || document.hidden || Math.abs(fromH - target) < 0.5;
    first.current = false;
    const root = getComputedStyle(document.documentElement);
    const duration = Number.parseFloat(root.getPropertyValue("--t-slow")) || 240;
    const easing = root.getPropertyValue("--ease-in-out").trim() || "ease";
    if (skip || duration <= 0) return;
    const anim = el.animate(
      [
        { height: `${fromH}px`, opacity: Number.isFinite(fromOp) ? fromOp : 0 },
        { height: `${target}px`, opacity: target > 0 ? 1 : 0 },
      ],
      { duration, easing },
    );
    animRef.current = anim;
    void anim.finished.then(
      () => {
        if (animRef.current === anim) animRef.current = null;
      },
      () => {
        /* Reversing a toggle deliberately cancels the previous animation. */
      },
    );
  }, [collapsed, count]);

  useEffect(() => () => animRef.current?.cancel(), []);

  return (
    <div ref={ref} className="folder-kids" inert={collapsed ? true : undefined} aria-hidden={collapsed}>
      <div ref={contentRef} className="folder-kids-inner">
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab row                                                             */
/* ------------------------------------------------------------------ */

interface TabRowProps {
  pageId: string;
  active: boolean;
  focusable: boolean;
  selected: boolean;
  selecting: boolean;
  onSelectionKey: (event: React.KeyboardEvent) => boolean;
  onNode: (id: string, node: HTMLDivElement | null) => void;
  onSelect: (id: string, event: React.MouseEvent | React.KeyboardEvent) => boolean;
  index: number;
  folderId: string | null;
  dragging: boolean;
  reorderable: boolean;
  dropBefore: boolean;
  dropAfter: boolean;
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
  onDragStart: (folderId: string | null, index: number, pageId: string, e: React.DragEvent) => void;
  onDragOver: (folderId: string | null, index: number, e: React.DragEvent) => void;
  onDrop: (folderId: string | null, e: React.DragEvent) => void;
  onDragEnd: () => void;
  onContext: (p: PageTarget, x: number, y: number) => void;
  onKeyMove: (folderId: string | null, index: number, dir: -1 | 1) => void;
}

const TabRow = memo(function TabRow({
  pageId,
  active,
  focusable,
  selected,
  selecting,
  onSelect,
  onSelectionKey,
  onNode,
  index,
  folderId,
  dragging,
  reorderable,
  dropBefore,
  dropAfter,
  onActivate,
  onClose,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onContext,
  onKeyMove,
}: TabRowProps) {
  const p = useStore((state) => state.pages.byId[pageId ?? ""]);
  const key = useShortcutLabels();
  const preview = useSidebarTabPreview();
  const row = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (active && !row.current?.closest("[inert]")) row.current?.scrollIntoView({ block: "nearest" });
  }, [active]);
  if (!p) return null;
  const windowHint = windowTabHint(p);
  const crashed = p.viewStatus === "crashed";
  const sleeping =
    !crashed && (p.lifecycle === "frozen" || p.lifecycle === "discarded" || p.lifecycle === "placeholder");
  const sleepHint = sleeping
    ? p.lifecycle === "frozen"
      ? "Sleeping. Resumes when opened."
      : "Sleeping. Reloads when opened."
    : undefined;
  const description = [sleepHint, windowHint].filter(Boolean).join(" ") || undefined;
  const title = useStore((state) => tabLabel(state.layout, p));
  return (
    <>
      <div
        ref={(node) => {
          row.current = node;
          onNode(pageId, node);
        }}
        onMouseEnter={(event) => preview.show(event.currentTarget)}
        onMouseLeave={preview.hide}
        onFocus={(event) => preview.show(event.currentTarget)}
        onBlur={preview.hide}
        onPointerDown={preview.hide}
        className={`tab-row ${active ? "active" : ""} ${selected ? "multi-selected" : ""} ${crashed ? "crashed" : ""} ${sleeping ? "sleeping" : ""} ${dragging ? "dragging" : ""} ${dropBefore ? "drop-before" : ""} ${dropAfter ? "drop-after" : ""}`}
        role="tab"
        title={windowHint}
        aria-description={description}
        aria-selected={selecting ? selected : active}
        tabIndex={focusable ? 0 : -1}
        data-index={index}
        draggable
        onClick={(event) => {
          if (!onSelect(p.pageId, event)) onActivate(p.pageId);
        }}
        onAuxClick={(e) => {
          if (e.button === 1) {
            e.preventDefault();
            onClose(p.pageId);
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onContext(p, e.clientX, e.clientY);
        }}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing || onSelectionKey(e)) return;
          if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
            e.preventDefault();
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            onContext(p, rect.left, rect.bottom);
            return;
          }
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!onSelect(p.pageId, e)) onActivate(p.pageId);
          } else if ((e.key === "Backspace" || e.key === "Delete") && !e.metaKey) {
            e.preventDefault();
            onClose(p.pageId);
          } else if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
            e.preventDefault();
            if (reorderable) onKeyMove(folderId, index, e.key === "ArrowUp" ? -1 : 1);
          }
        }}
        onDragStart={(e) => onDragStart(folderId, index, p.pageId, e)}
        onDragOver={(e) => {
          if (reorderable) onDragOver(folderId, index, e);
        }}
        onDrop={(e) => {
          if (reorderable) onDrop(folderId, e);
        }}
        onDragEnd={onDragEnd}
      >
        <span className="tab-fav">
          {crashed ? (
            shellIconAlert
          ) : sleeping ? (
            <span role="img" aria-label="Sleeping tab" title={sleepHint}>
              {shellIconPause}
            </span>
          ) : p.loading ? (
            <span className="spin" />
          ) : (
            <FavIcon url={p.url} src={p.favicon} size="sm" />
          )}
        </span>
        <span className="tab-title">{title}</span>
        {windowHint && (
          <span className="tab-state" role="img" aria-label={windowHint} title={windowHint}>
            {shellIconExternal}
          </span>
        )}
        <TabAudioButton pageId={p.pageId} title={title} />
        {p.controller === "agent" || p.controller === "external" ? (
          <span className="tab-state agent" title="The agent is driving this tab">
            {shellIconAgentSm}
          </span>
        ) : p.controller === "human" ? (
          <span className="tab-state human" title="You're in control — the agent is waiting">
            {shellIconHandSm}
          </span>
        ) : null}
        <button
          className="tab-close"
          tabIndex={-1}
          title={withShortcut("Close tab", key("close-tab"))}
          aria-label={`Close ${title}`}
          onClick={(e) => {
            e.stopPropagation();
            onClose(p.pageId);
          }}
        >
          {shellIconClose}
        </button>
      </div>
      {preview.position && !dragging && <TabPreview page={p} {...preview.position} />}
    </>
  );
});

/* ------------------------------------------------------------------ */
/*  Space switcher                                                      */
/* ------------------------------------------------------------------ */

export function SpaceMenu({
  anchor,
  spaces,
  active,
  onPick,
  onNew,
  onNewFolder,
  onEdit,
  onDelete,
  onCollapse,
  onHistory,
  onDownloads,
  onSettings,
  onClose: finishClose,
  archivedSpaces,
  onRestore,
}: {
  anchor: RefObject<HTMLElement | null>;
  archivedSpaces: Space[];
  onRestore: (id: string) => void;
  spaces: Space[];
  active: string;
  onPick: (id: string) => void;
  onNew: () => void;
  onNewFolder?: () => void;
  onEdit: (s: Space) => void;
  onDelete: (id: string) => void;
  onCollapse?: () => void;
  onHistory: () => void;
  onDownloads: () => void;
  onSettings: () => void;
  onClose: () => void;
}) {
  const key = useShortcutLabels();
  const ref = useRef<HTMLDialogElement>(null);
  const firstSpace = useRef<HTMLButtonElement>(null);
  const spaceSearch = useRef<HTMLInputElement>(null);
  const [profileName, setProfileName] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [spaceQuery, setSpaceQuery] = useState("");
  const currentSpace = spaces.find((space) => space.id === active);
  const matchesSpace = (space: Space) =>
    space.name.toLocaleLowerCase().includes(spaceQuery.trim().toLocaleLowerCase());
  const visibleSpaces = [...spaces]
    .sort((a, b) => Number(b.id === active) - Number(a.id === active))
    .filter(matchesSpace);
  useEffect(() => {
    if (!inNativeHost || bridge.privateMode) return;
    let live = true;
    void bridge
      .browserProfiles()
      .then((items) => {
        if (live) setProfileName(items.find((item) => item.current)?.name ?? "");
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  // Choosing an item changes the underlying view immediately. Remove the menu
  // in the same turn so a new dialog or Space never inherits its closing layer.
  const choose = (action: () => void) => {
    action();
    finishClose();
  };
  const actions = [
    { label: "New space", icon: shellIconPlusSm, run: onNew },
    ...(onNewFolder ? [{ label: "New folder", icon: shellIconFolderClosed, run: onNewFolder }] : []),
    { label: "History", icon: shellIconClockSm, run: onHistory, key: key("history"), separator: true },
    { label: "Downloads", icon: shellIconDownloadSm, run: onDownloads, key: key("downloads") },
    ...(!bridge.privateMode
      ? [{ label: "Settings", icon: shellIconGearSm, run: onSettings, key: key("settings") }]
      : []),
    ...(onCollapse
      ? [
          {
            label: "Collapse sidebar",
            icon: shellIconSidebarCloseSm,
            run: onCollapse,
            key: key("sidebar"),
            separator: true,
          },
        ]
      : []),
  ];
  return (
    <Menu
      label="Spaces and browser controls"
      className={`menu space-menu${onCollapse ? "" : " space-menu-horizontal"}`}
      anchor={anchor}
      placement={onCollapse ? "above-start" : "below-end"}
      menuRef={ref}
      initialFocusRef={spaces.length + archivedSpaces.length > 6 ? spaceSearch : undefined}
      returnFocus={anchor}
      onClose={finishClose}
    >
      {profileName && (
        <div className="menu-caption space-profile-caption" title={`${profileName} browser profile`}>
          Profile · {profileName}
        </div>
      )}
      {bridge.privateMode && <div className="menu-caption">Private window</div>}
      <div className="space-current" data-space={currentSpace?.color} style={spaceThemeStyle(currentSpace)}>
        <span className="space-dot" />
        <div>
          <small>Current Space</small>
          <strong>{currentSpace?.name ?? "Space"}</strong>
        </div>
      </div>
      {spaces.length + archivedSpaces.length > 6 && (
        <label className="space-search">
          {shellIconSearch}
          <input
            ref={spaceSearch}
            type="search"
            aria-label="Search Spaces"
            placeholder="Find a Space…"
            value={spaceQuery}
            onChange={(event) => setSpaceQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                firstSpace.current?.focus();
              }
            }}
          />
        </label>
      )}
      {!visibleSpaces.length && (
        <output className="menu-caption" data-block>
          No matching Spaces
        </output>
      )}
      {visibleSpaces.map((space) => (
        <div
          className="space-menu-row"
          key={space.id}
          data-space={space.color}
          style={spaceThemeStyle(space)}
          role="none"
        >
          <button
            ref={space.id === visibleSpaces[0]?.id ? firstSpace : undefined}
            className={`menu-item ${space.id === active ? "on" : ""}`}
            role="menuitemradio"
            aria-checked={space.id === active}
            onClick={() => choose(() => onPick(space.id))}
          >
            <span className="space-dot" />
            <span {...auxClassTextProps}>{space.name}</span>
          </button>
          <span className="menu-acts" role="none">
            <button
              {...auxClassExtraSmallIconButtonProps}
              {...nativeMenuItemRoleProps}
              aria-label={`Edit ${space.name}`}
              onClick={() => choose(() => onEdit(space))}
            >
              {shellIconPencil}
            </button>
            {spaces.length > 1 && (
              <button
                {...auxClassExtraSmallIconButtonProps}
                {...nativeMenuItemRoleProps}
                aria-label={`${bridge.privateMode ? "Delete" : "Archive"} ${space.name}`}
                onClick={() => choose(() => onDelete(space.id))}
              >
                {shellIconTrash}
              </button>
            )}
          </span>
        </div>
      ))}
      {archivedSpaces.length > 0 && (
        <>
          <button
            {...staticMenuItemProps}
            {...nativeMenuItemRoleProps}
            aria-expanded={showArchived}
            onClick={() => setShowArchived((value) => !value)}
          >
            <span className="menu-ico">{shellIconReload}</span>
            <span {...auxClassTextProps}>Archived spaces</span>
            <span className="muted">{archivedSpaces.length}</span>
          </button>
          {showArchived &&
            archivedSpaces.filter(matchesSpace).map((space) => (
              <button
                key={space.id}
                className="menu-item space-restore-item"
                {...nativeMenuItemRoleProps}
                onClick={() => choose(() => onRestore(space.id))}
                title="Restore this space and its saved work"
              >
                <span {...auxClassTextProps}>{space.name}</span>
                <span className="muted">Restore</span>
              </button>
            ))}
        </>
      )}
      <div className="menu-sep" role="separator" />
      <FeatureSlots slot="spaceMenuItems" />
      {actions.map((action) => (
        <div key={action.label} role="none">
          {action.separator && <div className="menu-sep" role="separator" />}
          <button {...staticMenuItemProps} {...nativeMenuItemRoleProps} onClick={() => choose(action.run)}>
            <span className="menu-ico">{action.icon}</span>
            <span {...auxClassTextProps}>{action.label}</span>
            {action.key && <kbd>{action.key}</kbd>}
          </button>
        </div>
      ))}
    </Menu>
  );
}

const LazySpaceEditor = lazy(() => import("./SpaceEditor"));
export function SpaceEditor(props: {
  space: Space | null;
  onSave: (name: string, color: SpaceColor, grain: number, theme: SpaceTheme | null) => Promise<void>;
  onClose: () => void;
  returnFocus?: RefObject<HTMLElement | null>;
}) {
  return (
    <Suspense fallback={null}>
      <LazySpaceEditor {...props} />
    </Suspense>
  );
}

function FolderRow({
  folder,
  count,
  open,
  dropOn,
  renaming,
  onToggle,
  onRename,
  onStartRename,
  onContext,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  folder: Folder;
  count: number;
  onStartRename: () => void;
  open: boolean;
  dropOn: boolean;
  renaming: boolean;
  onToggle: () => void;
  onRename: (name: string) => void;
  onContext: (x: number, y: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const [name, setName] = useState(folder.name);
  useEffect(() => setName(folder.name), [folder.name, renaming]);
  const cancelled = useRef(false);
  const commit = () => {
    onRename(cancelled.current ? folder.name : name);
    cancelled.current = false;
  };
  return (
    <div
      className={`folder-row ${open ? "open" : ""} ${dropOn ? "drop-on" : ""}`}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-label={`${folder.name} tab group, ${count} ${count === 1 ? "tab" : "tabs"}`}
      onClick={() => !renaming && onToggle()}
      onDoubleClick={() => {
        if (!renaming) onStartRename();
      }}
      onKeyDown={(e) => {
        if (renaming) return;
        if (e.key === "F2") {
          e.preventDefault();
          e.stopPropagation();
          onStartRename();
        } else if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
          e.preventDefault();
          e.stopPropagation();
          const rect = e.currentTarget.getBoundingClientRect();
          onContext(rect.left, rect.bottom);
        } else if (["Enter", " ", "ArrowLeft", "ArrowRight"].includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
          if (
            e.key === "Enter" ||
            e.key === " " ||
            (e.key === "ArrowLeft" && open) ||
            (e.key === "ArrowRight" && !open)
          )
            onToggle();
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContext(e.clientX, e.clientY);
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <span className="tab-fav folder-glyph" aria-hidden data-space={folder.color}>
        {folder.emoji ?? shellIconFolderClosed}
      </span>
      {renaming ? (
        <input
          className="folder-name-input"
          value={name}
          autoFocus
          aria-label="Folder name"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setName(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") {
              e.preventDefault();
              (e.target as HTMLInputElement).blur();
            }
            if (e.key === "Escape") {
              cancelled.current = true;
              setName(folder.name);
              (e.target as HTMLInputElement).blur();
            }
          }}
        />
      ) : (
        <span className="tab-title">{folder.name}</span>
      )}
      <span className="folder-count" {...auxNativeAriaHiddenProps}>
        {count}
      </span>
      <span className="folder-chevron" {...auxNativeAriaHiddenProps}>
        {shellIconDown}
      </span>
    </div>
  );
}

/** Preset folder glyphs — "" resets to the default folder icon. */
const FOLDER_EMOJIS = ["", "📁", "⭐", "🔖", "📌", "🧭", "🧪", "🎯", "💼"];

/** Rows beyond this render only inside the scroll window. */
const VIRTUAL_TABS = 60;
const SidebarChatSection = memo(function SidebarChatSection() {
  return (
    <div className="sb-chats">
      <button className="sb-link" data-command-id="new-chat" onClick={() => runCommand("new-chat")}>
        {shellIconPencil}
        <span>New chat</span>
      </button>
      <SidebarChats compact />
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Sidebar                                                             */
/* ------------------------------------------------------------------ */

export const Sidebar = memo(function Sidebar({ minimal = false }: { minimal?: boolean }) {
  const key = useShortcutLabels();
  const sidebarPref = useStore((s) => s.sidebar);
  const sections = useStore((s) => s.sidebarSections);
  const toggleSection = useStore((s) => s.toggleSidebarSection);
  const railOpenNow = useStore((s) => s.railOpen && s.overlay !== "settings");
  const sidebar = minimal ? "hidden" : sidebarPref;
  const peek = useStore((s) => s.sidebarPeek);
  const layout = useTabLayout();
  const pages = useTabMembership();
  /** 0 not saved · 1 bookmarked · 2 also on the reading list — for the active page. */
  const saved = useStore((s) => {
    const url = s.pages.byId[s.activePageId ?? ""]?.url;
    const b = url ? s.bookmarks.find((item) => item.url === url) : undefined;
    return b ? (b.readingList ? 2 : 1) : 0;
  });
  const activePageId = useStore((s) => s.activePageId);
  const mode = useStore((s) => s.mode);
  const sidebarVisible = sidebar === "expanded" || peek;
  const floatingPanel = useRef<HTMLElement>(null);
  useFloatingSidebar(sidebar, floatingPanel);
  const activate = useStore((s) => s.activate);
  const closeTab = useStore((s) => s.closeTab);
  const switchSpace = useStore((s) => s.switchSpace);
  const addSpace = useStore((s) => s.addSpace);
  const editSpace = useStore((s) => s.editSpace);
  const deleteSpace = useStore((s) => s.deleteSpace);
  const reorderGroup = useStore((s) => s.reorderGroup);
  const addFolder = useStore((s) => s.addFolder);
  const renameFolder = useStore((s) => s.renameFolder);
  const deleteFolder = useStore((s) => s.deleteFolder);
  const toggleFolder = useStore((s) => s.toggleFolder);
  const moveTabToFolder = useStore((s) => s.moveTabToFolder);
  const sidebarWidth = useStore((s) => s.sidebarWidth);
  const setSidebarWidth = useStore((s) => s.setSidebarWidth);

  const space = layout.spaces.find((s) => s.id === layout.activeSpaceId) ?? layout.spaces[0]!;
  const tabs = useMemo(() => tabsInSpace(layout, pages, space.id), [layout, pages, space.id]);
  const folders = useMemo(() => foldersInSpace(layout, space.id), [layout, space.id]);
  const loose = useMemo(
    () => unfiledTabs(layout, pages, space.id).filter((page) => !boundPin(layout, page.pageId)),
    [layout, pages, space.id],
  );
  const visibleTabs = useMemo(
    () => [
      ...folders.flatMap((folder) =>
        folder.collapsed
          ? []
          : tabsInFolder(layout, pages, folder.id).filter((page) => !boundPin(layout, page.pageId)),
      ),
      ...loose,
    ],
    [folders, layout, pages, loose],
  );
  const focusablePageId = visibleTabs.some((tab) => tab.pageId === activePageId)
    ? activePageId
    : visibleTabs[0]?.pageId;
  const tabNodes = useRef(new Map<string, HTMLDivElement>());
  const onTabNode = useCallback((id: string, node: HTMLDivElement | null) => {
    if (node) tabNodes.current.set(id, node);
    else tabNodes.current.delete(id);
  }, []);
  const focusAfterClose = useCallback(() => {
    const activeId = useStore.getState().activePageId;
    const target = tabNodes.current.get(activeId ?? "") ?? tabNodes.current.values().next().value;
    target?.focus();
  }, []);
  const selection = useTabSelection(visibleTabs, space.id, activePageId, focusAfterClose);
  const pins = layout.pins[space.id] ?? [];
  const pinnedIcons = useStore(
    useShallow((state) => {
      const openTabs = tabsInSpace(state.layout, orderedPages(state.pages), space.id);
      return pins.map((pin) => pinnedPage(pin, openTabs)?.favicon);
    }),
  );
  const pinnedTitles = useStore(
    useShallow((state) => pins.map((pin) => pinnedPage(pin, orderedPages(state.pages))?.title)),
  );
  const visiblePins = pins.length > 4 ? pins.slice(0, 3) : pins;
  const overflowPins = pins.slice(visiblePins.length);
  const [activeUrl, activeController] = useStore(
    useShallow((s) => {
      const current = s.pages.byId[activePageId ?? ""];
      return [current?.url, current?.controller] as const;
    }),
  );
  const web = activeUrl?.startsWith("http");

  const [menuOpen, setMenuOpen] = useState(false);
  const spaceTrigger = useRef<HTMLButtonElement>(null);
  const [pinOverflowOpen, setPinOverflowOpen] = useState(false);
  const pinOverflowTrigger = useRef<HTMLButtonElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreTrigger = useRef<HTMLButtonElement>(null);
  const more = useSidebarControl(
    moreTrigger,
    "toggle-sidebar-more",
    "sidebar-more",
    !bridge.privateMode && bridge.windowKind === "normal",
    "more",
    () => true,
    () => setMoreOpen((value) => !value),
    "The original browser tools changed.",
  );
  const spaces = useSidebarControl(
    spaceTrigger,
    "toggle-sidebar-spaces",
    "sidebar-spaces",
    ["normal", "private"].includes(bridge.windowKind),
    space.id,
    () => {
      const layout = useStore.getState().layout;
      return (
        layout.activeSpaceId === space.id && layout.spaces.filter((item) => item.id === space.id).length === 1
      );
    },
    () => setMenuOpen((value) => !value),
    "The original Space chooser changed.",
  );
  function chooseMore(id: ShellCommandId) {
    setMoreOpen(false);
    runCommand(id);
  }
  const [editing, setEditing] = useState<Space | null | "new">(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const pinDrag = useRef<{ url: string; spaceId: string } | null>(null);
  const [pinTrayHover, setPinTrayHover] = useState(false);
  const [pinDrop, setPinDrop] = useState<string | null>(null);
  const dragIds = useRef<string[]>([]);
  const [drag, setDrag] = useState(IDLE_DRAG);
  const [ctx, setCtx] = useState<{ p: PageTarget; x: number; y: number } | null>(null);
  const [pinCtx, setPinCtx] = useState<{ pin: Pin; spaceId: string; x: number; y: number } | null>(null);
  const [folderCtx, setFolderCtx] = useState<{ folder: Folder; x: number; y: number } | null>(null);
  useEffect(() => {
    if (!menuOpen && !ctx && !pinCtx && !folderCtx && !editing) return;
    return acquireFloatingSidebarLock("keep-current");
  }, [menuOpen, ctx, pinCtx, folderCtx, editing]);
  const listRef = useRef<HTMLDivElement>(null);

  function pinDragProps(pin: Pin) {
    return {
      draggable: true,
      "data-pin-drop": pinDrop === pin.url || undefined,
      onDragStart: (event: React.DragEvent) => {
        pinDrag.current = { url: pin.url, spaceId: space.id };
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", pin.url);
      },
      onDragOver: (event: React.DragEvent) => {
        if (pinDrag.current?.spaceId !== space.id || pinDrag.current.url === pin.url) return;
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = "move";
        setPinDrop(pin.url);
      },
      onDragLeave: () => setPinDrop(null),
      onDrop: (event: React.DragEvent) => {
        if (event.dataTransfer.types.includes(TAB_DRAG_TYPE)) return;
        event.preventDefault();
        event.stopPropagation();
        const moving = pinDrag.current;
        if (moving?.spaceId === space.id && moving.url !== pin.url) {
          const from = pins.findIndex((item) => item.url === moving.url);
          const to = pins.findIndex((item) => item.url === pin.url);
          useStore
            .getState()
            .reorderPin(space.id, moving.url, from < to ? (pins[to + 1]?.url ?? null) : pin.url);
        }
        pinDrag.current = null;
        setPinDrop(null);
      },
      onDragEnd: () => {
        pinDrag.current = null;
        setPinDrop(null);
      },
    };
  }

  function pinMenu(pin: Pin, event: React.MouseEvent | React.KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();
    setPinOverflowOpen(false);
    const rect = event.currentTarget.getBoundingClientRect();
    setPinCtx({
      pin,
      spaceId: space.id,
      x: "clientX" in event ? event.clientX : rect.left,
      y: "clientY" in event ? event.clientY : rect.bottom,
    });
  }
  function pinKey(pin: Pin, event: React.KeyboardEvent) {
    if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) pinMenu(pin, event);
  }
  function openPin(pin: Pin, event: React.MouseEvent) {
    if (event.type === "auxclick" && event.button !== 1) return;
    event.preventDefault();
    if (backgroundLink(event)) void openBrowserLink(pin.url, true).catch(errToast);
    else if (layout.pins[space.id]?.some((item) => item.url === pin.url)) {
      void executeCommand("open-pinned-app", { payload: { spaceId: space.id, pinUrl: pin.url } }).catch(
        () => undefined,
      );
    } else void openBrowserLink(pin.url, false).catch(errToast);
    setPinOverflowOpen(false);
  }

  const onActivate = useCallback((id: string) => void activate(id).catch(errToast), [activate]);
  const onClose = useCallback((id: string) => void closeTab(id), [closeTab]);
  const onDragStart = useCallback(
    (folderId: string | null, index: number, pageId: string, e: React.DragEvent) => {
      const page = useStore.getState().pages.byId[pageId ?? ""];
      dragIds.current = page ? selection.pagesFor(page).map((tab) => tab.pageId) : [pageId];
      e.dataTransfer.effectAllowed = "copyMove";
      e.dataTransfer.setData("text/plain", dragIds.current.join("\n"));
      e.dataTransfer.setData(TAB_DRAG_TYPE, dragIds.current.join("\n"));
      setDrag({ folderId, from: index, to: null, pageId, over: folderId });
    },
    [selection.pagesFor],
  );
  const onDragOver = useCallback((folderId: string | null, index: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const after = e.clientY > r.top + r.height / 2;
    setDrag((d) => ({ ...d, over: folderId, to: index + (after ? 1 : 0) }));
  }, []);
  const onDrop = useCallback(
    (folderId: string | null, e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDrag((d) => {
        if (d.from < 0 || !d.pageId) return IDLE_DRAG;
        if (dragIds.current.length > 1) {
          const { layout, pages: collection } = useStore.getState();
          const pages = orderedPages(collection);
          const group = folderId
            ? tabsInFolder(layout, pages, folderId)
            : unfiledTabs(layout, pages, space.id);
          const before = group
            .slice(d.to ?? group.length)
            .find((tab) => !dragIds.current.includes(tab.pageId));
          useStore.getState().moveTabs(dragIds.current, space.id, folderId, before?.pageId ?? null);
        } else if (d.folderId !== folderId) moveTabToFolder(d.pageId, folderId);
        else if (d.to !== null) reorderGroup(space.id, folderId, d.from, d.to);
        return IDLE_DRAG;
      });
    },
    [moveTabToFolder, reorderGroup, space.id],
  );
  const onDropFolder = useCallback(
    (folderId: string, e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDrag((d) => {
        if (dragIds.current.length > 1) useStore.getState().moveTabs(dragIds.current, space.id, folderId);
        else if (d.pageId && d.folderId !== folderId) moveTabToFolder(d.pageId, folderId);
        return IDLE_DRAG;
      });
    },
    [moveTabToFolder, space.id],
  );
  const onDragEnd = useCallback(() => {
    setDrag(IDLE_DRAG);
    setPinTrayHover(false);
  }, []);
  const onContext = useCallback((p: PageTarget, x: number, y: number) => setCtx({ p, x, y }), []);
  const onKeyMove = useCallback(
    (folderId: string | null, index: number, dir: -1 | 1) => {
      const { layout, pages: collection } = useStore.getState();
      const pages = orderedPages(collection);
      const group = folderId ? tabsInFolder(layout, pages, folderId) : unfiledTabs(layout, pages, space.id);
      const to = dir === -1 ? index - 1 : index + 2;
      if (to < 0 || to > group.length) return;
      reorderGroup(space.id, folderId, index, to);
    },
    [reorderGroup, space.id],
  );

  const onListKey = (e: React.KeyboardEvent<HTMLElement>) => {
    if (selection.keyDown(e)) return;
    moveListFocus(e, '[role="tab"]');
  };
  const selectedIds = new Set(selection.ids);
  // Long unfiled lists render only the rows near the viewport; a drag in
  // flight renders everything so its source row never unmounts.
  const tabScroller = useRef<HTMLDivElement>(null);
  const virtual = loose.length > VIRTUAL_TABS && !drag.pageId;

  const renderRow = (p: TabMembership, index: number, folderId: string | null, groupLen: number) => (
    <TabRow
      pageId={p.pageId}
      selected={selectedIds.has(p.pageId)}
      selecting={selection.ids.length > 0}
      onSelect={selection.select}
      onSelectionKey={selection.keyDown}
      onNode={onTabNode}
      index={index}
      folderId={folderId}
      active={p.pageId === activePageId && mode === "focus"}
      focusable={p.pageId === focusablePageId}
      reorderable
      dragging={drag.folderId === folderId && drag.from === index}
      dropBefore={
        drag.folderId === folderId && drag.to === index && drag.from !== index && drag.from !== index - 1
      }
      dropAfter={
        drag.folderId === folderId && drag.to === index + 1 && index === groupLen - 1 && drag.from !== index
      }
      onActivate={onActivate}
      onClose={onClose}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onContext={onContext}
      onKeyMove={onKeyMove}
    />
  );

  const full = (
    <>
      <div className={`sb-head ${inNativeHost ? "native-host" : ""}`}>
        <button
          {...staticIconButtonProps}
          aria-label={peek ? "Keep sidebar open" : "Collapse sidebar"}
          title={withShortcut(peek ? "Keep sidebar open" : "Collapse sidebar", key("sidebar"))}
          data-command-id="sidebar"
          onClick={() => runCommand("sidebar")}
        >
          {shellIconSidebarClose}
        </button>
      </div>
      <div className="sidebar-address">
        <SidebarAddress compact />
      </div>
      <FeatureSlots slot="sidebarItems" />
      <div
        className={`sb-pins${pinTrayHover ? " drop" : ""}`}
        role="group"
        aria-label="Pinned tabs"
        onDragOver={(event) => {
          if (!event.dataTransfer.types.includes(TAB_DRAG_TYPE)) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          setPinTrayHover(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) setPinTrayHover(false);
        }}
        onDrop={(event) => {
          if (!event.dataTransfer.types.includes(TAB_DRAG_TYPE)) return;
          event.preventDefault();
          event.stopPropagation();
          setPinTrayHover(false);
          const ids = new Set(event.dataTransfer.getData(TAB_DRAG_TYPE).split("\n"));
          const state = useStore.getState();
          for (const page of tabsInSpace(state.layout, orderedPages(state.pages), space.id)) {
            if (!ids.has(page.pageId) || !bookmarkWebUrl(page.url)) continue;
            if (!useStore.getState().layout.pins[space.id]?.some((pin) => pin.url === page.url))
              state.togglePin({ url: page.url, title: page.title, pageId: page.pageId }, space.id);
          }
          dragIds.current = [];
          setDrag(IDLE_DRAG);
        }}
      >
        {!pins.length && <span className="sb-pin-hint">Drag tabs here to pin</span>}
        {visiblePins.map((b, index) => (
          <SiteTile
            {...pinDragProps(b)}
            key={b.url}
            url={b.url}
            title={b.title}
            favicon={pinnedIcons[index]}
            unreadTitle={pinnedTitles[index]}
            active={activePageId === b.pageId}
            aria-haspopup="menu"
            onClick={(event) => openPin(b, event)}
            onAuxClick={(event) => openPin(b, event)}
            onKeyDown={(event) => pinKey(b, event)}
            onContextMenu={(event) => pinMenu(b, event)}
          />
        ))}
        {overflowPins.length > 0 && (
          <div className="pin-overflow">
            <button
              ref={pinOverflowTrigger}
              {...auxNativeButtonTypeProps}
              aria-label={`${overflowPins.length} more pinned tabs`}
              title="More pinned tabs"
              aria-haspopup="menu"
              aria-expanded={pinOverflowOpen}
              onClick={() => setPinOverflowOpen((value) => !value)}
            >
              +{overflowPins.length}
            </button>
            {pinOverflowOpen && (
              <Menu
                className="menu sidebar-native-menu pin-overflow-menu"
                label="More pinned tabs"
                anchor={pinOverflowTrigger}
                returnFocus={pinOverflowTrigger}
                onClose={() => setPinOverflowOpen(false)}
              >
                {overflowPins.map((pin) => (
                  <button
                    {...pinDragProps(pin)}
                    className="menu-item"
                    role="menuitem"
                    key={pin.url}
                    title={pin.url}
                    onClick={(event) => openPin(pin, event)}
                    onAuxClick={(event) => openPin(pin, event)}
                    onKeyDown={(event) => pinKey(pin, event)}
                    onContextMenu={(event) => pinMenu(pin, event)}
                  >
                    <span className="menu-ico">{shellIconPin}</span>
                    <span {...auxClassTextProps}>{pin.title || hostOf(pin.url)}</span>
                  </button>
                ))}
              </Menu>
            )}
          </div>
        )}
      </div>

      {!bridge.privateMode && (
        <SidebarSection
          title="Bookmarks"
          open={sections.bookmarks}
          onToggle={() => toggleSection("bookmarks")}
        >
          <SidebarBookmarks />
        </SidebarSection>
      )}
      <SidebarSection title="Chats" open={sections.chats} onToggle={() => toggleSection("chats")}>
        <SidebarChatSection />
      </SidebarSection>
      <SidebarSection title="Tabs" open={sections.tabs} onToggle={() => toggleSection("tabs")} fill>
        <div className="sb-tabs" ref={listRef} onKeyDown={onListKey}>
          <div
            className="tab-list"
            role="tablist"
            aria-multiselectable="true"
            aria-label="Tabs"
            aria-orientation="vertical"
            ref={tabScroller}
          >
            <div className="sb-tab-tools">
              <NewTabButton
                data-command-id="new-tab"
                onClick={() => runCommand("new-tab")}
                dropOn={!!drag.pageId && drag.folderId != null && drag.over === ""}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setDrag((d) => (d.over === "" ? d : { ...d, over: "" }));
                }}
                onDrop={(e) => onDrop(null, e)}
                onDragEnd={onDragEnd}
              />
            </div>
            {folders.map((f) => {
              const kids = tabsInFolder(layout, pages, f.id).filter((page) => !boundPin(layout, page.pageId));
              return (
                <div
                  key={f.id}
                  className={f.collapsed ? "folder-block" : "folder-block open"}
                  role="group"
                  aria-label={f.name}
                >
                  <FolderRow
                    folder={f}
                    count={kids.length}
                    onStartRename={() => setRenameId(f.id)}
                    open={!f.collapsed}
                    dropOn={!!drag.pageId && drag.over === f.id && drag.folderId !== f.id}
                    renaming={renameId === f.id}
                    onToggle={() => toggleFolder(f.id)}
                    onRename={(name) => {
                      renameFolder(f.id, name);
                      setRenameId(null);
                    }}
                    onContext={(x, y) => setFolderCtx({ folder: f, x, y })}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      setDrag((d) => (d.over === f.id ? d : { ...d, over: f.id }));
                    }}
                    onDrop={(e) => onDropFolder(f.id, e)}
                    onDragEnd={onDragEnd}
                  />
                  <FolderKids collapsed={f.collapsed} count={kids.length + (f.live ? 1 : 0)}>
                    {f.live && <LiveFolderRows folderId={f.id} />}
                    {kids.map((p, i) => (
                      <div key={p.pageId} className="tab-slot">
                        {renderRow(p, i, f.id, kids.length)}
                      </div>
                    ))}
                  </FolderKids>
                </div>
              );
            })}

            {(folders.length > 0 || loose.length > 0) && <div className="sb-rule" />}

            <VirtualList
              items={loose}
              rowHeight={32}
              overscan={10}
              className="tab-window"
              rowClassName="tab-slot"
              scroller={tabScroller}
              enabled={virtual}
              measureRows
              rowGap={2}
              activeIndex={loose.findIndex((p) => p.pageId === activePageId)}
              keyOf={(p) => p.pageId}
              renderRow={(p, i) => renderRow(p, i, null, loose.length)}
            />

            {tabs.length === 0 && folders.length === 0 && (
              <div className="sb-empty">No tabs in {space.name}</div>
            )}
          </div>
        </div>
      </SidebarSection>
      <div className="sb-foot">
        <div className="sb-space">
          <button
            ref={spaceTrigger}
            className="space-switch"
            data-space={space.color}
            style={spaceThemeStyle(space)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            data-command-id="toggle-sidebar-spaces"
            onClick={spaces}
            title={withShortcut("Switch space", key("toggle-sidebar-spaces"))}
          >
            <span className="space-ico">{shellIconPerson}</span>
            <span className="space-name">{space.name}</span>
          </button>
          {menuOpen && (
            <SpaceMenu
              anchor={spaceTrigger}
              spaces={layout.spaces}
              archivedSpaces={layout.archivedSpaces ?? []}
              onRestore={(id) => void useStore.getState().restoreSpace(id).catch(errToast)}
              active={space.id}
              onPick={switchSpace}
              onNew={() => setEditing("new")}
              onNewFolder={() => setRenameId(addFolder("Untitled"))}
              onEdit={(s) => setEditing(s)}
              onDelete={(id) => void deleteSpace(id).catch(errToast)}
              onCollapse={() => runCommand("sidebar")}
              onHistory={() => runCommand("history")}
              onDownloads={() => runCommand("downloads")}
              onSettings={() => runCommand("settings")}
              onClose={() => setMenuOpen(false)}
            />
          )}
        </div>
        {bridge.privateMode ? (
          <>
            <span className="private-sidebar-label">Private</span>
            <button
              className={`icon-btn ${railOpenNow ? "on" : ""}`}
              title={withShortcut("Agent", key("agent-rail"))}
              aria-label="Toggle agent rail"
              aria-pressed={railOpenNow}
              data-command-id="agent-rail"
              onClick={() => runCommand("agent-rail")}
            >
              {shellIconAgent}
            </button>
            <button
              data-command-id="overview"
              onClick={() => runCommand("overview")}
              {...staticIconButtonProps}
              aria-label="Tab overview"
            >
              {shellIconGrid}
            </button>
          </>
        ) : (
          <>
            <button
              {...staticIconButtonProps}
              title={withShortcut("Search", key("palette"))}
              aria-label="Search browser"
              data-command-id="palette"
              onClick={() => runCommand("palette")}
            >
              {shellIconSearch}
            </button>
            {activeController === "human" && <ReturnControlButton pageId={activePageId!} compact />}
            <button
              className={`icon-btn ${railOpenNow ? "on" : ""}`}
              title={withShortcut("Agent", key("agent-rail"))}
              aria-label="Toggle agent rail"
              aria-pressed={railOpenNow}
              data-command-id="agent-rail"
              onClick={() => runCommand("agent-rail")}
            >
              {shellIconAgent}
            </button>
            <div className="sb-more">
              <button
                ref={moreTrigger}
                {...staticIconButtonProps}
                aria-haspopup="menu"
                aria-expanded={moreOpen}
                aria-label="More"
                title={withShortcut("More", key("toggle-sidebar-more"))}
                data-command-id="toggle-sidebar-more"
                onClick={more}
              >
                {shellIconMore}
              </button>
              {moreOpen && (
                <Menu
                  className="sidebar-native-menu sb-more-menu"
                  label="Browser tools"
                  anchor={moreTrigger}
                  placement="above-end"
                  returnFocus={moreTrigger}
                  onClose={() => setMoreOpen(false)}
                >
                  <button
                    {...nativeMenuItemRoleProps}
                    aria-label="Agent"
                    data-command-id="agent-rail"
                    onClick={() => chooseMore("agent-rail")}
                  >
                    {shellIconAgent}
                    <span>Agent</span>
                    {key("agent-rail") && <kbd>{key("agent-rail")}</kbd>}
                  </button>
                  {activeController === "human" && (
                    <button
                      {...nativeMenuItemRoleProps}
                      data-command-id="return-agent-control"
                      onClick={() => {
                        setMoreOpen(false);
                        runCommand("return-agent-control", { payload: { pageId: activePageId! } });
                      }}
                    >
                      <span>Return control to agent</span>
                    </button>
                  )}
                  <button
                    {...nativeMenuItemRoleProps}
                    aria-label="Chats"
                    data-command-id="open-chat-history"
                    onClick={() => chooseMore("open-chat-history")}
                  >
                    {shellIconAgentSm}
                    <span>Chats</span>
                    {key("open-chat-history") && <kbd>{key("open-chat-history")}</kbd>}
                  </button>
                  <button
                    {...nativeMenuItemRoleProps}
                    aria-label="Tasks"
                    data-command-id="open-tasks"
                    onClick={() => chooseMore("open-tasks")}
                  >
                    {shellIconLayersSm}
                    <span>Tasks</span>
                    {key("open-tasks") && <kbd>{key("open-tasks")}</kbd>}
                  </button>
                  <button
                    {...nativeMenuItemRoleProps}
                    aria-label="Library"
                    data-command-id="command-bookmarks"
                    onClick={() => chooseMore("command-bookmarks")}
                  >
                    {shellIconBookmark}
                    <span>Library</span>
                    {key("command-bookmarks") && <kbd>{key("command-bookmarks")}</kbd>}
                  </button>
                  <button
                    {...nativeMenuItemRoleProps}
                    aria-label="Downloads"
                    data-command-id="downloads"
                    onClick={() => chooseMore("downloads")}
                  >
                    {shellIconDownloadSm}
                    <span>Downloads</span>
                    {key("downloads") && <kbd>{key("downloads")}</kbd>}
                  </button>
                  <hr />
                  <button
                    {...nativeMenuItemRoleProps}
                    aria-label={saved ? "Remove bookmark" : "Bookmark this page"}
                    disabled={!web}
                    data-command-id="bookmark"
                    onClick={() => chooseMore("bookmark")}
                  >
                    {shellIconBookmark}
                    <span>{saved ? "Remove bookmark" : "Bookmark this page"}</span>
                    {key("bookmark") && <kbd>{key("bookmark")}</kbd>}
                  </button>
                  <button
                    {...nativeMenuItemRoleProps}
                    aria-label={saved === 2 ? "Remove from reading list" : "Add to reading list"}
                    disabled={!web}
                    data-command-id="command-reading-list"
                    onClick={() => chooseMore("command-reading-list")}
                  >
                    {shellIconClock}
                    <span>{saved === 2 ? "Remove from reading list" : "Add to reading list"}</span>
                    {key("command-reading-list") && <kbd>{key("command-reading-list")}</kbd>}
                  </button>
                  <button
                    {...nativeMenuItemRoleProps}
                    aria-label="Tab overview"
                    data-command-id="overview"
                    onClick={() => chooseMore("overview")}
                  >
                    {shellIconGrid}
                    <span>Tab overview</span>
                    {key("overview") && <kbd>{key("overview")}</kbd>}
                  </button>
                  <button
                    {...nativeMenuItemRoleProps}
                    aria-label="Settings"
                    data-command-id="settings"
                    onClick={() => chooseMore("settings")}
                  >
                    {shellIconGear}
                    <span>Settings</span>
                    {key("settings") && <kbd>{key("settings")}</kbd>}
                  </button>
                </Menu>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      <aside
        ref={floatingPanel}
        className={`sidebar ${sidebar === "expanded" ? "expanded" : "fully-hidden"}${peek ? " peek" : ""}`}
        inert={!sidebarVisible ? true : undefined}
        aria-hidden={!sidebarVisible}
        data-space={space.color}
        style={
          {
            "--sb-w": `${sidebarWidth}px`,
            "--space-grain": space.grain,
            ...spaceThemeStyle(space),
          } as React.CSSProperties
        }
        aria-label="Sidebar"
      >
        <div
          className="sidebar-content"
          inert={!sidebarVisible ? true : undefined}
          aria-hidden={!sidebarVisible}
        >
          {full}
        </div>
        {sidebarVisible && (
          <ResizeHandle
            side="left"
            value={sidebarWidth}
            min={126}
            max={400}
            reset={280}
            snapDistance={15}
            keyboardStep={50}
            onResize={setSidebarWidth}
            onCollapse={() => runCommand("sidebar-hide")}
          />
        )}
      </aside>
      {editing && (
        <SpaceEditor
          space={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          returnFocus={spaceTrigger}
          onSave={(name, color, grain, theme) =>
            editing === "new"
              ? addSpace(name, color, grain, theme)
              : editSpace(editing.id, name, color, grain, theme)
          }
        />
      )}
      {pinCtx && <PinMenu {...pinCtx} onClose={() => setPinCtx(null)} />}
      {ctx && (
        <TabMenu
          selectedPages={selection.pagesFor(ctx.p)}
          onSelectionDone={selection.clear}
          page={ctx.p}
          x={ctx.x}
          y={ctx.y}
          onClose={() => setCtx(null)}
        />
      )}
      {folderCtx && (
        <FolderContextMenu
          folder={folderCtx.folder}
          x={folderCtx.x}
          y={folderCtx.y}
          onClose={() => setFolderCtx(null)}
          onRename={() => setRenameId(folderCtx.folder.id)}
          onDelete={() => deleteFolder(folderCtx.folder.id)}
        />
      )}
    </>
  );
});

function NewTabButton({
  onClick,
  dropOn,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  onClick: () => void;
  dropOn?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}) {
  return (
    <button
      className={`tab-new ${dropOn ? "drop-on" : ""}`}
      aria-label="New Tab"
      title="New Tab"
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <span className="tab-fav">{shellIconPlus}</span>
      <span className="tab-title">New Tab</span>
    </button>
  );
}

export function FolderContextMenu({
  folder,
  x,
  y,
  onClose: finishClose,
  onRename,
  onDelete,
  group = false,
}: {
  folder: Folder;
  x: number;
  y: number;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
  group?: boolean;
}) {
  const trigger = useRef(document.activeElement as HTMLElement | null);
  const updateFolder = useStore((s) => s.updateFolder);
  return (
    <Menu
      className="menu ctx-menu"
      label={group ? "Tab group actions" : "Folder actions"}
      point={{ x, y }}
      onClose={finishClose}
      returnFocus={trigger}
    >
      <button
        {...staticMenuItemProps}
        {...nativeMenuItemRoleProps}
        data-command-id="make-live-folder"
        onClick={() => {
          finishClose();
          void executeCommand("make-live-folder", { payload: { folderId: folder.id } }).catch(errToast);
        }}
      >
        {folder.live ? "Edit live folder…" : "Make live folder…"}
      </button>
      <div role="group" className="menu-swatches" aria-label="Folder colour">
        {SPACE_COLORS.map((color) => (
          <button
            key={color}
            role="menuitemradio"
            aria-checked={folder.color === color}
            aria-label={color}
            data-space={color}
            className={`swatch sm ${folder.color === color ? "on" : ""}`}
            onClick={() => updateFolder(folder.id, { color: folder.color === color ? null : color })}
          />
        ))}
      </div>
      <div role="group" className="menu-swatches" aria-label="Folder icon">
        {FOLDER_EMOJIS.map((emoji) => {
          const on = (folder.emoji ?? "") === emoji;
          return (
            <button
              key={emoji}
              role="menuitemradio"
              aria-checked={on}
              aria-label={emoji === "" ? "Default folder icon" : `Icon ${emoji}`}
              className={`swatch emoji ${on ? "on" : ""}`}
              onClick={() => updateFolder(folder.id, { emoji: emoji || null })}
            >
              {emoji || shellIconFolderClosed}
            </button>
          );
        })}
      </div>
      <button
        {...staticMenuItemProps}
        {...nativeMenuItemRoleProps}
        onClick={() => {
          onRename();
          finishClose();
        }}
      >
        <span {...auxClassTextProps}>Rename</span>
      </button>
      <button
        {...staticMenuItemProps}
        {...nativeMenuItemRoleProps}
        onClick={() => {
          onDelete();
          finishClose();
        }}
      >
        <span {...auxClassTextProps}>{group ? "Ungroup tabs" : `Delete “${folder.name}”`}</span>
      </button>
    </Menu>
  );
}
