import { AuxError } from "@aux/contracts";
import { GoogleArguments } from "@aux/contracts/google";
import type { z } from "zod";

type ObjectValue = Record<string, unknown>;
type Unit = {
  text: string;
  container: string;
  paragraphStyle: ObjectValue;
  paragraphMetadata: string;
  contentMetadata: string;
  elementMetadata?: string;
  runMetadata?: string;
  directStyle?: ObjectValue;
  headingId?: unknown;
  wantedParagraph?: ObjectValue;
  bullet: ObjectValue | null;
  wantedList?: "BULLET_DISC_CIRCLE_SQUARE" | "NUMBERED_DECIMAL_ALPHA_ROMAN";
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  link: ObjectValue | null;
  wanted?: { bold?: boolean; italic?: boolean; underline?: boolean; link?: string | null };
};
type Body = {
  tabId: string;
  units: (Unit | null)[];
  structural: boolean;
  tables: string[];
  metadata: string;
  lists: Map<string, string>;
  anchors: { start: number; end: number; label: string }[];
};
const MAX_UNITS = 200_000;
const object = (value: unknown): ObjectValue => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new AuxError("backend_unavailable", "Google returned invalid document structure.");
  return value as ObjectValue;
};
const array = (value: unknown): unknown[] => {
  if (!Array.isArray(value))
    throw new AuxError("backend_unavailable", "Google returned invalid document structure.");
  return value;
};
function tabs(document: ObjectValue): Map<string, ObjectValue> {
  const result = new Map<string, ObjectValue>();
  const source = array(document.tabs);
  if (source.length > 64) throw new AuxError("invalid_params", "Choose a document with fewer tabs.");
  const pending = source.map((value) => ({ value, depth: 0 }));
  while (pending.length) {
    const { value, depth } = pending.shift()!;
    if (depth > 8 || result.size >= 64)
      throw new AuxError("invalid_params", "Choose a smaller Google document.");
    const tab = object(value),
      id = object(tab.tabProperties).tabId;
    if (typeof id !== "string" || !id || result.has(id))
      throw new AuxError("backend_unavailable", "Google returned an invalid tab identity.");
    result.set(id, object(tab.documentTab));
    const children = tab.childTabs === undefined ? [] : array(tab.childTabs);
    if (children.length + pending.length + result.size > 64)
      throw new AuxError("invalid_params", "Choose a document with fewer tabs.");
    for (const child of children) pending.push({ value: child, depth: depth + 1 });
  }
  return result;
}
function documentMetadata(document: ObjectValue): string {
  const wrappers = (values: unknown): unknown[] =>
    array(values).map((value) => {
      const { documentTab: _body, childTabs, ...metadata } = object(value);
      return { ...metadata, ...(childTabs === undefined ? {} : { childTabs: wrappers(childTabs) }) };
    });
  const { revisionId: _revision, tabs: source, ...metadata } = document;
  return canonical({ ...metadata, tabs: wrappers(source) });
}
function wellFormed(text: string): boolean {
  for (let index = 0; index < text.length; index++) {
    const code = text.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = text.charCodeAt(++index);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return false;
    } else if (code >= 0xdc00 && code <= 0xdfff) return false;
  }
  return true;
}
function boundary(units: Body["units"], index: number): boolean {
  const before = units[index - 1]?.text.charCodeAt(0),
    after = units[index]?.text.charCodeAt(0);
  return !(
    before !== undefined &&
    after !== undefined &&
    before >= 0xd800 &&
    before <= 0xdbff &&
    after >= 0xdc00 &&
    after <= 0xdfff
  );
}
function inheritedBoolean(field: string, ...styles: ObjectValue[]): boolean | undefined {
  for (const style of styles) {
    const value = style[field];
    if (value === undefined) continue;
    if (typeof value !== "boolean")
      throw new AuxError("backend_unavailable", "Google returned invalid document text styles.");
    return value;
  }
  // The editor's unresolved defaults cannot prove a requested explicit false value.
  return undefined;
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`)
      .join(",")}}`;
  return JSON.stringify(value);
}
function paragraphStyle(value: ObjectValue): ObjectValue {
  const { headingId: _headingId, ...style } = value;
  return style;
}
function paragraphBullet(paragraph: ObjectValue, tab: ObjectValue): ObjectValue | null {
  if (!paragraph.bullet) return null;
  const bullet = object(paragraph.bullet);
  if (typeof bullet.listId !== "string")
    throw new AuxError("backend_unavailable", "Google returned an invalid list identity.");
  const level = bullet.nestingLevel ?? 0;
  if (!Number.isSafeInteger(level) || (level as number) < 0 || (level as number) > 8)
    throw new AuxError("backend_unavailable", "Google returned an invalid list level.");
  const list = object(object(tab.lists ?? {})[bullet.listId]);
  const levels = array(object(list.listProperties).nestingLevels);
  return { ...bullet, nestingLevel: level, level: object(levels[level as number]) };
}
function body(tabId: string, tab: ObjectValue, purpose: "read" | "edit" = "edit"): Body {
  const units: Body["units"] = [],
    tables: string[] = [],
    anchors: Body["anchors"] = [];
  let structural = false,
    visited = 0;
  const named = new Map<string, ObjectValue>();
  if (tab.namedStyles)
    for (const value of array(object(tab.namedStyles).styles)) {
      const style = object(value);
      if (typeof style.namedStyleType === "string")
        named.set(style.namedStyleType, object(style.textStyle ?? {}));
    }
  const visit = (
    content: unknown,
    depth: number,
    container = "body",
    parent?: { start: number; end: number },
  ) => {
    if (depth > 16) throw new AuxError("invalid_params", "Choose a less deeply nested Google document.");
    for (const value of array(content)) {
      if (++visited > 20_000) throw new AuxError("invalid_params", "Choose a smaller Google document.");
      const item = object(value),
        end = item.endIndex;
      if (!Number.isSafeInteger(end) || (end as number) < 0 || (end as number) > MAX_UNITS)
        throw new AuxError("invalid_params", "The Google document exceeds the bounded UTF-16 range.");
      if (
        parent &&
        (!Number.isSafeInteger(item.startIndex) ||
          (item.startIndex as number) < parent.start ||
          (end as number) > parent.end)
      )
        throw new AuxError("backend_unavailable", "Google returned content outside its original table cell.");
      if ((end as number) > units.length) units.length = end as number;
      if (item.paragraph) {
        const paragraph = object(item.paragraph),
          style = object(paragraph.paragraphStyle ?? {});
        const paragraphMetadata = canonical(
          Object.fromEntries(
            Object.entries(paragraph).filter(
              ([key]) => !["paragraphStyle", "elements", "bullet"].includes(key),
            ),
          ),
        );
        const format = paragraphStyle(style),
          bullet = purpose === "read" ? null : paragraphBullet(paragraph, tab);
        const inherited = named.get(String(style.namedStyleType ?? "NORMAL_TEXT")) ?? {},
          normal = named.get("NORMAL_TEXT") ?? {};
        for (const element of array(paragraph.elements)) {
          if (++visited > 20_000) throw new AuxError("invalid_params", "Choose a smaller Google document.");
          const part = object(element);
          if (!part.textRun) {
            structural = true;
            continue;
          }
          const run = object(part.textRun),
            text = run.content,
            start = part.startIndex,
            stop = part.endIndex;
          if (
            typeof text !== "string" ||
            !wellFormed(text) ||
            !Number.isSafeInteger(start) ||
            !Number.isSafeInteger(stop) ||
            (start as number) < 1 ||
            (Number.isSafeInteger(item.startIndex) && (start as number) < (item.startIndex as number)) ||
            (stop as number) > (end as number) ||
            (stop as number) - (start as number) !== text.length
          )
            throw new AuxError("backend_unavailable", "Google returned invalid UTF-16 text spans.");
          const formatting = object(run.textStyle ?? {}),
            link = formatting.link === undefined ? null : object(formatting.link),
            bold = inheritedBoolean("bold", formatting, inherited, normal),
            italic = inheritedBoolean("italic", formatting, inherited, normal),
            underline = inheritedBoolean("underline", formatting, inherited, normal);
          if (link && !Object.keys(link).length)
            throw new AuxError("backend_unavailable", "Google returned an empty document link.");
          for (let offset = 0; offset < text.length; offset++) {
            const index = (start as number) + offset;
            if (units[index])
              throw new AuxError("backend_unavailable", "Google returned overlapping text spans.");
            units[index] = {
              text: text[offset]!,
              container,
              paragraphStyle: format,
              paragraphMetadata,
              contentMetadata: canonical(
                Object.fromEntries(
                  Object.entries(item).filter(
                    ([key]) => !["startIndex", "endIndex", "paragraph"].includes(key),
                  ),
                ),
              ),
              elementMetadata: canonical(
                Object.fromEntries(
                  Object.entries(part).filter(
                    ([key]) => !["startIndex", "endIndex", "textRun"].includes(key),
                  ),
                ),
              ),
              runMetadata: canonical(
                Object.fromEntries(
                  Object.entries(run).filter(([key]) => key !== "content" && key !== "textStyle"),
                ),
              ),
              directStyle: formatting,
              headingId: style.headingId,
              bullet,
              bold,
              italic,
              underline,
              // Links are explicitly not inherited in the Docs API.
              link,
            };
          }
        }
      } else if (item.table && purpose === "read") {
        structural = true;
        for (const row of array(object(item.table).tableRows))
          for (const cell of array(object(row).tableCells)) {
            if (++visited > 20_000) throw new AuxError("invalid_params", "Choose a smaller Google document.");
            visit(object(cell).content, depth + 1);
          }
      } else if (item.table) {
        if (depth > 0)
          throw new AuxError("capability_unsupported", "Nested tables require the governed browser editor.");
        const table = object(item.table),
          rows = array(table.tableRows);
        if (
          !Number.isSafeInteger(table.rows) ||
          !Number.isSafeInteger(table.columns) ||
          table.rows !== rows.length ||
          rows.length < 1 ||
          rows.length > 100 ||
          (table.columns as number) < 1 ||
          (table.columns as number) > 100
        )
          throw new AuxError("capability_unsupported", "Choose a bounded rectangular unmerged table.");
        const { tableRows: _rows, ...tableStyle } = table;
        const tableId = tables.length;
        const anchor = (value: ObjectValue, label: string, parent?: { start: number; end: number }) => {
          if (
            !Number.isSafeInteger(value.startIndex) ||
            !Number.isSafeInteger(value.endIndex) ||
            (value.startIndex as number) < 1 ||
            (value.endIndex as number) <= (value.startIndex as number) ||
            (value.endIndex as number) > units.length ||
            (parent &&
              ((value.startIndex as number) < parent.start || (value.endIndex as number) > parent.end))
          )
            throw new AuxError("backend_unavailable", "Google returned invalid table boundaries.");
          const entry = { start: value.startIndex as number, end: value.endIndex as number, label };
          anchors.push(entry);
          return entry;
        };
        const tableAnchor = anchor(item, `table${tableId}`);
        tables.push(
          canonical({
            properties: tableStyle,
            metadata: Object.fromEntries(
              Object.entries(item).filter(([key]) => !["startIndex", "endIndex", "table"].includes(key)),
            ),
          }),
        );
        for (const [rowIndex, value] of rows.entries()) {
          const row = object(value),
            cells = array(row.tableCells);
          if (cells.length !== table.columns)
            throw new AuxError(
              "capability_unsupported",
              "Merged or irregular tables require the governed browser editor.",
            );
          const { startIndex: _start, endIndex: _end, tableCells: _cells, ...rowStyle } = row;
          const rowAnchor = anchor(row, `table${tableId}/row${rowIndex}`, tableAnchor);
          tables.push(canonical(rowStyle));
          for (const [cellIndex, value] of cells.entries()) {
            const cell = object(value),
              style = object(cell.tableCellStyle ?? {});
            if ((style.rowSpan ?? 1) !== 1 || (style.columnSpan ?? 1) !== 1)
              throw new AuxError(
                "capability_unsupported",
                "Merged table cells require the governed browser editor.",
              );
            if (++visited > 20_000) throw new AuxError("invalid_params", "Choose a smaller Google document.");
            const { startIndex: _start, endIndex: _end, content: _content, ...cellStyle } = cell;
            const cellAnchor = anchor(cell, `table${tableId}/row${rowIndex}/cell${cellIndex}`, rowAnchor);
            tables.push(canonical(cellStyle));
            visit(cell.content, depth + 1, `table${tableId}/row${rowIndex}/cell${cellIndex}`, cellAnchor);
          }
        }
      } else if (item.tableOfContents) {
        structural = true;
        visit(object(item.tableOfContents).content, depth + 1);
      } else if (item.sectionBreak) {
        const { startIndex = 0, endIndex, ...descriptor } = item;
        if (
          !Number.isSafeInteger(startIndex) ||
          (startIndex as number) < 0 ||
          (startIndex as number) >= (endIndex as number)
        )
          throw new AuxError("backend_unavailable", "Google returned invalid section boundaries.");
        anchors.push({
          start: startIndex as number,
          end: endIndex as number,
          label: `section:${canonical(descriptor)}`,
        });
      } else structural = true;
    }
  };
  visit(object(tab.body).content, 0);
  return {
    tabId,
    units: Array.from(units, (value) => value ?? null),
    structural,
    tables,
    metadata: canonical({
      tab: Object.fromEntries(Object.entries(tab).filter(([key]) => key !== "body" && key !== "lists")),
      body: Object.fromEntries(Object.entries(object(tab.body)).filter(([key]) => key !== "content")),
    }),
    lists: new Map(Object.entries(object(tab.lists ?? {})).map(([id, list]) => [id, canonical(list)])),
    anchors,
  };
}
function documentIdentity(value: ObjectValue, documentId: string, revisionId?: string): void {
  if (value.documentId !== documentId)
    throw new AuxError("ref_stale", "The original Google document identity changed.");
  if (revisionId !== undefined && value.revisionId !== revisionId)
    throw new AuxError("conflict", "The original Google document revision changed. Read it again.");
}

