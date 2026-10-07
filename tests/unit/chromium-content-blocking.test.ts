import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContentBlockingService } from "../../apps/runtime/dist/services/content-blocking.js";
import { FilterLists } from "@aux/filter-lists";
import {
  filterSnapshotDigestInput,
  MAX_FILTER_CHUNK_BYTES,
  type ChromiumContentBlockReceipt,
  AuxError,
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
  for (const directory of directories.splice(0))
    rmSync(directory, { recursive: true, force: true });
});

// A transport/ownership witness, deliberately not a second implementation of the Rust parser.
function fixture(
  body = "||ads.fixture.test^\nnews.fixture.test##.advert\nnews.fixture.test##+js(set-constant, advertising, false)",
) {
  const directory = mkdtempSync(join(tmpdir(), "aux-blocking-"));
  directories.push(directory);
  let begun: ContentBlockBegin | undefined;
  let receipt: ChromiumContentBlockReceipt | null = null;
  const payload = new Map<string, string>();
  const headers: ContentBlockBegin[] = [];
  const appended: ContentBlockAppend[] = [];
  const native = {
    async capabilities() {
      return {
        buildId: "fixture",
        sourceCommit: "a".repeat(40),
        methods: ["native.contentBlockOperation"],
      };
    },
    async contentBlockOperation(): Promise<never> {
      throw new AuxError(
        "ref_stale",
        "No original native fixture operation was registered.",
      );
    },
    async contentBlockState() {
      return { receipt };
    },
    async contentBlockBegin(input: ContentBlockBegin) {
      expect(input.profileId).toBe("Profile 1");
      expect(input.generation).toBeGreaterThan(receipt?.generation ?? 0);
      begun = input;
      headers.push(input);
      payload.clear();
      return { accepted: true as const };
    },
    async contentBlockAppend(input: ContentBlockAppend) {
      expect(input.profileId).toBe(begun?.profileId);
      expect(input.generation).toBe(begun?.generation);
      expect(
        begun?.sources.find((source) => source.id === input.sourceId)?.bundled,
      ).toBe(false);
      const previous = payload.get(input.sourceId) ?? "";
      expect(input.offset).toBe(Buffer.byteLength(previous));
      expect(Buffer.byteLength(input.text)).toBeLessThanOrEqual(
        MAX_FILTER_CHUNK_BYTES,
      );
      payload.set(input.sourceId, previous + input.text);
      appended.push(input);
      return { accepted: true as const };
    },
    async contentBlockCommit(input: ContentBlockCommit) {
      const header = begun!;
      expect(input.generation).toBe(header.generation);
      expect(input.filterDigest).toBe(
        createHash("sha256")
          .update(
            filterSnapshotDigestInput(
              header.sources,
              header.enabled,
              header.allowedSiteHosts,
            ),
          )
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
          expect(createHash("sha256").update(text).digest("hex")).toBe(
            source.sha256,
          );
        }
      }
      receipt = {
        backend: "ublock_origin",
        engineVersion: "9df989ecc483cd7ada4b195c47a0584ab2d97450",
        profileId: header.profileId,
        private: false,
        generation: input.generation,
        filterDigest: input.filterDigest,
        sourceHeaders: header.sources.map(
          ({ id, url, kind, sha256, bytes }) => ({
            id,
            url,
            kind,
            sha256,
            bytes,
          }),
        ),
        compilationWarnings: [],
        cosmeticBackend: "native_user_styles",
        phase: "document_start",
        futureDocuments: true,
      };
      return receipt;
    },
  } satisfies Pick<
    NativeBridge,
    | "capabilities"
    | "contentBlockOperation"
    | "contentBlockState"
    | "contentBlockBegin"
    | "contentBlockAppend"
    | "contentBlockCommit"
  >;
  const fetchText = vi.fn(async () => ({
    status: 200,
    text: async () => body,
  }));
  const service = new ContentBlockingService(
    directory,
    native,
    "Profile 1",
    fetchText,
  );
  return { directory, native, service, headers, appended, payload, fetchText };
}

