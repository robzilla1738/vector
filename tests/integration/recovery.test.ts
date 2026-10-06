/**
 * Recovery: restart the runtime against the same data dir — live runs
 * become "interrupted", pages become "detached", history survives.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startRuntime, openDb, Repo, type RuntimeHandle } from "@aux/runtime";
import type { PageTarget, Run } from "@aux/contracts";
import { resolveDatabasePath } from "@aux/contracts/installation";
import { startFixturesIfNeeded, waitForFixtures } from "../../scripts/fixtures.mjs";
import type { ChildProcess } from "node:child_process";

const RECORDS = "http://127.0.0.1:4810";

let procs: ChildProcess[];
let dataDir: string;

beforeAll(async () => {
  procs = await startFixturesIfNeeded();
  await waitForFixtures();
  dataDir = mkdtempSync(join(tmpdir(), "aux-recover-"));
}, 60_000);

afterAll(() => {
  procs.forEach((p) => p.kill());
  rmSync(dataDir, { recursive: true, force: true });
});

describe("restart recovery", () => {
  it("marks live runs interrupted and detaches pages on reopen", async () => {
    const env = { ...process.env, AUX_DATA_DIR: dataDir, AUX_ELECTRON_CDP: "" };

    const rt1: RuntimeHandle = await startRuntime(env);
    const page = (await rt1.invoke("pages.open", {
      url: `${RECORDS}/records`,
      background: true,
    })) as PageTarget;
    await rt1.close(); // graceful stop BEFORE the fake run exists — no shutdown marking

    // a real crash leaves a "running" row behind; insert one directly
    const repo = new Repo(openDb(resolveDatabasePath(dataDir)));
    repo.saveRun({
      runId: "run-crashed",
      goal: "was running when the process died",
      status: "running",
      pageIds: [page.pageId],
      createdAt: Date.now(),
      startedAt: Date.now(),
    });
    repo.db.close();

    const rt2 = await startRuntime(env);
    const { run } = (await rt2.invoke("runs.get", { runId: "run-crashed" })) as { run: Run };
    expect(run.status).toBe("interrupted");

    await expect(rt2.invoke("runs.retry", { runId: "run-crashed" })).rejects.toThrow(
      /Reopen or choose a browser tab/i,
    );

    const replacement = (await rt2.invoke("pages.open", {
      url: `${RECORDS}/records`,
      background: true,
    })) as PageTarget;
    const retried = (await rt2.invoke("runs.retry", {
      runId: "run-crashed",
      pageId: replacement.pageId,
    })) as Run;
    expect(retried.goal).toBe(run.goal);
    expect(retried.pageIds).toEqual([replacement.pageId]);
    expect(retried.config?.chatId).toBe(run.runId);
    expect(retried.config?.retryOfRunId).toBe(run.runId);
    await expect(rt2.invoke("runs.retry", { runId: "run-crashed" })).rejects.toThrow(/newer turn/i);

    const pages = (await rt2.invoke("pages.list", { includeDetached: true })) as PageTarget[];
    const restored = pages.find((p) => p.pageId === page.pageId);
    expect(restored?.viewStatus).toBe("detached"); // persisted, not reattached

    const history = (await rt2.invoke("history.list", {})) as { url: string }[];
    expect(history.some((h) => h.url.includes("/records"))).toBe(true);

    await rt2.close();
  }, 90_000);
});
