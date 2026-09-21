import { expect, it } from "vitest";
import { MethodSchemas } from "@vector/contracts";
import { openDb, Repo } from "@vector/runtime";

it("pages tied visit times without skipping entries and combines date and literal search filters", () => {
  const db = openDb(":memory:");
  const repo = new Repo(db);
  try {
    const insert = db.prepare("INSERT INTO history(url,title,visited_at) VALUES(?,?,?)");
    insert.run("https://a.test", "100% match", 20);
    insert.run("https://b.test", "Other", 20);
    insert.run("https://c.test", "Older 100%", 10);
    const first = repo.listHistory(undefined, 1);
    expect(first[0]?.url).toBe("https://b.test");
    const second = repo.listHistory(undefined, 1, { before: first[0]! });
    expect(second[0]?.url).toBe("https://a.test");
    expect(repo.listHistory(undefined, 1, { before: second[0]! })[0]?.url).toBe("https://c.test");
    expect(repo.listHistory("%", 100, { since: 20 }).map(item => item.url)).toEqual(["https://a.test"]);
    expect(repo.listHistory("_", 100)).toEqual([]);
  } finally { db.close(); }
});

it("removes only the selected visit, retaining another visit and its bookmark", () => {
  const db = openDb(":memory:");
  const repo = new Repo(db);
  try {
    const url = "https://example.test";
    db.prepare("INSERT INTO history(url,title,visited_at) VALUES(?,?,?)").run(url, "Old visit", 10);
    db.prepare("INSERT INTO history(url,title,visited_at) VALUES(?,?,?)").run(url, "New visit", 20);
    repo.addBookmark(url, "Saved page");
    expect(repo.removeHistory(url, 10)).toBe(true);
    expect(repo.removeHistory(url, 10)).toBe(false);
    expect(repo.listHistory().map(item => item.visitedAt)).toEqual([20]);
    expect(repo.listBookmarks()).toHaveLength(1);
  } finally { db.close(); }
});

it("clears only visits inside the confirmed time range and preserves later visits and bookmarks", () => {
  const db = openDb(":memory:");
  const repo = new Repo(db);
  try {
    const insert = db.prepare("INSERT INTO history(url,title,visited_at) VALUES(?,?,?)");
    for (const time of [9, 10, 19, 20, 21]) insert.run(`https://visit${time}.test`, "Visit", time);
    repo.addBookmark("https://visit10.test", "Saved");
    expect(repo.clearHistory({ since: 10, before: 20 })).toBe(2);
    expect(repo.listHistory().map(item => item.visitedAt)).toEqual([21, 20, 9]);
    expect(repo.clearHistory({ since: 10, before: 20 })).toBe(0);
    expect(repo.listBookmarks()).toHaveLength(1);
    expect(repo.clearHistory({ before: 20 })).toBe(1);
    expect(repo.listHistory().map(item => item.visitedAt)).toEqual([21, 20]);
    expect(repo.clearHistory()).toBe(2);
  } finally { db.close(); }
});

it("rejects invalid history deletion ranges before they reach storage", () => {
  const schema = MethodSchemas["history.clear"];
  expect(schema.safeParse({ since: 20, before: 10 }).success).toBe(false);
  expect(schema.safeParse({ since: -1 }).success).toBe(false);
  expect(schema.safeParse({ before: Infinity }).success).toBe(false);
  expect(schema.safeParse({ before: "20" }).success).toBe(false);
  expect(schema.parse({ since: 10, before: 20 })).toEqual({ since: 10, before: 20 });
  expect(schema.parse({})).toEqual({});
});
