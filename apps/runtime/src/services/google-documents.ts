import { AuxError } from "@aux/contracts";
import { GoogleArguments } from "@aux/contracts/google";
import type { z } from "zod";

type ObjectValue = Record<string, unknown>;
type Unit = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  link: ObjectValue | null;
  wanted?: { bold?: boolean; italic?: boolean; underline?: boolean; link?: string | null };
};
type Body = { tabId: string; units: (Unit | null)[]; structural: boolean };
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
function body(tabId: string, tab: ObjectValue): Body {
  const units: Body["units"] = [];
  let structural = false,
    visited = 0;
  const named = new Map<string, ObjectValue>();
  if (tab.namedStyles)
    for (const value of array(object(tab.namedStyles).styles)) {
      const style = object(value);
      if (typeof style.namedStyleType === "string")
        named.set(style.namedStyleType, object(style.textStyle ?? {}));
    }
  const visit = (content: unknown, depth: number) => {
    if (depth > 16) throw new AuxError("invalid_params", "Choose a less deeply nested Google document.");
    for (const value of array(content)) {
      if (++visited > 20_000) throw new AuxError("invalid_params", "Choose a smaller Google document.");
      const item = object(value),
        end = item.endIndex;
      if (!Number.isSafeInteger(end) || (end as number) < 0 || (end as number) > MAX_UNITS)
        throw new AuxError("invalid_params", "The Google document exceeds the bounded UTF-16 range.");
      if ((end as number) > units.length) units.length = end as number;
      if (item.paragraph) {
        const paragraph = object(item.paragraph),
          style = object(paragraph.paragraphStyle ?? {});
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
            (stop as number) > units.length ||
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
              bold,
              italic,
              underline,
              // Links are explicitly not inherited in the Docs API.
              link,
            };
          }
        }
      } else if (item.table) {
        structural = true;
        for (const row of array(object(item.table).tableRows))
          for (const cell of array(object(row).tableCells)) {
            if (++visited > 20_000) throw new AuxError("invalid_params", "Choose a smaller Google document.");
            visit(object(cell).content, depth + 1);
          }
      } else if (item.tableOfContents) {
        structural = true;
        visit(object(item.tableOfContents).content, depth + 1);
      } else if (!item.sectionBreak) structural = true;
    }
  };
  visit(object(tab.body).content, 0);
  return {
    tabId,
    units: Array.from(units, (value) => value ?? null),
    structural,
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
  const snapshot = body(selected.tabId, tab);
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
};
/** Only text bodies are edited. Tables, objects and unsupported structural changes are rejected before dispatch. */
export function prepareGoogleDocumentEdit(value: ObjectValue, raw: unknown): GoogleDocumentEditExpectation {
  const input = GoogleArguments["docs.edit"].parse(raw);
  documentIdentity(value, input.documentId, input.requiredRevisionId);
  const available = tabs(value),
    first = available.keys().next().value;
  if (!first) throw new AuxError("capability_unsupported", "Google returned no editable body tab.");
  const bodies = new Map<string, Body>();
  for (const edit of input.edits) {
    const tabId = edit.tabId ?? first,
      tab = available.get(tabId);
    if (!tab) throw new AuxError("ref_stale", "The original Google document tab is unavailable.");
    let snapshot = bodies.get(tabId);
    if (!snapshot) {
      snapshot = body(tabId, tab);
      bodies.set(tabId, snapshot);
    }
    if (snapshot.structural)
      throw new AuxError(
        "capability_unsupported",
        "This bounded editor refuses bodies containing tables or inline objects.",
      );
    const start = edit.kind === "insert" ? edit.index : edit.startIndex;
    const stop = edit.kind === "insert" ? start : edit.endIndex;
    if (
      !snapshot.units[start] ||
      start >= snapshot.units.length ||
      stop > snapshot.units.length ||
      !boundary(snapshot.units, start) ||
      !boundary(snapshot.units, stop)
    )
      throw new AuxError("invalid_params", "The edit must use complete current UTF-16 text boundaries.");
    if (edit.kind === "delete") {
      if (stop >= snapshot.units.length || snapshot.units.slice(start, stop).some((unit) => !unit))
        throw new AuxError(
          "capability_unsupported",
          "Deletion cannot remove structural content or the final document newline.",
        );
      snapshot.units.splice(start, stop - start);
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
      const inserted = edit.text.split("").map((text) => ({
        text,
        link: text === "\n" ? null : insertedLink,
        wanted: {
          bold: edit.bold,
          italic: edit.italic,
          underline: edit.underline ?? (edit.link && text !== "\n" ? true : undefined),
          link: text === "\n" && edit.link ? null : edit.link,
        },
      }));
      snapshot.units.splice(start, 0, ...inserted);
    }
    if ([...bodies.values()].reduce((sum, item) => sum + item.units.length, 0) > MAX_UNITS)
      throw new AuxError("invalid_params", "The edits exceed the bounded document verification size.");
  }
  return { documentId: input.documentId, bodies };
}
export function verifyGoogleDocumentEdit(
  value: ObjectValue,
  expected: GoogleDocumentEditExpectation,
): boolean {
  try {
    documentIdentity(value, expected.documentId);
    if (typeof value.revisionId !== "string" || !value.revisionId) return false;
    const available = tabs(value);
    for (const [tabId, wanted] of expected.bodies) {
      const tab = available.get(tabId);
      if (!tab) return false;
      const actual = body(tabId, tab);
      if (actual.structural || actual.units.length !== wanted.units.length) return false;
      for (let index = 0; index < wanted.units.length; index++) {
        const original = wanted.units[index],
          observed = actual.units[index];
        if (!original || !observed) {
          if (original !== observed) return false;
          continue;
        }
        if (original.text !== observed.text) return false;
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
