import { expect, it } from "vitest";
import { GoogleArguments } from "@aux/contracts/google";
import {
  prepareGoogleDocumentEdit,
  projectGoogleDocumentRange,
  verifyGoogleDocumentEdit,
} from "../../apps/runtime/src/services/google-documents.js";
import { prepareGoogleRequest } from "../../apps/runtime/src/services/google-rest.js";

type ObjectValue = Record<string, unknown>;
function set(value: unknown, path: (string | number)[], replacement: unknown): void {
  let current = value;
  for (const key of path.slice(0, -1)) {
    if (!current || typeof current !== "object") throw Error("Invalid synthetic fixture path");
    current = Reflect.get(current, key);
  }
  const key = path.at(-1);
  if (!current || typeof current !== "object" || key === undefined)
    throw Error("Invalid synthetic fixture path");
  Reflect.set(current, key, replacement);
}
const bodyPath = ["tabs", 0, "documentTab", "body", "content"];

const paragraph = (text: string, start: number, paragraphStyle: ObjectValue = {}, bullet?: ObjectValue) => ({
  startIndex: start,
  endIndex: start + text.length,
  paragraph: {
    paragraphStyle,
    ...(bullet ? { bullet } : {}),
    elements: [
      { startIndex: start, endIndex: start + text.length, textRun: { content: text, textStyle: {} } },
    ],
  },
});
const document = (content: ObjectValue[], revisionId = "r1", extra: ObjectValue = {}) => ({
  documentId: "doc1",
  revisionId,
  tabs: [
    {
      tabProperties: { tabId: "tab1" },
      documentTab: {
        body: { content: [{ startIndex: 0, endIndex: 1, sectionBreak: {} }, ...content] },
        ...extra,
      },
    },
  ],
});
const edit = (edits: ObjectValue[]) => ({ documentId: "doc1", requiredRevisionId: "r1", edits });
const simple = () =>
  document([
    paragraph("One\n", 1, { namedStyleType: "NORMAL_TEXT", alignment: "START" }),
    paragraph("Two\n", 5, { namedStyleType: "NORMAL_TEXT", alignment: "START" }),
  ]);
