import { describe, expect, it } from "vitest";
import { AgentCodeMode } from "../../apps/runtime/src/agent/code-mode.js";
import { DEFAULT_AGENT_MODEL_ROUTES, agentModelRoute, supportedAgentApi, agentApiDocs } from "@aux/contracts";

const caller = { external: true, connectionId: "test-connection" };

describe("manifest-backed code mode", () => {
  it("projects supported members and one Contributor model across all roles", () => {
    expect(supportedAgentApi({ surface: "code" }).some(entry => entry.path === "tabs.ax.write")).toBe(false);
    expect(supportedAgentApi({ surface: "code", capabilities: new Set(["ax"]), apiSupportOverrides: { "tabs.ax.write": true } }).some(entry => entry.path === "tabs.ax.write")).toBe(true);
    expect(agentApiDocs({ surface: "code" }, "included")).toContain("tabs.dom.execute");
    expect(agentApiDocs({ surface: "code" }, "lookup", "visual")).toContain("tabs.cua.execute");
    expect(agentApiDocs({ surface: "code" }, "lookup")).toContain("tabs.dialog");
    expect(agentApiDocs({ surface: "code" }, "lookup", "debugging")).toContain("tabs.dev.logs");
    expect(new Set(Object.values(DEFAULT_AGENT_MODEL_ROUTES).map(route => route.modelId))).toEqual(new Set(["meta/muse-spark-1.3-contributor"]));
    expect(agentModelRoute("deep").reasoning).toBe("xhigh");
  });
  it("uses typed host contracts for dialog inspection and development logs", async () => {
    const calls: string[] = [];
    const mode = new AgentCodeMode(async method => {
      calls.push(method);
      if (method === "pages.dialog") return { action: "list", dialogs: [{ type: "confirm", message: "Continue?" }], pending: null };
      if (method === "pages.console") return { lines: [{ level: "warning", message: "retry", atMs: 1 }] };
      throw new Error("unexpected method");
    });
    try {
      const result = await mode.run({ code: "[aux.tabs.dialog({pageId:'p1',action:'list'}),aux.tabs.dev.logs({pageId:'p1',limit:10})]" }, caller);
      expect(result.value).toEqual([{ action: "list", dialogs: [{ type: "confirm", message: "Continue?" }], pending: null },
        { lines: [{ level: "warning", message: "retry", atMs: 1 }] }]);
      expect(calls).toEqual(["pages.dialog", "pages.console"]);
    } finally { mode.disposeAll(); }
  });
  it("runs in QuickJS, preserves one session, and passes the caller through every host call", async () => {
    const calls: { method: string; params: unknown; client: unknown }[] = [];
    const mode = new AgentCodeMode(async (method, params, client) => {
      calls.push({ method, params, client });
      if (method === "pages.list") return [];
      throw new Error("unexpected method");
    });
    try {
      expect((await mode.run({ code: "globalThis.count = (globalThis.count || 0) + 1; [count, aux.tabs.list({})]" }, caller)).value).toEqual([1, []]);
      expect((await mode.run({ code: "globalThis.count += 1; count" }, caller)).value).toBe(2);
      expect(calls).toEqual([{ method: "pages.list", params: {}, client: { ...caller, codeMode: true } }]);
      expect(await mode.reset(caller)).toEqual({ reset: true });
      expect((await mode.run({ code: "typeof globalThis.count" }, caller)).value).toBe("undefined");
    } finally { mode.disposeAll(); }
  });

  it("hides unsupported members and routes every action through the host dispatcher", async () => {
    const calls: string[] = [];
    const mode = new AgentCodeMode(async (method) => {
      calls.push(method);
      if (method === "pages.execute") return { status: "completed", steps: [], extracted: {} };
      throw new Error("unexpected method");
    });
    try {
      expect((await mode.run({ code: "typeof aux.tabs.ax + ':' + typeof process + ':' + typeof require" }, caller)).value).toBe("undefined:undefined:undefined");
      await expect(mode.run({ code: "aux.tabs.dom.execute({program:{pageId:'page',steps:[{id:'s',op:'click',target:'r1'}]}})" }, caller)).resolves.toMatchObject({ value: { status: "completed" } });
      expect(calls).toEqual(["pages.execute"]);
    } finally { mode.disposeAll(); }
  });

  it("stops CPU loops at the deadline and refuses unsupported host handles", async () => {
    const mode = new AgentCodeMode(async () => { throw new Error("host must not be called"); });
    try {
      expect((await mode.run({ code: "JSON.parse(aux_call('tabs.ax.observe','{}')).ok" }, caller)).value).toBe(false);
      await expect(mode.run({ code: "while (true) {}", deadlineMs: 100 }, caller)).rejects.toThrow(/Code mode failed/);
    } finally { mode.disposeAll(); }
  });
});
