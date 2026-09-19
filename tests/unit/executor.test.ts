import { describe, it, expect } from "vitest";
import { executeProgram } from "@vector/runtime";
import type { DriverPage } from "@vector/engine-client";
import { VectorError, type Condition, type Program } from "@vector/contracts";

/** Minimal fake DriverPage — records calls, configurable failures. */
function fakePage(failOn: Record<string, unknown> = {}) {
  const calls: string[] = [];
  const page: DriverPage = {
    identity: { pageId: "p1", targetId: "t1", backend: "vector" },
    url: () => "http://x.test/",
    title: async () => "Fake",
    isAttached: () => true,
    navigate: async (url) => { calls.push(`navigate:${url}`); if (failOn.navigate) throw failOn.navigate; },
    back: async () => { calls.push("back"); },
    forward: async () => { calls.push("forward"); },
    reload: async () => { calls.push("reload"); },
    stop: async () => { calls.push("stop"); },
    click: async (t) => { calls.push(`click:${t}`); if (failOn.click) throw failOn.click; },
    dblclick: async (t) => { calls.push(`dblclick:${t}`); },
    hover: async (t) => { calls.push(`hover:${t}`); },
    fill: async (t, v) => { calls.push(`fill:${t}=${v}`); if (failOn.fill) throw failOn.fill; },
    typeText: async (t, v) => { calls.push(`type:${t}=${v}`); },
    press: async (k) => { calls.push(`press:${k}`); },
    check: async (t) => { calls.push(`check:${t}`); },
    uncheck: async (t) => { calls.push(`uncheck:${t}`); },
    select: async (t, v) => { calls.push(`select:${t}=${v}`); if (failOn.select) throw failOn.select; },
    scroll: async (o) => { calls.push(`scroll:${o.direction}`); },
    dragTo: async (t, to) => { calls.push(`drag:${t}->${to}`); },
    clickPoint: async (x, y) => { calls.push(`clickPoint:${x},${y}`); },
    uploadFiles: async (t, f) => { calls.push(`upload:${t}:${f.length}`); },
    waitFor: async (c: Condition) => {
      calls.push(`waitFor:${c.kind}`);
      if (failOn.waitFor) return { ok: false, timedOut: true, detail: "never happened" };
      return { ok: true, timedOut: false };
    },
    waitForDownload: async () => ({ suggestedFilename: "f.txt", path: "/tmp/f.txt" }),
    collectScroll: async (o) => {
      calls.push(`collectScroll:${o.item}`);
      return { items: [{ text: "row-1" }, { text: "row-2" }], collected: 2 };
    },
    handleDialog: async (a) => { calls.push(`dialog:${a}`); },
    screenshot: async () => ({ buffer: Buffer.from("png"), width: 100, height: 50, scale: 1 }),
    observe: async () => ({}) as never,
    expandRef: async () => [],
    extract: async (fields) => {
      calls.push(`extract:${fields.length}`);
      if (failOn.extract) throw failOn.extract;
      return Object.fromEntries(fields.map((f) => [f.name, `v-${f.name}`]));
    },
    evaluate: async (e) => { calls.push(`eval:${e}`); return 42; },
    setEvents: () => {},
    dispose: async () => {},
  };
  return { page, calls };
}

