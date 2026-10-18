// @vitest-environment jsdom
import { act, useRef } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { HostEventPayload, PageTarget } from "@aux/contracts";
import { bridge } from "./bridge";
import { useStore } from "./store";
import { normalizePages } from "./store/pages";
import { emptyLayout } from "./workspace";
import { useShellShortcuts } from "./app/use-shell-shortcuts";
import { TabSwitcher } from "./components/TabSwitcher";
import { cycleTabPreview, finishTabPreview } from "./tab-switcher-state";
import { Dialog } from "./ui/dialog";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
let activate: ReturnType<typeof vi.fn>;
let nativeShortcut: ((event: HostEventPayload<"onShortcut">) => void) | undefined;
const originalActivate = useStore.getState().activate;
const tabs = ["one", "two", "three"].map((pageId, index) => ({
  pageId,
  title: pageId,
  url: `https://example.test/${pageId}`,
  windowId: bridge.windowId,
  ownedByRuntime: false,
  viewStatus: "visible",
  lastActiveAt: [30, 10, 20][index],
  documentEpoch: 1,
})) as PageTarget[];
function Harness({ interrupt = false }: { interrupt?: boolean }) {
  useShellShortcuts(useRef<HTMLInputElement>(null));
  return (
    <>
      <TabSwitcher />
      {interrupt && (
        <Dialog label="New confirmation" onClose={() => {}}>
          <button type="button">Review request</button>
        </Dialog>
      )}
    </>
  );
}
beforeEach(async () => {
  vi.spyOn(bridge, "onShortcut").mockImplementation((callback) => {
    nativeShortcut = callback;
    return () => {
      nativeShortcut = undefined;
    };
  });
  activate = vi.fn().mockResolvedValue(undefined);
  useStore.setState({
    pages: normalizePages(tabs),
    activePageId: "one",
    settings: { tabSwitcherOrder: "recently-used" },
    layout: { ...emptyLayout(), order: tabs.map((tab) => tab.pageId) },
    activate,
    overlay: null,
  });
  vi.spyOn(bridge, "preview").mockResolvedValue(null);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root.render(<Harness />));
});
afterEach(async () => {
  await act(async () => {
    finishTabPreview(false);
    root.unmount();
  });
  host.remove();
  useStore.setState({ activate: originalActivate });
  vi.restoreAllMocks();
});
const selected = () => document.querySelector('[role="option"][aria-selected="true"]')?.getAttribute("title");
const key = async (type: "keydown" | "keyup", value: string, flags = {}) => {
  await act(async () =>
    window.dispatchEvent(new KeyboardEvent(type, { key: value, bubbles: true, cancelable: true, ...flags })),
  );
};

const nativeTab = (backward = false) =>
  nativeShortcut!({
    commandId: backward ? "tab-previous" : "tab-next",
    key: "Tab",
    ctrl: true,
    shift: backward,
    meta: false,
    alt: false,
  });
const nativeControlRelease = () =>
  nativeShortcut!({
    key: "Control",
    ctrl: false,
    meta: false,
    shift: false,
    alt: false,
  });

it("commits a native Control release once even when its DOM keyup also arrives", async () => {
  await act(async () => nativeTab());
  await act(async () => nativeControlRelease());
  expect(activate).toHaveBeenCalledExactlyOnceWith("three");
  expect(document.querySelector('[aria-label="Switch tabs"]')).toBeNull();
  await key("keyup", "Control");
  await act(async () => nativeControlRelease());
  expect(activate).toHaveBeenCalledTimes(1);
});

it("does not treat another command or a held Control event as preview release", async () => {
  await act(async () => nativeTab());
  await act(async () =>
    nativeShortcut!({ key: "Control", ctrl: true, meta: false, shift: false, alt: false }),
  );
  await act(async () =>
    nativeShortcut!({
      key: "Control",
      ctrl: false,
      meta: false,
      shift: false,
      alt: false,
      commandId: "not-a-release",
    }),
  );
  expect(activate).not.toHaveBeenCalled();
  expect(selected()).toBe("three");
  await act(async () => nativeControlRelease());
  expect(activate).toHaveBeenCalledExactlyOnceWith("three");
});

it("ignores a native release after the preview loses window focus", async () => {
  await act(async () => nativeTab());
  await act(async () => window.dispatchEvent(new Event("blur")));
  await act(async () => nativeControlRelease());
  expect(activate).not.toHaveBeenCalled();
  expect(document.querySelector('[aria-label="Switch tabs"]')).toBeNull();
});

