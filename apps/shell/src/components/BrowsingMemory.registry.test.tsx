// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { COMMANDS, effectiveShortcuts, matchShortcut } from "@aux/contracts";
import { dispatchShortcut, executeCommand } from "../commands";
import { useStore } from "../store";
import { BROWSING_MEMORY_COMMANDS, useBrowsingMemoryControl } from "./BrowsingMemoryControls";
it("remaps every actual registered Browsing Memory action to its original focused control", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host),
    completion = Promise.resolve("original completion"),
    invoke = vi.fn(() => completion);
  function Fixture({ command }: { command: (typeof BROWSING_MEMORY_COMMANDS)[number] }) {
    const [attach, run] = useBrowsingMemoryControl(command, "original-workspace", invoke);
    return (
      <button ref={attach} onClick={run}>
        Original control
      </button>
    );
  }
  try {
    for (const command of BROWSING_MEMORY_COMMANDS) {
      await act(async () => root.render(<Fixture key={command + "-shortcut"} command={command} />));
      host.querySelector("button")!.focus();
      invoke.mockClear();
      const definitions = COMMANDS.filter((row) => row.id === command);
      expect(definitions).toHaveLength(1);
      expect(definitions[0]).toMatchObject({
        handler: "shell",
        windows: ["normal"],
        focusShell: true,
        palette: false,
        bindings: [],
      });
      const overrides = { [command]: [{ key: "m", command: true, alt: true }] };
      expect(
        matchShortcut(effectiveShortcuts(overrides), { key: "m", meta: true, alt: true, shift: false })?.id,
      ).toBe(command);
      const state = useStore.getState();
      expect(
        dispatchShortcut(
          { key: "m", meta: true, alt: true, shift: false },
          { state: { ...state, settings: { ...state.settings, shortcutOverrides: overrides } } },
        ),
      ).toBe(true);
      expect(invoke).toHaveBeenCalledOnce();
      await act(async () => root.render(<Fixture key={command + "-direct"} command={command} />));
      host.querySelector("button")!.focus();
      await expect(executeCommand(command)).resolves.toBe("original completion");
    }
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("actual remapped dispatch does not toast a retired original completion but retains its rejection identity", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  const { guardCommandCompletion } = await import("../command-completion");
  let active = true,
    fail!: (reason: unknown) => void;
  const held = new Promise<never>((_ok, reject) => {
    fail = reject;
  });
  const completion = guardCommandCompletion(held, () => active);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  function Fixture() {
    const [attach, run] = useBrowsingMemoryControl(
      "toggle-browsing-memory",
      "original-workspace",
      () => completion,
    );
    return (
      <button ref={attach} onClick={run}>
        Original checkbox control
      </button>
    );
  }
  const before = useStore.getState().toasts;
  try {
    await act(async () => root.render(<Fixture />));
    host.querySelector("button")!.focus();
    const state = useStore.getState();
    expect(
      dispatchShortcut(
        { key: "m", meta: true, alt: true, shift: false },
        {
          state: {
            ...state,
            settings: {
              ...state.settings,
              shortcutOverrides: { "toggle-browsing-memory": [{ key: "m", command: true, alt: true }] },
            },
          },
        },
      ),
    ).toBe(true);
    active = false;
    const original = new Error("Protected retired dispatch");
    fail(original);
    await expect(completion).rejects.toBe(original);
    expect(useStore.getState().toasts).toBe(before);
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
