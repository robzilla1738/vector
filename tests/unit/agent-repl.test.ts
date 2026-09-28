import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AuxError } from "@aux/contracts";
import { ReplPool, type ReplHostDeps, type LoopToolResult } from "@aux/runtime";

const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const fn of cleanup.splice(0).reverse()) fn();
});

function deps(overrides: Partial<ReplHostDeps> = {}): ReplHostDeps {
  return {
    runId: "run-1",
    tabs: async () => [{ pageId: "p1", url: "http://x.test", title: "X", active: true, owned: false }],
    openTab: async (url) => ({ output: { pageId: "p2", url, title: "new", active: false, owned: true } }),
    closeTab: async () => {},
    useTab: async (pageId) => ({ pageId, url: "u", title: "t", active: false, owned: true }),
    observe: async () => ({ text: "obs text" }),
    capture: async () => ({
      width: 10,
      height: 10,
      elements: [{ ref: "r1", rect: { x: 0, y: 0, w: 1, h: 1 } }],
    }),
    step: async () => ({ output: { status: "completed", steps: [{ op: "click", status: "ok" }] } }),
    fetch: async (url) => ({ output: { url, text: "body" } }),
    fsRead: async (path) => `read:${path}`,
    fsWrite: async () => {},
    ...overrides,
  };
}

const out = (result: LoopToolResult) =>
  ("output" in result ? result.output : result) as Record<string, unknown>;

