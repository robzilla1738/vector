import { describe, expect, it } from "vitest";
import { contentResponseEligible, forgetContentResponse, noteContentResponse } from "../../apps/desktop/main/content-capture.js";

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
});
