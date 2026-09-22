import type { NativeImage } from "electron";

/** Push JPEG frames of one page until `stop` is called. Captures never overlap. */
export function startPreviewWatch(input: {
  pageId: string;
  capture: () => Promise<NativeImage>;
  send: (frame: { pageId: string; image: string }) => void;
  stopped: () => boolean;
}): () => void {
  let live = true;
  const stop = () => { live = false; };
  void (async () => {
    while (live && !input.stopped()) {
      try {
        const img = await input.capture();
        const size = img.getSize();
        if (live && !input.stopped() && !img.isEmpty() && size.width >= 2 && size.height >= 2) {
          const width = Math.max(320, Math.min(720, size.width));
          const jpeg = img.resize({ width }).toJPEG(72);
          input.send({ pageId: input.pageId, image: `data:image/jpeg;base64,${jpeg.toString("base64")}` });
        }
      } catch {
        /* The page can close between the visibility check and the capture. */
      }
      if (!live || input.stopped()) return;
      await new Promise(resolve => setTimeout(resolve, 160));
    }
  })();
  return stop;
}
