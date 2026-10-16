// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { SuggestedTasks, SUGGESTED_TASKS } from "./SuggestedTasks";
const commands = vi.hoisted(() => vi.fn());
vi.mock("../commands", () => ({ runCommand: commands }));
const initial = useStore.getState(),
  originalPrivate = bridge.privateMode,
  originalScroll = Object.getOwnPropertyDescriptor(Element.prototype, "scrollIntoView");
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  localStorage.removeItem("aux.home.suggestions.v1");
  useStore.setState({ ...initial, runs: [] }, true);
  bridge.privateMode = false;
  commands.mockReset();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  bridge.privateMode = originalPrivate;
  localStorage.removeItem("aux.home.suggestions.v1");
  window.history.replaceState(null, "", "/");
  vi.restoreAllMocks();
  if (originalScroll) Object.defineProperty(Element.prototype, "scrollIntoView", originalScroll);
  else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
  vi.unstubAllGlobals();
});
it("keeps suggestions available after existing chats and remembers expansion across remounts", async () => {
  useStore.setState({ runs: [{} as never] });
  const choose = vi.fn();
  await act(async () => root.render(<SuggestedTasks onChoose={choose} />));
  const toggle = host.querySelector<HTMLButtonElement>("[aria-expanded]")!;
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  await act(async () => toggle.click());
  expect(host.querySelector("[aria-expanded=true]")).not.toBeNull();
  expect(host.querySelectorAll("article")).toHaveLength(3);
  await act(async () => root.render(null));
  await act(async () => root.render(<SuggestedTasks onChoose={choose} />));
  expect(host.querySelector("[aria-expanded=true]")).not.toBeNull();
  expect(choose).not.toHaveBeenCalled();
  expect(commands).not.toHaveBeenCalled();
});
it("fills a prompt only on explicit click and opens the real skills settings route", async () => {
  const choose = vi.fn();
  await act(async () => root.render(<SuggestedTasks onChoose={choose} />));
  expect(choose).not.toHaveBeenCalled();
  await act(async () =>
    host.querySelector<HTMLButtonElement>('[aria-label="Use prompt: Set up Aux’s memory"]')!.click(),
  );
  expect(choose).toHaveBeenCalledExactlyOnceWith(SUGGESTED_TASKS[0].prompt);
  expect(commands).not.toHaveBeenCalled();
  await act(async () =>
    host.querySelector<HTMLButtonElement>('[aria-label="Open customization settings"]')!.click(),
  );
  expect(window.location.pathname).toBe("/settings/skills-plugins");
  expect(useStore.getState().settingsCategory).toBe("Connections");
  expect(commands).toHaveBeenCalledExactlyOnceWith("settings");
});
it("does not display or read saved suggestions in a private Profile", async () => {
  bridge.privateMode = true;
  const read = vi.spyOn(Storage.prototype, "getItem");
  await act(async () => root.render(<SuggestedTasks onChoose={vi.fn()} />));
  expect(host.textContent).toBe("");
  expect(read).not.toHaveBeenCalled();
});
