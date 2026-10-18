// @vitest-environment jsdom
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { readSheetsSelectionInPage } from "../../apps/runtime/src/agent/sheets-selection.js";
import { SiteReadResultSchema } from "@aux/contracts/site-adapters";
import { SiteAdapters } from "../../apps/runtime/src/agent/site-adapters.js";
const expectedUrl = "https://docs.google.com/spreadsheets/d/spreadsheet_fixture_123456789/edit#gid=999";
const input = {
  kind: "google-sheets" as const,
  view: "selection" as const,
  taskId: "task1",
  expectedRevision: 1,
  pageId: "p1",
  expectedDocumentEpoch: 4,
  expectedUrl,
  sheetGid: "7",
};
function grid() {
  document.body.innerHTML = `<main><div role="tablist"><div id="sheet7" role="tab" aria-selected="true" aria-controls="grid7" data-id="7">Actual Sheet</div></div><div id="grid7" role="grid" tabindex="0" aria-activedescendant="cell1" aria-rowcount="2" aria-colcount="2" aria-multiselectable="true"><div role="row" aria-rowindex="1"><div id="cell1" role="gridcell" aria-colindex="1" aria-selected="true">one</div><div id="cell2" role="gridcell" aria-colindex="2" aria-selected="true">two</div></div><div role="row" aria-rowindex="2"><div id="cell3" role="gridcell" aria-colindex="1" aria-selected="true">three</div><div id="cell4" role="gridcell" aria-colindex="2" aria-selected="true">four</div></div></div></main>`;
  const value = document.getElementById("grid7")!;
  value.focus();
  return value;
}
beforeEach(() => {
  vi.stubGlobal("location", { href: expectedUrl });
  vi.spyOn(Element.prototype, "getClientRects").mockReturnValue([
    { width: 100, height: 30, right: 100, bottom: 30, left: 0, top: 0 },
  ] as unknown as DOMRectList);
  grid();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(document, "execCommand");
});
it("reads actual linked selected tab, active cell and complete rectangular grid independently of URL/name box", () => {
  const result = readSheetsSelectionInPage({ expectedUrl, sheetGid: "7" });
  expect(result).toMatchObject({
    ok: true,
    selection: {
      basis: "live-dom-aria-grid",
      sheet: { gid: "7", title: "Actual Sheet" },
      activeCell: { row: 1, column: 1, a1: "A1" },
      selection: {
        extent: "complete",
        observedSelectedCells: 4,
        range: { a1: "A1:B2", startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 },
      },
    },
  });
  expect(readSheetsSelectionInPage({ expectedUrl, sheetGid: "999" })).toMatchObject({
    ok: false,
    reason: "selected-sheet-mismatch-or-unavailable",
  });
});
it("does not invent a full range from a virtualized selection or infer gid from a URL", () => {
  document.getElementById("grid7")!.setAttribute("aria-rowcount", "10000");
  document.getElementById("sheet7")!.removeAttribute("data-id");
  const result = readSheetsSelectionInPage({ expectedUrl });
  expect(result).toMatchObject({
    ok: true,
    selection: {
      activeCell: { a1: "A1" },
      selection: { extent: "active-cell-only", observedSelectedCells: 4 },
    },
  });
  if (!result.ok) throw Error("Expected active cell evidence");
  expect(result.selection.sheet).not.toHaveProperty("gid");
  expect(result.selection.selection).not.toHaveProperty("range");
});
it("reads an explicit single-select grid without pretending unrendered cells were inspected", () => {
  const root = document.getElementById("grid7")!;
  root.setAttribute("aria-rowcount", "1000000");
  root.setAttribute("aria-multiselectable", "false");
  for (const id of ["cell2", "cell3", "cell4"])
    document.getElementById(id)!.setAttribute("aria-selected", "false");
  expect(readSheetsSelectionInPage({ expectedUrl })).toMatchObject({
    ok: true,
    selection: { selection: { extent: "complete", range: { a1: "A1" } } },
  });
});
it.each([
  "canvas",
  "hidden",
  "toolbar",
  "frame",
  "duplicate-id",
  "foreign-active",
  "ambiguous-tab",
  "coordinates",
  "missing-state",
  "merged",
  "disjoint",
  "focus",
  "hidden-cell",
  "bounds",
])("refuses unsupported %s source", (kind) => {
  const root = document.getElementById("grid7")!;
  if (kind === "canvas") {
    root.innerHTML = "<canvas></canvas>";
    root.removeAttribute("aria-activedescendant");
  }
  if (kind === "hidden") root.style.opacity = "0";
  if (kind === "toolbar") root.parentElement!.setAttribute("role", "toolbar");
  if (kind === "frame") {
    const frame = document.createElement("iframe");
    document.body.append(frame);
    frame.focus();
  }
  if (kind === "duplicate-id") root.append(document.getElementById("cell1")!.cloneNode(true));
  if (kind === "foreign-active") {
    document.body.append(document.getElementById("cell1")!);
  }
  if (kind === "ambiguous-tab")
    document.querySelector('[role="tablist"]')!.append(document.getElementById("sheet7")!.cloneNode(true));
  if (kind === "coordinates") document.getElementById("cell1")!.setAttribute("aria-colindex", "-1");
  if (kind === "missing-state") document.getElementById("cell2")!.removeAttribute("aria-selected");
  if (kind === "merged") document.getElementById("cell1")!.setAttribute("aria-colspan", "2");
  if (kind === "disjoint") document.getElementById("cell2")!.setAttribute("aria-selected", "false");
  if (kind === "focus") {
    const input = document.createElement("input");
    input.value = "A1:B2";
    document.body.append(input);
    input.focus();
  }
  if (kind === "hidden-cell") document.getElementById("cell1")!.setAttribute("aria-hidden", "true");
  if (kind === "bounds") root.setAttribute("aria-rowcount", "1");
  expect(readSheetsSelectionInPage({ expectedUrl }).ok).toBe(false);
});
it("refuses name-box echo without a grid, read-only foreign documents and excessive structures", () => {
  document.body.innerHTML = '<input id="t-name-box" value="A1:B2">';
  document.querySelector("input")!.focus();
  expect(readSheetsSelectionInPage({ expectedUrl }).ok).toBe(false);
  grid();
  vi.stubGlobal("location", { href: "https://other.test/spreadsheets/d/spreadsheet_fixture_123456789/edit" });
  expect(readSheetsSelectionInPage({ expectedUrl: location.href })).toMatchObject({
    ok: false,
    reason: "unsupported-document",
  });
  vi.stubGlobal("location", { href: expectedUrl });
  document.getElementById("grid7")!.append(
    ...Array.from({ length: 2048 }, () => {
      const cell = document.createElement("div");
      cell.setAttribute("role", "gridcell");
      return cell;
    }),
  );
  expect(readSheetsSelectionInPage({ expectedUrl })).toMatchObject({ ok: false, reason: "large-grid" });
});
function adapter() {
  const page = {
    pageId: "p1",
    url: expectedUrl,
    documentEpoch: 4,
    backend: "aux",
    sessionId: "native-session",
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
it("runs the fixed serialized producer twice, publishes native source provenance, and never fetches/copies/acts", async () => {
  const f = adapter(),
    fetch = vi.fn(),
    copy = vi.fn(),
    click = vi.spyOn(HTMLElement.prototype, "click"),
    dispatch = vi.spyOn(EventTarget.prototype, "dispatchEvent");
  vi.stubGlobal("fetch", fetch);
  Object.defineProperty(document, "execCommand", { configurable: true, value: copy });
  const result = await f.service.read(input);
  expect(result).toMatchObject({
    sourceUrl: expectedUrl,
    sheetsSelection: {
      sessionId: "native-session",
      windowId: "window1",
      controllerEpoch: 1,
      sourceSha256: expect.stringMatching(/^[a-f0-9]{64}$/),
      activeCell: { a1: "A1" },
      selection: { range: { a1: "A1:B2" } },
    },
  });
  expect(f.driver.evaluate).toHaveBeenCalledTimes(2);
  expect(fetch).not.toHaveBeenCalled();
  expect(copy).not.toHaveBeenCalled();
  expect(click).not.toHaveBeenCalled();
  expect(dispatch).not.toHaveBeenCalled();
  expect(result).not.toHaveProperty("account");
  document.getElementById("grid7")!.setAttribute("aria-activedescendant", "cell4");
  expect((await f.service.read(input)).sheetsSelection?.activeCell.a1).toBe("B2");
  expect(f.driver.evaluate).toHaveBeenCalledTimes(4);
});
it.each([
  "selection",
  "sheet",
  "session",
  "window",
  "control",
  "space",
  "document",
  "policy",
  "driver",
  "detach",
  "backend",
])("refuses original %s retirement before publication", async (kind) => {
  const f = adapter();
  f.driver.evaluate.mockImplementationOnce(async () => {
    const result = readSheetsSelectionInPage({ expectedUrl, sheetGid: "7" });
    if (kind === "selection")
      document.getElementById("grid7")!.setAttribute("aria-activedescendant", "cell4");
    if (kind === "sheet") document.getElementById("sheet7")!.setAttribute("data-id", "8");
    if (kind === "session") f.page.sessionId = "replacement";
    if (kind === "window") f.page.windowId = "replacement";
    if (kind === "control") f.page.controllerEpoch++;
    if (kind === "space") f.page.workspaceId = "replacement";
    if (kind === "document") f.page.documentEpoch++;
    if (kind === "policy") f.allow.mockReturnValue(false);
    if (kind === "detach") f.driver.isAttached = () => false;
    if (kind === "backend") f.page.backend = "chrome";
    if (kind === "driver")
      Object.assign(f.service, { pages: { get: () => f.page, driverPageLenient: () => ({ ...f.driver }) } });
    return result;
  });
  await expect(f.service.read(input)).rejects.toMatchObject({ code: "ref_stale" });
});
it("refuses unattested native window/controller/backend and gives clear canvas handback", async () => {
  const f = adapter();
  f.page.backend = "chrome";
  await expect(f.service.read(input)).rejects.toMatchObject({ code: "capability_unsupported" });
  f.page.backend = "aux";
  f.page.windowId = "";
  await expect(f.service.read(input)).rejects.toMatchObject({ code: "capability_unsupported" });
  f.page.windowId = "window1";
  f.page.controllerEpoch = -1;
  await expect(f.service.read(input)).rejects.toMatchObject({ code: "capability_unsupported" });
  f.page.controllerEpoch = 1;
  document.body.innerHTML = "<canvas></canvas>";
  await expect(f.service.read(input)).rejects.toMatchObject({
    code: "capability_unsupported",
    detail: { handback: true },
  });
});

it("rejects contradictory parent coordinates, hidden tab text and selected tabs in foreign toolbars", () => {
  document.getElementById("cell1")!.setAttribute("aria-rowindex", "2");
  expect(readSheetsSelectionInPage({ expectedUrl }).ok).toBe(false);
  grid();
  document.getElementById("sheet7")!.innerHTML = "Actual <span hidden>private</span>";
  expect(readSheetsSelectionInPage({ expectedUrl })).toMatchObject({
    ok: false,
    reason: "hidden-sheet-title",
  });
  grid();
  document.querySelector('[role="tablist"]')!.setAttribute("role", "toolbar");
  expect(readSheetsSelectionInPage({ expectedUrl }).ok).toBe(false);
});
it("handles actual explicit 1-based coordinates above Z without treating name-box values as coordinates", () => {
  const root = document.getElementById("grid7")!;
  root.setAttribute("aria-rowcount", "10000000");
  root.setAttribute("aria-colcount", "18278");
  root.setAttribute("aria-multiselectable", "false");
  document.getElementById("cell1")!.parentElement!.setAttribute("aria-rowindex", "10000000");
  document.getElementById("cell1")!.setAttribute("aria-colindex", "27");
  for (const id of ["cell2", "cell3", "cell4"])
    document.getElementById(id)!.setAttribute("aria-selected", "false");
  expect(readSheetsSelectionInPage({ expectedUrl })).toMatchObject({
    ok: true,
    selection: {
      activeCell: { row: 10000000, column: 27, a1: "AA10000000" },
      selection: { range: { a1: "AA10000000" } },
    },
  });
});

it("rejects inconsistent range completeness rather than publishing an ambiguous projection", async () => {
  const result = await adapter().service.read(input);
  const selected = result.sheetsSelection!;
  for (const selection of [
    { ...selected.selection, extent: "active-cell-only" },
    { ...selected.selection, range: undefined },
    { ...selected.selection, observedSelectedCells: 1 },
    { ...selected.selection, range: { ...selected.selection.range!, startRow: 3 } },
  ])
    expect(
      SiteReadResultSchema.safeParse({ ...result, sheetsSelection: { ...selected, selection } }).success,
    ).toBe(false);
});

it("respects each known grid bound when the other dimension is unknown", () => {
  const root = document.getElementById("grid7")!;
  root.setAttribute("aria-rowcount", "1");
  root.setAttribute("aria-colcount", "-1");
  expect(readSheetsSelectionInPage({ expectedUrl })).toMatchObject({
    ok: false,
    reason: "invalid-grid-bounds",
  });
  root.setAttribute("aria-rowcount", "-1");
  root.setAttribute("aria-colcount", "1");
  expect(readSheetsSelectionInPage({ expectedUrl })).toMatchObject({
    ok: false,
    reason: "invalid-grid-bounds",
  });
});
