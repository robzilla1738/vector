// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { call } from "../store";
import { makePage } from "../mock/fixtures";
import { EngineView } from "./EngineView";

vi.mock("../store", () => ({ call: vi.fn() }));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mockedCall = vi.mocked(call);
const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const SCENE = {
  kind: "displayList",
  transport: "scene",
  png: false,
  width: 100,
  height: 80,
  itemCount: 2,
  items: [
    { kind: "rect", x: 0, y: 0, w: 100, h: 80, color: "rgb(255,255,255)" },
    { kind: "text", x: 8, y: 20, text: "hi", size: 16, color: "rgb(0,0,0)" },
  ],
};

let root: Root | null = null;
let host: HTMLDivElement | null = null;

afterEach(() => {
  if (root) act(() => root!.unmount());
  host?.remove();
  root = null;
  host = null;
});

beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never;
  mockedCall.mockReset();
  mockedCall.mockImplementation(async (method) => {
    if (method === "pages.scene") return SCENE;
    if (method === "pages.capture") return { dataUrl: PNG, width: 100, height: 80, scale: 1 };
    if (method === "pages.observe") return { content: { elements: [{ name: "Send", role: "button", tag: "button" }] } };
    return {};
  });
});

async function mount(page = makePage(0, { backend: "vector-engine", title: "CNN" })) {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root!.render(<EngineView page={page} />);
  });
  await act(async () => {});
  return page;
}

