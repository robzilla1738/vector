import { expect, it } from "vitest";
import { markdownPreviewText } from "./PlainAnswerText";

it("projects rich answers into readable list text without Markdown markers or link destinations", () => {
  expect(
    markdownPreviewText(
      "# Checkout modes\n\n| Mode | Purpose |\n| --- | --- |\n| **payment** | One-time purchase |\n| `subscription` | Recurring payment |\n\n[Read more](https://example.com/private-destination)",
    ),
  ).toBe("Checkout modes Mode Purpose payment One-time purchase subscription Recurring payment Read more");
});
it("preserves escaped punctuation, code, image descriptions and block boundaries as text", () => {
  expect(
    markdownPreviewText(
      "## Plan\n\n- Keep \\*literal\\* punctuation\n- Use `some_value`\n\nFirst line  \nSecond line\n\n![A report](https://example.com/report.png)\n\n```js\nconst answer = 42;\n```",
    ),
  ).toBe("Plan Keep *literal* punctuation Use some_value First line Second line A report const answer = 42;");
});
it("does not expose hidden HTML markup, reference definitions or footnotes in the teaser", () => {
  expect(
    markdownPreviewText(
      'A <b>visible</b> answer. [Docs][ref]\n\n[ref]: https://example.com/hidden\n\n<div data-private="hidden">hidden block</div>\n\n[^1]: hidden footnote',
    ),
  ).toBe("A visible answer. Docs");
});