describe("executeProgram", () => {
  it("runs steps in order and reports outcomes", async () => {
    const { page, calls } = fakePage();
    const program: Program = {
      pageId: "p1",
      steps: [
        { id: "s1", op: "navigate", url: "http://x.test/a" },
        { id: "s2", op: "click", target: "r1" },
        { id: "s3", op: "extract", fields: [{ name: "title" }], as: "data" },
      ],
    };
    const res = await executeProgram(page, program);
    expect(res.status).toBe("completed");
    expect(res.steps.map((s) => s.status)).toEqual(["ok", "ok", "ok"]);
    expect(res.extracted?.data).toEqual({ title: "v-title" });
    expect(calls).toEqual(["navigate:http://x.test/a", "click:r1", "extract:1"]);
    expect(res.steps[1]?.receipt?.uncertain).toBe(true);
    expect(res.steps[1]?.receipt?.remoteConfirmed).toBe(false);
    expect(res.steps[0]?.receipt?.uncertain).toBe(true);
  });

  it("stops on failure unless step is optional", async () => {
    const { page } = fakePage({ click: new VectorError("step_failed", "nope") });
    const program: Program = {
      pageId: "p1",
      steps: [
        { id: "s1", op: "click", target: "r1" },
        { id: "s2", op: "reload" },
      ],
    };
    const res = await executeProgram(page, program);
    expect(res.status).toBe("failed");
    expect(res.steps).toHaveLength(1); // s2 never ran
    expect(res.steps[0]?.error?.code).toBe("step_failed");
  });

  it("continues past optional failures", async () => {
    const { page } = fakePage({ click: new Error("flaky") });
    const res = await executeProgram(page, {
      pageId: "p1",
      steps: [
        { id: "s1", op: "click", target: "r1", optional: true },
        { id: "s2", op: "reload" },
      ],
    });
    expect(res.status).toBe("completed");
    expect(res.steps.map((s) => s.status)).toEqual(["failed", "ok"]);
  });

  it("verifies expect conditions after the step", async () => {
    const { page, calls } = fakePage();
    const res = await executeProgram(page, {
      pageId: "p1",
      steps: [
        { id: "s1", op: "click", target: "r1", expect: [{ kind: "selector", selector: "#ok", state: "visible" }] },
      ],
    });
    expect(res.status).toBe("completed");
    expect(calls).toEqual(["click:r1", "waitFor:selector"]);
  });

  it("fails the step when an expect condition times out", async () => {
    const { page } = fakePage({ waitFor: true });
    const res = await executeProgram(page, {
      pageId: "p1",
      steps: [{ id: "s1", op: "click", target: "r1", expect: [{ kind: "textVisible", text: "Saved" }] }],
    });
    expect(res.status).toBe("failed");
    expect(res.steps[0]?.error?.code).toBe("condition_timeout");
  });

  it("rejects mismatched pageId and duplicate step ids", async () => {
    const { page } = fakePage();
    await expect(executeProgram(page, { pageId: "other", steps: [{ id: "a", op: "reload" }] })).rejects.toMatchObject({ code: "invalid_params" });
    await expect(
      executeProgram(page, { pageId: "p1", steps: [{ id: "a", op: "reload" }, { id: "a", op: "stop" }] }),
    ).rejects.toMatchObject({ code: "invalid_params" });
  });

  it("expectDownload arms the waiter across the trigger step", async () => {
    const { page, calls } = fakePage();
    const order: string[] = [];
    // download resolves only AFTER the click runs — prove the waiter was armed first
    page.waitForDownload = async () => {
      order.push("wait-armed");
      await new Promise((r) => setTimeout(r, 5));
      if (!order.includes("click")) throw new VectorError("condition_timeout", "waiter armed before trigger");
      order.push("download-resolved");
      return { suggestedFilename: "f.txt", path: "/tmp/f.txt" };
    };
    const origClick = page.click;
    page.click = async (t, b, to) => { order.push("click"); return origClick(t, b, to); };
    const res = await executeProgram(page, {
      pageId: "p1",
      steps: [
        { id: "d0", op: "expectDownload", timeoutMs: 2000 },
        { id: "c1", op: "click", target: "r8" },
      ],
    });
    expect(res.status).toBe("completed");
    expect(order).toEqual(["wait-armed", "click", "download-resolved"]);
    const dl = res.steps.find((s) => s.op === "expectDownload");
    expect(dl?.status).toBe("ok");
    expect(dl?.extracted?.downloaded).toBe("f.txt");
    expect(calls).toContain("click:r8");
  });

  it("expectDownload as the last step fails with a clear error", async () => {
    const { page } = fakePage();
    const res = await executeProgram(page, {
      pageId: "p1",
      steps: [{ id: "d0", op: "expectDownload", timeoutMs: 100 }],
    });
    expect(res.status).toBe("failed");
    expect(res.steps[0]?.error?.code).toBe("invalid_params");
  });

  it("collectScroll returns deduped items as extracted values", async () => {
    const { page, calls } = fakePage();
    const res = await executeProgram(page, {
      pageId: "p1",
      steps: [{ id: "c1", op: "collectScroll", item: ".row", key: "data-id", limit: 50, as: "rows" }],
    });
    expect(res.status).toBe("completed");
    expect(calls).toContain("collectScroll:.row");
    const detail = res.steps[0]?.extracted as { items: { text: string }[]; count: number };
    expect(detail.items).toHaveLength(2);
    expect(detail.count).toBe(2);
    const all = res.extracted?.rows as { items: { text: string }[]; count: number };
    expect(all.items).toHaveLength(2);
  });

  it("marks remaining steps skipped after abort", async () => {
    const { page } = fakePage();
    const ctl = new AbortController();
    ctl.abort();
    const res = await executeProgram(page, { pageId: "p1", steps: [{ id: "a", op: "reload" }, { id: "b", op: "stop" }] }, { signal: ctl.signal });
    expect(res.status).toBe("cancelled");
    expect(res.steps.every((s) => s.status === "skipped")).toBe(true);
  });
});
