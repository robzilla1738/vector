import { app, dialog, type BaseWindow, type WebContents } from "electron";
import { writeFile, rename, rm } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { randomUUID } from "node:crypto";

const pending = new WeakSet<WebContents>();

function requirePrintable(contents: WebContents, showBlankDocument: boolean) {
  if (contents.isDestroyed() || contents.isCrashed()) throw new Error("This page is unavailable. Reload it before printing.");
  if (contents.getURL() === "about:blank" && !showBlankDocument) throw new Error("Open a page before printing or saving a PDF.");
  if (contents.isLoadingMainFrame()) throw new Error("Wait for this page to finish loading, then try again.");
  if (pending.has(contents)) throw new Error("Printing or PDF export is already in progress for this page.");
}

/** Resolve only when Chromium reports the print outcome, including cancellation. */
export async function printPage(contents: WebContents, showBlankDocument = false): Promise<boolean> {
  requirePrintable(contents, showBlankDocument);
  pending.add(contents);
  try {
    return await new Promise<boolean>((resolve, reject) => {
      const closed = () => { cleanup(); reject(new Error("The page closed before printing finished.")); };
      const cleanup = () => contents.removeListener("destroyed", closed);
      contents.once("destroyed", closed);
      try {
        contents.print({ silent: false }, (success, reason) => {
          cleanup();
          if (success) resolve(true);
          else if (/cancel(?:l)?ed/i.test(reason)) resolve(false);
          else reject(new Error("The page couldn’t be printed. Check the printer and try again."));
        });
      } catch (error) { cleanup(); reject(error); }
    });
  } finally { pending.delete(contents); }
}

/** Both window types capture one document and use the same cancel/error semantics. */
export async function savePagePdf(contents: WebContents, owner: BaseWindow, privateMode = false, showBlankDocument = false): Promise<string | null> {
  requirePrintable(contents, showBlankDocument);
  pending.add(contents);
  let changed = false;
  const navigation = (_event: unknown, _url: string, inPlace: boolean, mainFrame: boolean) => { if (mainFrame && !inPlace) changed = true; };
  contents.on("did-start-navigation", navigation);
  try {
    const title = contents.getTitle().replace(/[\\/:*?"<>|\x00-\x1f]/g, "-").replace(/[. ]+$/g, "").slice(0, 120) || "Aux page";
    const pdf = await contents.printToPDF({ printBackground: true, preferCSSPageSize: true });
    if (changed || contents.isDestroyed() || contents.isCrashed()) throw new Error("The page changed while preparing the PDF. Try again on the page you want to save.");
    contents.removeListener("did-start-navigation", navigation);
    const result = await dialog.showSaveDialog(owner, {
      title: "Save Page as PDF",
      ...(privateMode ? { message: "This file remains on your Mac after the private window closes." } : {}),
      defaultPath: join(app.getPath("downloads"), `${title}.pdf`),
      filters: [{ name: "PDF document", extensions: ["pdf"] }],
    });
    if (result.canceled || !result.filePath) return null;
    // Complete the write beside the chosen file before replacing an existing export.
    const temporary = join(dirname(result.filePath), `.${basename(result.filePath)}.${randomUUID()}.tmp`);
    try {
      await writeFile(temporary, pdf, { mode: 0o600, flag: "wx" });
      await rename(temporary, result.filePath);
    } catch {
      throw new Error("Couldn’t save the PDF. Choose a writable destination and try again.");
    } finally { await rm(temporary, { force: true }).catch(() => {}); }
    return result.filePath;
  } finally {
    contents.removeListener("did-start-navigation", navigation);
    pending.delete(contents);
  }
}
