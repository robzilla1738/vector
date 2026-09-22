import { describe, expect, it } from "vitest";
import { detectIntent, intentLabel } from "./intent";

const ctx = { hasPage: true, searchEngine: "https://duckduckgo.com/?q=%s" };
const noPage = { hasPage: false, searchEngine: "https://duckduckgo.com/?q=%s" };

describe("command bar intent — URLs navigate", () => {
  it("routes full URLs and bare domains to navigate, never the model", () => {
    for (const v of ["https://example.com/path", "example.com", "localhost:4810/records", "127.0.0.1:3000", "docs.stripe.com/api"]) {
      const i = detectIntent(v, ctx);
      expect(i.kind, v).toBe("navigate");
    }
    const i = detectIntent("github.com/aux/pull/3", ctx);
    expect(i.kind === "navigate" && i.url).toBe("https://github.com/aux/pull/3");
    expect(i.kind === "navigate" && i.display).toBe("github.com/aux/pull/3");
  });

  it("keeps about:/file:/view-source: schemes intact", () => {
    expect(detectIntent("about:blank", ctx)).toMatchObject({ kind: "navigate", url: "about:blank" });
    expect(detectIntent("file:///tmp/x.html", ctx)).toMatchObject({ kind: "navigate", url: "file:///tmp/x.html" });
    expect(detectIntent("view-source:https://a.com", ctx)).toMatchObject({ kind: "navigate" });
    expect(detectIntent("data:text/html,<b>x</b>", ctx)).toMatchObject({ kind: "navigate" });
    expect(detectIntent("chrome://version", ctx)).toMatchObject({ kind: "navigate" });
  });

  it("classifies domain-like text, IPs, ports and IPv6 as navigation", () => {
    for (const v of [
      "node.js", "docs.stripe.com/api?q=1", "localhost:8080", "192.168.1.1:8443/admin",
      "[::1]:3000", "[2001:db8::1]/x", "münchen.de", "例え.jp", "xn--nxasmq6b.example",
    ]) {
      expect(detectIntent(v, ctx).kind, v).toBe("navigate");
    }
    expect(detectIntent("::1", ctx)).toMatchObject({ kind: "navigate", url: "http://[::1]" });
  });

  it("keeps ambiguous punctuation and non-English phrases as searches", () => {
    for (const v of [
      "what's on tv tonight", "c++ move semantics", "a,b testing", "version 1.2 notes",
      "qué tiempo hace", "今日の天気", "café menu", "(defun foo)", "100%",
    ]) {
      expect(detectIntent(v, ctx).kind, v).toBe("search");
    }
  });

  it("pastes URLs verbatim — no re-encoding, no search detour", () => {
    expect(detectIntent("https://example.com/a%20b?x=1&y=2#frag", ctx)).toMatchObject({
      kind: "navigate", url: "https://example.com/a%20b?x=1&y=2#frag",
    });
  });
});

describe("command bar intent — keyword engines", () => {
  it("`kw terms` routes to that engine's search with its name on the chip", () => {
    const i = detectIntent("gh aux browser", ctx);
    expect(i).toMatchObject({ kind: "search", engine: "GitHub", query: "aux browser", url: "https://github.com/search?q=aux%20browser" });
    expect(intentLabel(i)).toBe("GitHub");
  });

  it("user engines from settings override built-ins", () => {
    const withCustom = { ...ctx, searchEngines: [{ keyword: "gh", name: "GHE", template: "https://ghe.corp/search?q=%s" }] };
    expect(detectIntent("gh thing", withCustom)).toMatchObject({ engine: "GHE", url: "https://ghe.corp/search?q=thing" });
  });

  it("a bare keyword or unknown keyword stays a normal search", () => {
    expect(detectIntent("gh", ctx)).toMatchObject({ kind: "search", query: "gh" });
    expect(detectIntent("nosuch thing", ctx)).toMatchObject({ kind: "search", query: "nosuch thing" });
  });
});

describe("command bar intent — search", () => {
  it("sends short noun phrases and questions to the search engine", () => {
    expect(detectIntent("open source browsers", ctx).kind).toBe("search");
    expect(detectIntent("what is a page set", ctx)).toMatchObject({ kind: "search", url: "https://duckduckgo.com/?q=what%20is%20a%20page%20set" });
    expect(detectIntent("weather tomorrow?", ctx).kind).toBe("search");
  });

  it("? forces search and strips the marker", () => {
    expect(detectIntent("?summarise this page", ctx)).toMatchObject({ kind: "search", query: "summarise this page" });
  });

  it("'search for X' is a search, not a run", () => {
    expect(detectIntent("search for aux browser", ctx)).toMatchObject({ kind: "search", query: "search for aux browser" });
    expect(detectIntent("look up ResizeObserver", ctx)).toMatchObject({ kind: "search", query: "look up ResizeObserver" });
  });
});

describe("command bar intent — agent runs", () => {
  it("never turns ordinary address-bar text into an agent request", () => {
    for (const text of ["summarise the review comments", "book a table for two tonight", "what does this page say about refunds?", "every third-party script on the checkout flow with its size and load time please"]) {
      for (const context of [ctx, noPage]) expect(detectIntent(text, context)).toMatchObject({ kind: "search", query: text });
    }
    expect(detectIntent("> summarise this", ctx)).toMatchObject({ kind: "run", scope: "page" });
    expect(detectIntent("> summarise this", noPage)).toMatchObject({ kind: "run", scope: "new" });
  });

  it("> forces a run, / opens commands, empty is empty", () => {
    expect(detectIntent("> example.com", ctx)).toMatchObject({ kind: "run", goal: "example.com" });
    expect(detectIntent("/settings", ctx)).toMatchObject({ kind: "command", query: "settings" });
    expect(detectIntent("   ", ctx)).toEqual({ kind: "empty" });
    expect(detectIntent(">", ctx)).toEqual({ kind: "empty" });
  });
});

describe("intent chip labels", () => {
  it("names the action the way the UI shows it", () => {
    expect(intentLabel({ kind: "navigate", url: "https://a.com", display: "a.com" })).toBe("Open");
    expect(intentLabel({ kind: "search", query: "x", url: "u" })).toBe("Search");
    expect(intentLabel({ kind: "run", goal: "x", scope: "page" })).toBe("Ask on this page");
    expect(intentLabel({ kind: "run", goal: "x", scope: "new" })).toBe("New task");
    expect(intentLabel({ kind: "command", query: "x" })).toBe("Command");
    expect(intentLabel({ kind: "empty" })).toBe("");
  });
});
