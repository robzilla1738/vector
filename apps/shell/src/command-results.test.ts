import { describe, expect, it } from "vitest";
import { commandCandidateKey, mergeCommandResults, titleHostKey } from "./command-results";
import { rankAuxCommandResults } from "./command-ranking-renderer";

describe("command result merge", () => {
  it("keeps distinct URLs sharing an ordinary title and host", () => {
    const result = mergeCommandResults(
      [{ id: "history", title: "Article", url: "https://example.com/one" }],
      [{ id: "tab", title: "Article", url: "https://example.com/two", section: "tabs" }],
    );
    expect(result.rows.map((row) => row.id)).toEqual(["history", "tab"]);
    expect(titleHostKey(result.rows[0]!)).toBeNull();
  });
  it("canonicalizes only tracking parameters and hash, with an open tab winning", () => {
    const result = mergeCommandResults(
      [
        { id: "history", title: "First", url: "https://example.com/a?utm_source=x&b=2#a" },
        { id: "second", title: "Second", url: "https://other.example/b" },
      ],
      [{ id: "tab", title: "Live", url: "https://example.com/a?b=2#b", section: "tabs" }],
    );
    expect(result.rows.map((row) => row.id)).toEqual(["tab", "second"]);
    expect(result.dropped).toMatchObject([{ droppedId: "history", keptId: "tab" }]);
  });
  it("uses title and host aliases only on the bundled hosts", () => {
    const result = mergeCommandResults(
      [{ id: "history", title: "Issue", url: "https://github.com/a/issues/1" }],
      [{ id: "tab", title: "Issue", url: "https://github.com/a/issues/1?view=live", section: "tabs" }],
    );
    expect(result.rows.map((row) => row.id)).toEqual(["tab"]);
    expect(titleHostKey({ id: "command", title: "Settings" })).toBeNull();
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
    expect(
      rankAuxCommandResults(query, aux, [entry], 1000 + 365 * 86_400_000).find(
        (row) => row.candidate.id === "second",
      )?.adjustment,
    ).toBeLessThan(0.001);
  });

  it("shares a learned web key across providers and keeps non-web keys distinct", () => {
    expect(
      commandCandidateKey({
        id: "tab",
        section: "tabs",
        title: "Release Notes",
        url: "https://a.example/a#one",
      }),
    ).toBe(
      commandCandidateKey({
        id: "bookmark",
        section: "bookmarks",
        title: "Release Notes",
        url: "https://a.example/a#two",
      }),
    );
    expect(commandCandidateKey({ id: "result", section: "results", title: "Release Notes" })).not.toBe(
      commandCandidateKey({ id: "skill", section: "skills", title: "Release Notes" }),
    );
  });
});

it("coalesces canonical and bundled aliases without leaving a transitive duplicate", () => {
  const result = mergeCommandResults(
    [
      { id: "first", title: "First", url: "https://github.com/a" },
      { id: "second", title: "Second", url: "https://github.com/b" },
    ],
    [{ id: "tab", section: "tabs", title: "Second", url: "https://github.com/a#live" }],
  );
  expect(result.rows.map((row) => row.id)).toEqual(["tab"]);
  expect(result.dropped.map((row) => row.droppedId)).toEqual(["first", "second"]);
});
