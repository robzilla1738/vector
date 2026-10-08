import { TranscriptStore, type ModelMessage } from "@aux/runtime";
import {
  lineageRuns,
  overnightRoot,
  runRoot,
  runAncestry,
} from "../../apps/runtime/src/services/run-lineage.js";
import { expect, it, vi } from "vitest";
import {
  authorizeProfileProgram,
  isReadOnlyProfile,
  EventBus,
  openDb,
  Repo,
  SubagentService,
  TaskService,
} from "@aux/runtime";
import { AuxError, AuxPackageSnapshotSchema, EventTypes, type Run } from "@aux/contracts";

function fixture(
  coding?: ConstructorParameters<typeof SubagentService>[3],
  publicWebTools?: ConstructorParameters<typeof SubagentService>[4],
) {
  const db = openDb(":memory:");
  const repo = new Repo(db),
    events = new EventBus(repo);
  const workspace = new TaskService(repo, events).createWorkspace("Agents");
  const parent: Run = {
    runId: "parent",
    goal: "Research",
    status: "running",
    pageIds: ["parent-page", "one", "two", "three", ...Array.from({ length: 10 }, (_, i) => `page-${i}`)],
    config: { contextWorkspaceId: workspace.workspaceId, context: "Stable shared prompt prefix" },
    createdAt: Date.now(),
  };
  repo.saveRun(parent);
  const starts: Record<string, unknown>[] = [];
  const messages: Record<string, unknown>[] = [];
  const cancelled: string[] = [];
  const runs = {
    coordinator: { suspensions: { pending: () => undefined } },
    pageOwnership: {
      snapshot: () => ({ "parent-page": { pageId: "parent-page", actor: "coordinator", runId: "parent" } }),
    },
    async start(input: Record<string, unknown>) {
      starts.push(input);
      const run: Run = {
        runId: String(input.deliveryRunId ?? `child-${starts.length}`),
        goal: String(input.goal),
        status: "running",
        pageIds: input.pageIds as string[],
        config: {
          chatId: String(input.chatId),
          context: input.context as string,
          contextWorkspaceId: String(input.contextWorkspaceId),
          messageRevision: 0,
          subagentProfile: input.subagentProfile as "default" | "explorer" | "read_only",
        },
        createdAt: Date.now(),
      };
      repo.saveRun(run);
      return run;
    },
    cancel(runId: string) {
      cancelled.push(runId);
      const run = repo.getRun(runId)!;
      run.status = "cancelled";
      repo.saveRun(run);
      events.emit(EventTypes.RunUpdated, { run }, runId);
      return run;
    },
    messages: {
      steer(input: Record<string, unknown>) {
        messages.push(input);
        return { messageId: input.messageId };
      },
    },
  } as unknown as ConstructorParameters<typeof SubagentService>[2];
  const service = new SubagentService(repo, events, runs, coding, publicWebTools);
  return {
    db,
    repo,
    events,
    workspace,
    parent,
    starts,
    messages,
    cancelled,
    runs,
    service,
    close: () => {
      service.close();
      db.close();
    },
  };
}

it("starts tab-free public research with inherited budgets and no browser or filesystem authority", async () => {
  const f = fixture(undefined, ["webfetch", "websearch"]);
  try {
    f.parent.pageIds = [];
    f.parent.config = { ...f.parent.config, agentMode: "ask", nativeTurnContext: "original-source" };
    f.repo.saveRun(f.parent);
    const group = f.service.createGroup({
      parentRunId: f.parent.runId,
      tokenBudget: 1000,
      costBudgetUsd: 1,
      timeBudgetMs: 60000,
    });
    await f.service.spawn({
      groupId: group.groupId,
      goal: "Compare public documentation",
      pageIds: [],
      profile: "read_only",
      tokenAllocation: 500,
      costAllocationUsd: 0.2,
    });
    expect(f.starts[0]).toMatchObject({
      pageIds: [],
      agentMode: "ask",
      nativeTurnContext: "original-source",
      contextWorkspaceId: f.workspace.workspaceId,
      maxCostUsd: 0.2,
      agentProfile: { name: "read_only", tools: expect.arrayContaining(["webfetch", "websearch"]) },
    });
    const profile = f.starts[0]!.agentProfile as { tools: string[] };
    expect(profile.tools).not.toEqual(expect.arrayContaining(["snapshot"]));
    expect(
      profile.tools.some((tool) => ["*", "act", "repl", "read_file", "bash", "subagent"].includes(tool)),
    ).toBe(false);
    expect(f.starts[0]!.projectRoot).toBeUndefined();
  } finally {
    f.close();
  }
});

