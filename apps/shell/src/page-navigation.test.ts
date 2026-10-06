import { normalizePages } from "./store/pages";
// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import type { PageTarget, TabCommand, TabCommandAck } from "@aux/contracts";
import { bridge } from "./bridge";
import { useStore } from "./store";
import { emptyLayout } from "./workspace";

afterEach(() => vi.restoreAllMocks());
const applied = (command: TabCommand): TabCommandAck => ({
  commandId: "",
  status: "applied",
  catalogVersion: 0,
  pageId: "pageId" in command ? command.pageId : undefined,
});
function setup() {
  const pages = ["first", "second"].map(
    (pageId) => ({ pageId, url: "https://example.com/", viewStatus: "visible" }) as PageTarget,
  );
  const layout = emptyLayout();
  useStore.setState({
    pages: normalizePages(pages),
    layout: { ...layout, tabSpace: { first: layout.activeSpaceId, second: layout.activeSpaceId } },
    activePageId: "first",
    mode: "conversation",
    overlay: null,
  });
  vi.spyOn(bridge, "overlay").mockResolvedValue(true);
  return pages;
}
it("reveals a failed destination from a conversation without refocusing it after a newer selection", async () => {
  const pages = setup();
  let fail!: (reason: Error) => void;
  vi.spyOn(bridge, "tabCommand").mockImplementation(async (command) =>
    command.kind === "navigate"
      ? new Promise<TabCommandAck>((_, reject) => {
          fail = reject;
        })
      : applied(command),
  );
  const navigating = useStore.getState().navigatePage("first", "https://offline.example/");
  await Promise.resolve();
  await Promise.resolve();
  expect(useStore.getState().mode).toBe("focus");
  await useStore.getState().activate("second");
  useStore.setState({
    pages: normalizePages([
      {
        ...pages[0]!,
        navigationError: { url: "https://offline.example/", code: -105, message: "Name not resolved" },
      },
      pages[1]!,
    ]),
  });
  fail(new Error("Navigation failed"));
  await navigating;
  expect(useStore.getState().activePageId).toBe("second");
});
it("keeps unexpected navigation failures visible to the caller", async () => {
  setup();
  vi.spyOn(bridge, "tabCommand").mockImplementation(async (command) => {
    if (command.kind === "navigate") throw new Error("Runtime unavailable");
    return applied(command);
  });
  await expect(useStore.getState().navigatePage("first", "https://example.org/")).rejects.toThrow(
    "Runtime unavailable",
  );
  expect(useStore.getState().mode).toBe("focus");
});
