// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";

const electron = vi.hoisted(() => ({
  nativeImage: {
    createFromBuffer: vi.fn(),
  },
}));
vi.mock("../../apps/desktop/node_modules/electron", () => electron);

import { captureImageAt, imageCaptureScript } from "../../apps/desktop/main/image-capture.js";

function atPoint(element: Element) {
  Object.defineProperty(document, "elementFromPoint", { value: () => element, configurable: true, writable: true });
}

function imageAtPoint(props: { src?: string; alt?: string; naturalWidth?: number; naturalHeight?: number }) {
  const img = document.createElement("img");
  if (props.src) img.src = props.src;
  if (props.alt !== undefined) img.alt = props.alt;
  Object.defineProperty(img, "naturalWidth", { value: props.naturalWidth ?? 800 });
  Object.defineProperty(img, "naturalHeight", { value: props.naturalHeight ?? 600 });
  return img;
}

function stubCanvas(dataUrl: string | (() => string) = "data:image/png;base64,QUJD") {
  const ctx = { drawImage: vi.fn() };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockImplementation(() => (typeof dataUrl === "function" ? dataUrl() : dataUrl));
  return ctx;
}

function runScript(x = 12, y = 34) {
  // oxlint-disable-next-line no-eval — exercising the real injected script.
  return (0, eval)(imageCaptureScript(x, y)) as Record<string, unknown>;
}

beforeEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("imageCaptureScript", () => {
  it("renders the image under the click to a PNG data URL with alt text and source", () => {
    const img = imageAtPoint({ src: "https://site.example/pic.png", alt: "A chart" });
    document.body.appendChild(img);
    atPoint(img);
    const ctx = stubCanvas();
    const result = runScript();
    expect(result.error).toBeUndefined();
    expect(result.dataUrl).toBe("data:image/png;base64,QUJD");
    expect(result.srcURL).toBe("https://site.example/pic.png");
    expect(result.altText).toBe("A chart");
    expect(ctx.drawImage).toHaveBeenCalledOnce();
  });

  it("finds an image when the click lands on a nested overlay element", () => {
    const img = imageAtPoint({ src: "https://site.example/pic.png" });
    const overlay = document.createElement("span");
    img.appendChild(overlay);
    document.body.appendChild(img);
    atPoint(overlay);
    stubCanvas();
    const result = runScript();
    expect(result.dataUrl).toBe("data:image/png;base64,QUJD");
  });

  it("refuses when no image sits under the click", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    atPoint(div);
    const result = runScript();
    expect(result.dataUrl).toBeUndefined();
    expect(result.error).toBe("No image was found at that point.");
  });

  it("refuses an image that has not loaded", () => {
    const img = imageAtPoint({ src: "https://site.example/pic.png", naturalWidth: 0, naturalHeight: 0 });
    document.body.appendChild(img);
    atPoint(img);
    const result = runScript();
    expect(result.dataUrl).toBeUndefined();
    expect(result.error).toBe("That image has not loaded yet.");
    expect(result.srcURL).toBe("https://site.example/pic.png");
  });

  it("reports tainted for cross-origin canvases so the caller can fall back", () => {
    const img = imageAtPoint({ src: "https://other.example/pic.png" });
    document.body.appendChild(img);
    atPoint(img);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockImplementation(() => { throw new DOMException("tainted", "SecurityError"); });
    const result = runScript();
    expect(result.error).toBe("tainted");
    expect(result.srcURL).toBe("https://other.example/pic.png");
  });

  it("refuses an image that encodes larger than the attachment cap", () => {
    const img = imageAtPoint({ src: "https://site.example/huge.png", naturalWidth: 64000, naturalHeight: 64000 });
    document.body.appendChild(img);
    atPoint(img);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockImplementation(() => `data:image/png;base64,${"A".repeat(6_000_000)}`);
    const result = runScript();
    expect(result.dataUrl).toBeUndefined();
    expect(result.error).toBe("That image is too large to attach.");
  });
});

function fakeWebContents(fetchImpl?: (url: string) => Promise<Response>) {
  return {
    mainFrame: { executeJavaScript: vi.fn() },
    session: { fetch: vi.fn(fetchImpl ?? (() => Promise.resolve(new Response(new Uint8Array([137, 80, 78, 71]))))) },
    isDestroyed: () => false,
  };
}

