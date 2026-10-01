// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import type { HostMethodResult } from "@aux/contracts";
import { bridge } from "../../bridge";
import { ExtensionShortcuts } from "./ExtensionShortcuts";

vi.mock("../../bridge", () => ({
  inNativeHost: true,
  bridge: {
    privateMode: false,
    windowKind: "normal",
    platform: "mac",
    extensionCommands: vi.fn(),
    onExtensionActionsChanged: vi.fn(),
  },
}));
vi.mock("../../use-feature", () => ({ useFeature: () => true }));
vi.mock("../../commands", () => ({ executeCommand: vi.fn() }));
const commands = (shortcut: string): HostMethodResult<"extensionCommands"> => [
  {
    extensionId: "fixture",
    name: "_execute_action",
    description: "Fixture action",
    shortcut,
  },
];

it("keeps the latest native shortcuts when an older focus refresh completes last", async () => {
  let first!: (items: HostMethodResult<"extensionCommands">) => void;
  let second!: (items: HostMethodResult<"extensionCommands">) => void;
  vi.mocked(bridge.extensionCommands)
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          first = resolve;
        }),
    )
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          second = resolve;
        }),
    );
  vi.mocked(bridge.onExtensionActionsChanged).mockReturnValue(vi.fn());
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const node = document.createElement("div");
  const root = createRoot(node);
  try {
    await act(async () => root.render(<ExtensionShortcuts />));
    await act(async () => window.dispatchEvent(new Event("focus")));
    await act(async () => second(commands("Command+Shift+U")));
    expect(node.querySelector("input")?.value).toBe("Command+Shift+U");
    await act(async () => first(commands("Command+Shift+Y")));
    expect(node.querySelector("input")?.value).toBe("Command+Shift+U");
  } finally {
    await act(async () => root.unmount());
    vi.unstubAllGlobals();
  }
});
