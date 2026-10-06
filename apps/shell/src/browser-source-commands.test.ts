// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { COMMANDS, effectiveShortcuts, matchShortcut } from "@aux/contracts";
import { useStore } from "./store";
import { executeCommand, dispatchShortcut } from "./commands";
import { invokeScopedControl, registerScopedControl } from "./scoped-control-commands";
const cleanups: (() => void)[] = [];
afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup();
  document.body.replaceChildren();
});
function owner(pageId: string) {
  const button = document.createElement("button");
  document.body.append(button);
  button.getClientRects = () => [{ width: 100 }] as unknown as DOMRectList;
  const invoke = vi.fn().mockReturnValue(Promise.resolve("original acknowledgement"));
  cleanups.push(registerScopedControl(button, "update-browser-source", pageId, invoke));
  return { button, invoke };
}
it("adds exactly one normal-window core command with genuine remapping", () => {
  const defs = COMMANDS.filter((row) => row.id === "update-browser-source");
  expect(defs).toHaveLength(1);
  expect(defs[0]).toMatchObject({
    handler: "shell",
    windows: ["normal"],
    focusShell: true,
    intercept: true,
    bindings: [],
  });
  const defsWithKey = effectiveShortcuts({
    "update-browser-source": [{ key: "u", command: true, alt: true }],
  });
  expect(matchShortcut(defsWithKey, { key: "u", meta: true, alt: true, shift: false })?.id).toBe(
    "update-browser-source",
  );
  const original = owner("original");
  original.button.focus();
  const state = useStore.getState();
  expect(
    dispatchShortcut(
      { key: "u", meta: true, alt: true, shift: false },
      {
        state: {
          ...state,
          settings: {
            ...state.settings,
            shortcutOverrides: { "update-browser-source": [{ key: "u", command: true, alt: true }] },
          },
        },
      },
    ),
  ).toBe(true);
  expect(original.invoke).toHaveBeenCalledOnce();
});
it("real registry invokes only focused exact source and propagates original completion", async () => {
  const first = owner("first"),
    next = owner("next");
  next.button.focus();
  await expect(executeCommand("update-browser-source", { payload: { pageId: "next" } })).resolves.toBe(
    "original acknowledgement",
  );
  expect(next.invoke).toHaveBeenCalledOnce();
  expect(first.invoke).not.toHaveBeenCalled();
});
it("shortcut cannot choose a sole unfocused or a foreign focused source", () => {
  const first = owner("first");
  expect(() => invokeScopedControl("update-browser-source")).toThrow("Choose");
  first.button.focus();
  expect(() => invokeScopedControl("update-browser-source", { payload: { pageId: "foreign" } })).toThrow(
    "Choose",
  );
  expect(first.invoke).not.toHaveBeenCalled();
});
it("original click selects its exact source despite stale focus and returns original Promise", () => {
  const first = owner("same"),
    next = owner("same");
  first.button.focus();
  const completion = Promise.resolve();
  next.invoke.mockReturnValue(completion);
  let result: unknown;
  next.button.addEventListener("click", (nativeInputEvent) => {
    result = invokeScopedControl("update-browser-source", { payload: { pageId: "same" }, nativeInputEvent });
  });
  next.button.click();
  expect(result).toBe(completion);
  expect(next.invoke).toHaveBeenCalledOnce();
  expect(first.invoke).not.toHaveBeenCalled();
});
it("hidden, disabled, disconnected, retired and synthetic undispatched owners refuse", () => {
  const hidden = owner("hidden"),
    disabled = owner("disabled"),
    removed = owner("removed"),
    retired = owner("retired");
  hidden.button.hidden = true;
  disabled.button.disabled = true;
  removed.button.remove();
  cleanups.pop()!();
  for (const { button, invoke } of [hidden, disabled, removed, retired]) {
    button.focus();
    expect(() =>
      invokeScopedControl("update-browser-source", {
        payload: {
          pageId:
            button === hidden.button
              ? "hidden"
              : button === disabled.button
                ? "disabled"
                : button === removed.button
                  ? "removed"
                  : "retired",
        },
      }),
    ).toThrow("Choose");
    expect(invoke).not.toHaveBeenCalled();
  }
  expect(() =>
    invokeScopedControl("update-browser-source", { nativeInputEvent: new Event("click") }),
  ).toThrow("changed");
});

it("duplicate original owner registrations refuse ambiguous click and focus", () => {
  const original = owner("same");
  cleanups.push(registerScopedControl(original.button, "update-browser-source", "same", original.invoke));
  original.button.focus();
  expect(() => invokeScopedControl("update-browser-source")).toThrow("Choose");
  let caught: unknown;
  original.button.addEventListener("click", (nativeInputEvent) => {
    try {
      invokeScopedControl("update-browser-source", { nativeInputEvent });
    } catch (error) {
      caught = error;
    }
  });
  original.button.click();
  expect(String(caught)).toContain("changed");
  expect(original.invoke).not.toHaveBeenCalled();
});