it.each(["unavailable", "parent-restricted"] as const)(
  "does not enlarge tab-free research authority when public tools are %s",
  async (reason) => {
    const f = fixture(undefined, reason === "unavailable" ? [] : ["webfetch", "websearch"]);
    try {
      f.parent.pageIds = [];
      if (reason === "parent-restricted")
        f.parent.config = {
          ...f.parent.config,
          agentProfile: {
            name: "limited",
            prompt: "Read files only",
            tools: ["read_file"],
            packages: [],
            workspace: "shared",
          },
        };
      f.repo.saveRun(f.parent);
      const group = f.service.createGroup({
        parentRunId: f.parent.runId,
        tokenBudget: 0,
        costBudgetUsd: 0,
        timeBudgetMs: 0,
      });
      await expect(
        f.service.spawn({
          groupId: group.groupId,
          goal: "Research",
          pageIds: [],
          profile: "default",
          tokenAllocation: 0,
          costAllocationUsd: 0,
        }),
      ).rejects.toThrow(/available public web tool/);
      expect(f.starts).toHaveLength(0);
    } finally {
      f.close();
    }
  },
);

it("shares the explicit reservation budget across nine children and rejects page collisions", async () => {
  const f = fixture();
  try {
    const group = f.service.createGroup({
      parentRunId: f.parent.runId,
      tokenBudget: 9000,
      costBudgetUsd: 1,
      timeBudgetMs: 60_000,
    });
    await expect(
      f.service.spawn({
        groupId: group.groupId,
        goal: "Outside scope",
        pageIds: ["other-page"],
        profile: "read_only",
        tokenAllocation: 1000,
        costAllocationUsd: 0.1,
      }),
    ).rejects.toThrow(/page scope/);
    for (let i = 0; i < 9; i++)
      await f.service.spawn({
        groupId: group.groupId,
        goal: `Research ${i}`,
        pageIds: [`page-${i}`],
        profile: "read_only",
        tokenAllocation: 1000,
        costAllocationUsd: 0.1,
      });
    expect(f.service.view(group.groupId).reservedTokens).toBe(9000);
    await expect(
      f.service.spawn({
        groupId: group.groupId,
        goal: "Tenth",
        pageIds: ["page-9"],
        profile: "default",
        tokenAllocation: 1000,
        costAllocationUsd: 0.1,
      }),
    ).rejects.toThrow(/shared subagent budget/);
    expect(f.starts[0]).toMatchObject({
      context: "Stable shared prompt prefix",
      contextSnapshot: true,
      subagentProfile: "read_only",
    });
    await f.service.cancel(
      f.service.view(group.groupId).agents.find((agent) => agent.pageIds.includes("page-0"))!.agentId,
    );
    await expect(
      f.service.spawn({
        groupId: group.groupId,
        goal: "Collision",
        pageIds: ["page-1"],
        profile: "default",
        tokenAllocation: 1000,
        costAllocationUsd: 0.1,
      }),
    ).rejects.toThrow(/leased/);
  } finally {
    f.close();
  }
});