/** Explicit API body ranges, never the current browser canvas cursor or live selection. */
export function projectGoogleDocumentRange(
  value: ObjectValue,
  input: z.output<(typeof GoogleArguments)["docs.read"]>,
): ObjectValue {
  documentIdentity(value, input.documentId, input.bodyRange?.revisionId);
  if (!input.bodyRange) return value;
  const selected = input.bodyRange,
    tab = tabs(value).get(selected.tabId);
  if (!tab) throw new AuxError("ref_stale", "The original Google document tab is unavailable.");
  const snapshot = body(selected.tabId, tab, "read");
  if (
    selected.endIndex > snapshot.units.length ||
    !boundary(snapshot.units, selected.startIndex) ||
    !boundary(snapshot.units, selected.endIndex)
  )
    throw new AuxError(
      "invalid_params",
      "Choose a complete UTF-16 body range without splitting a Unicode character.",
    );
  const spans: { startIndex: number; endIndex: number; text: string }[] = [];
  let omittedNonText = false;
  for (let index = selected.startIndex; index < selected.endIndex; index++) {
    const unit = snapshot.units[index];
    if (!unit) {
      omittedNonText = true;
      continue;
    }
    const previous = spans.at(-1);
    if (previous?.endIndex === index) {
      previous.endIndex++;
      previous.text += unit.text;
    } else spans.push({ startIndex: index, endIndex: index + 1, text: unit.text });
  }
  return {
    documentId: input.documentId,
    revisionId: selected.revisionId,
    tabId: selected.tabId,
    scope: "api-body-range",
    indexUnit: "utf16",
    startIndex: selected.startIndex,
    endIndex: selected.endIndex,
    spans,
    omittedNonText,
  };
}

