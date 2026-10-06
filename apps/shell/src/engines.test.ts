import { describe, expect, it } from "vitest";
import {
  DEFAULT_ENGINES,
  engineList,
  keywordOf,
  parseSuggestResponse,
  resolveKeyword,
  suggestEndpoint,
} from "./engines";

describe("engineList", () => {
  it("ships the built-ins and merges user engines over them by keyword", () => {
    const list = engineList();
    expect(list.map((e) => e.keyword)).toContain("gh");
    const custom = engineList([
      { keyword: "gh", name: "My GitHub", template: "https://ghe.example/search?q=%s" },
      {
        keyword: "jira",
        name: "Jira",
        template: "https://jira.example/secure/QuickSearch.jspa?searchString=%s",
      },
    ]);
    expect(custom.find((e) => e.keyword === "gh")?.template).toBe("https://ghe.example/search?q=%s");
    expect(custom.find((e) => e.keyword === "jira")?.name).toBe("Jira");
    expect(custom.length).toBe(DEFAULT_ENGINES.length + 1);
  });

  it("drops invalid rows — bad keyword, bad template, missing %s", () => {
    const custom = engineList([
      { keyword: "no good", name: "x", template: "https://x.test/?q=%s" },
      { keyword: "ok", name: "x", template: "not a url %s" },
      { keyword: "fine", name: "x", template: "https://x.test/search" },
    ]);
    expect(custom.filter((e) => !DEFAULT_ENGINES.some((d) => d.keyword === e.keyword))).toEqual([]);
  });
});

describe("resolveKeyword", () => {
  const engines = engineList();
  it("kw + terms resolves the engine URL", () => {
    const hit = resolveKeyword("gh aux browser", engines);
    expect(hit?.engine.name).toBe("GitHub");
    expect(hit?.url).toBe("https://github.com/search?q=aux%20browser");
    expect(resolveKeyword("MDN array methods", engines)?.url).toContain(
      "developer.mozilla.org/search?q=array%20methods",
    );
  });

  it("returns null without terms or for unknown keywords", () => {
    expect(resolveKeyword("gh", engines)).toBeNull();
    expect(resolveKeyword("gh ", engines)).toBeNull();
    expect(resolveKeyword("nosuchengine x", engines)).toBeNull();
    expect(resolveKeyword("plain search", engines)).toBeNull();
  });

  it("keywordOf identifies the engine while terms are being typed", () => {
    expect(keywordOf("gh ", engines)?.name).toBe("GitHub");
    expect(keywordOf("zzz x", engines)).toBeNull();
  });
});

describe("remote suggestion gating", () => {
  it("only known engines earn a suggest endpoint", () => {
    expect(suggestEndpoint("https://duckduckgo.com/?q=%s")).toContain("duckduckgo.com/ac/");
    expect(suggestEndpoint("https://www.google.com/search?q=%s")).toContain("suggestqueries.google.com");
    expect(suggestEndpoint("https://bing.com/search?q=%s")).toBeNull();
    expect(suggestEndpoint("https://intranet.local/search?q=%s")).toBeNull();
    expect(suggestEndpoint(undefined)).toBeNull();
    expect(suggestEndpoint("not a url")).toBeNull();
  });

  it("parses loosely-shaped provider responses", () => {
    expect(parseSuggestResponse(["q", ["one", "two"]])).toEqual(["one", "two"]);
    expect(parseSuggestResponse(["a", "b"])).toEqual(["a", "b"]);
    expect(parseSuggestResponse({ suggestions: [] })).toEqual([]);
    expect(parseSuggestResponse(null)).toEqual([]);
    expect(parseSuggestResponse(["q", Array.from({ length: 9 }, (_, i) => `s${i}`)])).toHaveLength(5);
  });
});
