import { AuxError, type MethodParams, type PlanStep } from "@aux/contracts";
import type { ObservedActionTarget } from "@aux/chromium-driver";
import type { PageRegistry } from "../services/pages/registry.js";
import { SiteAdapters } from "./site-adapters.js";

export function sheetsRange(a1: string) {
  const cells = a1.split(":").map((cell) => {
    const match = /^([A-Z]{1,3})([1-9][0-9]{0,7})$/.exec(cell);
    if (!match) throw new AuxError("invalid_params", "Use an explicit uppercase A1 cell or rectangle.");
    let column = 0;
    for (const letter of match[1]!) column = column * 26 + letter.charCodeAt(0) - 64;
    return { row: Number(match[2]), column };
  });
  const start = cells[0]!,
    end = cells.at(-1)!;
  if (
    cells.length > 2 ||
    end.row < start.row ||
    end.column < start.column ||
    end.row > 10_000_000 ||
    end.column > 18_278 ||
    (end.row - start.row + 1) * (end.column - start.column + 1) > 256
  )
    throw new AuxError("invalid_params", "Choose an ordered rectangle of at most 256 existing cells.");
  if (cells.length === 2 && start.row === end.row && start.column === end.column)
    throw new AuxError("invalid_params", "Use the single-cell A1 spelling for one cell.");
  return { startRow: start.row, startColumn: start.column, endRow: end.row, endColumn: end.column, a1 };
}

/** Fixed read-only inspection. Name box contents never prove the selected range. */
export function inspectSheetsNameBox(input: {
  expectedUrl: string;
  gridId: string;
  tabId: string;
  target: ReturnType<typeof sheetsRange>;
}) {
  if (location.href !== input.expectedUrl) return null;
  const boxes = document.querySelectorAll("#t-name-box");
  const grid = document.getElementById(input.gridId),
    tab = document.getElementById(input.tabId);
  if (boxes.length !== 1 || !grid || !tab || tab.getAttribute("aria-selected") !== "true") return null;
  const box = boxes[0];
  if (
    !(box instanceof HTMLInputElement) ||
    box.type !== "text" ||
    box.readOnly ||
    box.disabled ||
    box.form ||
    /password|credential|token|secret|card|payment|bank/i.test(
      box.name + " " + (box.getAttribute("aria-label") ?? ""),
    ) ||
    box.name.length > 512 ||
    (box.getAttribute("aria-label")?.length ?? 0) > 512 ||
    box.value.length > 256 ||
    !["", "off"].includes(box.autocomplete)
  )
    return null;
  const owner = grid.closest('main,[role="main"],[role="application"]');
  if (!owner || !owner.contains(box) || !owner.contains(tab)) return null;
  if (
    box.closest(
      '[hidden],[inert],[aria-hidden="true"],[data-private],[data-sensitive],[data-aux-private],dialog,[role="dialog"],nav,aside,[contenteditable],form',
    )
  )
    return null;
  let depth = 0;
  for (let node: Element | null = box; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (++depth > 64 || style.display === "none" || style.visibility !== "visible" || style.opacity === "0")
      return null;
  }
  const rect = box.getBoundingClientRect();
  if (
    rect.width <= 0 ||
    rect.height <= 0 ||
    rect.top < 0 ||
    rect.left < 0 ||
    rect.right > innerWidth ||
    rect.bottom > innerHeight
  )
    return null;
  const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
  if (hit !== box) return null;
  const numeric = (value: string | null) =>
    value && /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value)) ? Number(value) : undefined;
  const rows = numeric(grid.getAttribute("aria-rowcount")),
    columns = numeric(grid.getAttribute("aria-colcount"));
  const target = input.target;
  if ((rows && target.endRow > rows) || (columns && target.endColumn > columns)) return null;
  if (!rows || !columns) {
    const cells = grid.querySelectorAll('[role="gridcell"]');
    if (cells.length > 2048) return null;
    const positions = new Set(
      Array.from(cells)
        .filter(
          (cell) =>
            cell.closest('[role="grid"]') === grid &&
            !cell.closest(
              '[hidden],[inert],[aria-hidden="true"],[data-private],[data-sensitive],[data-aux-private]',
            ) &&
            Array.from(cell.getClientRects()).some(
              (rect) =>
                rect.width > 0 &&
                rect.height > 0 &&
                rect.bottom > 0 &&
                rect.right > 0 &&
                rect.top < innerHeight &&
                rect.left < innerWidth,
            ),
        )
        .map(
          (cell) =>
            `${numeric(cell.getAttribute("aria-rowindex") ?? cell.closest('[role="row"]')?.getAttribute("aria-rowindex") ?? null)}:${numeric(cell.getAttribute("aria-colindex"))}`,
        ),
    );
    for (let row = target.startRow; row <= target.endRow; row++)
      for (let column = target.startColumn; column <= target.endColumn; column++)
        if (!positions.has(`${row}:${column}`)) return null;
  }
  const path: number[] = [];
  let node: Node = box;
  while (node !== document.documentElement) {
    if (!node.parentNode || path.length >= 64) return null;
    path.unshift(Array.prototype.indexOf.call(node.parentNode.childNodes, node) as number);
    node = node.parentNode;
  }
  return {
    path,
    value: box.value,
    type: box.type,
    name: box.name,
    label: box.getAttribute("aria-label") ?? "",
    gridId: grid.id,
    tabId: tab.id,
  };
}

