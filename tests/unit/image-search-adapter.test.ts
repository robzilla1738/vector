import { afterEach, expect, it, vi } from "vitest";
import { JSDOM } from "jsdom";
import { readImageResultsInPage } from "../../apps/runtime/src/agent/image-search-adapter.js";
import { siteExportUrl } from "../../apps/runtime/src/agent/site-adapters.js";
const windows: JSDOM[] = [];
afterEach(() => {
  for (const dom of windows.splice(0)) dom.window.close();
  vi.unstubAllGlobals();
});
function page(url: string, html: string) {
  const dom = new JSDOM(html, { url });
  windows.push(dom);
  vi.stubGlobal("location", dom.window.location);
  vi.stubGlobal("document", dom.window.document);
  const fetch = vi.fn(() => {
    throw new Error("Image extraction must not fetch bytes");
  });
  vi.stubGlobal("fetch", fetch);
  return { result: () => readImageResultsInPage({ expectedUrl: url }), fetch, dom };
}
it("reads original Bing image/source metadata and keeps page filters without fetching images", () => {
  const fixture = page(
    "https://www.bing.com/images/search?q=aux&qft=filterui%3Aimagesize-large&adlt=strict",
    '<a class="iusc"><img alt="Aux browser" width="80" height="40" src="https://thumb.test/a.jpg"></a>',
  );
  fixture.dom.window.document
    .querySelector("a")!
    .setAttribute(
      "m",
      JSON.stringify({
        murl: "https://images.test/original.png",
        purl: "https://publisher.test/story",
        ow: 1920,
        oh: 1080,
      }),
    );
  expect(fixture.result()).toMatchObject({
    ok: true,
    imageSearch: {
      engine: "bing",
      query: "aux",
      parameters: { qft: "filterui:imagesize-large", adlt: "strict" },
      images: [
        {
          imageUrl: "https://images.test/original.png",
          sourceUrl: "https://publisher.test/story",
          title: "Aux browser",
          thumbnailUrl: "https://thumb.test/a.jpg",
          width: 1920,
          height: 1080,
          dimensions: "page-metadata",
        },
      ],
      truncated: false,
    },
  });
  expect(fixture.fetch).not.toHaveBeenCalled();
});
it("never substitutes thumbnail dimensions for unknown originals or exposes data/credential URLs", () => {
  const fixture = page(
    "https://www.bing.com/images/search?q=aux",
    '<a><img width="500" height="400" src="data:image/png,not-a-source"></a><a></a><a></a>',
  );
  const links = fixture.dom.window.document.querySelectorAll("a");
  links[0]!.setAttribute(
    "m",
    JSON.stringify({ murl: "https://images.test/a.png", purl: "https://publisher.test/a" }),
  );
  links[1]!.setAttribute(
    "m",
    JSON.stringify({ murl: "javascript:alert(1)", purl: "https://publisher.test/b" }),
  );
  links[2]!.setAttribute(
    "m",
    JSON.stringify({ murl: "https://user:secret@images.test/a", purl: "https://publisher.test/c" }),
  );
  const result = fixture.result();
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.imageSearch.images).toEqual([
    {
      imageUrl: "https://images.test/a.png",
      sourceUrl: "https://publisher.test/a",
      title: "",
      dimensions: "unknown",
    },
  ]);
});
it("extracts Google source-linked results only from the current search origin and deduplicates", () => {
  const href = "/imgres?imgurl=https%3A%2F%2Fimages.test%2Fa.jpg&imgrefurl=https%3A%2F%2Fpublisher.test%2Fa";
  const fixture = page(
    "https://www.google.com/search?q=aux&udm=2&safe=active",
    `<a href="${href}"><img alt="A"></a><a href="${href}"><img alt="A duplicate"></a><a href="https://other.test${href}"><img alt="forged"></a>`,
  );
  expect(fixture.result()).toMatchObject({
    ok: true,
    imageSearch: {
      engine: "google",
      parameters: { safe: "active", udm: "2" },
      images: [{ title: "A", dimensions: "unknown" }],
      truncated: false,
    },
  });
  const result = fixture.result();
  if (!result.ok) throw new Error(result.reason);
  expect(result.imageSearch.images).toHaveLength(1);
});
it("bounds returned results and refuses unrelated or stale documents", () => {
  const html = Array.from(
    { length: 55 },
    (_, index) =>
      `<a m='${JSON.stringify({ murl: `https://images.test/${index}.png`, purl: `https://publisher.test/${index}` })}'></a>`,
  ).join("");
  const fixture = page("https://www.bing.com/images/search?q=aux", html);
  const result = fixture.result();
  if (!result.ok) throw new Error(result.reason);
  expect(result.imageSearch.images).toHaveLength(50);
  expect(result.imageSearch.truncated).toBe(true);
  expect(readImageResultsInPage({ expectedUrl: "https://www.bing.com/images/search?q=changed" })).toEqual({
    ok: false,
    reason: "document_changed",
  });
  const input = {
    taskId: "task",
    expectedRevision: 1,
    pageId: "p",
    expectedDocumentEpoch: 1,
    kind: "image-search" as const,
    expectedUrl: "https://www.google.com/search?q=aux&udm=2",
  };
  expect(siteExportUrl(input).href).toBe(input.expectedUrl);
  for (const expectedUrl of [
    "https://www.google.com/search?q=aux",
    "https://other.test/images/search?q=aux",
    "https://user:secret@www.bing.com/images/search?q=aux",
  ])
    expect(() => siteExportUrl({ ...input, expectedUrl })).toThrow();
});
