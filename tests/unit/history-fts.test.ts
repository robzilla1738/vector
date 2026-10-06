import { afterEach, describe, expect, it } from "vitest";
import type { DatabaseSync } from "node:sqlite";
import { openDb, Repo } from "@aux/runtime";

const connections: DatabaseSync[] = [];
function repo() {
  const db = openDb(":memory:");
  connections.push(db);
  return new Repo(db);
}
afterEach(() => {
  for (const db of connections.splice(0)) {
    try {
      db.close();
    } catch {
      /* already closed */
    }
  }
});

const visit = (r: Repo, url: string, title: string) => r.addHistory(url, title);

describe("history FTS index", () => {
  it("finds entries by url and title tokens, most recent first", async () => {
    const r = repo();
    visit(r, "https://github.com/aux", "Aux repo");
    await new Promise((resolve) => setTimeout(resolve, 5));
    visit(r, "https://news.example/", "GitHub takes the news");
    await new Promise((resolve) => setTimeout(resolve, 5));
    visit(r, "https://docs.example/", "Unrelated");
    const hits = r.listHistory("github");
    expect(hits.map((h) => h.url)).toEqual(["https://news.example/", "https://github.com/aux"]);
  });

  it("prefix-matches partial tokens and fills mid-token substrings via LIKE", () => {
    const r = repo();
    visit(r, "https://github.com/aux", "Aux repo");
    expect(r.listHistory("git").map((h) => h.url)).toContain("https://github.com/aux");
    // "ithub" is mid-token — FTS can't see it, the LIKE fill must.
    expect(r.listHistory("ithub").map((h) => h.url)).toContain("https://github.com/aux");
  });

  it("stays in sync through update and delete triggers", () => {
    const r = repo();
    visit(r, "https://a.example/", "Alpha");
    // Revisits are distinct rows keyed by (url, visited_at) — the update path
    // is exercised directly so the trigger check does not depend on timing.
    (r as unknown as { db: DatabaseSync }).db
      .prepare("UPDATE history SET title = ? WHERE url = ?")
      .run("Renamed", "https://a.example/");
    expect(r.listHistory("renamed").map((h) => h.url)).toEqual(["https://a.example/"]);
    expect(r.listHistory("alpha").map((h) => h.url)).toEqual([]);
    r.removeHistory("https://a.example/", r.listHistory()[0]!.visitedAt);
    expect(r.listHistory("renamed")).toEqual([]);
  });

  it("handles punctuation-heavy and non-English queries without FTS errors", () => {
    const r = repo();
    visit(r, "https://cafe.example/", "Café Menü");
    expect(r.listHistory('weird "query" (with) [punct]').length).toBe(0);
    expect(r.listHistory("café").map((h) => h.url)).toContain("https://cafe.example/");
  });

  it("respects limit and dedupes FTS/LIKE overlap", () => {
    const r = repo();
    for (let i = 0; i < 10; i += 1) visit(r, `https://dup${i}.example/`, `Shared Title ${i}`);
    const hits = r.listHistory("shared", 4);
    expect(hits).toHaveLength(4);
    expect(new Set(hits.map((h) => h.url)).size).toBe(4);
  });
});
