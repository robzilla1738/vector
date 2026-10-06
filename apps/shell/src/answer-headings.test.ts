import { expect, it } from "vitest";
import { answerFragment, answerHeadings } from "./answer-headings";

it("keeps nested formatted headings addressable and disambiguates repeated targets per answer", () => {
  const heading = (value: string) => ({
    type: "heading",
    children: [{ type: "strong", children: [{ type: "text", value }] }],
    data: { hProperties: { title: "Keep metadata" } },
  });
  const headings = [heading("Résumé & Results"), heading("Résumé & Results"), heading("Résumé & Results-1")];
  const plugin = answerHeadings();
  plugin({ type: "root", children: headings });
  expect(
    headings.map((node) => (node.data.hProperties as Record<string, unknown>)["data-answer-heading"]),
  ).toEqual(["résumé--results", "résumé--results-1", "résumé--results-1-1"]);
  expect(headings[0]!.data.hProperties.title).toBe("Keep metadata");
  const second = heading("Résumé & Results");
  plugin({ type: "root", children: [second] });
  expect((second.data.hProperties as Record<string, unknown>)["data-answer-heading"]).toBe("résumé--results");
  expect(answerFragment("#r%C3%A9sum%C3%A9--results")).toBe("résumé--results");
  expect(answerFragment("#bad%escape")).toBe("bad%escape");
});
