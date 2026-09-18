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
  return page;
}

describe("EngineView", () => {
  it("paints the engine display list, not a PNG", async () => {
    await mount();
    const canvas = host!.querySelector("canvas.engine-view") as HTMLCanvasElement;
    expect(canvas).toBeTruthy();
    expect(canvas.getAttribute("data-transport")).toBe("scene");
    expect(canvas.getAttribute("aria-label")).toBe("CNN");
    expect(mockedCall).toHaveBeenCalledWith("pages.scene", { pageId: "page-1" });
    expect(mockedCall).not.toHaveBeenCalledWith("pages.capture", expect.anything());
  });

  it("maps a click onto clickPoint in page pixels", async () => {
    const page = await mount();
    const canvas = host!.querySelector("canvas.engine-view") as HTMLCanvasElement;
    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
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
      canvas.dispatchEvent(new MouseEvent("click", { clientX: 50, clientY: 40, bubbles: true }));
    });
    expect(mockedCall).toHaveBeenCalledWith("pages.engineInput", {
      pageId: page.pageId,
      type: "click",
      x: 50,
      y: 40,
    });
  });

  it("forwards a key so a human can edit a field after takeover", async () => {
    const page = await mount(makePage(0, { backend: "vector-engine", title: "CNN", controller: "human" }));
    const canvas = host!.querySelector("canvas.engine-view") as HTMLCanvasElement;
    expect(canvas.tabIndex).toBe(0);
    await act(async () => {
      canvas.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
    });
    expect(mockedCall).toHaveBeenCalledWith("pages.engineInput", {
      pageId: page.pageId,
      type: "key",
      key: "a",
    });
  });

  it("forwards IME composition onto the shared authority path", async () => {
    const page = await mount(makePage(0, { backend: "vector-engine", title: "CNN", controller: "human" }));
    const canvas = host!.querySelector("canvas.engine-view") as HTMLCanvasElement;
    await act(async () => {
      canvas.dispatchEvent(new CompositionEvent("compositionupdate", { data: "ni", bubbles: true }));
    });
    expect(mockedCall).toHaveBeenCalledWith("pages.engineInput", {
      pageId: page.pageId,
      type: "imePreedit",
      text: "ni",
    });
    await act(async () => {
      canvas.dispatchEvent(new CompositionEvent("compositionend", { data: "你", bubbles: true }));
    });
    expect(mockedCall).toHaveBeenCalledWith("pages.engineInput", {
      pageId: page.pageId,
      type: "ime",
      text: "你",
    });
  });

  it("forwards Ctrl+A as a selection range", async () => {
    const page = await mount(makePage(0, { backend: "vector-engine", title: "CNN", controller: "human" }));
    const canvas = host!.querySelector("canvas.engine-view") as HTMLCanvasElement;
    await act(async () => {
      canvas.dispatchEvent(new KeyboardEvent("keydown", { key: "a", ctrlKey: true, bubbles: true }));
    });
    expect(mockedCall).toHaveBeenCalledWith("pages.engineInput", {
      pageId: page.pageId,
      type: "select",
      start: 0,
      end: 1_000_000,
    });
  });

  it("falls back to a screenshot when the engine has no display list", async () => {
    mockedCall.mockImplementation(async (method) => {
      if (method === "pages.scene") throw new Error("no scene");
      if (method === "pages.capture") return { dataUrl: PNG, width: 100, height: 80, scale: 1 };
      return {};
    });
    await mount();
    const img = host!.querySelector("img.engine-view") as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute("data-transport")).toBe("png");
    expect(img.src).toBe(PNG);
  });
});
