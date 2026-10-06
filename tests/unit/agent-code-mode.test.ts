import { describe, expect, it } from "vitest";
import { AgentCodeMode } from "../../apps/runtime/src/agent/code-mode.js";
import { DEFAULT_AGENT_MODEL_ROUTES, agentModelRoute, supportedAgentApi, agentApiDocs } from "@aux/contracts";
import { AuxError } from "@aux/contracts";

const caller = { external: true, connectionId: "test-connection" };

describe("manifest-backed code mode", () => {
  it("never dispatches person approval or grant operations even from an internal-person code session", async () => {
    const calls: string[] = [];
    const mode = new AgentCodeMode(async (method) => {
      calls.push(method);
      throw new Error("A person-only safety operation must not reach host dispatch");
    });
    try {
      for (const path of [
        "safety.approvals.pending",
        "safety.approvals.decide",
        "safety.grants.list",
        "safety.grants.revoke",
        "safety.originPolicies.set",
      ]) {
        const result = await mode.run(
          { code: `JSON.parse(aux_call(${JSON.stringify(path)}, '{}'))` },
          { external: false },
        );
        expect(result.value).toEqual({ ok: false, error: `Unsupported Aux API member: ${path}` });
      }
      expect(calls).toEqual([]);
    } finally {
      mode.disposeAll();
    }
  });

  it("projects supported members and frontier routes by role", () => {
    expect(supportedAgentApi({ surface: "code" }).some((entry) => entry.path === "tabs.ax.write")).toBe(
      false,
    );
    expect(
      supportedAgentApi({
        surface: "code",
        capabilities: new Set(["ax"]),
        apiSupportOverrides: { "tabs.ax.write": true },
      }).some((entry) => entry.path === "tabs.ax.write"),
    ).toBe(true);
    expect(agentApiDocs({ surface: "code" }, "included")).toContain("tabs.dom.execute");
    expect(agentApiDocs({ surface: "code" }, "lookup", "visual")).toContain("tabs.cua.execute");
    expect(agentApiDocs({ surface: "code" }, "lookup")).toContain("tabs.dialog");
    expect(agentApiDocs({ surface: "code" }, "lookup", "debugging")).toContain("tabs.dev.logs");
    expect(new Set(Object.values(DEFAULT_AGENT_MODEL_ROUTES).map((route) => route.modelId))).toEqual(
      new Set(["anthropic/claude-haiku-4.5", "anthropic/claude-sonnet-5.5", "anthropic/claude-opus-5.5"]),
    );
    expect(agentModelRoute("deep").reasoning).toBe("high");
  });
  it("uses typed host contracts for dialog inspection and development logs", async () => {
    const calls: string[] = [];
    const mode = new AgentCodeMode(async (method) => {
      calls.push(method);
      if (method === "pages.dialog")
        return { action: "list", dialogs: [{ type: "confirm", message: "Continue?" }], pending: null };
      if (method === "pages.console") return { lines: [{ level: "warning", message: "retry", atMs: 1 }] };
      throw new Error("unexpected method");
    });
    try {
      const result = await mode.run(
        { code: "[aux.tabs.dialog({pageId:'p1',action:'list'}),aux.tabs.dev.logs({pageId:'p1',limit:10})]" },
        caller,
      );
      expect(result.value).toEqual([
        { action: "list", dialogs: [{ type: "confirm", message: "Continue?" }], pending: null },
        { lines: [{ level: "warning", message: "retry", atMs: 1 }] },
      ]);
      expect(calls).toEqual(["pages.dialog", "pages.console"]);
    } finally {
      mode.disposeAll();
    }
  });
  it("runs in QuickJS, preserves one session, and passes the caller through every host call", async () => {
    const calls: { method: string; params: unknown; client: unknown }[] = [];
    const mode = new AgentCodeMode(async (method, params, client) => {
      calls.push({ method, params, client });
      if (method === "pages.list") return [];
      throw new Error("unexpected method");
    });
    try {
      expect(
        (
          await mode.run(
            { code: "globalThis.count = (globalThis.count || 0) + 1; [count, aux.tabs.list({})]" },
            caller,
          )
        ).value,
      ).toEqual([1, []]);
      expect((await mode.run({ code: "globalThis.count += 1; count" }, caller)).value).toBe(2);
      expect(calls).toEqual([{ method: "pages.list", params: {}, client: { ...caller, codeMode: true } }]);
      expect(await mode.reset(caller)).toEqual({ reset: true });
      expect((await mode.run({ code: "typeof globalThis.count" }, caller)).value).toBe("undefined");
    } finally {
      mode.disposeAll();
    }
  });

  it("isolates concurrent async host calls in different code sessions", async () => {
    let entered = 0;
    let release!: () => void;
    const barrier = new Promise<void>((resolve) => {
      release = resolve;
    });
    const mode = new AgentCodeMode(async (method) => {
      expect(method).toBe("pages.list");
      if (++entered === 2) release();
      await barrier;
      return [];
    });
    try {
      const results = await Promise.all([
        mode.run({ sessionId: "first", code: "globalThis.marker='A'; aux.tabs.list({}); marker" }, caller),
        mode.run({ sessionId: "second", code: "globalThis.marker='B'; aux.tabs.list({}); marker" }, caller),
      ]);
      expect(results.map((result) => result.value)).toEqual(["A", "B"]);
      expect(entered).toBe(2);
    } finally {
      release();
      mode.disposeAll();
    }
  });

  it("evicts the oldest idle session while preserving newer session state", async () => {
    const mode = new AgentCodeMode(async () => []);
    try {
      for (let index = 0; index < 9; index++)
        await mode.run({ sessionId: `session-${index}`, code: `globalThis.marker=${index}` }, caller);
      expect((await mode.run({ sessionId: "session-8", code: "marker" }, caller)).value).toBe(8);
      expect((await mode.run({ sessionId: "session-0", code: "typeof marker" }, caller)).value).toBe(
        "undefined",
      );
    } finally {
      mode.disposeAll();
    }
  });

  it("keeps active and queued sessions alive while the idle cache is full", async () => {
    let entered = 0;
    let enteredAll!: () => void;
    const allActive = new Promise<void>((resolve) => {
      enteredAll = resolve;
    });
    let release!: () => void;
    const barrier = new Promise<void>((resolve) => {
      release = resolve;
    });
    const mode = new AgentCodeMode(async () => {
      if (++entered === 9) enteredAll();
      await barrier;
      return [];
    });
    const active = Array.from({ length: 9 }, (_, index) =>
      mode.run(
        {
          sessionId: `active-${index}`,
          code: `globalThis.marker=${index}; aux.tabs.list({}); marker`,
        },
        caller,
      ),
    );
    try {
      await allActive;
      const queued = mode.run({ sessionId: "active-0", code: "marker += 10; marker" }, caller);
      release();
      expect((await Promise.all(active)).map((result) => result.value)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
      expect((await queued).value).toBe(10);
    } finally {
      release();
      await Promise.allSettled(active);
      mode.disposeAll();
    }
  });

  it("hides unsupported members and routes every action through the host dispatcher", async () => {
    const calls: string[] = [];
    const mode = new AgentCodeMode(async (method) => {
      calls.push(method);
      if (method === "pages.execute") return { status: "completed", steps: [], extracted: {} };
      throw new Error("unexpected method");
    });
    try {
      expect(
        (await mode.run({ code: "typeof aux.tabs.ax + ':' + typeof process + ':' + typeof require" }, caller))
          .value,
      ).toBe("undefined:undefined:undefined");
      await expect(
        mode.run(
          { code: "aux.tabs.dom.execute({program:{pageId:'page',steps:[{id:'s',op:'click',target:'r1'}]}})" },
          caller,
        ),
      ).resolves.toMatchObject({ value: { status: "completed" } });
      expect(calls).toEqual(["pages.execute"]);
    } finally {
      mode.disposeAll();
    }
  });

  it("stops CPU loops at the deadline and refuses unsupported host handles", async () => {
    const mode = new AgentCodeMode(async () => {
      throw new Error("host must not be called");
    });
    try {
      expect(
        (await mode.run({ code: "JSON.parse(aux_call('tabs.ax.observe','{}')).ok" }, caller)).value,
      ).toBe(false);
      await expect(mode.run({ code: "while (true) {}", deadlineMs: 100 }, caller)).rejects.toThrow(
        /Code mode failed/,
      );
    } finally {
      mode.disposeAll();
    }
  });

  it("preserves typed host errors and hides unexpected host diagnostics", async () => {
    const mode = new AgentCodeMode(async (method) => {
      if (method === "pages.list") throw new AuxError("permission_denied", "This page needs a grant.");
      throw new Error("private host diagnostic: secret-token");
    });
    try {
      await expect(mode.run({ code: "aux.tabs.list({})" }, caller)).rejects.toMatchObject({
        code: "permission_denied",
        message: "This page needs a grant.",
      });
      await expect(
        mode.run({ code: "aux.tabs.dev.logs({pageId:'p1',limit:10})" }, caller),
      ).rejects.toMatchObject({
        code: "internal",
        message: "Aux host call failed.",
      });
      await expect(
        mode.run({ code: "throw new Error('ordinary script failure')" }, caller),
      ).rejects.toMatchObject({
        code: "invalid_params",
        message: expect.stringContaining("ordinary script failure"),
      });
    } finally {
      mode.disposeAll();
    }
  });
});
