import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContentBlockingService } from "../../apps/runtime/src/services/content-blocking.js";
import { FilterLists } from "@aux/filter-lists";
import {
  filterSnapshotDigestInput,
  MAX_FILTER_CHUNK_BYTES,
  type ChromiumContentBlockReceipt,
} from "@aux/contracts";
import { BUNDLED_FILTER_SOURCES } from "@aux/contracts/filter-defaults.generated";
import type {
  ContentBlockAppend,
  ContentBlockBegin,
  ContentBlockCommit,
  NativeBridge,
} from "../../apps/runtime/src/native.js";

const directories: string[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

// A transport/ownership witness, deliberately not a second implementation of the Rust parser.
function fixture(
  body = "||ads.fixture.test^\nnews.fixture.test##.advert\nnews.fixture.test##+js(set-constant, advertising, false)",
) {
  const directory = mkdtempSync(join(tmpdir(), "aux-blocking-"));
  directories.push(directory);
  let begun: ContentBlockBegin | undefined;
  let enabled = true,
    allowedSiteHosts: string[] = [];
  let receipt: ChromiumContentBlockReceipt = {
    backend: "ublock_origin",
    engineVersion: "9df989ecc483cd7ada4b195c47a0584ab2d97450",
    profileId: "Profile 1",
    private: false,
    generation: 1,
    filterDigest: createHash("sha256")
      .update(filterSnapshotDigestInput(BUNDLED_FILTER_SOURCES, enabled, allowedSiteHosts))
      .digest("hex"),
    sourceHeaders: BUNDLED_FILTER_SOURCES.map(({ id, url, kind, sha256, bytes }) => ({
      id,
      url,
      kind,
      sha256,
      bytes,
    })),
    compilationWarnings: [],
    cosmeticBackend: "native_user_styles",
    phase: "document_start",
    futureDocuments: true,
  };
  const setNativePolicy = (nextEnabled: boolean, hosts: string[]) => {
    enabled = nextEnabled;
    allowedSiteHosts = hosts;
    receipt = {
      ...receipt,
      generation: receipt.generation + 1,
      filterDigest: createHash("sha256")
        .update(filterSnapshotDigestInput(receipt.sourceHeaders, enabled, allowedSiteHosts))
        .digest("hex"),
    };
  };
  const payload = new Map<string, string>();
  const headers: ContentBlockBegin[] = [];
  const appended: ContentBlockAppend[] = [];
  const native = {
    async contentBlockState() {
      return { receipt, enabled, allowedSiteHosts: [...allowedSiteHosts] };
    },
    async contentBlockBegin(input: ContentBlockBegin) {
      expect(input.profileId).toBe("Profile 1");
      expect(input.baseGeneration).toBe(receipt.generation);
      expect(input.generation).toBeGreaterThan(receipt.generation);
      expect(input.enabled).toBe(enabled);
      expect(input.allowedSiteHosts).toEqual(allowedSiteHosts);
      begun = input;
      headers.push(input);
      payload.clear();
      return { accepted: true as const };
    },
    async contentBlockAppend(input: ContentBlockAppend) {
      expect(input.profileId).toBe(begun?.profileId);
      expect(input.generation).toBe(begun?.generation);
      expect(begun?.sources.find((source) => source.id === input.sourceId)?.bundled).toBe(false);
      const previous = payload.get(input.sourceId) ?? "";
      expect(input.offset).toBe(Buffer.byteLength(previous));
      expect(Buffer.byteLength(input.text)).toBeLessThanOrEqual(MAX_FILTER_CHUNK_BYTES);
      payload.set(input.sourceId, previous + input.text);
      appended.push(input);
      return { accepted: true as const };
    },
    async contentBlockCommit(input: ContentBlockCommit) {
      const header = begun!;
      if (receipt.generation !== header.baseGeneration) throw new Error("Original native policy changed");
      expect(input.generation).toBe(header.generation);
      expect(input.filterDigest).toBe(
        createHash("sha256")
          .update(filterSnapshotDigestInput(header.sources, header.enabled, header.allowedSiteHosts))
          .digest("hex"),
      );
      for (const source of header.sources) {
        if (source.bundled) {
          expect(
            BUNDLED_FILTER_SOURCES.some(
              (bundled) =>
                bundled.id === source.id &&
                bundled.sha256 === source.sha256 &&
                bundled.bytes === source.bytes,
            ),
          ).toBe(true);
        } else {
          const text = payload.get(source.id)!;
          expect(Buffer.byteLength(text)).toBe(source.bytes);
          expect(createHash("sha256").update(text).digest("hex")).toBe(source.sha256);
        }
      }
      receipt = {
        backend: "ublock_origin",
        engineVersion: "9df989ecc483cd7ada4b195c47a0584ab2d97450",
        profileId: header.profileId,
        private: false,
        generation: input.generation,
        filterDigest: input.filterDigest,
        sourceHeaders: header.sources.map(({ id, url, kind, sha256, bytes }) => ({
          id,
          url,
          kind,
          sha256,
          bytes,
        })),
        compilationWarnings: [],
        cosmeticBackend: "native_user_styles",
        phase: "document_start",
        futureDocuments: true,
      };
      return receipt;
    },
  } satisfies Pick<
    NativeBridge,
    "contentBlockState" | "contentBlockBegin" | "contentBlockAppend" | "contentBlockCommit"
  >;
  const fetchText = vi.fn(async () => ({ status: 200, text: async () => body }));
  const service = new ContentBlockingService(directory, native, "Profile 1", fetchText);
  return { directory, native, service, headers, appended, payload, fetchText, setNativePolicy };
}

describe("Chromium content blocking snapshot boundary", () => {
  it("attests native sources on boot and preserves native controls when updating source bytes", async () => {
    const { service, directory, headers, appended, fetchText, setNativePolicy } = fixture();
    expect(service.status().backend).toBe("unavailable");
    await service.boot();
    expect(fetchText).not.toHaveBeenCalled();
    expect(appended).toHaveLength(0);
    expect(headers).toHaveLength(0);
    expect(service.status().backend).toBe("ublock_origin");
    expect(service.status()).not.toHaveProperty("networkRules");
    setNativePolicy(false, ["news.fixture.test"]);
    await service.update();
    expect(headers[0]).toMatchObject({
      baseGeneration: 2,
      enabled: false,
      allowedSiteHosts: ["news.fixture.test"],
    });
    const saved = JSON.parse(readFileSync(join(directory, "filters/active.json"), "utf8"));
    expect(saved).not.toHaveProperty("enabled");
    expect(saved).not.toHaveProperty("allowedSiteHosts");
    await service.close();
  });

  it("transports complete Standard rules with byte offsets and intact multibyte boundaries", async () => {
    const body = "||ads.fixture.test^\nnews.fixture.test##.advert\n! " + "🌙".repeat(70_000);
    const { service, payload, appended } = fixture(body);
    await service.boot();
    const sources = await service.add("Reviewed Standard list", "https://lists.fixture.test/standard");
    const added = sources.at(-1)!;
    expect(added.kind).toBe("adblock");
    expect(payload.get(added.id)).toBe(body);
    expect(appended.filter((chunk) => chunk.sourceId === added.id).length).toBeGreaterThan(1);
    expect(appended.every((chunk) => !chunk.text.includes("�"))).toBe(true);
    await service.close();
  });

  it("refuses a source commit after native controls change and never replays its retired candidate", async () => {
    const { service, native, directory, fetchText, headers, setNativePolicy } = fixture();
    await service.boot();
    const previous = readFileSync(join(directory, "filters/active.json"), "utf8");
    const commit = native.contentBlockCommit;
    vi.spyOn(native, "contentBlockCommit").mockImplementationOnce(async (input) => {
      setNativePolicy(false, ["news.fixture.test"]);
      return commit(input);
    });
    await expect(service.add("Unaccepted", "https://lists.fixture.test/unaccepted")).rejects.toThrow(
      "Original native policy changed",
    );
    expect(readFileSync(join(directory, "filters/active.json"), "utf8")).toBe(previous);
    await service.close();
    const restarted = new ContentBlockingService(directory, native, "Profile 1", fetchText);
    await restarted.boot();
    expect(restarted.status().sources).toHaveLength(BUNDLED_FILTER_SOURCES.length);
    expect(headers).toHaveLength(1);
    expect(JSON.parse(readFileSync(join(directory, "filters/active.json"), "utf8")).receipt.generation).toBe(
      2,
    );
    await restarted.close();
  });

  it("keeps a damaged source cache unavailable until explicit repair preserves native policy", async () => {
    const { service, native, directory, fetchText, setNativePolicy, headers } = fixture();
    await service.boot();
    const added = (await service.add("Custom", "https://lists.fixture.test/custom")).at(-1)!;
    await service.close();
    const state = JSON.parse(readFileSync(join(directory, "filters/active.json"), "utf8"));
    const meta = state.sources.find((source: { id: string }) => source.id === added.id).meta;
    writeFileSync(join(directory, "filters", `${meta.sha256}.txt`), "tampered");
    const restarted = new ContentBlockingService(directory, native, "Profile 1", fetchText);
    expect(restarted.status().backend).toBe("unavailable");
    await restarted.boot();
    expect(restarted.status().backend).toBe("unavailable");
    expect(restarted.status().sources.find((source) => source.id === added.id)?.meta?.error).toContain(
      "damaged",
    );
    fetchText.mockClear();
    await restarted.maintain();
    expect(fetchText).not.toHaveBeenCalled();
    setNativePolicy(false, ["news.fixture.test"]);
    await restarted.update();
    expect(restarted.status().backend).toBe("ublock_origin");
    expect(restarted.status().sources.find((source) => source.id === added.id)?.meta?.error).toBeUndefined();
    expect(headers.at(-1)).toMatchObject({ enabled: false, allowedSiteHosts: ["news.fixture.test"] });
    await restarted.close();
  });

  it("recovers accepted source bytes after a lost publication and later native policy change", async () => {
    const { service, native, directory, fetchText, headers, setNativePolicy } = fixture();
    await service.boot();
    vi.spyOn(FilterLists.prototype, "publish").mockRejectedValueOnce(
      new Error("Interrupted manifest publication"),
    );
    await expect(service.add("Accepted", "https://lists.fixture.test/accepted")).rejects.toThrow(
      "Interrupted manifest publication",
    );
    expect(service.status().sources.at(-1)?.name).toBe("Accepted");
    expect(service.status().backend).toBe("unavailable");
    await service.close();
    setNativePolicy(false, ["news.fixture.test"]);
    const restarted = new ContentBlockingService(directory, native, "Profile 1", fetchText);
    await restarted.boot();
    expect(restarted.status().sources.at(-1)?.name).toBe("Accepted");
    expect(headers).toHaveLength(1);
    const saved = JSON.parse(readFileSync(join(directory, "filters/active.json"), "utf8"));
    expect(saved.receipt.generation).toBeGreaterThan(headers[0]!.generation);
    expect(saved).not.toHaveProperty("enabled");
    expect(saved).not.toHaveProperty("allowedSiteHosts");
    await restarted.close();
  });

  it("rejects included sources on a different origin without changing the active policy", async () => {
    const { service } = fixture("!#include https://other.fixture.test/fragment\n||ads.fixture.test^");
    await service.boot();
    const previous = service.status().sources;
    await expect(service.add("Unreviewed include", "https://lists.fixture.test/root")).rejects.toThrow(
      "original public HTTPS origin",
    );
    expect(service.status().sources).toEqual(previous);
    await service.close();
  });

  it("cancels a pending subscription fetch and drains it before shutdown", async () => {
    const { directory, native } = fixture();
    let entered!: () => void;
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const service = new ContentBlockingService(
      directory,
      native,
      "Profile 1",
      async (_url, _etag, signal) => {
        entered();
        await new Promise<void>((_resolve, reject) =>
          signal!.addEventListener("abort", () => reject(signal!.reason), { once: true }),
        );
        throw new Error("Unreachable");
      },
    );
    await service.boot();
    const update = service.update();
    const refusal = expect(update).rejects.toThrow("closed");
    await started;
    await service.close();
    await refusal;
    expect(service.status().backend).toBe("ublock_origin");
  });
});
