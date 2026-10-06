// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { COMMANDS, type CommandDef } from "@aux/contracts";
import { runCommand, executeCommand, dispatchShortcut } from "../../commands";
import { useStore } from "../../store";
import * as registry from "../registry";
const originalToast = useStore.getState().toast;
const originalSidebar = useStore.getState().sidebar;
const originalSidebarPeek = useStore.getState().sidebarPeek;
afterEach(() => {
  vi.restoreAllMocks();
  useStore.setState({
    toast: originalToast,
    toasts: [],
    sidebar: originalSidebar,
    sidebarPeek: originalSidebarPeek,
  });
});
it("passes contextual payload and catches an asynchronous feature failure once", async () => {
  const toast = vi.fn();
  useStore.setState({ toast });
  const invoke = vi
    .spyOn(registry, "runFeatureCommand")
    .mockReturnValue({ handled: true, result: Promise.reject(new Error("Window closed")) });
  expect(runCommand("promote-tab", { payload: { pageId: "target-page" } })).toBe(true);
  expect(invoke).toHaveBeenCalledWith("promote-tab", useStore.getState(), {
    payload: { pageId: "target-page" },
  });
  await Promise.resolve();
  expect(toast).toHaveBeenCalledExactlyOnceWith("Window closed", "error", undefined);
});
it("refuses an ineligible window before invoking a feature handler", () => {
  const command = COMMANDS.find((command) => command.id === "promote-tab")! as CommandDef;
  const windows = command.windows;
  command.windows = ["little"];
  const invoke = vi.spyOn(registry, "runFeatureCommand");
  try {
    expect(runCommand("promote-tab")).toBe(false);
    expect(invoke).not.toHaveBeenCalled();
    expect(runCommand("unregistered-action")).toBe(false);
    expect(invoke).not.toHaveBeenCalled();
  } finally {
    command.windows = windows;
  }
});

it("refreshes one website advisory and dismisses it on successful handoff", () => {
  vi.spyOn(registry, "runFeatureCommand").mockReturnValue({ handled: true, result: undefined });
  const shortcut = { commandId: "sidebar", key: "s", meta: true, shift: false, alt: false };
  dispatchShortcut({ ...shortcut, websitePassThrough: false });
  const first = useStore.getState().toasts[0]!.id;
  dispatchShortcut({ ...shortcut, websitePassThrough: false });
  expect(useStore.getState().toasts).toHaveLength(1);
  expect(useStore.getState().toasts[0]!.id).not.toBe(first);
  dispatchShortcut({ ...shortcut, websitePassThrough: true });
  expect(useStore.getState().toasts).toHaveLength(0);
});

it("explicit sidebar collapse is idempotent from every sidebar mode", () => {
  vi.spyOn(registry, "runFeatureCommand").mockReturnValue({ handled: false });
  for (const sidebar of ["expanded", "hidden"] as const) {
    useStore.setState({ sidebar, sidebarPeek: true });
    expect(runCommand("sidebar-hide")).toBe(true);
    expect(useStore.getState().sidebar).toBe("hidden");
    expect(useStore.getState().sidebarPeek).toBe(false);
    expect(runCommand("sidebar-hide")).toBe(true);
    expect(useStore.getState().sidebar).toBe("hidden");
  }
});

it("awaits the actual registered feature acknowledgment and propagates refusal without a duplicate toast", async () => {
  let acknowledge!: () => void;
  const toast = vi.fn();
  useStore.setState({ toast });
  const invoke = vi.spyOn(registry, "runFeatureCommand").mockReturnValue({
    handled: true,
    result: new Promise<void>((resolve) => {
      acknowledge = resolve;
    }),
  });
  let completed = false;
  const operation = executeCommand("archive-delete", { payload: { archiveId: "saved-tab" } }).then(() => {
    completed = true;
  });
  await Promise.resolve();
  expect(completed).toBe(false);
  expect(invoke).toHaveBeenCalledExactlyOnceWith("archive-delete", useStore.getState(), {
    payload: { archiveId: "saved-tab" },
  });
  acknowledge();
  await operation;
  expect(completed).toBe(true);
  const error = new Error("Archive changed");
  invoke.mockReturnValue({ handled: true, result: Promise.reject(error) });
  await expect(executeCommand("archive-delete", { payload: { archiveId: "saved-tab" } })).rejects.toBe(error);
  expect(toast).not.toHaveBeenCalled();
});

it("opens page-free chat through the remappable command without creating a tab", () => {
  vi.spyOn(registry, "runFeatureCommand").mockReturnValue({ handled: false });
  const state = useStore.getState(),
    openConversation = vi.fn(),
    newTab = vi.fn();
  expect(runCommand("new-chat", { state: { ...state, openConversation, newTab } })).toBe(true);
  expect(openConversation).toHaveBeenCalledExactlyOnceWith(null);
  expect(newTab).not.toHaveBeenCalled();
  expect(COMMANDS.find((command) => command.id === "new-chat")?.windows).toEqual(["normal"]);
});
