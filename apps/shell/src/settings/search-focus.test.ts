// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { focusSettingsDestination } from "./search-focus";

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

it("waits for a routed field, focuses it, and clears its three-flash marker", async () => {
  vi.useFakeTimers();
  const root = document.createElement("div");
  root.innerHTML = "<section></section>";
  document.body.append(root);
  const focus = focusSettingsDestination(
    root,
    {
      category: "Appearance",
      label: "Sidebar appearance",
      description: "",
      target: "Sidebar appearance",
    },
    new AbortController().signal,
  );
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

it("focuses a lazily mounted feature field and ignores matching fields in retained hidden sections", async () => {
  const root = document.createElement("div");
  root.innerHTML =
    '<div hidden><section data-settings-section="Downloads"><div data-setting="Filename template"></div></section></div><div><section data-settings-section="Downloads"><div data-setting="Filename template"></div></section></div>';
  document.body.append(root);
  const target = root.lastElementChild!.querySelector<HTMLElement>("[data-setting]")!;
  expect(
    await focusSettingsDestination(
      root,
      { category: "Downloads", label: "Filename template", target: "Filename template", description: "" },
      new AbortController().signal,
    ),
  ).toBe(true);
  expect(document.activeElement).toBe(target);
});
