import { beforeEach, describe, expect, it, vi } from "vitest";

const executions = vi.hoisted(() => ({ cells: undefined as unknown }));
vi.mock("../../apps/runtime/dist/agent/loop/performance-executions.js", () => ({
  currentPerformanceExecutions: () => executions.cells,
  observePerformanceExecutions: () => executions.cells,
}));
import {
  readNativeSubagentWorkload,
  registerNativeSubagentWorkload,
} from "../../apps/runtime/dist/services/native-subagent-workload.js";

function fixture() {
  const deadlineAt = Date.now() + 60_000;
  const cells = Array.from({ length: 5 }, (_, i) => ({
    runId: `run-${i}`,
    cellId: `cell-${i}`,
    deadlineAt,
    memoryLimitBytes: 128 * 1024 * 1024,
  }));
  const agents = cells.map((cell, i) => ({
    agentId: `agent-${i}`,
    runId: cell.runId,
    sourceRunId: "parent",
    groupId: "group",
    state: "running",
    pageIds: [`parent-${i}`],
  }));
  const parent = {
    runId: "parent",
    status: "paused",
    pageIds: agents.flatMap((agent) => agent.pageIds),
    config: {
      taskId: "task",
      taskRevision: 7,
      contextWorkspaceId: "workspace",
      isolatedPageSources: cells.map((_, i) => ({
        pageId: `parent-${i}`,
        sourcePageId: `human-${i}`,
        url: `http://fixture.test/${i}`,
      })),
    },
  };
  const runs = cells.map((cell, i) => ({
    runId: cell.runId,
    status: "running",
    pageIds: [`child-${i}`],
    config: {
      contextWorkspaceId: "workspace",
      isolatedPageSources: [
        { pageId: `child-${i}`, sourcePageId: `parent-${i}`, url: `http://fixture.test/${i}` },
      ],
    },
  }));
  const pages = cells.flatMap((_, i) =>
    ["human", "parent", "child"].map((kind) => ({
      pageId: `${kind}-${i}`,
      sessionId: `${kind}-session-${i}`,
      url: `http://fixture.test/${i}`,
      documentEpoch: 1,
      ownedByRuntime: kind !== "human",
    })),
  );
  const owners = Object.fromEntries(
    cells.map((cell, i) => [`child-${i}`, { runId: cell.runId, actor: "coordinator" }]),
  );
  const task = {
    state: "open",
    revision: 7,
    workspaceId: "workspace",
    resources: cells.map((_, i) => ({ kind: "page", locator: `human-${i}`, access: "read" })),
  };
  const view = {
    group: {
      parentRunId: "parent",
      workspaceId: "workspace",
      groupId: "group",
      state: "active",
      deadlineAt,
      tokenBudget: 250000,
      costBudgetUsd: 5,
    },
    agents,
    reservedTokens: 250000,
    usedTokens: 0,
    reservedCostUsd: 5,
    usedCostUsd: 0,
  };
  let parentOwnsPages = false;
  const deps = {
    repo: {
      db: {
        prepare: () => ({
          get: (runId: string) => ({ agent_id: agents.find((agent) => agent.runId === runId)?.agentId }),
        }),
      },
      getRun: (runId: string) => (runId === "parent" ? parent : runs.find((run) => run.runId === runId)),
    },
    runs: { coordinator: { ownsPages: () => parentOwnsPages }, pageOwnership: { snapshot: () => owners } },
    subagents: {
      get: (agentId: string) => agents.find((agent) => agent.agentId === agentId),
      view: () => view,
    },
    tasks: { get: () => task },
    pages: { get: (pageId: string) => pages.find((page) => page.pageId === pageId), isAttached: () => true },
  } as unknown as Parameters<typeof readNativeSubagentWorkload>[0];
  executions.cells = cells;
  return {
    deps,
    task,
    view,
    parent,
    runs,
    pages,
    owners,
    setParentOwnsPages: () => {
      parentOwnsPages = true;
    },
  };
}

