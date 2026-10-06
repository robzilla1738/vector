import { orderedPages } from "./store/pages";
import { measureOrganizationWork } from "./organization-performance";
import type { Clock, HostMethodResult, PageTarget, TabCatalogSnapshot } from "@aux/contracts";
import type { Layout } from "./workspace";

export const ARCHIVE_POLICIES = [12, 24, 72, 168, 720, "never"] as const;
export type ArchiveHours = (typeof ARCHIVE_POLICIES)[number];
export interface AutoArchiveSettings {
  acknowledged: boolean;
  bySpace: Record<string, ArchiveHours>;
}

export function archiveSettings(raw: unknown): AutoArchiveSettings {
  if (!raw || typeof raw !== "object") return { acknowledged: false, bySpace: {} };
  const value = raw as Partial<AutoArchiveSettings>;
  return {
    acknowledged: value.acknowledged === true,
    bySpace: Object.fromEntries(
      Object.entries(value.bySpace ?? {}).filter(([, hours]) => ARCHIVE_POLICIES.includes(hours)),
    ),
  };
}

/** Catalog ownership is authoritative; utility and private windows cannot elect or protect by proxy. */
export function archiverWindow(catalog: TabCatalogSnapshot): string | undefined {
  const ids = new Set(
    catalog.windows.filter((window) => window.windowKind === "normal").map((window) => window.windowId),
  );
  return [...ids].sort((a, b) => a.localeCompare(b, "en", { numeric: true }))[0];
}

export function autoArchiveCandidates(input: {
  layout: Layout;
  pages: readonly PageTarget[];
  catalog: TabCatalogSnapshot;
  settings: AutoArchiveSettings;
  windowId: string;
  clock: Clock;
  unsaved: Readonly<HostMethodResult<"tabsUnsavedWork">>;
}): PageTarget[] {
  const { layout, catalog, settings, clock, unsaved } = input;
  if (!settings.acknowledged || archiverWindow(catalog) !== input.windowId) return [];
  const protectedIds = new Set([
    ...Object.values(layout.pins).flatMap((pins) => pins.flatMap((pin) => (pin.pageId ? [pin.pageId] : []))),
    ...Object.keys(layout.tabFolder),
    ...(layout.splitGroups ?? []).flatMap((group) => group.panes),
    ...catalog.windows.flatMap((window) => (window.activePageId ? [window.activePageId] : [])),
    ...(layout.archivedTabs ?? []).map((entry) => entry.pageId),
  ]);
  const native = new Map(catalog.tabs.map((tab) => [tab.pageId, tab]));
  return input.pages
    .filter((page) => {
      const tab = native.get(page.pageId);
      if (
        !tab ||
        tab.windowKind !== "normal" ||
        tab.anchor ||
        tab.runtimeOwned ||
        tab.audible ||
        tab.split ||
        page.ownedByRuntime ||
        page.controller !== "none" ||
        page.loading ||
        page.viewStatus === "crashed" ||
        protectedIds.has(page.pageId) ||
        unsaved[page.pageId] !== "clean" ||
        page.url !== tab.url ||
        !/^https?:\/\//.test(page.url)
      )
        return false;
      const spaceId = layout.tabSpace[page.pageId];
      if (!spaceId || !layout.spaces.some((space) => space.id === spaceId)) return false;
      const hours = settings.bySpace[spaceId] ?? 12;
      return (
        hours !== "never" &&
        clock.elapsedSince(Math.max(tab.createdAt, tab.lastActiveAt)) >= hours * 3_600_000
      );
    })
    .sort((a, b) => Math.max(a.lastActiveAt, a.createdAt) - Math.max(b.lastActiveAt, b.createdAt))
    .slice(0, 20);
}

/** One elected window performs native-guarded closes; profile commits retain their CAS. */
export function runAutoArchiveCycle() {
  return measureOrganizationWork("aux:autoArchive:cycle", autoArchiveCycle);
}
async function autoArchiveCycle() {
  const { bridge } = await import("./bridge");
  const { useStore, toast } = await import("./store");
  const { clock } = await import("./clock");
  const { archivePages } = await import("./archive-actions");
  const { executeCommand } = await import("./commands");
  if (bridge.privateMode || bridge.windowKind !== "normal") return { archived: 0, durationMs: 0 };
  const began = performance.now();
  const state = useStore.getState();
  if (!state.connected || state.restoringTabs) return { archived: 0, durationMs: performance.now() - began };
  const catalog = await bridge.tabsSnapshot();
  const settings = archiveSettings(state.settings.autoArchive);
  // This first pass selects bounded probe targets only. Every close still requires a native clean probe.
  const probeStatuses = Object.fromEntries(
    orderedPages(state.pages).map((page) => [page.pageId, "clean" as const]),
  );
  const probe = autoArchiveCandidates({
    layout: state.layout,
    pages: orderedPages(state.pages),
    catalog,
    settings,
    windowId: bridge.windowId,
    clock,
    unsaved: probeStatuses,
  });
  if (!probe.length) return { archived: 0, durationMs: performance.now() - began };
  const unsaved = await bridge.tabsUnsavedWork(probe.map((page) => ({ pageId: page.pageId, url: page.url })));
  const current = useStore.getState();
  const chosen = autoArchiveCandidates({
    layout: current.layout,
    pages: orderedPages(current.pages),
    catalog: await bridge.tabsSnapshot(),
    settings: archiveSettings(current.settings.autoArchive),
    windowId: bridge.windowId,
    clock,
    unsaved,
  });
  const bySpace = new Map<string, string[]>();
  for (const page of chosen) {
    const spaceId = current.layout.tabSpace[page.pageId]!;
    bySpace.set(spaceId, [...(bySpace.get(spaceId) ?? []), page.pageId]);
  }
  let archived = 0;
  for (const [spaceId, ids] of bySpace) {
    const receipt = await archivePages(ids, { reason: "auto" });
    archived += receipt.entries.length;
    const space =
      useStore.getState().layout.spaces.find((space) => space.id === spaceId)?.name ?? "this Space";
    toast(
      `Archived ${receipt.entries.length} ${receipt.entries.length === 1 ? "tab" : "tabs"} from ${space}`,
      "info",
      {
        secondary: {
          label: "View archive",
          run: () => {
            void executeCommand("show-archived-tabs").catch(() => undefined);
          },
        },
        label: "Undo",
        run: () => {
          void executeCommand("archive-undo", { payload: { batchId: receipt.batchId } }).catch(
            () => undefined,
          );
        },
      },
    );
  }
  return { archived, durationMs: performance.now() - began };
}

export function installAutoArchive() {
  let timer: ReturnType<typeof setTimeout>;
  let stopped = false;
  const tick = async () => {
    try {
      await runAutoArchiveCycle();
    } catch {
      /* Native refusal or stale CAS keeps tabs safe; retry on the next quiet cycle. */
    }
    if (!stopped) {
      const { clock } = await import("./clock");
      timer = setTimeout(() => void tick(), Math.max(100, clock.delayMs(60_000)));
    }
  };
  void tick();
  return () => {
    stopped = true;
    clearTimeout(timer);
  };
}