it("releases unused reservations after completion and forks the exact saved context", async () => {
  const f = fixture();
  try {
    const group = f.service.createGroup({
      parentRunId: f.parent.runId,
      tokenBudget: 2500,
      costBudgetUsd: 0.5,
      timeBudgetMs: 60_000,
    });
    const first = await f.service.spawn({
      groupId: group.groupId,
      goal: "One",
      pageIds: ["one"],
      profile: "explorer",
      tokenAllocation: 1000,
      costAllocationUsd: 0.2,
    });
    await f.service.spawn({
      groupId: group.groupId,
      goal: "Two",
      pageIds: ["two"],
      profile: "default",
      tokenAllocation: 1000,
      costAllocationUsd: 0.2,
    });
    await expect(
      f.service.spawn({
        groupId: group.groupId,
        goal: "Over budget",
        pageIds: ["three"],
        profile: "default",
        tokenAllocation: 1000,
        costAllocationUsd: 0.2,
      }),
    ).rejects.toThrow(/shared/);
    f.repo.saveModelCall({
      callId: "usage",
      runId: first.runId,
      role: "planner",
      modelId: "fixture",
      durationMs: 1,
      inputTokens: 50,
      outputTokens: 50,
      costUsd: 0.01,
      createdAt: Date.now(),
    });
    const done = f.repo.getRun(first.runId!)!;
    done.status = "completed";
    done.config = {
      ...done.config,
      modelId: "fixture/source-model",
      contextAttachmentRefs: [
        { chatId: "original-chat", attachmentId: "original-document", sha256: "a".repeat(64) },
      ],
      contextSourceArtifactIds: ["original-result"],
    };
    f.repo.saveRun(done);
    f.events.emit(EventTypes.RunUpdated, { run: done }, done.runId);
    const transcript = new TranscriptStore(f.repo.db, f.repo.columnCipher);
    const prefix: ModelMessage[] = [
      { role: "user", content: "Original task" },
      {
        role: "assistant",
        content: [{ type: "tool-call", toolCallId: "read", toolName: "snapshot", input: {} }],
      },
      {
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: "read",
            toolName: "snapshot",
            output: { type: "json", value: { title: "Source" } },
          },
        ],
      },
    ];
    const unfinished: ModelMessage = {
      role: "assistant",
      content: [{ type: "tool-call", toolCallId: "pending", toolName: "click", input: {} }],
    };
    transcript.append(first.runId!, [...prefix, unfinished]);
    const fork = await f.service.forkSelf({
      groupId: group.groupId,
      goal: "Follow one",
      pageIds: ["three"],
      profile: "explorer",
      tokenAllocation: 1000,
      costAllocationUsd: 0.2,
      sourceRunId: first.runId,
    });
    expect(fork.sourceRunId).toBe(first.runId);
    expect(f.starts.at(-1)?.modelId).toBe("fixture/source-model");
    expect(f.starts.at(-1)?.contextAttachmentRefs).toEqual(done.config.contextAttachmentRefs);
    expect(f.starts.at(-1)?.contextSourceArtifactIds).toEqual(["original-result"]);
    expect(f.starts.at(-1)?.forkTranscript).toEqual(prefix);
    expect(f.starts.at(-1)?.pageIds).toEqual(["three"]);
    transcript.append(first.runId!, [
      {
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: "pending",
            toolName: "click",
            output: { type: "json", value: { done: true } },
          },
        ],
      },
    ]);
    expect(f.starts.at(-1)?.forkTranscript).toEqual(prefix);
    expect(transcript.load(first.runId!)).toHaveLength(5);
    expect(f.starts.at(-1)?.context).toBe("Stable shared prompt prefix");
    expect(f.service.view(group.groupId)).toMatchObject({ usedTokens: 100, reservedTokens: 2000 });
    const message = await f.service.sendMessage(fork.agentId, fork.runId!, "Check the second source");
    expect(message).toBeDefined();
    expect(f.messages[0]).toMatchObject({ runId: fork.runId, text: "Check the second source" });
  } finally {
    f.close();
  }
});

it("enforces explicit read-only child profiles independently of the parent mode", () => {
  const click = [{ id: "click", op: "click" as const, target: "button" }];
  for (const profile of ["read_only", "explorer", "default"] as const)
    expect(authorizeProfileProgram(click, isReadOnlyProfile(profile)).ok).toBe(profile === "default");
  expect(
    authorizeProfileProgram([{ id: "read", op: "extract", fields: [{ name: "text", selector: "h1" }] }], true)
      .ok,
  ).toBe(true);
});

