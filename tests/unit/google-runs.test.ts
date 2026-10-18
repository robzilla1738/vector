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
import type { GoogleAccount } from "@aux/contracts/google";
import { DocumentSnapshots } from "../../apps/runtime/src/services/document-snapshots.js";
import { GoogleGrantService } from "../../apps/runtime/src/services/google-grants.js";
import { GoogleOperationService } from "../../apps/runtime/src/services/google-operations.js";
import type { GoogleAccountService } from "../../apps/runtime/src/services/google-accounts.js";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
const closes: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of closes.splice(0)) await close();
});
function fixture(connected = true, pending = false) {
  const dir = mkdtempSync(join(tmpdir(), "aux-google-run-")),
    repo = new Repo(openDb(":memory:")),
    events = new EventBus(repo),
    tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Google fixture"),
    task = tasks.create({
      workspaceId: workspace.workspaceId,
      title: "Mail research",
      objective: "Read admitted fixture mail",
      criteria: [{ criterionId: "read", description: "Read", verification: "manual" }],
    });
  const account: GoogleAccount = {
    connectionId: randomUUID(),
    revision: "a".repeat(64),
    accountKey: "me@example.test",
    label: "Synthetic fixture",
    scopes: ["https://www.googleapis.com/auth/gmail.readonly"],
    operations: ["gmail.search"],
    state: "active",
    createdAt: 1,
    updatedAt: 1,
  };
  repo.db
    .prepare(
      "INSERT INTO calendar_connections(connection_id,provider,account_key,account_key_lookup,label,secret_name,scopes,state,created_at,updated_at) VALUES(?,'google','fixture','fixture','fixture','fixture','[]','active',1,1)",
    )
    .run(account.connectionId);
  const accounts = {
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
  } as unknown as GoogleAccountService;
  const grants = new GoogleGrantService(repo, accounts),
    grant = grants.create({
      taskId: task.taskId,
      taskRevision: task.revision,
      workspaceId: workspace.workspaceId,
      connectionId: account.connectionId,
      accountRevision: account.revision,
      operations: ["gmail.search"],
    });
  const network = vi.fn<typeof fetch>().mockImplementation(async (_url, options) => {
    if (pending)
      await new Promise<never>((_resolve, reject) => {
        options!.signal!.addEventListener("abort", () => reject(options!.signal!.reason), { once: true });
      });
    return Response.json({
      messages: [{ id: "fixture-message", threadId: "fixture-thread" }],
      resultSizeEstimate: 1,
    });
  });
  const authorize = vi.fn(async () => () => {}),
    writes = new DurableWriteLedger(repo.db),
    google = new GoogleOperationService({ repo, accounts, grants, writes, fetch: network, authorize });
  const model = new MockModelClient().scriptToolSteps([
    {
      toolCalls: [
        {
          toolCallId: "original-google-search",
          toolName: "google_operation",
          input: {
            grantId: grant.grantId,
            operation: "gmail.search",
            args: { query: "subject:fixture", limit: 10 },
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
    googleAccounts: accounts,
    googleGrants: grants,
    google,
  });
  // The fixture has no provider/model spend. Production funding remains untouched.
  runs.coordinator.deps.funding = undefined;
  closes.push(async () => {
    await runs.close();
    await google.close();
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
it("executes the model's typed Google tool through its original RunService control and real REST adapter", async () => {
  const f = fixture(),
    run = await f.start();
  await vi.waitFor(() => expect(f.repo.getRun(run.runId)?.status).toBe("completed"));
  expect(f.network).toHaveBeenCalledOnce();
  const [url, options] = f.network.mock.calls[0]!;
  expect(String(url)).toContain("gmail/v1/users/me/messages?");
  expect(new URL(String(url)).searchParams.get("q")).toBe("subject:fixture");
  expect(options!.signal).toBeInstanceOf(AbortSignal);
  expect(f.authorize).toHaveBeenCalledWith(
    expect.objectContaining({ runId: run.runId, grantId: f.grant.grantId, operation: "gmail.search" }),
    expect.any(AbortSignal),
  );
  expect(f.repo.getRun(run.runId)?.config?.googleGrantIds).toEqual([f.grant.grantId]);
  expect(JSON.stringify(new TranscriptStore(f.repo.db).load(run.runId))).toContain("fixture-message");
});
it("omits Google tools when no functioning account operation was captured", async () => {
  const f = fixture(false);
  const request = vi.spyOn(f.model, "toolCallStep");
  const run = await f.start();
  await vi.waitFor(() => expect(f.repo.getRun(run.runId)?.status).toBe("completed"));
  expect(request.mock.calls[0]![0].tools).not.toHaveProperty("google_operation");
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
    f.runs.googleOperation({
      runId: run.runId,
      taskId: f.grant.taskId,
      taskRevision: f.grant.taskRevision,
      workspaceId: f.grant.workspaceId,
      connectionId: f.grant.connectionId,
      accountRevision: f.grant.accountRevision,
      grantId: f.grant.grantId,
      actionId: "detached",
      operation: "gmail.search",
      args: { query: "fixture" },
    }),
  ).rejects.toThrow(/original run/);
});
