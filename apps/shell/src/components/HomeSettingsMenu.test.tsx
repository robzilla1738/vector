// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HomeSettingsMenu } from "./HomeSettingsMenu";
import { runCommand } from "../commands";
import { useStore } from "../store";

vi.mock("../commands", () => ({ runCommand: vi.fn() }));
const initial = useStore.getState();
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  window.history.replaceState(null, "", "/");
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  window.history.replaceState(null, "", "/");
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it.each([
  ["Profiles", "Profiles", "/settings/profiles"],
  ["Usage & Budgets", "Usage & Budgets", "/settings/usage-budgets"],
  ["Settings", "General", "/settings/general"],
])("opens the real %s destination and dismisses the menu", async (label, category, path) => {
  await act(async () => root.render(<HomeSettingsMenu />));
  await act(async () => host.querySelector<HTMLButtonElement>("button")!.click());
  const item = [...document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')].find(
    (button) => button.textContent?.trim() === label,
  )!;
  await act(async () => item.click());
  expect(window.location.pathname).toBe(path);
  expect(useStore.getState().settingsCategory).toBe(category);
  expect(runCommand).toHaveBeenCalledWith("settings");
  expect(document.querySelector('[role="menu"]')).toBeNull();
});
it("returns focus to the Home trigger when dismissed with Escape", async () => {
  await act(async () => root.render(<HomeSettingsMenu />));
  const trigger = host.querySelector<HTMLButtonElement>("button")!;
  trigger.focus();
  await act(async () => trigger.click());
  await act(async () =>
    document
      .querySelector('[role="menu"]')!
      .dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })),
  );
  expect(document.activeElement).toBe(trigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(runCommand).not.toHaveBeenCalled();
});
