import { createHash, randomUUID } from "node:crypto";
import { afterEach, expect, it, vi } from "vitest";
import { PNG } from "pngjs";
import { PERSON_OBSERVER_WRAPPED_SOURCE } from "@aux/chromium-driver";
import { EventBus, NullNativeBridge, Repo, openDb } from "@aux/runtime";
import {
  PageTargetSchema,
  type PageTarget,
  type NativePersonCaptureParams,
  type NativePersonCaptureReceipt,
} from "@aux/contracts";
import { PageRegistry } from "../../apps/runtime/dist/services/pages/registry.js";
import { PageDiagnostics } from "../../apps/runtime/dist/services/pages/diagnostics.js";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
const repos: Repo[] = [];
afterEach(() => repos.splice(0).forEach((repo) => repo.close()));
function fixture() {
  const repo = new Repo(openDb(":memory:"));
  repos.push(repo);
  const pageId = randomUUID(),
    documentId = randomUUID(),
    sessionId = randomUUID(),
    url = "http://127.0.0.1:1234/owned-capture";
  const native = new NullNativeBridge();
  native.available = () => true;
  const png = PNG.sync.write(new PNG({ width: 20, height: 20 }));
  const receipt = (input: NativePersonCaptureParams): NativePersonCaptureReceipt => ({
    ...input,
    captureId: randomUUID(),
    masking: "editable-all-frames",
    pngBase64: png.toString("base64"),
    width: 20,
    height: 20,
    pixelWidth: 20,
    pixelHeight: 20,
    scale: 1,
  });
  const host = vi.fn(async (input: NativePersonCaptureParams) => receipt(input));
  Object.assign(native, {
    personCapture: host,
    personReadContext: async () => ({
      pageId,
      documentId,
      sessionId,
      url,
      producerSha256: createHash("sha256").update(PERSON_OBSERVER_WRAPPED_SOURCE).digest("hex"),
    }),
  });
  const pages: PageRegistry = new PageRegistry({
    repo,
    events: new EventBus(repo),
    native,
    drivers: () => ({ aux: null, chrome: null }),
    turnMentions: fixtureTurnMentions((id): PageTarget | undefined => pages.live.get(id)?.target),
  });
  const target = PageTargetSchema.parse({
    pageId,
    backend: "aux",
    targetId: `atab-${pageId}`,
    windowId: "original-native-window",
    url,
    title: "Owned capture",
    documentEpoch: 0,
    lastRevision: 0,
    viewStatus: "visible",
    controller: "human",
    controllerEpoch: 0,
    ownedByRuntime: false,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  });
  const original = pages.addLive(target, null);
  const diagnostics = new PageDiagnostics(pages, undefined as never, undefined as never);
  return { pages, original, native, host, receipt, diagnostics, pageId };
}
it("routes the actual driverless runtime capture through the fixed original native identity", async () => {
  const f = fixture();
  const result = await f.diagnostics.capture(f.pageId, { format: "dataUrl", expectedDocumentEpoch: 0 });
  expect(f.host).toHaveBeenCalledExactlyOnceWith({
    pageId: f.pageId,
    documentId: f.original.personReadDocumentId,
    sessionId: f.original.target.sessionId,
    windowId: "original-native-window",
    targetId: `atab-${f.pageId}`,
    url: f.original.target.url,
  });
  expect(f.original.driver).toBeNull();
  expect(result.dataUrl).toMatch(/^data:image\/png;base64,/);
  expect(result).toMatchObject({ width: 20, height: 20, documentEpoch: 0, url: f.original.target.url });
});
it("reports a native masked viewport fallback when full-page capture is unavailable", async () => {
  const f = fixture();
  expect(await f.diagnostics.capture(f.pageId, { fullPage: true })).toMatchObject({
    fallbackReason: "native_viewport_only",
    extent: { kind: "viewport", width: 20, height: 20 },
    viewport: { width: 20, height: 20, scale: 1 },
  });
  expect(f.host).toHaveBeenCalledOnce();
});
it("refuses missing host and controlled pages before dispatch", async () => {
  const f = fixture();
  f.original.target.controller = "agent";
  await expect(f.diagnostics.capture(f.pageId)).rejects.toMatchObject({ code: "target_detached" });
  f.original.target.controller = "human";
  Object.assign(f.native, { personCapture: undefined });
  await expect(f.diagnostics.capture(f.pageId)).rejects.toMatchObject({ code: "backend_unavailable" });
  expect(f.host).not.toHaveBeenCalled();
});
it("rejects a held response after same-ID live owner replacement", async () => {
  const f = fixture();
  let release!: () => void;
  f.host.mockImplementationOnce(
    (input) =>
      new Promise((resolve) => {
        release = () => resolve(f.receipt(input));
      }),
  );
  const work = f.diagnostics.capture(f.pageId);
  await vi.waitFor(() => expect(f.host).toHaveBeenCalledOnce());
  f.pages.addLive({ ...f.original.target }, null);
  release();
  await expect(work).rejects.toMatchObject({ code: "target_detached" });
});
it.each(["documentEpoch", "controllerEpoch", "windowId", "targetId", "sessionId"])(
  "rejects held %s drift",
  async (key) => {
    const f = fixture();
    let release!: () => void;
    f.host.mockImplementationOnce(
      (input) =>
        new Promise((resolve) => {
          release = () => resolve(f.receipt(input));
        }),
    );
    const work = f.diagnostics.capture(f.pageId);
    await vi.waitFor(() => expect(f.host).toHaveBeenCalledOnce());
    Object.assign(f.original.target, {
      [key]: typeof f.original.target[key as keyof PageTarget] === "number" ? 99 : "replacement",
    });
    release();
    await expect(work).rejects.toMatchObject({ code: "target_detached" });
  },
);
it.each(["documentId", "sessionId", "windowId", "targetId", "url"])(
  "refuses foreign native receipt %s",
  async (key) => {
    const f = fixture();
    f.host.mockImplementationOnce(async (input) => ({
      ...f.receipt(input),
      [key]:
        key.endsWith("Id") && !["windowId", "targetId"].includes(key)
          ? randomUUID()
          : key === "url"
            ? "https://foreign.test/"
            : "foreign",
    }));
    await expect(f.diagnostics.capture(f.pageId)).rejects.toMatchObject({ code: "ref_stale" });
  },
);
it("preserves original native rejection and refuses unmasked or mismatched image bytes", async () => {
  const f = fixture(),
    failure = new Error("original native mask failed");
  f.host.mockRejectedValueOnce(failure);
  await expect(f.diagnostics.capture(f.pageId)).rejects.toBe(failure);
  f.host.mockImplementationOnce(async (input) => ({ ...f.receipt(input), masking: "raw-preview" as never }));
  await expect(f.diagnostics.capture(f.pageId)).rejects.toThrow();
  f.host.mockImplementationOnce(async (input) => ({ ...f.receipt(input), pixelWidth: 19 }));
  await expect(f.diagnostics.capture(f.pageId)).rejects.toMatchObject({ code: "backend_unavailable" });
});

it("retains CSS viewport geometry separately from actual scaled PNG dimensions", async () => {
  const f = fixture();
  f.host.mockImplementationOnce(async (input) => ({ ...f.receipt(input), width: 10, height: 10, scale: 2 }));
  const result = await f.diagnostics.capture(f.pageId, { format: "dataUrl" });
  expect(result).toMatchObject({
    width: 10,
    height: 10,
    scale: 2,
    imageWidth: 20,
    imageHeight: 20,
    viewport: { width: 10, height: 10, scale: 2 },
  });
});
