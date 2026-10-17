import { GlassMaterial } from "./GlassMaterial";
import { orderedPages } from "../store/pages";
import { smallGhostButtonProps } from "../ui/button-props";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { COMMANDS, type CommandDef, type PreparedConversation, type FeatureOverride } from "@aux/contracts";
import { useShallow } from "zustand/react/shallow";
import { useStore, call, errToast } from "../store";
import { bridge } from "../bridge";
import { featureVisible } from "../feature-availability";
import { canSplitPage, tabLabel, hostOf } from "../workspace";
import { closeCommandSurface, type CommandSurfaceRequest } from "../command-surface-state";
import { useShortcutLabels } from "../use-shortcut-label";
import { CommandBar } from "./CommandBar";
import { shellIconCommand } from "../ui/icons";
import type { CommandInvocation } from "../features/registry";
import type { Suggestion } from "./command-provider-types";
import { commandSurfaceWorkRows, emptyCommandSurfaceWork } from "../command-surface-providers";
import "./CommandSurface.css";

export interface CommandSurfaceProps {
  request: CommandSurfaceRequest;
  executeCommand: (id: string, context?: CommandInvocation) => Promise<unknown>;
}

/** All entry modes share the same field and provider list. Dispatcher ownership
 * stays with the registered shell command executor supplied by App. */
