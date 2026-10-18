import { createHash } from "node:crypto";
import type { z } from "zod";
import { googleReplyEnvelope, foldMailHeader, encodedMailSubject } from "./google-mail.js";
import { AuxError } from "@aux/contracts";
import {
  GOOGLE_OPERATIONS,
  GoogleOperationSchema,
  GoogleArguments,
  GoogleMailMessageSchema,
  GoogleDraftUpdateSchema,
  type GoogleOperation,
} from "@aux/contracts/google";

export type GoogleRequest = {
  operation: GoogleOperation;
  effect: "read" | "write" | "send";
  method: "GET" | "POST" | "PUT";
  url: string;
  objectId: string;
  body?: string;
  limitBytes: number;
  preflight?: GoogleRequest;
  expectedPreflightHash?: string;
  expectedRevisionId?: string;
  verify?: GoogleRequest;
  expectedValues?: unknown;
  expectedGrid?: {
    sheetId: number;
    startRowIndex: number;
    endRowIndex: number;
    startColumnIndex: number;
    endColumnIndex: number;
    cell: Record<string, unknown>;
  };
};
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
export const googleValuesHash = digest;
function sheetDimensions(value: string) {
  const cells = value
    .slice(value.lastIndexOf("!") + 1)
    .replaceAll("$", "")
    .split(":");
  const point = (text: string) => {
    const match = /^([A-Z]+)([0-9]+)$/.exec(text)!;
    return {
      row: Number(match[2]),
      column: [...match[1]!].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0),
    };
  };
  const start = point(cells[0]!),
    end = point(cells[1] ?? cells[0]!);
  const rows = end.row - start.row + 1,
    columns = end.column - start.column + 1;
  if (rows < 1 || columns < 1 || rows * columns > 10_000)
    throw new AuxError("invalid_params", "Choose a rectangular range of at most 10,000 cells.");
  return { rows, columns };
}

