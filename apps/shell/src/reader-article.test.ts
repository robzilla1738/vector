// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { normalizeReaderArticle } from "./reader-article";

describe("distilled Reader article", () => {
  it("keeps prose and safe links while discarding active content", () => {
    const article = normalizeReaderArticle({
      title: "Article", byline: "", site: "example.test", url: "https://example.test/story", minutes: 1,
      content: { tag: "__aux_distilled_html", children: [
        '<article><h2 id="part">Part</h2><p>Readable <a href="/next" onclick="evil()">next</a> <a href="javascript:evil()">unsafe</a></p><script>malicious text</script><iframe src="https://elsewhere.test">hidden text</iframe></article>',
      ] },
    });
    const rendered = JSON.stringify(article.content);
    expect(rendered).toContain('"href":"https://example.test/next"');
    expect(rendered).toContain('"sourceId":"part"');
    expect(rendered).toContain("unsafe");
    expect(rendered).not.toContain("javascript:");
    expect(rendered).not.toContain("onclick");
    expect(rendered).not.toContain("malicious text");
    expect(rendered).not.toContain("hidden text");
    expect(article.minutes).toBe(1);
  });
});
