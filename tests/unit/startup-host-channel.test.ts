import { expect, it, vi } from "vitest";
import type { HostSocketTransport } from "../../apps/runtime/src/host-socket.js";
import { startupHostChannel } from "../../apps/runtime/src/startup-host-channel.js";

it("delivers native responses during unlock and replays startup requests only after registration", async () => {
  let incoming!: (frame: unknown) => void;
  const sent: unknown[] = [];
  const socket: HostSocketTransport = {
    send(frame) {
      sent.push(frame);
    },
    onMessage(callback) {
      incoming = callback;
    },
    close() {},
  };
  const startup = startupHostChannel(socket);
  incoming({ kind: "req", id: 7, method: "history.projectSnapshot", params: { visits: [] } });
  incoming({ kind: "note", type: "view.navigated", payload: { pageId: "one" } });
  const call = startup.channel.call("native.profileStorageFactor", { version: 1, purpose: "sqlite" });
  incoming({ kind: "res", id: 1, result: { value: "factor" } });
  expect(await call).toEqual({ value: "factor" });
  expect(sent).toHaveLength(1);
  const notes: string[] = [];
  startup.channel.onMethod("history.projectSnapshot", () => ({ ok: true }));
  startup.channel.onNotify((type) => notes.push(type));
  startup.release();
  await Promise.resolve();
  expect(notes).toEqual(["view.navigated"]);
  expect(sent).toContainEqual({ kind: "res", id: 7, result: { ok: true } });
});

it("answers a nonce-bound native liveness probe during storage unlock without releasing API requests", async () => {
  let incoming!: (frame: unknown) => void;
  const sent: unknown[] = [];
  const startup = startupHostChannel({
    send: (frame) => sent.push(frame),
    onMessage: (callback) => {
      incoming = callback;
    },
    close() {},
  });
  const nonce = "12345678-1234-4234-9234-123456789abc";
  incoming({
    kind: "req",
    id: 20,
    method: "api.invoke",
    params: { method: "conversations.list", params: {} },
  });
  incoming({ kind: "req", id: 21, method: "runtime.liveness", params: { nonce } });
  await Promise.resolve();
  expect(sent).toEqual([{ kind: "res", id: 21, result: { nonce } }]);
  const api = vi.fn(() => []);
  startup.channel.onMethod("api.invoke", api);
  expect(api).not.toHaveBeenCalled();
  startup.release();
  await Promise.resolve();
  expect(api).toHaveBeenCalledOnce();
  incoming({ kind: "req", id: 22, method: "runtime.liveness", params: { nonce, extra: true } });
  await Promise.resolve();
  expect(sent).toContainEqual(
    expect.objectContaining({
      kind: "res",
      id: 22,
      error: expect.objectContaining({ code: "invalid_params" }),
    }),
  );
});