describe("code-mode REPL", () => {
  it("finishes a scripted read through the same verified result callback", async () => {
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    const submitResult = vi.fn(async ({ report, citations }: { report: string; citations?: { observationId?: string; quote: string }[] }) =>
      report === "Jordan Lee" && citations?.[0]?.observationId === "obs-1" && citations[0].quote === "Jordan Lee"
        ? { ok: true as const, result: { report, citations } }
        : { ok: false as const, error: "Unverifiable citation" });
    const step = vi.fn(async () => ({ output: { status: "completed" } }));
    const result = await pool.eval(deps({
      observe: async () => ({ text: "Owner: Jordan Lee", observationId: "obs-1", revision: 2 }),
      submitResult, step,
    }), `const s = snapshot(); const owner = s.text.match(/Owner: ([^\\n]+)/)[1]; submitResult(owner, [{observationId:s.observationId, quote:owner}]); page.click("r1")`, { pageId: "p1" });
    expect(result).toMatchObject({ finish: { result: { report: "Jordan Lee" } } });
    expect(submitResult).toHaveBeenCalledOnce();
    expect(step).not.toHaveBeenCalled(); // verified completion fences later effects in the script
  });

  it("keeps a rejected scripted result open for citation repair", async () => {
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    let calls = 0;
    const submitResult = async (input: { report: string }) => ++calls === 1
      ? { ok: false as const, error: "Unverifiable citation" }
      : { ok: true as const, result: { report: input.report } };
    const result = await pool.eval(deps({ submitResult }),
      `try { submitResult("wrong", []); } catch (e) {} submitResult("correct", [])`, { pageId: "p1" });
    expect(result).toMatchObject({ finish: { result: { report: "correct" } } });
    expect(calls).toBe(2);
  });

  it("evaluates guest code and returns marshaled data", async () => {
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    const result = out(await pool.eval(deps(), `1 + 1`, { pageId: "p1" }));
    expect(result.value).toBe(2);
  });

  it("persists guest state across calls in the same run", async () => {
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    await pool.eval(deps(), `var memo = 21; "stored"`, { pageId: "p1" });
    const second = out(await pool.eval(deps(), `memo * 2`, { pageId: "p1" }));
    expect(second.value).toBe(42);
  });

  it("scopes a repeated top-level let declaration without rerunning the earlier cell", async () => {
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    await pool.eval(deps(), `let s = 1; s`, { pageId: "p1" });
    const second = out(await pool.eval(deps(), `let s = 2; s`, { pageId: "p1" }));
    expect(second.value).toBe(2);
    const original = out(await pool.eval(deps(), `s`, { pageId: "p1" }));
    expect(original.value).toBe(1); // the prior handle remains available
  });

  it("accepts model-style await on synchronous host calls without changing strings", async () => {
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    const step = vi.fn(async () => ({ output: { status: "completed" } }));
    const result = out(await pool.eval(deps({
      step, observe: async () => ({ text: "await snapshot() remains text", observationId: "o1", revision: 1 }),
    }), `await page.navigate("http://x.test/next"); const s = await snapshot(); s.text`, { pageId: "p1" }));
    expect(step).toHaveBeenCalledOnce();
    expect(result.value).toBe("await snapshot() remains text");
  });

  it("compiles page.* ops to governed steps on the current page", async () => {
    const step = vi.fn(async () => ({ output: { status: "completed" } })) as unknown as ReplHostDeps["step"];
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    const result = out(await pool.eval(deps({ step }), `page.click("r1")`, { pageId: "p1" }));
    expect(step).toHaveBeenCalledWith("p1", expect.objectContaining({ op: "click", target: "r1" }));
    expect(result.value).toMatchObject({ status: "completed" });
  });

  it("resolves a named control and gives consecutive actions distinct step ids", async () => {
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    const findRef = vi.fn(async (_pageId: string, _name: string, _role?: string) => ({ ref: "r7" }));
    const step = vi.fn(async (_pageId: string, _step: unknown) => ({ output: { status: "completed" } }));
    await pool.eval(deps({ findRef, step }), `page.clickByName("Details", "button"); page.click("r8")`, { pageId: "p1" });
    expect(findRef).toHaveBeenCalledWith("p1", "Details", "button");
    expect(step).toHaveBeenCalledTimes(2);
    expect(step.mock.calls[0]![1]).toMatchObject({ op: "click", target: "r7" });
    expect((step.mock.calls[0]![1] as { id: string }).id).not.toBe((step.mock.calls[1]![1] as { id: string }).id);
  });

  it("extracts one labeled value with its observed quote and can submit it", async () => {
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    const submitResult = vi.fn(async (input: { report: string; citations?: { observationId?: string; quote: string }[] }) => ({
      ok: true as const, result: { report: input.report, citations: input.citations },
    }));
    const result = await pool.eval(deps({
      observe: async () => ({ text: "Created by the user. Internal ref rec-13.\nAttachment: notes.txt", observationId: "obs-3", revision: 3 }),
      submitResult,
    }), `page.submitLabeledValue("Internal ref")`, { pageId: "p1" });
    expect(result).toMatchObject({ finish: { result: { report: "rec-13" } } });
    expect(submitResult).toHaveBeenCalledWith({ report: "rec-13", citations: [{ observationId: "obs-3", quote: "Created by the user. Internal ref rec-13." }] });
  });

  it("refuses ambiguous labeled values instead of choosing a row", async () => {
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    const submitResult = vi.fn(async () => ({ ok: true as const, result: { report: "wrong" } }));
    await expect(pool.eval(deps({
      observe: async () => ({ text: "Owner: Jordan Lee\nOwner: Priya Patel", observationId: "obs-4", revision: 4 }),
      submitResult,
    }), `page.submitLabeledValue("Owner")`, { pageId: "p1" })).rejects.toThrow(/2/);
    expect(submitResult).not.toHaveBeenCalled();
  });

  it("yields the loop park when a page op is gated by a safety ask", async () => {
    const step = vi.fn(async () => ({
      park: { kind: "approval" as const, instruction: "Approve the click?", approvalId: "ap-1" },
    }));
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    const result = await pool.eval(deps({ step }), `page.click("r1")`, { pageId: "p1" });
    expect(result).toEqual({
      park: { kind: "approval", instruction: "Approve the click?", approvalId: "ap-1" },
    });
  });

  it("openTab returns the new tab and switches the current page", async () => {
    const step = vi.fn(async () => ({ output: { status: "completed" } })) as unknown as ReplHostDeps["step"];
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    const result = out(
      await pool.eval(deps({ step }), `const t = openTab("http://a.test"); page.hover("r9"); t.pageId`, {
        pageId: "p1",
      }),
    );
    expect(result.value).toBe("p2");
    // The page op after openTab targeted the new tab.
    expect(step).toHaveBeenCalledWith("p2", expect.objectContaining({ op: "hover", target: "r9" }));
  });

  it("routes page.bookmark through the governed host for the current tab", async () => {
    const bookmark = vi.fn(async () => ({ output: { saved: true, stepId: "bookmark-step" } }));
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    const result = out(await pool.eval(deps({ bookmark }), `page.bookmark()`, { pageId: "p1" }));
    expect(bookmark).toHaveBeenCalledWith("p1");
    expect(result.value).toMatchObject({ saved: true, stepId: "bookmark-step" });
  });

  it("denies modules, eval, process and host internals", async () => {
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    for (const bad of [
      `import "x"`,
      `export {}`,
      `require("fs")`,
      `eval("1")`,
      `new Function("return 1")()`,
      `process.env`,
      `WebAssembly`,
      `__aux_call`,
      `__aux_page = "evil"`,
    ]) {
      await expect(pool.eval(deps(), bad, { pageId: "p1" })).rejects.toThrowError(AuxError);
    }
  });

  it("rejects unmarshalable results (functions, circular)", async () => {
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    await expect(pool.eval(deps(), `(() => 1)`, { pageId: "p1" })).rejects.toThrow(/marshalable/);
    await expect(pool.eval(deps(), `const o = {}; o.self = o; o`, { pageId: "p1" })).rejects.toThrow(
      /marshalable/,
    );
  });

  it("spills >16KB output to an artifact file inside outputDir", async () => {
    const dir = mkdtempSync(join(tmpdir(), "aux-repl-"));
    cleanup.push(() => rmSync(dir, { recursive: true, force: true }));
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    const result = out(
      await pool.eval(deps({ outputDir: dir }), `JSON.stringify("x".repeat(40000))`, { pageId: "p1" }),
    );
    expect(result.truncated).toBe(true);
    const file = String(result.outputFile);
    expect(file.startsWith(dir)).toBe(true);
    expect(JSON.parse(readFileSync(file, "utf8")).value.length).toBe(40002);
  });

  it("truncates when no outputDir is configured", async () => {
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    const result = out(await pool.eval(deps(), `"y".repeat(40000)`, { pageId: "p1" }));
    expect(result.truncated).toBe(true);
    expect(String(result.preview).length).toBeLessThanOrEqual(16 * 1024 + 100);
  });

  it("display() and console.log collect into the output", async () => {
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    const result = out(
      await pool.eval(deps(), `display({k: 1}); console.log("hi", 5); "done"`, { pageId: "p1" }),
    );
    expect(result.value).toBe("done");
    expect(result.displayed).toEqual([{ k: 1 }, "hi 5"]);
  });

  it("lists and calls page.webmcp tools and parks a write", async () => {
    const webmcp = vi.fn(async (_pageId: string, action: { op?: string; name?: string }) => {
      if (action?.op === "call") {
        return { park: { kind: "approval" as const, instruction: "Allow this action before it runs.", approvalId: "ap-w" } };
      }
      return [{ name: "read_count", readOnly: true }];
    });
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    const listed = out(await pool.eval(deps({ webmcp }), `JSON.stringify(page.webmcp.tools())`, { pageId: "p1" }));
    expect(JSON.parse(String(listed.value))).toEqual([{ name: "read_count", readOnly: true }]);
    const parked = await pool.eval(deps({ webmcp }), `page.webmcp.call("add_write", { n: 1 })`, { pageId: "p1" });
    expect(parked).toEqual({
      park: { kind: "approval", instruction: "Allow this action before it runs.", approvalId: "ap-w" },
    });
    expect(webmcp).toHaveBeenLastCalledWith("p1", { op: "call", name: "add_write", input: { n: 1 } });
  });

  it("fetch routes through the egress dep and parks on ask", async () => {
    const fetchDep = vi.fn(async () => ({
      park: { kind: "approval" as const, instruction: "Allow fetching x?", approvalId: "ap-9" },
    }));
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    const result = await pool.eval(deps({ fetch: fetchDep }), `fetch("http://x.test")`, { pageId: "p1" });
    expect(result).toEqual({
      park: { kind: "approval", instruction: "Allow fetching x?", approvalId: "ap-9" },
    });
  });

  it("tabs, fs and snapshot reach their deps", async () => {
    const d = deps();
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    const result = out(
      await pool.eval(
        d,
        `JSON.stringify({ tabs: tabs().length, obs: snapshot().text, file: fs.readFile("notes.txt") })`,
        { pageId: "p1" },
      ),
    );
    expect(JSON.parse(String(result.value))).toEqual({ tabs: 1, obs: "obs text", file: "read:notes.txt" });
  });

  it("sleep pauses the guest and the deadline interrupts runaway code", async () => {
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    const slept = out(await pool.eval(deps(), `sleep(5); "awake"`, { pageId: "p1" }));
    expect(slept.value).toBe("awake");
    await expect(pool.eval(deps(), `while (true) {}`, { pageId: "p1", deadlineMs: 80 })).rejects.toThrow(
      /interrupt|deadline/i,
    );
  });

  it("unknown host calls and WebMCP fail honestly", async () => {
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    const result = out(
      await pool.eval(deps(), `try { page.webmcp.tools(); "no" } catch (e) { "webmcp: " + e.message }`, {
        pageId: "p1",
      }),
    );
    expect(String(result.value)).toMatch(/not exposed|unavailable|failed/i);
    const waited = out(
      await pool.eval(deps(), `try { wait({}); "no" } catch (e) { e.message }`, { pageId: "p1" }),
    );
    expect(String(waited.value)).toMatch(/subagent/i);
  });

  it("writes captures to outputDir and returns the artifact path", async () => {
    const dir = mkdtempSync(join(tmpdir(), "aux-repl-cap-"));
    cleanup.push(() => rmSync(dir, { recursive: true, force: true }));
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47]).toString("base64");
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    const result = out(
      await pool.eval(
        deps({
          outputDir: dir,
          capture: async () => ({ dataUrl: `data:image/png;base64,${png}`, width: 2, height: 2 }),
        }),
        `annotatedScreenshot().file`,
        { pageId: "p1" },
      ),
    );
    expect(String(result.value)).toMatch(/capture-1\.png$/);
    expect(existsSync(String(result.value))).toBe(true);
  });

  it("spawn/wait/send/stop reach the cell deps", async () => {
    const spawnCell = vi.fn(async () => ({ cellId: "cell-1" }));
    const waitCell = vi.fn(async () => ({ state: "completed", runId: "run-cell", result: { answer: 7 } }));
    const sendCell = vi.fn(async () => {});
    const cancelCell = vi.fn(async () => {});
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    const d = deps({ spawnCell, waitCell, sendCell, cancelCell });
    const spawned = out(
      await pool.eval(d, `spawn({ goal: "find the pricing", profile: "explorer", pageIds: ["p1"] })`, { pageId: "p1" }),
    );
    expect(spawned.value).toEqual({ cellId: "cell-1" });
    expect(spawnCell).toHaveBeenCalledWith({ goal: "find the pricing", profile: "explorer", pageIds: ["p1"] });
    const waited = out(await pool.eval(d, `wait("cell-1")`, { pageId: "p1" }));
    expect(waited.value).toEqual({ state: "completed", runId: "run-cell", result: { answer: 7 } });
    await pool.eval(d, `send("cell-1", "also check taxes"); stop("cell-1")`, { pageId: "p1" });
    expect(sendCell).toHaveBeenCalledWith("cell-1", "also check taxes");
    expect(cancelCell).toHaveBeenCalledWith("cell-1");
  });

  it("wait is capped by the remaining eval deadline", async () => {
    const waitCell = vi.fn(async (_id: string, ms: number) => ({ state: "running", pending: true, ms }));
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    const result = out(await pool.eval(deps({ waitCell }), `wait("cell-1")`, { pageId: "p1", deadlineMs: 500 }));
    expect((result.value as { ms: number }).ms).toBeLessThanOrEqual(500);
  });

  it("cells fail honestly when no subagent backend is wired", async () => {
    const pool = new ReplPool();
    cleanup.push(() => pool.disposeAll());
    const spawned = out(
      await pool.eval(deps(), `try { spawn({ goal: "x" }); "no" } catch (e) { e.message }`, { pageId: "p1" }),
    );
    expect(String(spawned.value)).toMatch(/unavailable|unsupported/i);
  });
});
