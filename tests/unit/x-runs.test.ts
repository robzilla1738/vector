import { afterEach, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  ArtifactStore,
  DurableWriteLedger,
  EventBus,
  MockModelClient,
  Repo,
  RunService,
  SetService,
  TaskService,
  TranscriptStore,
  openDb,
  type PageService,
  type SettingsService,
} from "@aux/runtime";
import type { XAccount } from "@aux/contracts/x";
import { DocumentSnapshots } from "../../apps/runtime/src/services/document-snapshots.js";
import { XGrantService } from "../../apps/runtime/src/services/x-grants.js";
import { XOperationService } from "../../apps/runtime/src/services/x-operations.js";
import type { XAccountService } from "../../apps/runtime/src/services/x-accounts.js";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
const closes: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of closes.splice(0)) await close();
});
function fixture(connected = true, pending = false) {
  const dir = mkdtempSync(join(tmpdir(), "aux-x-run-")),
    repo = new Repo(openDb(":memory:")),
    events = new EventBus(repo),
    tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("X fixture"),
    task = tasks.create({
      workspaceId: workspace.workspaceId,
      title: "Mail research",
      objective: "Read admitted fixture mail",
      criteria: [{ criterionId: "read", description: "Read", verification: "manual" }],
    });
  const account: XAccount = {
    connectionId: randomUUID(),
    revision: "a".repeat(64),
    userId: "123456789",
    username: "fixture_owner",
    label: "Synthetic fixture",
    scopes: ["tweet.read", "users.read", "offline.access"],
    operations: ["posts.search"],
    state: "active",
    createdAt: 1,
    updatedAt: 1,
  };
  repo.db
    .prepare("INSERT INTO x_accounts(connection_id,user_id_lookup,body) VALUES(?,'fixture','fixture')")
    .run(account.connectionId);
  const accounts = {
    ready: async () => {},
    list: () => ({ available: connected, connections: connected ? [structuredClone(account)] : [] }),
    account: () => structuredClone(account),
    withAccess: async (
      _id: string,
      _revision: string,
      _scopes: readonly string[],
      signal: AbortSignal,
      operation: (input: unknown) => Promise<unknown>,
    ) =>
      operation({
        token: "fixture-never-live",
        signal,
        source: structuredClone(account),
        checkCurrent: () => signal.throwIfAborted(),
      }),
  } as unknown as XAccountService;
  const grants = new XGrantService(repo, accounts),
    grant = grants.create({
      taskId: task.taskId,
      taskRevision: task.revision,
      workspaceId: workspace.workspaceId,
      connectionId: account.connectionId,
      accountRevision: account.revision,
      operations: ["posts.search"],
    });
  const network = vi.fn<typeof fetch>().mockImplementation(async (_url, options) => {
    if (pending)
      await new Promise<never>((_resolve, reject) => {
        options!.signal!.addEventListener("abort", () => reject(options!.signal!.reason), { once: true });
      });
    return Response.json({
      data: [{ id: "12345", text: "Fixture post" }],
      meta: { result_count: 1 },
    });
  });
  const authorize = vi.fn(async () => () => {}),
    writes = new DurableWriteLedger(repo.db),
    x = new XOperationService({ repo, accounts, grants, writes, fetch: network, authorize });
  const model = new MockModelClient().scriptToolSteps([
    {
      toolCalls: [
        {
          toolCallId: "original-x-search",
          toolName: "x_operation",
          input: {
            grantId: grant.grantId,
            operation: "posts.search",
            args: { query: "fixture", limit: 10 },
          },
        },
      ],
    },
    { text: "Read the fixture mail." },
  ]);
  const settings = {
    maxWorkers: () => 1,
    perOrigin: () => 1,
    maxModelCalls: () => 4,
    agentPolicy: () => ({ agentMode: "ask", agentPolicyRevision: 0 }),
    all: () => ({ dataDir: dir }),
    plannerModel: () => "test/model",
    recoveryModel: () => undefined,
    model: () => model,
    registryModels: () => [],
    modelCacheGeneration: () => 0,
    agentRoute: () => ({ modelId: "test/model" }),
  } as unknown as SettingsService;
  const pages = {
      ready: async () => {},
      list: () => [],
      get: () => {
        throw Error("No admitted pages");
      },
    } as unknown as PageService,
    snapshots = new DocumentSnapshots(repo);
  const runs = new RunService({
    repo,
    events,
    pages,
    settings,
    turnMentions: fixtureTurnMentions(() => undefined),
    sets: new SetService(repo, events, pages),
    artifacts: new ArtifactStore(dir, repo, events),
    documentSnapshots: snapshots,
    nativeAvailable: () => false,
    xAccounts: accounts,
    xGrants: grants,
    x,
  });
  // The fixture has no provider/model spend. Production funding remains untouched.
  runs.coordinator.deps.funding = undefined;
  closes.push(async () => {
    await runs.close();
    await x.close();
    await snapshots.close();
    repo.close();
    rmSync(dir, { recursive: true, force: true });
  });
  const start = () =>
    runs.coordinator.start({
      goal: "Search admitted fixture mail",
      pageIds: [],
      taskId: task.taskId,
      taskRevision: task.revision,
      contextWorkspaceId: workspace.workspaceId,
      maxModelCalls: 4,
    });
  return { runs, repo, network, authorize, model, grant, start };
}
it("executes the model's typed X tool through its original RunService control and real REST adapter", async () => {
  const f = fixture(),
    run = await f.start();
  await vi.waitFor(() => expect(f.repo.getRun(run.runId)?.status).toBe("completed"));
  expect(f.network).toHaveBeenCalledOnce();
  const [url, options] = f.network.mock.calls[0]!;
  expect(String(url)).toContain("/2/tweets/search/recent?");
  expect(new URL(String(url)).searchParams.get("query")).toBe("fixture");
  expect(options!.signal).toBeInstanceOf(AbortSignal);
  expect(f.authorize).toHaveBeenCalledWith(
    expect.objectContaining({ runId: run.runId, grantId: f.grant.grantId, operation: "posts.search" }),
    expect.any(AbortSignal),
  );
  expect(f.repo.getRun(run.runId)?.config?.xGrantIds).toEqual([f.grant.grantId]);
  expect(JSON.stringify(new TranscriptStore(f.repo.db).load(run.runId))).toContain("12345");
});
it("omits X tools when no functioning account operation was captured", async () => {
  const f = fixture(false);
  const request = vi.spyOn(f.model, "toolCallStep");
  const run = await f.start();
  await vi.waitFor(() => expect(f.repo.getRun(run.runId)?.status).toBe("completed"));
  expect(request.mock.calls[0]![0].tools).not.toHaveProperty("x_operation");
  expect(f.network).not.toHaveBeenCalled();
});
it("cancels the original in-flight REST request on Stop and refuses detached invocation", async () => {
  const f = fixture(true, true),
    run = await f.start();
  await vi.waitFor(() => expect(f.network).toHaveBeenCalledOnce());
  await f.runs.cancel(run.runId, "fixture Stop");
  await vi.waitFor(() =>
    expect(["cancelled", "interrupted", "failed"]).toContain(f.repo.getRun(run.runId)?.status),
  );
  expect(f.network.mock.calls[0]![1]!.signal!.aborted).toBe(true);
  await expect(
    f.runs.xOperation({
      runId: run.runId,
      taskId: f.grant.taskId,
      taskRevision: f.grant.taskRevision,
      workspaceId: f.grant.workspaceId,
      connectionId: f.grant.connectionId,
      accountRevision: f.grant.accountRevision,
      grantId: f.grant.grantId,
      actionId: "detached",
      operation: "posts.search",
      args: { query: "fixture", limit: 10 },
    }),
  ).rejects.toThrow(/original run/);
});
