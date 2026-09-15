import { describe, expect, it } from "vitest";
import {
  activityCounts,
  addressNavigate,
  isFlowOverlay,
  isScrimOverlay,
  isUrlLike,
  nativePageId,
  toUrl,
} from "../../apps/desktop/renderer/src/chrome";

describe("address field — URL vs search, never an agent run", () => {
  it("turns a URL-like input into an http(s) navigate URL", () => {
    expect(toUrl("https://example.com/path")).toBe("https://example.com/path");
    expect(toUrl("example.com")).toBe("https://example.com");
    expect(toUrl("localhost:4810/records")).toBe("http://localhost:4810/records");
    expect(toUrl("127.0.0.1:3000")).toBe("http://127.0.0.1:3000");
    expect(toUrl("about:blank")).toBe("about:blank");
    expect(toUrl("file:///tmp/x.html")).toBe("file:///tmp/x.html");
    expect(isUrlLike("rhemabible.app")).toBe(true);
  });

  it("sends a search string through the configured engine", () => {
    expect(toUrl("open source browsers")).toBe("https://duckduckgo.com/?q=open%20source%20browsers");
    expect(toUrl("vector agent runtime", "https://www.google.com/search?q=%s")).toBe(
      "https://www.google.com/search?q=vector%20agent%20runtime",
    );
  });

  it("never starts an agent run from the address field", () => {
    for (const q of ["https://example.com", "example.com", "what is a page set", "  spaced query  "]) {
      const r = addressNavigate(q);
      expect(r.action).toBe("navigate");
      expect(r.url.startsWith("http") || r.url.startsWith("about:") || r.url.startsWith("file:")).toBe(true);
      expect(r).not.toHaveProperty("goal");
      expect(JSON.stringify(r)).not.toMatch(/runs\.start|sendChat|agent/);
    }
  });
});

describe("overlay → native-view visibility", () => {
  const page = "page-1";
  const url = "https://example.com";

  it("hides the native page for palette, settings, history, and observe", () => {
    for (const overlay of ["palette", "settings", "history", "observe"] as const) {
      expect(isScrimOverlay(overlay)).toBe(true);
      expect(isFlowOverlay(overlay)).toBe(false);
      expect(nativePageId({ mode: "focus", overlay, activePageId: page, url })).toBeNull();
    }
  });

  it("keeps the native page live for find and downloads (in-flow strips)", () => {
    for (const overlay of ["find", "downloads"] as const) {
      expect(isScrimOverlay(overlay)).toBe(false);
      expect(isFlowOverlay(overlay)).toBe(true);
      expect(nativePageId({ mode: "focus", overlay, activePageId: page, url })).toBe(page);
    }
  });

  it("shows the native page only in focus with no scrim", () => {
    expect(nativePageId({ mode: "focus", overlay: null, activePageId: page, url })).toBe(page);
    expect(nativePageId({ mode: "overview", overlay: null, activePageId: page, url })).toBeNull();
    expect(nativePageId({ mode: "table", overlay: null, activePageId: page, url })).toBeNull();
    expect(nativePageId({ mode: "focus", overlay: null, activePageId: null, url })).toBeNull();
  });

  it("hides the native page for a missing or about:blank URL so NewTabHome is visible", () => {
    expect(nativePageId({ mode: "focus", overlay: null, activePageId: page, url: "about:blank" })).toBeNull();
    expect(nativePageId({ mode: "focus", overlay: null, activePageId: page, url: "" })).toBeNull();
    expect(nativePageId({ mode: "focus", overlay: null, activePageId: page, url: null })).toBeNull();
    expect(nativePageId({ mode: "focus", overlay: null, activePageId: page, url: undefined })).toBeNull();
    expect(nativePageId({ mode: "focus", overlay: "find", activePageId: page, url: "about:blank" })).toBeNull();
    expect(nativePageId({ mode: "focus", overlay: null, activePageId: page, url: "https://example.com/" })).toBe(page);
  });
});

describe("activity shelf counts", () => {
  it("reports complete / active / queued / files and never a percentage", () => {
    const counts = activityCounts({
      members: [
        { status: "completed" },
        { status: "completed" },
        { status: "running" },
        { status: "queued" },
        { status: "queued" },
        { status: "failed" },
      ],
      runs: [{ status: "running" }],
      downloads: [{ state: "completed" }, { state: "progressing" }],
    });
    expect(counts).toEqual({ complete: 2, active: 1, queued: 2, files: 1, needsAttention: 1 });
    expect(counts).not.toHaveProperty("percent");
    expect(JSON.stringify(counts)).not.toMatch(/%|percent/i);
  });
});
