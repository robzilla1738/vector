// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, expect, it, vi } from "vitest";
import type { HostMethodResult } from "@aux/contracts";
import { bridge } from "../../bridge";
import { useExtensionActions } from "./use-extension-actions";

vi.mock("../../bridge", () => ({
  bridge: { extensionActions: vi.fn(), onExtensionActionsChanged: vi.fn() },
}));
const item = (badgeText: string): HostMethodResult<"extensionActions"> => [
  {
    id: "local",
    name: "Unpacked fixture",
    iconPng: "",
    badgeText,
    badgeColor: "#fff",
    enabled: true,
    pinned: true,
    hasPopup: true,
  },
];
beforeEach(() => vi.resetAllMocks());

it("refreshes this window's native action snapshot and rejects stale initial results", async () => {
  let notify: (() => void) | undefined;
  let initial: ((items: HostMethodResult<"extensionActions">) => void) | undefined;
  const stop = vi.fn();
  vi.mocked(bridge.onExtensionActionsChanged).mockImplementation((callback) => {
    notify = () => callback(item("other-window"));
    return stop;
  });
  vi.mocked(bridge.extensionActions)
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          initial = resolve;
        }),
    )
    .mockResolvedValue(item("4"));
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  function Probe() {
    return <output>{JSON.stringify(useExtensionActions(true).items)}</output>;
  }
  const node = document.createElement("div");
  const root = createRoot(node);
  try {
    await act(async () => root.render(<Probe />));
    await act(async () => notify?.());
    expect(JSON.parse(node.textContent!)).toEqual(item("4"));
    await act(async () => initial?.(item("stale")));
    expect(JSON.parse(node.textContent!)).toEqual(item("4"));
  } finally {
    await act(async () => root.unmount());
    vi.unstubAllGlobals();
  }
  expect(stop).toHaveBeenCalledOnce();
});

it("does not subscribe or read native actions when unavailable", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  function Probe() {
    return <output>{JSON.stringify(useExtensionActions(false).items)}</output>;
  }
  const node = document.createElement("div");
  const root = createRoot(node);
  try {
    await act(async () => root.render(<Probe />));
    expect(JSON.parse(node.textContent!)).toEqual([]);
  } finally {
    await act(async () => root.unmount());
    vi.unstubAllGlobals();
  }
  expect(bridge.extensionActions).not.toHaveBeenCalled();
  expect(bridge.onExtensionActionsChanged).not.toHaveBeenCalled();
});
