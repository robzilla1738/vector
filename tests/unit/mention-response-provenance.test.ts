import { EventEmitter } from "node:events";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { PlaywrightDriverPage, RefRegistry, type DriverPageEvents } from "@aux/chromium-driver";
import { ArtifactStore, EventBus, openDb, Repo, ResponseStore } from "@aux/runtime";
import { PageTargetSchema } from "@aux/contracts";
const cleanup: (() => void)[] = [];
afterEach(() => cleanup.splice(0).forEach((fn) => fn()));
function storeFixture() {
  const db = openDb(":memory:"),
    repo = new Repo(db),
    events = new EventBus(repo);
  const dir = mkdtempSync(join(tmpdir(), "aux-response-document-"));
  cleanup.push(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });
  const store = new ResponseStore({ repo, events, artifacts: new ArtifactStore(dir, repo, events) });
  const page = PageTargetSchema.parse({
    pageId: "a",
    targetId: "target",
    backend: "aux",
    windowId: "main",
    url: "https://response.test/a",
    title: "A",
    sessionId: "attachment-1",
    documentEpoch: 4,
    lastRevision: 0,
    viewStatus: "visible",
    lifecycle: "live",
    controller: "none",
    controllerEpoch: 0,
    ownedByRuntime: false,
    createdAt: 1,
    lastActiveAt: 1,
  });
  return { store, repo, page };
}
it("real request initiation retains its original document while response body awaits navigation", async () => {
  const frame = { url: () => "https://response.test/a" };
  const page = Object.assign(new EventEmitter(), {
    url: frame.url,
    mainFrame: () => frame,
    isClosed: () => false,
  });
  const context = {
    newCDPSession: async () => {
      throw new Error("No isolated world in structural response fixture");
    },
  };
  const driver = new PlaywrightDriverPage({
    page: page as unknown as ConstructorParameters<typeof PlaywrightDriverPage>[0]["page"],
    context: context as unknown as ConstructorParameters<typeof PlaywrightDriverPage>[0]["context"],
    identity: { pageId: "a", targetId: "target", backend: "aux" },
    refs: new RefRegistry(),
    initialDocumentEpoch: 4,
  });
  const received: Parameters<NonNullable<DriverPageEvents["onResponse"]>>[0][] = [];
  driver.setEvents({ onResponse: (info) => received.push(info) });
  const request = {
    isNavigationRequest: () => false,
    resourceType: () => "fetch",
    method: () => "GET",
    timing: () => ({ startTime: 1 }),
  };
  let release!: (body: Buffer) => void;
  const body = vi.fn(
    () =>
      new Promise<Buffer>((resolve) => {
        release = resolve;
      }),
  );
  const response = {
    request: () => request,
    headers: () => ({ "content-type": "application/json" }),
    status: () => 200,
    url: () => "https://response.test/api",
    body,
  };
  page.emit("request", request);
  page.emit("response", response);
  expect(body).toHaveBeenCalledOnce();
  page.emit("framenavigated", frame);
  release(Buffer.from('{"from":"old document"}'));
  await vi.waitFor(() => expect(received).toHaveLength(1));
  expect(received[0]).toMatchObject({ documentEpoch: 4, documentUrl: frame.url() });
  expect(driver.epoch()).toBe(5);
});
it("captured body and metadata require original attachment/document; owner history remains available", async () => {
  const { store, page, repo } = storeFixture();
  store.record(page.pageId)({
    requestId: "r",
    url: "https://response.test/api",
    method: "GET",
    status: 200,
    startedAt: 1,
    endedAt: 2,
    body: Buffer.from("synthetic-old-data"),
    contentType: "application/json",
    sessionId: page.sessionId,
    documentEpoch: page.documentEpoch,
    documentUrl: page.url,
  });
  await store.flush();
  expect(repo.getResponse("r")).toMatchObject({
    sessionId: page.sessionId,
    documentEpoch: 4,
    documentUrl: page.url,
  });
  expect(store.bodyForDocument("r", page)?.buffer.toString()).toBe("synthetic-old-data");
  page.documentEpoch++;
  expect(store.listForDocument(page)).toEqual([]);
  expect(() => store.bodyForDocument("r", page)).toThrow(/another attachment or initiating document/);
  page.documentEpoch = 4;
  page.sessionId = "attachment-2";
  expect(() => store.bodyForDocument("r", page)).toThrow(/another attachment or initiating document/);
  expect(store.body("r")?.buffer.toString()).toBe("synthetic-old-data");
});
it("a response with no trusted request identity never becomes current agent content", async () => {
  const { store, page } = storeFixture();
  store.record(page.pageId)({
    requestId: "unbound",
    url: "https://response.test/api",
    method: "GET",
    status: 200,
    startedAt: 1,
    endedAt: 2,
    body: Buffer.from("unbound"),
  });
  await store.flush();
  expect(store.listForDocument(page)).toEqual([]);
  expect(() => store.bodyForDocument("unbound", page)).toThrow(/another attachment/);
  expect(store.list(page.pageId)).toHaveLength(1);
});
