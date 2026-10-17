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

it("waits for a retained tab panel to become visible before focusing its matching field", async () => {
  vi.useFakeTimers();
  const root = document.createElement("div");
  root.innerHTML =
    '<section><div role="tabpanel" hidden><div data-setting="MCP servers"></div></div></section>';
  document.body.append(root);
  const target = root.querySelector<HTMLElement>("[data-setting]")!;
  const focus = focusSettingsDestination(
    root,
    { category: "Connections", label: "MCP servers", target: "MCP servers", description: "" },
    new AbortController().signal,
  );
  expect(document.activeElement).not.toBe(target);
  root.querySelector<HTMLElement>("[role=tabpanel]")!.hidden = false;
  await vi.advanceTimersByTimeAsync(50);
  expect(await focus).toBe(true);
  expect(document.activeElement).toBe(target);
});