it("commits a native-accelerator preview exactly once on the original Control release", async () => {
  await act(async () => nativeTab());
  expect(selected()).toBe("three");
  expect(activate).not.toHaveBeenCalled();
  await key("keyup", "Tab", { ctrlKey: true });
  await key("keyup", "Control", { code: "ControlLeft", ctrlKey: true });
  expect(activate).not.toHaveBeenCalled();
  await key("keyup", "Control", { code: "ControlRight", ctrlKey: false });
  expect(activate).toHaveBeenCalledExactlyOnceWith("three");
  expect(document.querySelector('[aria-label="Switch tabs"]')).toBeNull();
  await key("keyup", "Control");
  expect(activate).toHaveBeenCalledTimes(1);
});

it("cancels native-accelerator preview with Escape before Control release", async () => {
  await act(async () => nativeTab());
  await act(async () =>
    document
      .querySelector('[aria-label="Switch tabs"]')!
      .dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })),
  );
  await act(async () => nativeControlRelease());
  await key("keyup", "Control");
  expect(activate).not.toHaveBeenCalled();
  expect(document.querySelector('[aria-label="Switch tabs"]')).toBeNull();
});

it("commits a fast native-accelerator tap before its preview modal mounts", async () => {
  await act(async () => {
    nativeTab();
    expect(document.querySelector('[aria-label="Switch tabs"]')).toBeNull();
    window.dispatchEvent(new KeyboardEvent("keyup", { key: "Control", bubbles: true }));
  });
  expect(activate).toHaveBeenCalledExactlyOnceWith("three");
  expect(document.querySelector('[aria-label="Switch tabs"]')).toBeNull();
});
it("commits native preview through the browser command while the runtime is unavailable", async () => {
  const invoke = vi.spyOn(bridge, "invoke").mockRejectedValue(new Error("Runtime unavailable"));
  const command = vi.spyOn(bridge, "tabCommand").mockResolvedValue({
    commandId: "native-activate",
    status: "applied",
    catalogVersion: 1,
    pageId: "three",
  });
  useStore.setState({ connected: false, pendingRestoreIds: [], activate: originalActivate });
  await act(async () => nativeTab());
  await act(async () => nativeControlRelease());
  expect(command).toHaveBeenCalledExactlyOnceWith({ kind: "activate", pageId: "three" }, undefined);
  expect(useStore.getState().activePageId).toBe("three");
  expect(invoke).not.toHaveBeenCalled();
});

it("previews one stable MRU sequence and activates only on Control release", async () => {
  await key("keydown", "Tab", { ctrlKey: true });
  expect(selected()).toBe("three");
  expect(activate).not.toHaveBeenCalled();
  await key("keydown", "Tab", { ctrlKey: true });
  expect(selected()).toBe("two");
  expect(activate).not.toHaveBeenCalled();
  await key("keydown", "Tab", { ctrlKey: true, shiftKey: true });
  expect(selected()).toBe("three");
  await key("keyup", "Control");
  expect(activate).toHaveBeenCalledExactlyOnceWith("three");
  expect(document.querySelector('[aria-label="Switch tabs"]')).toBeNull();
});

it("keeps previewing while another Control key remains held", async () => {
  await key("keydown", "Tab", { ctrlKey: true });
  await key("keyup", "Control", { code: "ControlLeft", location: 1, ctrlKey: true });
  expect(selected()).toBe("three");
  expect(activate).not.toHaveBeenCalled();
  await key("keydown", "Tab", { ctrlKey: true });
  expect(selected()).toBe("two");
  await key("keyup", "Control", { code: "ControlRight", location: 2, ctrlKey: false });
  expect(activate).toHaveBeenCalledExactlyOnceWith("two");
  expect(document.querySelector('[aria-label="Switch tabs"]')).toBeNull();
});

it("commits a fast tap before its modal mounts when the original modal owner is unchanged", async () => {
  await act(async () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", ctrlKey: true, bubbles: true }));
    expect(document.querySelector('[aria-label="Switch tabs"]')).toBeNull();
    window.dispatchEvent(new KeyboardEvent("keyup", { key: "Control", bubbles: true }));
  });
  expect(activate).toHaveBeenCalledExactlyOnceWith("three");
  expect(document.querySelector('[aria-label="Switch tabs"]')).toBeNull();
});

