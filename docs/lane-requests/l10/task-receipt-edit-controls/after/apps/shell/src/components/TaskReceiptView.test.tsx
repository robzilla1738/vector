// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { TaskReceiptSchema } from "@aux/contracts";
import { TaskReceiptView } from "./TaskReceiptView";
beforeEach(()=>{vi.spyOn(HTMLElement.prototype,"getClientRects").mockReturnValue([{}] as unknown as DOMRectList);});
afterEach(()=>vi.restoreAllMocks());

it("shows prior form state and flags failed writes as uncertain", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const receipt = TaskReceiptSchema.parse({ taskId: "task-1", taskRevision: 1, objective: "Edit form",
    generatedAt: 1, status: "needs_review", criteria: [], unresolvedActions: [], runs: [],
    modelCalls: 0, knownCostUsd: 0, costComplete: true,
    browserChanges: [
      { stepId: "s1", runId: "r1", pageId: "p1", taskRevision: 1, op: "fill", status: "ok",
        target: "#quantity", before: { value: "3" }, startedAt: 1 },
      { stepId: "s2", runId: "r1", pageId: "p1", taskRevision: 1, op: "check", status: "failed",
        target: "#agree", before: { checked: false }, startedAt: 2 },
    ] });
  try {
    await act(async () => root.render(<TaskReceiptView receipt={receipt} pageId={null} readOnly />));
    const section = host.querySelector('[aria-label="Browser changes"]')!;
    expect(section.textContent).toContain("Before: 3");
    expect(section.textContent).toContain("Before: false");
    expect(section.textContent).toContain("outcome uncertain");
  } finally { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); }
});

it("offers undo on the original page for a completed edit with both states", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  const submit = vi.fn(async () => true);
  const receipt = TaskReceiptSchema.parse({ taskId: "task-1", taskRevision: 1, objective: "Edit form",
    generatedAt: 1, status: "needs_review", criteria: [], unresolvedActions: [], runs: [],
    modelCalls: 0, knownCostUsd: 0, costComplete: true,
    browserChanges: [{ stepId: "s1", runId: "r1", pageId: "p1", taskRevision: 1, op: "fill",
      status: "ok", target: "#quantity", before: { value: "3" }, after: { value: "4" }, startedAt: 1 }] });
  try {
    await act(async () => root.render(<TaskReceiptView receipt={receipt} pageId="p1" submit={submit} />));
    const button = [...host.querySelectorAll("button")].find(item => item.textContent === "Undo form edit")!;
    expect(button.disabled).toBe(false);
    await act(async () => button.click());
    expect(submit).toHaveBeenCalledWith("tasks.undoBrowserChange",
      { taskId: "task-1", expectedRevision: 1, runId: "r1", stepId: "s1" });
  } finally { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); }
});

it("shows browser observation separately from remote confirmation", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  const receipt = TaskReceiptSchema.parse({ taskId: "task-1", taskRevision: 1, objective: "Submit",
    generatedAt: 1, status: "needs_review", criteria: [], unresolvedActions: [], runs: [],
    modelCalls: 0, knownCostUsd: 0, costComplete: true,
    remoteActions: [{ stepId: "s1", runId: "r1", pageId: "p1", taskRevision: 1, op: "click",
      status: "ok", startedAt: 1, browserObserved: "Thank you", remoteConfirmed: false, uncertain: false }] });
  try {
    await act(async () => root.render(<TaskReceiptView receipt={receipt} pageId={null} readOnly />));
    const section = host.querySelector('[aria-label="Consequential page actions"]')!;
    expect(section.textContent).toContain("Browser observed: Thank you");
    expect(section.textContent).toContain("no remote confirmation");
    expect(section.textContent).toContain("cannot be reversed");
  } finally { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); }
});

it("shows a native group receipt without offering an unverified undo", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  const receipt = TaskReceiptSchema.parse({ taskId: "task-1", taskRevision: 1, objective: "Group tabs",
    generatedAt: 1, status: "needs_review", criteria: [], unresolvedActions: [], runs: [],
    modelCalls: 0, knownCostUsd: 0, costComplete: true,
    groupChanges: [{ stepId: "11111111-1111-4111-8111-111111111111", runId: "r1", groupId: "native-group",
      taskRevision: 1, observedAt: 1, before: { revision: 1, memberPageIds: ["p1"] },
      after: { revision: 2, memberPageIds: ["p1", "p2"], title: "Research" }, undoAvailable: false }] });
  try {
    await act(async () => root.render(<TaskReceiptView receipt={receipt} pageId={null} submit={async () => true} />));
    const section = host.querySelector('[aria-label="Tab group changes"]')!;
    expect(section.textContent).toContain("Research");
    expect(section.textContent).toContain("Undo is unavailable");
    expect(section.querySelector("button")).toBeNull();
  } finally { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); }
});

it("offers bookmark undo from the owner receipt", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  const submit = vi.fn(async () => true);
  const receipt = TaskReceiptSchema.parse({ taskId: "task-1", taskRevision: 1, objective: "Save",
    generatedAt: 1, status: "needs_review", criteria: [], unresolvedActions: [], runs: [],
    modelCalls: 0, knownCostUsd: 0, costComplete: true,
    bookmarkChanges: [{ stepId: "s1", runId: "r1", pageId: "p1", taskRevision: 1,
      status: "ok", startedAt: 1, title: "Source", url: "https://fixture.test/" }] });
  try {
    await act(async () => root.render(<TaskReceiptView receipt={receipt} pageId={null} submit={submit} />));
    const button = [...host.querySelectorAll("button")].find(item => item.textContent === "Undo bookmark")!;
    await act(async () => button.click());
    expect(submit).toHaveBeenCalledWith("tasks.undoBookmarkChange",
      { taskId: "task-1", expectedRevision: 1, runId: "r1", stepId: "s1" });
  } finally { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); }
});

it("offers recoverable download cleanup only for a verified completed file", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  const submit = vi.fn(async () => true);
  const receipt = TaskReceiptSchema.parse({ taskId: "task-1", taskRevision: 1, objective: "Download",
    generatedAt: 1, status: "needs_review", criteria: [], unresolvedActions: [], runs: [],
    modelCalls: 0, knownCostUsd: 0, costComplete: true,
    downloadChanges: [
      { stepId: "done", runId: "r1", pageId: "p1", taskRevision: 1, status: "completed",
        startedAt: 1, filename: "report.pdf", cleanupAvailable: true },
      { stepId: "stalled", runId: "r1", pageId: "p1", taskRevision: 1, status: "interrupted",
        startedAt: 2, filename: "partial.pdf", cleanupAvailable: false },
    ] });
  try {
    await act(async () => root.render(<TaskReceiptView receipt={receipt} pageId={null} submit={submit} />));
    const section = host.querySelector('[aria-label="Download changes"]')!;
    expect(section.textContent).toContain("interrupted");
    const button = [...section.querySelectorAll("button")].find(item => item.textContent === "Move download to Trash")!;
    expect(section.querySelectorAll("button")).toHaveLength(1);
    await act(async () => button.click());
    expect(submit).toHaveBeenCalledWith("tasks.undoDownloadChange",
      { taskId: "task-1", expectedRevision: 1, runId: "r1", stepId: "done" });
  } finally { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); }
});
