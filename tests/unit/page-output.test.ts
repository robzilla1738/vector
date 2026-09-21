import { afterEach, expect, it, vi } from "vitest";
import { EventEmitter } from "node:events";
import { mkdtemp, readFile, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { BaseWindow, WebContents } from "electron";
const native = vi.hoisted(() => ({ save: vi.fn() }));
vi.mock("../../apps/desktop/node_modules/electron", () => ({ app: { getPath: () => "/tmp" }, dialog: { showSaveDialog: native.save } }));
import { printPage, savePagePdf } from "../../apps/desktop/main/page-output.js";

const directories: string[] = [];
afterEach(async () => { vi.clearAllMocks(); await Promise.all(directories.splice(0).map(path => rm(path, { recursive: true, force: true }))); });
function page() {
  return Object.assign(new EventEmitter(), {
    isDestroyed: () => false, isCrashed: () => false, isLoadingMainFrame: () => false,
    getURL: () => "https://example.test/report", getTitle: () => "Report/September",
    print: vi.fn(), printToPDF: vi.fn(async () => Buffer.from("%PDF-fixture")),
  });
}
const owner = {} as BaseWindow;
it("waits for printing and handles cancellation, failure and overlapping requests", async () => {
  const tab = page(), wc = tab as unknown as WebContents;
  const pending = printPage(wc);
  await expect(printPage(wc)).rejects.toThrow("already in progress");
  tab.print.mock.calls[0]![1](false, "Print job canceled");
  expect(await pending).toBe(false);
  const failed = printPage(wc);
  const failure = expect(failed).rejects.toThrow("Check the printer");
  tab.print.mock.calls[1]![1](false, "Print job failed");
  await failure;
  expect(tab.listenerCount("destroyed")).toBe(0);
});
it("saves a captured private PDF with a safe name and cleans up the temporary file", async () => {
  const directory = await mkdtemp(join(tmpdir(), "aux-page-output-")); directories.push(directory);
  const destination = join(directory, "report.pdf");
  native.save.mockResolvedValueOnce({ canceled: false, filePath: destination });
  expect(await savePagePdf(page() as unknown as WebContents, owner, true)).toBe(destination);
  expect(native.save.mock.calls[0]![1]).toMatchObject({ defaultPath: "/tmp/Report-September.pdf", message: expect.stringContaining("private window") });
  expect(await readFile(destination, "utf8")).toBe("%PDF-fixture");
  expect(await readdir(directory)).toEqual(["report.pdf"]);
});
it("rejects a changed document and allows a later cancelled export", async () => {
  const tab = page(), wc = tab as unknown as WebContents;
  tab.printToPDF.mockImplementationOnce(async () => { tab.emit("did-start-navigation", {}, "https://elsewhere.test", false, true); return Buffer.from("changed"); });
  await expect(savePagePdf(wc, owner)).rejects.toThrow("page changed");
  expect(native.save).not.toHaveBeenCalled();
  native.save.mockResolvedValueOnce({ canceled: true });
  expect(await savePagePdf(wc, owner)).toBeNull();
  expect(tab.listenerCount("did-start-navigation")).toBe(0);
});