it("preserves funded child work for budget Continue and cancels when its parent settles", async () => {
  const f = fixture();
  try {
    const group = f.service.createGroup({
      parentRunId: f.parent.runId,
      tokenBudget: 3000,
      costBudgetUsd: 1,
      timeBudgetMs: 60_000,
    });
    const child = await f.service.spawn({
      groupId: group.groupId,
      goal: "One",
      pageIds: ["one"],
      profile: "default",
      tokenAllocation: 1000,
      costAllocationUsd: 0.2,
    });
    f.repo.saveModelCall({
      callId: "overspend",
      runId: child.runId,
      role: "planner",
      modelId: "fixture",
      durationMs: 1,
      inputTokens: 1200,
      outputTokens: 10,
      costUsd: 0.01,
      createdAt: Date.now(),
    });
    f.events.emit(EventTypes.ModelCall, {}, child.runId);
    expect(f.cancelled).not.toContain(child.runId);
    const second = await f.service.spawn({
      groupId: group.groupId,
      goal: "Two",
      pageIds: ["two"],
      profile: "read_only",
      tokenAllocation: 1000,
      costAllocationUsd: 0.2,
    });
    const parent = f.repo.getRun(f.parent.runId)!;
    parent.status = "completed";
    f.repo.saveRun(parent);
    f.events.emit(EventTypes.RunUpdated, { run: parent }, parent.runId);
    await vi.waitFor(() => {
      expect(f.cancelled).toContain(second.runId);
      expect(f.cancelled).toContain(child.runId);
    });
    expect(f.service.view(group.groupId).group.state).toBe("closed");
  } finally {
    f.close();
  }
});

it("does not orphan a child if the parent settles during launch", async () => {
  const f = fixture();
  try {
    const group = f.service.createGroup({
      parentRunId: f.parent.runId,
      tokenBudget: 2000,
      costBudgetUsd: 0.5,
      timeBudgetMs: 60_000,
    });
    const start = f.runs.start.bind(f.runs);
    f.runs.start = async (input) => {
      const child = await start(input);
      const parent = f.repo.getRun(f.parent.runId)!;
      parent.status = "completed";
      f.repo.saveRun(parent);
      f.events.emit(EventTypes.RunUpdated, { run: parent }, parent.runId);
      return child;
    };
    await expect(
      f.service.spawn({
        groupId: group.groupId,
        goal: "Race",
        pageIds: ["one"],
        profile: "default",
        tokenAllocation: 1000,
        costAllocationUsd: 0.2,
      }),
    ).rejects.toThrow(/closed during launch/);
    expect(f.cancelled).toContain(f.repo.listRuns(2).find((run) => run.runId !== f.parent.runId)?.runId);
    expect(f.service.view(group.groupId).agents[0]?.state).toBe("interrupted");
  } finally {
    f.close();
  }
});

it("cancels a child whose launch fails after the run was persisted", async () => {
  const f = fixture();
  try {
    const group = f.service.createGroup({
      parentRunId: f.parent.runId,
      tokenBudget: 2000,
      costBudgetUsd: 0.5,
      timeBudgetMs: 60_000,
    });
    const start = f.runs.start.bind(f.runs);
    f.runs.start = async (input) => {
      await start(input);
      throw new Error("late launch failure");
    };
    await expect(
      f.service.spawn({
        groupId: group.groupId,
        goal: "Race",
        pageIds: ["one"],
        profile: "default",
        tokenAllocation: 1000,
        costAllocationUsd: 0.2,
      }),
    ).rejects.toThrow(/late launch failure/);
    expect(f.cancelled).toContain(f.repo.listRuns(2).find((run) => run.runId !== f.parent.runId)?.runId);
    expect(f.service.view(group.groupId).agents[0]?.state).toBe("failed");
  } finally {
    f.close();
  }
});

