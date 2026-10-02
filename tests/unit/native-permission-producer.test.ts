import { SafetyAuthorityRevocation } from "../../apps/runtime/src/safety/authority-revocation.js";
import { afterEach, expect, it } from "vitest";
import { AuxError, PageTargetSchema, RunSchema, type EgressLease, type OriginRule } from "@aux/contracts";
import { openDb } from "@aux/runtime";
import { NullNativeBridge } from "../../apps/runtime/src/native.js";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { BrowserEgress } from "../../apps/runtime/src/safety/browser-egress.js";
import { DecisionJournal } from "../../apps/runtime/src/safety/decide.js";
import { SafetyDispatchGate } from "../../apps/runtime/src/safety/dispatch.js";
import {
  NativePermissionController,
  NativePermissionRequestSchema,
} from "../../apps/runtime/src/safety/native-permission.js";
import { TurnMentionService } from "../../apps/runtime/src/services/turn-mention-service.js";
const cleanup: Array<() => void> = [];
afterEach(() => cleanup.splice(0).forEach((dispose) => dispose()));
async function fixture(readOnly = false, external = false) {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const approvals = new ApprovalStore(db);
  let rules: OriginRule[] = [];
  const gate = new SafetyDispatchGate({
    approvals,
    journal: new DecisionJournal(db),
    managedRules: () => [],
    userRules: () => rules,
    localCeiling: () => "ask",
    audit: () => {},
  });
  const page = PageTargetSchema.parse({
    pageId: "tab",
    targetId: "target",
    backend: "aux",
    windowId: "main",
    url: "https://permission.test/page",
    title: "Fixture",
    documentEpoch: 3,
    sessionId: "fixture-attachment",
    lastRevision: 0,
    viewStatus: "visible",
    lifecycle: "live",
    controller: "none",
    controllerEpoch: 0,
    ownedByRuntime: true,
    createdAt: 1,
    lastActiveAt: 1,
  });
  const run = RunSchema.parse({
    runId: "run",
    status: "running",
    goal: "Review permissions",
    pageIds: [page.pageId],
    plan: null,
    artifacts: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    config: {
      implementation: external ? "external-agent" : "builtin-agent",
      taskId: "task",
      taskRevision: 4,
      contextWorkspaceId: "workspace",
      messageRevision: 0,
    },
  });
  const leases: EgressLease[] = [];
  const native = Object.assign(new NullNativeBridge(), {
    egressContext: async () => ({
      profileId: "profile",
      tabId: page.pageId,
      frameId: "process:frame",
      documentToken: "native-document",
      sourceOrigin: "https://permission.test",
      isolation: {
        isolationId: "isolated",
        runId: run.runId,
        taskId: "task",
        taskRevision: 4,
        inMemory: true as const,
        cookies: "empty" as const,
      },
    }),
    egressInstall: async ({ lease }: { lease: EgressLease }) => {
      leases.push(lease);
      return { accepted: true as const };
    },
    egressRevoke: async () => ({ accepted: true as const }),
  });
  let owns = true;
  const egress = new BrowserEgress({
    profileId: "profile",
    native,
    run: () => ({ taskId: run.config?.taskId, taskRevision: run.config?.taskRevision ?? 0, threadId: "run" }),
    page: () => page,
    ownsPage: () => owns,
    audit: () => {},
    approve: async () => false,
  });
  cleanup.push(() => egress.close());
  await egress.acquire(run.runId, page.pageId);
  const mentions = new TurnMentionService({
    page: (id) => (id === page.pageId ? page : undefined),
    organization: async () => ({ revision: 1, shared: null }),
    routine: () => undefined,
    connectors: () => ({ entries: [], access: [] }),
  });
  if (!external)
    await mentions.begin(
      run.runId,
      readOnly
        ? [
            {
              kind: "tab",
              pageId: page.pageId,
              title: page.title,
              url: page.url,
              documentEpoch: page.documentEpoch,
              sessionId: page.sessionId!,
              access: "read",
            },
          ]
        : [],
      [],
    );
  let onlyStanding = false;
  const controller = new NativePermissionController({
    profileId: "profile",
    approvals,
    gate,
    egress,
    mentions,
    page: () => page,
    run: () => run,
    standingOnly: () => onlyStanding,
    requiresTurn: () => !external,
    sourceCheck: () => () => {
      if (!owns) throw new AuxError("permission_denied", "Lease owner retired.");
    },
  });
  const lease = leases[0]!;
  const request = NativePermissionRequestSchema.parse({
    leaseId: lease.leaseId,
    isolationId: lease.isolationId,
    profileId: lease.profileId,
    runId: lease.runId,
    taskId: lease.taskId,
    taskRevision: lease.taskRevision,
    tabId: lease.tabId,
    frameId: lease.frameId,
    documentToken: lease.documentToken,
    documentEpoch: lease.documentEpoch,
    batchId: "native-batch",
    requestingOrigin: "https://permission.test",
    embeddingOrigin: "https://permission.test",
    permissionTypes: ["notifications"],
    requestedAt: Date.now(),
  });
  return {
    db,
    approvals,
    page,
    run,
    mentions,
    egress,
    controller,
    request,
    overnight: () => {
      onlyStanding = true;
    },
    retire: () => {
      owns = false;
    },
    block: () => {
      rules = [{ origin: "https://permission.test/", access: "deny" }];
    },
  };
}
it("native permissions park at the real gate and consume exact one-off consent once", async () => {
  const f = await fixture();
  const waiting = await f.controller.request(f.request);
  expect(waiting).toMatchObject({
    batchId: f.request.batchId,
    decision: "pending",
    approvalId: expect.any(String),
  });
  f.approvals.decideLocal({ decision: "accept", approvalId: waiting.approvalId! }, "run");
  expect(await f.controller.request(f.request)).toEqual({ batchId: f.request.batchId, decision: "allow" });
  expect(await f.controller.request(f.request)).toEqual({ batchId: f.request.batchId, decision: "deny" });
  expect(f.mentions.ownedPages("run")).toEqual([]);
});
it("an exact-origin permission grant still cannot bypass a subsequent read-only person selection", async () => {
  const f = await fixture();
  const waiting = await f.controller.request(f.request);
  f.approvals.decideLocal({ decision: "acceptForOrigin", approvalId: waiting.approvalId! }, "run");
  expect(await f.controller.request(f.request)).toMatchObject({ decision: "allow" });
  await f.mentions.begin(
    "run",
    [
      {
        kind: "tab",
        pageId: f.page.pageId,
        title: f.page.title,
        url: f.page.url,
        documentEpoch: f.page.documentEpoch,
        sessionId: f.page.sessionId!,
        access: "read",
      },
    ],
    [],
  );
  expect(await f.controller.request({ ...f.request, batchId: "second-batch" })).toMatchObject({
    decision: "deny",
  });
});
it.each(["attachment", "document", "task", "owner", "turn", "policy", "cancel"])(
  "pending permission refuses changed %s authority",
  async (change) => {
    const f = await fixture();
    const waiting = await f.controller.request(f.request);
    expect(waiting.decision).toBe("pending");
    f.approvals.decideLocal({ decision: "accept", approvalId: waiting.approvalId! }, "run");
    if (change === "attachment") f.page.sessionId = "replacement-attachment";
    if (change === "document") f.page.documentEpoch++;
    if (change === "task") f.run.config = { ...f.run.config, taskRevision: 5 };
    if (change === "owner") f.retire();
    if (change === "turn") await f.mentions.begin("run", [], []);
    if (change === "policy") f.block();
    if (change === "cancel") f.controller.invalidate(f.request.batchId);
    expect(await f.controller.request(f.request)).toMatchObject({ decision: "deny" });
  },
);
it("foreign-frame and altered batch evidence fail closed without new consent", async () => {
  const f = await fixture();
  expect(
    await f.controller.request({ ...f.request, requestingOrigin: "https://foreign.test" }),
  ).toMatchObject({ decision: "deny" });
  const waiting = await f.controller.request(f.request);
  expect(waiting.decision).toBe("pending");
  expect(await f.controller.request({ ...f.request, permissionTypes: ["clipboard"] })).toMatchObject({
    decision: "deny",
  });
  expect(await f.controller.request(f.request)).toMatchObject({ decision: "deny" });
});
it("OS-auth, camera, install and model supplied permission evidence cannot enter the native producer", () => {
  for (const permission of ["camera_stream", "mic_stream", "identity_provider", "web_app_installation"])
    expect(NativePermissionRequestSchema.safeParse({ permissionTypes: [permission] }).success).toBe(false);
});

