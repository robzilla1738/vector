import { expect, it } from "vitest";
import type { PageQuickAction, PageTarget } from "@aux/contracts";
import {
  BROWSER_SOURCES_PREFIX,
  browserSourcesEntryChange,
  readBrowserSources,
  sourceRef,
  sourceStatus,
  writeBrowserSources,
} from "./browser-context-sources";
import { pageActionSource } from "./page-action-context";

function storageFixture() {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    key: (index: number) => [...values.keys()][index] ?? null,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
}

const page = {
  pageId: "tab-a",
  url: "https://example.test/first",
  title: "First",
  documentEpoch: 2,
  sessionId: "profile-one",
  ownedByRuntime: false,
  viewStatus: "visible",
} as PageTarget;

it("keeps selected live-tab identities across restart and rejects malformed entries", () => {
  const storage = storageFixture();
  const ref = sourceRef(page);
  writeBrowserSources(storage, "chat:research", [ref]);
  const restored = readBrowserSources(storage);
  expect(restored).toEqual({ "chat:research": [ref] });
  expect(
    browserSourcesEntryChange(
      `${BROWSER_SOURCES_PREFIX}chat:research`,
      storage.getItem(`${BROWSER_SOURCES_PREFIX}chat:research`),
    ),
  ).toEqual({ key: "chat:research", sources: [ref] });
  expect(sourceStatus(restored["chat:research"]![0]!, [page])).toBe("current");
  expect(sourceStatus(ref, [{ ...page, documentEpoch: 3 }])).toBe("changed");
  expect(sourceStatus(ref, [{ ...page, sessionId: "other-profile" }])).toBe("changed");
  expect(sourceStatus(ref, [])).toBe("missing");
  storage.setItem(
    `${BROWSER_SOURCES_PREFIX}chat:bad`,
    JSON.stringify({ version: 1, sources: [{ ...ref, documentEpoch: "invalid" }] }),
  );
  expect(readBrowserSources(storage)).toEqual({ "chat:research": [ref] });
  expect(() => writeBrowserSources(storage, "chat:research", [ref, ref])).toThrow();
  const collection = Array.from({ length: 30 }, (_, index) => ({ ...ref, pageId: `tab-${index}` }));
  writeBrowserSources(storage, "chat:research", collection);
  expect(readBrowserSources(storage)["chat:research"]).toEqual(collection);
  writeBrowserSources(storage, "chat:research", []);
  expect(readBrowserSources(storage)).toEqual({});
});

it("pins a page action to its original top-level document and profile", () => {
  const action = {
    pageId: page.pageId,
    url: "https://frame.example.test/",
    topUrl: page.url,
    capturedAt: 1000,
    title: page.title,
    action: "ask",
    selection: "Selected text",
    truncated: false,
  } satisfies PageQuickAction;
  const ref = pageActionSource(action, [page]);
  expect(ref).toEqual(sourceRef(page, action.capturedAt));
  expect(pageActionSource(action, [{ ...page, url: "https://example.test/next" }])).toBeNull();
  expect(pageActionSource(action, [{ ...page, loading: true }])).toBeNull();
  expect(pageActionSource(action, [{ ...page, ownedByRuntime: true }])).toBeNull();
  expect(sourceStatus(ref!, [{ ...page, sessionId: "profile-two" }])).toBe("changed");
});
