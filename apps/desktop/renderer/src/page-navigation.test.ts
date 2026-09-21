// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import type { PageTarget } from "@vector/contracts";
import { bridge } from "./bridge";
import { useStore } from "./store";
import { emptyLayout } from "./workspace";

afterEach(() => vi.restoreAllMocks());
function setup() {
  const pages = ["first", "second"].map(pageId => ({ pageId, url: "https://example.com/", viewStatus: "visible" } as PageTarget));
  const layout = emptyLayout();
  useStore.setState({ pages, layout: { ...layout, tabSpace: { first: layout.activeSpaceId, second: layout.activeSpaceId } }, activePageId: "first", mode: "conversation", overlay: null });
  vi.spyOn(bridge, "overlay").mockResolvedValue(true);
  return pages;
}
it("reveals a failed destination from a conversation without refocusing it after a newer selection", async () => {
  const pages = setup();
  let fail!: (reason: Error) => void;
  vi.spyOn(bridge, "invoke").mockImplementation(async method => method === "pages.navigate" ? new Promise((_, reject) => { fail = reject; }) : {});
  const navigating = useStore.getState().navigatePage("first", "https://offline.example/");
  await Promise.resolve(); await Promise.resolve();
  expect(useStore.getState().mode).toBe("focus");
  await useStore.getState().activate("second");
  useStore.setState({ pages: [{ ...pages[0]!, navigationError: { url: "https://offline.example/", code: -105, message: "Name not resolved" } }, pages[1]!] });
  fail(new Error("Navigation failed"));
  await navigating;
  expect(useStore.getState().activePageId).toBe("second");
});
it("keeps unexpected navigation failures visible to the caller", async () => {
  setup();
  vi.spyOn(bridge, "invoke").mockImplementation(async method => { if (method === "pages.navigate") throw new Error("Runtime unavailable"); return {}; });
  await expect(useStore.getState().navigatePage("first", "https://example.org/")).rejects.toThrow("Runtime unavailable");
  expect(useStore.getState().mode).toBe("focus");
});