it("a genuine no-mention external lease retains first-class permission authority without empty turn grants", async () => {
  const f = await fixture(false, true);
  expect(f.mentions.has("run")).toBe(false);
  const waiting = await f.controller.request(f.request);
  expect(waiting.decision).toBe("pending");
  f.approvals.decideLocal({ decision: "accept", approvalId: waiting.approvalId! }, "run");
  expect(await f.controller.request(f.request)).toMatchObject({ decision: "allow" });
  expect(f.mentions.has("run")).toBe(false);
  expect(f.mentions.ownedPages("run")).toEqual([]);
});

it.each([
  "notifications",
  "clipboard",
  "idle_detection",
  "local_fonts",
  "multiple_downloads",
  "keyboard_lock",
  "pointer_lock",
] as const)(
  "the actual native %s key parks as permission and consumes one exact batch",
  async (permission) => {
    const f = await fixture();
    const request = { ...f.request, permissionTypes: [permission] };
    const pending = await f.controller.request(request);
    expect(pending).toMatchObject({ decision: "pending", approvalId: expect.any(String) });
    const decisions = f.db.prepare("SELECT request_json AS requestJson FROM safety_decisions").all();
    expect(decisions).toHaveLength(1);
    expect(JSON.parse(String(decisions[0]!.requestJson))).toMatchObject({
      category: "permission",
      effect: "write",
      action: "browser.permission.accept",
      origin: "https://permission.test",
    });
    f.approvals.decideLocal({ decision: "accept", approvalId: pending.approvalId! }, "run");
    expect(await f.controller.request(request)).toMatchObject({ decision: "allow" });
    expect(await f.controller.request(request)).toMatchObject({ decision: "deny" });
  },
);

