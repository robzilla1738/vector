import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ContentBlockingService } from "../../apps/runtime/src/services/content-blocking.js";
import { AuxError } from "@aux/contracts";
import type {
  ContentBlockAppend,
  ContentBlockBegin,
  ContentBlockCommit,
  NativeBridge,
} from "../../apps/runtime/src/native.js";

const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

function fixture() {
  const directory = mkdtempSync(join(tmpdir(), "aux-blocking-"));
  directories.push(directory);
  let begun: ContentBlockBegin | undefined;
  let hosts: string[] = [];
  const guards: (ContentBlockBegin["siteGuard"] | undefined)[] = [];
  const receipts: {
    generation: number;
    digest: string;
    hosts: string[];
    enabled: boolean;
    allowed: string[];
  }[] = [];
  const native = {
    async contentBlockBegin(input: ContentBlockBegin) {
      expect(input.profileId).toBe("Profile 1");
      begun = input;
      guards.push(input.siteGuard);
      hosts = [];
      return { accepted: true as const };
    },
    async contentBlockAppend(input: ContentBlockAppend) {
      expect(input.generation).toBe(begun?.generation);
      expect(input.offset).toBe(hosts.length);
      expect(input.hosts.length).toBeLessThanOrEqual(1024);
      hosts.push(...input.hosts);
      return { accepted: true as const };
    },
    async contentBlockCommit(input: ContentBlockCommit) {
      expect(input.generation).toBe(begun?.generation);
      expect(input.hostsDigest).toBe(createHash("sha256").update(hosts.join("\n")).digest("hex"));
      expect(hosts).toEqual([...hosts].sort());
      expect(new Set(hosts).size).toBe(hosts.length);
      expect(hosts.length).toBe(begun?.hostCount);
      receipts.push({
        generation: input.generation,
        digest: input.hostsDigest,
        hosts: [...hosts],
        enabled: begun!.enabled,
        allowed: [...begun!.allowedSiteHosts],
      });
      return {
        backend: "subresource_filter" as const,
        generation: input.generation,
        hostsDigest: input.hostsDigest,
        installedRules: hosts.length,
      };
    },
  } satisfies Pick<NativeBridge, "contentBlockBegin" | "contentBlockAppend" | "contentBlockCommit">;
  const service = new ContentBlockingService(directory, native, "Profile 1", async () => ({
    status: 200,
    etag: "fixture-v1",
    text: async () => "0.0.0.0 ads.fixture.test\ntracker.fixture.test\n||unsupported.test^",
  }));
  return { directory, native, service, receipts, guards };
}

describe("Chromium content blocking snapshots", () => {
  it("applies the built-in seed then a reviewed downloaded list with a native receipt", async () => {
    const { service, receipts } = fixture();
    await service.boot();
    expect(receipts).toHaveLength(1);
    expect(receipts[0]!.hosts.length).toBeGreaterThan(50);
    expect(service.status().backend).toBe("subresource_filter");
    const sources = await service.add("Fixture hosts", "https://lists.fixture.test/hosts.txt", "hosts");
    expect(sources).toHaveLength(1);
    expect(receipts.at(-1)!.hosts).toContain("ads.fixture.test");
    expect(receipts.at(-1)!.hosts).toContain("tracker.fixture.test");
    expect(receipts.at(-1)!.hosts).not.toContain("unsupported.test");
    expect(service.status().hosts).toBe(2);
    await service.setSiteAllowed("news.fixture.test", true);
    expect(receipts.at(-1)!.allowed).toEqual(["news.fixture.test"]);
    await service.setEnabled(false);
    expect(receipts.at(-1)!.enabled).toBe(false);
    await service.setSourceEnabled(sources[0]!.id, false);
    expect(receipts.at(-1)!.hosts).not.toContain("ads.fixture.test");
  });

  it("replays saved sources and preferences after restart, ignoring a modified cache", async () => {
    const { directory, native, service, receipts } = fixture();
    await service.boot();
    const [source] = await service.add("Fixture hosts", "https://lists.fixture.test/hosts.txt", "hosts");
    await service.setSiteAllowed("news.fixture.test", true);
    const restart = new ContentBlockingService(directory, native, "Profile 1", async () => {
      throw new Error("offline");
    });
    await restart.boot();
    expect(receipts.at(-1)!.hosts).toContain("ads.fixture.test");
    expect(restart.privacy().allowedHosts).toEqual(["news.fixture.test"]);
    writeFileSync(join(directory, "filters", `${source!.id}.txt`), "0.0.0.0 injected.fixture.test\n");
    const tampered = new ContentBlockingService(directory, native, "Profile 1");
    await tampered.boot();
    expect(receipts.at(-1)!.hosts).not.toContain("injected.fixture.test");
    expect(JSON.parse(readFileSync(join(directory, "filters", "blocking.json"), "utf8")).generation).toBe(
      receipts.at(-1)!.generation,
    );
  });

  it("rejects a mismatched native receipt and never claims cosmetic rules were installed", async () => {
    const { directory } = fixture();
    const native = {
      contentBlockBegin: async () => ({ accepted: true as const }),
      contentBlockAppend: async () => ({ accepted: true as const }),
      contentBlockCommit: async () => ({
        backend: "subresource_filter" as const,
        generation: 9,
        hostsDigest: "0".repeat(64),
        installedRules: 0,
      }),
    };
    const service = new ContentBlockingService(directory, native, "Profile 1");
    await expect(service.boot()).rejects.toThrow(/attest/);
    await expect(
      service.add("Cosmetic", "https://lists.fixture.test/cosmetic.txt", "cookie_banner"),
    ).rejects.toThrow(/native cosmetic/);
  });

  it("requires the selected page and navigation epoch for site-control writes", async () => {
    const { service, receipts, guards } = fixture();
    await service.boot();
    expect(() => service.handle("blocking.setSiteAllowed", { hostname: "shop.test", allowed: true })).toThrow(
      /Missing page review/,
    );
    await service.handle("blocking.setSiteAllowed", {
      hostname: "shop.test",
      allowed: true,
      siteGuard: { pageId: "page-1", expectedUrl: "https://shop.test/", navigationId: 7 },
    });
    expect(receipts.at(-1)!.allowed).toContain("shop.test");
    expect(guards.at(-1)).toEqual({ pageId: "page-1", expectedUrl: "https://shop.test/", navigationId: 7 });
  });

  it("keeps a stale-page exception out of persisted preferences", async () => {
    const { directory, native, service } = fixture();
    await service.boot();
    const rejectStale = {
      ...native,
      contentBlockBegin: async (input: ContentBlockBegin) => {
        if (input.siteGuard) throw new AuxError("conflict", "Content blocking page changed");
        return native.contentBlockBegin(input);
      },
    };
    const guarded = new ContentBlockingService(directory, rejectStale, "Profile 1");
    await guarded.boot();
    await expect(
      guarded.handle("blocking.setSiteAllowed", {
        hostname: "stale.test",
        allowed: true,
        siteGuard: { pageId: "page-1", expectedUrl: "https://stale.test/", navigationId: 2 },
      }),
    ).rejects.toMatchObject({ code: "conflict" });
    expect(guarded.privacy().allowedHosts).toEqual([]);
    const restart = new ContentBlockingService(directory, native, "Profile 1");
    expect(restart.privacy().allowedHosts).toEqual([]);
  });
});
