import { expect, it, vi } from "vitest";
import { EventBus, openDb, Repo, RunCoordinator } from "@aux/runtime";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { PageOwnership } from "../../apps/runtime/dist/scheduler/page-ownership.js";
const observation = vi.hoisted(() => ({ cells: [] as unknown[] | undefined }));
vi.mock("../../apps/runtime/dist/agent/loop/performance-executions.js", () => ({
  observePerformanceExecutions: () => observation.cells,
  currentPerformanceExecutions: () => undefined,
}));
import { readNativeSubagentWorkload } from "../../apps/runtime/dist/services/native-subagent-workload.js";

it("attests zero VMs only with genuine durable and coordinator idle inventories", () => {
  const db = openDb(":memory:"),
    repo = new Repo(db),
    events = new EventBus(repo);
  const coordinator = new RunCoordinator({
    repo,
    events,
    pages: {} as never,
    pageOwnership: new PageOwnership(),
    turnMentions: fixtureTurnMentions(() => {
      throw new Error("No page access");
    }),
    model: () => {
      throw new Error("No model dispatch");
    },
    defaultModel: () => "fixture",
    recoveryModel: () => undefined,
    recordModelCall: () => {},
  });
  const deps = { repo, runs: { coordinator } } as unknown as Parameters<typeof readNativeSubagentWorkload>[0];
  try {
    observation.cells = [];
    expect(readNativeSubagentWorkload(deps)).toMatchObject({ status: "idle", activeExecutions: 0 });
    for (const status of ["queued", "planning", "running", "needs_input"] as const) {
      repo.saveRun({
        runId: "active",
        goal: "Real durable work",
        status,
        pageIds: [],
        createdAt: Date.now(),
      });
      expect(readNativeSubagentWorkload(deps).status).toBe("refused");
    }
    repo.saveRun({
      runId: "active",
      goal: "Terminal work",
      status: "completed",
      pageIds: [],
      createdAt: Date.now(),
    });
    expect(readNativeSubagentWorkload(deps).status).toBe("idle");
    observation.cells = [{ runId: "partial" }];
    expect(readNativeSubagentWorkload(deps).status).toBe("refused");
    observation.cells = undefined;
    expect(readNativeSubagentWorkload(deps).status).toBe("refused");
    observation.cells = [];
    coordinator.controls.set("orphan", { paused: false, abort: new AbortController() } as never);
    expect(readNativeSubagentWorkload(deps).status).toBe("refused");
    coordinator.controls.clear();
    expect(readNativeSubagentWorkload(deps).status).toBe("idle");
  } finally {
    db.close();
  }
});
