// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { focusSettingsDestination } from "./search-focus";

afterEach(() => { vi.useRealTimers(); document.body.replaceChildren(); });

it("waits for a routed field, focuses it, and clears its three-flash marker", async () => {
  vi.useFakeTimers();
  const root = document.createElement("div");
  root.innerHTML = "<section></section>";
  document.body.append(root);
  const focus = focusSettingsDestination(root, {
    category: "Appearance", label: "Sidebar appearance", description: "", target: "Sidebar appearance",
  }, new AbortController().signal);
  const target = document.createElement("div");
  target.dataset.setting = "Sidebar appearance";
  root.querySelector("section")!.append(target);
  await vi.advanceTimersByTimeAsync(50);
  expect(await focus).toBe(true);
  expect(document.activeElement).toBe(target);
  expect(target.classList.contains("settings-search-focus")).toBe(true);
  await vi.advanceTimersByTimeAsync(2250);
  expect(target.classList.contains("settings-search-focus")).toBe(false);
});
