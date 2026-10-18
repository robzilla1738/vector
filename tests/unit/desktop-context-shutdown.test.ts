import { afterEach, expect, it, vi } from "vitest";
import { AuxError, RpcChannel, type Transport } from "@aux/contracts";
import {
  desktopContextDefaults,
  NativeDesktopContextRequestSchema,
  type DesktopContextNativeStatus,
} from "@aux/contracts/desktop-context";
import { Repo, openDb } from "@aux/runtime";
import { DesktopContextService } from "../../apps/runtime/dist/services/desktop-context.js";
import { DesktopContextNativeAdapter } from "../../apps/runtime/dist/services/desktop-context-native.js";
import { ChannelNativeBridge } from "../../apps/runtime/dist/native.js";
import { DesktopContextStore } from "../../apps/runtime/dist/services/desktop-context-store.js";
import { MemoryRecall } from "../../apps/runtime/dist/services/memory-recall.js";
const closes: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of closes.splice(0).reverse()) await close();
  vi.restoreAllMocks();
});
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function fixture(active = false) {
  const listeners: ((frame: unknown) => void)[] = [];
  const ends: (() => void)[] = [];
  let closed = false;
  const transport = (side: number): Transport => ({
    send: (frame) =>
      queueMicrotask(() => {
        if (!closed) listeners[1 - side]?.(frame);
      }),
    onMessage: (callback) => {
      listeners[side] = callback;
    },
    onClose: (callback) => {
      ends.push(callback);
    },
  });
  const channel = new RpcChannel(transport(0), "original native owner"),
    host = new RpcChannel(transport(1), "synthetic host");
  const disconnect = () => {
    closed = true;
    for (const close of ends) close();
  };
  let settings = {
    ...desktopContextDefaults(),
    ...(active
      ? {
          enabled: true,
          workspaceId: "space",
          selectedApps: [{ bundleId: "test.editor", displayName: "Test Editor" }],
        }
      : {}),
  };
  let status: DesktopContextNativeStatus = {
    supported: true,
    phase: active ? "running" : "off",
    accessibilityTrusted: true,
    ocrSupported: true,
    pickerGrantActive: false,
    leaseId: active ? "original-lease" : null,
    configurationRevision: settings.revision,
    consentRevision: 0,
    dropped: 0,
    reason: "none",
  };
  const stop = vi.fn(async () => {
    status = { ...status, phase: "off", leaseId: null };
  });
  const attach = vi.fn(async () => {
    status = { ...status, phase: "running", leaseId: "original-lease" };
  });
  const configure = vi.fn(async () => {});
  const requests: string[] = [];
  host.onMethod("native.desktopContext", async (raw) => {
    const input = NativeDesktopContextRequestSchema.parse(raw);
    requests.push(input.op);
    if (input.op === "stop") {
      await stop();
      return { op: input.op, ok: true };
    }
    if (input.op === "attach") await attach();
    if (input.op === "configure") await configure();
    if (["status", "attach", "configure", "permission"].includes(input.op)) return { op: input.op, status };
    throw new Error("Unexpected native request in shutdown fixture");
  });
  const native = new DesktopContextNativeAdapter(new ChannelNativeBridge(channel), async () => true);
  const db = openDb(":memory:"),
    repo = new Repo(db),
    secrets = new Map<string, string>();
  const store = new DesktopContextStore(
    repo,
    {
      readSecret: async (name) => ({ value: secrets.get(name) }),
      storeSecret: async (name, value) => {
        secrets.set(name, value);
        return { ok: true as const };
      },
    },
    "desktop-shutdown-fixture",
  );
  const save = vi.fn((value) => {
    settings = value;
  });
  const service = new DesktopContextService({
    store,
    native,
    nativeOwnerDisconnected: () => channel.isClosed(),
    settings: () => settings,
    saveSettings: save,
    workspaceEligible: (id) => id === "space",
    sourceEligible: () => true,
    beforeRemoval: async () => {},
    changed: () => {},
  });
  closes.push(async () => {
    disconnect();
    await service.shutdown().catch(() => {});
    repo.close();
  });
  return {
    service,
    channel,
    native,
    store,
    stop,
    attach,
    configure,
    requests,
    disconnect,
    save,
    settings: () => settings,
    status: () => status,
  };
}
it("exposes permanent close of the exact original RpcChannel, independently of other channels", async () => {
  const original = fixture(),
    other = fixture();
  expect(original.channel.isClosed()).toBe(false);
  original.disconnect();
  expect(original.channel.isClosed()).toBe(true);
  expect(other.channel.isClosed()).toBe(false);
  await expect(original.channel.call("native.desktopContext", { op: "stop" })).rejects.toMatchObject({
    code: "backend_unavailable",
  });
});
it("closes the off-state service without sending stop to its disconnected original owner", async () => {
  const f = fixture();
  await f.service.snapshot();
  f.disconnect();
  const recall = vi.spyOn(MemoryRecall.prototype, "close");
  await f.service.shutdown();
  expect(f.requests).toEqual(["status"]);
  expect(recall).toHaveBeenCalledTimes(1);
});
it("treats an original channel close during final stop as host retirement, then closes recall", async () => {
  const f = fixture(true),
    entered = deferred(),
    finish = deferred();
  f.stop.mockImplementation(async () => {
    entered.resolve();
    await finish.promise;
  });
  const recall = vi.spyOn(MemoryRecall.prototype, "close");
  const closing = f.service.shutdown();
  await entered.promise;
  f.disconnect();
  await closing;
  expect(recall).toHaveBeenCalledTimes(1);
  expect(f.requests).toEqual(["stop"]);
  finish.resolve();
});
it("retains a live native stop failure while joining the original read and closing recall", async () => {
  const f = fixture(true),
    entered = deferred(),
    finish = deferred(),
    stopFailure = new AuxError("backend_unavailable", "Live stop was not acknowledged");
  const read = vi.spyOn(f.store, "read").mockImplementationOnce(async (_workspace, check) => {
    entered.resolve();
    await finish.promise;
    check?.();
    return [];
  });
  f.stop.mockRejectedValue(stopFailure);
  const work = f.service.sources("space");
  const refused = work.then(
    () => {
      throw new Error("Retired source read must not publish");
    },
    (error) => expect(error).toBeInstanceOf(Error),
  );
  await entered.promise;
  const recall = vi.spyOn(MemoryRecall.prototype, "close");
  let settled = false;
  const closing = f.service.shutdown().then(
    () => {
      throw new Error("Live stop failure must be retained");
    },
    (error) => {
      expect(error).toMatchObject({ code: "backend_unavailable" });
      settled = true;
    },
  );
  await vi.waitFor(() => expect(f.stop).toHaveBeenCalledTimes(1));
  expect(settled).toBe(false);
  expect(recall).not.toHaveBeenCalled();
  finish.resolve();
  await refused;
  await closing;
  expect(read).toHaveBeenCalledTimes(1);
  expect(recall).toHaveBeenCalledTimes(1);
});
it("aggregates live stop and recall cleanup errors after attempting both", async () => {
  const f = fixture(),
    stopFailure = new AuxError("backend_unavailable", "Stop failed"),
    recallFailure = new Error("Embedding close failed");
  f.stop.mockRejectedValue(stopFailure);
  vi.spyOn(MemoryRecall.prototype, "close").mockRejectedValueOnce(recallFailure);
  const result = await f.service.shutdown().catch((error) => error);
  expect(result).toBeInstanceOf(AggregateError);
  expect(result.errors).toHaveLength(2);
  expect(result.errors[0]).toMatchObject({ code: "backend_unavailable" });
  expect(result.errors[1]).toBe(recallFailure);
});
it.each(["pause", "Forget"])(
  "never waives a live %s stop failure as a generic backend outage",
  async (kind) => {
    const f = fixture(true);
    f.stop.mockRejectedValue(new AuxError("backend_unavailable", "Live original producer still needs stop"));
    const operation =
      kind === "pause"
        ? f.service.pause(0, true, "original-window", async () => {})
        : f.service.forget("space", 0, undefined, undefined, async () => {}, "original-window");
    await expect(operation).rejects.toMatchObject({ code: "backend_unavailable" });
    expect(f.channel.isClosed()).toBe(false);
    expect(f.save).not.toHaveBeenCalled();
  },
);
it("waits for an in-flight original attach, then stops it and cannot restart after shutdown", async () => {
  const f = fixture(true),
    entered = deferred(),
    finish = deferred();
  f.attach.mockImplementation(async () => {
    entered.resolve();
    await finish.promise;
  });
  const start = f.service.start();
  const retired = start.then(
    () => {
      throw new Error("Retired startup must not succeed");
    },
    (error) => expect(error).toMatchObject({ code: "cancelled" }),
  );
  await entered.promise;
  let settled = false;
  const closing = f.service.shutdown().then(() => {
    settled = true;
  });
  expect(f.stop).not.toHaveBeenCalled();
  expect(settled).toBe(false);
  finish.resolve();
  await retired;
  await closing;
  expect(f.requests).toEqual(["attach", "stop"]);
  await expect(f.service.start()).rejects.toMatchObject({ code: "cancelled" });
  expect(f.attach).toHaveBeenCalledTimes(1);
});
it("prevents an original queued configuration from attaching after its owner check crosses shutdown", async () => {
  const f = fixture(),
    entered = deferred(),
    finish = deferred();
  const configure = f.service.configure(
    0,
    {
      ...f.settings(),
      enabled: true,
      workspaceId: "space",
      selectedApps: [{ bundleId: "test.editor", displayName: "Test Editor" }],
    },
    "original-window",
    async () => {
      entered.resolve();
      await finish.promise;
    },
  );
  const retired = configure.then(
    () => {
      throw new Error("Retired configuration must not succeed");
    },
    (error) => expect(error).toMatchObject({ code: "cancelled" }),
  );
  await entered.promise;
  const closing = f.service.shutdown();
  finish.resolve();
  await retired;
  await closing;
  expect(f.configure).not.toHaveBeenCalled();
  expect(f.save).not.toHaveBeenCalled();
});
it("does not attach when original key retirement finishes only after shutdown", async () => {
  const f = fixture(true),
    entered = deferred(),
    finish = deferred();
  vi.spyOn(f.store, "retireKeys").mockImplementationOnce(async () => {
    entered.resolve();
    await finish.promise;
  });
  const start = f.service.start();
  const retired = start.then(
    () => {
      throw new Error("Retired startup cannot attach");
    },
    (error) => expect(error).toMatchObject({ code: "cancelled" }),
  );
  await entered.promise;
  const closing = f.service.shutdown();
  finish.resolve();
  await retired;
  await closing;
  expect(f.attach).not.toHaveBeenCalled();
  expect(f.stop).toHaveBeenCalledTimes(1);
});
