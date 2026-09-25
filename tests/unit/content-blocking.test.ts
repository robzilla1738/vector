import { describe, expect, it } from "vitest";
import {
  assertContentBlockReceipt, assertCookieBannerReceipt, BlockedCountState, cookieSelectorsForSite,
  filterSourceUrl, parseCookieBannerList, parseHostsList,
  readBoundedFilterText, MAX_FILTER_BYTES,
} from "@aux/contracts";

describe("host-neutral content blocking policy", () => {
  it("accepts exact HTTPS sources and rejects local, credentialed or redirected targets", () => {
    expect(filterSourceUrl("https://lists.example.test/hosts.txt"))
      .toBe("https://lists.example.test/hosts.txt");
    for (const url of [
      "http://lists.example.test/hosts", "https://localhost/hosts", "https://127.0.0.1/hosts",
      "https://user:secret@lists.example.test/hosts", "https://lists.example.test/hosts#fragment",
      "https://[::1]/hosts", "not-a-url",
    ]) expect(() => filterSourceUrl(url)).toThrow();
  });

  it("parses only hosts-format lines and ignores unrelated text", () => {
    expect(parseHostsList("0.0.0.0 ads.example.test\ntracker.example.test\nexample.test stray\n127.0.0.1 localhost"))
      .toEqual(new Set(["ads.example.test", "tracker.example.test"]));
  });

  it("accepts bounded declarative cookie selectors with exact domain scope", () => {
    const rules = parseCookieBannerList([
      "##.cookie-banner", "shop.example.test##[data-cookie-consent]", "example.test##.cookie-modal > .notice",
      "! comment", "example.test##.cookie-modal > .notice",
      "evil.example.test##body", "example.test#@#.cookie-banner", "##.cookie-banner{color:red}",
      "##.cookie-banner:has(script)", "##.cookie-banner, body", "~example.test##.cookie-banner",
    ].join("\n"));
    expect(rules).toHaveLength(3);
    expect(cookieSelectorsForSite(rules, "shop.example.test")).toEqual([
      ".cookie-banner", "[data-cookie-consent]", ".cookie-modal > .notice",
    ]);
    expect(cookieSelectorsForSite(rules, "notexample.test")).toEqual([".cookie-banner"]);
    expect(parseCookieBannerList("##.one\n##.two", 1)).toHaveLength(1);
  });

  it("requires a matching profile, privacy mode and generation from native cosmetic apply", () => {
    const snapshot = { profileId: "profile-a", private: true, generation: 4, rulesDigest: "a".repeat(64),
      rules: [{ domains: ["example.test"], selector: ".cookie-banner" }], allowedSiteHosts: [], enabled: true };
    const receipt = { backend: "isolated_world_stylesheet" as const, profileId: "profile-a", private: true,
      generation: 4, rulesDigest: snapshot.rulesDigest, installedRules: 1 };
    expect(() => assertCookieBannerReceipt(snapshot, receipt)).not.toThrow();
    expect(() => assertCookieBannerReceipt(snapshot, { ...receipt, profileId: "profile-b" })).toThrow(/attest/);
    expect(() => assertCookieBannerReceipt(snapshot, { ...receipt, private: false })).toThrow(/attest/);
    expect(() => assertCookieBannerReceipt(snapshot, { ...receipt, generation: 3 })).toThrow(/attest/);
    expect(() => assertCookieBannerReceipt(snapshot, { ...receipt, installedRules: 0 })).toThrow(/attest/);
  });

  it("counts blocked requests by top-level site without retaining request URLs", () => {
    const counts = new BlockedCountState();
    counts.note("shop.example.test");
    counts.note("shop.example.test");
    counts.note("other.example.test");
    counts.note("");
    expect(counts.total).toBe(4);
    expect(counts.forSite("SHOP.EXAMPLE.TEST")).toBe(2);
    expect(counts.forSite("other.example.test")).toBe(1);
  });

  it("requires Chromium to attest the exact generation and digest", () => {
    const snapshot = { generation: 3, hostsDigest: "a".repeat(64), hosts: ["ads.example.test"],
      allowedSiteHosts: [], enabled: true };
    const receipt = { backend: "subresource_filter" as const, generation: 3,
      hostsDigest: snapshot.hostsDigest, installedRules: 1 };
    expect(() => assertContentBlockReceipt(snapshot, receipt)).not.toThrow();
    expect(() => assertContentBlockReceipt(snapshot, { ...receipt, generation: 2 })).toThrow(/attest/);
    expect(() => assertContentBlockReceipt(snapshot, { ...receipt, hostsDigest: "b".repeat(64) })).toThrow(/attest/);
    expect(() => assertContentBlockReceipt(snapshot, { ...receipt, installedRules: 0 })).toThrow(/attest/);
  });

  it("rejects oversized downloads before buffering their full body", async () => {
    const declared = new Response("small", { headers: { "content-length": String(MAX_FILTER_BYTES + 1) } });
    await expect(readBoundedFilterText(declared)).rejects.toThrow(/too large/);
    let cancelled = false;
    const chunk = new Uint8Array(1024 * 1024);
    const body = new ReadableStream<Uint8Array>({
      start(controller) { for (let i = 0; i < 17; i++) controller.enqueue(chunk); },
      cancel() { cancelled = true; },
    });
    await expect(readBoundedFilterText(new Response(body))).rejects.toThrow(/too large/);
    expect(cancelled).toBe(true);
  });
});
