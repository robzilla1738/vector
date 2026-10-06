// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { invokeRunControlCommand, registerRunControlCommands } from "./run-control-commands";
const cleanups: (() => void)[] = [];
afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup();
  document.body.replaceChildren();
});
function controls(runId: string) {
  const element = document.createElement("section"),
    button = document.createElement("button");
  element.append(button);
  document.body.append(element);
  element.getClientRects = () => [{ width: 100, height: 30 }] as unknown as DOMRectList;
  const invoke = vi.fn().mockReturnValue(Promise.resolve("acknowledged"));
  cleanups.push(registerRunControlCommands(element, runId, invoke));
  return { element, button, invoke };
}
it("invokes inside the original click and returns its original completion", () => {
  const { button, invoke } = controls("original");
  const completion = Promise.resolve("original completion");
  invoke.mockReturnValue(completion);
  let result: unknown, original: Event | undefined;
  button.addEventListener("click", (event) => {
    original = event;
    result = invokeRunControlCommand("stop-run", { payload: { runId: "original" }, nativeInputEvent: event });
  });
  button.click();
  expect(result).toBe(completion);
  expect(invoke).toHaveBeenCalledExactlyOnceWith("stop-run", original);
});
it("keyboard and programmatic commands invoke the focused run without fabricated input", () => {
  const first = controls("first"),
    second = controls("second");
  second.button.focus();
  invokeRunControlCommand("pause-run");
  expect(first.invoke).not.toHaveBeenCalled();
  expect(second.invoke).toHaveBeenCalledExactlyOnceWith("pause-run", undefined);
});
it("refuses ambiguous owners and cannot pick a recent run", () => {
  const first = controls("first"),
    second = controls("second");
  expect(() => invokeRunControlCommand("stop-run")).toThrow("Choose the run’s controls");
  expect(first.invoke).not.toHaveBeenCalled();
  expect(second.invoke).not.toHaveBeenCalled();
});
it("does not dispatch to hidden, removed or unregistered controls", () => {
  const hidden = controls("hidden"),
    removed = controls("removed"),
    retired = controls("retired");
  hidden.element.hidden = true;
  removed.element.remove();
  cleanups.pop()!();
  for (const runId of ["hidden", "removed", "retired"])
    expect(() => invokeRunControlCommand("stop-run", { payload: { runId } })).toThrow(
      "Choose the run’s controls",
    );
  expect(hidden.invoke).not.toHaveBeenCalled();
  expect(removed.invoke).not.toHaveBeenCalled();
  expect(retired.invoke).not.toHaveBeenCalled();
});
it("cannot borrow a different run’s actual click", () => {
  const first = controls("first"),
    second = controls("second");
  let caught: unknown;
  first.button.addEventListener("click", (event) => {
    try {
      invokeRunControlCommand("stop-run", { payload: { runId: "second" }, nativeInputEvent: event });
    } catch (error) {
      caught = error;
    }
  });
  first.button.click();
  expect(String(caught)).toContain("controls changed");
  expect(first.invoke).not.toHaveBeenCalled();
  expect(second.invoke).not.toHaveBeenCalled();
});

it("dispatches each same-run click to its original owner despite stale focus", () => {
  const first = controls("same"),
    second = controls("same");
  first.button.focus();
  for (const owner of [first, second]) {
    let original: Event | undefined, result: unknown;
    const completion = Promise.resolve("original completion");
    owner.invoke.mockReturnValue(completion);
    owner.button.addEventListener("click", (event) => {
      original = event;
      result = invokeRunControlCommand("stop-run", { payload: { runId: "same" }, nativeInputEvent: event });
    });
    owner.button.click();
    expect(result).toBe(completion);
    expect(owner.invoke).toHaveBeenCalledExactlyOnceWith("stop-run", original);
  }
});
it("refuses ambiguous nested event owners and an undispatched event", () => {
  const outer = controls("same"),
    inner = controls("same");
  outer.element.append(inner.element);
  let caught: unknown;
  inner.button.addEventListener("click", (event) => {
    try {
      invokeRunControlCommand("stop-run", { nativeInputEvent: event });
    } catch (error) {
      caught = error;
    }
  });
  inner.button.click();
  expect(String(caught)).toContain("controls changed");
  expect(() => invokeRunControlCommand("stop-run", { nativeInputEvent: new Event("click") })).toThrow(
    "controls changed",
  );
  expect(outer.invoke).not.toHaveBeenCalled();
  expect(inner.invoke).not.toHaveBeenCalled();
});
