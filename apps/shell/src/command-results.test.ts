import { describe, expect, it } from "vitest";
import { commandCandidateKey, mergeCommandResults, titleHostKey } from "./command-results";
import { rankAuxCommandResults } from "./command-ranking-renderer";

describe("command result merge", () => {
  it("preserves Chromium order and drops matching title plus host from Aux", () => {
    const host = [
      {
        id: "history-1",
        title: "Release Notes",
        url: "https://example.com/releases",
      },
      {
        id: "bookmark-1",
        title: "Project",
        url: "https://aux.example/project",
      },
    ];
    const aux = [
      {
        id: "tab-1",
        title: "Release  Notes",
        url: "https://example.com/releases?from=tab",
      },
      {
        id: "skill-1",
        title: "Review release",
        url: "https://example.com/releases",
      },
    ];
    const result = mergeCommandResults(host, aux);
    expect(result.rows.map((row) => row.id)).toEqual(["history-1", "bookmark-1", "skill-1"]);
    expect(result.dropped).toEqual([
      {
        droppedId: "tab-1",
        keptId: "history-1",
        key: "release notes\u0000example.com",
      },
    ]);
  });

  it("keeps distinct titles and non-web actions", () => {
    expect(titleHostKey({ id: "command", title: "Open settings" })).toBeNull();
    expect(
      mergeCommandResults(
        [{ id: "a", title: "A", url: "https://example.com" }],
        [
          { id: "b", title: "B", url: "https://example.com" },
          { id: "c", title: "A" },
        ],
      ).rows.map((row) => row.id),
    ).toEqual(["a", "b", "c"]);
  });
});

describe("learned Aux ranking", () => {
  it("promotes a selected match within its text tier without reordering Chromium results", () => {
    const query = "alpha";
    const aux = [
      { id: "first", section: "tabs" as const, title: "Alpha one", url: "https://one.example/" },
      { id: "second", section: "tabs" as const, title: "Alpha two", url: "https://two.example/" },
    ];
    const entry = {
      query,
      candidateKey: commandCandidateKey(aux[1]!),
      source: "tabs" as const,
      uses: 8,
      lastUsedAt: 1000,
    };
    const ranked = rankAuxCommandResults(query, aux, [entry], 1000);
    expect(ranked.map((item) => item.candidate.id)).toEqual(["second", "first"]);
    expect(ranked[0]?.adjustment).toBeGreaterThan(0);
    const host = [{ id: "host-top", title: "Alpha browser", url: "https://browser.example/" }];
    expect(
      mergeCommandResults(
        host,
        ranked.map((item) => item.candidate),
      ).rows[0]?.id,
    ).toBe("host-top");
    expect(rankAuxCommandResults(query, aux, [entry], 1000 + 90 * 86_400_000)[0]?.candidate.id).toBe("first");
  });

  it("shares a learned web key across providers and keeps non-web keys distinct", () => {
    expect(
      commandCandidateKey({ id: "tab", section: "tabs", title: "Release Notes", url: "https://a.example/a" }),
    ).toBe(
      commandCandidateKey({
        id: "bookmark",
        section: "bookmarks",
        title: "Release Notes",
        url: "https://a.example/b",
      }),
    );
    expect(commandCandidateKey({ id: "result", section: "results", title: "Release Notes" })).not.toBe(
      commandCandidateKey({ id: "skill", section: "skills", title: "Release Notes" }),
    );
  });
});
