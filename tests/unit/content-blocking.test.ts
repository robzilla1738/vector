import { describe, expect, it } from "vitest";
import {
  assertContentBlockReceipt,
  BlockedCountState,
  filterSourceUrl,
  readBoundedFilterText,
  MAX_FILTER_BYTES,
} from "@aux/contracts";

describe("host-neutral content blocking policy", () => {
  it("accepts exact HTTPS sources and rejects local, credentialed or redirected targets", () => {
    expect(filterSourceUrl("https://lists.example.test/hosts.txt")).toBe(
      "https://lists.example.test/hosts.txt",
    );
    for (const url of [
      "http://lists.example.test/hosts",
      "https://localhost/hosts",
      "https://127.0.0.1/hosts",
      "https://user:secret@lists.example.test/hosts",
      "https://lists.example.test/hosts#fragment",
      "https://[::1]/hosts",
      "not-a-url",
    ])
      expect(() => filterSourceUrl(url)).toThrow();
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

  it("requires the exact native Profile, generation, digest and ordered source receipts", () => {
    const source = {
      id: "a".repeat(12),
      url: "https://lists.example.test/filters.txt",
      kind: "adblock" as const,
      sha256: "b".repeat(64),
      bytes: 100,
      text: "||ads.example.test^",
    };
    const snapshot = {
      profileId: "original",
      generation: 3,
      filterDigest: "c".repeat(64),
      sources: [source],
      allowedSiteHosts: [],
      enabled: true,
    };
    const receipt = {
      backend: "ublock_origin" as const,
      engineVersion: "9df989ecc483cd7ada4b195c47a0584ab2d97450" as const,
      profileId: "original",
      private: false as const,
      generation: 3,
      filterDigest: snapshot.filterDigest,
      sourceHeaders: [
        {
          id: source.id,
          url: source.url,
          kind: source.kind,
          sha256: source.sha256,
          bytes: source.bytes,
        },
      ],
      cosmeticBackend: "native_user_styles" as const,
      phase: "document_start" as const,
      futureDocuments: true as const,
    };
    expect(() => assertContentBlockReceipt(snapshot, receipt)).not.toThrow();
    for (const changed of [
      { ...receipt, profileId: "different" },
      { ...receipt, generation: 2 },
      { ...receipt, filterDigest: "d".repeat(64) },
      { ...receipt, sourceHeaders: [] },
      {
        ...receipt,
        sourceHeaders: [{ ...receipt.sourceHeaders[0]!, id: "e".repeat(12) }],
      },
      {
        ...receipt,
        sourceHeaders: [
          {
            ...receipt.sourceHeaders[0]!,
            url: "https://different.example.test/filters.txt",
          },
        ],
      },
      {
        ...receipt,
        sourceHeaders: [
          { ...receipt.sourceHeaders[0]!, sha256: "f".repeat(64) },
        ],
      },
      {
        ...receipt,
        sourceHeaders: [
          { ...receipt.sourceHeaders[0]!, bytes: source.bytes + 1 },
        ],
      },
    ])
      expect(() => assertContentBlockReceipt(snapshot, changed)).toThrow(
        /attest/,
      );
  });

  it("accepts a valid empty configuration without an obsolete rule-count gate", () => {
    const snapshot = {
      profileId: "original",
      generation: 1,
      filterDigest: "a".repeat(64),
      sources: [],
      allowedSiteHosts: [],
      enabled: false,
    };
    const receipt = {
      backend: "ublock_origin" as const,
      engineVersion: "9df989ecc483cd7ada4b195c47a0584ab2d97450" as const,
      profileId: "original",
      private: false as const,
      generation: 1,
      filterDigest: snapshot.filterDigest,
      sourceHeaders: [],
      cosmeticBackend: "native_user_styles" as const,
      phase: "document_start" as const,
      futureDocuments: true as const,
    };
    expect(() => assertContentBlockReceipt(snapshot, receipt)).not.toThrow();
  });

  it("rejects oversized downloads before buffering their full body", async () => {
    const declared = new Response("small", {
      headers: { "content-length": String(MAX_FILTER_BYTES + 1) },
    });
    await expect(readBoundedFilterText(declared)).rejects.toThrow(/too large/);
    let cancelled = false;
    const chunk = new Uint8Array(1024 * 1024);
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        for (let i = 0; i < 17; i++) controller.enqueue(chunk);
      },
      cancel() {
        cancelled = true;
      },
    });
    await expect(readBoundedFilterText(new Response(body))).rejects.toThrow(
      /too large/,
    );
    expect(cancelled).toBe(true);
  });
});