it("an overnight native permission cannot consume a foreground one-off approval", async () => {
  const f = await fixture();
  const waiting = await f.controller.request(f.request);
  f.approvals.decideLocal({ decision: "accept", approvalId: waiting.approvalId! }, "run");
  f.overnight();
  expect(await f.controller.request(f.request)).toMatchObject({ decision: "pending" });
});

it("an overnight native permission can use the exact current origin permission grant", async () => {
  const f = await fixture();
  const waiting = await f.controller.request(f.request);
  f.approvals.decideLocal({ decision: "acceptForOrigin", approvalId: waiting.approvalId! }, "run");
  f.overnight();
  expect(await f.controller.request(f.request)).toMatchObject({ decision: "allow" });
});

function revocation(f: Awaited<ReturnType<typeof fixture>>) {
  return new SafetyAuthorityRevocation({ profileId: "profile", runScope: () => ({ kind: "task", id: "task" }),
    invalidate: matches => { f.controller.invalidateAuthority(matches); return f.egress.invalidateAuthority(matches); } });
}
it("a policy revoked after the allow reply retires the exact effect lease while preserving task ownership", async () => {
  const f = await fixture();
  const pending = await f.controller.request(f.request);
  f.approvals.decideLocal({ decision: "accept", approvalId: pending.approvalId! }, "run");
  expect(await f.controller.request(f.request)).toMatchObject({ decision: "allow" });
  const nativeFinalCheck = f.egress.permissionAuthority(f.request);
  nativeFinalCheck();
  f.block();
  const retirement = revocation(f).policies([], [{ origin: "https://permission.test/", access: "deny" }]);
  expect(nativeFinalCheck).toThrow();
  await retirement;
  expect(await f.controller.request(f.request)).toMatchObject({ decision: "deny" });
  expect(f.run.pageIds).toEqual(["tab"]);
  expect(f.mentions.has("run")).toBe(true);
});
it("revoking an origin grant retires a permission lease across scopes and cancels only matching pending consent", async () => {
  const f = await fixture();
  await f.controller.request(f.request);
  const currentAction = f.approvals.pending("run")[0]!.action;
  const crossScopeId = f.approvals.issue({ ...currentAction, scope: { kind: "task", id: "different-task" },
    turnId: "grant-run", threadId: "grant-thread" }, "turn");
  f.approvals.decideLocal({ decision: "acceptForOrigin", approvalId: crossScopeId }, "grant-run");
  const grant = f.approvals.listGrants("profile")[0]!;
  const otherId = f.approvals.issue({ ...currentAction, scope: { kind: "task", id: "other" },
    origin: "https://unrelated.test", turnId: "other", threadId: "other" }, "turn");
  expect(await f.controller.request(f.request)).toMatchObject({ decision: "allow" });
  const finalCheck = f.egress.permissionAuthority(f.request);
  f.approvals.revoke({ profileId: "profile", grantId: grant.grantId });
  await revocation(f).grants([grant]);
  expect(finalCheck).toThrow();
  expect(f.approvals.pending("other").map(item => item.approvalId)).toContain(otherId);
});