it("waitFor resolves when a cell reaches a terminal state and reports pending while active", async () => {
  const f = fixture();
  try {
    const group = f.service.createGroup({
      parentRunId: f.parent.runId,
      tokenBudget: 2000,
      costBudgetUsd: 0.5,
      timeBudgetMs: 60_000,
    });
    const agent = await f.service.spawn({
      groupId: group.groupId,
      goal: "Watch me",
      pageIds: ["one"],
      profile: "default",
      tokenAllocation: 1000,
      costAllocationUsd: 0.2,
    });
    expect(f.service.get(agent.agentId).state).toBe("running");
    const pending = await f.service.waitFor(agent.agentId, 60);
    expect(pending.pending).toBe(true);
    await f.service.sendMessage(agent.agentId, agent.runId!, "steer me");
    expect(f.messages.at(-1)).toMatchObject({ text: "steer me" });
    const done = f.repo.getRun(agent.runId!)!;
    done.status = "completed";
    done.result = { answer: 42 };
    f.repo.saveRun(done);
    f.events.emit(EventTypes.RunUpdated, { run: done }, done.runId);
    const settled = await f.service.waitFor(agent.agentId, 2000);
    expect(settled.state).toBe("completed");
    expect(settled.result).toEqual({ answer: 42 });
    expect(() => f.service.sendMessage(agent.agentId, agent.runId!, "late note")).toThrow(
      /turn changed|state changed/,
    );
  } finally {
    f.close();
  }
});

it("waitFor surfaces the child run's failure", async () => {
  const f = fixture();
  try {
    const group = f.service.createGroup({
      parentRunId: f.parent.runId,
      tokenBudget: 2000,
      costBudgetUsd: 0.5,
      timeBudgetMs: 60_000,
    });
    const agent = await f.service.spawn({
      groupId: group.groupId,
      goal: "Break",
      pageIds: ["one"],
      profile: "default",
      tokenAllocation: 1000,
      costAllocationUsd: 0.2,
    });
    const failed = f.repo.getRun(agent.runId!)!;
    failed.status = "failed";
    failed.failure = { category: "unknown", message: "it broke", retryable: false, action: "edit_request" };
    f.repo.saveRun(failed);
    f.events.emit(EventTypes.RunUpdated, { run: failed }, failed.runId);
    const settled = await f.service.waitFor(agent.agentId, 2000);
    expect(settled.error).toBe("it broke");
  } finally {
    f.close();
  }
});

it("persists trusted child lineage before launch without fabricating a child night queue marker", async () => {
  const f = fixture();
  try {
    f.repo.saveRun({ ...f.parent, config: { ...f.parent.config, nightShiftItemId: "person-queue" } });
    const group = f.service.createGroup({
      parentRunId: f.parent.runId,
      tokenBudget: 2000,
      costBudgetUsd: 0.5,
      timeBudgetMs: 60_000,
    });
    const start = f.runs.start.bind(f.runs);
    f.runs.start = async (input) => {
      expect(f.repo.getRun(input.deliveryRunId!)).toBeUndefined();
      expect(overnightRoot(f.repo, input.deliveryRunId!)).toBe(f.parent.runId);
      expect(input).not.toHaveProperty("nightShiftItemId");
      return start(input);
    };
    const child = await f.service.spawn({
      groupId: group.groupId,
      goal: "Child",
      pageIds: ["one"],
      profile: "read_only",
      tokenAllocation: 1000,
      costAllocationUsd: 0.2,
    });
    expect(runRoot(f.repo, child.runId!)).toBe(f.parent.runId);
    expect(runAncestry(f.repo, child.runId!, true)).toEqual([child.runId, f.parent.runId]);
    expect(lineageRuns(f.repo, f.parent.runId)).toEqual([f.parent.runId, child.runId]);
    f.db.prepare("UPDATE subagent_groups SET state='closed' WHERE group_id=?").run(group.groupId);
    expect(() => overnightRoot(f.repo, child.runId!)).toThrow(/no longer active/);
    expect(runAncestry(f.repo, child.runId!)).toEqual([child.runId, f.parent.runId]);
    expect(() => runAncestry(f.repo, child.runId!, true)).toThrow(/no longer active/);
    expect(lineageRuns(f.repo, f.parent.runId)).toContain(child.runId);
  } finally {
    f.close();
  }
});

