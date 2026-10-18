import { expect, it } from "vitest";
import { GoogleArguments } from "@aux/contracts/google";
import { verifyGoogleValuesWrite } from "../../apps/runtime/src/services/google-values.js";

const input = (option: "RAW" | "USER_ENTERED" = "RAW") =>
  GoogleArguments["sheets.write"].parse({
    spreadsheetId: "sheet1",
    range: "'Team''s sheet'!$A$1:$B$2",
    values: [
      ["42", "=SUM(1,2)"],
      ["", ""],
    ],
    expectedValuesSha256: "a".repeat(64),
    valueInputOption: option,
  });
const range = "'Team''s sheet'!A1:B2";
const observed = (values: unknown) => ({ range, majorDimension: "ROWS", values });
const ack = (values: unknown) => ({
  spreadsheetId: "sheet1",
  responses: [
    {
      spreadsheetId: "sheet1",
      updatedData: observed(values),
    },
  ],
});

it("preserves literal RAW strings while tolerating omitted trailing empty rows and columns", () => {
  expect(verifyGoogleValuesWrite(input(), ack([]), observed([["42", "=SUM(1,2)"]]))).toBe(true);
  expect(verifyGoogleValuesWrite(input(), ack([]), observed([[42, "=SUM(1,2)"]]))).toBe(false);
});
it("verifies provider-parsed USER_ENTERED numbers and actual formulas against an independent read", () => {
  expect(
    verifyGoogleValuesWrite(input("USER_ENTERED"), ack([[42, "=SUM(1,2)"]]), observed([[42, "=SUM(1,2)"]])),
  ).toBe(true);
  expect(verifyGoogleValuesWrite(input("USER_ENTERED"), ack([[42, "=SUM(1,2)"]]), observed([[42, 3]]))).toBe(
    false,
  );
});
it("requires an exact account-object response and bounded source range", () => {
  for (const response of [{}, { ...ack([]), spreadsheetId: "other" }, { ...ack([]), responses: [] }])
    expect(verifyGoogleValuesWrite(input("USER_ENTERED"), response, observed([]))).toBe(false);
  for (const changed of [
    { ...observed([]), range: "Other!A1:B2" },
    { ...observed([]), range: "'Team''s sheet'!A2:B3" },
    { ...observed([]), majorDimension: "COLUMNS" },
  ])
    expect(verifyGoogleValuesWrite(input(), ack([]), changed)).toBe(false);
});
it("refuses oversized, malformed and nonfinite provider matrices instead of clipping", () => {
  for (const values of [[["42", "=SUM(1,2)", "extra"]], [["42", null]], [[Number.NaN]], [[], [], []], {}])
    expect(verifyGoogleValuesWrite(input(), ack([]), observed(values))).toBe(false);
});
it("checks canonical response range and dimension independently of the later read", () => {
  for (const data of [
    { ...observed([]), range: "Other!A1:B2" },
    { ...observed([]), majorDimension: "COLUMNS" },
    undefined,
  ])
    expect(
      verifyGoogleValuesWrite(
        input("USER_ENTERED"),
        { spreadsheetId: "sheet1", responses: [{ updatedData: data }] },
        observed([]),
      ),
    ).toBe(false);
});
