import { describe, it, expect } from "vitest";
import { executeProgram } from "@vector/runtime";
import type { DriverPage } from "@vector/browser-driver";
import type { Condition, Program, ProgramNode } from "@vector/contracts";

/** Same minimal fake DriverPage as executor.test.ts — duplicated to stay self-contained. */
function fakePage() {
  const calls: string[] = [];
  const page: DriverPage = {
    identity: { pageId: "p1", targetId: "t1", backend: "vector" },
    url: () => "http://x.test/",
    title: async () => "Fake",
    isAttached: () => true,
    navigate: async (url) => { calls.push(`navigate:${url}`); },
    back: async () => { calls.push("back"); },
    forward: async () => {},
    reload: async () => { calls.push("reload"); },
    stop: async () => {},
    click: async (t) => { calls.push(`click:${t}`); },
    dblclick: async () => {},
    hover: async () => {},
    fill: async (t, v) => { calls.push(`fill:${t}=${v}`); },
    typeText: async () => {},
    press: async () => {},
    check: async () => {},
    uncheck: async () => {},
    select: async () => {},
    scroll: async () => {},
    dragTo: async () => {},
    clickPoint: async () => {},
    uploadFiles: async () => {},
    waitFor: async (_c: Condition) => ({ ok: true, timedOut: false }),
    waitForDownload: async () => ({ suggestedFilename: "f.txt", path: "/tmp/f.txt" }),
    collectScroll: async () => ({ items: [], collected: 0 }),
    handleDialog: async () => {},
    screenshot: async () => ({ buffer: Buffer.from("png"), width: 1, height: 1, scale: 1 }),
    observe: async () => ({}) as never,
    expandRef: async () => [],
    extract: async (fields) => {
      calls.push(`extract:${fields.length}`);
      return Object.fromEntries(fields.map((f) => [f.name, `v-${f.name}`]));
    },
    evaluate: async () => 1,
    setEvents: () => {},
    dispose: async () => {},
  };
  return { page, calls };
}

const prog = (nodes: ProgramNode[], extra: Partial<Program> = {}): Program => ({
  pageId: "p1",
  nodes,
  ...extra,
});

