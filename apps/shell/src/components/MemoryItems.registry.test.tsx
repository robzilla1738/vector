// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { COMMANDS, effectiveShortcuts, matchShortcut } from "@aux/contracts";
import { dispatchShortcut, executeCommand } from "../commands";
import { useStore } from "../store";
import { MEMORY_NOTE_COMMANDS, useMemoryNoteControl } from "./MemoryNoteControls";
it("remaps every actual registered Memory note action to its original focused control", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host),
    completion = Promise.resolve("original completion"),
    invoke = vi.fn(() => completion);
  function Fixture({ command }: { command: (typeof MEMORY_NOTE_COMMANDS)[number] }) {
    const [attach, run] = useMemoryNoteControl(command, "original-workspace", invoke);
    return (
      <button ref={attach} onClick={run}>
        Original control
      </button>
    );
  }
  try {
    for (const command of MEMORY_NOTE_COMMANDS) {
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
