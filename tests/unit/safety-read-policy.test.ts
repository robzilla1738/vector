import { OriginPolicyStore } from "../../apps/runtime/src/safety/origin-policy-store.js";
import { Repo } from "../../apps/runtime/src/store/repo.js";
import { afterEach, expect, it } from "vitest";
import { PageTargetSchema, type OriginRule } from "@aux/contracts";
import { openDb } from "@aux/runtime";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { DecisionJournal } from "../../apps/runtime/src/safety/decide.js";
import { SafetyDispatchGate } from "../../apps/runtime/src/safety/dispatch.js";
import { TurnMentionService } from "../../apps/runtime/src/services/turn-mention-service.js";
const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => databases.splice(0).forEach((db) => db.close()));
function fixture() {
  const db = openDb(":memory:");
  databases.push(db);
  let rules: OriginRule[] = [];
  let grants = ["effect:read"];
  const approvals = new ApprovalStore(db);
  const gate = new SafetyDispatchGate({
    approvals,
    journal: new DecisionJournal(db),
    managedRules: () => [],
    userRules: () => rules,
    localCeiling: () => "ask",
    settingsGrants: () => grants,
    audit: () => {},
  });
  const page = PageTargetSchema.parse({
    pageId: "a",
    targetId: "a",
    backend: "aux",
    windowId: "main",
    url: "https://read.test/a",
    title: "A",
    documentEpoch: 1,
    sessionId: "fixture-attachment",
    lastRevision: 0,
    viewStatus: "visible",
    lifecycle: "live",
    controller: "none",
    controllerEpoch: 0,
    ownedByRuntime: false,
    createdAt: 1,
    lastActiveAt: 1,
  });
  const context = {
    profileId: "fixture",
    scope: { kind: "workspace" as const, id: "workspace" },
    runId: "run",
    turnId: "run",
    threadId: "chat",
    pageId: page.pageId,
    sessionId: page.sessionId,
  };
  const authorizeRead = () =>
    gate.checkRead({
      action: "pages.capture",
      origin: "https://read.test",
      document: {
        pageId: page.pageId,
        sessionId: page.sessionId!,
        documentEpoch: page.documentEpoch,
        url: page.url,
      },
      context,
    });
  const service = new TurnMentionService({
    page: (id) => (id === page.pageId ? page : undefined),
    authorizeRead,
    organization: async () => ({ revision: 1, shared: null }),
    routine: () => undefined,
    connectors: () => ({ entries: [], access: [] }),
  });
  const ref = {
    kind: "tab" as const,
    pageId: page.pageId,
    title: page.title,
    url: page.url,
    documentEpoch: page.documentEpoch,
    sessionId: page.sessionId!,
    access: "read" as const,
  };
  return {
    db,
    gate,
    service,
    ref,
    revokeRead: () => {
      grants = [];
    },
    setRules: (next: OriginRule[]) => {
      rules = next;
    },
  };
}
it("a site read Block refuses a mentioned capture before the backend runs", async () => {
  const f = fixture();
  f.setRules([{ origin: "https://read.test/", access: "allow", effects: { read: "deny" } }]);
  await f.service.begin("run", [f.ref], []);
  let captures = 0;
  await expect(
    f.service.use("run", "a", "read", async () => {
      captures++;
      return "private pixels";
    }),
  ).rejects.toMatchObject({ code: "permission_denied" });
  expect(captures).toBe(0);
});
it("ordinary read permission retains none tier and emits a real read policy journal", async () => {
  const f = fixture();
  await f.service.begin("run", [f.ref], []);
  expect(await f.service.use("run", "a", "read", async () => "approved pixels")).toBe("approved pixels");
  const rows = f.db
    .prepare("SELECT request_json AS request, decision_json AS decision FROM safety_decisions")
    .all() as { request: string; decision: string }[];
  expect(rows.map((row) => JSON.parse(row.request))).toMatchObject([
    { category: "read", effect: "read", action: "pages.capture" },
  ]);
  expect(rows.map((row) => JSON.parse(row.decision).status)).toEqual(["allow"]);
});
it("a read policy change while capture awaits withholds the returned pixels", async () => {
  const f = fixture();
  await f.service.begin("run", [f.ref], []);
  await expect(
    f.service.use("run", "a", "read", async () => {
      f.setRules([{ origin: "https://read.test/", access: "deny" }]);
      return "withheld pixels";
    }),
  ).rejects.toMatchObject({ code: "permission_denied" });
});
it("borrowed approved source reads also obey site policy without minting mention grants", async () => {
  const f = fixture();
  await f.service.begin("run", [], []);
  f.setRules([{ origin: "https://read.test/", access: "deny" }]);
  let reads = 0;
  await expect(
    f.service.useSourcePage(
      "run",
      "a",
      "read",
      () => {},
      async () => {
        reads++;
        return "source pixels";
      },
    ),
  ).rejects.toMatchObject({ code: "permission_denied" });
  expect(reads).toBe(0);
  expect(f.service.ownedPages("run")).toEqual([]);
});

it("read program steps cannot bypass an explicit site Block", async () => {
  const f = fixture();
  f.setRules([{ origin: "https://read.test/", access: "deny" }]);
  await expect(
    f.gate.check({
      step: { id: "read", op: "extract", fields: [{ name: "text" }] },
      origin: "https://read.test",
      phase: "dispatch",
      context: {
        profileId: "fixture",
        scope: { kind: "workspace", id: "workspace" },
        turnId: "run",
        threadId: "chat",
      },
    }),
  ).rejects.toMatchObject({ code: "permission_denied" });
});

it("revoking the actual effect read grant while capture awaits withholds its result", async () => {
  const f = fixture();
  await f.service.begin("run", [f.ref], []);
  await expect(
    f.service.use("run", "a", "read", async () => {
      f.revokeRead();
      return "withheld";
    }),
  ).rejects.toMatchObject({ code: "permission_denied" });
});

it.each(["https://read.test", "https://READ.TEST/"])("a stored exact-origin read Block for %s cannot be missed by URL spelling", async origin => {
  const f = fixture();
  await f.service.begin("run", [f.ref], []);
  const store = new OriginPolicyStore(new Repo(f.db));
  store.set({ expectedRevision: 0, rules: [{ origin, access: "allow", effects: { read: "deny" } }] });
  f.setRules(store.list().rules);
  let captures = 0;
  await expect(f.service.use("run", "a", "read", async () => { captures++; })).rejects.toMatchObject({ code: "permission_denied" });
  expect(captures).toBe(0);
});