it("yields to a newer modal without activating or taking focus from its request", async () => {
  await key("keydown", "Tab", { ctrlKey: true });
  await act(async () => root.render(<Harness interrupt />));
  const request = document.querySelector('[aria-label="New confirmation"]')!;
  const review = request.querySelector("button")!;
  expect(useStore.getState().overlay).toBeNull();
  expect(document.activeElement).toBe(review);
  await key("keyup", "Control");
  expect(activate).not.toHaveBeenCalled();
  expect(document.querySelector('[aria-label="Switch tabs"]')).toBeNull();
  expect(document.querySelector('[aria-label="New confirmation"]')).toBe(request);
  expect(document.activeElement).toBe(review);
});

it("honors sidebar order and lets a pointer select a preview", async () => {
  useStore.setState({ settings: { tabSwitcherOrder: "sidebar" } });
  await act(async () => cycleTabPreview(1));
  expect(selected()).toBe("two");
  await act(async () =>
    (document.querySelector('[role="option"][title="three"]') as HTMLButtonElement).click(),
  );
  expect(activate).toHaveBeenCalledExactlyOnceWith("three");
});

it("cancels without activating after blur or an external tab/Space change", async () => {
  await act(async () => cycleTabPreview(1));
  await act(async () => window.dispatchEvent(new Event("blur")));
  await key("keyup", "Control");
  expect(activate).not.toHaveBeenCalled();
  await act(async () => cycleTabPreview(1));
  await act(async () => useStore.setState({ activePageId: "two" }));
  await key("keyup", "Control");
  expect(activate).not.toHaveBeenCalled();
  await act(async () => cycleTabPreview(1));
  await act(async () =>
    useStore.setState({ layout: { ...useStore.getState().layout, activeSpaceId: "other" } }),
  );
  await key("keyup", "Control");
  expect(activate).not.toHaveBeenCalled();
});

it("reconciles a closed preview and never activates a retired tab", async () => {
  await act(async () => cycleTabPreview(1));
  expect(selected()).toBe("three");
  await act(async () => useStore.setState({ pages: normalizePages(tabs.slice(0, 2)) }));
  expect(selected()).toBe("two");
  await key("keyup", "Control");
  expect(activate).toHaveBeenCalledExactlyOnceWith("two");
});

it("cancels Escape and yields to a newly opened surface", async () => {
  await act(async () => cycleTabPreview(1));
  await act(async () =>
    document
      .querySelector('[aria-label="Switch tabs"]')!
      .dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })),
  );
  await key("keyup", "Control");
  expect(activate).not.toHaveBeenCalled();
  await act(async () => cycleTabPreview(1));
  await act(async () => useStore.setState({ overlay: "settings" }));
  await key("keyup", "Control");
  expect(activate).not.toHaveBeenCalled();
});

it("keeps a preview inside a narrow viewport and restores focus after resizing and cancellation", async () => {
  let width = 500;
  let height = 180;
  let mainRect = new DOMRect(430, 0, 70, 180);
  vi.spyOn(window, "innerWidth", "get").mockImplementation(() => width);
  vi.spyOn(window, "innerHeight", "get").mockImplementation(() => height);
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
    return this.classList.contains("tab-switcher") ? Math.min(596, parseFloat(this.style.maxWidth)) : 0;
  });
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.classList.contains("tab-switcher") ? Math.min(172, parseFloat(this.style.maxHeight)) : 0;
  });
  const main = document.createElement("main");
  main.className = "main-col";
  vi.spyOn(main, "getBoundingClientRect").mockImplementation(() => mainRect);
  const opener = document.createElement("button");
  opener.textContent = "Browse";
  main.append(opener);
  host.append(main);
  opener.focus();

  await key("keydown", "Tab", { ctrlKey: true });
  const panel = document.querySelector<HTMLDialogElement>('[aria-label="Switch tabs"]')!;
  const list = panel.querySelector('[role="listbox"]');
  expect([panel.style.left, panel.style.top, panel.offsetWidth, panel.offsetHeight]).toEqual([
    "332px",
    "8px",
    160,
    164,
  ]);
  expect(document.activeElement).toBe(list);
  expect(selected()).toBe("three");

  width = 900;
  height = 600;
  mainRect = new DOMRect(400, 0, 500, 600);
  await act(async () => window.dispatchEvent(new Event("resize")));
  expect([panel.style.left, panel.style.top, panel.offsetWidth, panel.offsetHeight]).toEqual([
    "416px",
    "214px",
    468,
    172,
  ]);
  expect(document.activeElement).toBe(list);
  expect(selected()).toBe("three");
  await act(async () =>
    panel.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })),
  );
  expect(activate).not.toHaveBeenCalled();
  expect(panel.isConnected).toBe(false);
  expect(document.activeElement).toBe(opener);
});
