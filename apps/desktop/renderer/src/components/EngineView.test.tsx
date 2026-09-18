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

let root: Root | null = null;
let host: HTMLDivElement | null = null;

afterEach(() => {
  if (root) act(() => root!.unmount());
  host?.remove();
  root = null;
  host = null;
});

beforeEach(() => {
  mockedCall.mockReset();
  mockedCall.mockImplementation(async (method) => {
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
  it("paints a software screenshot of the engine page", async () => {
    await mount();
    const img = host!.querySelector("img.engine-view") as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.src).toBe(PNG);
    expect(img.alt).toBe("CNN");
    expect(mockedCall).toHaveBeenCalledWith("pages.capture", { pageId: "page-1" });
  });

  it("maps a click onto clickPoint in page pixels", async () => {
    const page = await mount();
    const img = host!.querySelector("img.engine-view") as HTMLImageElement;
    vi.spyOn(img, "getBoundingClientRect").mockReturnValue({
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
      img.dispatchEvent(new MouseEvent("click", { clientX: 50, clientY: 40, bubbles: true }));
    });
    expect(mockedCall).toHaveBeenCalledWith("pages.engineInput", {
      pageId: page.pageId,
      type: "click",
      x: 50,
      y: 40,
    });
  });
});
