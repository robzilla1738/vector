/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import { nativeImage, type WebContents, type WebFrameMain } from "electron";

/** Attachment ceiling — keep under conversations.images.add's 4.2MB limit. */
const MAX_PNG_BYTES = 3_800_000;
const MAX_DIMENSION = 1600;

export interface CapturedImage {
  dataUrl?: string;
  srcURL?: string;
  altText?: string;
  captureError?: string;
}

interface PerformResult {
  dataUrl?: string;
  srcURL?: string;
  altText?: string;
  error?: string;
}

/** Runs in the frame that produced the menu — finds the image under the click and renders it to PNG. */
export function imageCaptureScript(x: number, y: number) {
  return `(${performImageCapture.toString()})(${JSON.stringify(x)},${JSON.stringify(y)},${MAX_DIMENSION},${MAX_PNG_BYTES})`;
}

function performImageCapture(x: number, y: number, maxDimension: number, maxDataUrlBytes: number): PerformResult {
  const hit = document.elementFromPoint(x, y);
  const img = (hit instanceof HTMLImageElement ? hit : hit?.closest?.("img")) as HTMLImageElement | null;
  if (!img) return { error: "No image was found at that point." };
  const altText = (img.alt || "").trim().slice(0, 600) || undefined;
  const srcURL = /^https?:/.test(img.currentSrc || img.src || "") ? (img.currentSrc || img.src).slice(0, 4096) : undefined;
  if (!img.naturalWidth || !img.naturalHeight) return { error: "That image has not loaded yet.", srcURL, altText };
  try {
    const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return { error: "Aux could not draw that image.", srcURL, altText };
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    if (!dataUrl.startsWith("data:image/png;base64,")) return { error: "Aux could not encode that image.", srcURL, altText };
    if (dataUrl.length > Math.ceil(maxDataUrlBytes * 4 / 3) + 64) return { error: "That image is too large to attach.", srcURL, altText };
    return { dataUrl, srcURL, altText };
  } catch {
    // Cross-origin images without CORS taint the canvas — the caller falls back to a session fetch.
    return { error: "tainted", srcURL, altText };
  }
}

/**
 * Capture the image under (x, y) in `frame` as a bounded PNG data URL.
 * Prefers the in-page canvas (exact pixels, works for blob:/data: sources);
 * falls back to a session fetch when the canvas is tainted or the page refused.
 */
export async function captureImageAt(wc: WebContents, frame: WebFrameMain | undefined, target: { x: number; y: number; srcURL: string }): Promise<CapturedImage> {
  let inPage: PerformResult | undefined;
  const host = frame ?? wc.mainFrame;
  try {
    if (host) inPage = (await host.executeJavaScript(imageCaptureScript(target.x, target.y), true)) as PerformResult | undefined;
  } catch {
    inPage = { error: "The page refused the capture." };
  }
  if (inPage?.dataUrl) return { dataUrl: inPage.dataUrl, srcURL: inPage.srcURL, altText: inPage.altText };

  const error = inPage?.error;
  const srcURL = inPage?.srcURL ?? (/^https?:/.test(target.srcURL) ? target.srcURL.slice(0, 4096) : undefined);
  const altText = inPage?.altText;
  if (!error) return { srcURL, altText, captureError: "The image capture returned no data." };
  if (error !== "tainted") return { srcURL, altText, captureError: error };
  if (!srcURL || !/^https?:/.test(srcURL)) {
    return { srcURL, altText, captureError: "That image is protected and its source cannot be fetched." };
  }
  try {
    const res = await wc.session.fetch(srcURL);
    if (!res.ok) return { srcURL, altText, captureError: `The image request failed (${res.status}).` };
    const buffer = Buffer.from(await res.arrayBuffer());
    let image = nativeImage.createFromBuffer(buffer);
    if (image.isEmpty()) return { srcURL, altText, captureError: "Aux could not decode that image." };
    let png = image.toPNG();
    if (png.length > MAX_PNG_BYTES) {
      const size = image.getSize();
      const scale = Math.min(1, MAX_DIMENSION / Math.max(size.width, size.height, 1)) * Math.sqrt(MAX_PNG_BYTES / png.length);
      image = image.resize({
        width: Math.max(1, Math.floor(size.width * scale)),
        height: Math.max(1, Math.floor(size.height * scale)),
        quality: "good",
      });
      png = image.toPNG();
    }
    if (png.length > MAX_PNG_BYTES) return { srcURL, altText, captureError: "That image is too large to attach." };
    return { dataUrl: `data:image/png;base64,${png.toString("base64")}`, srcURL, altText };
  } catch (cause) {
    return { srcURL, altText, captureError: `The image could not be fetched (${cause instanceof Error ? cause.message : String(cause)}).` };
  }
}
