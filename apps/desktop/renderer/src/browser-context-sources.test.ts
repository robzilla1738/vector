import { expect, it } from "vitest";
import type { PageTarget } from "@aux/contracts";
import { BROWSER_SOURCES_PREFIX, browserSourcesEntryChange, readBrowserSources, sourceRef, sourceStatus, writeBrowserSources } from "./browser-context-sources";

function storageFixture() {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    key: (index: number) => [...values.keys()][index] ?? null,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
}

const page = { pageId: "tab-a", url: "https://example.test/first", title: "First", documentEpoch: 2,
  sessionId: "profile-one", ownedByRuntime: false, viewStatus: "visible" } as PageTarget;

it("keeps selected live-tab identities across restart and rejects malformed entries", () => {
  const storage = storageFixture();
  const ref = sourceRef(page);
  writeBrowserSources(storage, "chat:research", [ref]);
  const restored = readBrowserSources(storage);
  expect(restored).toEqual({ "chat:research": [ref] });
  expect(browserSourcesEntryChange(`${BROWSER_SOURCES_PREFIX}chat:research`, storage.getItem(`${BROWSER_SOURCES_PREFIX}chat:research`))).toEqual({ key: "chat:research", sources: [ref] });
  expect(sourceStatus(restored["chat:research"]![0]!, [page])).toBe("current");
  expect(sourceStatus(ref, [{ ...page, documentEpoch: 3 }])).toBe("changed");
  expect(sourceStatus(ref, [{ ...page, sessionId: "other-profile" }])).toBe("changed");
  expect(sourceStatus(ref, [])).toBe("missing");
  storage.setItem(`${BROWSER_SOURCES_PREFIX}chat:bad`, JSON.stringify({ version: 1, sources: [{ ...ref, documentEpoch: "invalid" }] }));
  expect(readBrowserSources(storage)).toEqual({ "chat:research": [ref] });
  expect(() => writeBrowserSources(storage, "chat:research", [ref, ref])).toThrow();
  writeBrowserSources(storage, "chat:research", []);
  expect(readBrowserSources(storage)).toEqual({});
});
