// @vitest-environment jsdom
import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { type CapturedSource, type CapturedSourceSelection, RunsStartParams } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { makePage } from "../mock/fixtures";
import { normalizePages } from "../store/pages";
import { sourceRef } from "../browser-context-sources";
import { BrowserContextTray } from "./BrowserContextTray";
import { CapturedSourcePicker } from "./CapturedSourcePicker";
const initial = useStore.getState();
const pages = Array.from({ length: 35 }, (_, index) =>
  makePage(index, {
    pageId: `page-${index}`,
    title: `Page ${index}`,
    url: `https://example.test/${index}`,
    sessionId: `session-${index}`,
    documentEpoch: 1,
  }),
);
const captures: CapturedSource[] = pages.map((page, index) => ({
  memoryId: `memory-${index}`,
  pageId: page.pageId,
  documentEpoch: 1,
  profileId: "profile",
  workspaceId: "space",
  title: `Article ${index}`,
  url: page.url,
  capturedAt: 100 + index,
}));
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  useStore.setState({ pages: normalizePages(pages), toasts: [] });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const button = (label: string, scope: ParentNode = document) =>
  [...scope.querySelectorAll<HTMLButtonElement>("button")].find(
    (item) => item.textContent?.trim() === label,
  )!;

it("pages a live-tab collection while retaining all thirty original identities when adding another tab", async () => {
  vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "browser.recovery.list") return [];
    if (method === "pages.list") return pages;
    throw new Error(method);
  });
  const selected = pages.slice(0, 30).map((page) => sourceRef(page));
  const onSources = vi.fn();
  await act(async () =>
    root.render(
      <BrowserContextTray
        primary="none"
        sources={selected}
        onSources={onSources}
        onPrimary={vi.fn()}
        disabled={false}
      />,
    ),
  );
  expect(host.querySelectorAll('[data-command-id="remove-browser-source"]')).toHaveLength(6);
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Add browser tabs"]')!.click());
  const dialog =
    document.querySelector('dialog[aria-label="Add browser tabs"]') ?? document.querySelector("dialog")!;
  expect(dialog.querySelectorAll('input[type="checkbox"]')).toHaveLength(12);
  await act(async () => button("Next", dialog).click());
  await act(async () => button("Next", dialog).click());
  const choice = [...dialog.querySelectorAll("label")].find((row) => row.textContent?.includes("Page 30"))!;
  await act(async () => choice.querySelector<HTMLInputElement>("input")!.click());
  expect(onSources).toHaveBeenCalledOnce();
  const next = onSources.mock.calls[0]![0];
  expect(next.slice(0, 30)).toEqual(selected);
  expect(next).toHaveLength(31);
  expect(
    RunsStartParams.parse({
      goal: "Compare these sources",
      pageIds: next.map((ref: { pageId: string }) => ref.pageId),
      contextPageRefs: next,
    }).contextPageRefs,
  ).toHaveLength(31);
});

it("pages captured metadata, keeps changed and unavailable captures explicit, and adds another exact capture", async () => {
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method, params) => {
    if (method !== "workspaces.contentMemory.list") throw new Error(method);
    const input = params as { cursor?: unknown; selectedIds: string[] };
    return {
      items: input.cursor ? captures.slice(20) : captures.slice(0, 20),
      selected: captures
        .filter((source) => input.selectedIds.includes(source.memoryId) && source.memoryId !== "memory-1")
        .map((source) => (source.memoryId === "memory-0" ? { ...source, capturedAt: 999 } : source)),
      nextCursor: input.cursor
        ? null
        : { capturedAt: captures[19]!.capturedAt, memoryId: captures[19]!.memoryId },
    };
  });
  let current: CapturedSourceSelection | null = { workspaceId: "space", sources: captures.slice(0, 30) };
  function Picker() {
    const [selection, setSelection] = useState(current);
    return (
      <CapturedSourcePicker
        workspaceId="space"
        selection={selection ?? undefined}
        disabled={false}
        onChange={(value) => {
          current = value;
          setSelection(value);
        }}
      />
    );
  }
  await act(async () => root.render(<Picker />));
  expect(invoke).not.toHaveBeenCalled();
  await act(async () =>
    host.querySelector<HTMLButtonElement>('[aria-label="Saved article sources"]')!.click(),
  );
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
  const dialog = document.querySelector("dialog")!;
  expect(dialog.querySelector('[aria-label="Selected captured articles"]')?.textContent).toContain("Changed");
  expect(dialog.querySelector('[aria-label="Selected captured articles"]')?.textContent).toContain(
    "Unavailable",
  );
  expect(dialog.querySelectorAll('[aria-label="Available captured articles"] input')).toHaveLength(20);
  await act(async () => button("Next page", dialog).click());
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
  const choice = [...dialog.querySelectorAll("label")].find((row) =>
    row.textContent?.includes("Article 30"),
  )!;
  await act(async () => choice.querySelector<HTMLInputElement>("input")!.click());
  expect(current!.sources).toEqual(captures.slice(0, 31));
  expect(
    RunsStartParams.parse({ goal: "Compare the captures", contextMemoryRefs: current!.sources })
      .contextMemoryRefs,
  ).toHaveLength(31);
  expect(invoke.mock.calls.every(([method]) => method === "workspaces.contentMemory.list")).toBe(true);
});
