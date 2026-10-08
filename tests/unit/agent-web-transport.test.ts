import { createServer, type Server } from "node:http";
import { afterEach, expect, it, vi } from "vitest";
import { AgentWebTools, nodeWebTransport } from "../../apps/runtime/src/agent/web-tools.js";
import * as network from "../../apps/runtime/src/services/public-network.js";

const servers: Server[] = [];
afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve) => {
          server.closeAllConnections();
          server.close(() => resolve());
        }),
    ),
  );
});

it("retires a pending DNS lookup on Stop and never opens its eventual socket", async () => {
  let release: (value: Awaited<ReturnType<typeof network.resolveNetworkAddress>>) => void = () => {};
  const lookup = vi.spyOn(network, "resolveNetworkAddress").mockImplementation(
    () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  const controller = new AbortController();
  const request = nodeWebTransport(new URL("https://example.com"), false, controller.signal);
  const error = new Error("Stopped during DNS");
  controller.abort(error);
  await expect(request).rejects.toBe(error);
  expect(lookup).toHaveBeenCalledOnce();
  release({ address: "127.0.0.1", family: 4 });
  await Promise.resolve();
});

it("closes an in-flight response on Stop", async () => {
  let accepted: () => void = () => {};
  const started = new Promise<void>((resolve) => {
    accepted = resolve;
  });
  let disconnected: () => void = () => {};
  const closed = new Promise<void>((resolve) => {
    disconnected = resolve;
  });
  const server = createServer((_request, response) => {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.write("Still streaming");
    response.on("close", disconnected);
    accepted();
  });
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing fixture address");
  const controller = new AbortController();
  const request = nodeWebTransport(new URL(`http://127.0.0.1:${address.port}`), true, controller.signal);
  await started;
  const error = new Error("Stopped during response");
  controller.abort(error);
  await expect(request).rejects.toBe(error);
  await closed;
});

it("uses one absolute deadline across redirects and checks cancellation after destination admission", async () => {
  const deadline = new AbortController();
  const timeout = vi.spyOn(AbortSignal, "timeout").mockReturnValue(deadline.signal);
  const destinations: string[] = [];
  const transport = vi.fn(async (url: URL, _private: boolean, signal?: AbortSignal) => {
    expect(signal).toBe(deadline.signal);
    return { status: 302, location: "https://second.example/", contentType: "text/html", body: "" };
  });
  const web = new AgentWebTools((url) => {
    destinations.push(url.origin);
    if (url.hostname === "second.example") deadline.abort(new Error("Absolute deadline reached"));
    return true;
  }, transport);
  await expect(web.fetch("https://first.example/")).rejects.toThrow("Absolute deadline reached");
  expect(timeout).toHaveBeenCalledExactlyOnceWith(30_000);
  expect(destinations).toEqual(["https://first.example", "https://second.example"]);
  expect(transport).toHaveBeenCalledOnce();
});