export function CommandSurface({ request, executeCommand }: CommandSurfaceProps) {
  const restoreFocus = useRef(document.activeElement as HTMLElement | null);
  const key = useShortcutLabels();
  const layout = useStore((state) => state.layout);
  const featureOverrides = useStore(
    (state) => state.settings.featureOverrides as FeatureOverride | undefined,
  );
  const activePageId = useStore((state) => state.activePageId);
  useStore(
    useShallow((state) =>
      orderedPages(state.pages).map((page) =>
        JSON.stringify([page.pageId, page.url, page.title, page.backend, page.viewStatus]),
      ),
    ),
  );
  const pages = orderedPages(useStore.getState().pages);
  const activePage = pages.find((page) => page.pageId === activePageId);
  const returnEmbed =
    activePage &&
    [...document.querySelectorAll<HTMLEmbedElement>("embed.page-surface[data-content-id]")].find(
      (embed) =>
        embed.dataset.pageId === activePage.pageId &&
        embed.dataset.documentEpoch === String(activePage.documentEpoch),
    );
  const returnPage = useRef(
    activePage && {
      pageId: activePage.pageId,
      documentEpoch: activePage.documentEpoch,
      windowId: activePage.windowId,
      embed: returnEmbed,
      contentId: returnEmbed?.dataset.contentId,
    },
  );
  const [query, setQuery] = useState("");
  const [prepared, setPrepared] = useState<PreparedConversation[]>([]);
  useEffect(() => {
    if (bridge.privateMode) return;
    let live = true;
    void call("conversations.prepared", {})
      .then((result) => {
        if (live) setPrepared(result);
      })
      .catch((error) => {
        if (live) errToast(error);
      });
    return () => {
      live = false;
    };
  }, [request.sequence]);
  const [work, setWork] = useState(() => emptyCommandSurfaceWork(""));
  useEffect(() => {
    if (bridge.privateMode || query.trim().length < 2) return;
    let live = true;
    const timer = setTimeout(() => {
      void Promise.all([
        call("tasks.list", { query, limit: 12 }),
        call("workspaces.memory.search", { query }),
      ])
        .then(([tasks, memory]) => {
          if (live) setWork({ query, tasks, memory: memory.slice(0, 8), prepared });
        })
        .catch((error) => {
          if (live) errToast(error);
        });
    }, 100);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [query, prepared]);
  const providerRows = useCallback(
    (term: string) => (bridge.privateMode ? [] : commandSurfaceWorkRows(term, work)),
    [work],
  );
  const [pickerOverride, setPickerOverride] = useState<{ sequence: number; provider: "split" | null } | null>(
    null,
  );
  const picker =
    pickerOverride?.sequence === request.sequence ? pickerOverride.provider : (request.provider ?? null);
  const tabSearch = request.presentation === "tab-search" && !picker;
  const setPicker = (provider: "split" | null) => setPickerOverride({ sequence: request.sequence, provider });
  const [revision, setRevision] = useState(0);
  const close = useCallback(() => {
    const dismissing = useStore.getState().overlay === "command-surface";
    closeCommandSurface(request.sequence);
    if (!dismissing || useStore.getState().overlay !== null) return;
    const target = returnPage.current;
    if (!target?.embed) {
      if (restoreFocus.current?.isConnected) restoreFocus.current.focus();
      return;
    }
    void bridge
      .overlay(false)
      .then(() => {
        requestAnimationFrame(() => {
          const current = useStore.getState(),
            page = current.pages.byId[current.activePageId ?? ""];
          if (
            current.overlay !== null ||
            !page ||
            page.pageId !== target.pageId ||
            page.documentEpoch !== target.documentEpoch ||
            page.windowId !== target.windowId ||
            !target.embed?.isConnected ||
            target.embed.dataset.pageId !== target.pageId ||
            target.embed.dataset.documentEpoch !== String(target.documentEpoch) ||
            target.embed.dataset.contentId !== target.contentId
          )
            return;
          target.embed.focus();
        });
      })
      .catch(errToast);
  }, [request.sequence]);
  const registry = useMemo(
    () =>
      COMMANDS.filter((command) => {
        const definition = command as CommandDef;
        return (
          definition.palette !== false &&
          (!definition.windows || definition.windows.includes(bridge.windowKind)) &&
          (!definition.feature || featureVisible(definition.feature, featureOverrides))
        );
      }),
    [featureOverrides],
  );
  const rows = useCallback(
    (query: string): Array<Suggestion & { keepOpen?: boolean; commandId?: string }> => {
      const term = query.trim().toLocaleLowerCase();
      const matches = (text: string) => !term || text.toLocaleLowerCase().includes(term);
      const row = (
        id: string,
        title: string,
        detail: string,
        run: Suggestion["run"],
        commandId?: string,
      ): Suggestion & { commandId?: string } => ({
        commandId,
        id,
        title,
        detail,
        icon: shellIconCommand,
        section: "intent",
        run,
      });
      if (picker === "split")
        return pages
          .filter(
            (page) =>
              page.pageId !== activePageId &&
              canSplitPage(page) &&
              canSplitPage(activePage) &&
              layout.tabSpace[page.pageId] === layout.activeSpaceId &&
              matches(`${tabLabel(layout, page)} ${page.url}`),
          )
          .map((page) =>
            row(
              `split-${page.pageId}`,
              tabLabel(layout, page),
              hostOf(page.url),
              () =>
                executeCommand("split-add", {
                  payload: { pageId: page.pageId, ...(request.splitEdge ? { edge: request.splitEdge } : {}) },
                }),
              "split-add",
            ),
          );
      const result: Array<Suggestion & { keepOpen?: boolean; commandId?: string }> = registry
        .filter((command) => matches(`${command.label} ${command.section} ${command.id}`))
        .map((command) => ({
          ...row(command.id, command.label, command.section, () => executeCommand(command.id), command.id),
          hint: key(command.id) || undefined,
        }));
      if (featureVisible("spaces", featureOverrides))
        for (const space of layout.spaces)
          if (space.id !== layout.activeSpaceId && matches(`Switch to ${space.name}`))
            result.push(
              row(
                `space-${space.id}`,
                `Switch to ${space.name}`,
                "Space",
                () => executeCommand("command-switch-space", { payload: { spaceId: space.id } }),
                "command-switch-space",
              ),
            );
      return result.sort(
        (a, b) => Number(b.title.toLocaleLowerCase() === term) - Number(a.title.toLocaleLowerCase() === term),
      );
    },
    [
      pages,
      layout,
      activePage,
      activePageId,
      picker,
      registry,
      executeCommand,
      key,
      featureOverrides,
      request.splitEdge,
    ],
  );
  const [placement, setPlacement] = useState<{ left: number; top: number; width: number } | null>(null);
  useEffect(() => {
    const stage = document.querySelector<HTMLElement>(".stage-wrap");
    const toolbarRoot = document.querySelector<HTMLElement>(".toolbar");
    let toolbar: HTMLElement | null = null;
    const observed = new Set<HTMLElement>();
    const place = () => {
      toolbar = document.querySelector<HTMLElement>(
        ".toolbar .cmdbar, .cmdbar.compact:not(.command-surface .cmdbar)",
      );
      if (toolbar && !observed.has(toolbar)) {
        resize.observe(toolbar);
        observed.add(toolbar);
      }
      const bounds = toolbar?.getBoundingClientRect();
      const style = toolbar && getComputedStyle(toolbar);
      const visible =
        request.mode === "edit" &&
        toolbar &&
        bounds &&
        bounds.width > 0 &&
        bounds.height > 0 &&
        bounds.left >= 0 &&
        bounds.right <= window.innerWidth &&
        bounds.top >= 0 &&
        bounds.bottom <= window.innerHeight &&
        style?.visibility !== "hidden" &&
        style?.display !== "none" &&
        !toolbar.closest('[inert], [aria-hidden="true"]') &&
        toolbar.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
      const box = stage?.getBoundingClientRect();
      const width = Math.min(680, tabSearch ? Math.max(0, window.innerWidth - 16) : window.innerWidth * 0.7);
      const next = visible
        ? { left: bounds.left, top: bounds.top, width: bounds.width }
        : {
            left: (box && box.width > 0 ? box.left + box.width / 2 : window.innerWidth / 2) - width / 2,
            top: box && box.height > 0 ? box.top + box.height * 0.18 : window.innerHeight * 0.18,
            width,
          };
      if (tabSearch) {
        next.left = Math.max(8, Math.min(window.innerWidth - width - 8, next.left));
        next.top = Math.max(
          8,
          Math.min(window.innerHeight - Math.min(340, window.innerHeight - 16) - 8, next.top),
        );
      }
      setPlacement((previous) =>
        previous?.left === next.left && previous.top === next.top && previous.width === next.width
          ? previous
          : next,
      );
    };
    const resize = new ResizeObserver(place);
    if (stage) resize.observe(stage);
    if (toolbarRoot) resize.observe(toolbarRoot);
    const changes = new MutationObserver(place);
    if (toolbarRoot) changes.observe(toolbarRoot, { childList: true, subtree: true });
    for (let element = toolbarRoot; element; element = element.parentElement)
      changes.observe(element, {
        attributes: true,
        attributeFilter: ["class", "style", "inert", "aria-hidden"],
      });
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      resize.disconnect();
      changes.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [request.mode, layout, tabSearch]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Tab" && !event.defaultPrevented) {
        const controls = [
          ...dialog.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled)"),
        ];
        if (event.shiftKey && document.activeElement === controls[0]) {
          event.preventDefault();
          controls.at(-1)?.focus();
        } else if (!event.shiftKey && document.activeElement === controls.at(-1)) {
          event.preventDefault();
          controls[0]?.focus();
        }
      }
    };
    dialog.addEventListener("keydown", keyboard);
    return () => {
      dialog.removeEventListener("keydown", keyboard);
    };
  }, []);
  return (
    <div
      role="presentation"
      className="command-surface-scrim"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <dialog
        open
        className="command-surface popup-material"
        aria-modal="true"
        aria-label={tabSearch ? "Search tabs, chats, history, bookmarks or extensions" : "Command surface"}
        data-mode={request.mode}
        data-presentation={tabSearch ? "tab-search" : undefined}
        data-command-surface-sequence={request.sequence}
        style={placement ? { ...placement, transform: "none" } : undefined}
        ref={dialogRef}
      >
        <GlassMaterial alpha noTopGlow />
        {picker && (
          <button
            {...smallGhostButtonProps}
            onClick={() => {
              setPicker(null);
              setRevision((value) => value + 1);
            }}
          >
            Back to commands
          </button>
        )}
        <CommandBar
          key={`${request.sequence}:${revision}`}
          surfaceMode={picker ? "command" : request.mode}
          tabSearch={tabSearch}
          seed={picker ? "" : request.seed}
          commandRows={rows}
          providerRows={providerRows}
          onQueryChange={setQuery}
          onClose={close}
        />
      </dialog>
    </div>
  );
}
