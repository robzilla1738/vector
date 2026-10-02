import { createServer, type Socket } from "node:net";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it, vi } from "vitest";
import { DEFAULT_DOWNLOAD_NAMING, RpcChannel } from "@aux/contracts";
import { EventBus, makeInvoker, openDb, Repo, type Services } from "@aux/runtime";
import { AUX_HOST_PROTOCOL, connectHostSocket } from "../../apps/runtime/src/host-socket.js";
import { registerDownloadNamingChannel } from "../../apps/runtime/src/startup-host-channel.js";

it("dispatches authenticated raw native completion through the real guarded naming service", async () => {
  const dir = mkdtempSync(join(tmpdir(), "aux-download-channel-"));
  const path = join(dir, "host.sock");
  const db = openDb(":memory:");
  const repo = new Repo(db),
    events = new EventBus(repo);
  repo.setSetting("downloadNaming", { ...DEFAULT_DOWNLOAD_NAMING, mode: "unclear", useAi: true });
  const info = {
    id: "owned-download",
    filename: "download.pdf",
    mime: "application/pdf",
    sourceHost: "fixture.test",
    tabTitle: "Invoice 4471",
    endedAt: Date.now(),
  };
  const generateStructured = vi.fn(async () => ({ object: { stem: "Invoice 4471" } }));
  const renameDownload = vi.fn(async () => ({
    renamed: true,
    filename: "Invoice 4471.pdf",
    receiptId: "receipt",
  }));
  const services = {
    repo,
    events,
    featureHost: "chromium-fork",
    featureProfileId: "owned-profile",
    featureStages: Promise.resolve({ smartDownloadNames: "on" }),
    settings: {
      get: (key: string) => repo.getSetting(key),
      model: () => ({ generateStructured }),
      agentRoute: () => ({ modelId: "fixture-model" }),
    },
    native: {
      downloadNamingCandidate: vi.fn(async (id: string) => (id === info.id ? info : null)),
      downloadRenameReceipts: async () => [],
      downloadPreviewText: async () => ({ text: "Invoice 4471" }),
      renameDownload,
      undoDownloadRename: async () => ({ status: "expired" }),
    },
  } as unknown as Services;
  const invoke = makeInvoker(services);
  let owner!: Socket;
  let resolveFrame!: (frame: Record<string, unknown>) => void;
  let response: Promise<Record<string, unknown>>;
  const server = createServer((socket) => {
    owner = socket;
    socket.setEncoding("utf8");
    let buffer = "";
    socket.on("data", (chunk: string) => {
      buffer += chunk;
      for (let end = buffer.indexOf("\n"); end >= 0; end = buffer.indexOf("\n")) {
        const frame = JSON.parse(buffer.slice(0, end)) as Record<string, unknown>;
        buffer = buffer.slice(end + 1);
        if (frame.kind === "hello")
          socket.write(
            JSON.stringify({ kind: "hello-ack", protocol: AUX_HOST_PROTOCOL, nonce: frame.nonce }) + "\n",
          );
        else resolveFrame(frame);
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(path, resolve));
  const transport = await connectHostSocket(path, "a".repeat(64));
  const channel = new RpcChannel(transport, "owned-download-test");
  registerDownloadNamingChannel(channel, Promise.resolve(invoke));
  let id = 0;
  async function raw(method: string, params: unknown) {
    response = new Promise((resolve) => {
      resolveFrame = resolve;
    });
    owner.write(JSON.stringify({ kind: "req", id: ++id, method, params }) + "\n");
    return response;
  }
  try {
    await expect(invoke("downloads.completedNative", info)).rejects.toMatchObject({
      code: "permission_denied",
    });
    await expect(
      invoke("downloads.completedNative", info, { external: false, codeMode: true }),
    ).rejects.toMatchObject({ code: "permission_denied" });
    const completed = await raw("downloads.completedNative", info);
    expect(completed).toMatchObject({
      kind: "res",
      result: { status: "renamed", filename: "Invoice 4471.pdf" },
    });
    expect(generateStructured).toHaveBeenCalledOnce();
    expect(renameDownload).toHaveBeenCalledWith({
      downloadId: info.id,
      expectedName: info.filename,
      stem: "Invoice 4471",
      mode: "unclear",
    });
    await raw("downloads.completedNative", info);
    expect(generateStructured).toHaveBeenCalledOnce();
    const foreign = await raw("downloads.completedNative", { ...info, id: "foreign-profile-download" });
    expect(foreign).toMatchObject({ result: { status: "skipped", reason: "download-changed" } });
    expect(renameDownload).toHaveBeenCalledOnce();
    services.featureStages = Promise.resolve({ smartDownloadNames: "off" });
    expect(await raw("downloads.completedNative", { ...info, id: "disabled" })).toMatchObject({
      error: { code: "feature_unavailable" },
    });
    expect(await raw("downloads.undoRename", { receiptId: "receipt" })).toMatchObject({
      error: { code: "not_found" },
    });
  } finally {
    transport.close();
    owner.destroy();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
