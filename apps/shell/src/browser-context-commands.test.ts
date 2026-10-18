// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { COMMANDS, effectiveShortcuts, matchShortcut } from "@aux/contracts";
import { executeCommand } from "./commands";
import { registerScopedControl, invokeScopedControl } from "./scoped-control-commands";
const ids: string[] = ["remove-browser-source", "toggle-browser-source", "select-browser-context"];
const retired: (() => void)[] = [];
afterEach(() => {
  retired.splice(0).forEach((done) => done());
  document.body.replaceChildren();
});
function owner(command: string, value: string) {
  const element = document.createElement("button");
  element.getClientRects = () => [{ width: 80 }] as unknown as DOMRectList;
  document.body.append(element);
  const invoke = vi.fn().mockReturnValue(Promise.resolve("original completion"));
  retired.push(registerScopedControl(element, command, value, invoke));
  return { element, invoke };
}
it.each(ids)("registers %s exactly once for normal and Quick Ask context", (id) => {
  expect(COMMANDS.filter((row) => row.id === id)).toHaveLength(1);
  expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
    handler: "shell",
    palette: false,
    windows: ["normal", "quick-ask"],
    bindings: [],
    intercept: true,
    focusShell: true,
  });
  expect(
    matchShortcut(effectiveShortcuts({ [id]: [{ key: "g", command: true, alt: true }] }), {
      key: "g",
      meta: true,
      alt: true,
      shift: false,
    })?.id,
  ).toBe(id);
});
it.each(ids)("real %s dispatch requires its original focused owner and propagates completion", async (id) => {
  const first = owner(id, "first"),
    next = owner(id, "next");
  next.element.focus();
  await expect(executeCommand(id, { payload: { pageId: "next" } })).resolves.toBe("original completion");
  expect(next.invoke).toHaveBeenCalledOnce();
  expect(first.invoke).not.toHaveBeenCalled();
});
it("selection/removal cannot borrow another action or a sole unfocused source", () => {
  const remove = owner("remove-browser-source", "same");
  expect(() => invokeScopedControl("remove-browser-source")).toThrow("focused");
  remove.element.focus();
  expect(() => invokeScopedControl("select-browser-context", { payload: { pageId: "same" } })).toThrow(
    "focused",
  );
  expect(remove.invoke).not.toHaveBeenCalled();
});
it("original click refuses hidden, foreign, disabled, disconnected and ambiguous owner", () => {
  const original = owner("toggle-browser-source", "same");
  let caught: unknown;
  original.element.addEventListener("click", (nativeInputEvent) => {
    try {
      invokeScopedControl("toggle-browser-source", { payload: { pageId: "foreign" }, nativeInputEvent });
    } catch (error) {
      caught = error;
    }
  });
  original.element.click();
  expect(String(caught)).toContain("changed");
  original.element.focus();
  original.element.hidden = true;
  expect(() => invokeScopedControl("toggle-browser-source")).toThrow("focused");
  original.element.hidden = false;
  original.element.disabled = true;
  expect(() => invokeScopedControl("toggle-browser-source")).toThrow("focused");
  original.element.disabled = false;
  retired.push(registerScopedControl(original.element, "toggle-browser-source", "same", original.invoke));
  expect(() => invokeScopedControl("toggle-browser-source")).toThrow("focused");
  original.element.remove();
  expect(() => invokeScopedControl("toggle-browser-source")).toThrow("focused");
  expect(original.invoke).not.toHaveBeenCalled();
});

it("keeps all scoped source commands out of the focus-stealing palette", () => {
  expect(["update-browser-source", ...ids].map((id) => COMMANDS.find((row) => row.id === id))).toMatchObject([
    { palette: false },
    { palette: false },
    { palette: false },
    { palette: false },
  ]);
});
