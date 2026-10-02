import { RuntimeShutdownAdmission } from "../../apps/runtime/src/services/runtime-shutdown.js";
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
async function fixture(readOnly = false, external = false, assertDispatch: (runId: string) => Promise<void> = async () => {}, runId = "run", overnightAuthority: (runId: string) => { windowEnd: number; requireAC: boolean } | null = () => null, retireReservation: (input: { tabId: string; batchId: string; reservationId: string }) => Promise<{ accepted: true }> = async () => ({ accepted: true })) {
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
    runId,
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
  const admission = new RuntimeShutdownAdmission();
  const controller = new NativePermissionController({
    profileId: "profile",
    approvals,
    gate,
    egress,
    mentions,
    page: () => page,
    run: () => run,
    standingOnly: () => onlyStanding,
    assertDispatch,
    overnightAuthority,
    retireReservation,
    requiresTurn: () => !external,
    sourceCheck: () => () => {
      admission.assertOpen();
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
    admission,
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
  expect(await f.controller.request(f.request)).toEqual({ batchId: f.request.batchId, decision: "allow", reservationId: expect.any(String) });
  expect(await f.controller.request(f.request)).toEqual({ batchId: f.request.batchId, decision: "deny" });
  expect(f.mentions.ownedPages("run")).toEqual([]);
});
it("an exact-origin permission grant still cannot bypass a subsequent read-only person selection", async () => {
  const f = await fixture();
  const waiting = await f.controller.request(f.request);
  f.approvals.decideLocal({ decision: "acceptForOrigin", approvalId: waiting.approvalId! }, "run");
  expect(await f.controller.request(f.request)).toMatchObject({ decision: "allow", reservationId: expect.any(String) });
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
  expect(await f.controller.request(f.request)).toMatchObject({ decision: "allow", reservationId: expect.any(String) });
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
    expect(await f.controller.request(request)).toMatchObject({ decision: "allow", reservationId: expect.any(String) });
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
  expect(await f.controller.request(f.request)).toMatchObject({ decision: "allow", reservationId: expect.any(String) });
});

function revocation(f: Awaited<ReturnType<typeof fixture>>) {
  return new SafetyAuthorityRevocation({ profileId: "profile", runScope: () => ({ kind: "task", id: "task" }),
    invalidate: matches => { f.controller.invalidateAuthority(matches); return f.egress.invalidateAuthority(matches); } });
}
it("a policy revoked after the allow reply retires the exact effect lease while preserving task ownership", async () => {
  const f = await fixture();
  const pending = await f.controller.request(f.request);
  f.approvals.decideLocal({ decision: "accept", approvalId: pending.approvalId! }, "run");
  expect(await f.controller.request(f.request)).toMatchObject({ decision: "allow", reservationId: expect.any(String) });
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
  expect(await f.controller.request(f.request)).toMatchObject({ decision: "allow", reservationId: expect.any(String) });
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
  expect(await f.controller.request(JSON.parse(serialized))).toEqual({ batchId: f.request.batchId, decision: "allow", reservationId: expect.any(String) });
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
  expect(await f.controller.request(f.request)).toEqual({ batchId: f.request.batchId, decision: "allow", reservationId: expect.any(String) });
  expect(await f.controller.request(f.request)).toEqual({ batchId: f.request.batchId, decision: "deny" });
  expect(f.mentions.ownedPages("run")).toEqual([]);
});


it("a real closed overnight window denies a standing native permission before scheduler reconciliation", async () => {
  const { Repo } = await import("@aux/runtime");
  const { SqliteColumnCipher } = await import("../../apps/runtime/src/store/sqlite-protection.js");
  const { NightShiftService } = await import("../../apps/runtime/src/services/night-shift.js");
  const { BudgetsService } = await import("../../apps/runtime/src/services/budgets.js");
  const { installOvernightAuthority } = await import("../../apps/runtime/src/services/overnight-authority.js");
  const { installNightShift, checkNightShiftDispatch, nightShiftEffectAuthority } = await import("../../apps/runtime/src/features/overnight-review/service.js");
  const { createClock } = await import("@aux/contracts");
  const { randomBytes, createHash } = await import("node:crypto");
  const db = openDb(":memory:"); cleanup.push(() => db.close());
  const stored = new Map<string, string>();
  const secret = (key: string) => { if (!stored.has(key)) stored.set(key, randomBytes(32).toString("base64")); return { value: stored.get(key)! }; };
  const cipher = await SqliteColumnCipher.create({ readSecret: async key => ({ value: stored.get(key) }),
    storeSecret: async (key, value) => { stored.set(key, value); return { ok: true }; },
    profileStorageRoot: async () => secret(`aux_root_v1_${createHash("sha256").update("fixture").digest("hex").slice(0, 24)}`), profileStorageFactor: async () => secret(`sqlite_factor_v1_${createHash("sha256").update("fixture").digest("hex").slice(0, 24)}`) }, "fixture", false);
  const repo = new Repo(db, cipher);
  let now = new Date(2026, 9, 1, 1).getTime();
  repo.setSetting("nightShift", { enabled: true, start: "00:00", end: "08:00", nightlyUsd: 2, perTaskUsd: 0.5, requireAC: true });
  let f: Awaited<ReturnType<typeof fixture>> | undefined;
  const service = new NightShiftService(repo, { backgroundEnabled: () => true, onAC: async () => true,
    releaseActivity: async () => {}, powerActivity: async () => ({ active: true }), cancel: () => {}, resume: async () => {},
    consolidate: async () => {}, reindex: async () => {}, start: async (_payload, item, runId) => {
      f = await fixture(false, true, id => checkNightShiftDispatch(repo, id), runId, id => nightShiftEffectAuthority(repo, id));
      f.run.config = { ...f.run.config, nightShiftItemId: item.id };
      repo.saveRun(f.run); f.overnight(); installOvernightAuthority(repo, f.controller); return runId;
    } }, new BudgetsService(db, () => ({})), createClock(1, () => now));
  const remove = installNightShift({ repo } as import("../../apps/runtime/src/api/methods/context.js").Services, service);
  try {
    const item = service.queue({ payload: { kind: "goal", goalId: "fixture-goal" }, budgetUsd: 0.4 });
    await service.tick();
    const actual = f!;
    const pending = await actual.controller.request(actual.request);
    expect(pending.decision).toBe("pending");
    actual.approvals.decideLocal({ decision: "acceptForOrigin", approvalId: pending.approvalId! }, actual.run.runId);
    const authorized = await actual.controller.request(actual.request);
    expect(authorized).toMatchObject({ decision: "allow", reservationId: expect.any(String) });
    const ticket = { batchId: actual.request.batchId, reservationId: authorized.reservationId! };
    expect(await actual.controller.revalidate({ ...ticket, nonce: 1 })).toEqual({ ...ticket, nonce: 1, decision: "allow",
      overnight: { windowEnd: new Date(2026, 9, 1, 8).getTime(), requireAC: true } });
    const next = { ...actual.request, batchId: "after-window" };
    now = new Date(2026, 9, 1, 8).getTime();
    expect(service.get(item.id).status).toBe("running");
    expect(repo.getRun(actual.run.runId)?.status).toBe("running");
    expect(await actual.controller.revalidate({ ...ticket, nonce: 2 })).toMatchObject({ decision: "deny" });
    expect(await actual.controller.request(next)).toEqual({ batchId: next.batchId, decision: "deny" });
    expect(actual.approvals.pending(actual.run.runId)).toEqual([]);
    expect(actual.approvals.listGrants("profile")).toHaveLength(1);
    // An unanswered exact batch may still report its actual pending approval;
    // it does not dispatch an effect or consume overnight foreground consent.
    actual.approvals.revoke({ profileId: "profile" });
    now = new Date(2026, 9, 1, 1).getTime();
    const unanswered = { ...actual.request, batchId: "parked-pending" };
    const waiting = await actual.controller.request(unanswered);
    expect(waiting.decision).toBe("pending");
    repo.saveRun({ ...actual.run, status: "needs_input" });
    await service.tick();
    expect(service.get(item.id).status).toBe("parked");
    expect(await actual.controller.request(unanswered)).toEqual(waiting);
    now = new Date(2026, 9, 1, 8).getTime();
    await service.tick();
    expect(service.get(item.id).status).toBe("needs_review");
    expect(await actual.controller.request(unanswered)).toEqual(waiting);
  } finally { await remove(); }
});


it("fresh permission reservations revalidate the exact consent once without consuming another approval", async () => {
  let closed = false;
  const f = await fixture(false, false, async () => { if (closed) throw new AuxError("permission_denied", "Window closed"); });
  const pending = await f.controller.request(f.request);
  f.approvals.decideLocal({ decision: "accept", approvalId: pending.approvalId! }, "run");
  const authorized = await f.controller.request(f.request);
  expect(authorized).toMatchObject({ decision: "allow", reservationId: expect.any(String) });
  const ticket = { batchId: f.request.batchId, reservationId: authorized.reservationId! };
  expect(await f.controller.revalidate({ ...ticket, nonce: 1 })).toEqual({ ...ticket, nonce: 1, decision: "allow" });
  expect(await f.controller.revalidate({ ...ticket, nonce: 1 })).toEqual({ ...ticket, nonce: 1, decision: "deny" });
  expect(f.approvals.pending("run")).toEqual([]);
  expect(await f.controller.revalidate({ ...ticket, nonce: 2 })).toMatchObject({ decision: "allow" });
  closed = true;
  expect(await f.controller.revalidate({ ...ticket, nonce: 3 })).toMatchObject({ decision: "deny" });
  expect(f.controller.finalize(ticket)).toEqual({ retired: false });
});

it("exact native finalization prevents reservation replay and rejects a foreign token", async () => {
  const f = await fixture();
  const pending = await f.controller.request(f.request);
  f.approvals.decideLocal({ decision: "accept", approvalId: pending.approvalId! }, "run");
  const authorized = await f.controller.request(f.request);
  const ticket = { batchId: f.request.batchId, reservationId: authorized.reservationId! };
  expect(f.controller.finalize({ ...ticket, reservationId: "00000000-0000-4000-8000-000000000000" })).toEqual({ retired: false });
  expect(await f.controller.revalidate({ ...ticket, nonce: 1 })).toMatchObject({ decision: "allow" });
  expect(f.controller.finalize(ticket)).toEqual({ retired: true });
  expect(f.controller.finalize(ticket)).toEqual({ retired: false });
  expect(await f.controller.revalidate({ ...ticket, nonce: 2 })).toMatchObject({ decision: "deny" });
});


it("a real origin-policy retirement cancels an authorized reservation before fresh redemption", async () => {
  const f = await fixture();
  const pending = await f.controller.request(f.request);
  f.approvals.decideLocal({ decision: "acceptForOrigin", approvalId: pending.approvalId! }, "run");
  const authorized = await f.controller.request(f.request);
  const ticket = { batchId: f.request.batchId, reservationId: authorized.reservationId! };
  f.block();
  await revocation(f).policies([], [{ origin: "https://permission.test/", access: "deny" }]);
  expect(await f.controller.revalidate({ ...ticket, nonce: 1 })).toMatchObject({ decision: "deny" });
  expect(f.controller.finalize(ticket)).toEqual({ retired: false });
});

it("an authority replacement during real fresh authorization cannot publish an ALLOW receipt", async () => {
  let release: (() => void) | undefined;
  let held = false;
  const f = await fixture(false, false, async () => { if (held) await new Promise<void>(resolve => { release = resolve; }); });
  const pending = await f.controller.request(f.request);
  f.approvals.decideLocal({ decision: "accept", approvalId: pending.approvalId! }, "run");
  const authorized = await f.controller.request(f.request);
  const ticket = { batchId: f.request.batchId, reservationId: authorized.reservationId! };
  held = true;
  const fresh = f.controller.revalidate({ ...ticket, nonce: 1 });
  await Promise.resolve();
  f.retire(); release!();
  expect(await fresh).toEqual({ ...ticket, nonce: 1, decision: "deny" });
  expect(f.controller.finalize(ticket)).toEqual({ retired: false });
});


it("central authority mutation awaits native exact-ticket retirement before changing ledger or settings", async () => {
  let acknowledge: (() => void) | undefined;
  let mutationDone = false;
  const calls: unknown[] = [];
  const f = await fixture(false, false, async () => {}, "run", () => null, async input => {
    calls.push(input); await new Promise<void>(resolve => { acknowledge = resolve; }); return { accepted: true };
  });
  const pending = await f.controller.request(f.request);
  f.approvals.decideLocal({ decision: "accept", approvalId: pending.approvalId! }, "run");
  const authorized = await f.controller.request(f.request);
  const ticket = { batchId: f.request.batchId, reservationId: authorized.reservationId! };
  const mutation = f.controller.withAuthorityMutation(id => id === f.run.runId, async () => { mutationDone = true; });
  await import("vitest").then(({ vi }) => vi.waitFor(() => expect(calls).toHaveLength(1)));
  expect(calls).toEqual([{ ...ticket, tabId: f.page.pageId }]);
  expect(mutationDone).toBe(false);
  expect(await f.controller.revalidate({ ...ticket, nonce: 1 })).toMatchObject({ decision: "deny" });
  expect(await f.controller.request({ ...f.request, batchId: "during-mutation" })).toMatchObject({ decision: "deny" });
  acknowledge!(); await mutation;
  expect(mutationDone).toBe(true);
});

it("the actual shared model ledger waits for native retirement and budgets see its exact run-linked Guardian cost", async () => {
  const { Repo } = await import("@aux/runtime");
  const { SqliteColumnCipher } = await import("../../apps/runtime/src/store/sqlite-protection.js");
  const { installOvernightAuthority } = await import("../../apps/runtime/src/services/overnight-authority.js");
  const { saveAuthorizedModelCall } = await import("../../apps/runtime/src/services/model-call-authority.js");
  const { BudgetsService } = await import("../../apps/runtime/src/services/budgets.js");
  const { randomBytes, createHash } = await import("node:crypto");
  const db = openDb(":memory:"); cleanup.push(() => db.close());
  const stored = new Map<string, string>();
  const secret = (key: string) => { if (!stored.has(key)) stored.set(key, randomBytes(32).toString("base64")); return { value: stored.get(key)! }; };
  const cipher = await SqliteColumnCipher.create({ readSecret: async key => ({ value: stored.get(key) }),
    storeSecret: async (key, value) => { stored.set(key, value); return { ok: true }; },
    profileStorageRoot: async () => secret(`aux_root_v1_${createHash("sha256").update("fixture").digest("hex").slice(0, 24)}`), profileStorageFactor: async () => secret(`sqlite_factor_v1_${createHash("sha256").update("fixture").digest("hex").slice(0, 24)}`) }, "fixture", false);
  const repo = new Repo(db, cipher);
  let acknowledge!: () => void;
  const f = await fixture(false, false, async () => {}, "run", () => null, async () => {
    await new Promise<void>(resolve => { acknowledge = resolve; }); return { accepted: true };
  });
  repo.saveRun({ ...f.run, config: { ...f.run.config, nightShiftItemId: "owned-night-item" } });
  installOvernightAuthority(repo, f.controller);
  const pending = await f.controller.request(f.request);
  f.approvals.decideLocal({ decision: "accept", approvalId: pending.approvalId! }, "run");
  const authorized = await f.controller.request(f.request);
  const ticket = { batchId: f.request.batchId, reservationId: authorized.reservationId! };
  const write = saveAuthorizedModelCall(repo, { callId: "guardian-cost", runId: "run", role: "guardian", modelId: "actual-model", durationMs: 7, inputTokens: 12, outputTokens: 3, costUsd: 0.4, createdAt: Date.now() });
  expect(repo.listModelCalls("run")).toEqual([]);
  expect(await f.controller.revalidate({ ...ticket, nonce: 1 })).toMatchObject({ decision: "deny" });
  await import("vitest").then(({ vi }) => vi.waitFor(() => expect(acknowledge).toBeTypeOf("function")));
  acknowledge(); await write;
  expect(repo.listModelCalls("run")).toMatchObject([{ callId: "guardian-cost", role: "guardian", costUsd: 0.4 }]);
  const budgets = new BudgetsService(db, () => ({ runUsd: 0.3 }));
  expect(budgets.spentRunUsd("run")).toBe(0.4);
  expect(() => budgets.assertWithin({ runId: "run" })).toThrow(/budget/i);
  expect(repo.listModelCalls("other-run")).toEqual([]);
});


it("window reconciliation retires a native receipt before cancelling the run or changing its queue status", async () => {
  const { Repo } = await import("@aux/runtime");
  const { SqliteColumnCipher } = await import("../../apps/runtime/src/store/sqlite-protection.js");
  const { NightShiftService } = await import("../../apps/runtime/src/services/night-shift.js");
  const { BudgetsService } = await import("../../apps/runtime/src/services/budgets.js");
  const { installOvernightAuthority } = await import("../../apps/runtime/src/services/overnight-authority.js");
  const { installNightShift, checkNightShiftDispatch, nightShiftEffectAuthority } = await import("../../apps/runtime/src/features/overnight-review/service.js");
  const { createClock } = await import("@aux/contracts");
  const { randomBytes, createHash } = await import("node:crypto");
  const db = openDb(":memory:"); cleanup.push(() => db.close());
  const stored = new Map<string, string>();
  const secret = (key: string) => { if (!stored.has(key)) stored.set(key, randomBytes(32).toString("base64")); return { value: stored.get(key)! }; };
  const cipher = await SqliteColumnCipher.create({ readSecret: async key => ({ value: stored.get(key) }),
    storeSecret: async (key, value) => { stored.set(key, value); return { ok: true }; },
    profileStorageRoot: async () => secret(`aux_root_v1_${createHash("sha256").update("fixture").digest("hex").slice(0, 24)}`), profileStorageFactor: async () => secret(`sqlite_factor_v1_${createHash("sha256").update("fixture").digest("hex").slice(0, 24)}`) }, "fixture", false);
  const repo = new Repo(db, cipher);
  let now = new Date(2026, 9, 1, 1).getTime();
  repo.setSetting("nightShift", { enabled: true, start: "00:00", end: "08:00", nightlyUsd: 2, perTaskUsd: 0.5, requireAC: true });
  let acknowledge!: () => void;
  const cancelled: string[] = [];
  let f: Awaited<ReturnType<typeof fixture>> | undefined;
  const service = new NightShiftService(repo, { backgroundEnabled: () => true, onAC: async () => true,
    releaseActivity: async () => {}, powerActivity: async () => ({ active: true }), cancel: runId => { cancelled.push(runId); }, resume: async () => {},
    consolidate: async () => {}, reindex: async () => {}, start: async (_payload, item, runId) => {
      f = await fixture(false, true, id => checkNightShiftDispatch(repo, id), runId, id => nightShiftEffectAuthority(repo, id), async () => { await new Promise<void>(resolve => { acknowledge = resolve; }); return { accepted: true }; });
      f.run.config = { ...f.run.config, nightShiftItemId: item.id };
      repo.saveRun(f.run); f.overnight(); installOvernightAuthority(repo, f.controller); return runId;
    } }, new BudgetsService(db, () => ({})), createClock(1, () => now));
  const remove = installNightShift({ repo } as import("../../apps/runtime/src/api/methods/context.js").Services, service);
  try {
    const item = service.queue({ payload: { kind: "goal", goalId: "fixture-goal" }, budgetUsd: 0.4 });
    await service.tick();
    const actual = f!;
    const pending = await actual.controller.request(actual.request);
    actual.approvals.decideLocal({ decision: "acceptForOrigin", approvalId: pending.approvalId! }, actual.run.runId);
    const authorized = await actual.controller.request(actual.request);
    expect(authorized.decision).toBe("allow");
    now = new Date(2026, 9, 1, 8).getTime();
    const reconcile = service.tick();
    await import("vitest").then(({ vi }) => vi.waitFor(() => expect(acknowledge).toBeTypeOf("function")));
    expect(cancelled).toEqual([]);
    expect(service.get(item.id).status).toBe("running");
    expect(await actual.controller.revalidate({ batchId: actual.request.batchId, reservationId: authorized.reservationId!, nonce: 1 })).toMatchObject({ decision: "deny" });
    acknowledge(); await reconcile;
    expect(cancelled).toEqual([actual.run.runId]);
    expect(service.get(item.id).status).toBe("needs_review");
  } finally { await remove(); }
});

it("an overlapping authority mutation cannot commit before the first exact native retirement ACK", async () => {
  let acknowledge!: () => void; const effects: string[] = []; const retirements: unknown[] = [];
  const f = await fixture(false, false, async () => {}, "run", () => null, async input => {
    retirements.push(input); await new Promise<void>(resolve => { acknowledge = resolve; }); return { accepted: true };
  });
  const waiting = await f.controller.request(f.request);
  f.approvals.decideLocal({ decision: "accept", approvalId: waiting.approvalId! }, "run");
  const authorized = await f.controller.request(f.request);
  const first = f.controller.withAuthorityMutation(id => id === "run", async () => { effects.push("first"); });
  const second = f.controller.withAuthorityMutation(id => id === "run", async () => { effects.push("second"); });
  await import("vitest").then(({ vi }) => vi.waitFor(() => expect(retirements).toHaveLength(1)));
  expect(effects).toEqual([]);
  expect(await f.controller.revalidate({ batchId: f.request.batchId, reservationId: authorized.reservationId!, nonce: 1 })).toMatchObject({ decision: "deny" });
  acknowledge(); await Promise.all([first, second]);
  expect(effects).toEqual(["first", "second"]); expect(retirements).toHaveLength(1);
});

it("a failed native ACK retains exact retirement debt and retry cannot mutate until that same receipt is acknowledged", async () => {
  let fail = true; let acknowledge!: () => void; const receipts: unknown[] = []; let committed = false;
  const f = await fixture(false, false, async () => {}, "run", () => null, async input => {
    receipts.push(input); if (fail) throw new Error("Native channel refused retirement");
    await new Promise<void>(resolve => { acknowledge = resolve; }); return { accepted: true };
  });
  const waiting = await f.controller.request(f.request);
  f.approvals.decideLocal({ decision: "accept", approvalId: waiting.approvalId! }, "run");
  const authorized = await f.controller.request(f.request);
  const mutation = async () => { committed = true; };
  await expect(f.controller.withAuthorityMutation(id => id === "run", mutation)).rejects.toThrow("Native channel refused retirement");
  expect(committed).toBe(false);
  expect(await f.controller.request({ ...f.request, batchId: "after-failed-retirement" })).toMatchObject({ decision: "deny" });
  fail = false;
  const retry = f.controller.withAuthorityMutation(id => id === "run", mutation);
  await import("vitest").then(({ vi }) => vi.waitFor(() => expect(receipts).toHaveLength(2)));
  expect(receipts[1]).toEqual(receipts[0]); expect(receipts[0]).toEqual({ tabId: f.page.pageId, batchId: f.request.batchId, reservationId: authorized.reservationId });
  expect(committed).toBe(false); acknowledge(); await retry; expect(committed).toBe(true);
});

it("composed lifecycle mutations retire once and complete their nested transition without deadlock", async () => {
  const calls: unknown[] = []; const transitions: string[] = [];
  const f = await fixture(false, false, async () => {}, "run", () => null, async input => { calls.push(input); return { accepted: true }; });
  const waiting = await f.controller.request(f.request);
  f.approvals.decideLocal({ decision: "accept", approvalId: waiting.approvalId! }, "run");
  await f.controller.request(f.request);
  const matches = (id: string) => id === "run";
  await f.controller.withAuthorityMutation(matches, async () => {
    transitions.push("cancel");
    await f.controller.withAuthorityMutation(matches, async () => { transitions.push("finish"); });
  });
  expect(calls).toHaveLength(1); expect(transitions).toEqual(["cancel", "finish"]);
});

it("a delayed descendant cannot reuse a completed mutation context to bypass a later native ACK", async () => {
  let retireCount = 0; let acknowledge!: () => void; const transitions: string[] = [];
  const f = await fixture(false, false, async () => {}, "run", () => null, async () => {
    if (++retireCount > 1) await new Promise<void>(resolve => { acknowledge = resolve; }); return { accepted: true };
  });
  const waiting = await f.controller.request(f.request);
  f.approvals.decideLocal({ decision: "acceptForOrigin", approvalId: waiting.approvalId! }, "run");
  await f.controller.request(f.request);
  let releaseDescendant!: () => void; let descendant!: Promise<void>;
  const ready = new Promise<void>(resolve => { releaseDescendant = resolve; });
  const matches = (id: string) => id === "run";
  await f.controller.withAuthorityMutation(matches, async () => {
    descendant = (async () => { await ready; await f.controller.withAuthorityMutation(matches, async () => { transitions.push("descendant"); }); })();
  });
  const next = await f.controller.request({ ...f.request, batchId: "next-authorized-batch" });
  expect(next.decision).toBe("allow");
  const external = f.controller.withAuthorityMutation(matches, async () => { transitions.push("external"); });
  await import("vitest").then(({ vi }) => vi.waitFor(() => expect(acknowledge).toBeTypeOf("function")));
  releaseDescendant(); await Promise.resolve(); await Promise.resolve();
  expect(transitions).toEqual([]);
  acknowledge(); await Promise.all([external, descendant]);
  expect(transitions).toEqual(["external", "descendant"]); expect(retireCount).toBe(2);
});

it("actual correction delivery cannot change revision or signal planning before native receipt retirement ACK", async () => {
  const { Repo, EventBus } = await import("@aux/runtime");
  const { RunMessageQueue } = await import("../../apps/runtime/src/services/run-messages.js");
  const { installOvernightAuthority } = await import("../../apps/runtime/src/services/overnight-authority.js");
  let acknowledge!: () => void;
  const f = await fixture(false, false, async () => {}, "run", () => null, async () => {
    await new Promise<void>(resolve => { acknowledge = resolve; }); return { accepted: true };
  });
  const waiting = await f.controller.request(f.request);
  f.approvals.decideLocal({ decision: "accept", approvalId: waiting.approvalId! }, "run");
  const authorized = await f.controller.request(f.request);
  const repo = new Repo(f.db), events = new EventBus(repo);
  repo.saveRun({ ...f.run, config: { chatId: "person-chat", messageRevision: 0, contextPageRefs: [] } });
  installOvernightAuthority(repo, f.controller);
  let signals = 0;
  const messages = new RunMessageQueue(repo, events, async () => { throw new Error("Correction must not start a new run"); }, () => true, () => { signals++; });
  const correction = messages.steer({ messageId: "11111111-1111-4111-8111-111111111111", runId: "run", chatId: "person-chat", text: "Use the latest source", pageIds: ["tab"], contextPageRefs: [], expectedRevision: 0 });
  await import("vitest").then(({ vi }) => vi.waitFor(() => expect(acknowledge).toBeTypeOf("function")));
  expect(repo.getRun("run")?.config?.messageRevision).toBe(0);
  expect(repo.listRunSteers("run")).toEqual([]); expect(signals).toBe(0);
  expect(await f.controller.revalidate({ batchId: f.request.batchId, reservationId: authorized.reservationId!, nonce: 1 })).toMatchObject({ decision: "deny" });
  acknowledge(); await correction;
  expect(repo.getRun("run")?.config?.messageRevision).toBe(1); expect(signals).toBe(1);
  await messages.stop();
});

it("unauthorized policy and out-of-scope task mutations cannot retire a real foreground receipt", async () => {
  const { Repo } = await import("@aux/runtime");
  const { installOvernightAuthority } = await import("../../apps/runtime/src/services/overnight-authority.js");
  const { memoryMethods } = await import("../../apps/runtime/src/api/methods/memory.js");
  const { workspacesMethods } = await import("../../apps/runtime/src/api/methods/workspaces.js");
  const { tasksMethods } = await import("../../apps/runtime/src/api/methods/tasks.js");
  let retirements = 0;
  const f = await fixture(false, false, async () => {}, "run", () => null, async () => { retirements++; return { accepted: true }; });
  const waiting = await f.controller.request(f.request);
  f.approvals.decideLocal({ decision: "accept", approvalId: waiting.approvalId! }, "run");
  const authorized = await f.controller.request(f.request);
  const repo = new Repo(f.db); repo.saveRun(f.run); installOvernightAuthority(repo, f.controller);
  const base = { client: { external: true, codeMode: false }, params: {}, s: { repo } };
  for (const method of ["memory.pipeline.setPolicy", "memory.pipeline.review", "memory.pipeline.revert", "memory.pipeline.forget"] as const)
    await expect(memoryMethods[method]!({ ...base, method } as unknown as Parameters<NonNullable<typeof memoryMethods[typeof method]>>[0])).rejects.toMatchObject({ code: "permission_denied" });
  for (const method of ["workspaces.memory.set", "workspaces.browsingMemory.set", "workspaces.browsingMemory.forget", "workspaces.contentMemory.setPolicy", "workspaces.contentMemory.forget", "commands.escalations.revoke"] as const)
    await expect(workspacesMethods[method]!({ ...base, method } as unknown as Parameters<NonNullable<typeof workspacesMethods[typeof method]>>[0])).rejects.toMatchObject({ code: "permission_denied" });
  await expect(tasksMethods["tasks.update"]!({ ...base, method: "tasks.update", params: { taskId: "task", resources: [{ access: "write" }] } } as unknown as Parameters<NonNullable<typeof tasksMethods["tasks.update"]>>[0])).rejects.toMatchObject({ code: "permission_denied" });
  await expect(tasksMethods["tasks.replaceAgent"]!({ ...base, method: "tasks.replaceAgent", params: { taskId: "task", pageIds: ["outside"] }, scope: { kind: "task" }, requireScopedPage: () => { throw new AuxError("permission_denied", "Outside approved task scope"); } } as unknown as Parameters<NonNullable<typeof tasksMethods["tasks.replaceAgent"]>>[0])).rejects.toMatchObject({ code: "permission_denied" });
  expect(retirements).toBe(0);
  expect(await f.controller.revalidate({ batchId: f.request.batchId, reservationId: authorized.reservationId!, nonce: 1 })).toMatchObject({ decision: "allow" });
});

it("queued interruption cannot resurrect a terminal run or overwrite its newer configuration after ACK", async () => {
  const { Repo, EventBus } = await import("@aux/runtime");
  const { RunCoordinator } = await import("../../apps/runtime/src/agent/coordinator.js");
  const { installOvernightAuthority } = await import("../../apps/runtime/src/services/overnight-authority.js");
  const { fixtureTurnMentions } = await import("../fixtures/turn-mentions.js");
  let acknowledge!: () => void;
  const f = await fixture(false, false, async () => {}, "run", () => null, async () => { await new Promise<void>(resolve => { acknowledge = resolve; }); return { accepted: true }; });
  const waiting = await f.controller.request(f.request);
  f.approvals.decideLocal({ decision: "accept", approvalId: waiting.approvalId! }, "run");
  await f.controller.request(f.request);
  const repo = new Repo(f.db); repo.saveRun(f.run); installOvernightAuthority(repo, f.controller);
  const coordinator = new RunCoordinator({ repo, events: new EventBus(repo), turnMentions: fixtureTurnMentions(() => f.page), pages: {} as never, model: () => null, defaultModel: () => "fixture", recoveryModel: () => undefined, grants: [], recordModelCall: () => {} });
  const settle = f.controller.withAuthorityMutation(id => id === "run", async () => { repo.saveRun({ ...repo.getRun("run")!, status: "completed", config: { messageRevision: 9 }, result: { report: "Verified" } }); });
  const interrupt = coordinator.markInterrupted();
  await import("vitest").then(({ vi }) => vi.waitFor(() => expect(acknowledge).toBeTypeOf("function")));
  acknowledge(); await Promise.all([settle, interrupt]);
  expect(repo.getRun("run")).toMatchObject({ status: "completed", config: { messageRevision: 9 }, result: { report: "Verified" } });
});

it("a Goal report cannot persist pause metadata before exact native retirement acknowledgement", async () => {
  const { Repo, EventBus, TaskService } = await import("@aux/runtime");
  const { GoalService } = await import("../../apps/runtime/src/services/goals.js");
  const { installOvernightAuthority } = await import("../../apps/runtime/src/services/overnight-authority.js");
  let acknowledge!: () => void;
  const f = await fixture(false, false, async () => {}, "run", () => null, async () => { await new Promise<void>(resolve => { acknowledge = resolve; }); return { accepted: true }; });
  const waiting = await f.controller.request(f.request);
  f.approvals.decideLocal({ decision: "accept", approvalId: waiting.approvalId! }, "run");
  await f.controller.request(f.request);
  const repo = new Repo(f.db); repo.saveRun(f.run); installOvernightAuthority(repo, f.controller);
  const workspace = new TaskService(repo, new EventBus(repo)).createWorkspace("Goal authority");
  const goals = new GoalService(repo, {
    start: async () => { throw new Error("This existing Goal must not launch again"); },
    pause: async runId => { const run = { ...repo.getRun(runId)!, status: "paused" as const }; repo.saveRun(run); return run; },
    resume: async () => { throw new Error("Not resuming"); },
    cancel: async () => { throw new Error("Not cancelling"); },
  });
  const goal = goals.create({ workspaceId: workspace.workspaceId, objective: "Review", budget: { maxTokens: 1000 } });
  repo.db.prepare("UPDATE goals SET run_id='run',status='active' WHERE goal_id=?").run(goal.goalId);
  const reporting = goals.report("run", "paused", undefined, 1);
  await import("vitest").then(({ vi }) => vi.waitFor(() => expect(acknowledge).toBeTypeOf("function")));
  expect(goals.get(goal.goalId).lastBlockerTurn).toBeUndefined();
  expect(repo.getRun("run")?.status).toBe("running");
  acknowledge(); expect(await reporting).toEqual({ status: "paused" });
  expect(goals.get(goal.goalId)).toMatchObject({ status: "paused", lastBlockerTurn: 1 });
});


it("foreground Apply preserves a newer parked configuration written while native retirement is held", async () => {
  const { Repo, EventBus } = await import("@aux/runtime");
  const { installOvernightAuthority } = await import("../../apps/runtime/src/services/overnight-authority.js");
  const { overnightRuntime } = await import("../../apps/runtime/src/features/overnight-review/runtime.js");
  let acknowledge!: () => void;
  const f = await fixture(false, false, async () => {}, "run", () => null, async () => { await new Promise<void>(resolve => { acknowledge = resolve; }); return { accepted: true }; });
  const waiting = await f.controller.request(f.request);
  f.approvals.decideLocal({ decision: "accept", approvalId: waiting.approvalId! }, "run");
  await f.controller.request(f.request);
  const repo = new Repo(f.db), events = new EventBus(repo);
  repo.saveRun({ ...f.run, status: "needs_input", config: { ...f.run.config, nightShiftItemId: "person-item", messageRevision: 0 } });
  installOvernightAuthority(repo, f.controller);
  const runtime = overnightRuntime({ repo, events } as never, { status: async () => ({ onAC: true, backgroundEnabled: true }), release: async () => {}, activity: async () => ({ active: true }) });
  const update = f.controller.withAuthorityMutation(id => id === "run", async () => { const run = repo.getRun("run")!; repo.saveRun({ ...run, config: { ...run.config, messageRevision: 9 } }); });
  const applying = runtime.resume("run");
  await import("vitest").then(({ vi }) => vi.waitFor(() => expect(acknowledge).toBeTypeOf("function")));
  expect(repo.getRun("run")?.config).toMatchObject({ nightShiftItemId: "person-item", messageRevision: 0 });
  acknowledge(); await Promise.all([update, applying]);
  expect(repo.getRun("run")?.config?.messageRevision).toBe(9);
  expect(repo.getRun("run")?.config).not.toHaveProperty("nightShiftItemId");
  expect(repo.getRun("run")?.status).toBe("needs_input");
  expect(f.approvals.pending("run")).toEqual([]);
});

it("one runtime shutdown awaits every installed native receipt before egress close and run interruption", async () => {
  const { Repo, EventBus } = await import("@aux/runtime");
  const { RunCoordinator } = await import("../../apps/runtime/src/agent/coordinator.js");
  const { installOvernightAuthority, withRunAuthorityMutation } = await import("../../apps/runtime/src/services/overnight-authority.js");
  const { runtimeShutdown } = await import("../../apps/runtime/src/services/runtime-shutdown.js");
  const { fixtureTurnMentions } = await import("../fixtures/turn-mentions.js");
  let acknowledge!: () => void;
  const f = await fixture(false, false, async () => {}, "run", () => null, async () => { await new Promise<void>(resolve => { acknowledge = resolve; }); return { accepted: true }; });
  const waiting = await f.controller.request(f.request);
  f.approvals.decideLocal({ decision: "accept", approvalId: waiting.approvalId! }, "run");
  await f.controller.request(f.request);
  const repo = new Repo(f.db); repo.saveRun(f.run); installOvernightAuthority(repo, f.controller);
  const coordinator = new RunCoordinator({ repo, events: new EventBus(repo), turnMentions: fixtureTurnMentions(() => f.page), pages: {} as never, model: () => null, defaultModel: () => "fixture", recoveryModel: () => undefined, grants: [], recordModelCall: () => {} });
  const stages: string[] = [];
  const shutdown = runtimeShutdown({
    quiesce: () => { stages.push("quiesce"); },
    retireAuthority: () => withRunAuthorityMutation(repo, async () => {}),
    disconnectAuthority: () => { stages.push("disconnect"); },
    closeEgress: () => { stages.push("egress"); f.egress.close(); },
    stopMessages: async () => { stages.push("messages"); },
    markInterrupted: async () => { await coordinator.markInterrupted(); stages.push("interrupted"); },
    stopFeatures: async () => { stages.push("features"); },
    cleanup: [{ stage: "cleanup", run: () => { stages.push("cleanup"); } }],
    reportFailure: (_, error) => { throw error; },
  });
  const first = shutdown(); expect(shutdown()).toBe(first);
  await import("vitest").then(({ vi }) => vi.waitFor(() => expect(acknowledge).toBeTypeOf("function")));
  expect(stages).toEqual(["quiesce"]); expect(repo.getRun("run")?.status).toBe("running");
  acknowledge(); await first;
  expect(stages).toEqual(["quiesce", "egress", "messages", "interrupted", "features", "cleanup"]);
  expect(repo.getRun("run")?.status).toBe("interrupted");
});

it("closed runtime admission still refuses a new native batch after the global retirement barrier is released", async () => {
  const f = await fixture();
  const waiting = await f.controller.request(f.request);
  f.approvals.decideLocal({ decision: "accept", approvalId: waiting.approvalId! }, "run");
  await f.controller.request(f.request);
  f.admission.beginShutdown();
  await f.controller.withAuthorityMutation(() => true, async () => {});
  expect(await f.controller.request({ ...f.request, batchId: "queued-after-retirement" })).toMatchObject({ decision: "deny" });
  expect(f.approvals.pending("run")).toEqual([]);
  expect(f.run.status).toBe("running");
});
