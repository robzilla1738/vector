// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Goals } from "./Goals";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("../store", () => ({ call: rpc }));
let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  rpc.mockReset();
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

function button(label: string): HTMLButtonElement {
  const found = [...container.querySelectorAll("button")].find((item) => item.textContent?.trim() === label);
  if (!found) throw new Error(`Missing ${label}`);
  return found;
}
function change(selector: string, value: string) {
  const field = container.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)!;
  const setter = Object.getOwnPropertyDescriptor(
    field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
    "value",
  )!.set!;
  setter.call(field, value);
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
}

it("creates a bounded Goal and starts it only with the current tab and model ready", async () => {
  let goal: Record<string, unknown> | undefined;
  rpc.mockImplementation(async (method: string, params: Record<string, unknown>) => {
    if (method === "goals.list") return goal ? [goal] : [];
    if (method === "goals.create") {
      goal = {
        goalId: "goal-1",
        ...params,
        status: "draft",
        usedTokens: 0,
        knownCostUsd: 0,
        costComplete: true,
      };
      return goal;
    }
    if (method === "goals.start") {
      goal = { ...goal, status: "active", runId: "run-1" };
      return goal;
    }
    if (method === "goals.pause") {
      goal = { ...goal, status: "paused" };
      return goal;
    }
    if (method === "goals.cancel") {
      goal = { ...goal, status: "cancelled" };
      return goal;
    }
    throw new Error(`Unexpected ${method}`);
  });
  await act(async () =>
    root.render(
      <Goals workspaceId="space-1" activePageId="page-1" modelConfigured={false} openRun={() => {}} />,
    ),
  );
  await act(async () => button("New Goal").click());
  act(() => change("textarea", "Compare two reports"));
  await act(async () => button("Save Goal").click());
  expect(rpc).toHaveBeenCalledWith("goals.create", {
    workspaceId: "space-1",
    objective: "Compare two reports",
    budget: { maxTokens: 20000, deadlineMs: 1_800_000 },
  });
  expect(button("Start on current tab").disabled).toBe(true);
  await act(async () =>
    root.render(
      <Goals workspaceId="space-1" activePageId="page-1" modelConfigured={true} openRun={() => {}} />,
    ),
  );
  await act(async () => button("Start on current tab").click());
  expect(rpc).toHaveBeenCalledWith("goals.start", { goalId: "goal-1", pageIds: ["page-1"] });
  await act(async () => button("Pause").click());
  expect(rpc).toHaveBeenCalledWith("goals.pause", { goalId: "goal-1" });
  await act(async () => button("Cancel").click());
  expect(rpc).toHaveBeenCalledWith("goals.cancel", { goalId: "goal-1" });
});

it("binds a new Goal to the current conversation and blocks a second unfinished one", async () => {
  let goal: Record<string, unknown> | undefined;
  rpc.mockImplementation(async (method: string, params: Record<string, unknown>) => {
    if (method === "goals.list") return goal ? [goal] : [];
    if (method === "goals.create") {
      goal = { goalId: "goal-2", ...params, status: "draft", usedTokens: 0, knownCostUsd: 0, costComplete: true };
      return goal;
    }
    throw new Error(`Unexpected ${method}`);
  });
  await act(async () => root.render(<Goals workspaceId="space-1" chatId="chat-1" activePageId={null}
    modelConfigured={false} openRun={() => {}} />));
  await act(async () => button("New Goal").click());
  act(() => change("textarea", "Bounded conversation work"));
  await act(async () => button("Save Goal").click());
  expect(rpc).toHaveBeenCalledWith("goals.create", { workspaceId: "space-1", chatId: "chat-1",
    objective: "Bounded conversation work", budget: { maxTokens: 20000, deadlineMs: 1_800_000 } });
  expect(button("New Goal").disabled).toBe(true);
  expect(container.textContent).toContain("Finish or cancel this conversation’s current Goal");
});

it("shows a model-reported blocker and lets the owner resume the Goal", async () => {
  let status = "blocked";
  rpc.mockImplementation(async (method: string) => {
    if (method === "goals.list") return [{ goalId: "goal-3", workspaceId: "space-1", objective: "Investigate",
      budget: { maxTokens: 1200 }, status, blocker: "Authentication needed", usedTokens: 12,
      knownCostUsd: 0, costComplete: true, runId: "run-3" }];
    if (method === "goals.resume") { status = "active"; return {}; }
    throw new Error(`Unexpected ${method}`);
  });
  await act(async () => root.render(<Goals workspaceId="space-1" activePageId={null}
    modelConfigured={true} openRun={() => {}} />));
  expect(container.textContent).toContain("Blocked: Authentication needed");
  await act(async () => button("Resume").click());
  expect(rpc).toHaveBeenCalledWith("goals.resume", { goalId: "goal-3" });
  expect(container.textContent).not.toContain("Blocked: Authentication needed");
});
