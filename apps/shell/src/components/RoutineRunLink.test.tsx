// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { RoutineRun } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { makeRun } from "../mock/fixtures";
import { RoutineRunLink } from "./RoutineRunLink";
const initial = useStore.getState();
const routineRun: RoutineRun = {
  routineRunId: "occurrence",
  routineId: "routine",
  revision: 1,
  status: "waiting_input",
  runId: "original-run",
  chatId: "original-chat",
  parameters: {},
  createdAt: 1,
};
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  useStore.setState(
    {
      ...initial,
      connected: true,
      conversationId: "current-chat",
      conversationDrafts: { "chat:current-chat": "Keep this draft" },
    },
    true,
  );
  vi.spyOn(bridge, "overlay").mockResolvedValue(false);
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
it("opens the exact linked chat for input without starting another run or replacing the current draft", async () => {
  const invoke = vi
    .spyOn(bridge, "invoke")
    .mockResolvedValue({
      run: makeRun({ runId: "original-run", config: { chatId: "original-chat" } }),
      steps: [],
      suspension: null,
    });
  await act(async () => root.render(<RoutineRunLink run={routineRun} />));
  expect(host.querySelector("button")!.textContent).toBe("Respond");
  await act(async () => host.querySelector("button")!.click());
  expect(invoke).toHaveBeenCalledExactlyOnceWith("runs.get", { runId: "original-run" });
  expect(useStore.getState().conversationId).toBe("original-chat");
  expect(useStore.getState().conversationDrafts["chat:current-chat"]).toBe("Keep this draft");
});
it("does not open a retired request, and a removed chat remains an actionable error", async () => {
  let resolve!: (value: unknown) => void;
  const invoke = vi.spyOn(bridge, "invoke").mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  await act(async () => root.render(<RoutineRunLink key="first" run={routineRun} />));
  await act(async () => host.querySelector("button")!.click());
  await act(async () =>
    root.render(
      <RoutineRunLink key="second" run={{ ...routineRun, routineRunId: "other", runId: "other-run" }} />,
    ),
  );
  await act(async () =>
    resolve({ run: makeRun({ runId: "original-run", config: { chatId: "original-chat" } }) }),
  );
  expect(useStore.getState().conversationId).toBe("current-chat");
  invoke.mockRejectedValueOnce(new Error("This run was removed."));
  await act(async () => host.querySelector("button")!.click());
  expect(host.querySelector('[role="alert"]')!.textContent).toContain("This run was removed.");
  expect(useStore.getState().conversationId).toBe("current-chat");
  expect(host.querySelector("button")!.disabled).toBe(false);
});