function emptyTable(index = 2) {
  return {
    startIndex: index,
    endIndex: index + 6,
    table: {
      rows: 1,
      columns: 1,
      tableRows: [
        {
          startIndex: index + 1,
          endIndex: index + 5,
          tableCells: [
            {
              startIndex: index + 2,
              endIndex: index + 5,
              tableCellStyle: { rowSpan: 1, columnSpan: 1 },
              content: [paragraph("\n", index + 3)],
            },
          ],
        },
      ],
    },
  };
}
it("binds paragraph formatting to complete original paragraphs and verifies headings/alignment without changing the neighboring paragraph", () => {
  const input = edit([
    {
      kind: "paragraph",
      tabId: "tab1",
      startIndex: 1,
      endIndex: 5,
      namedStyleType: "HEADING_2",
      alignment: "CENTER",
    },
  ]);
  const expected = prepareGoogleDocumentEdit(simple(), input);
  const actual = document(
    [
      paragraph("One\n", 1, { namedStyleType: "HEADING_2", alignment: "CENTER", headingId: "generated" }),
      paragraph("Two\n", 5, { namedStyleType: "NORMAL_TEXT", alignment: "START" }),
    ],
    "r2",
  );
  expect(verifyGoogleDocumentEdit(actual, expected)).toBe(true);
  for (const [path, replacement] of [
    [[...bodyPath, 1, "paragraph", "paragraphStyle", "alignment"], "END"],
    [[...bodyPath, 2, "paragraph", "paragraphStyle", "namedStyleType"], "HEADING_3"],
    [["revisionId"], "r1"],
  ] as const) {
    const bad = structuredClone(actual);
    set(bad, [...path], replacement);
    expect(verifyGoogleDocumentEdit(bad, expected)).toBe(false);
  }
  expect(() => prepareGoogleDocumentEdit(simple(), edit([{ ...input.edits[0], startIndex: 2 }]))).toThrow(
    /complete/,
  );
  const request = prepareGoogleRequest("docs.edit", input, "action");
  expect(JSON.parse(request.body!)).toEqual({
    writeControl: { requiredRevisionId: "r1" },
    requests: [
      {
        updateParagraphStyle: {
          range: { startIndex: 1, endIndex: 5, tabId: "tab1" },
          paragraphStyle: { namedStyleType: "HEADING_2", alignment: "CENTER" },
          fields: "namedStyleType,alignment",
        },
      },
    ],
  });
});
it.each(["BULLET_DISC_CIRCLE_SQUARE", "NUMBERED_DECIMAL_ALPHA_ROMAN"])(
  "proves actual level-zero list glyphs for %s instead of trusting ACKs or model metadata",
  (preset) => {
    const expected = prepareGoogleDocumentEdit(
      simple(),
      edit([{ kind: "list", tabId: "tab1", startIndex: 1, endIndex: 9, preset }]),
    );
    const level = preset.startsWith("NUMBERED")
      ? { glyphType: "DECIMAL", glyphFormat: "%0." }
      : { glyphSymbol: "●", glyphFormat: "%0" };
    const actual = document(
      [
        paragraph(
          "One\n",
          1,
          { namedStyleType: "NORMAL_TEXT", alignment: "START" },
          { listId: "observed-list" },
        ),
        paragraph(
          "Two\n",
          5,
          { namedStyleType: "NORMAL_TEXT", alignment: "START" },
          { listId: "observed-list" },
        ),
      ],
      "r2",
      { lists: { "observed-list": { listProperties: { nestingLevels: [level] } } } },
    );
    expect(verifyGoogleDocumentEdit(actual, expected)).toBe(true);
    const bad = structuredClone(actual);
    set(
      bad,
      [
        "tabs",
        0,
        "documentTab",
        "lists",
        "observed-list",
        "listProperties",
        "nestingLevels",
        0,
        "glyphFormat",
      ],
      "%0)",
    );
    expect(verifyGoogleDocumentEdit(bad, expected)).toBe(false);
    const missing = structuredClone(actual);
    set(missing, ["tabs", 0, "documentTab", "lists"], undefined);
    expect(verifyGoogleDocumentEdit(missing, expected)).toBe(false);
    expect(() =>
      prepareGoogleDocumentEdit(
        document([paragraph("\tOne\n", 1)]),
        edit([{ kind: "list", startIndex: 1, endIndex: 6, preset }]),
      ),
    ).toThrow(/without tabs/);
  },
);
it("inserts only a sole bounded empty table and independently checks position, shape, empty cells, unchanged original text and styles", () => {
  const source = document([paragraph("Keep\n", 1, { alignment: "END" })]);
  const input = edit([{ kind: "table", index: 1, tabId: "tab1", rows: 1, columns: 1 }]);
  const expected = prepareGoogleDocumentEdit(source, input);
  const actual = document(
    [paragraph("\n", 1), emptyTable(), paragraph("Keep\n", 8, { alignment: "END" })],
    "r2",
  );
  expect(verifyGoogleDocumentEdit(actual, expected)).toBe(true);
  for (const [path, replacement] of [
    [[...bodyPath, 2, "table", "columns"], 2],
    [[...bodyPath, 2, "startIndex"], 3],
    [
      [
        ...bodyPath,
        2,
        "table",
        "tableRows",
        0,
        "tableCells",
        0,
        "content",
        0,
        "paragraph",
        "elements",
        0,
        "textRun",
        "content",
      ],
      "X",
    ],
    [[...bodyPath, 3, "paragraph", "paragraphStyle", "alignment"], "START"],
  ] as const) {
    const bad = structuredClone(actual);
    set(bad, [...path], replacement);
    expect(verifyGoogleDocumentEdit(bad, expected)).toBe(false);
  }
  expect(() =>
    prepareGoogleDocumentEdit(source, edit([...input.edits, { kind: "insert", index: 1, text: "x" }])),
  ).toThrow(/one empty table/);
  expect(() => prepareGoogleDocumentEdit(source, edit([{ ...input.edits[0], index: 2 }]))).toThrow(
    /paragraph start/,
  );
  expect(
    GoogleArguments["docs.edit"].safeParse(edit([{ ...input.edits[0], rows: 20, columns: 10 }])).success,
  ).toBe(false);
  expect(JSON.parse(prepareGoogleRequest("docs.edit", input, "action").body!).requests).toEqual([
    { insertTable: { location: { index: 1, tabId: "tab1" }, rows: 1, columns: 1 } },
  ]);
});
it("fills only actual fresh unmerged cell text indices, preserves table geometry/styles and refuses stale or structural cell ranges", () => {
  const source = document([paragraph("\n", 1), emptyTable(), paragraph("Keep\n", 8)], "r1");
  const input = edit([{ kind: "insert", index: 5, tabId: "tab1", text: "Hello", bold: true }]);
  const expected = prepareGoogleDocumentEdit(source, input);
  const table = emptyTable();
  table.endIndex += 5;
  table.table.tableRows[0]!.endIndex += 5;
  const cell = table.table.tableRows[0]!.tableCells[0]!;
  cell.endIndex += 5;
  cell.content = [paragraph("Hello\n", 5)];
  cell.content[0]!.paragraph.elements = [
    { startIndex: 5, endIndex: 10, textRun: { content: "Hello", textStyle: { bold: true } } },
    { startIndex: 10, endIndex: 11, textRun: { content: "\n", textStyle: {} } },
  ];
  const actual = document([paragraph("\n", 1), table, paragraph("Keep\n", 13)], "r2");
  expect(verifyGoogleDocumentEdit(actual, expected)).toBe(true);
  const bad = structuredClone(actual);
  set(bad, [...bodyPath, 2, "table", "tableRows", 0, "tableCells", 0, "tableCellStyle", "rowSpan"], 2);
  expect(verifyGoogleDocumentEdit(bad, expected)).toBe(false);
  for (const item of [
    { kind: "insert", index: 4, tabId: "tab1", text: "X" },
    { kind: "insert", index: 5, text: "X" },
    { kind: "insert", index: 5, tabId: "tab1", text: "X\n" },
    { kind: "delete", startIndex: 5, endIndex: 6, tabId: "tab1" },
  ])
    expect(() => prepareGoogleDocumentEdit(source, edit([item]))).toThrow();
  expect(() => prepareGoogleDocumentEdit({ ...source, revisionId: "retired" }, input)).toThrow(/revision/);
});
it("preserves unmodified tab content and refuses cross-tab substitution", () => {
  const source = simple();
  source.tabs.push({
    tabProperties: { tabId: "untouched" },
    documentTab: { body: { content: [paragraph("Original\n", 1)] } },
  });
  const expected = prepareGoogleDocumentEdit(
    source,
    edit([{ kind: "paragraph", tabId: "tab1", startIndex: 1, endIndex: 5, alignment: "CENTER" }]),
  );
  const actual = structuredClone(source);
  actual.revisionId = "r2";
  set(actual, [...bodyPath, 1, "paragraph", "paragraphStyle", "alignment"], "CENTER");
  expect(verifyGoogleDocumentEdit(actual, expected)).toBe(true);
  set(
    actual,
    ["tabs", 1, "documentTab", "body", "content", 0, "paragraph", "elements", 0, "textRun", "content"],
    "Changed\n",
  );
  expect(verifyGoogleDocumentEdit(actual, expected)).toBe(false);
});

