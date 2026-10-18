// @vitest-environment jsdom
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { SafetyDispatchGate } from "../../apps/runtime/src/safety/dispatch.js";
import { DecisionJournal } from "../../apps/runtime/src/safety/decide.js";
import { SuspensionStore } from "../../apps/runtime/src/safety/suspensions.js";
import { guardedExecute } from "../../apps/runtime/src/agent/guarded-dispatch.js";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import {
  AuxError,
  SheetsNavigationInputSchema,
  type PlanStep,
  type SheetsNavigationInput,
} from "@aux/contracts";
import type { DriverPage, ObservedActionTarget } from "@aux/chromium-driver";
import {
  EventBus,
  NullNativeBridge,
  openDb,
  Repo,
  DurableWriteLedger,
  buildToolManifest,
} from "@aux/runtime";
import { captureSheetsNavigation, sheetsRange } from "../../apps/runtime/src/agent/sheets-navigation.js";
import {
  SheetsWorkflows,
  confirmSheetsSelection,
  sheetsInputsUndispatched,
} from "../../apps/runtime/src/agent/sheets-workflows.js";
import { PageRegistry } from "../../apps/runtime/src/services/pages/registry.js";
import { ProgramExecutor } from "../../apps/runtime/src/services/pages/executor.js";
import { PageLanes } from "../../apps/runtime/src/services/pages/lanes.js";
import { ControlAuthority } from "../../apps/runtime/src/services/pages/control.js";
import { ObservationService } from "../../apps/runtime/src/services/pages/observation.js";
import { fixturePage, fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import type { LoopToolResult } from "../../apps/runtime/src/agent/loop/types.js";
const url = "https://docs.google.com/spreadsheets/d/spreadsheet_fixture_123456789/edit#gid=999";
const input = {
  action: "prepare" as const,
  pageId: "tab",
  expectedUrl: url,
  expectedDocumentEpoch: 4,
  a1: "B2",
  sheetGid: "7",
};
const repos: Repo[] = [];
beforeEach(() => {
  vi.stubGlobal("location", { href: url });
  const rect = {
    x: 0,
    y: 0,
    width: 100,
    height: 30,
    right: 100,
    bottom: 30,
    left: 0,
    top: 0,
    toJSON: () => ({}),
  };
  vi.spyOn(Element.prototype, "getClientRects").mockReturnValue([rect] as unknown as DOMRectList);
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue(rect as DOMRect);
  Object.defineProperty(document, "elementFromPoint", {
    configurable: true,
    value: () => document.getElementById("t-name-box"),
  });
  document.body.innerHTML =
    '<main role="application"><input id="t-name-box" value="A1" aria-label="Name box"><div role="tablist"><div id="tab7" role="tab" aria-selected="true" aria-controls="grid7" data-id="7">Actual sheet</div></div><div id="grid7" role="grid" tabindex="0" aria-activedescendant="a1" aria-rowcount="2" aria-colcount="2" aria-multiselectable="false"><div role="row" aria-rowindex="1"><div role="gridcell" id="a1" aria-colindex="1" aria-selected="true">one</div><div role="gridcell" id="b1" aria-colindex="2" aria-selected="false">two</div></div><div role="row" aria-rowindex="2"><div role="gridcell" id="a2" aria-colindex="1" aria-selected="false">three</div><div role="gridcell" id="b2" aria-colindex="2" aria-selected="false">four</div></div></div></main>';
  document.getElementById("grid7")!.focus();
});
afterEach(() => {
  for (const repo of repos.splice(0)) repo.close();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(document, "elementFromPoint");
});
function fixture(mode: "automatic" | "ask" = "automatic") {
  const repo = new Repo(openDb(":memory:"));
  repos.push(repo);
  const ledger = new DurableWriteLedger(repo.db);
  repo.saveRun({
    runId: "run",
    goal: "Navigate current sheet",
    status: "running",
    pageIds: ["tab"],
    createdAt: Date.now(),
    config: { implementation: "external-agent", chatId: "chat", messageRevision: 1 },
  });
  const policy = {
    agentMode: "ask" as const,
    agentPolicyRevision: 0,
    agentPolicies: [
      { category: "input" as const, access: "ask" as const },
      { category: "click" as const, access: "ask" as const },
    ],
  };
  const approvals = new ApprovalStore(
    repo.db,
    () => {},
    undefined,
    () => policy,
    (id) => repo.getRun(id),
    repo,
  );
  const suspensions = new SuspensionStore(repo.db);
  const actualGate = new SafetyDispatchGate({
    approvals,
    suspensions,
    journal: new DecisionJournal(repo.db),
    managedRules: () => [],
    agentPolicy: () => policy,
    audit: () => {},
  });
  let nodeIdentity = "original-node",
    inputFailure = false,
    echoOnly = false,
    parked = false,
    cancelled = false,
    changedProof = false;
  const control = () => document.getElementById("t-name-box") as HTMLInputElement;
  const proof = (value = control().value): ObservedActionTarget => ({
    nodeIdentity,
    stateDigest: createHash("sha256").update(value).digest("hex"),
    origin: "https://docs.google.com",
    tag: "input",
    type: "text",
    autocomplete: "",
    name: "",
  });
  const fill = vi.fn(async (_target: string, value: string) => {
    control().value = value;
    control().focus();
    if (inputFailure) throw new AuxError("ref_stale", "Lost input acknowledgement.");
  });
  const press = vi.fn(async () => {
    if (!echoOnly) {
      document.getElementById("a1")!.setAttribute("aria-selected", "false");
      document.getElementById("b2")!.setAttribute("aria-selected", "true");
      document.getElementById("grid7")!.setAttribute("aria-activedescendant", "b2");
    }
    document.getElementById("grid7")!.focus();
  });
  const driver = {
    identity: { backend: "aux", pageId: "tab", targetId: "target" },
    isAttached: () => true,
    url: () => url,
    title: async () => "",
    setEvents: () => {},
    evaluate: vi.fn(async (script: string) => new Function(`return ${script}`)()),
    actionTarget: vi.fn(async (_target: string, projected?: readonly PlanStep[]) =>
      proof(projected?.[0]?.op === "fill" ? projected[0].value : undefined),
    ),
    withActionTarget: async <T>(
      _target: string,
      expected: ObservedActionTarget,
      execute: () => Promise<T>,
    ) => {
      expect(proof()).toEqual(expected);
      return execute();
    },
    originForTarget: async () => new URL(url).origin,
    fill,
    press,
    fieldState: async () => ({ value: control().value }),
    waitFor: async () => ({ ok: true, timedOut: false }),
  } as unknown as DriverPage;
  const gate = {
    policyFence: () => () => {},
    check: vi.fn(async () => {
      if (parked) throw new AuxError("needs_input", "Review original input");
    }),
    policyRevision: () => 1,
    prepareBatch: async () => {},
  };
  const pages: PageRegistry = new PageRegistry({
    repo,
    events: new EventBus(repo),
    native: new NullNativeBridge(),
    turnMentions: fixtureTurnMentions((id) => pages.get(id)),
    drivers: () => ({ aux: null, chrome: null }),
    safetyGate: (mode === "ask" ? actualGate : gate) as never,
    durableWrites: ledger,
  });
  pages.addLive({ ...fixturePage("tab", url, 4), controller: "agent", controllerEpoch: 1 }, driver);
  const executor = new ProgramExecutor(
    pages,
    new PageLanes(pages),
    new ObservationService(pages, new PageLanes(pages)),
    new ControlAuthority(pages),
  );
  const check = () => {
    if (cancelled) throw new AuxError("cancelled", "Original owner retired");
  };
  const capture = vi.fn(async (request: Extract<SheetsNavigationInput, { action: "prepare" }>) => {
    check();
    const captured = await captureSheetsNavigation(
      pages,
      {
        taskId: "task",
        expectedRevision: 1,
        pageId: "tab",
        expectedUrl: url,
        expectedDocumentEpoch: 4,
        kind: "google-sheets",
        view: "selection",
        sheetGid: request.sheetGid,
      },
      request.a1,
      () => true,
    );
    const original = captured.check;
    return {
      ...captured,
      authority: "original-profile-task-account-generation",
      unresolvedEffects: ledger.unresolved("run").length > 0,
      check: () => {
        check();
        original();
      },
    };
  });
  const act = vi.fn(
    async (captured: Awaited<ReturnType<typeof capture>>, actionId: string): Promise<LoopToolResult> => {
      if (changedProof) nodeIdentity = "replacement-node";
      let result;
      try {
        const gate = await guardedExecute(
          { pages: { execute: executor.execute.bind(executor) }, durable: ledger },
          {
            runId: "run",
            actionId,
            pageId: "tab",
            steps: captured.steps,
            observation: {
              elements: [],
              formFields: [],
              text: "Actual sheet",
              url,
              headings: [],
              links: [],
              tables: [],
              landmarks: [],
              pageTitle: "Sheets",
            } as never,
            url,
            documentEpoch: 4,
            exec: {
              runId: mode === "ask" ? "run" : undefined,
              sourcePageCheck: captured.check,
              targetPreconditions: captured.preconditions,
            },
          },
        );
        if (gate.kind !== "ran") return { output: { [gate.kind]: gate.reason } };
        result = gate.result;
      } catch (error) {
        const pending = suspensions.pending("run");
        if (error instanceof AuxError && error.code === "needs_input" && pending)
          return {
            park: {
              kind: pending.kind,
              instruction: pending.request.instruction ?? error.message,
              approvalId: pending.request.approvalId,
            },
          };
        if (error instanceof AuxError && error.code === "needs_input" && parked)
          return {
            park: {
              kind: "action-confirmation",
              instruction: "Original approval",
              approvalId: "approval-original",
            },
          };
        throw error;
      }
      if (result.steps.some((step) => step.error?.code === "needs_input"))
        return {
          park: {
            kind: "action-confirmation",
            instruction: "Original approval",
            approvalId: "approval-original",
          },
        };
      return {
        output: {
          status: result.status,
          steps: result.steps,
          uncertainIntentIds: ledger.unresolved("run").map((intent) => intent.id),
        },
      };
    },
  );
  const confirm = vi.fn(
    (
      captured: Awaited<ReturnType<typeof capture>>,
      actionId: string,
      execution: unknown,
      selection: Awaited<ReturnType<typeof capture>>["selection"],
    ) =>
      confirmSheetsSelection(ledger, {
        runId: "run",
        pageId: "tab",
        documentEpoch: 4,
        actionId,
        steps: captured.steps,
        execution,
        selection,
      }),
  );
  const service = new SheetsWorkflows({
    checkOwner: check,
    capture,
    act,
    confirm,
    approval: (id) => approvals.continuation(id, { runId: "run", turnId: "run", threadId: "chat" }),
    undispatched: (captured, actionId) => sheetsInputsUndispatched(ledger, captured.steps, actionId),
  });
  return {
    service,
    approvals,
    suspensions,
    repo,
    pages,
    driver,
    capture,
    act,
    confirm,
    fill,
    press,
    ledger,
    gate,
    control,
    replace: () => {
      nodeIdentity = "replacement-node";
    },
    failFill: () => {
      inputFailure = true;
    },
    echoOnly: () => {
      echoOnly = true;
    },
    park: () => {
      parked = true;
    },
    cancel: () => {
      cancelled = true;
    },
    replaceAtDispatch: () => {
      changedProof = true;
    },
  };
}
async function prepare(f: ReturnType<typeof fixture>) {
  const result = await f.service.invoke(input, "prepare-call");
  if (!("output" in result)) throw Error("Expected prepare result");
  return (result.output as { recipeId: string }).recipeId;
}
it("uses actual DOM producer, governed two-step consumer and independent grid readback, retaining receipts", async () => {
  const f = fixture(),
    recipeId = await prepare(f);
  const result = await f.service.invoke({ action: "execute", recipeId }, "original-action");
  expect(result).toMatchObject({
    output: {
      status: "selection-observed",
      selection: { activeCell: { a1: "B2" }, selection: { range: { a1: "B2" } } },
      execution: {
        steps: [
          { op: "fill", status: "ok" },
          { op: "press", status: "ok" },
        ],
      },
    },
  });
  expect(f.fill).toHaveBeenCalledOnce();
  expect(f.press).toHaveBeenCalledOnce();
  expect(f.confirm).toHaveBeenCalledOnce();
  expect(f.ledger.unresolved("run")).toEqual([]);
  await expect(f.service.invoke({ action: "execute", recipeId }, "replay")).rejects.toMatchObject({
    code: "ref_stale",
  });
  expect(f.fill).toHaveBeenCalledOnce();
});
it("does not promote Name box or URL echoes into successful navigation and never replays uncertain input", async () => {
  const f = fixture(),
    recipeId = await prepare(f);
  f.echoOnly();
  expect(await f.service.invoke({ action: "execute", recipeId }, "action")).toMatchObject({
    output: { status: "uncertain", handback: true, execution: { status: "completed" } },
  });
  expect(f.control().value).toBe("B2");
  expect(location.href).toBe(url);
  expect(f.confirm).not.toHaveBeenCalled();
  expect(f.ledger.unresolved("run")).toHaveLength(1);
  const originalCapture = await f.capture(input);
  expect(sheetsInputsUndispatched(f.ledger, originalCapture.steps, "action")).toBe(false);
  await expect(f.service.invoke({ action: "execute", recipeId }, "retry")).rejects.toMatchObject({
    code: "ref_stale",
  });
  expect(f.press).toHaveBeenCalledOnce();
});
it("preserves actual parked approval and consumes recipe before parking; resume never inputs", async () => {
  const f = fixture(),
    recipeId = await prepare(f);
  f.park();
  const result = await f.service.invoke({ action: "execute", recipeId }, "approval-action");
  expect(result).toEqual({
    park: { kind: "action-confirmation", instruction: "Original approval", approvalId: "approval-original" },
  });
  expect(f.fill).not.toHaveBeenCalled();
  expect(f.press).not.toHaveBeenCalled();
  expect(f.confirm).not.toHaveBeenCalled();
  await expect(f.service.invoke({ action: "execute", recipeId }, "resume")).rejects.toMatchObject({
    code: "ref_stale",
  });
});
it("does not send Enter or retry fill after an uncertain input response", async () => {
  const f = fixture(),
    recipeId = await prepare(f);
  f.failFill();
  expect(await f.service.invoke({ action: "execute", recipeId }, "failed-fill")).toMatchObject({
    output: { status: "failed" },
  });
  expect(f.fill).toHaveBeenCalledOnce();
  expect(f.press).not.toHaveBeenCalled();
  expect(f.confirm).not.toHaveBeenCalled();
  expect(f.ledger.unresolved("run")).toHaveLength(1);
});
it.each(["node", "selection", "sheet", "document", "window", "controller", "cancel", "close"])(
  "refuses original %s retirement before any input",
  async (kind) => {
    const f = fixture(),
      recipeId = await prepare(f);
    if (kind === "node") f.replace();
    if (kind === "selection") document.getElementById("grid7")!.setAttribute("aria-activedescendant", "b2");
    if (kind === "sheet") document.getElementById("tab7")!.setAttribute("data-id", "8");
    if (kind === "document") f.pages.get("tab").documentEpoch++;
    if (kind === "window") f.pages.get("tab").windowId = "replacement";
    if (kind === "controller") f.pages.get("tab").controllerEpoch++;
    if (kind === "cancel") f.cancel();
    if (kind === "close") f.service.close();
    await expect(f.service.invoke({ action: "execute", recipeId }, "action")).rejects.toBeInstanceOf(Error);
    expect(f.fill).not.toHaveBeenCalled();
    expect(f.press).not.toHaveBeenCalled();
  },
);
it("compares original private target proof at dispatch instead of authorizing a replacement Name box", async () => {
  const f = fixture(),
    recipeId = await prepare(f);
  f.replaceAtDispatch();
  expect(await f.service.invoke({ action: "execute", recipeId }, "action")).toMatchObject({
    output: { status: "failed", steps: [{ error: { code: "ref_stale" } }] },
  });
  expect(f.fill).not.toHaveBeenCalled();
  expect(f.press).not.toHaveBeenCalled();
});
it.each([
  "hidden",
  "form",
  "ambiguous",
  "sensitive",
  "occluded",
  "foreign",
  "out-of-bounds",
  "missing-cells",
  "echo",
])("refuses %s Name box/target evidence before input", async (kind) => {
  const f = fixture();
  if (kind === "hidden") f.control().hidden = true;
  if (kind === "form") {
    const box = f.control(),
      form = document.createElement("form");
    box.replaceWith(form);
    form.append(box);
  }
  if (kind === "ambiguous") f.control().after(f.control().cloneNode(true));
  if (kind === "sensitive") f.control().name = "password";
  if (kind === "occluded")
    Object.defineProperty(document, "elementFromPoint", { configurable: true, value: () => document.body });
  if (kind === "foreign") document.body.append(f.control());
  if (kind === "out-of-bounds") input.a1 = "C3";
  if (kind === "missing-cells") {
    document.getElementById("grid7")!.setAttribute("aria-rowcount", "-1");
    document.getElementById("b2")!.remove();
  }
  if (kind === "echo") f.control().value = "B2";
  try {
    await expect(f.service.invoke(input, "prepare")).rejects.toBeInstanceOf(Error);
  } finally {
    input.a1 = "B2";
  }
  expect(f.fill).not.toHaveBeenCalled();
  expect(f.press).not.toHaveBeenCalled();
});
it("reports already selected from actual grid without input and rejects formulas/named ranges/cross-sheet input", async () => {
  const f = fixture();
  expect(await f.service.invoke({ ...input, a1: "A1" }, "prepare")).toMatchObject({
    output: { status: "already-selected" },
  });
  expect(f.act).not.toHaveBeenCalled();
  for (const a1 of ["=B2", "NamedRange", "Other!B2", "b2", "A0", "B2:A1", "A1:ZZZ99999999", "A1:A1"])
    expect(() => {
      SheetsNavigationInputSchema.parse({ ...input, a1 });
      sheetsRange(a1);
    }).toThrow();
  expect(SheetsNavigationInputSchema.safeParse({ ...input, switchSheet: true }).success).toBe(false);
});
it("does not publish a missing implementation and validates canonical tool input before callback", async () => {
  const tool = buildToolManifest().sheets_navigation!;
  expect(tool.available?.({})).toBe(false);
  const callback = vi.fn();
  expect(tool.available?.({ sheetsNavigation: callback })).toBe(true);
  expect(() =>
    tool.execute({ ...input, a1: "=IMPORTDATA()" }, {
      deps: { sheetsNavigation: callback },
      runId: "r",
      threadId: "t",
      turnId: "r",
      toolCallId: "call",
    } as never),
  ).toThrow();
  expect(callback).not.toHaveBeenCalled();
});

it("refuses projected Enter proof after original Name box replacement following an actual successful fill", async () => {
  const f = fixture(),
    recipeId = await prepare(f);
  f.fill.mockImplementationOnce(async (_target, value) => {
    f.control().value = value;
    f.replace();
  });
  expect(await f.service.invoke({ action: "execute", recipeId }, "action")).toMatchObject({
    output: {
      status: "failed",
      steps: [
        { op: "fill", status: "ok" },
        { op: "press", status: "failed", error: { code: "ref_stale" } },
      ],
    },
  });
  expect(f.fill).toHaveBeenCalledOnce();
  expect(f.press).not.toHaveBeenCalled();
  expect(f.confirm).not.toHaveBeenCalled();
});
it("consumes before revalidation awaits, so simultaneous execution cannot duplicate input", async () => {
  const f = fixture(),
    recipeId = await prepare(f);
  const original = f.capture.getMockImplementation()!;
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  f.capture.mockImplementationOnce(async (request) => {
    await held;
    return original(request);
  });
  const first = f.service.invoke({ action: "execute", recipeId }, "first");
  await expect(f.service.invoke({ action: "execute", recipeId }, "second")).rejects.toMatchObject({
    code: "ref_stale",
  });
  release();
  expect(await first).toMatchObject({ output: { status: "selection-observed" } });
  expect(f.fill).toHaveBeenCalledOnce();
  expect(f.press).toHaveBeenCalledOnce();
});
it("retains original receipt when source retires after both native input acknowledgements", async () => {
  const f = fixture(),
    recipeId = await prepare(f);
  const capture = f.capture.getMockImplementation()!;
  f.capture.mockImplementationOnce(capture).mockImplementationOnce(async (request) => {
    f.pages.get("tab").windowId = "replacement";
    return capture(request);
  });
  expect(await f.service.invoke({ action: "execute", recipeId }, "action")).toMatchObject({
    output: {
      status: "uncertain",
      execution: {
        steps: [
          { op: "fill", status: "ok" },
          { op: "press", status: "ok" },
        ],
      },
    },
  });
  expect(f.confirm).not.toHaveBeenCalled();
  expect(f.ledger.unresolved("run")).toHaveLength(1);
  expect(f.press).toHaveBeenCalledOnce();
});

it("does not authorize Enter merely from a projected fill when the actual control refused the value", async () => {
  const f = fixture(),
    recipeId = await prepare(f);
  f.fill.mockImplementationOnce(async () => {});
  expect(await f.service.invoke({ action: "execute", recipeId }, "action")).toMatchObject({
    output: { status: "failed" },
  });
  expect(f.fill).toHaveBeenCalledOnce();
  expect(f.press).not.toHaveBeenCalled();
  expect(f.confirm).not.toHaveBeenCalled();
  expect(f.ledger.unresolved("run")).toHaveLength(1);
});
it("cannot reconcile a different action or substitute unrelated intent IDs with otherwise valid grid metadata", async () => {
  const f = fixture(),
    recipeId = await prepare(f);
  f.echoOnly();
  const result = await f.service.invoke({ action: "execute", recipeId }, "original-action");
  if (!("output" in result)) throw Error("Expected original execution receipt");
  const original = (result.output as { execution: unknown }).execution;
  const captured = await f.capture(input);
  expect(() =>
    confirmSheetsSelection(f.ledger, {
      runId: "run",
      pageId: "tab",
      documentEpoch: 4,
      actionId: "different-action",
      steps: captured.steps,
      execution: original,
      selection: captured.selection,
    }),
  ).toThrow(/unrelated/);
  expect(() =>
    confirmSheetsSelection(f.ledger, {
      runId: "run",
      pageId: "tab",
      documentEpoch: 4,
      actionId: "original-action",
      steps: captured.steps,
      execution: { uncertainIntentIds: ["foreign-id"] },
      selection: captured.selection,
    }),
  ).toThrow(/unrelated/);
  expect(f.ledger.unresolved("run")).toHaveLength(1);
  expect(f.press).toHaveBeenCalledOnce();
});

it("Ask first with input review resumes only the actually accepted original batch, with one fill and Enter and independent readback", async () => {
  const f = fixture("ask"),
    recipeId = await prepare(f);
  const parked = await f.service.invoke({ action: "execute", recipeId }, "approved-original-action");
  if (!("park" in parked) || !parked.park.approvalId)
    throw Error("Expected actual governed batch approval: " + JSON.stringify(parked));
  const approvalId = parked.park.approvalId;
  expect(f.approvals.pending("chat")).toHaveLength(1);
  expect(f.fill).not.toHaveBeenCalled();
  expect(f.press).not.toHaveBeenCalled();
  expect(f.ledger.unresolved("run")).toHaveLength(0);
  expect(await f.service.invoke({ action: "execute", recipeId }, "approved-original-action")).toEqual(parked);
  await expect(
    f.service.invoke({ action: "execute", recipeId, approved: true }, "approved-original-action"),
  ).rejects.toBeInstanceOf(Error);
  f.approvals.decideLocal({ approvalId, decision: "accept" }, "run");
  f.suspensions.resolveByApprovalId(approvalId, "answered");
  expect(await f.service.invoke({ action: "execute", recipeId }, "approved-original-action")).toMatchObject({
    output: {
      status: "selection-observed",
      confirmedIntentId: expect.any(String),
      selection: { activeCell: { a1: "B2" } },
    },
  });
  expect(f.fill).toHaveBeenCalledOnce();
  expect(f.press).toHaveBeenCalledOnce();
  expect(f.confirm).toHaveBeenCalledOnce();
  expect(f.ledger.unresolved("run")).toEqual([]);
  await expect(
    f.service.invoke({ action: "execute", recipeId }, "approved-original-action"),
  ).rejects.toMatchObject({ code: "ref_stale" });
  expect(f.fill).toHaveBeenCalledOnce();
  expect(f.press).toHaveBeenCalledOnce();
});
it.each([
  "decline",
  "replace",
  "owner",
  "window",
  "document",
  "controller",
  "stop",
  "expired",
  "different-action",
])("retires sealed Ask continuation on %s and never inputs after a late decision", async (kind) => {
  const f = fixture("ask"),
    recipeId = await prepare(f),
    actionId = "original-action";
  const result = await f.service.invoke({ action: "execute", recipeId }, actionId);
  if (!("park" in result) || !result.park.approvalId) throw Error("Expected actual approval");
  const approvalId = result.park.approvalId;
  let lateDecisionError: unknown;
  if (kind === "decline") f.approvals.decideLocal({ approvalId, decision: "decline" }, "run");
  else if (kind === "expired") {
    vi.spyOn(Date, "now").mockReturnValue(
      f.approvals.continuation(approvalId, { runId: "run", turnId: "run", threadId: "chat" })!.expiresAt + 1,
    );
    try {
      f.approvals.decideLocal({ approvalId, decision: "accept" }, "run");
    } catch (error) {
      lateDecisionError = error;
    }
  } else if (kind === "stop") {
    f.cancel();
    f.repo.saveRun({ ...f.repo.getRun("run")!, status: "cancelled" });
    try {
      f.approvals.decideLocal({ approvalId, decision: "accept" }, "run");
    } catch (error) {
      lateDecisionError = error;
    }
  } else {
    if (kind === "replace") f.replace();
    if (kind === "window") f.pages.get("tab").windowId = "replacement";
    if (kind === "document") f.pages.get("tab").documentEpoch++;
    if (kind === "controller") f.pages.get("tab").controllerEpoch++;
    if (kind === "owner") {
      const capture = f.capture.getMockImplementation()!;
      f.capture.mockImplementationOnce(async (request) => ({
        ...(await capture(request)),
        authority: "steered-space-task-message",
      }));
    }
    f.approvals.decideLocal({ approvalId, decision: "accept" }, "run");
  }
  expect(lateDecisionError instanceof Error).toBe(["expired", "stop"].includes(kind));
  await expect(
    f.service.invoke(
      { action: "execute", recipeId },
      kind === "different-action" ? "unrelated-action" : actionId,
    ),
  ).rejects.toBeInstanceOf(Error);
  expect(f.fill).not.toHaveBeenCalled();
  expect(f.press).not.toHaveBeenCalled();
  expect(f.confirm).not.toHaveBeenCalled();
});
it("restart cannot resurrect a parked continuation even if its old approval is subsequently accepted", async () => {
  const f = fixture("ask"),
    recipeId = await prepare(f);
  const result = await f.service.invoke({ action: "execute", recipeId }, "original");
  if (!("park" in result) || !result.park.approvalId) throw Error("Expected actual approval");
  f.service.close();
  f.approvals.decideLocal({ approvalId: result.park.approvalId, decision: "accept" }, "run");
  const restarted = new SheetsWorkflows({
    checkOwner: () => {},
    capture: f.capture,
    act: f.act,
    confirm: f.confirm,
    approval: (id) => f.approvals.continuation(id, { runId: "run", turnId: "run", threadId: "chat" }),
    undispatched: (capture, actionId) => sheetsInputsUndispatched(f.ledger, capture.steps, actionId),
  });
  await expect(restarted.invoke({ action: "execute", recipeId }, "original")).rejects.toMatchObject({
    code: "ref_stale",
  });
  expect(f.fill).not.toHaveBeenCalled();
  expect(f.press).not.toHaveBeenCalled();
});
it("approval continuation reader is owner bound and does not consume actual one-time authorization", async () => {
  const f = fixture("ask"),
    recipeId = await prepare(f);
  const result = await f.service.invoke({ action: "execute", recipeId }, "original");
  if (!("park" in result) || !result.park.approvalId) throw Error("Expected actual approval");
  const id = result.park.approvalId,
    owner = { runId: "run", turnId: "run", threadId: "chat" };
  const pending = f.approvals.continuation(id, owner)!;
  expect(pending.state).toBe("pending");
  expect(f.approvals.continuation(id, { ...owner, runId: "foreign" })).toBeUndefined();
  expect(f.approvals.continuation(id, { ...owner, threadId: "foreign" })).toBeUndefined();
  f.approvals.decideLocal({ approvalId: id, decision: "accept" }, "run");
  expect(f.approvals.continuation(id, owner)).toEqual({ ...pending, state: "accepted" });
  expect(f.approvals.continuation(id, owner)).toEqual({ ...pending, state: "accepted" });
  f.approvals.retireTurn("run", "chat");
  expect(f.approvals.continuation(id, owner)).toBeUndefined();
});

it("retires an accepted continuation when Stop arrives during original proof revalidation, before any input", async () => {
  const f = fixture("ask"),
    recipeId = await prepare(f);
  const parked = await f.service.invoke({ action: "execute", recipeId }, "original");
  if (!("park" in parked) || !parked.park.approvalId) throw Error("Expected actual approval");
  f.approvals.decideLocal({ approvalId: parked.park.approvalId, decision: "accept" }, "run");
  const capture = f.capture.getMockImplementation()!;
  let started!: () => void, release!: () => void;
  const entered = new Promise<void>((resolve) => {
      started = resolve;
    }),
    held = new Promise<void>((resolve) => {
      release = resolve;
    });
  f.capture.mockImplementationOnce(async (request) => {
    started();
    await held;
    return capture(request);
  });
  const resumed = f.service.invoke({ action: "execute", recipeId }, "original").then(
    () => ({ error: undefined }),
    (error) => ({ error }),
  );
  await entered;
  f.approvals.retireTurn("run", "chat");
  f.cancel();
  release();
  expect((await resumed).error).toBeInstanceOf(Error);
  expect(f.fill).not.toHaveBeenCalled();
  expect(f.press).not.toHaveBeenCalled();
  await expect(f.service.invoke({ action: "execute", recipeId }, "original")).rejects.toMatchObject({
    code: "ref_stale",
  });
});
