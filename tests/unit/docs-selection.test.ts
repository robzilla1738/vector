// @vitest-environment jsdom
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { readDocsSelectionInPage } from "../../apps/runtime/src/agent/docs-selection.js";
import { SiteAdapters, siteExportUrl } from "../../apps/runtime/src/agent/site-adapters.js";
import { SiteReadParamsSchema } from "@aux/contracts/site-adapters";
const expectedUrl = "https://docs.google.com/document/d/document_fixture_id_123456789/edit";
const input = {
  kind: "google-docs" as const,
  view: "selection" as const,
  taskId: "task1",
  expectedRevision: 1,
  pageId: "p1",
  expectedDocumentEpoch: 4,
  expectedUrl,
};
function editor(text = "Hello 😀 world") {
  document.body.innerHTML = '<main><div role="document" contenteditable="true" tabindex="0"></div></main>';
  const root = document.querySelector('[role="document"]') as HTMLElement;
  root.textContent = text;
  root.focus();
  return root;
}
function select(root: Element, start: number, end = start) {
  const node = root.firstChild ?? root;
  const range = document.createRange();
  range.setStart(node, start);
  range.setEnd(node, end);
  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
}
beforeEach(() => {
  vi.stubGlobal("location", { href: expectedUrl });
  vi.spyOn(Element.prototype, "getClientRects").mockReturnValue([
    { width: 100, height: 30 },
  ] as unknown as DOMRectList);
  editor();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("reads the actual selected DOM text with local UTF-16 offsets without fetching exports", () => {
  const root = editor();
  select(root, 6, 8);
  expect(readDocsSelectionInPage({ expectedUrl })).toMatchObject({
    ok: true,
    text: "😀",
    rootText: "Hello 😀 world",
    selection: {
      basis: "live-dom-root-utf16",
      mode: "range",
      start: 6,
      end: 8,
      rootTextLength: 14,
      direction: "forward",
      before: "Hello ",
      after: " world",
      framePath: [],
    },
  });
});
it("refuses an object-only selection rather than calling it a text range", () => {
  const root = editor("");
  const image = document.createElement("img");
  root.append(image);
  const range = document.createRange();
  range.selectNode(image);
  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
  expect(readDocsSelectionInPage({ expectedUrl })).toMatchObject({
    ok: false,
    reason: "selection-text-unavailable",
  });
});
it("keeps a collapsed caret rather than turning it into a whole-field selection", () => {
  const root = editor();
  select(root, 8);
  expect(readDocsSelectionInPage({ expectedUrl })).toMatchObject({
    ok: true,
    text: "",
    selection: { mode: "caret", start: 8, end: 8, direction: "none", before: "Hello 😀", after: " world" },
  });
  select(root, 7);
  expect(readDocsSelectionInPage({ expectedUrl })).toMatchObject({ ok: false, reason: "unicode-boundary" });
});
it.each(["canvas", "hidden-buffer", "toolbar", "comment", "foreign-frame"])(
  "explicitly refuses unsupported %s rather than reporting an API range or editor selection",
  (kind) => {
    const root = editor();
    select(root, 1, 3);
    if (kind === "canvas") {
      root.removeAttribute("role");
      root.innerHTML = "<canvas></canvas>";
    }
    if (kind === "hidden-buffer") root.style.opacity = "0";
    if (kind === "toolbar") root.parentElement!.setAttribute("role", "toolbar");
    if (kind === "comment") root.setAttribute("data-comment-id", "comment1");
    if (kind === "foreign-frame") {
      const frame = document.createElement("iframe");
      document.body.append(frame);
      frame.focus();
    }
    expect(readDocsSelectionInPage({ expectedUrl }).ok).toBe(false);
  },
);
it("refuses excessive source roots, foreign selection endpoints and hidden selected descendants", () => {
  let root = editor("a".repeat(20_001));
  select(root, 1, 2);
  expect(readDocsSelectionInPage({ expectedUrl })).toMatchObject({
    ok: false,
    reason: "document-root-too-large",
  });
  root = editor();
  root.innerHTML = "<span>Hello</span><span hidden>Secret</span>";
  root.focus();
  const range = document.createRange();
  range.selectNodeContents(root);
  window.getSelection()!.removeAllRanges();
  window.getSelection()!.addRange(range);
  expect(readDocsSelectionInPage({ expectedUrl }).ok).toBe(false);
  root = editor();
  select(root, 1, 3);
  vi.stubGlobal("location", { href: expectedUrl + "?different=1" });
  expect(readDocsSelectionInPage({ expectedUrl })).toMatchObject({ ok: false, reason: "document-changed" });
});
function adapter() {
  const page = {
    pageId: "p1",
    url: expectedUrl,
    documentEpoch: 4,
    backend: "aux",
    sessionId: "session1",
    controllerEpoch: 1,
    workspaceId: "space1",
    windowId: "window1",
  };
  const driver = {
    isAttached: () => true,
    evaluate: vi.fn(async (script: string) => new Function(`return ${script}`)()),
  };
  const allow = vi.fn(() => true);
  const service = new SiteAdapters({ get: () => page, driverPageLenient: () => driver } as never, allow);
  return { page, driver, allow, service };
}
it("publishes an uncached selection bound to the original browser session and exact current DOM source", async () => {
  const root = editor();
  select(root, 6, 8);
  const f = adapter();
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const result = await f.service.read(input);
  expect(result).toMatchObject({
    sourceUrl: expectedUrl,
    text: "😀",
    docsSelection: {
      basis: "live-dom-root-utf16",
      sessionId: "session1",
      start: 6,
      end: 8,
      rootTextSha256: expect.stringMatching(/^[a-f0-9]{64}$/),
    },
  });
  expect(fetch).not.toHaveBeenCalled();
  expect(result).not.toHaveProperty("rootText");
  expect(f.driver.evaluate).toHaveBeenCalledTimes(2);
  select(root, 8);
  const caret = await f.service.read(input);
  expect(caret.docsSelection?.mode).toBe("caret");
  expect(f.driver.evaluate).toHaveBeenCalledTimes(4);
});
it.each(["selection", "session", "control", "policy"])(
  "refuses publication if the original %s changes during capture",
  async (kind) => {
    const root = editor();
    select(root, 1, 3);
    const f = adapter();
    f.driver.evaluate.mockImplementationOnce(async () => {
      const captured = readDocsSelectionInPage({ expectedUrl });
      if (kind === "selection") select(root, 3, 4);
      if (kind === "session") f.page.sessionId = "replacement";
      if (kind === "control") f.page.controllerEpoch++;
      if (kind === "policy") f.allow.mockReturnValue(false);
      return captured;
    });
    await expect(f.service.read(input)).rejects.toMatchObject({ code: "ref_stale" });
  },
);
it("rejects selection mode on other site kinds and gives explicit canvas handback", async () => {
  expect(SiteReadParamsSchema.safeParse(input).success).toBe(true);
  expect(() => siteExportUrl({ ...input, kind: "youtube" })).toThrow(/Google Docs or Google Sheets/);
  const f = adapter();
  document.body.innerHTML = "<canvas></canvas>";
  window.getSelection()!.removeAllRanges();
  await expect(f.service.read(input)).rejects.toMatchObject({
    code: "capability_unsupported",
    detail: { handback: true },
  });
});
