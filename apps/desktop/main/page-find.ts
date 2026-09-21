import type { WebContents } from "electron";

type Matches = { matches: number; activeMatch?: number };

/** One cancellable find request per native page, shared by both browser processes. */
export class PageFinder {
  private pending = new Map<WebContents, () => void>();

  stop(contents: WebContents, action: "clear" | "keep" = "clear") {
    this.pending.get(contents)?.();
    if (!contents.isDestroyed()) contents.stopFindInPage(action === "keep" ? "keepSelection" : "clearSelection");
  }

  async find(contents: WebContents, text: string, options: { forward: boolean; findNext: boolean; visible: boolean }): Promise<Matches> {
    this.pending.get(contents)?.();
    if (contents.isDestroyed()) return { matches: 0 };
    if (!text) { this.stop(contents); return { matches: 0 }; }
    const count = () => contents.executeJavaScript(`(() => {
      const query = ${JSON.stringify(text.toLowerCase())};
      const body = document.body?.innerText.toLowerCase() ?? "";
      let matches = 0, offset = 0;
      while ((offset = body.indexOf(query, offset)) !== -1) { matches++; offset += query.length; }
      return matches;
    })()`, true).catch(() => 0);
    if (!options.visible) return { matches: await count() };

    return new Promise((resolve, reject) => {
      let finished = false;
      let requestId = -1;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const cleanup = () => {
        finished = true;
        clearTimeout(timer);
        contents.removeListener("found-in-page", found);
        contents.removeListener("did-start-navigation", navigated);
        contents.removeListener("destroyed", cancel);
        if (this.pending.get(contents) === cancel) this.pending.delete(contents);
      };
      const finish = (result: Matches) => { if (!finished) { cleanup(); resolve(result); } };
      const cancel = () => finish({ matches: 0 });
      const navigated = (_event: unknown, _url: string, _inPlace: boolean, mainFrame: boolean) => { if (mainFrame) cancel(); };
      const found = (_event: unknown, result: { requestId: number; matches: number; activeMatchOrdinal: number; finalUpdate: boolean }) => {
        if (result.requestId === requestId && result.finalUpdate) finish({ matches: result.matches, activeMatch: result.activeMatchOrdinal });
      };
      this.pending.set(contents, cancel);
      contents.on("found-in-page", found);
      contents.on("did-start-navigation", navigated);
      contents.once("destroyed", cancel);
      try {
        // Electron's findNext means start a new session; Aux's means advance a match.
        requestId = contents.findInPage(text, { forward: options.forward, findNext: !options.findNext });
        timer = setTimeout(() => { if (!finished) void count().then(matches => finish({ matches })); }, 1200);
      } catch (error) { cleanup(); reject(error); }
    });
  }
}
