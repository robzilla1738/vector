// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AuxError, agentModelRoute, type PageTarget, type Run } from "@aux/contracts";
import {
  InlineAssist,
  applyInlineAssistInPage,
  readFocusedEditableInPage,
  verifyInlineAssistFieldInPage,
} from "../../apps/runtime/src/services/pages/inline-assist.js";
import { agentMethods } from "../../apps/runtime/src/api/methods/agent.js";
import type { MethodCtx } from "../../apps/runtime/src/api/methods/context.js";

const url = location.href;
const page: PageTarget = {
  pageId: "page-1",
  url,
  title: "Writing page",
  backend: "aux",
  documentEpoch: 3,
  viewStatus: "visible",
  controller: "none",
  ownedByRuntime: false,
} as PageTarget;
const request = { pageId: page.pageId, expectedUrl: url, expectedDocumentEpoch: 3 };
const route = agentModelRoute("fast");

function field(value = "A rough draft for the project.") {
  document.body.innerHTML = `<label>Project note<textarea></textarea></label>`;
  const textarea = document.querySelector("textarea")!;
  textarea.value = value;
  textarea.focus();
  textarea.setSelectionRange(0, value.length);
  return textarea;
}

function harness(ledger?: unknown) {
  const driver = {
    isAttached: () => true,
    url: () => page.url,
    evaluate: vi.fn(async (expression: string) => {
      for (const [fn, invoke] of [
        [readFocusedEditableInPage, (input: unknown) => readFocusedEditableInPage(input as string)],
        [
          verifyInlineAssistFieldInPage,
          (input: unknown) =>
            verifyInlineAssistFieldInPage(input as Parameters<typeof verifyInlineAssistFieldInPage>[0]),
        ],
        [
          applyInlineAssistInPage,
          (input: unknown) => applyInlineAssistInPage(input as Parameters<typeof applyInlineAssistInPage>[0]),
        ],
      ] as const) {
        const prefix = `(${fn.toString()})`;
        if (expression.startsWith(prefix)) return invoke(JSON.parse(expression.slice(prefix.length + 1, -1)));
      }
      throw new Error("Unexpected page script");
    }),
  };
  const pages = { get: () => page, driverPageLenient: () => driver, deps: { durableWrites: ledger } };
  const lanes = { enqueue: async (_id: string, work: () => Promise<unknown>) => work() };
  const assist = new InlineAssist(pages as never, lanes as never);
  const model = {
    generateStructured: vi.fn(async (_input: unknown) => ({
      object: { replacement: "A clear project draft." },
    })),
  };
  return { assist, driver, model };
}

