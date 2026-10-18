import { afterEach, expect, it, vi } from "vitest";
import { randomBytes, randomUUID } from "node:crypto";
import { openDb, Repo } from "@aux/runtime";
import { digest } from "@aux/contracts/util/digest";
import {
  desktopContextDefaults,
  type DesktopContextCapture,
  type DesktopContextNativeStatus,
  type DesktopContextSettings,
} from "@aux/contracts/desktop-context";
import { DesktopContextStore } from "../../apps/runtime/dist/services/desktop-context-store.js";
import { DesktopContextService } from "../../apps/runtime/dist/services/desktop-context.js";
const closes: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of closes.splice(0)) await close();
  vi.restoreAllMocks();
});
function fixture() {
  const db = openDb(":memory:");
  const secrets = new Map<string, string>();
  const nativeSecrets = {
    async storeSecret(name: string, value: string) {
      if (value) secrets.set(name, value);
      else secrets.delete(name);
      return { ok: true as const };
    },
    async readSecret(name: string) {
      return { value: secrets.get(name) };
    },
    async profileStorageRoot() {
      const name = `aux_root_v1_${digest("desktop-fixture").slice(0, 24)}`;
      if (!secrets.has(name)) secrets.set(name, randomBytes(32).toString("base64"));
      return { value: secrets.get(name)! };
    },
  };
  const store = new DesktopContextStore(new Repo(db), nativeSecrets, "desktop-fixture");
  let settings: DesktopContextSettings = desktopContextDefaults();
  let status: DesktopContextNativeStatus = {
    supported: true,
    phase: "off",
    accessibilityTrusted: true,
    ocrSupported: true,
    pickerGrantActive: false,
    leaseId: null,
    configurationRevision: 0,
    consentRevision: 0,
    dropped: 0,
    reason: "none",
  };
  let pending: DesktopContextCapture | null = null;
  let now = 100000;
  const native = {
    status: vi.fn(async () => ({ ...status })),
    apps: vi.fn(async () => [{ bundleId: "test.editor", displayName: "Test Editor" }]),
    configure: vi.fn(async (value: DesktopContextSettings) => {
      status = {
        ...status,
        configurationRevision: value.revision,
        phase: !value.enabled ? "off" : value.paused ? "paused" : "running",
        leaseId: value.enabled && !value.paused ? "lease" : null,
      };
      return { ...status };
    }),
    attach: vi.fn(async () => ({ ...status })),
    permission: vi.fn(async () => ({ ...status })),
    take: vi.fn(async () => pending),
    validate: vi.fn(async () => true),
    acknowledge: vi.fn(async () => {
      pending = null;
    }),
    stop: vi.fn(async () => {
      status = { ...status, phase: "off", leaseId: null };
    }),
  };
  const beforeRemoval = vi.fn(async () => {});
  const service = new DesktopContextService({
    store,
    native,
    settings: () => settings,
    saveSettings: (value) => {
      settings = value;
    },
    workspaceEligible: (id) => id === "space",
    sourceEligible: (capture) => !capture.documentUrl?.includes("sensitive"),
    beforeRemoval,
    changed: vi.fn(),
    now: () => now,
  });
  closes.push(async () => {
    await service.shutdown();
    db.close();
  });
  const enable = () =>
    service.configure(
      settings.revision,
      {
        ...settings,
        enabled: true,
        workspaceId: "space",
        selectedApps: [{ bundleId: "test.editor", displayName: "Test Editor" }],
      },
      "owner",
      async () => {},
    );
  const capture = (text = "# Workshop\nMeet on Tuesday", appBundleId = "test.editor") => ({
    captureId: randomUUID(),
    workspaceId: "space",
    leaseId: "lease",
    configurationRevision: settings.revision,
    sourceEpoch: "epoch",
    app: { bundleId: appBundleId, displayName: "Test Editor" },
    processId: 123,
    windowId: "window",
    capturedAt: now,
    expiresAt: now + 14 * 86400000,
    kind: "accessibility" as const,
    text,
    selection: "",
    windowTitle: "Synthetic",
    sha256: digest(text + "\0"),
  });
  return {
    db,
    store,
    service,
    secrets,
    native,
    beforeRemoval,
    enable,
    capture,
    settings: () => settings,
    setPending: (value: DesktopContextCapture) => {
      pending = value;
    },
    status: (value: Partial<DesktopContextNativeStatus>) => {
      status = { ...status, ...value };
    },
    clock: (value: number) => {
      now = value;
    },
  };
}
it("starts off independently and never prompts or collects when ordinary Memory exists", async () => {
  const f = fixture();
  await f.service.start();
  expect((await f.service.snapshot()).settings.enabled).toBe(false);
  expect(f.native.attach).not.toHaveBeenCalled();
  expect(f.native.permission).not.toHaveBeenCalled();
  await expect(f.service.poll()).rejects.toMatchObject({ code: "permission_denied" });
});
it("encrypts provenance and immutable text, appends without rotating prior ciphertext", async () => {
  const f = fixture();
  await f.enable();
  const first = f.capture();
  f.setPending(first);
  await f.service.poll();
  const row = f.db.prepare("SELECT * FROM desktop_context_captures").get() as {
    content: string;
    app_key: string;
  };
  expect(JSON.stringify(row)).not.toContain("Tuesday");
  expect(JSON.stringify(row)).not.toContain("test.editor");
  f.clock(120000);
  f.setPending(f.capture("Second synthetic note"));
  await f.service.poll();
  expect(
    (
      f.db
        .prepare("SELECT content FROM desktop_context_captures WHERE capture_id=?")
        .get(first.captureId) as { content: string }
    ).content,
  ).toBe(row.content);
  expect(await f.store.read("space")).toHaveLength(2);
  expect(f.native.acknowledge).toHaveBeenCalledTimes(2);
});
it("coalesces repeated and too-frequent snapshots while acknowledging the original capture", async () => {
  const f = fixture();
  await f.enable();
  f.setPending(f.capture());
  await f.service.poll();
  f.clock(100100);
  f.setPending(f.capture("A transient edit"));
  await f.service.poll();
  f.clock(130000);
  f.setPending(f.capture());
  await f.service.poll();
  expect(f.store.stats("space").storedCount).toBe(1);
  expect(f.native.acknowledge).toHaveBeenCalledTimes(3);
});
it("rejects changed foreground ownership and forged source hashes before persistence", async () => {
  const f = fixture();
  await f.enable();
  const capture = f.capture();
  f.setPending(capture);
  f.native.validate.mockResolvedValueOnce(false);
  await expect(f.service.poll()).rejects.toMatchObject({ code: "conflict" });
  f.setPending({ ...capture, text: "Forged" });
  await expect(f.service.poll()).rejects.toMatchObject({ code: "conflict" });
  expect(f.store.stats("space").storedCount).toBe(0);
  expect(f.native.acknowledge).not.toHaveBeenCalled();
});
it("retains historical source readability after foreground changes but blocks lock and permission loss", async () => {
  const f = fixture();
  await f.enable();
  const capture = f.capture();
  f.setPending(capture);
  await f.service.poll();
  f.native.validate.mockResolvedValue(false);
  expect(
    (
      await f.service.read({
        workspaceId: "space",
        captureId: capture.captureId,
        sha256: capture.sha256,
        startLine: 1,
        limitLines: 2,
      })
    ).text,
  ).toContain("Tuesday");
  f.status({ phase: "locked" });
  await expect(f.service.sources("space")).rejects.toMatchObject({ code: "permission_denied" });
  f.status({ phase: "running", accessibilityTrusted: false });
  await expect(f.service.sources("space")).rejects.toMatchObject({ code: "permission_denied" });
});
it("binds multiquery/date/app pagination to actual source hashes and settings revisions", async () => {
  const f = fixture();
  await f.enable();
  for (const [index, text] of ["Tuesday workshop", "Tuesday planning", "Unrelated"].entries()) {
    f.clock(100000 + index * 20000);
    f.setPending(f.capture(text));
    await f.service.poll();
  }
  const input = { workspaceId: "space", queries: ["Tuesday"], limit: 1, mode: "lexical" as const };
  const first = await f.service.search(input);
  expect(first.items).toHaveLength(1);
  expect(first.mode).toBe("lexical");
  const next = await f.service.search({ ...input, cursor: first.nextCursor! });
  expect(next.items[0]!.source.captureId).not.toBe(first.items[0]!.source.captureId);
  await expect(
    f.service.search({ ...input, queries: ["Different"], cursor: first.nextCursor! }),
  ).rejects.toMatchObject({ code: "conflict" });
});
it("rotates only the affected app generation and cannot decrypt a forgotten snapshot", async () => {
  const f = fixture();
  await f.enable();
  const first = f.capture(),
    second = f.capture("Preserved");
  await f.store.append(first, () => {});
  await f.store.append(second, () => {});
  const old = f.db.prepare("SELECT key_name FROM desktop_context_generations").get() as { key_name: string };
  expect(f.secrets.has(old.key_name)).toBe(true);
  const response = await f.service.forget(
    "space",
    f.settings().revision,
    undefined,
    first.captureId,
    async () => {},
    "owner",
  );
  expect(response.removed).toBe(1);
  expect(response.settings.paused).toBe(true);
  expect(f.beforeRemoval).toHaveBeenCalledTimes(1);
  expect(f.secrets.has(old.key_name)).toBe(false);
  expect((await f.store.read("space")).map((capture) => capture.captureId)).toEqual([second.captureId]);
});
it("allows whole-Space Forget even when an original generation key is unavailable", async () => {
  const f = fixture();
  await f.enable();
  await f.store.append(f.capture(), () => {});
  const row = f.db.prepare("SELECT key_name FROM desktop_context_generations").get() as { key_name: string };
  f.secrets.delete(row.key_name);
  expect(
    (await f.service.forget("space", f.settings().revision, undefined, undefined, async () => {}, "owner"))
      .removed,
  ).toBe(1);
  expect(f.store.stats("space").storedCount).toBe(0);
});
it("rechecks capture ownership after asynchronous encryption-key reads", async () => {
  const f = fixture();
  await f.enable();
  f.setPending(f.capture());
  f.native.validate.mockResolvedValueOnce(true).mockResolvedValueOnce(true).mockResolvedValueOnce(false);
  await expect(f.service.poll()).rejects.toMatchObject({ code: "conflict" });
  expect(f.store.stats("space").storedCount).toBe(0);
});
it("expires sources at the publication boundary and retires their generation on pruning", async () => {
  const f = fixture();
  await f.enable();
  const capture = f.capture();
  f.setPending(capture);
  await f.service.poll();
  f.clock(capture.expiresAt);
  expect((await f.service.sources("space")).items).toEqual([]);
  expect((await f.service.expire()).removed).toBe(1);
  expect(f.store.stats("space").storedCount).toBe(0);
});
it("rejects credential-store selection independently of normal Memory settings", async () => {
  const f = fixture();
  await expect(
    f.service.configure(
      0,
      {
        ...f.settings(),
        enabled: true,
        workspaceId: "space",
        selectedApps: [{ bundleId: "com.apple.Passwords", displayName: "Passwords" }],
      },
      "owner",
      async () => {},
    ),
  ).rejects.toMatchObject({ code: "permission_denied" });
  expect(f.native.configure).not.toHaveBeenCalled();
});
it("removing an app retires its sources and encryption key before publishing the new consent", async () => {
  const f = fixture();
  await f.enable();
  await f.store.append(f.capture(), () => {});
  const key = (f.db.prepare("SELECT key_name FROM desktop_context_generations").get() as { key_name: string })
    .key_name;
  await f.service.configure(
    f.settings().revision,
    { ...f.settings(), enabled: false, selectedApps: [] },
    "owner",
    async () => {},
  );
  expect(f.secrets.has(key)).toBe(false);
  expect(f.store.stats("space").storedCount).toBe(0);
  expect(f.beforeRemoval).toHaveBeenCalledTimes(1);
});
it("joins an original pending read before Forget and never publishes its captured text", async () => {
  const f = fixture();
  await f.enable();
  const capture = f.capture();
  await f.store.append(capture, () => {});
  const read = f.store.read.bind(f.store);
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  vi.spyOn(f.store, "read").mockImplementationOnce(async (...args) => {
    await held;
    return read(...args);
  });
  const original = f.service.read({
    workspaceId: "space",
    captureId: capture.captureId,
    sha256: capture.sha256,
    startLine: 1,
    limitLines: 10,
  });
  await new Promise((resolve) => setImmediate(resolve));
  let finished = false;
  const forgotten = f.service
    .forget("space", f.settings().revision, undefined, undefined, async () => {}, "owner")
    .then(() => {
      finished = true;
    });
  await new Promise((resolve) => setImmediate(resolve));
  expect(finished).toBe(false);
  release();
  await expect(original).rejects.toMatchObject({ code: "conflict" });
  await forgotten;
  expect(f.store.stats("space").storedCount).toBe(0);
});
it("rechecks retention after the final asynchronous native permission proof", async () => {
  const f = fixture();
  await f.enable();
  const capture = f.capture();
  await f.store.append(capture, () => {});
  const originalStatus = f.native.status.getMockImplementation()!;
  f.native.status.mockImplementationOnce(originalStatus).mockImplementationOnce(async () => {
    f.clock(capture.expiresAt);
    return originalStatus();
  });
  await expect(
    f.service.read({
      workspaceId: "space",
      captureId: capture.captureId,
      sha256: capture.sha256,
      startLine: 1,
      limitLines: 10,
    }),
  ).rejects.toMatchObject({ code: "conflict" });
});
it("cancels an original caller-owned source read without publishing after cancellation", async () => {
  const f = fixture();
  await f.enable();
  const capture = f.capture();
  await f.store.append(capture, () => {});
  const controller = new AbortController();
  controller.abort();
  await expect(
    f.service.read(
      {
        workspaceId: "space",
        captureId: capture.captureId,
        sha256: capture.sha256,
        startLine: 1,
        limitLines: 10,
      },
      controller.signal,
    ),
  ).rejects.toMatchObject({ code: "conflict" });
});
it("requires explicit plaintext recovery inventory hashes before creating new destination keys", async () => {
  const f = fixture();
  await f.enable();
  const capture = f.capture();
  await expect(
    f.store.importRecoveryCaptures([{ ...capture, sha256: "0".repeat(64) }], 100000),
  ).rejects.toThrow("identity");
  expect(f.store.stats("space").storedCount).toBe(0);
});
it("uses the existing local semantic engine for desktop sources with a distinct source kind", async () => {
  const { LocalMemoryEmbeddings } =
    await import("../../apps/runtime/dist/services/local-memory-embeddings.js");
  vi.spyOn(LocalMemoryEmbeddings.prototype, "discover").mockResolvedValue([
    { modelId: "synthetic-local", digest: "installed-digest" },
  ]);
  vi.spyOn(LocalMemoryEmbeddings.prototype, "embedBatch").mockImplementation(async (_model, texts) =>
    texts.map(() => [1, 0]),
  );
  const f = fixture();
  await f.enable();
  await f.store.append(f.capture("Weekly workshop scheduling"), () => {});
  const result = await f.service.search({
    workspaceId: "space",
    queries: ["planning seminar"],
    mode: "auto",
    limit: 20,
  });
  expect(result.mode).toBe("semantic");
  expect(result.modelId).toBe("synthetic-local");
  expect(result.items[0]!.text).toContain("workshop");
});
it("permits owner inspection while collection is paused without enabling model source access", async () => {
  const f = fixture();
  await f.enable();
  const capture = f.capture();
  await f.store.append(capture, () => {});
  await f.service.pause(f.settings().revision, true, "owner", async () => {});
  const input = {
    workspaceId: "space",
    captureId: capture.captureId,
    sha256: capture.sha256,
    startLine: 1,
    limitLines: 10,
  };
  await expect(f.service.read(input)).rejects.toMatchObject({ code: "permission_denied" });
  expect((await f.service.read(input, undefined, undefined, true)).text).toContain("Tuesday");
});
it("refuses source publication if native status loses the original active lease", async () => {
  const f = fixture();
  await f.enable();
  const capture = f.capture();
  await f.store.append(capture, () => {});
  f.status({ phase: "running", leaseId: null });
  await expect(
    f.service.read({
      workspaceId: "space",
      captureId: capture.captureId,
      sha256: capture.sha256,
      startLine: 1,
      limitLines: 10,
    }),
  ).rejects.toMatchObject({ code: "permission_denied" });
});
it("refuses browser app selection where supported AX cannot establish private-window state", async () => {
  const f = fixture();
  await expect(
    f.service.configure(
      0,
      {
        ...f.settings(),
        enabled: true,
        workspaceId: "space",
        selectedApps: [{ bundleId: "com.google.Chrome", displayName: "Chrome" }],
      },
      "owner",
      async () => {},
    ),
  ).rejects.toMatchObject({ code: "permission_denied" });
  expect(f.native.configure).not.toHaveBeenCalled();
});
