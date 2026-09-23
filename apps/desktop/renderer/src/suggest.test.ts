import { describe, expect, it } from "vitest";
import { dedupeByUrl, isPrivateAddress, matchScore, rankCandidates, recencyBoost } from "./suggest";

const c = (id: string, title: string, url?: string, lastVisit?: number) => ({ id, title, url, lastVisit });

describe("matchScore tiers", () => {
  it("exact > prefix > word boundary > substring, and misses score -1", () => {
    expect(matchScore("github", "GitHub", "https://github.com/")).toBe(100);
    expect(matchScore("git", "GitHub", "https://github.com/")).toBe(80);
    expect(matchScore("hub", "Git Hub tools", "")).toBe(60);
    expect(matchScore("ith", "GitHub", "https://github.com/")).toBe(30);
    expect(matchScore("zzz", "GitHub", "https://github.com/")).toBe(-1);
    expect(matchScore("", "anything")).toBe(-1);
  });

  it("hosts match like titles — 'git' finds github.com on host prefix", () => {
    expect(matchScore("github.com", "", "https://github.com/x")).toBe(100);
    expect(matchScore("docs", "", "https://docs.stripe.com/api")).toBe(95); // host-prefix before dot
  });
});

describe("rankCandidates", () => {
  it("orders by tier, breaks ties by recency, drops non-matches", () => {
    const now = Date.now();
    const ranked = rankCandidates("git", [
      c("a", "Gitea", "https://gitea.io/", now), // prefix, fresh
      c("b", "GitHub", "https://github.com/", now - 40 * 86_400_000), // prefix, stale
      c("c", "no match", "https://nope.test/"),
    ], now);
    expect(ranked.map((r) => r.id)).toEqual(["a", "b"]);
  });

  it("recency decays to nothing after ~30 days", () => {
    const now = Date.now();
    expect(recencyBoost(now, now)).toBeCloseTo(20);
    expect(recencyBoost(now - 30 * 86_400_000, now)).toBe(0);
    expect(recencyBoost(undefined, now)).toBe(0);
  });
});

describe("dedupeByUrl", () => {
  it("first provider wins; trailing-slash variants collapse", () => {
    const out = dedupeByUrl([
      c("tab", "open", "https://a.com/"),
      c("h", "hist", "https://a.com"),
      c("b", "bm", "https://b.com/"),
      c("none", "no url"),
    ]);
    expect(out.map((o) => o.id)).toEqual(["tab", "b", "none"]);
  });
});

describe("isPrivateAddress — remote suggestion gating", () => {
  it("blocks localhost, IPs, intranet and credential URLs", () => {
    for (const v of [
      "localhost", "localhost:3000", "127.0.0.1", "0.0.0.0", "::1", "[::1]:8080",
      "192.168.1.1", "10.0.0.5/admin", "172.16.0.1", "169.254.1.1",
      "intranet", "wiki.local", "nas.internal", "corp.lan", "router.home",
      "https://user:pass@internal.example/", "fd00::1",
      // Bare single-label names might be intranet hosts — never leave the machine.
      "github", "wiki", "docs",
    ]) {
      expect(isPrivateAddress(v)).toBe(true);
    }
  });

  it("allows public queries and multi-label domains", () => {
    for (const v of [
      "github copilot", "how to bake bread", "node.js", "münchen weather", "8.8.8.8",
      "docs.stripe.com/api", "what's new", "github.com",
    ]) {
      expect(isPrivateAddress(v)).toBe(false);
    }
  });
});
