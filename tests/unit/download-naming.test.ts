import { DEFAULT_DOWNLOAD_NAMING } from "@aux/contracts";
import { createHash } from "node:crypto";
import { SqliteColumnCipher } from "../../apps/runtime/src/store/sqlite-protection.js";
import { settingsMethods } from "../../apps/runtime/src/api/methods/settings.js";
import { downloadNamingMethods } from "../../apps/runtime/src/api/methods/download-naming.js";
import type { MethodCtx } from "../../apps/runtime/src/api/methods/context.js";
import { describe, expect, it, vi } from "vitest";
import { openDb, Repo, EventBus } from "@aux/runtime";
import type { SettingsService } from "../../apps/runtime/src/services/settings.js";
import {
  DownloadNamingService,
  unclearDownloadName,
  sanitizeDownloadStem,
  previewText,
  downloadNamingPrompt,
  excludedDownload,
  type DownloadNamingNative,
} from "../../apps/runtime/src/services/download-naming.js";
const info = {
  id: "guid",
  filename: "download.pdf",
  mime: "application/pdf",
  sourceHost: "example.test",
  tabTitle: "Invoice 4471",
  endedAt: 1000,
};
function fixture(cipher?: SqliteColumnCipher) {
  const db = openDb(":memory:"),
    repo = new Repo(db, cipher),
    events = new EventBus(repo);
  const native: DownloadNamingNative = {
    downloadRenameReceipts: vi.fn(async () => []),
    downloadNamingCandidate: vi.fn(async () => info),
    downloadPreviewText: vi.fn(async () => ({ text: "Invoice" })),
    renameDownload: vi.fn(async () => ({
      renamed: true,
      filename: "Invoice 4471.pdf",
      receiptId: "receipt",
    })),
    undoDownloadRename: vi.fn(async () => ({ status: "restored" as const, filename: info.filename })),
  };
  const generateStructured = vi.fn(async (_input: { prompt: string }) => ({
    object: { stem: "Invoice 4471" },
  }));
  const settings = {
    get: (key: string) => repo.getSetting(key),
    model: () => ({ generateStructured }),
    agentRoute: () => ({ modelId: "fast" }),
  } as unknown as SettingsService;
  let now = 2000;
  const service = new DownloadNamingService(repo, settings, native, events, () => now);
  return {
    db,
    repo,
    native,
    generateStructured,
    service,
    settings,
    events,
    setNow: (value: number) => {
      now = value;
    },
  };
}
describe("smart download naming", () => {
  it("refuses agent and external preference writes before changing settings", async () => {
    for (const [external, codeMode] of [[true, false], [false, true]]) {
      const set = vi.fn();
      await expect(settingsMethods["settings.set"]!({
        client: { external }, codeMode,
        params: { downloadNaming: DEFAULT_DOWNLOAD_NAMING },
        s: { settings: { set } },
      } as unknown as MethodCtx)).rejects.toMatchObject({ code: "permission_denied" });
      expect(set).not.toHaveBeenCalled();
    }
  });
  it("classifies only unclear stems, preserving meaningful names", () => {
    for (const value of [
      "download.pdf",
      "document (3).txt",
      "IMG_4471.jpg",
      "001.pdf",
      "ab0123456789cdef.csv",
      "123e4567-e89b-12d3-a456-426614174000.txt",
    ])
      expect(unclearDownloadName(value)).toBe(true);
    for (const value of ["Invoice 4471.pdf", "report.pdf", "image analysis.txt"])
      expect(unclearDownloadName(value)).toBe(false);
  });
  it("sanitizes unsafe names and bounds preview by UTF-8 bytes", () => {
    expect(sanitizeDownloadStem(" . /a:\\b\u0000\n c ")).toBe("ab c");
    expect(sanitizeDownloadStem(" .. .secret")).toBe("secret");
    expect(sanitizeDownloadStem("a".repeat(99) + "🙂")).toBe("a".repeat(99));
    expect(Buffer.byteLength(previewText("🙂".repeat(1000)))).toBe(2048);
    expect(previewText("a".repeat(2047) + "🙂")).toBe("a".repeat(2047));
  });
  it("bounds the entire model prompt and removes URL paths and queries from page titles", () => {
    const prompt = downloadNamingPrompt(
      {
        ...info,
        filename: "🙂".repeat(200),
        tabTitle: "Invoice https://example.test/private?token=hidden " + '"'.repeat(500),
      },
      "https://example.test/preview-secret?private=hidden " + "🙂".repeat(2000),
    );
    expect(Buffer.byteLength(prompt)).toBeLessThanOrEqual(2048);
    expect(prompt).not.toContain("/private");
    expect(prompt).not.toContain("token=");
    expect(prompt).not.toContain("preview-secret");
    expect(prompt).not.toContain("private=hidden");
  });
  it("sanitizes the actual model suggestion before submitting a native stem", async () => {
    const f = fixture();
    f.generateStructured.mockResolvedValue({ object: { stem: " ../Invoice: 4471\u0000" } });
    try {
      await f.service.completed(info);
      expect(f.native.renameDownload).toHaveBeenCalledWith({
        downloadId: info.id,
        expectedName: info.filename,
        stem: "Invoice 4471",
        mode: "unclear",
      });
    } finally {
      f.db.close();
    }
  });
  it("applies host, extension and MIME exclusions", () => {
    for (const settings of [
      { excludedHosts: ["*.test"] },
      { excludedExtensions: [".PDF"] },
      { excludedMimeTypes: ["application/*"] },
    ])
      expect(excludedDownload(info, { ...DEFAULT_DOWNLOAD_NAMING, ...settings })).toBe(true);
  });
  it("sends only bounded approved metadata and commits one durable receipt", async () => {
    const f = fixture();
    try {
      const [one, two] = await Promise.all([f.service.completed(info), f.service.completed(info)]);
      expect(one).toEqual(two);
      expect(f.native.renameDownload).toHaveBeenCalledOnce();
      const prompt = JSON.parse(f.generateStructured.mock.calls[0]![0].prompt);
      expect(Object.keys(prompt).sort()).toEqual(
        ["filename", "firstPageText", "mime", "pageTitle", "sourceHost"].sort(),
      );
      expect(prompt.sourceHost).toBe("example.test");
      expect((await f.service.receipts())[0]).toMatchObject({
        originalName: "download.pdf",
        filename: "Invoice 4471.pdf",
        receiptId: "receipt",
      });
      const restarted = new DownloadNamingService(f.repo, f.settings, f.native, f.events, () => 3000);
      expect(await restarted.receipts()).toHaveLength(1);
      await restarted.completed(info);
      expect(f.native.renameDownload).toHaveBeenCalledOnce();
      expect(await restarted.undo("receipt")).toMatchObject({ status: "restored" });
      expect(await restarted.receipts()).toEqual([]);
    } finally {
      f.db.close();
    }
  });
  it("never renames drifted native metadata or excluded meaningful names", async () => {
    const f = fixture();
    try {
      await f.service.completed({ ...info, tabTitle: "Forged title" });
      expect(f.native.renameDownload).not.toHaveBeenCalled();
      expect(f.generateStructured).not.toHaveBeenCalled();
    } finally {
      f.db.close();
    }
  });
  it("falls back after provider refusal and passes the original extension authority to native", async () => {
    const f = fixture();
    try {
      f.generateStructured.mockRejectedValue(new Error("500"));
      await f.service.completed(info);
      expect(f.native.renameDownload).toHaveBeenCalledWith({
        downloadId: info.id,
        expectedName: "download.pdf",
        stem: "1970-01-01 example.test Invoice 4471",
        mode: "unclear",
      });
    } finally {
      f.db.close();
    }
  });
  it("does not dispatch a late preview to the model after the four-second deadline", async () => {
    vi.useFakeTimers();
    const f = fixture();
    try {
      let resolve!: (value: { text: string }) => void;
      f.native.downloadPreviewText = () =>
        new Promise((yes) => {
          resolve = yes;
        });
      const work = f.service.completed(info);
      await vi.advanceTimersByTimeAsync(4000);
      await work;
      resolve({ text: "late" });
      await Promise.resolve();
      await Promise.resolve();
      expect(f.generateStructured).not.toHaveBeenCalled();
      expect(f.native.renameDownload).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
      f.db.close();
    }
  });
  it("reconciles native success after interruption before runtime receipt commit", async () => {
    const f = fixture();
    try {
      f.native.downloadRenameReceipts = async () => [
        {
          receiptId: "native-receipt",
          downloadId: info.id,
          originalName: info.filename,
          filename: "Invoice 4471.pdf",
          renamedAt: 2000,
          expiresAt: 2000 + 86400000,
        },
      ];
      f.repo.db
        .prepare("INSERT INTO download_renames(download_id,status,created_at) VALUES(?,'pending',?)")
        .run(info.id, 1000);
      expect((await f.service.receipts())[0]?.receiptId).toBe("native-receipt");
      expect(await f.service.completed(info)).toMatchObject({ status: "skipped" });
      expect(f.native.renameDownload).not.toHaveBeenCalled();
    } finally {
      f.db.close();
    }
  });
  it("encrypts receipts with their actual download primary key and decrypts after reopening the service", async () => {
    const saved = new Map<string, string>();
    const suffix = createHash("sha256").update("download-fixture-profile").digest("hex").slice(0, 24);
    const cipher = await SqliteColumnCipher.create(
      {
        readSecret: async (name) => ({ value: saved.get(name) }),
        storeSecret: async (name, value) => {
          saved.set(name, value);
          return { ok: true };
        },
        profileStorageRoot: async () => {
          const value = Buffer.alloc(32, 2).toString("base64");
          saved.set(`aux_root_v1_${suffix}`, value);
          return { value };
        },
        profileStorageFactor: async () => {
          const value = Buffer.alloc(32, 1).toString("base64");
          saved.set(`sqlite_factor_v1_${suffix}`, value);
          return { value };
        },
      },
      "download-fixture-profile",
      false,
    );
    const f = fixture(cipher);
    try {
      await f.service.completed(info);
      const row = f.repo.db
        .prepare("SELECT receipt FROM download_renames WHERE download_id=?")
        .get(info.id) as { receipt: string };
      expect(row.receipt).toMatch(/^auxenc:/);
      expect(row.receipt).not.toContain("Invoice");
      const restarted = new DownloadNamingService(
        new Repo(f.db, cipher),
        f.settings,
        f.native,
        f.events,
        () => 3000,
      );
      expect((await restarted.receipts())[0]?.receiptId).toBe("receipt");
    } finally {
      f.db.close();
    }
  });
  it("refuses every naming API to external clients and non-native callers", async () => {
    for (const handler of Object.values(downloadNamingMethods)) {
      for (const [external, featureHost, codeMode] of [
        [true, "chromium-fork", false],
        [false, "electron", false],
        [false, "chromium-fork", true],
      ] as const) {
        await expect(
          handler({ client: { external }, codeMode, s: { featureHost }, params: {} } as unknown as MethodCtx),
        ).rejects.toMatchObject({ code: "permission_denied" });
      }
    }
  });
  it("skips every model and rename operation when naming is off", async () => {
    const f = fixture();
    try {
      f.repo.setSetting("downloadNaming", { ...DEFAULT_DOWNLOAD_NAMING, mode: "off" });
      expect(await f.service.completed(info)).toMatchObject({ status: "skipped" });
      expect(f.generateStructured).not.toHaveBeenCalled();
      expect(f.native.renameDownload).not.toHaveBeenCalled();
    } finally {
      f.db.close();
    }
  });
  it("refuses a pending model rename after current preferences change", async () => {
    for (const patch of [{ mode: "off" }, { useAi: false }, { excludedHosts: [info.sourceHost] }, { template: "{date}" }]) {
      const f = fixture();
      let started!: () => void;
      const modelStarted = new Promise<void>(resolve => { started = resolve; });
      let finish!: (value: { object: { stem: string } }) => void;
      f.generateStructured.mockImplementation(() => {
        started();
        return new Promise(resolve => { finish = resolve; });
      });
      try {
        const work = f.service.completed(info);
        await modelStarted;
        f.repo.setSetting("downloadNaming", { ...DEFAULT_DOWNLOAD_NAMING, ...patch });
        finish({ object: { stem: "Invoice 4471" } });
        expect(await work).toEqual({ status: "skipped", reason: "preferences-changed" });
        expect(f.native.renameDownload).not.toHaveBeenCalled();
        expect(await f.service.receipts()).toEqual([]);
      } finally { f.db.close(); }
    }
  });
  it("does not dispatch preview metadata after the person disables AI", async () => {
    const f = fixture();
    let started!: () => void;
    const previewStarted = new Promise<void>(resolve => { started = resolve; });
    let finish!: (value: { text: string }) => void;
    f.native.downloadPreviewText = () => {
      started();
      return new Promise(resolve => { finish = resolve; });
    };
    try {
      const work = f.service.completed(info);
      await previewStarted;
      f.repo.setSetting("downloadNaming", { ...DEFAULT_DOWNLOAD_NAMING, useAi: false });
      finish({ text: "Invoice" });
      expect(await work).toEqual({ status: "skipped", reason: "preferences-changed" });
      expect(f.generateStructured).not.toHaveBeenCalled();
      expect(f.native.renameDownload).not.toHaveBeenCalled();
    } finally { f.db.close(); }
  });
  it("retains a conflict receipt and refuses Undo after 24 hours", async () => {
    const f = fixture();
    try {
      await f.service.completed(info);
      f.native.undoDownloadRename = async () => ({ status: "conflict" });
      expect(await f.service.undo("receipt")).toEqual({ status: "conflict" });
      expect(await f.service.receipts()).toHaveLength(1);
      f.setNow(2000 + 24 * 60 * 60 * 1000);
      expect(await f.service.undo("receipt")).toEqual({ status: "expired" });
    } finally {
      f.db.close();
    }
  });
});