it("allows the documented target named-style preset reset while preserving unrelated paragraph styles and captured presets", () => {
  const source = simple();
  set(source, [...bodyPath, 1, "paragraph", "paragraphStyle", "spaceAbove"], { magnitude: 0, unit: "PT" });
  set(source, ["tabs", 0, "documentTab", "namedStyles"], {
    styles: [{ namedStyleType: "HEADING_2", paragraphStyle: { spaceAbove: { magnitude: 20, unit: "PT" } } }],
  });
  const expected = prepareGoogleDocumentEdit(
    source,
    edit([{ kind: "paragraph", tabId: "tab1", startIndex: 1, endIndex: 5, namedStyleType: "HEADING_2" }]),
  );
  const actual = structuredClone(source);
  actual.revisionId = "r2";
  set(actual, [...bodyPath, 1, "paragraph", "paragraphStyle", "namedStyleType"], "HEADING_2");
  set(actual, [...bodyPath, 1, "paragraph", "paragraphStyle", "spaceAbove"], { magnitude: 20, unit: "PT" });
  expect(verifyGoogleDocumentEdit(actual, expected)).toBe(true);
  set(actual, [...bodyPath, 2, "paragraph", "paragraphStyle", "spaceAbove"], { magnitude: 20, unit: "PT" });
  expect(verifyGoogleDocumentEdit(actual, expected)).toBe(false);
});