function mime(
  value: z.output<typeof GoogleMailMessageSchema>,
  actionId: string,
  reply?: ReturnType<typeof googleReplyEnvelope>,
): string {
  const subject = foldMailHeader("Subject", encodedMailSubject(value.subject));
  return Buffer.from(
    [
      foldMailHeader("To", value.to, ", "),
      ...(value.cc.length ? [foldMailHeader("Cc", value.cc, ", ")] : []),
      ...(value.bcc.length ? [foldMailHeader("Bcc", value.bcc, ", ")] : []),
      reply
        ? /^[ -~]*$/.test(reply.subject)
          ? `Subject: ${reply.subject}`
          : foldMailHeader("Subject", encodedMailSubject(reply.subject))
        : subject,
      ...(reply?.headers ?? []),
      `Message-ID: <${actionId}@aux.local>`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: base64",
      "",
      Buffer.from(value.text)
        .toString("base64")
        .match(/.{1,76}/g)
        ?.join("\r\n") ?? "",
    ].join("\r\n"),
  ).toString("base64url");
}
/** Sealed request builders, never caller-supplied URLs or generic arbitrary API bodies. */
export function prepareGoogleRequest(
  operation: GoogleOperation,
  raw: unknown,
  actionId: string,
): GoogleRequest {
  GoogleOperationSchema.parse(operation);
  const parsed = GoogleArguments[operation].parse(raw);
  let path = "",
    root = "https://gmail.googleapis.com/gmail/v1",
    method: GoogleRequest["method"] = "GET",
    body: unknown,
    objectId = "me";
  const input = parsed as Record<string, unknown>;
  let preflight: GoogleRequest | undefined,
    expectedPreflightHash: string | undefined,
    expectedRevisionId: string | undefined,
    verify: GoogleRequest | undefined,
    expectedValues: unknown,
    expectedGrid: GoogleRequest["expectedGrid"];
  const query = new URLSearchParams();
  if (operation === "gmail.reply" || operation === "gmail.replyAll") {
    path = "/users/me/messages/send";
    objectId = String(input.messageId);
    method = "POST";
  } else if (operation === "gmail.search") {
    path = "/users/me/messages";
    query.set("q", String(input.query));
    query.set("maxResults", String(input.limit));
    if (input.pageToken) query.set("pageToken", String(input.pageToken));
  } else if (operation === "gmail.message") {
    objectId = String(input.messageId);
    path = `/users/me/messages/${objectId}`;
    query.set("format", "full");
  } else if (operation === "gmail.thread") {
    objectId = String(input.threadId);
    path = `/users/me/threads/${objectId}`;
    query.set("format", "full");
  } else if (operation === "gmail.attachment") {
    objectId = `${input.messageId}/${input.attachmentId}`;
    path = `/users/me/messages/${input.messageId}/attachments/${input.attachmentId}`;
  } else if (operation === "gmail.draft.read" || operation === "gmail.draft.send") {
    objectId = String(input.draftId);
    path = `/users/me/drafts/${objectId}`;
    query.set("format", "raw");
    if (operation.endsWith("send")) {
      preflight = prepareGoogleRequest("gmail.draft.read", { draftId: objectId }, actionId);
      expectedPreflightHash = String(input.expectedMessageSha256);
      query.delete("format");
      path = "/users/me/drafts/send";
      method = "POST";
      body = { id: objectId };
    }
  } else if (operation === "gmail.draft.create" || operation === "gmail.send") {
    path = operation === "gmail.send" ? "/users/me/messages/send" : "/users/me/drafts";
    method = "POST";
    const raw = mime(GoogleMailMessageSchema.parse(parsed), actionId);
    body = operation === "gmail.send" ? { raw } : { message: { raw } };
  } else if (operation === "gmail.draft.update") {
    objectId = String(input.draftId);
    path = `/users/me/drafts/${objectId}`;
    method = "PUT";
    preflight = prepareGoogleRequest("gmail.draft.read", { draftId: objectId }, actionId);
    expectedPreflightHash = String(input.expectedMessageSha256);
    body = {
      message: {
        raw: mime(GoogleDraftUpdateSchema.parse(parsed).message, actionId),
      },
    };
  } else if (operation.startsWith("docs.")) {
    objectId = String(input.documentId);
    if (operation === "docs.comment") {
      root = "https://www.googleapis.com/drive/v3";
      path = `/files/${objectId}/comments`;
      method = "POST";
      query.set("fields", "id,content,createdTime");
      body = {
        content: input.content,
        ...(input.quotedText
          ? {
              quotedFileContent: {
                mimeType: "text/plain",
                value: input.quotedText,
              },
            }
          : {}),
      };
    } else {
      root = "https://docs.googleapis.com/v1";
      path = `/documents/${objectId}`;
      if (operation === "docs.read") query.set("includeTabsContent", "true");
      else {
        const value = GoogleArguments["docs.edit"].parse(parsed);
        preflight = prepareGoogleRequest("docs.read", { documentId: value.documentId }, actionId);
        expectedRevisionId = value.requiredRevisionId;
        verify = preflight;
        path += ":batchUpdate";
        method = "POST";
        body = {
          writeControl: { requiredRevisionId: value.requiredRevisionId },
          requests: value.edits.flatMap<Record<string, unknown>>((edit) =>
            edit.kind === "delete"
              ? [
                  {
                    deleteContentRange: {
                      range: {
                        startIndex: edit.startIndex,
                        endIndex: edit.endIndex,
                        ...(edit.tabId ? { tabId: edit.tabId } : {}),
                      },
                    },
                  },
                ]
              : [
                  {
                    insertText: {
                      location: {
                        index: edit.index,
                        ...(edit.tabId ? { tabId: edit.tabId } : {}),
                      },
                      text: edit.text,
                    },
                  },
                  ...(edit.bold !== undefined ||
                  edit.italic !== undefined ||
                  edit.underline !== undefined ||
                  edit.link !== undefined
                    ? [
                        {
                          updateTextStyle: {
                            range: {
                              startIndex: edit.index,
                              endIndex: edit.index + edit.text.length,
                              ...(edit.tabId ? { tabId: edit.tabId } : {}),
                            },
                            textStyle: {
                              ...(edit.bold !== undefined ? { bold: edit.bold } : {}),
                              ...(edit.italic !== undefined ? { italic: edit.italic } : {}),
                              ...(edit.underline !== undefined ? { underline: edit.underline } : {}),
                              // A masked, omitted link explicitly clears it without resetting other fields.
                              ...(edit.link ? { link: { url: edit.link } } : {}),
                            },
                            fields: [
                              ...(edit.bold !== undefined ? ["bold"] : []),
                              ...(edit.italic !== undefined ? ["italic"] : []),
                              ...(edit.underline !== undefined ? ["underline"] : []),
                              ...(edit.link !== undefined ? ["link"] : []),
                            ].join(","),
                          },
                        },
                      ]
                    : []),
                ],
          ),
        };
      }
    }
  } else if (operation.startsWith("sheets.")) {
    root = "https://sheets.googleapis.com/v4";
    objectId = String(input.spreadsheetId);
    path = `/spreadsheets/${objectId}`;
    if (operation === "sheets.discover")
      query.set("fields", "spreadsheetId,spreadsheetUrl,properties,sheets.properties,namedRanges");
    else if (operation === "sheets.grid.read") {
      sheetDimensions(String(input.range));
      query.set("ranges", String(input.range));
      query.set("includeGridData", "true");
      query.set(
        "fields",
        "spreadsheetId,sheets(properties(sheetId,title),data(startRow,startColumn,rowData(values(userEnteredValue,effectiveValue,formattedValue,userEnteredFormat,effectiveFormat,note))))",
      );
    } else if (operation === "sheets.read") {
      sheetDimensions(String(input.range));
      path += `/values/${encodeURIComponent(String(input.range))}`;
      query.set("valueRenderOption", input.formulas ? "FORMULA" : "UNFORMATTED_VALUE");
      query.set("dateTimeRenderOption", "SERIAL_NUMBER");
    } else if (operation === "sheets.write") {
      const value = GoogleArguments["sheets.write"].parse(parsed);
      const width = value.values[0]!.length;
      const dimensions = sheetDimensions(value.range);
      if (dimensions.rows !== value.values.length || dimensions.columns !== width)
        throw new AuxError(
          "invalid_params",
          "The admitted Sheet range must exactly match the matrix dimensions.",
        );
      if (value.values.some((row) => row.length !== width))
        throw new AuxError("invalid_params", "Sheet matrices must be rectangular.");
      preflight = prepareGoogleRequest(
        "sheets.read",
        {
          spreadsheetId: value.spreadsheetId,
          range: value.range,
          formulas: true,
        },
        actionId,
      );
      expectedPreflightHash = value.expectedValuesSha256;
      path += "/values:batchUpdate";
      method = "POST";
      body = {
        valueInputOption: value.valueInputOption,
        includeValuesInResponse: true,
        responseValueRenderOption:
          value.valueInputOption === "USER_ENTERED" ? "FORMULA" : "UNFORMATTED_VALUE",
        responseDateTimeRenderOption: "SERIAL_NUMBER",
        data: [{ range: value.range, majorDimension: "ROWS", values: value.values }],
      };
      verify = prepareGoogleRequest(
        "sheets.read",
        {
          spreadsheetId: value.spreadsheetId,
          range: value.range,
          formulas: value.valueInputOption === "USER_ENTERED",
        },
        actionId,
      );
      expectedValues = value.values;
    } else {
      path += ":batchUpdate";
      method = "POST";
      if (operation === "sheets.notes")
        body = {
          requests: [
            {
              updateCells: {
                range: {
                  sheetId: input.sheetId,
                  startRowIndex: input.rowIndex,
                  endRowIndex: Number(input.rowIndex) + 1,
                  startColumnIndex: input.columnIndex,
                  endColumnIndex: Number(input.columnIndex) + 1,
                },
                rows: [{ values: [{ note: input.note }] }],
                fields: "note",
              },
            },
          ],
        };
      else {
        const value = GoogleArguments["sheets.format"].parse(parsed);
        if (
          value.endRowIndex <= value.startRowIndex ||
          value.endColumnIndex <= value.startColumnIndex ||
          (value.endRowIndex - value.startRowIndex) * (value.endColumnIndex - value.startColumnIndex) > 10000
        )
          throw new AuxError("invalid_params", "Choose at most 10,000 cells to format.");
        const format = {
          ...(value.bold !== undefined || value.italic !== undefined
            ? {
                textFormat: {
                  ...(value.bold !== undefined ? { bold: value.bold } : {}),
                  ...(value.italic !== undefined ? { italic: value.italic } : {}),
                },
              }
            : {}),
          ...(value.numberFormat ? { numberFormat: value.numberFormat } : {}),
        };
        if (!Object.keys(format).length) throw new AuxError("invalid_params", "Choose a format change.");
        body = {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: value.sheetId,
                  startRowIndex: value.startRowIndex,
                  endRowIndex: value.endRowIndex,
                  startColumnIndex: value.startColumnIndex,
                  endColumnIndex: value.endColumnIndex,
                },
                cell: { userEnteredFormat: format },
                fields: [
                  ...(value.bold !== undefined ? ["userEnteredFormat.textFormat.bold"] : []),
                  ...(value.italic !== undefined ? ["userEnteredFormat.textFormat.italic"] : []),
                  ...(value.numberFormat ? ["userEnteredFormat.numberFormat"] : []),
                ].join(","),
              },
            },
          ],
        };
      }
      const change = (
        body as {
          requests: {
            repeatCell?: {
              range: NonNullable<GoogleRequest["expectedGrid"]>;
              cell: Record<string, unknown>;
            };
            updateCells?: {
              range: NonNullable<GoogleRequest["expectedGrid"]>;
              rows: { values: Record<string, unknown>[] }[];
            };
          }[];
        }
      ).requests[0]!;
      const gridRange = change.repeatCell?.range ?? change.updateCells!.range;
      const expectedCell = change.repeatCell?.cell ?? change.updateCells!.rows[0]!.values[0]!;
      expectedGrid = { ...gridRange, cell: expectedCell };
      verify = {
        operation: "sheets.read",
        effect: "read",
        method: "POST",
        objectId,
        url: `${root}/spreadsheets/${objectId}:getByDataFilter?fields=sheets(properties.sheetId,data(startRow,startColumn,rowData.values(note,userEnteredFormat)))`,
        body: JSON.stringify({
          dataFilters: [{ gridRange }],
          includeGridData: true,
        }),
        limitBytes: 2_000_000,
      };
    }
  } else if (operation.startsWith("youtube.")) {
    root = "https://www.googleapis.com/youtube/v3";
    if (operation === "youtube.search") {
      path = "/search";
      objectId = `search:${input.query}`;
      query.set("part", "snippet");
      query.set("type", "video");
      query.set("q", String(input.query));
      for (const key of [
        "channelId",
        "publishedAfter",
        "publishedBefore",
        "relevanceLanguage",
        "regionCode",
        "order",
        "safeSearch",
      ])
        if (input[key] !== undefined) query.set(key, String(input[key]));
    } else if (operation === "youtube.videos") {
      const value = GoogleArguments["youtube.videos"].parse(parsed);
      path = "/videos";
      objectId = value.videoIds.join(",");
      query.set("part", "snippet,contentDetails,statistics,status");
      query.set("id", objectId);
      if (value.language) query.set("hl", value.language);
    } else if (operation === "youtube.comments") {
      path = "/commentThreads";
      objectId = String(input.videoId);
      query.set("part", "snippet");
      query.set("videoId", objectId);
      query.set("order", String(input.order));
      query.set("textFormat", "plainText");
    } else {
      path = "/comments";
      objectId = String(input.parentId);
      query.set("part", "snippet");
      query.set("parentId", objectId);
      query.set("textFormat", "plainText");
    }
    if (input.limit !== undefined) query.set("maxResults", String(input.limit));
    if (input.pageToken !== undefined) query.set("pageToken", String(input.pageToken));
  } else {
    root = "https://people.googleapis.com/v1";
    const fields = "names,emailAddresses,phoneNumbers,organizations";
    if (operation === "people.search") {
      path = "/people:searchContacts";
      query.set("query", String(input.query));
      query.set("pageSize", String(input.limit));
      query.set("readMask", fields);
    } else {
      path = "/people:batchGet";
      query.set("personFields", fields);
      for (const name of GoogleArguments["people.batch"].parse(parsed).resourceNames)
        query.append("resourceNames", name);
    }
  }
  const serialized = body === undefined ? undefined : JSON.stringify(body);
  if (serialized && Buffer.byteLength(serialized) > 300_000)
    throw new AuxError("invalid_params", "Google request exceeds its supported size.");
  return {
    operation,
    effect: GOOGLE_OPERATIONS[operation].effect,
    method,
    url: `${root}${path}${query.size ? `?${query}` : ""}`,
    objectId,
    ...(serialized ? { body: serialized } : {}),
    limitBytes:
      operation === "gmail.attachment" ? 8_000_000 : operation === "sheets.grid.read" ? 2_000_000 : 1_000_000,
    ...(preflight ? { preflight, expectedPreflightHash, expectedRevisionId } : {}),
    ...(verify ? { verify, expectedValues, expectedGrid } : {}),
  };
}

