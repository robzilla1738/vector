import { afterEach, expect, it, vi } from "vitest";
import { createServer, type Server } from "node:http";
import { once } from "node:events";
import { EventBus, openDb, OperationService, Repo } from "@aux/runtime";

const databases: ReturnType<typeof openDb>[] = [];
const servers: Server[] = [];
afterEach(async () => {
  vi.unstubAllGlobals();
  for (const server of servers.splice(0)) {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
  for (const db of databases.splice(0)) db.close();
});
function service(pages = {} as never) {
  const db = openDb(":memory:");
  databases.push(db);
  const repo = new Repo(db);
  return new OperationService({
    repo,
    events: new EventBus(repo),
    pages,
    egressAllowlist: () => ["127.0.0.1"],
  });
}

it("does not redispatch a session mutation after an ambiguous browser transport error", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const execute = vi.fn(async () => {
    throw new Error("response lost after dispatch");
  });
  const s = service({
    get: () => ({ url: "http://127.0.0.1/page" }),
    execute,
  } as never);
  s.saveRequestImpl({
    siteKey: "127.0.0.1",
    name: "write",
    method: "POST",
    url: "http://127.0.0.1/write",
    validated: true,
  });
  const result = await s.invoke({ siteKey: "127.0.0.1", name: "write", pageId: "p1" });
  expect(result.status).toBe("failed");
  expect(result.error).toContain("response lost");
  expect(execute).toHaveBeenCalledTimes(1);
  expect(fetch).not.toHaveBeenCalled();
});

it("does not automatically follow redirects before per-hop authorization exists", async () => {
  let escaped = 0;
  const server = createServer((req, res) => {
    if (req.url === "/redirect") {
      res.writeHead(302, { location: "/escaped" });
      res.end();
    } else {
      escaped++;
      res.end("{}");
    }
  });
  servers.push(server);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address() as { port: number };
  const siteKey = `127.0.0.1:${address.port}`;
  const s = service();
  s.saveRequestImpl({
    siteKey,
    name: "redirect",
    url: `http://127.0.0.1:${address.port}/redirect`,
    validated: true,
  });
  expect((await s.invoke({ siteKey, name: "redirect" })).status).toBe("failed");
  expect(escaped).toBe(0);
});
