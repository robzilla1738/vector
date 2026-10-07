// @vitest-environment jsdom
import { act, type ComponentProps } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import type { TerminalSession } from "@aux/contracts/terminal";
import Terminal from "./Terminal";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("../../store", () => ({ call: rpc }));
vi.mock("../../ui", () => ({
  Button: (props: ComponentProps<"button"> & { size?: number }) => (
    <button disabled={props.disabled} onClick={props.onClick}>
      {props.children}
    </button>
  ),
}));
vi.mock("@xterm/xterm", () => ({
  Terminal: class {
    cols = 80;
    rows = 24;
    loadAddon() {}
    open() {}
    focus() {}
    dispose() {}
    write(_data: unknown, done?: () => void) {
      done?.();
    }
    onData() {
      return { dispose() {} };
    }
  },
}));
vi.mock("@xterm/addon-fit", () => ({
  FitAddon: class {
    fit() {}
  },
}));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(() => vi.unstubAllGlobals());

it("joins a concurrent read failure to Stop and keeps Start disabled until the original close ACK", async () => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  let failRead!: (reason: Error) => void;
  const read = new Promise<never>((_resolve, reject) => {
    failRead = reject;
  });
  let acknowledge!: (session: TerminalSession) => void;
  const close = new Promise<TerminalSession>((resolve) => {
    acknowledge = resolve;
  });
  const original: TerminalSession = {
    terminalId: "terminal-original",
    workspaceId: "space",
    folderId: "folder",
    cols: 80,
    rows: 24,
    state: "running",
  };
  rpc.mockReset();
  rpc.mockImplementation((method: string) => {
    if (method === "terminal.start") return Promise.resolve(original);
    if (method === "terminal.read") return read;
    if (method === "terminal.close") return close;
    throw new Error(`Unexpected terminal method ${method}`);
  });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const onSession = vi.fn();
  const button = (text: string) => {
    const found = [...host.querySelectorAll("button")].find((element) => element.textContent === text);
    if (!found) throw new Error(`Missing ${text} button`);
    return found;
  };
  try {
    await act(async () =>
      root.render(<Terminal workspaceId="space" folderId="folder" path="/project" onSession={onSession} />),
    );
    await act(async () => button("Start").click());
    expect(onSession).toHaveBeenLastCalledWith(original.terminalId);
    await act(async () => button("Stop").click());
    await act(async () => {
      failRead(new Error("Read retired while Stop is pending"));
    });
    expect(button("Start").disabled).toBe(true);
    expect(button("Stop").disabled).toBe(false);
    expect(rpc.mock.calls.filter(([method]) => method === "terminal.close")).toEqual([
      ["terminal.close", { terminalId: original.terminalId }],
    ]);
    expect(onSession).toHaveBeenLastCalledWith(original.terminalId);
    await act(async () => {
      acknowledge({ ...original, state: "closed" });
    });
    expect(button("Start").disabled).toBe(false);
    expect(button("Stop").disabled).toBe(true);
    expect(onSession).toHaveBeenLastCalledWith(undefined);
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