export function prepareGoogleReply(
  operation: "gmail.reply" | "gmail.replyAll",
  raw: unknown,
  source: Record<string, unknown>,
  owner: string,
  actionId: string,
): GoogleRequest {
  const input = GoogleArguments[operation].parse(raw);
  if (source.id !== input.messageId)
    throw new AuxError("conflict", "The original reply message identity changed.");
  const reply = googleReplyEnvelope(source, owner, operation === "gmail.replyAll");
  const request = prepareGoogleRequest(operation, raw, actionId);
  return {
    ...request,
    objectId: `${input.messageId}/${reply.threadId}`,
    body: JSON.stringify({
      threadId: reply.threadId,
      raw: mime({ to: reply.to, cc: reply.cc, bcc: [], subject: "", text: input.text }, actionId, reply),
    }),
  };
}

/** Check only the admitted cells and requested fields. Other data is neither written nor compared. */
export function verifyGoogleGrid(
  value: Record<string, unknown>,
  expected: NonNullable<GoogleRequest["expectedGrid"]>,
): boolean {
  const sheets = value.sheets as
    | {
        properties?: { sheetId?: number };
        data?: {
          startRow?: number;
          startColumn?: number;
          rowData?: { values?: Record<string, unknown>[] }[];
        }[];
      }[]
    | undefined;
  const sheet = sheets?.find((item) => item.properties?.sheetId === expected.sheetId);
  if (!sheet) return false;
  const subset = (actual: unknown, wanted: unknown): boolean => {
    if (wanted && typeof wanted === "object")
      return Object.entries(wanted).every(([key, item]) =>
        subset((actual as Record<string, unknown> | undefined)?.[key], item),
      );
    return (actual ?? (typeof wanted === "boolean" ? false : "")) === wanted;
  };
  for (let row = expected.startRowIndex; row < expected.endRowIndex; row++)
    for (let col = expected.startColumnIndex; col < expected.endColumnIndex; col++) {
      const block = sheet.data?.find(
        (data) =>
          row >= (data.startRow ?? 0) &&
          col >= (data.startColumn ?? 0) &&
          row - (data.startRow ?? 0) < (data.rowData?.length ?? 0),
      );
      const cell = block?.rowData?.[row - (block.startRow ?? 0)]?.values?.[col - (block.startColumn ?? 0)];
      if (!subset(cell, expected.cell)) return false;
    }
  return true;
}
