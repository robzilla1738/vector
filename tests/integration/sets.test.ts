/**
 * Integration: page sets — create, map a typed program over members with
 * bounded parallelism, collect results including partial failures.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startRuntime, type RuntimeHandle } from "@vector/runtime";
import type { PageSet, ResultRecord, SetMember } from "@vector/contracts";
import { startFixturesIfNeeded, waitForFixtures } from "../../scripts/fixtures.mjs";
import type { ChildProcess } from "node:child_process";

const RECORDS = "http://127.0.0.1:4810";

let rt: RuntimeHandle;
let procs: ChildProcess[];

const invoke = <T>(m: string, p?: unknown) => rt.invoke(m, p ?? {}) as Promise<T>;

async function waitForRun(runId: string, timeoutMs = 90_000): Promise<{ run: { status: string }; steps: unknown[] }> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const r = await invoke<{ run: { status: string }; steps: unknown[] }>("runs.get", { runId });
    if (!["queued", "planning", "running"].includes(r.run.status)) return r;
    if (Date.now() > deadline) throw new Error(`run ${runId} still ${r.run.status}`);
    await new Promise((r2) => setTimeout(r2, 300));
  }
}

beforeAll(async () => {
  procs = await startFixturesIfNeeded();
  await waitForFixtures();
  rt = await startRuntime({
    ...process.env,
    VECTOR_DATA_DIR: mkdtempSync(join(tmpdir(), "vector-sets-")),
    VECTOR_ELECTRON_CDP: "",
    VECTOR_ENGINE_MODE: "off",
  });
}, 60_000);

afterAll(async () => {
  await rt.close();
  procs.forEach((p) => p.kill());
});

describe("sets.map", () => {
  it("maps a typed program over member pages and records results", async () => {
    const set = await invoke<PageSet>("sets.create", {
      name: "first-five",
      source: "urls",
      urls: ["rec-01", "rec-02", "rec-03", "rec-04", "rec-05"].map((id) => `${RECORDS}/records/${id}`),
    });
    const { runId } = await invoke<{ runId: string }>("sets.map", {
      setId: set.setId,
      concurrency: 4,
      program: {
        steps: [
          { id: "s1", op: "waitFor", condition: { kind: "selector", selector: "#record-title", state: "visible" } },
          {
            id: "s2",
            op: "extract",
            as: "record",
            fields: [
              { name: "title", selector: "#record-title" },
              { name: "owner", selector: "#record-owner" },
              { name: "status", selector: "#record-status" },
            ],
          },
        ],
      },
    });
    const done = await waitForRun(runId);
    expect(done.run.status).toBe("completed");

    const members = (await invoke<{ members: SetMember[] }>("sets.get", { setId: set.setId })).members;
    expect(members.every((m) => m.status === "completed")).toBe(true);

    const results = await invoke<ResultRecord[]>("sets.results", { setId: set.setId });
    expect(results).toHaveLength(5);
    for (const r of results) {
      expect(r.status).toBe("ok");
      const rec = (r.values.record ?? r.values) as { title?: string; owner?: string };
      expect(rec.title).toBeTruthy();
      expect(rec.owner).toBeTruthy();
    }
  }, 120_000);

  it("keeps partial failures — good members land, bad ones are marked", async () => {
    const set = await invoke<PageSet>("sets.create", {
      name: "mixed",
      source: "urls",
      urls: [`${RECORDS}/records/rec-10`, `${RECORDS}/records/rec-99`, `${RECORDS}/records/rec-11`],
    });
    const { runId } = await invoke<{ runId: string }>("sets.map", {
      setId: set.setId,
      concurrency: 3,
      program: {
        steps: [
          { id: "s1", op: "waitFor", condition: { kind: "selector", selector: "#record-title", state: "visible", timeoutMs: 5000 } },
          { id: "s2", op: "extract", fields: [{ name: "title", selector: "#record-title" }] },
        ],
      },
    });
    const done = await waitForRun(runId);
    expect(done.run.status).toBe("partially_completed");

    const members = (await invoke<{ members: SetMember[] }>("sets.get", { setId: set.setId })).members;
    expect(members.filter((m) => m.status === "completed")).toHaveLength(2);
    expect(members.filter((m) => m.status === "failed")).toHaveLength(1);

    const results = await invoke<ResultRecord[]>("sets.results", { setId: set.setId });
    expect(results.filter((r) => r.status === "ok")).toHaveLength(2);
  }, 120_000);
});