describe("node interpreter", () => {
  it("runs step nodes and binds extract output", async () => {
    const { page, calls } = fakePage();
    const res = await executeProgram(page, prog([
      { kind: "step", step: { id: "s1", op: "extract", fields: [{ name: "count" }], as: "data" } },
      { kind: "return", value: { variable: "data" } },
    ]));
    expect(res.status).toBe("completed");
    expect(res.extracted?.data).toEqual({ count: "v-count" });
    expect(res.returnValue).toEqual({ count: "v-count" });
    expect(calls).toEqual(["extract:1"]);
  });

  it("resolves inputs, literals, and variable paths", async () => {
    const { page, calls } = fakePage();
    const res = await executeProgram(page, prog([
      { kind: "let", name: "who", value: { input: "name" } },
      { kind: "let", name: "greeting", value: { literal: "hello" } },
      { kind: "step", step: { id: "f1", op: "fill", target: "r1", value: "x" } },
      { kind: "emit", label: "done", value: { variable: "who" } },
      { kind: "return", value: { variable: "who" } },
    ], { inputs: { name: "Robert" } }));
    expect(res.status).toBe("completed");
    expect(res.returnValue).toBe("Robert");
    expect(res.emitted).toEqual(["Robert"]);
    expect(calls).toContain("fill:r1=x");
  });

  it("if/then/else branches on predicates", async () => {
    const { page, calls } = fakePage();
    const res = await executeProgram(page, prog([
      { kind: "let", name: "n", value: { literal: 5 } },
      {
        kind: "if",
        when: { op: "gt", a: { variable: "n" }, b: { literal: 3 } },
        then: [{ kind: "step", step: { id: "t1", op: "click", target: "yes" } }],
        else: [{ kind: "step", step: { id: "t2", op: "click", target: "no" } }],
      },
    ]));
    expect(res.status).toBe("completed");
    expect(calls).toEqual(["click:yes"]);
  });

  it("forEach iterates with item/index binding and honors maxItems", async () => {
    const { page, calls } = fakePage();
    const res = await executeProgram(page, prog([
      {
        kind: "forEach",
        items: { literal: ["a", "b", "c", "d"] },
        itemName: "it",
        indexName: "i",
        maxItems: 3,
        body: [{ kind: "emit", value: { variable: "it" } }],
      },
    ]));
    expect(res.status).toBe("completed");
    expect(res.emitted).toEqual(["a", "b", "c"]);
    void calls;
  });

  it("until loops until predicate true — bounded by maxIterations", async () => {
    const { page } = fakePage();
    let n = 0;
    page.evaluate = async () => ++n;
    const res = await executeProgram(page, prog([
      {
        kind: "until",
        maxIterations: 10,
        until: { op: "gte", a: { variable: "n" }, b: { literal: 3 } },
        body: [
          { kind: "step", step: { id: "e", op: "evaluate", expression: "n++" } },
          { kind: "let", name: "n", value: { eval: "inputs === undefined ? 0 : 0" } },
        ],
      },
    ]), { allowEval: true });
    // `let` writes env var from eval — the body sets n via eval on vars? Here we
    // just verify the bound kicks in: n never reaches 3 via this body, so it
    // must hit maxIterations and fail.
    expect(res.status).toBe("failed");
    expect(res.error).toMatch(/iteration bound/);
  });

  it("until exits when the predicate turns true", async () => {
    const { page } = fakePage();
    const res = await executeProgram(page, prog([
      {
        kind: "until",
        maxIterations: 20,
        until: { op: "gte", a: { variable: "i" }, b: { literal: 3 } },
        body: [{ kind: "let", name: "i", value: { eval: "vars.i === undefined ? 1 : vars.i + 1" } }],
      },
      { kind: "return", value: { variable: "i" } },
    ]), { allowEval: true });
    expect(res.status).toBe("completed");
    expect(res.returnValue).toBe(3);
  });

  it("observe binds the observation content under saveAs", async () => {
    const { page } = fakePage();
    const res = await executeProgram(page, prog([
      { kind: "observe", scope: "forms", saveAs: "snap" },
      { kind: "return", value: { variable: "snap.title" } },
    ]), {
      observe: async (req) => {
        expect(req.scope).toBe("forms");
        return { title: "Snap Title", revision: 7 };
      },
    });
    expect(res.status).toBe("completed");
    expect(res.returnValue).toBe("Snap Title");
  });

  it("assert fails the program with its message", async () => {
    const { page } = fakePage();
    const res = await executeProgram(page, prog([
      { kind: "let", name: "x", value: { literal: 1 } },
      { kind: "assert", check: { op: "eq", a: { variable: "x" }, b: { literal: 2 } }, message: "x must be 2" },
    ]));
    expect(res.status).toBe("failed");
    expect(res.error).toBe("x must be 2");
  });

  it("call dispatches to the operation hook and binds saveAs", async () => {
    const { page } = fakePage();
    const res = await executeProgram(page, prog([
      { kind: "call", operation: "state.get", args: { key: { literal: "k1" } }, saveAs: "st" },
      { kind: "return", value: { variable: "st.v" } },
    ]), {
      callOperation: async (name, args) => {
        expect(name).toBe("state.get");
        expect(args.key).toBe("k1");
        return { v: 42 };
      },
    });
    expect(res.status).toBe("completed");
    expect(res.returnValue).toBe(42);
  });

  it("optional call failure does not fail the program", async () => {
    const { page } = fakePage();
    const res = await executeProgram(page, prog([
      { kind: "call", operation: "missing.op", optional: true },
      { kind: "return", value: { literal: "survived" } },
    ]), { callOperation: async () => { throw new Error("nope"); } });
    expect(res.status).toBe("completed");
    expect(res.returnValue).toBe("survived");
  });

  it("checkpoint records names via the hook", async () => {
    const { page } = fakePage();
    const seen: string[] = [];
    const res = await executeProgram(page, prog([
      { kind: "checkpoint", name: "before" },
      { kind: "checkpoint", name: "after" },
    ]), { checkpoint: (name) => { seen.push(name); } });
    expect(res.status).toBe("completed");
    expect(seen).toEqual(["before", "after"]);
    expect(res.checkpoints).toEqual(["before", "after"]);
  });

  it("node budget is enforced", async () => {
    const { page } = fakePage();
    const res = await executeProgram(page, prog([
      { kind: "let", name: "a", value: { literal: 1 } },
      { kind: "let", name: "b", value: { literal: 2 } },
      { kind: "let", name: "c", value: { literal: 3 } },
    ], { budget: { maxNodes: 2 } }));
    expect(res.status).toBe("failed");
    expect(res.error).toMatch(/node budget/);
  });

  it("eval exprs are rejected when allowEval is off", async () => {
    const { page } = fakePage();
    const res = await executeProgram(page, prog([
      { kind: "let", name: "x", value: { eval: "1+1" } },
    ]), { allowEval: false });
    expect(res.status).toBe("failed");
    expect(res.error).toMatch(/disabled/);
  });

  it("abort signal cancels mid-program", async () => {
    const { page } = fakePage();
    const ctl = new AbortController();
    ctl.abort();
    const res = await executeProgram(page, prog([
      { kind: "step", step: { id: "s", op: "reload" } },
      { kind: "step", step: { id: "t", op: "stop" } },
    ]), { signal: ctl.signal });
    expect(res.status).toBe("cancelled");
  });

  it("§7.1 forEach concurrency runs bounded parallel batches with isolated vars", async () => {
    const { page, calls } = fakePage();
    const res = await executeProgram(page, prog([
      {
        kind: "forEach", items: { literal: [1, 2, 3, 4] }, itemName: "n",
        concurrency: 2,
        body: [
          { kind: "let", name: "local", value: { variable: "n" } },
          { kind: "step", step: { id: "c", op: "click", target: "r1" } },
          { kind: "emit", value: { variable: "local" } },
        ],
      },
      { kind: "return", value: { variable: "local" } },
    ]));
    expect(res.status).toBe("completed");
    expect(calls.filter((c) => c.startsWith("click"))).toHaveLength(4);
    // per-item emission survived; a `let` inside a parallel body stays local
    expect(res.emitted?.sort()).toEqual([1, 2, 3, 4]);
    expect(res.returnValue).toBeUndefined();
  });

  it("§7.7 resumeFrom restores the checkpoint env and skips prior nodes", async () => {
    const { page, calls } = fakePage();
    const savedCkpt: Record<string, { vars?: Record<string, unknown> }> = {
      midway: { vars: { n: 41 } },
    };
    const res = await executeProgram(page, prog([
      { kind: "step", step: { id: "before", op: "click", target: "r1" } },
      { kind: "checkpoint", name: "midway" },
      { kind: "step", step: { id: "after", op: "fill", target: "r2", value: "x" } },
      { kind: "return", value: { variable: "n" } },
    ], { resumeFrom: "midway" }), {
      loadCheckpoint: (name) => savedCkpt[name],
    });
    expect(res.status).toBe("completed");
    // the click BEFORE the checkpoint never ran; the fill after it did
    expect(calls).toEqual(["fill:r2=x"]);
    expect(res.returnValue).toBe(41); // env restored from the checkpoint
  });

  it("§7.7 resumeFrom fails explicitly when the checkpoint is unknown", async () => {
    const { page } = fakePage();
    const res = await executeProgram(page, prog([
      { kind: "checkpoint", name: "other" },
    ], { resumeFrom: "midway" }), {
      loadCheckpoint: (name) => (name === "midway" ? { vars: {} } : undefined),
    });
    expect(res.status).toBe("failed");
    expect(res.error).toMatch(/checkpoint "midway" not found/);
  });
});