it("actual cell controls wait for steer and cancel authority acknowledgements and propagate refusal", async () => {
  const f = fixture();
  try {
    const group = f.service.createGroup({
      parentRunId: f.parent.runId,
      tokenBudget: 3000,
      costBudgetUsd: 1,
      timeBudgetMs: 60_000,
    });
    const child = await f.service.spawn({
      groupId: group.groupId,
      goal: "One",
      pageIds: ["one"],
      profile: "default",
      tokenAllocation: 1000,
      costAllocationUsd: 0.2,
    });
    const controls = f.service.cellControls();
    let acknowledgeSteer!: () => void;
    const originalSteer = f.runs.messages.steer.bind(f.runs.messages);
    vi.spyOn(f.runs.messages, "steer").mockImplementation(async (input) => {
      await new Promise<void>((resolve) => {
        acknowledgeSteer = resolve;
      });
      return originalSteer(input);
    });
    let sent = false;
    const sending = controls.sendCell(child.agentId, "Check source").then(() => {
      sent = true;
    });
    await vi.waitFor(() => expect(acknowledgeSteer).toBeTypeOf("function"));
    expect(sent).toBe(false);
    expect(f.messages).toEqual([]);
    acknowledgeSteer();
    await sending;
    expect(sent).toBe(true);
    expect(f.messages).toHaveLength(1);
    vi.spyOn(f.runs.messages, "steer").mockRejectedValue(new Error("Native retirement was refused"));
    await expect(controls.sendCell(child.agentId, "Again")).rejects.toThrow("Native retirement was refused");
    let acknowledgeCancel!: () => void;
    const originalCancel = f.runs.cancel.bind(f.runs);
    vi.spyOn(f.runs, "cancel").mockImplementation(async (runId) => {
      await new Promise<void>((resolve) => {
        acknowledgeCancel = resolve;
      });
      return originalCancel(runId);
    });
    let cancelled = false;
    const cancelling = controls.cancelCell(child.agentId).then(() => {
      cancelled = true;
    });
    await vi.waitFor(() => expect(acknowledgeCancel).toBeTypeOf("function"));
    expect(cancelled).toBe(false);
    expect(f.service.get(child.agentId).state).toBe("running");
    acknowledgeCancel();
    await cancelling;
    expect(cancelled).toBe(true);
    expect(f.service.get(child.agentId).state).toBe("cancelled");
  } finally {
    f.close();
  }
});

it("uses indexed exact family provenance despite more than 4096 unrelated historical reservations", async () => {
  const f = fixture();
  try {
    f.repo.saveRun({ ...f.parent, runId: "unrelated-history", pageIds: [] });
    const history = f.service.createGroup({
      parentRunId: "unrelated-history",
      tokenBudget: 2000,
      costBudgetUsd: 0.5,
      timeBudgetMs: 60_000,
    });
    const group = f.service.createGroup({
      parentRunId: f.parent.runId,
      tokenBudget: 2000,
      costBudgetUsd: 0.5,
      timeBudgetMs: 60_000,
    });
    const child = await f.service.spawn({
      groupId: group.groupId,
      goal: "Relevant",
      pageIds: ["one"],
      profile: "read_only",
      tokenAllocation: 1000,
      costAllocationUsd: 0.2,
    });
    f.db.exec("BEGIN");
    const insert = f.db.prepare(
      "INSERT INTO subagents(agent_id,group_id,reserved_run_id,state,body,created_at) VALUES(?,?,?,'completed',?,?)",
    );
    for (let i = 0; i < 4100; i++) {
      const agentId = `historical-${i}`,
        runId = `historical-run-${i}`;
      const body = { ...child, agentId, groupId: history.groupId, runId };
      insert.run(
        agentId,
        history.groupId,
        runId,
        f.repo.protectRecordField("subagents", [agentId], "body", JSON.stringify(body)),
        Date.now(),
      );
    }
    f.db.exec("COMMIT");
    const reveal = vi.spyOn(f.repo, "revealRecordField");
    expect(runRoot(f.repo, child.runId!)).toBe(f.parent.runId);
    expect(lineageRuns(f.repo, f.parent.runId)).toEqual([f.parent.runId, child.runId]);
    expect(reveal.mock.calls.length).toBeLessThan(20);
    expect(f.db.prepare("SELECT COUNT(*) AS total FROM subagents").get()).toMatchObject({ total: 4101 });
    f.repo.saveModelCall({
      callId: "retained-child-cost",
      runId: child.runId,
      role: "agent",
      modelId: "served",
      durationMs: 1,
      costUsd: 0.25,
      createdAt: Date.now(),
    });
    f.db.prepare("UPDATE subagents SET state='completed' WHERE agent_id=?").run(child.agentId);
    expect(lineageRuns(f.repo, f.parent.runId).flatMap((id) => f.repo.listModelCalls(id))).toMatchObject([
      { costUsd: 0.25 },
    ]);
    expect(() => lineageRuns(f.repo, "unrelated-history")).toThrow(/bounded authority/);
  } finally {
    f.close();
  }
});

