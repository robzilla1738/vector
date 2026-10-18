import { JSDOM } from "jsdom";
import { afterEach, expect, it, vi } from "vitest";
import { SiteAdapters, siteExportUrl } from "../../apps/runtime/src/agent/site-adapters.js";
import type { PageRegistry } from "../../apps/runtime/src/services/pages/registry.js";

const source = {
  kind: "linkedin" as const,
  taskId: "task",
  expectedRevision: 1,
  pageId: "page",
  expectedDocumentEpoch: 7,
  expectedUrl: "https://www.linkedin.com/in/disposable-fixture/",
};
let window: JSDOM | undefined;
afterEach(() => {
  window?.window.close();
  vi.unstubAllGlobals();
});
function fixture() {
  window = new JSDOM(
    '<title>Fixture profile</title><main><h1>Fixture person</h1><p>Public research context</p><input type="password" value="not-readable"><a href="/company/fixture/">Fixture company</a><div hidden>Hidden text</div></main>',
    { url: source.expectedUrl },
  );
  const dom = window.window;
  vi.stubGlobal("location", dom.location);
  vi.stubGlobal("document", dom.document);
  vi.stubGlobal("NodeFilter", dom.NodeFilter);
  vi.stubGlobal("getComputedStyle", dom.getComputedStyle);
  vi.spyOn(dom.Element.prototype, "getClientRects").mockReturnValue([{}] as never);
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const page = { url: source.expectedUrl, documentEpoch: source.expectedDocumentEpoch };
  let afterRead = () => {};
  const driver = {
    isAttached: () => true,
    evaluate: async (expression: string) => {
      const result = new Function(`return ${expression}`)();
      afterRead();
      return result;
    },
  };
  const adapter = new SiteAdapters(
    { get: () => page, driverPageLenient: () => driver } as unknown as PageRegistry,
    (url) => url.origin === "https://www.linkedin.com",
  );
  return { adapter, fetch, page, afterRead: (next: () => void) => (afterRead = next) };
}
it("publishes bounded visible LinkedIn research through the exact owned site-read route", async () => {
  const { adapter, fetch } = fixture();
  const result = await adapter.read(source);
  expect(result).toMatchObject({
    pageId: "page",
    documentEpoch: 7,
    kind: "linkedin",
    sourceUrl: source.expectedUrl,
    linkedin: {
      surface: "profile",
      title: "Fixture profile",
      headings: ["Fixture person"],
      links: [{ kind: "company", url: "https://www.linkedin.com/company/fixture/" }],
    },
  });
  expect(result.text).toContain("Public research context");
  expect(result.text).not.toMatch(/not-readable|Hidden text/);
  expect(fetch).not.toHaveBeenCalled();
});
it("refuses authentication and private API routes before evaluating the page", () => {
  for (const url of [
    "https://www.linkedin.com/checkpoint/challenge/",
    "https://www.linkedin.com/voyager/api/identity/profiles/fixture",
    "https://www.linkedin.com.evil.test/in/fixture/",
  ])
    expect(() => siteExportUrl({ ...source, expectedUrl: url })).toThrow();
});
it("does not publish research after the document changes during extraction", async () => {
  const { adapter, page, afterRead } = fixture();
  afterRead(() => page.documentEpoch++);
  await expect(adapter.read(source)).rejects.toMatchObject({ code: "conflict" });
});
