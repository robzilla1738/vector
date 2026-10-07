import { expect, it, vi } from "vitest";
import { AuxError } from "@aux/contracts";
import { CloudReplClient } from "../../apps/runtime/src/services/cloud-repl-client.js";
import type { ReplHostDeps } from "../../apps/runtime/src/agent/loop/repl.js";

it("checks the profile before dispatching a cloud VM callback", async () => {
  const files = new Map<string, Buffer>();
  let request: { id: string };
  let reply: { error?: string } | undefined;
  const openTab = vi.fn(async () => ({ output: null }));
  const client = new CloudReplClient({
    initialize: async () => {},
    current: async () => {},
    read: async (path) => files.get(path) ?? null,
    write: async (path, bytes) => {
      files.set(path, bytes);
      const directory = path.slice(0, path.lastIndexOf("/"));
      if (path.includes("/request-") && path.endsWith(".payload")) {
        request = JSON.parse(bytes.toString("utf8"));
        files.set(
          `${directory}/rpc-${request.id}-0.json`,
          Buffer.from(
            JSON.stringify({
              id: request.id,
              sequence: 0,
              method: "openTab",
              args: ["https://example.com"],
            }),
          ),
        );
      }
      if (path.includes("/reply-") && path.endsWith(".payload")) {
        reply = JSON.parse(bytes.toString("utf8"));
        files.set(
          `${directory}/result-${request.id}.json`,
          Buffer.from(JSON.stringify({ value: { output: "handled" } })),
        );
      }
    },
  });
  const deps: ReplHostDeps = {
    runId: "profile-run",
    openTab,
    tabs: async () => [],
    closeTab: async () => {},
    useTab: async (pageId) => ({ pageId, title: "", url: "https://example.com", active: true, owned: false }),
    observe: async () => ({}),
    capture: async () => ({ width: 1, height: 1 }),
    step: async () => ({ output: null }),
    fetch: async () => ({ output: null }),
    allowHostCall: (name: string) => {
      if (name === "openTab") throw new AuxError("permission_denied", "Read-only profile forbids writes.");
    },
  };
  expect(await client.eval(deps, "await openTab('https://example.com')")).toEqual({ output: "handled" });
  expect(reply?.error).toContain("profile forbids writes");
  expect(openTab).not.toHaveBeenCalled();
});