it("refuses a reservation index that no longer matches its protected run provenance", async () => {
  const f = fixture();
  try {
    const group = f.service.createGroup({
      parentRunId: f.parent.runId,
      tokenBudget: 2000,
      costBudgetUsd: 0.5,
      timeBudgetMs: 60_000,
    });
    const child = await f.service.spawn({
      groupId: group.groupId,
      goal: "Relevant",
      pageIds: ["one"],
      profile: "read_only",
      tokenAllocation: 1000,
      costAllocationUsd: 0.2,
    });
    f.db
      .prepare("UPDATE subagents SET reserved_run_id='foreign-reservation' WHERE agent_id=?")
      .run(child.agentId);
    expect(() => runRoot(f.repo, child.runId!)).toThrow(/provenance changed/);
    expect(() => lineageRuns(f.repo, f.parent.runId)).toThrow(/provenance changed/);
  } finally {
    f.close();
  }
});

it("keeps explicitly unlimited child budgets absent from the run cost cap", async () => {
  const f = fixture();
  try {
    const group = f.service.createGroup({
      parentRunId: f.parent.runId,
      tokenBudget: 0,
      costBudgetUsd: 0,
      timeBudgetMs: 0,
    });
    const agent = await f.service.spawn({
      groupId: group.groupId,
      goal: "Research",
      pageIds: ["one"],
      profile: "default",
      tokenAllocation: 0,
      costAllocationUsd: 0,
      maxModelCalls: 0,
    });
    f.service.sendMessage(agent.agentId, agent.runId!, "Continue researching");
    expect(f.messages).toHaveLength(1);
    expect(f.starts[0]).toMatchObject({ deadlineMs: 0, maxModelCalls: 0 });
    expect(f.starts[0]?.maxCostUsd).toBeUndefined();
    expect(f.service.view(group.groupId).group.deadlineAt).toBe(0);
  } finally {
    f.close();
  }
});

