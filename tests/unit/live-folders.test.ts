import { afterEach, describe, expect, it } from "vitest";
import { openDb, Repo, NullNativeBridge } from "@aux/runtime";
import { GithubConnectionService } from "../../apps/runtime/dist/services/github-connection.js";
import { LiveFolderService, feedItems } from "../../apps/runtime/dist/services/live-folders.js";
import { liveFolderFetch } from "../../apps/runtime/dist/services/live-folder-fetch.js";
import type { LiveFolder } from "@aux/contracts";

const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => {
  for (const db of databases.splice(0)) db.close();
});
const fixture = (
  http: typeof fetch,
  source: LiveFolder = { kind: "rss", config: { url: "https://feeds.test/rss" }, refreshMinutes: 15 },
) => {
  const db = openDb(":memory:");
  databases.push(db);
  const repo = new Repo(db);
  let sources = [{ id: "folder", live: source }];
  const github = new GithubConnectionService({ repo, native: new NullNativeBridge() });
  const folders = new LiveFolderService({
    repo,
    github,
    sources: async () => sources,
    fetch: http,
    routineItems: async () => [],
    now: () => 100_000,
  });
  return {
    folders,
    repo,
    restart: () =>
      new LiveFolderService({
        repo,
        github,
        sources: async () => sources,
        fetch: http,
        routineItems: async () => [],
        now: () => 200_000,
      }),
    sourceChanged: () => {
      sources = [];
    },
  };
};
const rss =
  "<rss><channel><item><guid>a</guid><title><![CDATA[One &amp; two]]></title><link>https://article.test/a</link><pubDate>2026-01-01</pubDate></item><item><title>Next</title><link>https://article.test/b</link></item></channel></rss>";

describe("live folder sources", () => {
  it("extracts RSS and Atom URL rows without external entities or unsafe links", () => {
    expect(feedItems(rss, "https://feeds.test/rss", 100).map((item) => [item.title, item.url])).toEqual([
      ["One & two", "https://article.test/a"],
      ["Next", "https://article.test/b"],
    ]);
    const atom =
      '<feed><entry><id>one</id><title>Meeting</title><link rel="self" href="https://feed.test/one"/><link rel="alternate" href="/meeting"/></entry></feed>';
    expect(feedItems(atom, "https://feeds.test/atom")[0]?.url).toBe("https://feeds.test/meeting");
    expect(() =>
      feedItems('<!DOCTYPE rss [<!ENTITY attack SYSTEM "file:///etc/passwd">]><rss/>', "https://feed.test"),
    ).toThrow(/safe RSS/);
    expect(
      feedItems("<rss><item><link>javascript:alert(1)</link></item></rss>", "https://feed.test"),
    ).toEqual([]);
  });
  it("caches twenty-five rows, preserves read dots and survives a new service instance", async () => {
    const { folders, repo, restart } = fixture(async () => new Response(rss));
    await folders.refresh("folder");
    await folders.markRead("folder", "a");
    await folders.markRead("folder", "https://article.test/b");
    expect((await folders.refresh("folder")).items.every((item) => !item.unread)).toBe(true);
    expect((await restart().refresh("folder")).items.every((item) => !item.unread)).toBe(true);
    expect(
      repo.getSetting<{ items: { unread: boolean }[] }>("liveFolders:cache:folder")?.items[0]?.unread,
    ).toBe(false);
    expect(
      feedItems(
        "<rss>" +
          Array.from(
            { length: 30 },
            (_, i) => `<item><guid>${i}</guid><link>https://article.test/${i}</link></item>`,
          ).join("") +
          "</rss>",
        "https://feed.test",
      ),
    ).toHaveLength(25);
  });
  it("refuses an expanded redirect grant before sending a request and caps streamed bodies", async () => {
    const urls: string[] = [];
    await expect(
      liveFolderFetch("https://feeds.test/rss", ["feeds.test"], {
        fetch: async (input) => {
          urls.push(String(input));
          return new Response(null, { status: 302, headers: { location: "https://secret.test/export" } });
        },
      }),
    ).rejects.toThrow(/cannot connect/);
    expect(urls).toEqual(["https://feeds.test/rss"]);
    await expect(
      liveFolderFetch("https://feeds.test/rss", ["feeds.test"], {
        fetch: async () =>
          new Response(null, { status: 302, headers: { location: "http://feeds.test/export" } }),
      }),
    ).rejects.toThrow(/cannot connect/);
    await expect(
      liveFolderFetch("https://feeds.test/rss", ["feeds.test"], {
        fetch: async () => new Response(new Uint8Array(1_000_001)),
      }),
    ).rejects.toThrow(/1 MB/);
  });
  it("retains cached rows on errors and refuses publishing after source deletion", async () => {
    let failed = false;
    const { folders } = fixture(async () =>
      failed ? new Response(null, { status: 500 }) : new Response(rss),
    );
    await folders.refresh("folder");
    failed = true;
    const result = await folders.refresh("folder");
    expect(result.error).toMatch(/Couldn't refresh/);
    expect(result.items).toHaveLength(2);
    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    const changing = fixture(async () => {
      await pending;
      return new Response(rss);
    });
    const refresh = changing.folders.refresh("folder");
    await Promise.resolve();
    changing.sourceChanged();
    release();
    await expect(refresh).rejects.toThrow(/changed during refresh/);
    await expect(changing.folders.items("folder")).rejects.toThrow(/no longer available/);
  });
});

it("marks a changed undated article unread while preserving an unchanged article", async () => {
  let content = rss;
  const { folders } = fixture(async () => new Response(content));
  await folders.refresh("folder");
  await folders.markRead("folder", "a");
  await folders.markRead("folder", "https://article.test/b");
  content = rss.replace("<title>Next</title>", "<title>Revised</title>");
  const rows = (await folders.refresh("folder")).items;
  expect(rows.map((row) => row.unread)).toEqual([false, true]);
});

it("refuses authenticated redirects to another port before forwarding the token", async () => {
  const requests: string[] = [];
  await expect(
    liveFolderFetch("https://feeds.test/rss", ["feeds.test"], {
      headers: { Authorization: "Bearer synthetic-fixture-token" },
      fetch: async (input) => {
        requests.push(String(input));
        return new Response(null, { status: 302, headers: { location: "https://feeds.test:8443/export" } });
      },
    }),
  ).rejects.toThrow(/cannot connect/);
  expect(requests).toEqual(["https://feeds.test/rss"]);
});
