// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { TabRecord } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { normalizePages } from "../store/pages";
import { executeCommand } from "../commands";
import { CommandBar } from "./CommandBar";
import { StartPage } from "./StartPage";

const initial = useStore.getState(),
  originalPrivate = bridge.privateMode,
  originalKind = bridge.windowKind;
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const navigate = vi.fn();
const url = "http://127.0.0.1:4810/records";
function tab(pageId: string): TabRecord {
  return {
    pageId,
    windowId: bridge.windowId,
    windowKind: "private",
    url: "about:blank",
    title: "New tab",
    loading: false,
    muted: false,
    audible: false,
    canGoBack: false,
    canGoForward: false,
    popup: false,
    crashed: false,
    runtimeOwned: false,
    generation: 0,
    createdAt: 1,
    lastActiveAt: 1,
  };
}
function Harness({ home = false }: { home?: boolean }) {
  return (
    <>
      <CommandBar compact />
      {home && <StartPage />}
    </>
  );
}
async function render(home = false) {
  await act(async () => root.render(<Harness home={home} />));
}
const address = () => host.querySelector<HTMLInputElement>('.cmdbar.compact input[role="combobox"]')!;
async function typeAddress() {
  const input = address();
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, url);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  Element.prototype.scrollIntoView ??= () => {};
  vi.spyOn(bridge, "focusShell").mockResolvedValue(undefined);
  vi.spyOn(bridge, "invoke").mockResolvedValue({} as never);
  bridge.privateMode = true;
  bridge.windowKind = "private";
  navigate.mockReset().mockResolvedValue(undefined);
  useStore.setState(
    {
      ...initial,
      settings: {},
      connected: false,
      focusRequest: 0,
      focusSlot: "toolbar",
      activePageId: null,
      pages: normalizePages([]),
      catalogVersion: 0,
      runs: [],
      toasts: [],
      navigatePage: navigate,
    },
    true,
  );
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  bridge.privateMode = originalPrivate;
  bridge.windowKind = originalKind;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("keeps immediate Cmd-L typing through the first native catalog and clears it on a real tab switch", async () => {
  await render();
  await act(async () => {
    await executeCommand("open-address");
  });
  const input = address();
  expect(document.activeElement).toBe(input);
  await typeAddress();
  await act(async () =>
    useStore
      .getState()
      .syncTabsSnapshot({
        version: 1,
        tabs: [tab("first")],
        windows: [{ windowId: bridge.windowId, order: ["first"], activePageId: "first" }],
      }),
  );
  expect(address()).toBe(input);
  expect(input.value).toBe(url);
  expect(document.activeElement).toBe(input);
  await act(async () => input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
  expect(navigate).toHaveBeenCalledExactlyOnceWith("first", url);
  await act(async () => {
    await executeCommand("open-address");
  });
  await typeAddress();
  await act(async () =>
    useStore
      .getState()
      .syncTabsSnapshot({
        version: 2,
        tabs: [tab("first"), tab("second")],
        windows: [{ windowId: bridge.windowId, order: ["first", "second"], activePageId: "second" }],
      }),
  );
  expect(input.value).toBe("");
  expect(document.activeElement).not.toBe(input);
  expect(navigate).toHaveBeenCalledTimes(1);
});
it("lets a prior Cmd-L keep its address draft when Private Home mounts afterward", async () => {
  await render();
  await act(async () => {
    await executeCommand("open-address");
  });
  await typeAddress();
  const input = address(),
    request = useStore.getState().focusRequest;
  await render(true);
  expect(useStore.getState().focusRequest).toBe(request);
  expect(useStore.getState().focusSlot).toBe("toolbar");
  expect(address()).toBe(input);
  expect(input.value).toBe(url);
  expect(document.activeElement).toBe(input);
});
it("still focuses fresh Private Home when no human focus request precedes it", async () => {
  await render(true);
  expect(useStore.getState().focusSlot).toBe("hero");
  expect(document.activeElement).toBe(host.querySelector(".cmdbar.hero input"));
});
