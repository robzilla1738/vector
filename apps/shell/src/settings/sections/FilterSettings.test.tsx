// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { bridge } from "../../bridge";
import { FilterSettings } from "./FilterSettings";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("searches filters and reviews a recommendation without downloading on selection", async () => {
  vi.spyOn(bridge, "filterLists").mockResolvedValue({
    backend: "ublock_origin",
    cosmeticBackend: "native_user_styles",
    sources: [],
    compilationWarnings: [],
  });
  const add = vi.spyOn(bridge, "addFilterSource");
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<FilterSettings active />));
    await act(async () => host.querySelector<HTMLButtonElement>("button")!.click());
    const input = document.querySelector<HTMLInputElement>('[aria-label="Search filters"]')!;
    expect(document.activeElement).toBe(input);
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "EasyPrivacy");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const menu = document.querySelector('[role="menu"]')!;
    expect(menu.textContent).toContain("EasyPrivacy");
    expect(
      [...menu.querySelectorAll('button[role="menuitem"]')].every((row) =>
        row.classList.contains("menu-item"),
      ),
    ).toBe(true);
    expect(menu.querySelector(".menu-label")?.textContent).toBe("Recommended");
    expect(menu.querySelector("hr.menu-sep")).not.toBeNull();
    expect(menu.textContent).not.toContain("EasyList");
    await act(async () =>
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })),
    );
    expect(document.activeElement?.textContent).toBe("EasyPrivacy");
    await act(async () =>
      [...menu.querySelectorAll("button")].find((button) => button.textContent === "EasyPrivacy")!.click(),
    );
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(document.querySelector<HTMLInputElement>('[aria-label="Filter list name"]')?.value).toBe(
      "EasyPrivacy",
    );
    expect(document.querySelector<HTMLInputElement>('[aria-label="Filter list URL"]')?.value).toMatch(
      /^https:/,
    );
    expect(add).not.toHaveBeenCalled();
    await act(async () =>
      [...document.querySelectorAll("button")].find((button) => button.textContent === "Done")!.click(),
    );
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(add).not.toHaveBeenCalled();
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
  }
});
