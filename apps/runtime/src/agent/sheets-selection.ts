/** Fixed, uncached DOM reader. No keyboard, clipboard, editor preference or page writes. */
export function readSheetsSelectionInPage(input: { expectedUrl: string; sheetGid?: string }) {
  const unsupported = (reason: string) => ({ ok: false as const, reason });
  if (location.href !== input.expectedUrl) return unsupported("document-changed");
  const url = new URL(location.href);
  const documentId = /^\/spreadsheets\/d\/([A-Za-z0-9_-]{20,200})(?:\/|$)/.exec(url.pathname)?.[1];
  if (url.origin !== "https://docs.google.com" || url.username || url.password || !documentId)
    return unsupported("unsupported-document");
  const active = document.activeElement;
  if (!active || active.tagName === "IFRAME") return unsupported("foreign-or-framed-grid");
  const forbidden =
    'dialog,[role="dialog"],[role="toolbar"],nav,[role="navigation"],aside,[role="complementary"],[role="comment"],[data-comment-id],input,textarea,[contenteditable="true"],[contenteditable="plaintext-only"],[contenteditable=""]';
  const visible = (element: Element): boolean => {
    if (
      !element.isConnected ||
      element.ownerDocument !== document ||
      element.closest(
        '[hidden],[inert],[aria-hidden="true"],[data-private],[data-sensitive],[data-aux-private]',
      )
    )
      return false;
    let depth = 0;
    for (let parent: Element | null = element; parent; parent = parent.parentElement) {
      if (++depth > 64) return false;
      const style = getComputedStyle(parent);
      if (
        style.display === "none" ||
        ["hidden", "collapse"].includes(style.visibility) ||
        style.opacity === "0"
      )
        return false;
    }
    return Array.from(element.getClientRects()).some(
      (rect) =>
        rect.width > 0 &&
        rect.height > 0 &&
        rect.right > 0 &&
        rect.bottom > 0 &&
        rect.left < innerWidth &&
        rect.top < innerHeight,
    );
  };
  if (active.closest(forbidden) || !visible(active)) return unsupported("toolbar-hidden-buffer-or-edit-mode");
  const grids = document.querySelectorAll('[role="grid"]');
  if (grids.length > 8) return unsupported("ambiguous-grid");
  const focused = Array.from(grids).filter((grid) => grid.contains(active) && visible(grid));
  if (focused.length !== 1) return unsupported("canvas-or-grid-unavailable");
  const grid = focused[0]!;
  const owner = grid.closest('main,[role="main"],[role="application"]');
  if (!owner || grid.closest(forbidden) || !visible(owner)) return unsupported("foreign-grid-root");
  const ids = document.querySelectorAll("[id]");
  if (ids.length > 10_000) return unsupported("large-document");
  const byId = new Map<string, Element | null>();
  for (const element of ids) byId.set(element.id, byId.has(element.id) ? null : element);
  const gridId = grid.id;
  if (!gridId || gridId.length > 200 || byId.get(gridId) !== grid)
    return unsupported("ambiguous-grid-identity");
  const tabs = owner.querySelectorAll('[role="tab"][aria-selected="true"]');
  if (tabs.length > 128) return unsupported("ambiguous-sheet-tab");
  const panel = grid.closest('[role="tabpanel"]');
  const matchingTabs = Array.from(tabs).filter((tab) => {
    if (
      !tab.id ||
      tab.id.length > 200 ||
      byId.get(tab.id) !== tab ||
      !visible(tab) ||
      tab.closest(forbidden) ||
      !tab.closest('[role="tablist"]')
    )
      return false;
    const controlled = (tab.getAttribute("aria-controls") ?? "").split(/\s+/);
    const labelled = (panel?.getAttribute("aria-labelledby") ?? "").split(/\s+/);
    return (
      controlled.includes(gridId) ||
      (!!panel?.id &&
        byId.get(panel.id) === panel &&
        controlled.includes(panel.id) &&
        labelled.includes(tab.id))
    );
  });
  if (matchingTabs.length !== 1) return unsupported("ambiguous-sheet-tab");
  const tab = matchingTabs[0]!;
  let title = tab.getAttribute("aria-label") ?? "";
  if (!title) {
    const walker = document.createTreeWalker(tab, 5);
    let visited = 0;
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const element = node.nodeType === 1 ? (node as Element) : node.parentElement;
      if (++visited > 256 || !element || !visible(element)) return unsupported("hidden-sheet-title");
      if (node.nodeType === 3) title += node.nodeValue ?? "";
      if (title.length > 300) return unsupported("sheet-title-unavailable");
    }
  }
  title = title.replace(/\s+/g, " ").trim();
  if (!title || title.length > 300) return unsupported("sheet-title-unavailable");
  const observedGid = tab.getAttribute("data-id");
  const gid = observedGid && /^\d{1,20}$/.test(observedGid) ? observedGid : undefined;
  if (input.sheetGid !== undefined && gid !== input.sheetGid)
    return unsupported("selected-sheet-mismatch-or-unavailable");
  const descendantId = grid.getAttribute("aria-activedescendant");
  const directCell = active.closest('[role="gridcell"]');
  if (active !== grid && !directCell) return unsupported("grid-not-focused");
  const descendant = descendantId ? byId.get(descendantId) : directCell;
  if (
    !descendant ||
    (directCell && descendant !== directCell) ||
    !descendant.matches('[role="gridcell"]') ||
    descendant.closest('[role="grid"]') !== grid ||
    !visible(descendant) ||
    descendant.closest(forbidden)
  )
    return unsupported("active-cell-unavailable");
  if (descendant.getAttribute("aria-selected") !== "true") return unsupported("active-cell-not-selected");
  const integer = (value: string | null, max: number) =>
    value && /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) <= max
      ? Number(value)
      : undefined;
  const coordinate = (cell: Element) => {
    const row = cell.closest('[role="row"]');
    const rowIndex = integer(
      cell.getAttribute("aria-rowindex") ?? row?.getAttribute("aria-rowindex") ?? null,
      10_000_000,
    );
    const column = integer(cell.getAttribute("aria-colindex"), 18_278);
    if (
      row?.hasAttribute("aria-rowindex") &&
      rowIndex !== integer(row.getAttribute("aria-rowindex"), 10_000_000)
    )
      return undefined;
    if (
      !rowIndex ||
      !column ||
      (row && row.closest('[role="grid"]') !== grid) ||
      ![null, "1"].includes(cell.getAttribute("aria-rowspan")) ||
      ![null, "1"].includes(cell.getAttribute("aria-colspan"))
    )
      return undefined;
    return { row: rowIndex, column };
  };
  const a1 = (row: number, column: number) => {
    let letters = "";
    for (let value = column; value > 0; value = Math.floor((value - 1) / 26))
      letters = String.fromCharCode(65 + ((value - 1) % 26)) + letters;
    return letters + row;
  };
  const cells = grid.querySelectorAll('[role="gridcell"]');
  if (cells.length > 2048 || grid.querySelectorAll("*").length > 6000) return unsupported("large-grid");
  const positions = new Map<string, Element>();
  const selected: { row: number; column: number }[] = [];
  for (const cell of cells) {
    if (cell.closest('[role="grid"]') !== grid) return unsupported("nested-grid");
    const position = coordinate(cell);
    if (!position) return unsupported("cell-coordinates-unavailable");
    const key = `${position.row}:${position.column}`;
    if (positions.has(key)) return unsupported("ambiguous-cell-coordinates");
    positions.set(key, cell);
    if (cell.getAttribute("aria-selected") === "true") {
      if (!visible(cell) || cell.closest(forbidden)) return unsupported("hidden-selected-cell");
      selected.push(position);
      if (selected.length > 256) return unsupported("large-selection");
    } else if (cell.getAttribute("aria-selected") !== "false")
      return unsupported("selection-state-unavailable");
  }
  const activePosition = coordinate(descendant);
  if (!activePosition || !selected.length) return unsupported("active-cell-unavailable");
  const rows = integer(grid.getAttribute("aria-rowcount"), 10_000_000);
  const columns = integer(grid.getAttribute("aria-colcount"), 18_278);
  if (
    Array.from(positions.keys()).some((key) => {
      const [row, column] = key.split(":").map(Number);
      return (!!rows && row! > rows) || (!!columns && column! > columns);
    })
  )
    return unsupported("invalid-grid-bounds");
  if (grid.getAttribute("aria-multiselectable") === "false" && selected.length !== 1)
    return unsupported("contradictory-selection");
  for (const [attribute, bound] of [
    ["aria-rowcount", rows],
    ["aria-colcount", columns],
  ] as const)
    if (grid.hasAttribute(attribute) && !bound && grid.getAttribute(attribute) !== "-1")
      return unsupported("invalid-grid-bounds");
  if (
    grid.hasAttribute("aria-multiselectable") &&
    !["true", "false"].includes(grid.getAttribute("aria-multiselectable")!)
  )
    return unsupported("invalid-selection-mode");
  const complete =
    (grid.getAttribute("aria-multiselectable") === "false" && selected.length === 1) ||
    (!!rows && !!columns && rows * columns === positions.size);
  let range:
    { startRow: number; startColumn: number; endRow: number; endColumn: number; a1: string } | undefined;
  if (complete) {
    const startRow = Math.min(...selected.map((cell) => cell.row)),
      endRow = Math.max(...selected.map((cell) => cell.row));
    const startColumn = Math.min(...selected.map((cell) => cell.column)),
      endColumn = Math.max(...selected.map((cell) => cell.column));
    if ((endRow - startRow + 1) * (endColumn - startColumn + 1) !== selected.length)
      return unsupported("disjoint-selection");
    range = {
      startRow,
      startColumn,
      endRow,
      endColumn,
      a1: a1(startRow, startColumn) + (selected.length > 1 ? ":" + a1(endRow, endColumn) : ""),
    };
  }
  const path = (element: Element) => {
    const result: number[] = [];
    let node: Node = element;
    while (node !== document.documentElement) {
      if (!node.parentNode || result.length >= 64) return undefined;
      result.unshift(Array.prototype.indexOf.call(node.parentNode.childNodes, node) as number);
      node = node.parentNode;
    }
    return result;
  };
  const gridPath = path(grid),
    tabPath = path(tab);
  if (!gridPath || !tabPath) return unsupported("source-retired");
  if (location.href !== input.expectedUrl) return unsupported("document-changed");
  return {
    ok: true as const,
    selection: {
      basis: "live-dom-aria-grid" as const,
      documentId,
      gridId,
      gridPath,
      sheet: { tabId: tab.id, title, ...(gid ? { gid } : {}), tabPath },
      activeCell: { ...activePosition, a1: a1(activePosition.row, activePosition.column) },
      selection: {
        extent: complete ? ("complete" as const) : ("active-cell-only" as const),
        observedSelectedCells: selected.length,
        ...(range ? { range } : {}),
      },
    },
  };
}
