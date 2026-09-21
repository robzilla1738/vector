import { EventEmitter } from "node:events";
import type { WebContents } from "electron";
import { afterEach, expect, it, vi } from "vitest";
import { PageFinder } from "../../apps/desktop/main/page-find.js";

function page() {
  let id = 0;
  const events = new EventEmitter();
  return Object.assign(events, {
    isDestroyed: () => false,
    findInPage: vi.fn(() => ++id),
    stopFindInPage: vi.fn(),
    executeJavaScript: vi.fn(async () => 4),
  });
}
const options = { forward: true, findNext: false, visible: true };
afterEach(() => vi.useRealTimers());

it("steps within Chromium's existing search session and ignores other request results", async () => {
  const finder = new PageFinder(), contents = page(), wc = contents as unknown as WebContents;
  const initial = finder.find(wc, "report", options);
  expect(contents.findInPage).toHaveBeenLastCalledWith("report", { forward: true, findNext: true });
  contents.emit("found-in-page", {}, { requestId: 0, matches: 99, finalUpdate: true });
  contents.emit("found-in-page", {}, { requestId: 1, matches: 3, activeMatchOrdinal: 1, finalUpdate: true });
  expect(await initial).toEqual({ matches: 3, activeMatch: 1 });
  const next = finder.find(wc, "report", { ...options, findNext: true });
  expect(contents.findInPage).toHaveBeenLastCalledWith("report", { forward: true, findNext: false });
  contents.emit("found-in-page", {}, { requestId: 2, matches: 3, activeMatchOrdinal: 2, finalUpdate: true });
  expect(await next).toEqual({ matches: 3, activeMatch: 2 });
  expect(contents.eventNames()).toEqual([]);
});

it("settles superseded searches and cleans listeners on navigation and stop", async () => {
  const finder = new PageFinder(), contents = page(), wc = contents as unknown as WebContents;
  const first = finder.find(wc, "report", options);
  const second = finder.find(wc, "updated", options);
  expect(await first).toEqual({ matches: 0 });
  contents.emit("did-start-navigation", {}, "https://example.test", false, true);
  expect(await second).toEqual({ matches: 0 });
  const third = finder.find(wc, "next", options);
  finder.stop(wc, "keep");
  expect(await third).toEqual({ matches: 0 });
  expect(contents.stopFindInPage).toHaveBeenLastCalledWith("keepSelection");
  await finder.find(wc, "", options);
  expect(contents.stopFindInPage).toHaveBeenLastCalledWith("clearSelection");
  expect(contents.eventNames()).toEqual([]);
});

it("returns a count without inventing a highlighted match if Chromium does not respond", async () => {
  vi.useFakeTimers();
  const finder = new PageFinder(), contents = page();
  const result = finder.find(contents as unknown as WebContents, "report", options);
  await vi.advanceTimersByTimeAsync(1200);
  expect(await result).toEqual({ matches: 4 });
  expect(contents.eventNames()).toEqual([]);
});
