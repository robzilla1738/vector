import { expect, it } from "vitest";
import {
  projectGoogleDocumentRange,
  prepareGoogleDocumentEdit,
  verifyGoogleDocumentEdit,
} from "../../apps/runtime/src/services/google-documents.js";
import { projectGoogleGrid } from "../../apps/runtime/src/services/google-grid.js";
import { GoogleArguments, googleOperationAvailable } from "@aux/contracts/google";

function document(
  parts: (
    | string
    | { text: string; bold?: boolean; italic?: boolean; underline?: boolean; link?: Record<string, unknown> }
  )[] = ["A😀B\n"],
  revisionId = "revision-1",
) {
  let index = 1;
  const elements = parts.map((part) => {
    const value = typeof part === "string" ? { text: part } : part;
    const startIndex = index;
    index += value.text.length;
    return {
      startIndex,
      endIndex: index,
      textRun: {
        content: value.text,
        textStyle: {
          ...(value.bold === undefined ? {} : { bold: value.bold }),
          ...(value.italic === undefined ? {} : { italic: value.italic }),
          ...(value.underline === undefined ? {} : { underline: value.underline }),
          ...(value.link === undefined ? {} : { link: value.link }),
        },
      },
    };
  });
  return {
    documentId: "doc1",
    revisionId,
    tabs: [
      {
        tabProperties: { tabId: "tab1" },
        documentTab: {
          body: {
            content: [
              { startIndex: 0, endIndex: 1, sectionBreak: {} },
              { startIndex: 1, endIndex: index, paragraph: { elements } },
            ],
          },
        },
      },
    ],
  };
}
it("projects only the explicit revision/tab body range using complete UTF-16 spans", () => {
  const input = {
    documentId: "doc1",
    bodyRange: {
      revisionId: "revision-1",
      tabId: "tab1",
      startIndex: 2,
      endIndex: 4,
    },
  };
  expect(projectGoogleDocumentRange(document(), input)).toEqual({
    documentId: "doc1",
    revisionId: "revision-1",
    tabId: "tab1",
    scope: "api-body-range",
    indexUnit: "utf16",
    startIndex: 2,
    endIndex: 4,
    spans: [{ startIndex: 2, endIndex: 4, text: "😀" }],
    omittedNonText: false,
  });
  for (const bodyRange of [
    { ...input.bodyRange, startIndex: 3 },
    { ...input.bodyRange, endIndex: 3 },
    { ...input.bodyRange, revisionId: "retired" },
    { ...input.bodyRange, tabId: "another-tab" },
  ])
    expect(() => projectGoogleDocumentRange(document(), { ...input, bodyRange })).toThrow();
  expect(
    GoogleArguments["docs.read"].safeParse({
      ...input,
      bodyRange: { ...input.bodyRange, endIndex: 100_000 },
    }).success,
  ).toBe(false);
});
it("verifies sequential insertions, deletions and requested text styles without altering unrelated text", () => {
  const expected = prepareGoogleDocumentEdit(document(["AB\n"]), {
    documentId: "doc1",
    requiredRevisionId: "revision-1",
    edits: [
      { kind: "insert", index: 2, text: "xy", bold: true },
      { kind: "delete", startIndex: 4, endIndex: 5 },
    ],
  });
  expect(
    verifyGoogleDocumentEdit(document(["A", { text: "xy", bold: true }, "\n"], "revision-2"), expected),
  ).toBe(true);
  for (const actual of [
    document(["AxyB\n"]),
    document(["A", { text: "xy", bold: false }, "\n"]),
    document(["Z", { text: "xy", bold: true }, "\n"]),
  ])
    expect(verifyGoogleDocumentEdit(actual, expected)).toBe(false);
});
it("refuses structural edits, Unicode splits, stripped controls, and final-newline deletion before dispatch", () => {
  const source = document();
  for (const edits of [
    [{ kind: "insert", index: 3, text: "split" }],
    [{ kind: "insert", index: 1, text: "\ud800" }],
    [{ kind: "insert", index: 1, text: "\0" }],
    [{ kind: "insert", index: 1, text: "\ue001" }],
    [{ kind: "delete", startIndex: 4, endIndex: 6 }],
  ])
    expect(() =>
      prepareGoogleDocumentEdit(source, {
        documentId: "doc1",
        requiredRevisionId: "revision-1",
        edits,
      }),
    ).toThrow();
  const structured = document(["AB\n"]);
  Object.assign(structured.tabs[0]!.documentTab.body.content[1]!, {
    table: { tableRows: [] },
  });
  // A genuinely non-text inline element makes the body unsupported for mutation.
  structured.tabs[0]!.documentTab.body.content[1]!.paragraph!.elements.push({
    startIndex: 1,
    endIndex: 2,
    inlineObjectElement: {},
  } as never);
  expect(() =>
    prepareGoogleDocumentEdit(structured, {
      documentId: "doc1",
      requiredRevisionId: "revision-1",
      edits: [{ kind: "insert", index: 1, text: "x" }],
    }),
  ).toThrow(/inline objects/);
});
it("rejects invalid source identities and excessive or overlapping document structure", () => {
  const input = {
    documentId: "doc1",
    bodyRange: {
      revisionId: "revision-1",
      tabId: "tab1",
      startIndex: 1,
      endIndex: 2,
    },
  };
  expect(() => projectGoogleDocumentRange({ ...document(), documentId: "other" }, input)).toThrow(/identity/);
  const overlap = document(["AB\n"]);
  overlap.tabs[0]!.documentTab.body.content[1]!.paragraph!.elements.push(
    overlap.tabs[0]!.documentTab.body.content[1]!.paragraph!.elements[0]!,
  );
  expect(() => projectGoogleDocumentRange(overlap, input)).toThrow(/overlapping/);
  expect(() =>
    projectGoogleDocumentRange({ ...document(), tabs: Array(65).fill(document().tabs[0]) }, input),
  ).toThrow();
});
it("exposes bounded formulas, formatting and notes only through the explicit grid-read operation", () => {
  const input = { spreadsheetId: "sheet1", range: "'Tab One'!B2:C2" };
  const result = projectGoogleGrid(
    {
      spreadsheetId: "sheet1",
      sheets: [
        {
          properties: { sheetId: 7, title: "Tab One" },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [{ values: [{ note: "Outside" }] }],
            },
            {
              startRow: 1,
              startColumn: 1,
              rowData: [
                {
                  values: [
                    {
                      userEnteredValue: { formulaValue: "=A2*2" },
                      effectiveValue: { numberValue: 4 },
                      userEnteredFormat: { textFormat: { bold: true } },
                      note: "Keep this note",
                      unrelated: "not returned",
                    },
                    { userEnteredValue: { stringValue: "Literal" } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    input,
  );
  expect(result).toMatchObject({
    sheetId: 7,
    rowCount: 1,
    columnCount: 2,
    cells: [
      {
        rowIndex: 1,
        columnIndex: 1,
        note: "Keep this note",
        userEnteredValue: { formulaValue: "=A2*2" },
        userEnteredFormat: { textFormat: { bold: true } },
      },
      { rowIndex: 1, columnIndex: 2 },
    ],
  });
  expect(JSON.stringify(result)).not.toMatch(/Outside|unrelated/);
  expect(
    googleOperationAvailable(["https://www.googleapis.com/auth/spreadsheets.readonly"], "sheets.grid.read"),
  ).toBe(true);
  expect(
    projectGoogleGrid(
      {
        spreadsheetId: "sheet1",
        sheets: [{ properties: { sheetId: 7, title: "Tab One" } }],
      },
      input,
    ).cells,
  ).toEqual([]);
  expect(() => projectGoogleGrid({ spreadsheetId: "other", sheets: [] }, input)).toThrow(/identity/);
});

const inlineEdit = (extra: Record<string, unknown> = {}) => ({
  documentId: "doc1",
  requiredRevisionId: "revision-1",
  edits: [{ kind: "insert", index: 2, text: "😀x", tabId: "tab1", ...extra }],
});
it("verifies requested links and explicit underline overrides on complete UTF-16 spans", () => {
  const expected = prepareGoogleDocumentEdit(
    document(["AB\n"]),
    inlineEdit({ link: "https://example.test/", underline: false }),
  );
  const actual = document(
    ["A", { text: "😀x", underline: false, link: { url: "https://example.test/" } }, "B\n"],
    "revision-2",
  );
  expect(verifyGoogleDocumentEdit(actual, expected)).toBe(true);
  for (const part of [
    { text: "😀x", underline: true, link: { url: "https://example.test/" } },
    { text: "😀x", link: { url: "https://example.test/" } },
    { text: "😀x", underline: false },
    { text: "😀x", underline: false, link: { url: "https://wrong.test/" } },
    { text: "😀x", underline: false, link: { url: "https://example.test/", tabId: "another" } },
    { text: "😀x", underline: false, link: {} },
    { text: "😀x", underline: "false", link: { url: "https://example.test/" } },
  ])
    expect(verifyGoogleDocumentEdit(document(["A", part as never, "B\n"]), expected)).toBe(false);
  expect(
    verifyGoogleDocumentEdit(
      document(["A", { text: "😀", underline: false, link: { url: "https://example.test/" } }, "xB\n"]),
      expected,
    ),
  ).toBe(false);
});
it("resolves named text style inheritance through NORMAL_TEXT but never inherits links", () => {
  const source = document(["AB\n"]);
  const actual = document(["A😀xB\n"], "revision-2");
  for (const value of [source, actual]) {
    Object.assign(value.tabs[0]!.documentTab, {
      namedStyles: {
        styles: [
          {
            namedStyleType: "NORMAL_TEXT",
            textStyle: { bold: true, italic: false, underline: true, link: { url: "https://ignored.test/" } },
          },
          { namedStyleType: "HEADING_1", textStyle: { underline: false } },
        ],
      },
    });
    Object.assign(value.tabs[0]!.documentTab.body.content[1]!.paragraph!, {
      paragraphStyle: { namedStyleType: "HEADING_1" },
    });
  }
  const expected = prepareGoogleDocumentEdit(
    source,
    inlineEdit({ bold: true, italic: false, underline: false, link: null }),
  );
  expect(verifyGoogleDocumentEdit(actual, expected)).toBe(true);
  // Unresolved editor defaults cannot establish an explicit false style request.
  expect(verifyGoogleDocumentEdit(document(["A😀xB\n"]), expected)).toBe(false);
});
it("verifies documented link underline defaults and excludes newline link destinations", () => {
  const expected = prepareGoogleDocumentEdit(
    document(["AB\n"]),
    inlineEdit({ text: "x\ny", link: "https://example.test/" }),
  );
  const actual = document(
    [
      "A",
      { text: "x", underline: true, link: { url: "https://example.test/" } },
      "\n",
      { text: "y", underline: true, link: { url: "https://example.test/" } },
      "B\n",
    ],
    "revision-2",
  );
  expect(verifyGoogleDocumentEdit(actual, expected)).toBe(true);
  actual.tabs[0]!.documentTab.body.content[1]!.paragraph!.elements[2]!.textRun.textStyle = {
    link: { url: "https://example.test/" },
  };
  expect(verifyGoogleDocumentEdit(actual, expected)).toBe(false);
});
it("refuses link insertions that could update an existing overlapping link", () => {
  for (const link of [null, "https://new.test/"]) {
    for (const source of [
      document([{ text: "A", link: { url: "https://old.test/" } }, "B\n"]),
      document(["A", { text: "B", link: { headingId: "existing-heading" } }, "\n"]),
    ])
      expect(() => prepareGoogleDocumentEdit(source, inlineEdit({ link }))).toThrow(/existing link boundary/);
  }
});
it("proves explicit link clearing only from absent run links", () => {
  const expected = prepareGoogleDocumentEdit(document(["AB\n"]), inlineEdit({ link: null, underline: true }));
  expect(
    verifyGoogleDocumentEdit(
      document(["A", { text: "😀x", underline: true }, "B\n"], "revision-2"),
      expected,
    ),
  ).toBe(true);
  expect(
    verifyGoogleDocumentEdit(
      document(["A", { text: "😀x", underline: true, link: { headingId: "existing" } }, "B\n"]),
      expected,
    ),
  ).toBe(false);
});

it("refuses a later link update across text that may have inherited an earlier inserted link", () => {
  expect(() =>
    prepareGoogleDocumentEdit(document(["AB\n"]), {
      documentId: "doc1",
      requiredRevisionId: "revision-1",
      edits: [
        { kind: "insert", index: 2, text: "x", link: "https://first.test/" },
        { kind: "insert", index: 3, text: "y" },
        { kind: "insert", index: 4, text: "z", link: "https://second.test/" },
      ],
    }),
  ).toThrow(/existing link boundary/);
});
