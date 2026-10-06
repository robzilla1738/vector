import { normalizePages } from "./store/pages";
// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import type { PageTarget } from "@aux/contracts";
import { bridge } from "./bridge";
import { useStore } from "./store";
import { openLocalFile } from "./open-local-file";
const initial = useStore.getState();
afterEach(() => {
  vi.restoreAllMocks();
  useStore.setState(initial, true);
});
it("opens the chosen file separately and preserves newer browsing during the dialog", async () => {
  let choose!: (path: string) => void;
  const picker = vi.spyOn(bridge, "openFile").mockImplementation(
    () =>
      new Promise((resolve) => {
        choose = resolve;
      }),
  );
  const original = { pageId: "original", url: "https://example.com", documentEpoch: 1 } as PageTarget;
  const opened = { pageId: "file", url: "file:///tmp/report%23one.pdf" } as PageTarget;
  const activate = vi.fn();
  const open = vi.fn(async () => {
    useStore.setState({ pages: normalizePages([original, opened]) });
    return opened;
  });
  useStore.setState({
    pages: normalizePages([original]),
    activePageId: original.pageId,
    mode: "focus",
    overlay: null,
    activate,
    openBackgroundTab: open,
    toast: vi.fn(),
  });
  const pending = openLocalFile();
  await openLocalFile();
  expect(picker).toHaveBeenCalledTimes(1);
  useStore.setState({ overlay: "settings" });
  choose("/tmp/report#one.pdf");
  await pending;
  expect(open).toHaveBeenCalledWith("file:///tmp/report%23one.pdf", initial.layout.activeSpaceId, false);
  expect(activate).not.toHaveBeenCalled();
  expect(useStore.getState().overlay).toBe("settings");
  expect(useStore.getState().activePageId).toBe("original");
});
it("does nothing on cancellation and releases the picker after an error", async () => {
  const picker = vi
    .spyOn(bridge, "openFile")
    .mockRejectedValueOnce(new Error("Picker unavailable"))
    .mockResolvedValue(null);
  const open = vi.fn();
  useStore.setState({ openBackgroundTab: open });
  await expect(openLocalFile()).rejects.toThrow("Picker unavailable");
  await openLocalFile();
  expect(picker).toHaveBeenCalledTimes(2);
  expect(open).not.toHaveBeenCalled();
});
