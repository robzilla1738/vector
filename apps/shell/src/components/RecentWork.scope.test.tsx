// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { RoutineSchema } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { RecentWork } from "./RecentWork";
const initial = useStore.getState();
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const spaces = ["a", "b"].map((id) => ({
  ...initial.layout.spaces[0]!,
  id,
  workspaceId: `workspace-${id}`,
  name: id,
}));
function routine(workspaceId: string) {
  return RoutineSchema.parse({
    routineId: `${workspaceId}-routine`,
    revision: 1,
    title: `${workspaceId} routine`,
    objective: "A real saved definition",
    workspaceId,
    createdAt: 1,
    updatedAt: 1,
  });
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  useStore.setState({ layout: { ...initial.layout, activeSpaceId: "a", spaces }, conversationDrafts: {} });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function openRoutines() {
  await act(async () => root.render(<RecentWork />));
  const tab = [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find(
    (button) => button.textContent === "Routines",
  )!;
  await act(async () => tab.click());
}
async function switchSpace(id: string) {
  await act(async () => useStore.setState((state) => ({ layout: { ...state.layout, activeSpaceId: id } })));
}

it("hides another Space's routine cards during a failed fetch and exposes only the recovered current Space", async () => {
  let reject!: (reason: Error) => void,
    second = 0;
  vi.spyOn(bridge, "invoke").mockImplementation(async (method, params) => {
    if (method === "conversations.list") return [];
    if (method === "routines.list") {
      const { workspaceId } = params as { workspaceId: string };
      if (workspaceId === "workspace-a") return [routine(workspaceId)];
      if (++second === 1)
        return new Promise((_done, fail) => {
          reject = fail;
        });
      return [routine(workspaceId)];
    }
    return [];
  });
  await openRoutines();
  expect(host.textContent).toContain("workspace-a routine");
  await switchSpace("b");
  expect(host.textContent).not.toContain("workspace-a routine");
  expect(host.querySelector('[role="tabpanel"]')!.getAttribute("aria-busy")).toBe("true");
  await act(async () => reject(new Error("Synthetic loopback workspace refusal")));
  expect(host.textContent).not.toContain("workspace-a routine");
  expect(host.querySelector('[role="alert"]')!.textContent).toContain("Recent work couldn’t be loaded");
  const retry = [...host.querySelectorAll<HTMLButtonElement>("button")].find(
    (button) => button.textContent === "Retry",
  )!;
  await act(async () => retry.click());
  expect(host.textContent).toContain("workspace-b routine");
  expect(host.textContent).not.toContain("workspace-a routine");
  expect(host.querySelector('[role="alert"]')).toBeNull();
});

it("keeps the current Space when a retired routine reply arrives out of order", async () => {
  let finishFirst!: (value: ReturnType<typeof routine>[]) => void;
  vi.spyOn(bridge, "invoke").mockImplementation(async (method, params) => {
    if (method === "routines.list") {
      const { workspaceId } = params as { workspaceId: string };
      if (workspaceId === "workspace-a")
        return new Promise((done) => {
          finishFirst = done;
        });
      return [routine(workspaceId)];
    }
    return [];
  });
  await openRoutines();
  await switchSpace("b");
  expect(host.textContent).toContain("workspace-b routine");
  await act(async () => finishFirst([routine("workspace-a")]));
  expect(host.textContent).toContain("workspace-b routine");
  expect(host.textContent).not.toContain("workspace-a routine");
});