it("immutable native retries retain one exact pending approval until person consent", async () => {
  const f = await fixture();
  const serialized = JSON.stringify(f.request);
  const first = await f.controller.request(f.request);
  expect(first).toMatchObject({ decision: "pending", approvalId: expect.any(String) });
  for (let retry = 0; retry < 3; retry++)
    expect(await f.controller.request(JSON.parse(serialized))).toEqual(first);
  expect(f.approvals.pending("run").map(item => item.approvalId)).toEqual([first.approvalId]);
  expect(JSON.stringify(f.request)).toBe(serialized);
  f.approvals.decideLocal({ decision: "accept", approvalId: first.approvalId! }, "run");
  expect(await f.controller.request(JSON.parse(serialized))).toEqual({ batchId: f.request.batchId, decision: "allow" });
  expect(await f.controller.request(JSON.parse(serialized))).toEqual({ batchId: f.request.batchId, decision: "deny" });
});

it("simultaneous identical native requests share the real pending approval rather than competing IDs", async () => {
  const f = await fixture();
  const responses = await Promise.all([f.controller.request(f.request), f.controller.request(f.request), f.controller.request(f.request)]);
  expect(responses[0]).toMatchObject({ decision: "pending", approvalId: expect.any(String) });
  expect(responses[1]).toEqual(responses[0]);
  expect(responses[2]).toEqual(responses[0]);
  expect(f.approvals.pending("run").map(item => item.approvalId)).toEqual([responses[0]!.approvalId]);
  f.controller.invalidate(f.request.batchId);
  expect(f.approvals.pending("run")).toEqual([]);
  expect(await f.controller.request(f.request)).toMatchObject({ decision: "deny" });
});

it("a hidden overnight permission uses only its exact standing grant and remains one-use", async () => {
  const f = await fixture();
  const pending = await f.controller.request(f.request);
  f.approvals.decideLocal({ decision: "acceptForOrigin", approvalId: pending.approvalId! }, "run");
  f.page.viewStatus = "hidden";
  f.overnight();
  expect(await f.controller.request(f.request)).toEqual({ batchId: f.request.batchId, decision: "allow" });
  expect(await f.controller.request(f.request)).toEqual({ batchId: f.request.batchId, decision: "deny" });
  expect(f.mentions.ownedPages("run")).toEqual([]);
});
