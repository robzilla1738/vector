import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FilterLists, parseHostsList } from "../../apps/desktop/main/filter-lists.js";

const dirs: string[] = [];
function setup() {
  const dir = mkdtempSync(join(tmpdir(), "aux-filters-"));
  dirs.push(dir);
  return { dataDir: dir, lists: new FilterLists(dir) };
}
afterEach(() => { while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true }); });

describe("parseHostsList", () => {
  it("parses hosts-file, bare-domain and commented formats", () => {
    const hosts = parseHostsList([
      "# comment",
      "0.0.0.0 ads.example",
      "127.0.0.1 tracker.example # inline comment",
      "telemetry.example.org",
      "::1 metrics.example",
      "",
    ].join("\n"));
    expect(hosts).toEqual(new Set(["ads.example", "tracker.example", "telemetry.example.org", "metrics.example"]));
  });

  it("never blocks localhost-style names, IPs or malformed lines", () => {
    const hosts = parseHostsList([
      "0.0.0.0 localhost",
      "localhost",
      "0.0.0.0 broadcasthost",
      "127.0.0.1 example",          // no dot — not a public domain
      "255.255.255.255 host_name",  // underscores are not hostnames
      "-bad.example.com",
      "*.wildcard.example",
      "single",
      "0.0.0.0 .leading.example",
    ].join("\n"));
    expect(hosts.size).toBe(0);
  });
});

