import { EventEmitter } from "node:events";
import { afterEach, expect, it, vi } from "vitest";
import { request } from "node:https";
import { resolveNetworkAddress } from "../../apps/runtime/src/services/public-network.js";
import {
  prepareConnectorUpload,
  sendConnectorUpload,
} from "../../apps/runtime/src/services/connector-upload-network.js";
vi.mock("node:https", () => ({ request: vi.fn() }));
vi.mock("../../apps/runtime/src/services/public-network.js", () => ({ resolveNetworkAddress: vi.fn() }));
afterEach(() => vi.resetAllMocks());
function fixture(status = 200, body = "ok") {
  const response = Object.assign(new EventEmitter(), { statusCode: status });
  let ready!: () => void;
  const responseReady = new Promise<void>((resolve) => {
    ready = resolve;
  });
  const chunks: Buffer[] = [];
  const req = Object.assign(new EventEmitter(), {
    write: vi.fn((chunk: Buffer) => {
      chunks.push(Buffer.from(chunk));
      return true;
    }),
    end: vi.fn(() => {
      queueMicrotask(() => {
        req.emit("finish");
        response.emit("data", Buffer.from(body));
        response.emit("end");
      });
    }),
    setTimeout: vi.fn(),
    destroy: vi.fn((error: Error) => {
      req.emit("error", error);
      req.emit("close");
    }),
  });
  vi.mocked(resolveNetworkAddress).mockResolvedValue({ address: "93.184.216.34", family: 4 });
  vi.mocked(request).mockImplementation((_url, _options, callback) => {
    queueMicrotask(() => {
      callback!(response as never);
      ready();
    });
    return req as never;
  });
  return { chunks, req, response, responseReady };
}
it("uses the vetted pinned DNS answer for the actual HTTPS POST without ambient auth or redirects", async () => {
  const f = fixture();
  const bytes = Buffer.from("actual wire bytes");
  const input = prepareConnectorUpload(
    { url: "https://files.slack.com/upload/test", headers: {}, encoding: { kind: "raw" } },
    bytes,
    { filename: "test.txt", mediaType: "text/plain" },
  );
  const dispatch = vi.fn(),
    check = vi.fn();
  expect(await sendConnectorUpload(input, new AbortController().signal, check, dispatch)).toEqual({
    status: 200,
    body: "ok",
  });
  expect(Buffer.concat(f.chunks)).toEqual(bytes);
  expect(dispatch).toHaveBeenCalledOnce();
  expect(resolveNetworkAddress).toHaveBeenCalledWith("files.slack.com");
  const options = vi.mocked(request).mock.calls[0]![1] as import("node:https").RequestOptions;
  expect(options).toMatchObject({
    method: "POST",
    agent: false,
    family: 4,
    headers: { "content-type": "text/plain" },
  });
  const lookup = options.lookup! as (
    host: string,
    options: object,
    callback: (error: unknown, address: string, family: number) => void,
  ) => void;
  const resolved = vi.fn();
  lookup("files.slack.com", {}, resolved);
  expect(resolved).toHaveBeenCalledWith(null, "93.184.216.34", 4);
});
it("refuses unsafe DNS before recording any dispatch and never follows an upload redirect", async () => {
  fixture();
  vi.mocked(resolveNetworkAddress).mockRejectedValue(new Error("Nonpublic DNS answer"));
  const input = prepareConnectorUpload(
    { url: "https://files.slack.com/upload/test", headers: {}, encoding: { kind: "raw" } },
    Buffer.from("fixture"),
    { filename: "test.txt", mediaType: "text/plain" },
  );
  const dispatch = vi.fn();
  await expect(sendConnectorUpload(input, new AbortController().signal, () => {}, dispatch)).rejects.toThrow(
    "Nonpublic",
  );
  expect(request).not.toHaveBeenCalled();
  expect(dispatch).not.toHaveBeenCalled();
  fixture(302, "redirect");
  await expect(sendConnectorUpload(input, new AbortController().signal, () => {}, dispatch)).rejects.toThrow(
    /supported success/,
  );
  expect(request).toHaveBeenCalledOnce();
});
it("rechecks authority after DNS and bounds the actual response body", async () => {
  fixture();
  const input = prepareConnectorUpload(
    { url: "https://files.slack.com/upload/test", headers: {}, encoding: { kind: "raw" } },
    Buffer.from("fixture"),
    { filename: "test.txt", mediaType: "text/plain" },
  );
  let checks = 0;
  const dispatch = vi.fn();
  await expect(
    sendConnectorUpload(
      input,
      new AbortController().signal,
      () => {
        if (++checks > 1) throw new Error("Original account retired");
      },
      dispatch,
    ),
  ).rejects.toThrow("retired");
  expect(request).not.toHaveBeenCalled();
  expect(dispatch).not.toHaveBeenCalled();
  const f = fixture(200, "x".repeat(65537));
  await expect(sendConnectorUpload(input, new AbortController().signal, () => {}, dispatch)).rejects.toThrow(
    "64 KiB",
  );
  expect(f.req.destroy).toHaveBeenCalledOnce();
});
it("joins the actual outgoing request close after abort instead of finishing on its error event", async () => {
  const f = fixture();
  f.req.end.mockImplementation(() => {});
  let dispatched!: () => void;
  const started = new Promise<void>((resolve) => {
    dispatched = resolve;
  });
  const input = prepareConnectorUpload(
    { url: "https://files.slack.com/upload/test", headers: {}, encoding: { kind: "raw" } },
    Buffer.from("fixture"),
    { filename: "test.txt", mediaType: "text/plain" },
  );
  let settled = false;
  const operation = sendConnectorUpload(input, new AbortController().signal, () => {}, dispatched).then(
    () => {
      settled = true;
    },
    (error) => {
      settled = true;
      throw error;
    },
  );
  await started;
  f.req.emit("error", new Error("Original request aborted"));
  await Promise.resolve();
  expect(settled).toBe(false);
  f.req.emit("close");
  await expect(operation).rejects.toThrow("aborted");
  expect(settled).toBe(true);
});
it("waits for outbound finish after an early 200 and cannot write after the body/source lifetime ends", async () => {
  const f = fixture();
  f.req.end.mockImplementation(() => {});
  f.req.write.mockImplementationOnce((chunk: Buffer) => {
    f.chunks.push(Buffer.from(chunk));
    return false;
  });
  const original = Buffer.alloc(256 * 1024 + 23, "a");
  const input = prepareConnectorUpload(
    { url: "https://files.slack.com/upload/test", headers: {}, encoding: { kind: "raw" } },
    original,
    { filename: "test.txt", mediaType: "text/plain" },
  );
  let dispatched!: () => void;
  const started = new Promise<void>((resolve) => {
    dispatched = resolve;
  });
  let settled = false;
  const operation = sendConnectorUpload(input, new AbortController().signal, () => {}, dispatched).then(
    (result) => {
      settled = true;
      return result;
    },
  );
  await started;
  await f.responseReady;
  f.response.emit("data", Buffer.from("ok"));
  f.response.emit("end");
  await Promise.resolve();
  expect(settled).toBe(false);
  expect(f.req.write).toHaveBeenCalledOnce();
  expect(f.req.end).not.toHaveBeenCalled();
  expect(input.body).toEqual(original);
  f.req.emit("drain");
  await Promise.resolve();
  expect(settled).toBe(false);
  expect(f.req.end).toHaveBeenCalledOnce();
  expect(Buffer.concat(f.chunks)).toEqual(original);
  f.req.emit("finish");
  expect(await operation).toEqual({ status: 200, body: "ok" });
  const writes = f.req.write.mock.calls.length;
  input.body.fill(0);
  f.req.emit("drain");
  f.req.emit("drain");
  expect(f.req.write).toHaveBeenCalledTimes(writes);
});