beforeEach(() => {
  executions.cells = undefined;
});
describe("native workload lineage and current authority", () => {
  it("retains the human, parent protected and child protected attachment chain", () => {
    const f = fixture();
    const result = readNativeSubagentWorkload(f.deps);
    expect(result.status).toBe("executing");
    if (!("children" in result) || !result.children) throw new Error("Missing genuine workload");
    expect(result.children).toHaveLength(5);
    expect(result.children[0]).toMatchObject({
      sourcePageId: "human-0",
      requestedPageId: "parent-0",
      pageId: "child-0",
      sourceDocumentEpoch: 1,
      requestedDocumentEpoch: 1,
      documentEpoch: 1,
      sourceSessionId: "human-session-0",
      requestedSessionId: "parent-session-0",
      sessionId: "child-session-0",
    });
  });
  it.each([
    ["paused status before lease release", (f: ReturnType<typeof fixture>) => f.setParentOwnsPages()],
    [
      "revised source task",
      (f: ReturnType<typeof fixture>) => {
        f.task.revision++;
      },
    ],
    [
      "closed source task",
      (f: ReturnType<typeof fixture>) => {
        f.task.state = "closed";
      },
    ],
    [
      "exhausted group tokens",
      (f: ReturnType<typeof fixture>) => {
        f.view.usedTokens = 1;
      },
    ],
    [
      "exhausted group cost",
      (f: ReturnType<typeof fixture>) => {
        f.view.usedCostUsd = 0.01;
      },
    ],
    [
      "expired group",
      (f: ReturnType<typeof fixture>) => {
        f.view.group.deadlineAt = 1;
      },
    ],
    [
      "substituted child source",
      (f: ReturnType<typeof fixture>) => {
        f.runs[0]!.config.isolatedPageSources[0]!.sourcePageId = "human-0";
      },
    ],
    [
      "taken-over child lease",
      (f: ReturnType<typeof fixture>) => {
        f.owners["child-0"]!.runId = "foreign";
      },
    ],
    [
      "runtime-owned original source",
      (f: ReturnType<typeof fixture>) => {
        f.pages[0]!.ownedByRuntime = true;
      },
    ],
    [
      "missing child epoch",
      (f: ReturnType<typeof fixture>) => {
        Reflect.deleteProperty(f.pages[2]!, "documentEpoch");
      },
    ],
    [
      "negative parent epoch",
      (f: ReturnType<typeof fixture>) => {
        f.pages[1]!.documentEpoch = -1;
      },
    ],
    [
      "fractional human epoch",
      (f: ReturnType<typeof fixture>) => {
        f.pages[0]!.documentEpoch = 1.5;
      },
    ],
    [
      "navigated source",
      (f: ReturnType<typeof fixture>) => {
        f.pages[0]!.url = "http://other.test/";
      },
    ],
  ])("refuses %s", (_label, change) => {
    const f = fixture();
    change(f);
    expect(readNativeSubagentWorkload(f.deps).status).toBe("refused");
  });
  it.each([
    [0, "sourceDocumentEpoch"],
    [1, "requestedDocumentEpoch"],
    [2, "documentEpoch"],
  ] as const)("records same-URL document replacement at stage %s", (index, field) => {
    const f = fixture();
    const before = readNativeSubagentWorkload(f.deps);
    if (!("children" in before) || !before.children) throw new Error("Missing genuine workload");
    expect(before.children[0]![field]).toBe(1);
    const url = f.pages[index]!.url;
    f.pages[index]!.documentEpoch++;
    const after = readNativeSubagentWorkload(f.deps);
    if (!("children" in after) || !after.children) throw new Error("Missing genuine workload");
    expect(f.pages[index]!.url).toBe(url);
    expect(after.children[0]![field]).toBe(2);
  });
  it("rejects selectors at the private channel boundary", () => {
    const f = fixture();
    let handler!: (raw: unknown) => unknown;
    registerNativeSubagentWorkload(
      {
        onMethod: (_name: string, next: typeof handler) => {
          handler = next;
        },
      } as unknown as Parameters<typeof registerNativeSubagentWorkload>[0],
      f.deps,
    );
    expect(() => handler({ runId: "parent" })).toThrow();
    expect((handler({}) as { status: string }).status).toBe("executing");
  });
});
