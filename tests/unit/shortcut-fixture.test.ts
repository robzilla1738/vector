import { expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { createFixture } from "../host/lib/fixture.mjs";
import { registerShortcutFixtures } from "../host/journeys/shortcut-registry.mjs";

it("serves the actual shortcut HTML documents over loopback without a JSON wrapper", async () => {
  const fixture = await createFixture();
  const documents = new Map<string, JSDOM>();
  try {
    registerShortcutFixtures(fixture);
    for (const path of ["/shortcut-article", "/shortcut-counter"]) {
      const response = await fetch(`${fixture.url}${path}`);
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
      const body = await response.text();
      expect(body.startsWith("<!doctype html>")).toBe(true);
      expect(() => JSON.parse(body)).toThrow();
      documents.set(path, new JSDOM(body));
    }
    const article = documents.get("/shortcut-article")!.window.document;
    const counter = documents.get("/shortcut-counter")!.window.document;
    expect(article.querySelectorAll("article p")).toHaveLength(30);
    expect(article.title).toBe("Shortcut article");
    expect(counter.querySelector('[aria-label="Website editor"]')).not.toBeNull();
    expect(counter.querySelector("#received")?.textContent).toBe("Website shortcuts: 0");
    expect(counter.querySelector("#released")?.textContent).toBe("Website releases: 0");
    expect(counter.querySelector("script")?.textContent).toContain("event.altKey");
  } finally {
    for (const dom of documents.values()) dom.window.close();
    await fixture.close();
  }
});
