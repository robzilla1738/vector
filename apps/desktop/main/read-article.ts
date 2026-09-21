import type { WebContents } from "electron";
import { readFileSync } from "node:fs";
import { join } from "node:path";

let extractionSource: string | undefined;

/** Extract inert article structure in the page's isolated world, without saving it. */
export async function readArticle(contents: WebContents, available: () => boolean) {
  if (contents.isDestroyed() || !/^https?:\/\//i.test(contents.getURL())) throw new Error("Reader view is available for webpages.");
  let changed = false;
  const invalidate = (_event: unknown, _url: string, _inPlace: boolean, mainFrame: boolean) => { if (mainFrame) changed = true; };
  contents.on("did-start-navigation", invalidate);
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    extractionSource ??= readFileSync(join(import.meta.dirname, "reader-extract.js"), "utf8");
    const article = await Promise.race([
      contents.executeJavaScriptInIsolatedWorld(997, [{ code: extractionSource + ";AuxReader.extractArticle();" }]),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("This page did not respond. Try Reader view again.")), 10000); }),
    ]);
    if (changed || contents.isDestroyed() || !available()) throw new Error("The page changed. Open Reader view again.");
    return article;
  } finally { clearTimeout(timer); contents.removeListener("did-start-navigation", invalidate); }
}