function fakeImage(png: Buffer | (() => Buffer)) {
  const img = {
    isEmpty: () => false,
    getSize: () => ({ width: 1024, height: 768 }),
    toPNG: () => (typeof png === "function" ? png() : png),
    resize: vi.fn((_size: { width: number; height: number; quality?: string }) => img),
  };
  return img;
}

describe("captureImageAt", () => {
  const target = { x: 10, y: 10, srcURL: "https://site.example/pic.png" };

  it("returns the in-page capture when the canvas produces a data URL", async () => {
    const wc = fakeWebContents();
    const frame = { executeJavaScript: vi.fn(async () => ({ dataUrl: "data:image/png;base64,QUJD", srcURL: target.srcURL, altText: "alt" })) };
    const result = await captureImageAt(wc as never, frame as never, target);
    expect(result).toEqual({ dataUrl: "data:image/png;base64,QUJD", srcURL: target.srcURL, altText: "alt" });
    expect(wc.session.fetch).not.toHaveBeenCalled();
  });

  it("falls back to a session fetch when the canvas is tainted", async () => {
    const png = Buffer.from("fake-png");
    electron.nativeImage.createFromBuffer.mockReturnValue(fakeImage(png));
    const wc = fakeWebContents();
    const frame = { executeJavaScript: vi.fn(async () => ({ error: "tainted", srcURL: target.srcURL })) };
    const result = await captureImageAt(wc as never, frame as never, target);
    expect(wc.session.fetch).toHaveBeenCalledWith(target.srcURL);
    expect(result.dataUrl).toBe(`data:image/png;base64,${png.toString("base64")}`);
    expect(result.srcURL).toBe(target.srcURL);
  });

  it("shrinks images that encode over the attachment cap", async () => {
    const big = Buffer.alloc(4_000_000, 7);
    const small = Buffer.from("small-png");
    const inner = fakeImage(small);
    const outer = fakeImage(big);
    outer.resize.mockReturnValue(inner);
    electron.nativeImage.createFromBuffer.mockReturnValue(outer);
    const wc = fakeWebContents();
    const frame = { executeJavaScript: vi.fn(async () => ({ error: "tainted", srcURL: target.srcURL })) };
    const result = await captureImageAt(wc as never, frame as never, target);
    expect(outer.resize).toHaveBeenCalledOnce();
    const args = outer.resize.mock.calls[0]![0];
    expect(args.width).toBeGreaterThan(0);
    expect(args.width).toBeLessThan(1024);
    expect(result.dataUrl).toBe(`data:image/png;base64,${small.toString("base64")}`);
  });

  it("surfaces a capture error when the source cannot be fetched after a taint", async () => {
    const wc = fakeWebContents(() => Promise.resolve(new Response("x", { status: 404 })));
    const frame = { executeJavaScript: vi.fn(async () => ({ error: "tainted", srcURL: target.srcURL })) };
    const result = await captureImageAt(wc as never, frame as never, target);
    expect(result.dataUrl).toBeUndefined();
    expect(result.captureError).toBe("The image request failed (404).");
  });

  it("does not fetch when the in-page capture failed for a real reason", async () => {
    const wc = fakeWebContents();
    const frame = { executeJavaScript: vi.fn(async () => ({ error: "That image has not loaded yet.", srcURL: target.srcURL })) };
    const result = await captureImageAt(wc as never, frame as never, target);
    expect(wc.session.fetch).not.toHaveBeenCalled();
    expect(result.captureError).toBe("That image has not loaded yet.");
  });

  it("reports a protected unfetchable image without calling session.fetch", async () => {
    const wc = fakeWebContents();
    const frame = { executeJavaScript: vi.fn(async () => ({ error: "tainted", srcURL: undefined })) };
    const result = await captureImageAt(wc as never, frame as never, { x: 0, y: 0, srcURL: "blob:https://site.example/uuid" });
    expect(wc.session.fetch).not.toHaveBeenCalled();
    expect(result.captureError).toContain("protected");
  });

  it("keeps the srcURL when the page refused the capture", async () => {
    const wc = fakeWebContents();
    const frame = { executeJavaScript: vi.fn(async () => { throw new Error("denied"); }) };
    const result = await captureImageAt(wc as never, frame as never, target);
    expect(result.dataUrl).toBeUndefined();
    expect(result.captureError).toBe("The page refused the capture.");
    expect(result.srcURL).toBe(target.srcURL);
  });
});
