import type { NativeImage, WebContents } from "electron";

const frameWaiters = new WeakMap<WebContents, Set<(image: NativeImage | null) => void>>();

/**
 * The next frame the compositor presents for `wc`, or null after `timeoutMs`.
 * One frame subscription per contents is shared by every waiter, and it ends
 * as soon as a frame lands — a 60fps page never streams bitmaps to main.
 */
export function nextFrame(wc: WebContents, timeoutMs: number): Promise<NativeImage | null> {
  return new Promise(resolve => {
    if (wc.isDestroyed()) return resolve(null);
    let waiters = frameWaiters.get(wc);
    const waiter = (image: NativeImage | null) => { clearTimeout(timer); resolve(image); };
    const timer = setTimeout(() => {
      const current = frameWaiters.get(wc);
      if (!current?.delete(waiter)) return;
      if (!current.size) { frameWaiters.delete(wc); try { wc.endFrameSubscription(); } catch { /* destroyed */ } }
      resolve(null);
    }, timeoutMs);
    if (waiters) { waiters.add(waiter); return; }
    waiters = new Set([waiter]);
    frameWaiters.set(wc, waiters);
    try {
      wc.beginFrameSubscription(false, image => {
        const ready = frameWaiters.get(wc);
        frameWaiters.delete(wc);
        try { wc.endFrameSubscription(); } catch { /* destroyed */ }
        for (const notify of ready ?? []) notify(image);
      });
    } catch {
      frameWaiters.delete(wc);
      waiter(null);
    }
  });
}

/** Downscaled JPEG bytes of a frame, or null for an empty/degenerate image. */
/** A conversation/tab preview frame: half-width JPEG between 320 and 640px. */
export function previewDataUrl(image: NativeImage): string | null {
  const jpeg = previewJpeg(image, Math.max(320, Math.min(640, Math.round(image.getSize().width * 0.5))));
  return jpeg ? `data:image/jpeg;base64,${jpeg.toString("base64")}` : null;
}

export function previewJpeg(image: NativeImage, maxWidth = 720): Buffer | null {
  const size = image.getSize();
  if (image.isEmpty() || size.width < 2 || size.height < 2) return null;
  return (size.width > maxWidth ? image.resize({ width: maxWidth, quality: "good" }) : image).toJPEG(72);
}

/**
 * Stream a page's preview as JPEG bytes: one frame per change, at most every
 * `intervalMs`, identical frames skipped. A page that never repaints costs
 * one capture every two seconds (dropped unless it differs).
 */
export function startPreviewWatch(input: {
  pageId: string;
  contents: WebContents;
  capture: () => Promise<NativeImage>;
  send: (frame: { pageId: string; image: Uint8Array }) => void;
  stopped: () => boolean;
  intervalMs?: number;
}): () => void {
  let live = true;
  let last: Buffer | null = null;
  const stop = () => { live = false; };
  const running = () => live && !input.stopped();
  const deliver = (image: NativeImage | null) => {
    if (!image || !running()) return;
    const jpeg = previewJpeg(image);
    if (!jpeg || (last && last.equals(jpeg))) return;
    last = jpeg;
    input.send({ pageId: input.pageId, image: jpeg });
  };
  void (async () => {
    try { deliver(await input.capture()); } catch { /* The page can close between the visibility check and the capture. */ }
    while (running()) {
      // Hidden-but-held views may not present frames; fall back to a slow capture.
      const frame = await nextFrame(input.contents, 2000);
      try { deliver(frame ?? (running() ? await input.capture() : null)); } catch { /* destroyed mid-encode */ }
      if (!running()) return;
      await new Promise(resolve => setTimeout(resolve, input.intervalMs ?? 250));
    }
  })();
  return stop;
}
