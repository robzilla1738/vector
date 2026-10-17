import { normalizePages } from "./store/pages";
// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { COMMAND_SURFACE_ACTIONS } from "./command-surface-actions";
import { bridge } from "./bridge";
import { useStore } from "./store";
afterEach(() => vi.restoreAllMocks());
it("preserves the legacy palette action inventory with real registered producer functions", () => {
  expect(Object.keys(COMMAND_SURFACE_ACTIONS).sort()).toEqual(
    [
      "command-tabs",
      "command-observe",
      "command-inline-assist",
      "command-collect-tabs",
      "command-reading-list",
      "command-autofill",
      "command-vault-fill",
      "command-translate",
      "command-show-original",
      "command-bookmarks",
      "command-saved-pages",
      "command-open-live-chrome",
      "command-new-space",
    ].sort(),
  );
});
it("refuses saved personal-info dispatch when there is no current Aux page", async () => {
  useStore.setState({ pages: normalizePages([] as never), activePageId: null } as never);
  const fill = vi.spyOn(bridge, "autofill");
  await expect(COMMAND_SURFACE_ACTIONS["command-autofill"]()).rejects.toThrow("Open an available web page");
  expect(fill).not.toHaveBeenCalled();
});
it("clears a rejected translation's pending state without claiming completion", async () => {
  useStore.setState({
    pages: normalizePages([
      {
        pageId: "page",
        url: "https://example.com",
        backend: "aux",
        title: "Page",
        viewStatus: "live",
        ownedByRuntime: false,
      },
    ] as never),
    activePageId: "page",
  } as never);
  vi.spyOn(bridge, "translatePage").mockRejectedValue(new Error("Native refusal"));
  await expect(COMMAND_SURFACE_ACTIONS["command-translate"]()).rejects.toThrow("Native refusal");
  expect(useStore.getState().translationPending).toBeNull();
});