describe("Chromium content blocking snapshot boundary", () => {
  it("boots with exact native bundled assets, attests exact source headers only after ACK, and binds site policy", async () => {
    const { service, headers, appended, fetchText } = fixture();
    expect(service.status().backend).toBe("unavailable");
    await service.boot();
    expect(fetchText).not.toHaveBeenCalled();
    expect(appended).toHaveLength(0);
    expect(headers[0]!.sources).toHaveLength(BUNDLED_FILTER_SOURCES.length);
    expect(service.status().backend).toBe("ublock_origin");
    expect(service.status()).not.toHaveProperty("networkRules");
    expect(service.status().sources[0]?.meta).not.toHaveProperty(
      "networkRules",
    );
    const before = headers[0]!.filterDigest;
    const siteGuard = {
      pageId: "native-page",
      expectedUrl: "https://news.fixture.test/story",
      navigationId: 7,
    };
    await service.setSiteAllowed("news.fixture.test", true, siteGuard);
    expect(headers.at(-1)!.siteGuard).toEqual(siteGuard);
    expect(headers.at(-1)!.filterDigest).not.toBe(before);
    expect(service.privacy().allowedHosts).toEqual(["news.fixture.test"]);
    await service.close();
  });

  it("rejects an exception for a different site than the reviewed original document", async () => {
    const { service, headers } = fixture();
    await service.boot();
    await expect(
      service.setSiteAllowed("other.fixture.test", true, {
        pageId: "native-page",
        expectedUrl: "https://news.fixture.test/story",
        navigationId: 7,
      }),
    ).rejects.toThrow("does not match");
    await expect(
      service.setSiteAllowed("news.fixture.test", true),
    ).rejects.toThrow("Review the original");
    expect(service.privacy().allowedHosts).toEqual([]);
    expect(headers).toHaveLength(1);
    await service.close();
  });

  it("transports complete Standard rules with byte offsets and intact multibyte boundaries", async () => {
    const body =
      "||ads.fixture.test^\nnews.fixture.test##.advert\n! " +
      "🌙".repeat(70_000);
    const { service, payload, appended } = fixture(body);
    await service.boot();
    const sources = await service.add(
      "Reviewed Standard list",
      "https://lists.fixture.test/standard",
    );
    const added = sources.at(-1)!;
    expect(added.kind).toBe("adblock");
    expect(payload.get(added.id)).toBe(body);
    expect(
      appended.filter((chunk) => chunk.sourceId === added.id).length,
    ).toBeGreaterThan(1);
    expect(appended.every((chunk) => !chunk.text.includes("�"))).toBe(true);
    await service.close();
  });

  it("keeps the activated configuration when the exact document changes before native commit", async () => {
    const { service, native, directory } = fixture();
    await service.boot();
    const previous = readFileSync(
      join(directory, "filters/active.json"),
      "utf8",
    );
    vi.spyOn(native, "contentBlockCommit").mockRejectedValueOnce(
      new Error("Original document changed"),
    );
    await expect(
      service.setSiteAllowed("news.fixture.test", true, {
        pageId: "page",
        expectedUrl: "https://news.fixture.test/",
        navigationId: 1,
      }),
    ).rejects.toThrow("Original document changed");
    expect(service.privacy().allowedHosts).toEqual([]);
    expect(readFileSync(join(directory, "filters/active.json"), "utf8")).toBe(
      previous,
    );
    await service.close();
  });

  it("revalidates cached bytes on restart instead of accepting saved statistics as native authority", async () => {
    const { service, native, directory, fetchText } = fixture();
    await service.boot();
    const added = (
      await service.add("Custom", "https://lists.fixture.test/custom")
    ).at(-1)!;
    await service.close();
    const state = JSON.parse(
      readFileSync(join(directory, "filters/active.json"), "utf8"),
    );
    const meta = state.sources.find(
      (source: { id: string }) => source.id === added.id,
    ).meta;
    writeFileSync(join(directory, "filters", `${meta.sha256}.txt`), "tampered");
    const restarted = new ContentBlockingService(
      directory,
      native,
      "Profile 1",
      fetchText,
    );
    expect(restarted.status().backend).toBe("unavailable");
    await expect(restarted.boot()).rejects.toThrow("damaged");
    await restarted.close();
  });

  it("recovers a matching native ACK journal before installing a later generation", async () => {
    const { service, native, directory, fetchText, headers } = fixture();
    await service.boot();
    vi.spyOn(FilterLists.prototype, "publish").mockRejectedValueOnce(
      new Error("Interrupted manifest publication"),
    );
    await expect(service.setEnabled(false)).rejects.toThrow(
      "Interrupted manifest publication",
    );
    await service.close();
    const restarted = new ContentBlockingService(
      directory,
      native,
      "Profile 1",
      fetchText,
    );
    await restarted.boot();
    expect(restarted.privacy().trackerBlock).toBe(false);
    expect(headers.at(-1)!.enabled).toBe(false);
    expect(headers.at(-1)!.generation).toBeGreaterThan(
      headers.at(-2)!.generation,
    );
    await restarted.close();
  });

  it("rejects included sources on a different origin without changing the active policy", async () => {
    const { service } = fixture(
      "!#include https://other.fixture.test/fragment\n||ads.fixture.test^",
    );
    await service.boot();
    const previous = service.status().sources;
    await expect(
      service.add("Unreviewed include", "https://lists.fixture.test/root"),
    ).rejects.toThrow("original public HTTPS origin");
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
          signal!.addEventListener("abort", () => reject(signal!.reason), {
            once: true,
          }),
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

describe("original native blocking toggle acknowledgement", () => {
  it("acknowledges only the same retained work after the native commit joins", async () => {
    const { service, native, headers } = fixture();
    await service.boot();
    const operationId = "a".repeat(32);
    let phase: "prepared" | "running" | "completed" | "failed" = "prepared";
    let receipt: ChromiumContentBlockReceipt | undefined;
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    let entered!: () => void;
    const committing = new Promise<void>((resolve) => {
      entered = resolve;
    });
    Object.assign(native, {
      async contentBlockOperation(input: {
        operationId: string;
        retire?: true;
      }) {
        expect(input.operationId).toBe(operationId);
        return {
          current: true,
          enabled: false,
          phase,
          ...(receipt ? { receipt } : {}),
        };
      },
    });
    const commit = native.contentBlockCommit.bind(native);
    const commits = vi
      .spyOn(native, "contentBlockCommit")
      .mockImplementation(async (input) => {
        expect(input.operationId).toBe(operationId);
        phase = "running";
        entered();
        await held;
        receipt = await commit(input);
        phase = "completed";
        return receipt;
      });
    const before = headers.length;
    expect(service.toggleStart(operationId, false)).toEqual({ operationId });
    await committing;
    expect(await service.toggleStatus(operationId)).toEqual({
      phase: "running",
    });
    expect(service.privacy().trackerBlock).toBe(true);
    expect(service.toggleStart(operationId, false)).toEqual({ operationId });
    expect(() => service.toggleStart(operationId, true)).toThrow(
      /choice changed/,
    );
    release();
    await vi.waitFor(async () => {
      expect(await service.toggleStatus(operationId)).toEqual({
        phase: "completed",
        result: { trackerBlock: false, allowedHosts: [] },
      });
    });
    expect(headers).toHaveLength(before + 1);
    expect(commits).toHaveBeenCalledTimes(1);
    expect(service.toggleRelease(operationId)).toEqual({ accepted: true });
    expect(service.toggleRelease(operationId)).toEqual({ accepted: true });
    await service.close();
  });

  it("retires an unobserved original Start before releasing its native reservation", async () => {
    const { service, native, headers } = fixture();
    await service.boot();
    const operationId = "c".repeat(32);
    Object.assign(native, {
      async contentBlockOperation(input: {
        operationId: string;
        retire?: true;
      }) {
        expect(input).toEqual({
          profileId: "Profile 1",
          operationId,
          retire: true,
        });
        return {
          current: false,
          enabled: false,
          phase: "failed" as const,
          error: {
            code: "cancelled",
            message: "Original native reservation retired before dispatch.",
          },
        };
      },
    });
    const before = headers.length;
    const queuedStart = () => service.toggleStart(operationId, false);
    expect((await service.toggleStatus(operationId, true)).phase).toBe(
      "failed",
    );
    expect(service.toggleRelease(operationId)).toEqual({ accepted: true });
    expect(queuedStart).toThrow(/already joined/);
    expect(headers).toHaveLength(before);
    await service.close();
  });

  it("reconciles an accepted native receipt after lost commit ACK without repeating the mutation", async () => {
    const { service, native, headers } = fixture();
    await service.boot();
    const operationId = "b".repeat(32);
    let phase: "prepared" | "completed" = "prepared";
    let receipt: ChromiumContentBlockReceipt | undefined;
    Object.assign(native, {
      async contentBlockOperation(input: { operationId: string }) {
        expect(input.operationId).toBe(operationId);
        return {
          current: true,
          enabled: false,
          phase,
          ...(receipt ? { receipt } : {}),
        };
      },
    });
    const commit = native.contentBlockCommit.bind(native);
    const commits = vi
      .spyOn(native, "contentBlockCommit")
      .mockImplementation(async (input) => {
        expect(input.operationId).toBe(operationId);
        receipt = await commit(input);
        phase = "completed";
        throw new AuxError(
          "operation_uncertain",
          "Original commit ACK was lost.",
        );
      });
    const publication = vi
      .spyOn(FilterLists.prototype, "publish")
      .mockRejectedValueOnce(
        new Error("Transient original journal publication failure"),
      );
    const before = headers.length;
    service.toggleStart(operationId, false);
    await vi.waitFor(async () => {
      expect(await service.toggleStatus(operationId)).toEqual({
        phase: "completed",
        result: { trackerBlock: false, allowedHosts: [] },
      });
    });
    expect(headers).toHaveLength(before + 1);
    expect(commits).toHaveBeenCalledTimes(1);
    expect(publication).toHaveBeenCalledTimes(2);
    expect(service.privacy().trackerBlock).toBe(false);
    expect(service.status().backend).toBe("ublock_origin");
    expect(service.toggleRelease(operationId)).toEqual({ accepted: true });
    await service.close();
  });
});
