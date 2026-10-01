import { describe, expect, it } from "vitest";
import { createClock, type PageTarget, type TabCatalogSnapshot, type TabRecord } from "@aux/contracts";
import { archiveSettings, archiverWindow, autoArchiveCandidates } from "./auto-archive";
import { emptyLayout } from "./workspace";

const page = (pageId: string, patch: Partial<PageTarget> = {}): PageTarget => ({ pageId, backend: "aux", targetId: pageId, url: `https://example.test/${pageId}`, title: pageId, viewStatus: "hidden", controller: "none", controllerEpoch: 0, documentEpoch: 0, lastRevision: 0, ownedByRuntime: false, createdAt: 0, lastActiveAt: 0, ...patch });
const tab = (page: PageTarget, patch: Partial<TabRecord> = {}): TabRecord => ({ ...page, navigationError: page.navigationError ?? undefined, windowId: "2", windowKind: "normal", loading: false, muted: false, audible: false, canGoBack: false, canGoForward: false, popup: false, crashed: false, runtimeOwned: false, generation: 0, ...patch });
const base = () => {
  const pages = Array.from({ length: 25 }, (_, i) => page(String(i)));
  const layout = emptyLayout();
  layout.order = pages.map(page => page.pageId);
  layout.tabSpace = Object.fromEntries(pages.map(page => [page.pageId, layout.activeSpaceId]));
  const catalog: TabCatalogSnapshot = { version: 1, tabs: pages.map(page => tab(page)), windows: [{ windowId: "2", windowKind: "normal", order: layout.order, activePageId: null }] };
  return { pages, layout, catalog, windowId: "2", settings: { acknowledged: true, bySpace: {} }, clock: createClock(1000, () => 43_200), unsaved: Object.fromEntries(pages.map(page => [page.pageId, "clean" as const])) };
};

describe("automatic archive authority", () => {
  it("requires acknowledgement, elects numerically lowest normal window, and limits a cycle to twenty", () => {
    const input = base();
    expect(autoArchiveCandidates(input)).toHaveLength(20);
    expect(autoArchiveCandidates({ ...input, settings: { acknowledged: false, bySpace: {} } })).toEqual([]);
    input.catalog.tabs.push(tab(page("foreign"), { windowId: "10" }));
    expect(archiverWindow(input.catalog)).toBe("2");
    expect(autoArchiveCandidates({ ...input, windowId: "10" })).toEqual([]);
  });
  it("protects every native active tab, pins, folders, split members, audio, agent and unknown pages", () => {
    const input = base();
    input.layout.pins[input.layout.activeSpaceId] = [{ url: input.pages[0]!.url, title: "Pin", pageId: "0" }];
    input.layout.tabFolder["1"] = "folder";
    input.layout.splitGroups = [{ id: "split", panes: ["2", "3"], layout: "row", ratios: [.5], focused: "2" }];
    input.catalog.windows.push({ windowId: "10", windowKind: "normal", order: ["4"], activePageId: "4" });
    input.catalog.tabs[5]!.audible = true;
    input.pages[6]!.controller = "agent";
    input.unsaved["7"] = "unknown" as "clean";
    delete input.unsaved["8"];
    input.catalog.tabs[9]!.windowKind = "little";
    input.catalog.tabs[10]!.windowKind = "private";
    input.catalog.tabs[11]!.split = { id: "native", index: 0 };
    expect(autoArchiveCandidates(input).map(page => page.pageId)).toEqual(Array.from({ length: 13 }, (_, i) => String(i + 12)));
  });
  it("uses the later created/activity timestamp and honors Never", () => {
    const input = base();
    input.catalog.tabs[0]!.createdAt = 43_199;
    expect(autoArchiveCandidates(input).some(page => page.pageId === "0")).toBe(false);
    expect(autoArchiveCandidates({ ...input, settings: { acknowledged: true, bySpace: { [input.layout.activeSpaceId]: "never" } } })).toEqual([]);
    expect(archiveSettings({ acknowledged: true, bySpace: { a: 12, b: 1, c: "never" } })).toEqual({ acknowledged: true, bySpace: { a: 12, c: "never" } });
  });
});
