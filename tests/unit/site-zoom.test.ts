import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { SiteZoomPreferences } from "../../apps/desktop/main/site-zoom.js";

it("restores site zoom across restarts, strips page paths and removes reset preferences", () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-site-zoom-"));
  const file = join(directory, "zoom.json");
  try {
    const preferences = new SiteZoomPreferences(file);
    preferences.remember("https://example.com/private-path?token=not-saved", 2);
    const reopened = new SiteZoomPreferences(file);
    expect(reopened.level("https://example.com/another-page")).toBe(2);
    expect(reopened.level("https://other.example.com")).toBe(0);
    expect(readFileSync(file, "utf8")).not.toContain("private-path");
    expect(readFileSync(file, "utf8")).not.toContain("token");
    let applied = -1;
    reopened.apply({ isDestroyed: () => false, setZoomLevel: value => { applied = value; } }, "https://example.com/article");
    expect(applied).toBe(2);
    expect(reopened.list()).toEqual([{origin:"https://example.com",percentage:144}]);
    expect(() => reopened.reset("https://example.com/path")).toThrow("saved website");
    reopened.reset("https://example.com");
    expect(reopened.list()).toEqual([]);
    expect(new SiteZoomPreferences(file).level("https://example.com")).toBe(0);
    expect(JSON.parse(readFileSync(file, "utf8"))).toEqual([]);
  } finally { rmSync(directory, {recursive:true, force:true}); }
});

it("isolates private-session preferences and ignores malformed stored values", () => {
  const memory = new SiteZoomPreferences();
  memory.remember("https://example.com", 1);
  expect(memory.level("https://example.com")).toBe(1);
  expect(new SiteZoomPreferences().level("https://example.com")).toBe(0);
  memory.remember("file:///private/file", 2);
  expect(memory.level("file:///private/file")).toBe(0);
  const directory = mkdtempSync(join(tmpdir(), "aux-site-zoom-"));
  const file = join(directory, "zoom.json");
  try {
    writeFileSync(file, JSON.stringify([["https://example.com", "2"], ["file:///x", 2], ["https://large.test", 900], ["https://valid.test", 1]]));
    const saved = new SiteZoomPreferences(file);
    expect(saved.level("https://example.com")).toBe(0);
    expect(saved.level("https://large.test")).toBe(0);
    expect(saved.level("https://valid.test")).toBe(1);
  } finally { rmSync(directory, {recursive:true, force:true}); }
});