export type GoogleDocumentEditExpectation = {
  documentId: string;
  bodies: Map<string, Body>;
  originalRevisionId: string;
  documentMetadata: string;
  untouchedTabs: Map<string, string>;
  tabIds: string[];
  tableInsertion?: { tabId: string; index: number; rows: number; columns: number };
};
/** Exact revision-bound body edits; structural indices always originate in the current API read. */
export function prepareGoogleDocumentEdit(value: ObjectValue, raw: unknown): GoogleDocumentEditExpectation {
  const input = GoogleArguments["docs.edit"].parse(raw);
  documentIdentity(value, input.documentId, input.requiredRevisionId);
  const available = tabs(value),
    first = available.keys().next().value;
  if (!first) throw new AuxError("capability_unsupported", "Google returned no editable body tab.");
  const bodies = new Map<string, Body>();
  const editedTabs = new Set(input.edits.map((edit) => edit.tabId ?? first));
  const unchanged = {
    originalRevisionId: input.requiredRevisionId,
    documentMetadata: documentMetadata(value),
    tabIds: [...available.keys()],
    untouchedTabs: new Map(
      [...available].filter(([id]) => !editedTabs.has(id)).map(([id, tab]) => [id, canonical(tab)]),
    ),
  };
  for (const edit of input.edits) {
    const tabId = edit.tabId ?? first,
      tab = available.get(tabId);
    if (!tab) throw new AuxError("ref_stale", "The original Google document tab is unavailable.");
    let snapshot = bodies.get(tabId);
    if (!snapshot) {
      snapshot = body(tabId, tab);
      bodies.set(tabId, snapshot);
      if ([...bodies.values()].reduce((sum, item) => sum + item.units.length, 0) > MAX_UNITS)
        throw new AuxError("invalid_params", "The edits exceed the bounded document verification size.");
    }
    if (snapshot.structural)
      throw new AuxError(
        "capability_unsupported",
        "This bounded editor refuses unsupported inline objects or table-of-contents structures. Use the governed browser editor.",
      );
    const start = edit.kind === "insert" || edit.kind === "table" ? edit.index : edit.startIndex;
    const stop = edit.kind === "insert" || edit.kind === "table" ? start : edit.endIndex;
    if (
      !snapshot.units[start] ||
      start >= snapshot.units.length ||
      stop > snapshot.units.length ||
      !boundary(snapshot.units, start) ||
      !boundary(snapshot.units, stop)
    )
      throw new AuxError("invalid_params", "The edit must use complete current UTF-16 text boundaries.");
    if (edit.kind === "table") {
      if (
        input.edits.length !== 1 ||
        snapshot.tables.length ||
        (start > 1 && snapshot.units[start - 1]?.text !== "\n")
      )
        throw new AuxError(
          "capability_unsupported",
          "Insert one empty table at an observed body paragraph start, then read its actual cell indices before filling it.",
        );
      return {
        documentId: input.documentId,
        bodies,
        ...unchanged,
        tableInsertion: { tabId, index: start, rows: edit.rows, columns: edit.columns },
      };
    }
    if (
      snapshot.tables.length &&
      (!edit.tabId ||
        snapshot.units[start]?.container !== snapshot.units[Math.max(start, stop - 1)]?.container)
    )
      throw new AuxError(
        "capability_unsupported",
        "Choose one explicit observed table-cell or body text range.",
      );
    if (edit.kind === "paragraph" || edit.kind === "list") {
      if (
        (start > 1 && snapshot.units[start - 1]?.text !== "\n" && snapshot.units[start - 1] !== null) ||
        snapshot.units[stop - 1]?.text !== "\n" ||
        snapshot.units.slice(start, stop).some((unit) => !unit)
      )
        throw new AuxError(
          "invalid_params",
          "Formatting requires complete contiguous paragraphs including their final newline.",
        );
      const selected = snapshot.units.slice(start, stop);
      if (
        edit.kind === "list" &&
        selected.some((unit) => unit?.text === "\t" || unit?.bullet || unit?.wantedList)
      )
        throw new AuxError(
          "capability_unsupported",
          "Create flat lists from complete unlisted paragraphs without tabs; existing or nested list changes require the editor.",
        );
      for (let index = start; index < stop; index++) {
        const unit = snapshot.units[index]!;
        if (edit.kind === "list") unit.wantedList = edit.preset;
        else {
          unit.wantedParagraph = {
            ...unit.wantedParagraph,
            ...(edit.namedStyleType ? { namedStyleType: edit.namedStyleType } : {}),
            ...(edit.alignment ? { alignment: edit.alignment } : {}),
          };
          unit.paragraphStyle = {
            ...unit.paragraphStyle,
            ...(edit.namedStyleType ? { namedStyleType: edit.namedStyleType } : {}),
            ...(edit.alignment ? { alignment: edit.alignment } : {}),
          };
        }
      }
      continue;
    }
    if (edit.kind === "delete") {
      if (stop >= snapshot.units.length || snapshot.units.slice(start, stop).some((unit) => !unit))
        throw new AuxError(
          "capability_unsupported",
          "Deletion cannot remove structural content or the final document newline.",
        );
      if (
        snapshot.units[start]?.container !== "body" &&
        snapshot.units.slice(start, stop).some((unit) => unit?.text === "\n")
      )
        throw new AuxError("capability_unsupported", "Table cell paragraph boundaries must be preserved.");
      const beginsParagraph = start === 1 || snapshot.units[start - 1]?.text === "\n";
      if (
        !beginsParagraph &&
        snapshot.units.slice(start, stop).some((unit) => unit?.text === "\n") &&
        (canonical(snapshot.units[start]?.paragraphStyle) !==
          canonical(snapshot.units[stop]?.paragraphStyle) ||
          canonical(snapshot.units[start]?.bullet) !== canonical(snapshot.units[stop]?.bullet))
      )
        throw new AuxError(
          "capability_unsupported",
          "Merging differently formatted paragraphs requires the governed browser editor.",
        );
      snapshot.units.splice(start, stop - start);
      for (const anchor of snapshot.anchors) {
        if (anchor.start >= stop) anchor.start -= stop - start;
        if (anchor.end >= stop) anchor.end -= stop - start;
      }
    } else {
      if (
        !wellFormed(edit.text) ||
        // Refuse controls and stripped private-use text so verification remains exact.
        // eslint-disable-next-line no-control-regex
        /[\u0000-\u0008\u000b-\u001f\u007f-\u009f\ue000-\uf8ff]/.test(edit.text)
      )
        throw new AuxError("invalid_params", "Use supported, well-formed Unicode document text.");
      // Updating a range overlapping a link may rewrite the entire existing link.
      if (edit.link !== undefined && (snapshot.units[start - 1]?.link || snapshot.units[start]?.link))
        throw new AuxError("capability_unsupported", "Insert linked text outside an existing link boundary.");
      let insertedLink = snapshot.units[start - 1]?.link ?? snapshot.units[start]?.link ?? null;
      if (edit.link !== undefined) insertedLink = edit.link ? { url: edit.link } : null;
      const paragraph = snapshot.units[start]!;
      if (paragraph.container !== "body" && edit.text.includes("\n"))
        throw new AuxError(
          "capability_unsupported",
          "Insert table-cell text without changing its paragraph boundaries.",
        );
      const inserted = edit.text.split("").map((text) => ({
        text,
        container: paragraph.container,
        paragraphStyle: paragraph.paragraphStyle,
        paragraphMetadata: paragraph.paragraphMetadata,
        contentMetadata: paragraph.contentMetadata,
        wantedParagraph: paragraph.wantedParagraph,
        headingId: paragraph.headingId,
        bullet: paragraph.bullet,
        wantedList: paragraph.wantedList,
        link: text === "\n" ? null : insertedLink,
        wanted: {
          bold: edit.bold,
          italic: edit.italic,
          underline: edit.underline ?? (edit.link && text !== "\n" ? true : undefined),
          link: text === "\n" && edit.link ? null : edit.link,
        },
      }));
      snapshot.units.splice(start, 0, ...inserted);
      for (const anchor of snapshot.anchors) {
        if (anchor.start >= start) anchor.start += inserted.length;
        if (anchor.end > start) anchor.end += inserted.length;
      }
    }
    if ([...bodies.values()].reduce((sum, item) => sum + item.units.length, 0) > MAX_UNITS)
      throw new AuxError("invalid_params", "The edits exceed the bounded document verification size.");
  }
  return { documentId: input.documentId, bodies, ...unchanged };
}
export function verifyGoogleDocumentEdit(
  value: ObjectValue,
  expected: GoogleDocumentEditExpectation,
): boolean {
  try {
    documentIdentity(value, expected.documentId);
    if (
      typeof value.revisionId !== "string" ||
      !value.revisionId ||
      value.revisionId === expected.originalRevisionId
    )
      return false;
    const available = tabs(value);
    if (documentMetadata(value) !== expected.documentMetadata) return false;
    if (canonical([...available.keys()]) !== canonical(expected.tabIds)) return false;
    for (const [id, original] of expected.untouchedTabs)
      if (canonical(available.get(id)) !== original) return false;
    for (const [tabId, wanted] of expected.bodies) {
      const tab = available.get(tabId);
      if (!tab) return false;
      const actual = body(tabId, tab);
      if (actual.structural || actual.metadata !== wanted.metadata) return false;
      if (expected.tableInsertion?.tabId === tabId) {
        const insertion = expected.tableInsertion;
        const content = array(object(tab.body).content),
          tables = content.map(object).filter((item) => item.table);
        if (tables.length !== 1) return false;
        const inserted = tables[0]!,
          table = object(inserted.table),
          end = inserted.endIndex;
        if (
          inserted.startIndex !== insertion.index + 1 ||
          table.rows !== insertion.rows ||
          table.columns !== insertion.columns ||
          !Number.isSafeInteger(end)
        )
          return false;
        if (actual.units[insertion.index]?.text !== "\n") return false;
        for (const row of array(table.tableRows))
          for (const cell of array(object(row).tableCells)) {
            const contents = array(object(cell).content);
            if (contents.length !== 1) return false;
            const paragraph = object(object(contents[0]).paragraph);
            const elements = array(paragraph.elements);
            if (elements.length !== 1 || object(object(elements[0]).textRun).content !== "\n") return false;
          }
        const removed = (end as number) - insertion.index;
        actual.units.splice(insertion.index, removed);
        actual.anchors = actual.anchors.filter((anchor) => anchor.label.startsWith("section:"));
        for (const anchor of actual.anchors) {
          if (anchor.start < (end as number) && anchor.end > insertion.index) return false;
          if (anchor.start >= (end as number)) anchor.start -= removed;
          if (anchor.end >= (end as number)) anchor.end -= removed;
        }
      } else if (canonical(actual.tables) !== canonical(wanted.tables)) return false;
      if (canonical(actual.anchors) !== canonical(wanted.anchors)) return false;
      for (const [id, original] of wanted.lists) if (actual.lists.get(id) !== original) return false;
      for (const id of actual.lists.keys()) {
        if (
          !wanted.lists.has(id) &&
          !actual.units.some((unit, index) => unit?.bullet?.listId === id && wanted.units[index]?.wantedList)
        )
          return false;
      }
      if (actual.units.length !== wanted.units.length) return false;
      for (let index = 0; index < wanted.units.length; index++) {
        const original = wanted.units[index],
          observed = actual.units[index];
        if (!original || !observed) {
          if (original !== observed) return false;
          continue;
        }
        if (original.text !== observed.text || original.container !== observed.container) return false;
        if (
          original.paragraphMetadata !== observed.paragraphMetadata ||
          original.contentMetadata !== observed.contentMetadata ||
          (original.elementMetadata !== undefined && original.elementMetadata !== observed.elementMetadata) ||
          (original.runMetadata !== undefined && original.runMetadata !== observed.runMetadata)
        )
          return false;
        if (!original.wantedParagraph?.namedStyleType && original.headingId !== observed.headingId)
          return false;
        if (original.directStyle && canonical(original.directStyle) !== canonical(observed.directStyle))
          return false;
        const comparableParagraph = (style: ObjectValue) =>
          Object.fromEntries(
            Object.entries(style).filter(
              ([key]) =>
                !original.wantedList || !["indentStart", "indentEnd", "indentFirstLine"].includes(key),
            ),
          );
        // A named style deliberately applies the captured document's preset, which may reset other paragraph properties.
        // Unrelated paragraphs and explicit alignment-only changes still require full original-style preservation.
        if (original.wantedParagraph?.namedStyleType) {
          if (
            Object.entries(original.wantedParagraph).some(
              ([key, value]) => observed.paragraphStyle[key] !== value,
            )
          )
            return false;
        } else if (
          canonical(comparableParagraph(original.paragraphStyle)) !==
          canonical(comparableParagraph(observed.paragraphStyle))
        )
          return false;
        if (original.wantedList) {
          const bullet = observed.bullet;
          if (!bullet || bullet.nestingLevel !== 0) return false;
          const level = object(bullet.level);
          if (
            original.wantedList === "NUMBERED_DECIMAL_ALPHA_ROMAN"
              ? level.glyphType !== "DECIMAL" || level.glyphFormat !== "%0."
              : level.glyphSymbol !== "●" || level.glyphFormat !== "%0"
          )
            return false;
        } else if (canonical(original.bullet) !== canonical(observed.bullet)) return false;
        if (
          original.wanted &&
          ((original.wanted.bold !== undefined && original.wanted.bold !== observed.bold) ||
            (original.wanted.italic !== undefined && original.wanted.italic !== observed.italic) ||
            (original.wanted.underline !== undefined && original.wanted.underline !== observed.underline) ||
            (original.wanted.link === null && observed.link !== null) ||
            (typeof original.wanted.link === "string" &&
              (!observed.link ||
                observed.link.url !== original.wanted.link ||
                Object.keys(observed.link).length !== 1)))
        )
          return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/** Actual API paragraph properties after successful verification, including dependent named-style normalization. */
export function verifiedGoogleDocumentFormatting(
  value: ObjectValue,
  expected: GoogleDocumentEditExpectation,
) {
  const paragraphs: {
    tabId: string;
    startIndex: number;
    endIndex: number;
    paragraphStyle: ObjectValue;
    bullet?: ObjectValue;
  }[] = [];
  let bytes = 0,
    truncated = false;
  const available = tabs(value);
  for (const [tabId, wanted] of expected.bodies) {
    const tab = available.get(tabId);
    if (!tab) throw new AuxError("ref_stale", "The verified Google document tab is unavailable.");
    const visit = (content: unknown) => {
      for (const item of array(content).map(object)) {
        if (item.table) {
          for (const row of array(object(item.table).tableRows))
            for (const cell of array(object(row).tableCells)) visit(object(cell).content);
        } else if (item.paragraph) {
          const startIndex = item.startIndex as number,
            endIndex = item.endIndex as number;
          if (
            !wanted.units
              .slice(startIndex, endIndex)
              .some((unit) => unit?.wantedParagraph || unit?.wantedList)
          )
            continue;
          const paragraph = object(item.paragraph);
          const entry = {
            tabId,
            startIndex,
            endIndex,
            paragraphStyle: object(paragraph.paragraphStyle ?? {}),
            ...(paragraph.bullet ? { bullet: object(paragraph.bullet) } : {}),
          };
          const size = Buffer.byteLength(JSON.stringify(entry), "utf8");
          if (paragraphs.length >= 100 || bytes + size > 24_000) {
            truncated = true;
            continue;
          }
          paragraphs.push(entry);
          bytes += size;
        }
      }
    };
    visit(object(tab.body).content);
  }
  return { paragraphs, truncated };
}