it("retains explicit read-only range projection for merged tables that cannot be safely mutated", () => {
  const table = emptyTable();
  table.table.tableRows[0]!.tableCells[0]!.tableCellStyle.rowSpan = 2;
  const source = document([paragraph("\n", 1), table, paragraph("Keep\n", 8)]);
  expect(
    projectGoogleDocumentRange(source, {
      documentId: "doc1",
      bodyRange: { revisionId: "r1", tabId: "tab1", startIndex: 5, endIndex: 6 },
    }),
  ).toMatchObject({ spans: [{ startIndex: 5, endIndex: 6, text: "\n" }] });
  expect(() =>
    prepareGoogleDocumentEdit(source, edit([{ kind: "insert", tabId: "tab1", index: 5, text: "X" }])),
  ).toThrow(/Merged/);
});
it("composes rich insertion in one ordered revision-bound batch and verifies inserted headings/lists plus unchanged original content", () => {
  const normal = { namedStyleType: "NORMAL_TEXT", alignment: "START" };
  const source = document([paragraph("Keep\n", 1, normal)]);
  const input = edit([
    { kind: "insert", tabId: "tab1", index: 1, text: "Title\nOne\nTwo\n" },
    { kind: "paragraph", tabId: "tab1", startIndex: 1, endIndex: 7, namedStyleType: "HEADING_1" },
    { kind: "list", tabId: "tab1", startIndex: 7, endIndex: 15, preset: "NUMBERED_DECIMAL_ALPHA_ROMAN" },
  ]);
  const expected = prepareGoogleDocumentEdit(source, input);
  const actual = document(
    [
      paragraph("Title\n", 1, { namedStyleType: "HEADING_1", alignment: "START" }),
      paragraph("One\n", 7, normal, { listId: "actual-list" }),
      paragraph("Two\n", 11, normal, { listId: "actual-list" }),
      paragraph("Keep\n", 15, normal),
    ],
    "r2",
    {
      lists: {
        "actual-list": { listProperties: { nestingLevels: [{ glyphType: "DECIMAL", glyphFormat: "%0." }] } },
      },
    },
  );
  expect(verifyGoogleDocumentEdit(actual, expected)).toBe(true);
  const requests = JSON.parse(prepareGoogleRequest("docs.edit", input, "action").body!).requests;
  expect(requests.map(Object.keys)).toEqual([
    ["insertText"],
    ["updateParagraphStyle"],
    ["createParagraphBullets"],
  ]);
  set(actual, [...bodyPath, 4, "paragraph", "elements", 0, "textRun", "textStyle", "bold"], true);
  expect(verifyGoogleDocumentEdit(actual, expected)).toBe(false);
});

it("refuses an unproven differently styled paragraph merge before write dispatch", () => {
  const source = document([
    paragraph("One\n", 1, { namedStyleType: "HEADING_1" }),
    paragraph("Two\n", 5, { namedStyleType: "NORMAL_TEXT" }),
  ]);
  expect(() =>
    prepareGoogleDocumentEdit(source, edit([{ kind: "delete", tabId: "tab1", startIndex: 2, endIndex: 6 }])),
  ).toThrow(/Merging differently formatted/);
});