export async function captureSheetsNavigation(
  pages: PageRegistry,
  input: MethodParams<"sites.read">,
  a1: string,
  allowOrigin: (url: URL) => boolean,
) {
  const target = sheetsRange(a1);
  const before = structuredClone(pages.get(input.pageId)),
    driver = pages.driverPageLenient(input.pageId);
  const identity = (page: typeof before) =>
    JSON.stringify([
      page.pageId,
      page.backend,
      page.url,
      page.sessionId,
      page.documentEpoch,
      page.windowId,
      page.controllerEpoch,
      page.workspaceId,
    ]);
  const native = identity(before);
  const check = () => {
    if (
      identity(pages.get(input.pageId)) !== native ||
      pages.driverPageLenient(input.pageId) !== driver ||
      !driver.isAttached() ||
      !allowOrigin(new URL(before.url))
    )
      throw new AuxError("ref_stale", "The original Sheets page, owner, driver or policy changed.");
  };
  if (
    before.backend !== "aux" ||
    !before.sessionId ||
    !before.windowId ||
    !driver.actionTarget ||
    !driver.withActionTarget
  )
    throw new AuxError(
      "capability_unsupported",
      "Sheets navigation needs original native input and exact target proof.",
    );
  check();
  const settled = await driver.waitFor({ kind: "settled", policy: "interactive", timeoutMs: 1000 });
  check();
  if (!settled.ok)
    throw new AuxError(
      "condition_timeout",
      "The original Sheets editor did not settle before its independent read.",
    );
  const result = await new SiteAdapters(pages, allowOrigin).read(input);
  check();
  const selection = result.sheetsSelection;
  if (!selection)
    throw new AuxError("capability_unsupported", "Actual accessible Sheets selection is unavailable.");
  const expression = `(${inspectSheetsNameBox.toString()})(${JSON.stringify({ expectedUrl: input.expectedUrl, gridId: selection.gridId, tabId: selection.sheet.tabId, target })})`;
  const control = (await driver.evaluate(expression)) as ReturnType<typeof inspectSheetsNameBox>;
  check();
  if (!control)
    throw new AuxError(
      "capability_unsupported",
      "The actual visible Name box or existing target cells cannot be attested. Use Take over.",
    );
  const steps: PlanStep[] = [
    { id: "fill", op: "fill", target: "css:#t-name-box", value: a1 },
    { id: "enter", op: "press", target: "css:#t-name-box", key: "Enter" },
  ];
  const fill = await driver.actionTarget("css:#t-name-box");
  check();
  const enter = await driver.actionTarget("css:#t-name-box", [steps[0]!]);
  check();
  if (
    !fill.nodeIdentity ||
    !fill.stateDigest ||
    !enter.nodeIdentity ||
    !enter.stateDigest ||
    enter.nodeIdentity !== fill.nodeIdentity ||
    fill.form ||
    fill.tag !== "input" ||
    fill.type !== "text"
  )
    throw new AuxError("capability_unsupported", "The original Name box has no exact browser target proof.");
  const verifiedControl = await driver.evaluate(expression);
  check();
  const verified = await new SiteAdapters(pages, allowOrigin).read(input);
  check();
  if (
    JSON.stringify(control) !== JSON.stringify(verifiedControl) ||
    verified.sheetsSelection?.sourceSha256 !== selection.sourceSha256
  )
    throw new AuxError("ref_stale", "The actual Name box or selected sheet changed during preparation.");
  const preconditions: ObservedActionTarget[] = [fill, enter];
  return { selection, target, control, steps, preconditions, check };
}