it("isolates a package-authored coder while preserving shared browser profiles and parent authority", async () => {
  const create = vi.fn(async (parentRoot: string, _parentRunId: string, childRunId: string) => ({
    root: `/aux/worktrees/${childRunId}`,
    parentRoot,
    baseCommit: "synthetic",
    snapshotDigest: "a".repeat(64),
    integrated: false,
  }));
  const f = fixture({ create });
  try {
    f.parent.config = {
      ...f.parent.config,
      projectRoot: "/reviewed/project",
      agentProfile: {
        name: "parent",
        prompt: "Parent",
        tools: ["read_file", "apply_changes"],
        packages: [],
        workspace: "shared",
      },
      auxPackages: [
        AuxPackageSnapshotSchema.parse({
          manifest: {
            schemaVersion: 1,
            name: "project-coding",
            version: "1.0.0",
            profiles: [
              {
                name: "project-coder",
                prompt: "Implement this project change.",
                tools: ["read_file", "apply_changes", "bash"],
                workspace: "isolated",
                limits: { maxCostUsd: 0 },
              },
            ],
          },
          digest: "b".repeat(64),
          skills: [],
        }),
      ],
    };
    f.repo.saveRun(f.parent);
    const group = f.service.createGroup({
      parentRunId: f.parent.runId,
      tokenBudget: 0,
      costBudgetUsd: 0,
      timeBudgetMs: 0,
    });
    const child = await f.service.spawn({
      groupId: group.groupId,
      goal: "Independent code task",
      tokenAllocation: 0,
      costAllocationUsd: 0,
      profile: "project-coder",
      pageIds: [],
    });
    expect(create).toHaveBeenCalledWith("/reviewed/project", f.parent.runId, child.runId);
    expect(f.starts[0]).toMatchObject({
      projectRoot: child.worktree!.root,
      coderWorktree: child.worktree,
      agentProfile: { workspace: "isolated", tools: ["read_file", "apply_changes"] },
      maxCostUsd: 0,
    });
    expect(f.repo.getRun(f.parent.runId)?.config?.projectRoot).toBe("/reviewed/project");
    await f.service.spawn({
      groupId: group.groupId,
      goal: "Browser work",
      tokenAllocation: 0,
      costAllocationUsd: 0,
      profile: "default",
      pageIds: ["one"],
    });
    expect(create).toHaveBeenCalledTimes(1);
    expect(f.starts[1]).toMatchObject({
      projectRoot: "/reviewed/project",
      agentProfile: { workspace: "shared" },
    });
  } finally {
    f.close();
  }
});

it("preserves the original parked group and restores a crash-time worktree handle without replay", async () => {
  const create = vi.fn(async () => {
    throw new AuxError("needs_input", "Review this isolated worktree.");
  });
  const f = fixture({ create });
  let restored: SubagentService | undefined;
  try {
    f.parent.config = { ...f.parent.config, projectRoot: "/reviewed/project" };
    f.repo.saveRun(f.parent);
    const group = f.service.createGroup({
      parentRunId: f.parent.runId,
      tokenBudget: 0,
      costBudgetUsd: 0,
      timeBudgetMs: 0,
    });
    const input = {
      groupId: group.groupId,
      goal: "Coding cell",
      profile: "coder",
      pageIds: [],
      tokenAllocation: 0,
      costAllocationUsd: 0,
    };
    await expect(f.service.spawn(input, "original-spawn")).rejects.toMatchObject({ code: "needs_input" });
    const original = f.service.view(group.groupId).agents[0]!;
    f.service.close();
    f.parent.status = "interrupted";
    f.repo.saveRun(f.parent);
    const recovery = {
      actionId: "durable-intent",
      root: `/aux/worktrees/${original.runId}`,
      parentRoot: "/reviewed/project",
      baseCommit: "synthetic",
      snapshotDigest: "a".repeat(64),
      state: "incomplete" as const,
    };
    const recover = vi.fn(() => recovery);
    const resumeCreate = vi.fn(async () => ({
      root: recovery.root,
      parentRoot: recovery.parentRoot,
      baseCommit: recovery.baseCommit,
      snapshotDigest: recovery.snapshotDigest,
      integrated: false,
    }));
    restored = new SubagentService(f.repo, f.events, f.runs, { create: resumeCreate, recover });
    await vi.waitFor(() => expect(restored!.view(group.groupId).agents[0]?.recovery).toEqual(recovery));
    expect(resumeCreate).not.toHaveBeenCalled();
    expect(recover).toHaveBeenCalledWith(f.parent.runId, original.runId);
    f.parent.status = "running";
    f.repo.saveRun(f.parent);
    expect(
      restored.createGroup({ parentRunId: f.parent.runId, tokenBudget: 0, costBudgetUsd: 0, timeBudgetMs: 0 })
        .groupId,
    ).toBe(group.groupId);
    const resumed = await restored.spawn(input, "original-spawn");
    expect(resumed.agentId).toBe(original.agentId);
    expect(resumed.runId).toBe(original.runId);
    expect(restored.view(group.groupId).agents).toHaveLength(1);
  } finally {
    restored?.close();
    f.close();
  }
});
