// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { COMMANDS, type CommandDef } from "@aux/contracts";
import { runCommand } from "../../commands";
import { useStore } from "../../store";
import * as registry from "../registry";
const originalToast = useStore.getState().toast;
afterEach(() => {
  vi.restoreAllMocks();
  useStore.setState({ toast: originalToast });
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
