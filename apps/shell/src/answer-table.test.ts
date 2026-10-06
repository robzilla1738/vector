import { expect, it } from "vitest";
import { answerTableCsv, answerTableMarkdown } from "./answer-table";

it("preserves CSV cells while neutralizing spreadsheet formulas", () => {
  expect(
    answerTableCsv([
      ["Label", "Value"],
      ['A, "quoted"\ncell', '  =HYPERLINK("https://example.com")'],
      ["Plain", "42"],
    ]),
  ).toBe(
    '"Label","Value"\r\n"A, ""quoted""\ncell","\'  =HYPERLINK(""https://example.com"")"\r\n"Plain","42"',
  );
});
it("copies a Markdown table without splitting pipes or multiline cells", () => {
  expect(
    answerTableMarkdown([
      ["Name", "Notes"],
      ["A|B", "First\nSecond"],
    ]),
  ).toBe("| Name | Notes |\n| --- | --- |\n| A\\|B | First Second |");
});