it.each(["document-title", "tab-title", "section-style"] as const)(
  "refuses unrelated %s metadata changes after an otherwise matching alignment edit",
  (field) => {
    const source = simple();
    Object.assign(source, { title: "Original document" });
    Object.assign(source.tabs[0]!.tabProperties, { title: "Original tab", index: 0 });
    set(source, [...bodyPath, 0, "sectionBreak"], { sectionStyle: { sectionType: "CONTINUOUS" } });
    const expected = prepareGoogleDocumentEdit(
      source,
      edit([{ kind: "paragraph", tabId: "tab1", startIndex: 1, endIndex: 5, alignment: "CENTER" }]),
    );
    const actual = structuredClone(source);
    actual.revisionId = "r2";
    set(actual, [...bodyPath, 1, "paragraph", "paragraphStyle", "alignment"], "CENTER");
    expect(verifyGoogleDocumentEdit(actual, expected)).toBe(true);
    const changes = {
      "document-title": { path: ["title"], value: "Unapproved document title" },
      "tab-title": { path: ["tabs", 0, "tabProperties", "title"], value: "Unapproved tab title" },
      "section-style": {
        path: [...bodyPath, 0, "sectionBreak", "sectionStyle", "sectionType"],
        value: "NEXT_PAGE",
      },
    };
    const change = changes[field];
    set(actual, change.path, change.value);
    expect(verifyGoogleDocumentEdit(actual, expected)).toBe(false);
  },
);
it("preserves section descriptors with exactly approved insert/delete boundary shifts", () => {
  const section = (index: number) => ({
    startIndex: index,
    endIndex: index + 1,
    sectionBreak: { sectionStyle: { sectionType: "NEXT_PAGE" } },
  });
  const source = document([paragraph("A\n", 1), section(3), paragraph("B\n", 4)]);
  const inserted = document([paragraph("xA\n", 1), section(4), paragraph("B\n", 5)], "r2");
  const expected = prepareGoogleDocumentEdit(
    source,
    edit([{ kind: "insert", tabId: "tab1", index: 1, text: "x" }]),
  );
  expect(verifyGoogleDocumentEdit(inserted, expected)).toBe(true);
  const stale = structuredClone(inserted);
  set(stale, [...bodyPath, 2, "startIndex"], 3);
  expect(verifyGoogleDocumentEdit(stale, expected)).toBe(false);
  const deletion = prepareGoogleDocumentEdit(inserted, {
    documentId: "doc1",
    requiredRevisionId: "r2",
    edits: [{ kind: "delete", tabId: "tab1", startIndex: 1, endIndex: 2 }],
  });
  expect(verifyGoogleDocumentEdit({ ...source, revisionId: "r3" }, deletion)).toBe(true);
  const changed = structuredClone(source);
  changed.revisionId = "r3";
  set(changed, [...bodyPath, 2, "sectionBreak", "sectionStyle", "sectionType"], "CONTINUOUS");
  expect(verifyGoogleDocumentEdit(changed, deletion)).toBe(false);
});
it("preserves tab parent/order/tree metadata even when flattened tab identities remain the same", () => {
  const source = simple();
  const child = {
    tabProperties: { tabId: "child", parentTabId: "tab1", index: 0, title: "Child" },
    documentTab: { body: { content: [paragraph("Child\n", 1)] } },
  };
  Object.assign(source.tabs[0]!, { childTabs: [child] });
  const expected = prepareGoogleDocumentEdit(
    source,
    edit([{ kind: "paragraph", tabId: "tab1", startIndex: 1, endIndex: 5, alignment: "CENTER" }]),
  );
  const actual = structuredClone(source);
  actual.revisionId = "r2";
  set(actual, [...bodyPath, 1, "paragraph", "paragraphStyle", "alignment"], "CENTER");
  expect(verifyGoogleDocumentEdit(actual, expected)).toBe(true);
  const moved = structuredClone(actual);
  set(moved, ["tabs", 0, "childTabs"], undefined);
  moved.tabs.push(child);
  expect(verifyGoogleDocumentEdit(moved, expected)).toBe(false);
  for (const [field, value] of [
    ["parentTabId", "other"],
    ["index", 1],
    ["title", "Renamed child"],
  ] as const) {
    const changed = structuredClone(actual);
    set(changed, ["tabs", 0, "childTabs", 0, "tabProperties", field], value);
    expect(verifyGoogleDocumentEdit(changed, expected)).toBe(false);
  }
});
it("preserves unrelated heading identities while permitting generation only on explicitly restyled paragraphs", () => {
  const source = simple();
  set(source, [...bodyPath, 2, "paragraph", "paragraphStyle"], {
    namedStyleType: "HEADING_2",
    alignment: "START",
    headingId: "original-heading",
  });
  const expected = prepareGoogleDocumentEdit(
    source,
    edit([{ kind: "paragraph", tabId: "tab1", startIndex: 1, endIndex: 5, namedStyleType: "HEADING_1" }]),
  );
  const actual = structuredClone(source);
  actual.revisionId = "r2";
  set(actual, [...bodyPath, 1, "paragraph", "paragraphStyle"], {
    namedStyleType: "HEADING_1",
    headingId: "new-target-heading",
  });
  expect(verifyGoogleDocumentEdit(actual, expected)).toBe(true);
  set(actual, [...bodyPath, 2, "paragraph", "paragraphStyle", "headingId"], "unapproved-heading");
  expect(verifyGoogleDocumentEdit(actual, expected)).toBe(false);
});
it("preserves original list definitions and refuses unrelated generated list metadata", () => {
  const source = simple();
  Object.assign(source.tabs[0]!.documentTab, {
    lists: {
      original: { listProperties: { nestingLevels: [{ glyphType: "DECIMAL", glyphFormat: "%0." }] } },
    },
  });
  const expected = prepareGoogleDocumentEdit(
    source,
    edit([{ kind: "paragraph", tabId: "tab1", startIndex: 1, endIndex: 5, alignment: "CENTER" }]),
  );
  const actual = structuredClone(source);
  actual.revisionId = "r2";
  set(actual, [...bodyPath, 1, "paragraph", "paragraphStyle", "alignment"], "CENTER");
  expect(verifyGoogleDocumentEdit(actual, expected)).toBe(true);
  set(
    actual,
    ["tabs", 0, "documentTab", "lists", "original", "listProperties", "nestingLevels", 0, "glyphFormat"],
    "%0)",
  );
  expect(verifyGoogleDocumentEdit(actual, expected)).toBe(false);
  const extra = structuredClone(source);
  extra.revisionId = "r2";
  set(extra, [...bodyPath, 1, "paragraph", "paragraphStyle", "alignment"], "CENTER");
  set(extra, ["tabs", 0, "documentTab", "lists", "unapproved"], { listProperties: { nestingLevels: [] } });
  expect(verifyGoogleDocumentEdit(extra, expected)).toBe(false);
});
it("normalizes only the observed inserted-table extent while preserving subsequent section descriptors and bounds", () => {
  const section = (index: number) => ({
    startIndex: index,
    endIndex: index + 1,
    sectionBreak: { sectionStyle: { sectionType: "NEXT_PAGE" } },
  });
  const source = document([paragraph("A\n", 1), section(3), paragraph("B\n", 4)]);
  const expected = prepareGoogleDocumentEdit(
    source,
    edit([{ kind: "table", tabId: "tab1", index: 1, rows: 1, columns: 1 }]),
  );
  const actual = document(
    [paragraph("\n", 1), emptyTable(), paragraph("A\n", 8), section(10), paragraph("B\n", 11)],
    "r2",
  );
  expect(verifyGoogleDocumentEdit(actual, expected)).toBe(true);
  set(actual, [...bodyPath, 4, "sectionBreak", "sectionStyle", "sectionType"], "CONTINUOUS");
  expect(verifyGoogleDocumentEdit(actual, expected)).toBe(false);
});
it("refuses unknown unrelated paragraph, element, run or body metadata changes", () => {
  const source = simple();
  const expected = prepareGoogleDocumentEdit(
    source,
    edit([{ kind: "paragraph", tabId: "tab1", startIndex: 1, endIndex: 5, alignment: "CENTER" }]),
  );
  const actual = structuredClone(source);
  actual.revisionId = "r2";
  set(actual, [...bodyPath, 1, "paragraph", "paragraphStyle", "alignment"], "CENTER");
  expect(verifyGoogleDocumentEdit(actual, expected)).toBe(true);
  for (const path of [
    [...bodyPath, 2, "paragraph", "positionedObjectIds"],
    [...bodyPath, 2, "unexpectedMetadata"],
    [...bodyPath, 2, "paragraph", "elements", 0, "suggestedInsertionIds"],
    [...bodyPath, 2, "paragraph", "elements", 0, "textRun", "suggestedDeletionIds"],
    ["tabs", 0, "documentTab", "body", "unexpectedMetadata"],
  ]) {
    const changed = structuredClone(actual);
    set(changed, path, ["unapproved"]);
    expect(verifyGoogleDocumentEdit(changed, expected)).toBe(false);
  }
});
