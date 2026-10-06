// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { bridge } from "./bridge";
import { useStore } from "./store";
import { openSavedTask } from "./task-navigation";
import { rememberTask } from "./task-drafts";
vi.mock("./task-drafts", () => ({ rememberTask: vi.fn() }));
const initial = useStore.getState();
afterEach(() => {
  vi.restoreAllMocks();
  vi.mocked(rememberTask).mockClear();
  useStore.setState(initial, true);
});
it("does not replace newer navigation when a saved task finishes loading", async () => {
  let finish!: (value: unknown) => void;
  vi.spyOn(bridge, "invoke").mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const refresh = vi.fn();
  useStore.setState({ refreshSpaces: refresh, overlay: null });
  const opening = openSavedTask("task");
  useStore.setState({ overlay: "settings" });
  finish({ task: { taskId: "task", workspaceId: "work" } });
  await opening;
  expect(refresh).not.toHaveBeenCalled();
  expect(rememberTask).not.toHaveBeenCalled();
  expect(useStore.getState().overlay).toBe("settings");
});
it("lets the newest task request win even when responses arrive out of order", async () => {
  const finishes = new Map<string, (value: unknown) => void>();
  vi.spyOn(bridge, "invoke").mockImplementation(
    (_method, params) =>
      new Promise((resolve) => {
        finishes.set((params as { taskId: string }).taskId, resolve);
      }),
  );
  const switchSpace = vi.fn(),
    setOverlay = vi.fn();
  useStore.setState({
    layout: {
      ...initial.layout,
      spaces: [{ id: "space", name: "Research", color: "slate", grain: 0, workspaceId: "work" }],
    },
    refreshSpaces: async () => {},
    switchSpace,
    setOverlay,
  });
  const first = openSavedTask("first"),
    second = openSavedTask("second");
  finishes.get("second")!({ task: { taskId: "second", workspaceId: "work" } });
  await second;
  finishes.get("first")!({ task: { taskId: "first", workspaceId: "work" } });
  await first;
  expect(rememberTask).toHaveBeenCalledTimes(1);
  expect(rememberTask).toHaveBeenCalledWith("work", "second");
  expect(setOverlay).toHaveBeenCalledWith("tasks");
  expect(switchSpace).toHaveBeenCalledTimes(1);
});
