// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { RemoteDebuggingState } from "@aux/contracts/remote-debugging";
import { RemoteDebugging } from "./RemoteDebugging";
const invoke = vi.hoisted(() => vi.fn());
vi.mock("../bridge", () => ({ bridge: { invoke } }));
const off: RemoteDebuggingState = {
  available: true,
  enabled: false,
  managed: false,
  allowed: false,
  canChange: true,
  state: "off",
  address: null,
  port: null,
};
let host: HTMLDivElement, root: Root;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  invoke.mockReset();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});
it("keeps the saved switch off until the actual native listener acknowledges binding", async () => {
  let acknowledge!: (value: RemoteDebuggingState) => void;
  let current = off;
  invoke.mockImplementation((method: string) =>
    method.endsWith(".get")
      ? Promise.resolve(current)
      : new Promise<RemoteDebuggingState>((resolve) => {
          acknowledge = resolve;
        }),
  );
  await act(async () => root.render(<RemoteDebugging />));
  const toggle = host.querySelector<HTMLInputElement>('[role="switch"]')!;
  await act(async () => toggle.click());
  expect(toggle.checked).toBe(false);
  expect(toggle.disabled).toBe(true);
  expect(invoke).toHaveBeenCalledWith("settings.remoteDebugging.set", { enabled: true });
  current = {
    ...off,
    enabled: true,
    allowed: true,
    state: "listening",
    address: "127.0.0.1:9222",
    port: 9222,
  };
  await act(async () => acknowledge(current));
  expect(toggle.checked).toBe(true);
  expect(toggle.disabled).toBe(false);
  expect(host.textContent).toContain("Listening on 127.0.0.1:9222");
});
it("allows clearing a user-on setting under managed disallow but cannot enable it again", async () => {
  let current: RemoteDebuggingState = { ...off, enabled: true, managed: true, state: "managed-disabled" };
  invoke.mockImplementation(async (method: string) => {
    if (method.endsWith(".set")) current = { ...current, enabled: false, canChange: false };
    return current;
  });
  await act(async () => root.render(<RemoteDebugging />));
  const toggle = host.querySelector<HTMLInputElement>('[role="switch"]')!;
  expect(toggle.checked).toBe(true);
  expect(toggle.disabled).toBe(false);
  await act(async () => toggle.click());
  expect(toggle.checked).toBe(false);
  expect(toggle.disabled).toBe(true);
  expect(host.textContent).toContain("disabled by your administrator");
});
it("does not adopt a late listener completion into a replaced Settings owner", async () => {
  let acknowledge!: (value: RemoteDebuggingState) => void;
  invoke.mockImplementation((method: string) =>
    method.endsWith(".get")
      ? Promise.resolve(off)
      : new Promise<RemoteDebuggingState>((resolve) => {
          acknowledge = resolve;
        }),
  );
  await act(async () => root.render(<RemoteDebugging />));
  await act(async () => host.querySelector<HTMLInputElement>('[role="switch"]')!.click());
  await act(async () => root.render(<div>Replacement settings</div>));
  const calls = invoke.mock.calls.length;
  await act(async () =>
    acknowledge({
      ...off,
      enabled: true,
      allowed: true,
      state: "listening",
      address: "127.0.0.1:9222",
      port: 9222,
    }),
  );
  expect(host.textContent).toBe("Replacement settings");
  expect(invoke.mock.calls).toHaveLength(calls);
});
