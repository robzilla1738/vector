import { expect, it } from "vitest";
import {
  prepareGoogleRequest,
  prepareGoogleReply,
  verifyGoogleGrid,
} from "../../apps/runtime/src/services/google-rest.js";
import { googleReplyEnvelope, googleRawMessageHash } from "../../apps/runtime/src/services/google-mail.js";
import { googleOperationAvailable, GoogleArguments } from "@aux/contracts/google";
const action = "3f08aac8-57ae-4c05-ab25-465c73e7281a";
const source = {
  id: "abc123",
  threadId: "thread123",
  payload: {
    headers: [
      { name: "From", value: '"Owner, Sender" <owner@example.test>' },
      { name: "Reply-To", value: '"Team, One" <team@example.test>' },
      { name: "To", value: '"Owner, Person" <me@example.test>, Friends: a@example.test, b@example.test;' },
      { name: "Cc", value: "team@example.test, c@example.test" },
      { name: "Bcc", value: "secret@example.test" },
      { name: "Subject", value: "=?UTF-8?B?SGVsbG8=?=" },
      { name: "Message-ID", value: "<original@example.test>" },
      { name: "References", value: "<first@example.test>\r\n <second@example.test>" },
    ],
  },
};
it("parses RFC quoted display names and groups, preserves reply threading and excludes self and Bcc", () => {
  expect(googleReplyEnvelope(source, "me@example.test", false)).toMatchObject({
    to: ["team@example.test"],
    cc: [],
  });
  const request = prepareGoogleReply(
    "gmail.replyAll",
    { messageId: "abc123", expectedSourceSha256: "a".repeat(64), text: "Reply" },
    source,
    "me@example.test",
    action,
  );
  const body = JSON.parse(request.body!);
  expect(body.threadId).toBe("thread123");
  const raw = Buffer.from(body.raw, "base64url").toString("utf8");
  expect(raw).toContain("To: team@example.test\r\nCc: a@example.test, b@example.test, c@example.test");
  expect(raw).toContain("In-Reply-To: <original@example.test>");
  expect(raw).toContain("References: <first@example.test> <second@example.test> <original@example.test>");
  expect(raw).toContain("Subject: Re: =?UTF-8?B?SGVsbG8=?=");
  expect(raw).not.toMatch(/secret@|me@example/);
});
it("rejects hostile or ambiguous original reply headers instead of widening recipients", () => {
  for (const value of ["a@example.test\r\nBcc: injected@example.test", "invalid address"])
    expect(() =>
      googleReplyEnvelope(
        {
          ...source,
          payload: {
            headers: [
              ...source.payload.headers.filter((h) => h.name !== "Reply-To"),
              { name: "Reply-To", value },
            ],
          },
        },
        "me@example.test",
        true,
      ),
    ).toThrow();
  expect(() =>
    googleReplyEnvelope(
      {
        ...source,
        payload: {
          headers: [...source.payload.headers, { name: "Message-ID", value: "<other@example.test>" }],
        },
      },
      "me@example.test",
      false,
    ),
  ).toThrow(/ambiguous/);
});
it("requires both read and sending scopes for replies and distinguishes drafting from sending task operations", () => {
  const s = "https://www.googleapis.com/auth/";
  expect(googleOperationAvailable([s + "gmail.send"], "gmail.reply")).toBe(false);
  expect(googleOperationAvailable([s + "gmail.readonly", s + "gmail.send"], "gmail.reply")).toBe(true);
  expect(googleOperationAvailable([s + "gmail.send"], "gmail.draft.send")).toBe(false);
  expect(
    GoogleArguments["gmail.send"].safeParse({ to: ["a@example.test"], subject: "safe\r\nBcc:bad", text: "x" })
      .success,
  ).toBe(false);
});
it("hashes original RFC822 bytes without UTF8 replacement and binds draft mutation to the read hash", () => {
  const bytes = Buffer.from([0xff, 0x00, 0xfe]);
  expect(googleRawMessageHash({ message: { raw: bytes.toString("base64url") } })).not.toBe(
    googleRawMessageHash({ message: { raw: Buffer.from(bytes.toString("utf8")).toString("base64url") } }),
  );
  const request = prepareGoogleRequest(
    "gmail.draft.update",
    {
      draftId: "draft1",
      expectedMessageSha256: "a".repeat(64),
      message: { to: ["a@example.test"], subject: "draft", text: "body" },
    },
    action,
  );
  expect(request.preflight?.operation).toBe("gmail.draft.read");
  expect(request.expectedPreflightHash).toBe("a".repeat(64));
});
it("sends exact revision-bound Docs rich insertions and masks unrelated styles", () => {
  const request = prepareGoogleRequest(
    "docs.edit",
    {
      documentId: "doc1",
      requiredRevisionId: "original-rev",
      edits: [{ kind: "insert", index: 4, text: "Hello", bold: true, tabId: "tab1" }],
    },
    action,
  );
  expect(JSON.parse(request.body!)).toEqual({
    writeControl: { requiredRevisionId: "original-rev" },
    requests: [
      { insertText: { location: { index: 4, tabId: "tab1" }, text: "Hello" } },
      {
        updateTextStyle: {
          range: { startIndex: 4, endIndex: 9, tabId: "tab1" },
          textStyle: { bold: true },
          fields: "bold",
        },
      },
    ],
  });
});
it("bounds Sheet writes to exact rectangular matrices and uses optimistic preflight plus resulting range read", () => {
  const args = {
    spreadsheetId: "sheet1",
    range: "'Tab One'!A2:B2",
    values: [[1, "=A2*2"]],
    expectedValuesSha256: "a".repeat(64),
    valueInputOption: "USER_ENTERED",
  };
  const request = prepareGoogleRequest("sheets.write", args, action);
  expect(request.preflight?.url).toContain("valueRenderOption=FORMULA");
  expect(request.verify?.url).toContain("valueRenderOption=FORMULA");
  expect(JSON.parse(request.body!).data).toEqual([
    { range: args.range, majorDimension: "ROWS", values: args.values },
  ]);
  expect(() => prepareGoogleRequest("sheets.write", { ...args, range: "'Tab One'!A2:C2" }, action)).toThrow(
    /dimensions/,
  );
  expect(() =>
    prepareGoogleRequest("sheets.read", { spreadsheetId: "sheet1", range: "Sheet1!A1:ZZZ9999999" }, action),
  ).toThrow(/10,000/);
});
it("limits Sheet formatting field masks and verifies all selected cells while preserving unrelated fields", () => {
  const request = prepareGoogleRequest(
    "sheets.format",
    {
      spreadsheetId: "sheet1",
      sheetId: 7,
      startRowIndex: 1,
      endRowIndex: 2,
      startColumnIndex: 2,
      endColumnIndex: 4,
      bold: true,
    },
    action,
  );
  const change = JSON.parse(request.body!).requests[0].repeatCell;
  expect(change.fields).toBe("userEnteredFormat.textFormat.bold");
  expect(change.cell).toEqual({ userEnteredFormat: { textFormat: { bold: true } } });
  expect(JSON.parse(request.verify!.body!).dataFilters[0].gridRange).toEqual(change.range);
  const result = {
    sheets: [
      {
        properties: { sheetId: 7 },
        data: [
          {
            startRow: 1,
            startColumn: 2,
            rowData: [
              {
                values: [
                  { userEnteredFormat: { textFormat: { bold: true, italic: true } } },
                  { userEnteredFormat: { textFormat: { bold: true } } },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
  expect(verifyGoogleGrid(result, request.expectedGrid!)).toBe(true);
  result.sheets[0]!.data[0]!.rowData[0]!.values[1]!.userEnteredFormat.textFormat.bold = false;
  expect(verifyGoogleGrid(result, request.expectedGrid!)).toBe(false);
});
it("writes and verifies only one cell note and bounds People search/batch requests", () => {
  const request = prepareGoogleRequest(
    "sheets.notes",
    { spreadsheetId: "sheet1", sheetId: 2, rowIndex: 3, columnIndex: 4, note: "Note" },
    action,
  );
  expect(JSON.parse(request.body!).requests[0].updateCells.fields).toBe("note");
  expect(request.expectedGrid).toMatchObject({
    startRowIndex: 3,
    endRowIndex: 4,
    startColumnIndex: 4,
    endColumnIndex: 5,
    cell: { note: "Note" },
  });
  expect(prepareGoogleRequest("people.search", { query: "Name", limit: 5 }, action).url).toContain(
    "pageSize=5",
  );
  expect(() =>
    prepareGoogleRequest("people.batch", { resourceNames: Array(51).fill("people/abc") }, action),
  ).toThrow();
});
it("encodes Unicode subjects into bounded RFC2047 words without splitting characters and folds long address headers", () => {
  const subject = "A complex subject 😃 中文 ".repeat(15);
  const to = Array.from({ length: 8 }, (_, n) => `person-${n}-long-name@example.test`);
  const request = prepareGoogleRequest("gmail.send", { to, subject, text: "Body" }, action);
  const raw = Buffer.from(JSON.parse(request.body!).raw, "base64url").toString("utf8");
  const subjectHeader = raw.match(/Subject: ([\s\S]*?)\r\nMessage-ID:/)![1]!;
  const encoded = [...subjectHeader.matchAll(/=\?UTF-8\?B\?([A-Za-z0-9+/=]+)\?=/g)];
  expect(encoded.every((word) => word[0].length <= 75)).toBe(true);
  expect(encoded.map((word) => Buffer.from(word[1]!, "base64").toString("utf8")).join("")).toBe(subject);
  expect(raw.split("\r\n").every((line) => line.length <= 998)).toBe(true);
  expect(raw).toContain(",\r\n person-");
});
