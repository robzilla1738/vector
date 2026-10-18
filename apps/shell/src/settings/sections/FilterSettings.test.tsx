// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { bridge, type FilterListStatus } from "../../bridge";
import { FilterSettings } from "./FilterSettings";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
});
afterEach(() => vi.restoreAllMocks());

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
    await act(async () =>
      host
        .querySelector<HTMLButtonElement>("button")!
        .dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true })),
    );
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

const saved: FilterListStatus = {
  backend: "ublock_origin",
  cosmeticBackend: "native_user_styles",
  compilationWarnings: [],
  sources: [
    {
      id: "aaaaaaaaaaaa",
      name: "Research list",
      url: "https://lists.example.test/filters",
      enabled: true,
      kind: "adblock",
    },
  ],
};
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
function findButton(label: string) {
  const button = [...document.querySelectorAll("button")].find(
    (node) => node.textContent?.trim() === label || node.getAttribute("aria-label") === label,
  );
  if (!button) throw new Error(`Missing button: ${label}`);
  return button;
}

it("runs the real Update once, retains partial results and restores the action trigger", async () => {
  vi.spyOn(bridge, "filterLists").mockResolvedValue(saved);
  const result = deferred<FilterListStatus>();
  const update = vi.spyOn(bridge, "updateFilters").mockReturnValue(result.promise);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<FilterSettings active />));
    const trigger = findButton("Filter actions");
    await act(async () =>
      trigger.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }),
      ),
    );
    const menu = document.querySelector('[role="menu"]')!;
    expect(menu.getAttribute("aria-label")).toBe("Filter actions");
    const item = findButton("Update");
    expect(document.activeElement).toBe(item);
    expect(menu.textContent).not.toMatch(/Clear cache|Debug/);
    await act(async () => {
      item.click();
      item.click();
    });
    expect(update).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(findButton("Configure filters").disabled).toBe(true);
    expect(host.textContent).toContain("Applying filter changes");
    expect(document.activeElement).toBe(trigger);
    await act(async () => trigger.click());
    expect(findButton("Update").disabled).toBe(true);
    await act(async () =>
      document
        .querySelector('[role="menu"]')!
        .dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })),
    );
    const partial = {
      ...saved,
      sources: [
        {
          ...saved.sources[0]!,
          meta: {
            bytes: 100,
            sha256: "a".repeat(64),
            fetchedAt: 10,
            error: "Original source unavailable; prior copy retained",
          },
        },
      ],
    };
    await act(async () => {
      result.resolve(partial);
      await result.promise;
    });
    expect(findButton("Configure filters").disabled).toBe(false);
    expect(host.textContent).toContain("Some lists could not update");
    vi.mocked(bridge.filterLists).mockResolvedValue(partial);
    await act(async () => findButton("Configure filters").click());
    await act(async () => findButton("Research listUpdate failed").click());
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain(
      "Original source unavailable; prior copy retained",
    );
    expect(update).toHaveBeenCalledTimes(1);
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});

it("shares the pending owner with the manager and keeps failures visible without retry", async () => {
  vi.spyOn(bridge, "filterLists").mockResolvedValue(saved);
  const result = deferred<FilterListStatus>();
  const update = vi.spyOn(bridge, "updateFilters").mockReturnValue(result.promise);
  const pause = vi.spyOn(bridge, "setFilterSourceEnabled");
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<FilterSettings active />));
    await act(async () => findButton("Configure filters").click());
    await act(async () => findButton("Research listEnabled").click());
    const name = document.querySelector<HTMLInputElement>('[aria-label="Filter list name"]')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(
        name,
        "Keep this draft",
      );
      name.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const run = findButton("Update enabled lists");
    await act(async () => {
      run.click();
      run.click();
    });
    expect(update).toHaveBeenCalledTimes(1);
    expect(findButton("Done").disabled).toBe(true);
    expect(name.value).toBe("Keep this draft");
    expect(name.disabled).toBe(true);
    expect(findButton("Pause list").disabled).toBe(true);
    await act(async () => {
      findButton("Done").click();
      findButton("Pause list").click();
    });
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    expect(pause).not.toHaveBeenCalled();
    await act(async () => {
      result.reject(new Error("Native update could not finish"));
      await result.promise.catch(() => {});
    });
    expect(document.querySelector('[role="alert"]')?.textContent).toContain("Native update could not finish");
    expect(findButton("Done").disabled).toBe(false);
    expect(name.value).toBe("Keep this draft");
    expect(name.disabled).toBe(false);
    await act(async () => findButton("Done").click());
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(update).toHaveBeenCalledTimes(1);
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});

it.each(["empty", "unavailable"])(
  "disables Update for %s native state and returns menu focus",
  async (kind) => {
    vi.spyOn(bridge, "filterLists").mockResolvedValue(
      kind === "empty" ? { ...saved, sources: [] } : { ...saved, backend: "unavailable" },
    );
    const update = vi.spyOn(bridge, "updateFilters");
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    try {
      await act(async () => root.render(<FilterSettings active />));
      const trigger = findButton("Filter actions");
      await act(async () => trigger.click());
      expect(findButton("Update").disabled).toBe(true);
      await act(async () => findButton("Update").click());
      expect(update).not.toHaveBeenCalled();
      await act(async () =>
        document
          .querySelector('[role="menu"]')!
          .dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })),
      );
      expect(document.activeElement).toBe(trigger);
      await act(async () => root.render(<FilterSettings active={false} />));
      expect(trigger.disabled).toBe(true);
    } finally {
      await act(async () => root.unmount());
      host.remove();
    }
  },
);
