import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ lookup: vi.fn(), request: vi.fn() }));
vi.mock("node:dns/promises", () => ({ lookup: mocks.lookup }));
vi.mock("node:https", () => ({ request: mocks.request }));
import { publicHttpsText } from "../../apps/runtime/src/services/public-https.js";

beforeEach(() => {
  mocks.lookup.mockReset().mockResolvedValue([{ address: "93.184.216.34", family: 4 }]);
  mocks.request.mockReset();
});

it("vets every DNS answer and refuses mixed public/private results before opening a socket", async () => {
  mocks.lookup.mockResolvedValue([
    { address: "93.184.216.34", family: 4 },
    { address: "127.0.0.1", family: 4 },
  ]);
  await expect(
    publicHttpsText(new URL("https://lists.example.org/source"), { maxBytes: 1024 }),
  ).rejects.toThrow("private or local");
  expect(mocks.request).not.toHaveBeenCalled();
});

it.each([
  { address: "93.184.216.34", family: 4 },
  { address: "2606:4700:4700::1111", family: 6 },
])("pins the vetted IPv$family singleton and preserves UTF-8 across response chunks", async (chosen) => {
  mocks.lookup.mockResolvedValue([chosen]);
  mocks.request.mockImplementation((_url, options, callback) => {
    expect(options.agent).toBe(false);
    expect(options.family).toBe(chosen.family);
    const socketAddress = vi.fn();
    options.lookup("lists.example.org", { family: options.family }, socketAddress);
    expect(socketAddress).toHaveBeenCalledWith(null, chosen.address, chosen.family);
    const transport = Object.assign(new EventEmitter(), {
      end() {
        const response = Object.assign(new PassThrough(), { statusCode: 200, headers: { etag: "v1" } });
        callback(response);
        const bytes = Buffer.from("! 🌙\n||ads.example.org^");
        response.write(bytes.subarray(0, 4));
        response.end(bytes.subarray(4));
      },
    });
    return transport;
  });
  await expect(
    publicHttpsText(new URL("https://lists.example.org/source"), { maxBytes: 1024 }),
  ).resolves.toEqual({ status: 200, etag: "v1", text: "! 🌙\n||ads.example.org^" });
  expect(mocks.lookup).toHaveBeenCalledTimes(1);
});

it("enforces the streamed byte bound without following a redirect", async () => {
  let status = 200;
  mocks.request.mockImplementation((_url, _options, callback) =>
    Object.assign(new EventEmitter(), {
      end() {
        const response = Object.assign(new PassThrough(), {
          statusCode: status,
          headers: { location: "https://private.example.org/" },
        });
        callback(response);
        if (status === 200) response.end("too large");
      },
    }),
  );
  await expect(publicHttpsText(new URL("https://lists.example.org/source"), { maxBytes: 2 })).rejects.toThrow(
    "too large",
  );
  status = 302;
  await expect(
    publicHttpsText(new URL("https://lists.example.org/source"), { maxBytes: 2 }),
  ).resolves.toMatchObject({ status: 302, text: "" });
  expect(mocks.request).toHaveBeenCalledTimes(2);
});

it("retires an aborted DNS lookup without ever opening a late socket", async () => {
  let finish!: (value: { address: string; family: number }[]) => void;
  mocks.lookup.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const controller = new AbortController();
  const response = publicHttpsText(new URL("https://lists.example.org/source"), {
    maxBytes: 1024,
    signal: controller.signal,
  });
  const refused = expect(response).rejects.toThrow("Owner closed");
  controller.abort(new Error("Owner closed"));
  await refused;
  finish([{ address: "93.184.216.34", family: 4 }]);
  await Promise.resolve();
  expect(mocks.request).not.toHaveBeenCalled();
});
