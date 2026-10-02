import { afterEach, expect, it } from "vitest";
import { PageTargetSchema, RunSchema, type OriginRule } from "@aux/contracts";
import { EventBus, openDb, Repo } from "@aux/runtime";
import { PageService } from "../../apps/runtime/src/services/pages.js";
import { NullNativeBridge } from "../../apps/runtime/src/native.js";
import { TurnMentionService } from "../../apps/runtime/src/services/turn-mention-service.js";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { DecisionJournal } from "../../apps/runtime/src/safety/decide.js";
import { SafetyDispatchGate } from "../../apps/runtime/src/safety/dispatch.js";
const cleanup: Array<() => void> = [];
afterEach(() => cleanup.splice(0).forEach((dispose) => dispose()));
function fixture() {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db),
    events = new EventBus(repo);
  const page = PageTargetSchema.parse({
    pageId: "a",
    targetId: "target",
    backend: "aux",
    windowId: "main",
    url: "https://page.test/a",
    title: "Fixture",
    sessionId: "attachment-1",
    documentEpoch: 4,
    lastRevision: 0,
    viewStatus: "visible",
    lifecycle: "live",
    controller: "none",
    controllerEpoch: 0,
    ownedByRuntime: false,
    createdAt: 1,
    lastActiveAt: 1,
  });
  repo.upsertPage(page);
  repo.saveRun(
    RunSchema.parse({
      runId: "run",
      goal: "Read approved page",
      pageIds: [page.pageId],
      status: "running",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      config: { implementation: "external-agent" },
    }),
  );
  let rules: OriginRule[] = [];
  const turnMentions = new TurnMentionService({
    page: (id) => repo.getPage(id),
    organization: async () => ({ revision: 0, shared: null }),
    routine: () => undefined,
    connectors: () => ({ entries: [], access: [] }),
  });
  const pages = new PageService({
    repo,
    events,
    turnMentions,
    native: new NullNativeBridge(),
    drivers: () => ({ aux: null, chrome: null }),
    safetyGate: new SafetyDispatchGate({
      approvals: new ApprovalStore(db),
      journal: new DecisionJournal(db),
      managedRules: () => [],
      userRules: () => rules,
      localCeiling: () => "ask",
      settingsGrants: () => ["effect:read"],
      audit: () => {},
    }),
  });
  repo.upsertPage(page);
  repo.saveResponse({
    requestId: "response",
    pageId: page.pageId,
    sessionId: page.sessionId,
    documentEpoch: page.documentEpoch,
    documentUrl: page.url,
    url: "https://foreign.test/api",
    method: "GET",
    startedAt: Date.now(),
  });
  return {
    pages,
    repo,
    page,
    block: (origin: string) => {
      rules = [{ origin, access: "deny" }];
    },
  };
}
it("an allowed initiating page cannot launder a blocked cross-origin captured response", async () => {
  const f = fixture();
  f.block("https://foreign.test/");
  await expect(f.pages.authorizeAgentRead("run", "a")).resolves.toBeTypeOf("function");
  await expect(f.pages.authorizeAgentResponseRead("run", "response")).rejects.toMatchObject({
    code: "permission_denied",
  });
});
it("response origin permission remains live through return and cannot survive a new Block", async () => {
  const f = fixture();
  const check = await f.pages.authorizeAgentResponseRead("run", "response");
  check();
  f.block("https://foreign.test/");
  expect(check).toThrowError(expect.objectContaining({ code: "permission_denied" }));
});
it("cross-origin read authority retains original initiating attachment and document", async () => {
  const f = fixture();
  const check = await f.pages.authorizeAgentResponseRead("run", "response");
  f.repo.upsertPage({ ...f.page, sessionId: "replacement" });
  expect(check).toThrowError(expect.objectContaining({ code: "ref_stale" }));
  await expect(f.pages.authorizeAgentResponseRead("run", "response")).rejects.toMatchObject({
    code: "ref_stale",
  });
});
