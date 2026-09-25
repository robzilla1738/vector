import { describe, expect, it } from "vitest";
import { captureReadablePage, contentResponseEligible, forgetContentResponse, noteContentResponse } from "../../apps/desktop/main/content-capture.js";
import type { WebContents } from "electron";

describe("native content response eligibility", () => {
  it("requires the current successful HTML document without no-store", () => {
    const id = 914;
    const url = "https://example.com/article";
    expect(contentResponseEligible(id, url)).toBe(false);
    noteContentResponse(id, url, 200, { "Content-Type": ["text/html; charset=utf-8"], "Cache-Control": ["private, no-store, max-age=0"] });
    expect(contentResponseEligible(id, url)).toBe(false);
    noteContentResponse(id, url, 200, { "Content-Type": ["text/html"], "Cache-Control": ["private, max-age=0"] });
    expect(contentResponseEligible(id, url)).toBe(true);
    expect(contentResponseEligible(id, `${url}?other=1`)).toBe(false);
    forgetContentResponse(id);
    expect(contentResponseEligible(id, url)).toBe(false);
    noteContentResponse(id, url, 403, { "Content-Type": ["text/html"] });
    expect(contentResponseEligible(id, url)).toBe(false);
    noteContentResponse(id, url, 200, { "Content-Type": ["application/pdf"] });
    expect(contentResponseEligible(id, url)).toBe(false);
  });

  it("classifies deliberate capture denials without exposing page content", async () => {
    const id = 915;
    const url = "https://example.com/private";
    const contents = { id, isDestroyed: () => false, getURL: () => url,
      executeJavaScriptInIsolatedWorld: async () => false } as unknown as WebContents;
    noteContentResponse(id, url, 200, { "Content-Type": "text/html", "Cache-Control": "no-store" });
    await expect(captureReadablePage(contents, url, () => true)).rejects.toMatchObject({ code: "permission_denied" });
    noteContentResponse(id, url, 200, { "Content-Type": "text/html" });
    await expect(captureReadablePage(contents, url, () => true)).rejects.toMatchObject({ code: "permission_denied" });
    forgetContentResponse(id);
  });
});
