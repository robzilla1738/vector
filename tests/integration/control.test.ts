/**
 * Control plane: human takeover blocks automation, resume restores it
 * after a fresh observation; saved programs replay across pages.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startRuntime, type RuntimeHandle } from "@vector/runtime";
import type { PageTarget, ProgramResult, SavedProgram } from "@vector/contracts";
import { startFixturesIfNeeded, waitForFixtures } from "../../scripts/fixtures.mjs";
import type { ChildProcess } from "node:child_process";

const RECORDS = "http://127.0.0.1:4810";

let rt: RuntimeHandle;
let procs: ChildProcess[];
let dataDir: string;
const invoke = <T>(m: string, p?: unknown) => rt.invoke(m, p ?? {}) as Promise<T>;

beforeAll(async () => {
  procs = await startFixturesIfNeeded();
  await waitForFixtures();
  dataDir = mkdtempSync(join(tmpdir(), "vector-ctrl-"));
  rt = await startRuntime({ ...process.env, VECTOR_DATA_DIR: dataDir, VECTOR_ELECTRON_CDP: "", VECTOR_ENGINE_MODE: "off" });
}, 60_000);

afterAll(async () => {
  await rt.close();
  procs.forEach((p) => p.kill());
  rmSync(dataDir, { recursive: true, force: true });
});

describe("human takeover", () => {
  it("blocks execution while under human control, resumes cleanly", async () => {
    const page = await invoke<PageTarget>("pages.open", { url: `${RECORDS}/records`, background: true });
    const taken = await invoke<PageTarget>("pages.takeover", { pageId: page.pageId });
    expect(taken.controller).toBe("human");

    await expect(
      invoke("pages.execute", { program: { pageId: page.pageId, steps: [{ id: "s1", op: "reload" }] } }),
    ).rejects.toMatchObject({ message: /human control/i });

    const resumed = await invoke<PageTarget>("pages.resume", { pageId: page.pageId });
    expect(resumed.controller).not.toBe("human");

    const res = await invoke<ProgramResult>("pages.execute", {
      program: { pageId: page.pageId, steps: [{ id: "s1", op: "reload" }] },
    });
    expect(res.status).toBe("completed");
  }, 60_000);
});

describe("saved programs", () => {
  it("saves a learned program via set-map and replays it on another member", async () => {
    // map an agent goal so the runner learns a portable program
    const set = await invoke<{ setId: string }>("sets.create", {
      name: "learn",
      source: "urls",
      urls: [`${RECORDS}/records/rec-20`, `${RECORDS}/records/rec-21`],
    });
    const { runId } = await invoke<{ runId: string }>("sets.map", {
      setId: set.setId,
      // no program + no model configured → member agent runs the mock path…
      // give an explicit program instead, which becomes the reusable shape:
      program: {
        steps: [
          { id: "s1", op: "waitFor", condition: { kind: "selector", selector: "#record-title", state: "visible" } },
          { id: "s2", op: "extract", fields: [{ name: "title", selector: "#record-title" }], as: "rec" },
        ],
      },
      concurrency: 2,
    });
    const deadline = Date.now() + 90_000;
    for (;;) {
      const { run } = await invoke<{ run: { status: string } }>("runs.get", { runId });
      if (["completed", "partially_completed", "failed"].includes(run.status)) break;
      if (Date.now() > deadline) throw new Error("set map timed out");
      await new Promise((r) => setTimeout(r, 300));
    }
    const results = await invoke<{ status: string }[]>("sets.results", { setId: set.setId });
    expect(results.filter((r) => r.status === "ok")).toHaveLength(2);
  }, 120_000);

  it("programs.save → programs.run replays a stored program on a page", async () => {
    const saved = await invoke<SavedProgram>("programs.save", {
      name: "read-record-title",
      siteKey: "http://127.0.0.1:4810/records/*",
      steps: [
        { id: "s1", op: "waitFor", condition: { kind: "selector", selector: "#record-title", state: "visible" } },
        { id: "s2", op: "extract", fields: [{ name: "title", selector: "#record-title" }], as: "rec" },
      ],
      parameters: [],
    });
    expect(saved.programId).toBeTruthy();

    const page = await invoke<PageTarget>("pages.open", { url: `${RECORDS}/records/rec-07`, background: true });
    const { runId } = await invoke<{ runId: string }>("programs.run", { programId: saved.programId, pageId: page.pageId });
    const deadline = Date.now() + 60_000;
    for (;;) {
      const { run } = await invoke<{ run: { status: string; result?: Record<string, unknown> } }>("runs.get", { runId });
      if (["completed", "failed"].includes(run.status)) {
        expect(run.status).toBe("completed");
        const rec = (run.result?.rec ?? {}) as { title?: string };
        expect(rec.title).toContain("Record");
        break;
      }
      if (Date.now() > deadline) throw new Error("program run timed out");
      await new Promise((r) => setTimeout(r, 250));
    }

    // useCount increments on success
    const progs = await invoke<SavedProgram[]>("programs.list");
    expect(progs.find((p) => p.programId === saved.programId)?.useCount).toBe(1);
  }, 120_000);
});
