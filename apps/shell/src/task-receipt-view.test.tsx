// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { TaskReceiptSchema } from "@aux/contracts";
import { bridge } from "./bridge";
import { TaskReceiptView } from "./components/TaskReceiptView";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const host = document.createElement("div");
document.body.append(host);
const root = createRoot(host);
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
});
afterEach(async () => {
  await act(async () => root.render(null));
  vi.restoreAllMocks();
});
it("refuses to export a revision that changed while the receipt was open", async () => {
  const receipt = TaskReceiptSchema.parse({
    taskId: "task-1",
    taskRevision: 1,
    objective: "Review",
    generatedAt: 0,
    status: "needs_review",
    criteria: [],
    unresolvedActions: [],
    runs: [],
    modelCalls: 0,
    knownCostUsd: 0,
    costComplete: true,
  });
  vi.spyOn(bridge, "invoke").mockResolvedValue({ ...receipt, taskRevision: 2 });
  const save = vi.spyOn(bridge, "saveFile").mockResolvedValue("/unused");
  await act(async () =>
    root.render(<TaskReceiptView receipt={receipt} pageId={null} submit={async () => true} />),
  );
  await act(async () => host.querySelector("button")!.click());
  expect(save).not.toHaveBeenCalled();
  expect(host.querySelector("[role=alert]")?.textContent).toContain("This task changed");
});
it("exports the selected saved revision without exposing mutation controls", async () => {
  const receipt = TaskReceiptSchema.parse({
    taskId: "task-1",
    taskRevision: 1,
    currentTaskRevision: 3,
    objective: "Earlier objective",
    generatedAt: 0,
    status: "accepted",
    criteria: [
      {
        criterion: { criterionId: "c1", description: "Check prior outcome", verification: "manual" },
        status: "accepted",
        evidence: [],
      },
    ],
    unresolvedActions: [],
    runs: [],
    modelCalls: 0,
    knownCostUsd: 0,
    costComplete: true,
  });
  const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue(receipt);
  const save = vi.spyOn(bridge, "saveFile").mockResolvedValue("/unused");
  await act(async () => root.render(<TaskReceiptView receipt={receipt} pageId={null} readOnly />));
  expect(host.textContent).toContain("does not establish the current task");
  expect(host.querySelector("textarea")).toBeNull();
  expect(host.textContent).not.toContain("Accept criterion");
  expect(host.textContent).not.toContain("Import document");
  await act(async () => host.querySelector("button")!.click());
  expect(invoke).toHaveBeenCalledWith("tasks.receipt", { taskId: "task-1", revision: 1 });
  expect(save.mock.calls[0]![1]).toContain("# Aux task receipt — earlier revision");
  expect(save.mock.calls[0]![1]).toContain("current task revision is 3");
  expect(save.mock.calls[0]![1]).toContain("not a reconstruction");
});
