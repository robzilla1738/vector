// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { COMMANDS, effectiveShortcuts, matchShortcut } from "@aux/contracts";
import { executeCommand, dispatchShortcut } from "./commands";
import { useStore } from "./store";
import { registerScopedControl, invokeScopedControl } from "./scoped-control-commands";
const MEMORY_SETTINGS_COMMANDS = ["select-memory-space", "retry-memory-search", "retry-memory-load"] as const;
const retire: (() => void)[] = [];
afterEach(() => {
  for (const cleanup of retire.splice(0)) cleanup();
  document.body.replaceChildren();
});
it("routes real registry remapping and preserves the original Retry completion", async () => {
  for (const id of MEMORY_SETTINGS_COMMANDS) {
    const button = document.createElement("button");
    document.body.append(button);
    button.getClientRects = () => [{}] as unknown as DOMRectList;
    button.focus();
    const promise = Promise.resolve(id),
      invoke = vi.fn(() => promise);
    retire.push(registerScopedControl(button, id, "original", invoke));
    const overrides = { [id]: [{ key: "m", command: true, alt: true }] };
    expect(
      matchShortcut(effectiveShortcuts(overrides), { key: "m", meta: true, alt: true, shift: false })?.id,
    ).toBe(id);
    const state = useStore.getState();
    expect(
      dispatchShortcut(
        { key: "m", meta: true, alt: true, shift: false },
        { state: { ...state, settings: { ...state.settings, shortcutOverrides: overrides } } },
      ),
    ).toBe(true);
    expect(invoke).toHaveBeenCalledOnce();
    await expect(executeCommand(id)).resolves.toBe(id);
    expect(COMMANDS.filter((row) => row.id === id)).toHaveLength(1);
  }
});
it("a registered command cannot borrow an unfocused, hidden or foreign Memory owner", () => {
  const button = document.createElement("button");
  document.body.append(button);
  button.getClientRects = () => [{}] as unknown as DOMRectList;
  const invoke = vi.fn();
  retire.push(registerScopedControl(button, "retry-memory-load", "workspace", invoke));
  expect(() => invokeScopedControl("retry-memory-load")).toThrow();
  button.focus();
  expect(() =>
    invokeScopedControl("retry-memory-load", { payload: { scopeId: "foreign" } }),
  ).toThrow();
  button.hidden = true;
  expect(() => invokeScopedControl("retry-memory-load")).toThrow();
  expect(invoke).not.toHaveBeenCalled();
});