describe("FilterLists", () => {
  it("adds, persists and removes https sources", () => {
    const { dataDir, lists } = setup();
    lists.addSource("Test", "https://lists.example/hosts.txt");
    expect(() => lists.addSource("Dupe", "https://lists.example/hosts.txt")).toThrow(/already added/);
    expect(() => lists.addSource("Bad", "http://insecure.example/hosts")).toThrow(/HTTPS/);
    const reopened = new FilterLists(dataDir);
    expect(reopened.sources()).toHaveLength(1);
    const id = reopened.sources()[0]!.id;
    expect(reopened.removeSource(id)).toHaveLength(0);
    expect(new FilterLists(dataDir).sources()).toHaveLength(0);
  });

  it("merges hosts from enabled lists only and survives missing downloads", () => {
    const { dataDir, lists } = setup();
    const [a, b] = lists.addSource("A", "https://a.example/hosts") && lists.addSource("B", "https://b.example/hosts") && lists.sources();
    // Not downloaded yet → empty merge, no throw.
    expect(lists.loadHosts().size).toBe(0);
    writeFileSync(join(dataDir, "filters", `${a!.id}.txt`), "0.0.0.0 a1.example\n0.0.0.0 a2.example\n");
    writeFileSync(join(dataDir, "filters", `${b!.id}.txt`), "0.0.0.0 b1.example\n0.0.0.0 a2.example\n");
    lists.saveSources(lists.sources().map(s => s.id === b!.id ? { ...s, enabled: false } : s));
    expect(lists.loadHosts()).toEqual(new Set(["a1.example", "a2.example"]));
    lists.setEnabled(b!.id, true);
    expect(lists.loadHosts()).toEqual(new Set(["a1.example", "a2.example", "b1.example"]));
  });

  it("ignores forged source IDs before using them as cache paths", () => {
    const { dataDir, lists } = setup();
    writeFileSync(join(dataDir, "filters", "sources.json"), JSON.stringify([
      { id: "../escape", name: "Forged", url: "https://lists.example.test/hosts", enabled: true },
    ]));
    expect(lists.sources()).toEqual([]);
    expect(() => lists.removeSource("../escape")).toThrow(/saved filter list/);
    expect(() => lists.setEnabled("../escape", true)).toThrow(/saved filter list/);
  });

  it("parses lists off the main thread with the same merge", async () => {
    const { dataDir, lists } = setup();
    expect(await lists.loadHostsOffThread()).toEqual([]);
    const [a] = lists.addSource("A", "https://a.example/hosts");
    writeFileSync(join(dataDir, "filters", `${a!.id}.txt`), "# comment\n0.0.0.0 a1.example\n127.0.0.1 localhost\na2.example # trailing\n");
    expect(new Set(await lists.loadHostsOffThread())).toEqual(lists.loadHosts());
  });

  it("downloads atomically, honours etags and keeps the old list on failures", async () => {
    const { dataDir, lists } = setup();
    lists.addSource("A", "https://a.example/hosts");
    const id = lists.sources()[0]!.id;
    const fetchOk = async () => ({ status: 200, etag: "v1", text: async () => "0.0.0.0 good.example\n" });
    await lists.update(fetchOk);
    expect(lists.loadHosts()).toEqual(new Set(["good.example"]));
    expect(lists.meta(id)?.etag).toBe("v1");

    // A failing fetch must not clobber the cached list.
    await lists.update(async () => ({ status: 500, text: async () => "" }));
    expect(lists.loadHosts()).toEqual(new Set(["good.example"]));
    expect(lists.meta(id)?.error).toMatch(/HTTP 500/);

    // 304 keeps content but refreshes fetchedAt.
    const before = lists.meta(id)!.fetchedAt;
    await lists.update(async (_url, etag) => {
      expect(etag).toBe("v1");
      return { status: 304, text: async () => "" };
    });
    expect(lists.meta(id)!.fetchedAt).toBeGreaterThanOrEqual(before);

    // A download that isn't a hosts list is rejected.
    await lists.update(async () => ({ status: 200, text: async () => "<html>not a list</html>" }));
    expect(lists.loadHosts()).toEqual(new Set(["good.example"]));
    expect(lists.meta(id)?.error).toMatch(/hosts filter list/);
    expect(existsSync(join(dataDir, "filters", `${id}.txt`))).toBe(true);
  });

  it("does not accept a 304 when no cached list exists", async () => {
    const { lists } = setup();
    lists.addSource("A", "https://a.example/hosts");
    const id = lists.sources()[0]!.id;
    await lists.update(async () => ({ status: 304, text: async () => "" }));
    expect(lists.meta(id)?.error).toMatch(/cached filter list is unavailable/);
    expect(lists.loadHosts().size).toBe(0);
  });

  it("reports per-source status for the settings surface", async () => {
    const { lists } = setup();
    lists.addSource("A", "https://a.example/hosts");
    await lists.update(async () => ({ status: 200, text: async () => "0.0.0.0 a.example\n0.0.0.0 b.example\n" }));
    const status = lists.status(100);
    expect(status.builtinHosts).toBe(100);
    expect(status.hosts).toBe(2);
    expect(status.sources[0]?.meta?.hosts).toBe(2);
  });

  it("keeps hosts and cookie-banner caches separate across enable and failure", async () => {
    const { dataDir, lists } = setup();
    lists.addSource("Network", "https://lists.example.test/hosts", "hosts");
    lists.addSource("Cookies", "https://lists.example.test/cookies", "cookie_banner");
    expect(lists.sources().map(source => source.kind)).toEqual(["hosts", "cookie_banner"]);
    await lists.update(async url => ({ status: 200, text: async () => url.endsWith("hosts")
      ? "0.0.0.0 ads.example.test" : "##.cookie-overlay\nexample.test##[data-cookie-consent]" }));
    expect(await lists.loadHostsOffThread()).toEqual(["ads.example.test"]);
    expect(await lists.loadCookieRulesOffThread()).toEqual([
      { domains: [], selector: ".cookie-overlay" },
      { domains: ["example.test"], selector: "[data-cookie-consent]" },
    ]);
    expect(lists.status(5)).toMatchObject({ hosts: 1, cookieSelectors: 2 });
    const cookie = lists.sources()[1]!;
    lists.setEnabled(cookie.id, false);
    expect(await lists.loadCookieRulesOffThread()).toEqual([]);
    lists.setEnabled(cookie.id, true);
    await lists.update(async url => ({ status: url.endsWith("cookies") ? 200 : 304,
      text: async () => "<script>not a cosmetic list</script>" }));
    expect(lists.meta(cookie.id)?.error).toMatch(/cookie-banner filter list/);
    expect(await lists.loadCookieRulesOffThread()).toHaveLength(2);
    expect(new FilterLists(dataDir).sources()[1]?.kind).toBe("cookie_banner");
  });

  it("treats legacy sources without a kind as hosts lists", () => {
    const { dataDir, lists } = setup();
    const [source] = lists.addSource("Legacy", "https://lists.example.test/old");
    writeFileSync(join(dataDir, "filters", "sources.json"), JSON.stringify([{ ...source, kind: undefined }]));
    expect(new FilterLists(dataDir).sources()[0]?.kind).toBe("hosts");
  });

  it("does not apply a modified cookie cache and rejects an unchanged response for it", async () => {
    const { dataDir, lists } = setup();
    const [source] = lists.addSource("Cookies", "https://lists.example.test/cookies", "cookie_banner");
    await lists.update(async () => ({ status: 200, etag: "v1", text: async () => "##.cookie-banner" }));
    expect(await lists.loadCookieRulesOffThread()).toHaveLength(1);
    writeFileSync(join(dataDir, "filters", `${source!.id}.txt`), "##.tampered-banner");
    expect(await lists.loadCookieRulesOffThread()).toEqual([]);
    await lists.update(async () => ({ status: 304, text: async () => "" }));
    expect(lists.meta(source!.id)?.error).toMatch(/cached filter list is unavailable/);
    await lists.update(async () => ({ status: 200, text: async () => "##.cookie-banner" }));
    expect(await lists.loadCookieRulesOffThread()).toEqual([{ domains: [], selector: ".cookie-banner" }]);
  });
});
