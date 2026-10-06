// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Download, PageTarget } from "@aux/contracts";
const host = vi.hoisted(() => ({ snapshot: vi.fn(), promote: vi.fn(), downloads: vi.fn(), errors: vi.fn() }));
vi.mock("../../feature-availability", () => ({
  featureAvailable: () => true,
  featureVisible: () => true,
  featureStage: () => "on",
}));
vi.mock("../../bridge", () => ({
  inNativeHost: false,
  inMock: false,
  bridge: {
    windowId: "little",
    windowKind: "little",
    privateMode: false,
    platform: "mac",
    organizationSnapshot: host.snapshot,
    onOrganizationChanged: () => () => {},
    littleWindow: host.promote,
    downloadsSnapshot: host.downloads,
    onDownload: () => () => {},
    onEvent: () => () => {},
  },
}));
vi.mock("../../store", async () => {
  const { create } = await import("zustand");
  const useStore = create(() => ({
    pages: [],
    activePageId: null,
    layout: { spaces: [] },
    downloads: [],
    settings: {},
    overlay: null,
    toasts: [],
    focusCommandBar: vi.fn(),
    setOverlay: vi.fn(),
    toast: vi.fn(),
  }));
  return { useStore, errToast: host.errors, call: vi.fn(), toast: vi.fn(), tabCommand: vi.fn() };
});
vi.mock("../../use-feature", () => ({ featureStage: () => "on", useFeature: () => true }));
// Keep the bar outside this popup regression; command dispatch and feature mounts remain real.
vi.mock("../../components/CommandBar", () => ({ CommandBar: () => <input aria-label="Address" /> }));
import { LittleWindow } from "../../components/LittleWindow";
import { useStore } from "../../store";
import { emptyLayout } from "../../workspace";
import { toOrganizationLayout } from "../../store/organization-layout";
import { littlePanel, toggleLittlePanel } from "./ui";
const button = (name: string) => document.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`)!;
const menu = () => document.querySelector<HTMLDialogElement>('dialog[aria-label="Open in Aux Space"]')!;
function key(node: Element, value: string, shiftKey = false) {
  const event = new KeyboardEvent("keydown", { key: value, shiftKey, bubbles: true, cancelable: true });
  node.dispatchEvent(event);
  return event;
}
function cancel(node: Element) {
  node.dispatchEvent(new Event("cancel", { cancelable: true, bubbles: true }));
}
const layout = () => {
  const value = emptyLayout();
  value.spaces = ["Alpha", "Beta", "Gamma"].map((name, i) => ({
    ...value.spaces[0]!,
    id: `space-${i}`,
    name,
  }));
  return value;
};
const scrollIntoView = HTMLElement.prototype.scrollIntoView;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  HTMLElement.prototype.scrollIntoView = vi.fn();
  host.promote.mockResolvedValue(true);
  host.downloads.mockResolvedValue([]);
  const page = {
    pageId: "live",
    windowId: "little",
    windowKind: "little",
    backend: "aux",
    targetId: "live",
    url: "https://fixture.test/little",
    title: "Little",
    documentEpoch: 1,
    lastRevision: 0,
    viewStatus: "visible",
    controller: "none",
    controllerEpoch: 0,
    ownedByRuntime: false,
    createdAt: 1,
    lastActiveAt: 1,
  } as PageTarget;
  useStore.setState({ pages: [page], activePageId: page.pageId, layout: emptyLayout(), downloads: [] });
});
afterEach(() => {
  HTMLElement.prototype.scrollIntoView = scrollIntoView;
  if (littlePanel()) toggleLittlePanel(littlePanel()!);
  vi.restoreAllMocks();
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});
async function waitForDownloadSearch() {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (document.querySelector('input[aria-label="Search downloads"]')) return;
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
  }
  throw new Error("The real lazy Downloads component did not mount");
}
async function render() {
  const node = document.createElement("div");
  document.body.append(node);
  const root = createRoot(node);
  await act(async () => root.render(<LittleWindow />));
  return async () => {
    await act(async () => root.unmount());
    node.remove();
  };
}
it("focuses asynchronously loaded Spaces, roves with arrows/Home/End, dismisses Escape and Tab to the right control", async () => {
  let finish!: (snapshot: unknown) => void;
  host.snapshot.mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const cleanup = await render();
  try {
    const opener = button("Choose destination Space");
    opener.focus();
    await act(async () => opener.click());
    expect(menu().open).toBe(true);
    expect(menu().textContent).toContain("Loading Spaces");
    await act(async () => finish({ layout: toOrganizationLayout(layout()) }));
    expect(document.activeElement?.textContent).toBe("Alpha");
    await act(async () => {
      key(document.activeElement!, "ArrowDown");
    });
    expect(document.activeElement?.textContent).toBe("Beta");
    await act(async () => {
      key(document.activeElement!, "End");
    });
    expect(document.activeElement?.textContent).toBe("Gamma");
    await act(async () => {
      key(document.activeElement!, "Home");
    });
    expect(document.activeElement?.textContent).toBe("Alpha");
    await act(async () => {
      key(menu(), "Escape");
    });
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(opener);
    await act(async () => opener.click());
    await act(async () => {
      key(menu(), "Tab");
      await Promise.resolve();
    });
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(button("Copy link"));
    await act(async () => opener.click());
    await act(async () => {
      key(menu(), "Tab", true);
      await Promise.resolve();
    });
    expect(document.activeElement?.textContent).toBe("Open in Aux");
    expect(host.errors).not.toHaveBeenCalled();
  } finally {
    await cleanup();
  }
});
it("uses native Cancel and outside dismissal, and selects a real registered Space promotion payload", async () => {
  host.snapshot.mockResolvedValue({ layout: toOrganizationLayout(layout()) });
  const cleanup = await render();
  try {
    const opener = button("Choose destination Space");
    await act(async () => opener.click());
    await act(async () => cancel(menu()));
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(opener);
    await act(async () => opener.click());
    await act(async () =>
      menu().dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: -10, clientY: -10 })),
    );
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(opener);
    await act(async () => opener.click());
    await act(async () => menu().querySelectorAll<HTMLButtonElement>("button")[1]!.click());
    expect(menu()).toBeNull();
    expect(host.promote).toHaveBeenCalledExactlyOnceWith("promote", { spaceId: "space-1" });
    expect(host.errors).not.toHaveBeenCalled();
  } finally {
    await cleanup();
  }
});
it("uses a native Downloads dialog, focuses the lazy scoped search, filters other pages and restores focus for Escape/Cancel/outside dismissal", async () => {
  host.snapshot.mockResolvedValue({ layout: toOrganizationLayout(layout()) });
  const record = (id: string, tabUrl: string) =>
    ({
      id,
      filename: `${id}.txt`,
      tabUrl,
      path: `/tmp/${id}.txt`,
      size: 1,
      state: "completed",
      startedAt: 1,
      canCancel: false,
      canResume: false,
      paused: false,
    }) as Download;
  host.downloads.mockResolvedValue([
    record("this-page", "https://fixture.test/little"),
    record("other-page", "https://fixture.test/main"),
  ]);
  const cleanup = await render();
  const dialog = () =>
    document.querySelector<HTMLDialogElement>('dialog[aria-label="Downloads for this page"]')!;
  try {
    const opener = button("Downloads for this page");
    for (const method of ["Escape", "cancel", "outside"]) {
      await act(async () => opener.click());
      await waitForDownloadSearch();
      expect(dialog().open).toBe(true);
      expect(document.activeElement?.getAttribute("aria-label")).toBe("Search downloads");
      expect(dialog().textContent).toContain("this-page.txt");
      expect(dialog().textContent).not.toContain("other-page.txt");
      if (method === "Escape")
        await act(async () => {
          key(document.activeElement!, "Escape");
        });
      else if (method === "cancel") await act(async () => cancel(dialog()));
      else
        await act(async () =>
          dialog().dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: -10, clientY: -10 })),
        );
      expect(dialog()).toBeNull();
      expect(document.activeElement).toBe(opener);
    }
    expect(host.errors).not.toHaveBeenCalled();
  } finally {
    await cleanup();
  }
});

it("publishes only committed Little selection/epoch revisions and fences a remount", async () => {
  host.snapshot.mockResolvedValue({ layout: toOrganizationLayout(layout()) });
  const cleanup = await render();
  let firstInstance: string | null;
  try {
    const section = document.querySelector<HTMLElement>(".little-page[data-little-stage]")!;
    expect(section).not.toBeNull();
    expect(section.id).not.toBe("stage");
    expect(section.getAttribute("data-stage-dragging")).toBe("false");
    firstInstance = section.getAttribute("data-stage-instance");
    expect(Number(firstInstance)).toBeGreaterThan(0);
    expect(section.getAttribute("data-stage-selection-generation")).toBe("1");
    const original = useStore.getState().pages[0]!;
    await act(async () => useStore.setState({ pages: [{ ...original, title: "Renamed" }] }));
    expect(section.getAttribute("data-stage-selection-generation")).toBe("1");
    await act(async () => useStore.setState({ pages: [{ ...original, documentEpoch: 2 }] }));
    expect(section.getAttribute("data-stage-selection-generation")).toBe("2");
    await act(async () => useStore.setState({ activePageId: null }));
    expect(section.getAttribute("data-stage-selection-generation")).toBe("3");
    await act(async () => useStore.setState({ activePageId: original.pageId }));
    expect(section.getAttribute("data-stage-selection-generation")).toBe("4");
  } finally {
    await cleanup();
  }
  const remount = await render();
  try {
    const section = document.querySelector<HTMLElement>(".little-page[data-little-stage]")!;
    expect(section.getAttribute("data-stage-instance")).not.toBe(firstInstance!);
    expect(section.getAttribute("data-stage-selection-generation")).toBe("1");
  } finally {
    await remount();
  }
});