describe("EngineView", () => {
  it("paints the engine display list, not a PNG", async () => {
    await mount();
    const view = host!.querySelector(".engine-view") as HTMLElement;
    expect(view).toBeTruthy();
    expect(view.getAttribute("data-transport")).toBe("scene");
    expect(view.querySelector("canvas.engine-view-scene")).toBeTruthy();
    expect(host!.querySelector("textarea.engine-view-ime")?.getAttribute("aria-label")).toBe("CNN");
    expect(mockedCall).toHaveBeenCalledWith("pages.scene", { pageId: "page-1" });
    expect(mockedCall).not.toHaveBeenCalledWith("pages.capture", expect.anything());
  });

  it("maps a click onto clickPoint in page pixels", async () => {
    const page = await mount();
    const view = host!.querySelector(".engine-view") as HTMLElement;
    vi.spyOn(view, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 100,
      bottom: 80,
      width: 100,
      height: 80,
      toJSON: () => ({}),
    });
    await act(async () => {
      view.dispatchEvent(new MouseEvent("click", { clientX: 50, clientY: 40, bubbles: true }));
    });
    expect(mockedCall).toHaveBeenCalledWith("pages.engineInput", {
      pageId: page.pageId,
      type: "click",
      x: 50,
      y: 40,
    });
  });

  it("forwards a click while the agent holds the page so takeover can fire", async () => {
    const page = await mount(makePage(0, { backend: "vector-engine", title: "CNN", controller: "agent" }));
    const view = host!.querySelector(".engine-view") as HTMLElement;
    vi.spyOn(view, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 100,
      bottom: 80,
      width: 100,
      height: 80,
      toJSON: () => ({}),
    });
    await act(async () => {
      view.dispatchEvent(new MouseEvent("click", { clientX: 10, clientY: 10, bubbles: true }));
    });
    expect(mockedCall).toHaveBeenCalledWith("pages.engineInput", {
      pageId: page.pageId,
      type: "click",
      x: 10,
      y: 10,
    });
  });

  it("forwards wheel scrolling on the shared authority path", async () => {
    const page = await mount(makePage(0, { backend: "vector-engine", title: "CNN", controller: "human" }));
    const view = host!.querySelector(".engine-view") as HTMLElement;
    await act(async () => {
      view.dispatchEvent(new WheelEvent("wheel", { deltaY: 80, bubbles: true, cancelable: true }));
    });
    expect(mockedCall).toHaveBeenCalledWith("pages.engineInput", {
      pageId: page.pageId,
      type: "scroll",
      direction: "down",
      amount: 80,
    });
  });

  it("forwards a key so a human can edit a field after takeover", async () => {
    const page = await mount(makePage(0, { backend: "vector-engine", title: "CNN", controller: "human" }));
    const ime = host!.querySelector("textarea.engine-view-ime") as HTMLTextAreaElement;
    expect(ime.tabIndex).toBe(0);
    await act(async () => {
      ime.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
    });
    expect(mockedCall).toHaveBeenCalledWith("pages.engineInput", {
      pageId: page.pageId,
      type: "key",
      key: "a",
    });
  });

  it("forwards IME composition from the textarea host", async () => {
    const page = await mount(makePage(0, { backend: "vector-engine", title: "CNN", controller: "human" }));
    const ime = host!.querySelector("textarea.engine-view-ime") as HTMLTextAreaElement;
    await act(async () => {
      ime.dispatchEvent(new CompositionEvent("compositionupdate", { data: "ni", bubbles: true }));
    });
    expect(mockedCall).toHaveBeenCalledWith("pages.engineInput", {
      pageId: page.pageId,
      type: "imePreedit",
      text: "ni",
    });
    await act(async () => {
      ime.dispatchEvent(new CompositionEvent("compositionend", { data: "你", bubbles: true }));
    });
    expect(mockedCall).toHaveBeenCalledWith("pages.engineInput", {
      pageId: page.pageId,
      type: "ime",
      text: "你",
    });
  });

  it("forwards Ctrl+A as a selection range", async () => {
    const page = await mount(makePage(0, { backend: "vector-engine", title: "CNN", controller: "human" }));
    const ime = host!.querySelector("textarea.engine-view-ime") as HTMLTextAreaElement;
    await act(async () => {
      ime.dispatchEvent(new KeyboardEvent("keydown", { key: "a", ctrlKey: true, bubbles: true }));
    });
    expect(mockedCall).toHaveBeenCalledWith("pages.engineInput", {
      pageId: page.pageId,
      type: "select",
      start: 0,
      end: 1_000_000,
    });
  });

  it("exposes named page controls as AccessKit actions on the shared path", async () => {
    const page = await mount();
    const btn = host!.querySelector("[data-ax-name='Send']") as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(host!.querySelector("[data-testid=engine-view-ax]")?.getAttribute("aria-label")).toBe("Page");
    await act(async () => {
      btn.click();
    });
    expect(mockedCall).toHaveBeenCalledWith("pages.engineInput", {
      pageId: page.pageId,
      type: "accessKitAction",
      name: "Send",
    });
  });

  it("resizes the engine viewport when the display scale changes", async () => {
    const listeners: Array<() => void> = [];
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      addEventListener: (_: string, fn: () => void) => listeners.push(fn),
      removeEventListener: () => {},
    })) as typeof window.matchMedia;
    await mount();
    const view = host!.querySelector(".engine-view") as HTMLElement;
    vi.spyOn(view, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 200,
      bottom: 160,
      width: 200,
      height: 160,
      toJSON: () => ({}),
    });
    await act(async () => {
      listeners[0]?.();
    });
    expect(mockedCall).toHaveBeenCalledWith("pages.engineInput", {
      pageId: "page-1",
      type: "resize",
      width: 200,
      height: 160,
    });
  });

  it("falls back to a screenshot when the engine has no display list", async () => {
    mockedCall.mockImplementation(async (method) => {
      if (method === "pages.scene") throw new Error("no scene");
      if (method === "pages.capture") return { dataUrl: PNG, width: 100, height: 80, scale: 1 };
      if (method === "pages.observe") return { content: { elements: [] } };
      return {};
    });
    await mount();
    const view = host!.querySelector(".engine-view") as HTMLElement;
    expect(view.getAttribute("data-transport")).toBe("png");
    const img = view.querySelector("img.engine-view-scene") as HTMLImageElement;
    expect(img.src).toBe(PNG);
    expect(view.querySelector("textarea.engine-view-ime")).toBeTruthy();
  });
});
