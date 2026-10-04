// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { TaskReceiptSchema } from "@aux/contracts";
import { TaskReceiptView } from "./TaskReceiptView";

const mock = vi.hoisted(() => ({ call: vi.fn() }));
vi.mock("../store", async original => ({ ...await original<typeof import("../store")>(), call: mock.call }));

it("reviews and selects exact local effects before run undo", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const token = "a".repeat(64);
  const receipt = TaskReceiptSchema.parse({ taskId: "task-1", taskRevision: 1, objective: "Edit form",
    generatedAt: 1, status: "needs_review", criteria: [], unresolvedActions: [], runs: [],
    modelCalls: 0, knownCostUsd: 0, costComplete: true,
    undoReviews: [{ runId: "r1", token, eligibleStepIds: ["first", "second"] }],
    browserChanges: [
      { stepId: "first", runId: "r1", pageId: "p1", taskRevision: 1, op: "fill", status: "ok",
        target: "#first", before: { value: "a" }, after: { value: "b" }, startedAt: 1 },
      { stepId: "second", runId: "r1", pageId: "p1", taskRevision: 1, op: "fill", status: "ok",
        target: "#second", before: { value: "c" }, after: { value: "d" }, startedAt: 2 },
    ] });
  mock.call.mockReset().mockImplementation(async (method: string) => method === "tasks.receipt" ? receipt :
    { restored: 1, skipped: [] });
  const changed = vi.fn(async () => {});
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<TaskReceiptView receipt={receipt} pageId="p1" submit={async () => true} onChanged={changed} />));
    const review = [...host.querySelectorAll("button")].find(button => button.textContent?.includes("Review browser changes"))!;
    await act(async () => review.click());
    const section = host.querySelector('[aria-label="Review selected browser undo"]')!;
    expect(section.textContent).toContain("Remote effects remain irreversible");
    const confirm = [...section.querySelectorAll("button")].find(button => button.textContent === "Undo selected browser changes")!;
    expect(confirm.disabled).toBe(true);
    await act(async () => (section.querySelectorAll("input[type=checkbox]")[1] as HTMLInputElement).click());
    expect(confirm.disabled).toBe(false);
    await act(async () => confirm.click());
    expect(mock.call).toHaveBeenCalledWith("tasks.undoRunBrowserChanges", {
      taskId: "task-1", expectedRevision: 1, runId: "r1", reviewToken: token,
      expectedStepIds: ["first", "second"], selectedStepIds: ["second"],
    });
    expect(changed).toHaveBeenCalledOnce();
  } finally { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); }
});
