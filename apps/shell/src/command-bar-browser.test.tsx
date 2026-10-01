// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("./bridge", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./bridge")>()),
  inNativeHost: true,
}));
import { bridge } from "./bridge";
import { CommandBar } from "./components/CommandBar";
import { useStore } from "./store";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= class {
  observe() {}
  disconnect() {}
};
Element.prototype.scrollIntoView ??= () => {};

const host = document.createElement("div");
document.body.append(host);
let root: ReturnType<typeof createRoot>;
afterEach(async () => {
  await act(async () => root.unmount());
  vi.restoreAllMocks();
  host.replaceChildren();
});

it("preserves Chromium order while a scoped tab survives title-and-host dedup", async () => {
  useStore.setState({
    pages: [
      { pageId: "current", url: "https://aux.example", title: "Aux", favicon: "", ownedByRuntime: false },
      {
        pageId: "tab",
        url: "https://example.com/tab",
        title: "Release Notes",
        favicon: "",
        ownedByRuntime: false,
      },
    ],
    activePageId: "current",
    bookmarks: [],
    closedTabs: [],
    runs: [],
    programs: [],
    settings: {},
  } as never);
  vi.spyOn(bridge, "autocomplete").mockResolvedValue([
    { id: "one", type: "history", title: "Release Notes", url: "https://example.com/history" },
    { id: "two", type: "search", title: "Release discussion", url: "https://search.example/?q=release" },
  ]);
  vi.spyOn(bridge, "invoke").mockResolvedValue([] as never);
  root = createRoot(host);
  await act(async () => root.render(<CommandBar />));
  const input = host.querySelector("input")!;
  await act(async () => input.focus());
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "release");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () => new Promise((resolve) => setTimeout(resolve, 20)));
  expect(host.querySelector(".cb-opt.history")?.textContent).toContain("Release Notes");
  expect(host.querySelector(".cb-opt.browser")?.textContent).toContain("Release discussion");
  expect(host.querySelector(".cb-opt.tabs")?.textContent).toContain("Release Notes");
  await act(async () =>
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "2", altKey: true, bubbles: true })),
  );
  expect(host.querySelector(".cb-opt.tabs")?.textContent).toContain("Release Notes");
});

it("opens a search through the current Profile provider", async () => {
  useStore.setState({
    pages: [
      { pageId: "current", url: "https://aux.example", title: "Aux", favicon: "", ownedByRuntime: false },
    ],
    activePageId: "current",
    bookmarks: [],
    closedTabs: [],
    runs: [],
    programs: [],
    settings: {},
  } as never);
  const resolved = vi
    .spyOn(bridge as typeof bridge & { resolveSearch: (query: string) => Promise<string> }, "resolveSearch")
    .mockResolvedValue("https://selected.example/?q=aux+browser");
  const navigate = vi.spyOn(useStore.getState(), "navigatePage").mockResolvedValue(undefined);
  vi.spyOn(bridge, "autocomplete").mockResolvedValue([]);
  vi.spyOn(bridge, "invoke").mockResolvedValue([] as never);
  root = createRoot(host);
  await act(async () => root.render(<CommandBar />));
  const input = host.querySelector("input")!;
  await act(async () => input.focus());
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "aux browser");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () => input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
  expect(resolved).toHaveBeenCalledWith("aux browser");
  expect(navigate).toHaveBeenCalledWith("current", "https://selected.example/?q=aux+browser");
});

it.each(["chrome://version", "https://example.test/path"])(
  "opens %s directly from Home Search",
  async (url) => {
    useStore.setState({
      pages: [{ pageId: "current", url: "about:blank", title: "New Tab", ownedByRuntime: false }],
      activePageId: "current",
      bookmarks: [],
      closedTabs: [],
      runs: [],
      programs: [],
      settings: {},
    } as never);
    const resolved = vi
      .spyOn(bridge as typeof bridge & { resolveSearch: (query: string) => Promise<string> }, "resolveSearch")
      .mockResolvedValue("https://search.example/");
    const navigate = vi.spyOn(useStore.getState(), "navigatePage").mockResolvedValue(undefined);
    vi.spyOn(bridge, "autocomplete").mockResolvedValue([]);
    vi.spyOn(bridge, "invoke").mockResolvedValue([] as never);
    root = createRoot(host);
    await act(async () => root.render(<CommandBar hero />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, url);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
    expect(resolved).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith("current", url);
  },
);