beforeEach(() => {
  page.url = url;
  page.documentEpoch = 3;
  field();
  Object.defineProperty(document, "queryCommandSupported", { configurable: true, value: vi.fn(() => true) });
  Object.defineProperty(document, "execCommand", {
    configurable: true,
    value: vi.fn((_command: string, _show: boolean, value: string) => {
      const target = document.activeElement as HTMLTextAreaElement;
      target.setRangeText(value, target.selectionStart, target.selectionEnd, "end");
      return true;
    }),
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

it("rechecks preference authority after a page read and never calls the model after revocation", async () => {
  const { assist, model, driver } = harness();
  let enabled = true;
  const verify = () => {
    if (!enabled) throw new AuxError("permission_denied", "Inline assist is off");
  };
  const capture = await assist.capture(request, verify);
  driver.evaluate.mockImplementationOnce(async () => {
    enabled = false;
    return true;
  });
  await expect(
    assist.draft(
      { captureId: capture.captureId, instruction: "Improve clarity" },
      model as never,
      route,
      verify,
    ),
  ).rejects.toMatchObject({ code: "permission_denied" });
  expect(model.generateStructured).not.toHaveBeenCalled();
});

it("invalidates the original capture when preferences change, even if assist is enabled again", async () => {
  const { assist, model } = harness();
  let revision = 0;
  const verify = () => {
    if (revision !== 0) throw new AuxError("conflict", "Preferences changed");
  };
  const capture = await assist.capture(request, verify);
  revision = 2;
  await expect(
    assist.draft({ captureId: capture.captureId, instruction: "Improve clarity" }, model as never, route),
  ).rejects.toMatchObject({ code: "conflict" });
  expect(model.generateStructured).not.toHaveBeenCalled();
});

it("refuses queued insertion after preference revocation before any page or ledger write", async () => {
  const ledger = { begin: vi.fn() },
    { assist, model } = harness(ledger);
  let enabled = true;
  const verify = () => {
    if (!enabled) throw new AuxError("permission_denied", "Off");
  };
  const capture = await assist.capture(request, verify);
  await assist.draft(
    { captureId: capture.captureId, instruction: "Improve clarity" },
    model as never,
    route,
    verify,
  );
  let checks = 0;
  const queued = () => {
    if (++checks === 2) enabled = false;
    verify();
  };
  await expect(
    assist.apply({ captureId: capture.captureId, replacement: "Changed" }, undefined, queued),
  ).rejects.toMatchObject({ code: "permission_denied" });
  expect(ledger.begin).not.toHaveBeenCalled();
  expect(document.execCommand).not.toHaveBeenCalled();
});

it("captures only the focused selected field and drafts through the selected fast route", async () => {
  const { assist, model } = harness();
  const capture = await assist.capture(request);
  expect(capture).toMatchObject({
    origin: new URL(url).origin,
    fieldLabel: "Project note",
    sourceText: "A rough draft for the project.",
    mode: "selection",
  });
  expect(model.generateStructured).not.toHaveBeenCalled();
  const draft = await assist.draft(
    { captureId: capture.captureId, instruction: "Make it clear" },
    model as never,
    route,
  );
  expect(draft).toMatchObject({
    replacement: "A clear project draft.",
    modelId: "anthropic/claude-haiku-4.5",
  });
  const sent = model.generateStructured.mock.calls[0]![0] as {
    prompt: string;
    modelId: string;
    reasoning: string;
    maxAttempts: number;
  };
  expect(sent).toMatchObject({ modelId: route.modelId, reasoning: "low", maxAttempts: 1 });
  expect(sent.prompt).toContain("A rough draft for the project.");
  expect(sent.prompt).toContain(new URL(url).origin);
});

it("requires an explicit reviewed draft and refuses a changed field before insertion", async () => {
  const target = document.querySelector("textarea")!;
  const { assist, model } = harness();
  const capture = await assist.capture(request);
  await expect(assist.apply({ captureId: capture.captureId, replacement: "Changed" })).rejects.toMatchObject({
    code: "conflict",
  });
  await assist.draft({ captureId: capture.captureId, instruction: "Make it clear" }, model as never, route);
  target.value = "Someone edited the field";
  await expect(assist.apply({ captureId: capture.captureId, replacement: "Changed" })).rejects.toMatchObject({
    code: "conflict",
  });
  expect(document.execCommand).not.toHaveBeenCalled();
});

it("applies reviewed text through native insertText and rejects a second use", async () => {
  const target = document.querySelector("textarea")!;
  const ledger = {
    begin: vi.fn(() => ({ intent: { id: "intent-1", status: "pending" }, duplicate: false })),
    confirm: vi.fn(),
    fail: vi.fn(),
    abortUndispatched: vi.fn(),
  };
  const { assist, model } = harness(ledger);
  const capture = await assist.capture(request);
  await assist.draft({ captureId: capture.captureId, instruction: "Make it clear" }, model as never, route);
  expect(await assist.apply({ captureId: capture.captureId, replacement: "A clear project draft." })).toEqual(
    { applied: true, undoAvailable: true },
  );
  expect(target.value).toBe("A clear project draft.");
  expect(document.execCommand).toHaveBeenCalledWith("insertText", false, "A clear project draft.");
  expect(ledger.begin).toHaveBeenCalledWith(
    expect.objectContaining({ runId: "direct:page-1", logicalActionId: capture.captureId }),
  );
  expect(ledger.confirm).toHaveBeenCalledWith("intent-1");
  await expect(assist.apply({ captureId: capture.captureId, replacement: "Again" })).rejects.toMatchObject({
    code: "conflict",
  });
});

it("rejects sensitive inputs, navigation, and unsupported undo without touching the field", async () => {
  const sensitive = document.createElement("input");
  sensitive.type = "password";
  document.body.append(sensitive);
  sensitive.focus();
  expect(readFocusedEditableInPage(url)).toMatchObject({ ok: false, reason: "sensitive_field" });
  field();
  const captured = readFocusedEditableInPage(url);
  expect(captured.ok).toBe(true);
  if (!captured.ok) return;
  vi.mocked(document.queryCommandSupported).mockReturnValue(false);
  expect(
    applyInlineAssistInPage({ expectedUrl: url, field: captured.field, replacement: "New text" }),
  ).toMatchObject({ ok: false, reason: "undo_unavailable" });
  expect(document.execCommand).not.toHaveBeenCalled();
  const { assist, model } = harness();
  const capture = await assist.capture(request);
  page.documentEpoch = 4;
  await expect(
    assist.draft({ captureId: capture.captureId, instruction: "Make it clear" }, model as never, route),
  ).rejects.toMatchObject({ code: "conflict" } satisfies Partial<AuxError>);
  page.documentEpoch = 3;
  document.querySelector("textarea")!.value = "New private draft";
  await expect(
    assist.draft({ captureId: capture.captureId, instruction: "Make it clear" }, model as never, route),
  ).rejects.toMatchObject({ code: "conflict" });
  expect(model.generateStructured).not.toHaveBeenCalled();
});

it("inserts only the exact persisted completed-run proposal through the captured native-undo path", async () => {
  const target = document.querySelector("textarea")!;
  const ledger = {
    begin: vi.fn(() => ({ intent: { id: "intent-2", status: "pending" }, duplicate: false })),
    confirm: vi.fn(),
    fail: vi.fn(),
    abortUndispatched: vi.fn(),
  };
  const { assist } = harness(ledger);
  const capture = await assist.capture(request);
  const proposal = "The reviewed project note.";
  let run: Run = {
    runId: "run-1",
    goal: "Draft a note",
    status: "completed",
    pageIds: [],
    createdAt: 1,
    config: { implementation: "agent-loop" },
    result: { report: proposal, textProposal: proposal },
  };
  let driftBeforeLane = false;
  const apply = vi.fn((input: unknown, verify?: () => void) => {
    if (driftBeforeLane) run = { ...run, status: "running" };
    return assist.apply(input, verify);
  });
  const context = (replacement: string, external = false) =>
    ({
      client: { external },
      params: { captureId: capture.captureId, replacement, proposalRunId: run.runId },
      safetyAudit: { record: vi.fn() },
      s: {
        settings: {
          selectionCapture: () => ({ inlineAssist: true }),
          originPolicies: () => [],
          safetyCeiling: () => "ask",
        },
        repo: { getSetting: () => [] },
        runs: { coordinator: { get: () => run } },
        pages: { applyInlineAssist: apply },
      },
    }) as unknown as MethodCtx;
  await expect(agentMethods["agent.inlineAssist.apply"]!(context("Different text"))).rejects.toMatchObject({
    code: "conflict",
  });
  expect(apply).not.toHaveBeenCalled();
  run = { ...run, status: "running" };
  await expect(agentMethods["agent.inlineAssist.apply"]!(context(proposal))).rejects.toMatchObject({
    code: "conflict",
  });
  run = { ...run, status: "completed" };
  await expect(agentMethods["agent.inlineAssist.apply"]!(context(proposal, true))).rejects.toMatchObject({
    code: "permission_denied",
  });
  driftBeforeLane = true;
  await expect(agentMethods["agent.inlineAssist.apply"]!(context(proposal))).rejects.toMatchObject({
    code: "conflict",
  });
  expect(document.execCommand).not.toHaveBeenCalled();
  driftBeforeLane = false;
  run = { ...run, status: "completed" };
  expect(await agentMethods["agent.inlineAssist.apply"]!(context(proposal))).toEqual({
    applied: true,
    undoAvailable: true,
  });
  expect(target.value).toBe(proposal);
  expect(document.execCommand).toHaveBeenCalledWith("insertText", false, proposal);
  expect(ledger.confirm).toHaveBeenCalledWith("intent-2");
  await expect(agentMethods["agent.inlineAssist.apply"]!(context(proposal))).rejects.toMatchObject({
    code: "conflict",
  });
});
