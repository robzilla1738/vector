// @vitest-environment jsdom
import { act, createRef } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { SettingsNav } from "./SettingsNav";

afterEach(() => {
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
});

async function mount(searching = false) {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host),
    searchInput = createRef<HTMLInputElement>();
  const firstSearchResult = createRef<HTMLButtonElement>();
  const onOpenCategory = vi.fn();
  const onQueryChange = vi.fn();
  await act(async () =>
    root.render(
      <SettingsNav
        query=""
        onQueryChange={onQueryChange}
        category="General"
        connectionTab="Models"
        searching={searching}
        memoryAvailable={false}
        downloadNamingAvailable={false}
        profilesAvailable={false}
        linkRoutingAvailable={false}
        appleScriptAvailable={false}
        pluginsAvailable={false}
        automationsAvailable={false}
        servicesAvailable={false}
        vaultAvailable={false}
        permissionsAvailable={false}
        extensionsAvailable={false}
        firstCategory={createRef<HTMLButtonElement>()}
        firstSearchResult={firstSearchResult}
        searchInput={searchInput}
        onOpenCategory={onOpenCategory}
        searchResults={
          <button className="settings-search-result" ref={firstSearchResult}>
            Search result
          </button>
        }
      />,
    ),
  );
  const rail = host.querySelector<HTMLElement>(".settings-category-list")!;
  const buttons = [...host.querySelectorAll<HTMLButtonElement>("button[data-category]")];
  for (const button of buttons) button.scrollIntoView = vi.fn();
  const key = async (target: HTMLElement, value: string, extra = {}) => {
    const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: value, ...extra });
    await act(async () => target.dispatchEvent(event));
    return event;
  };
  if (firstSearchResult.current) firstSearchResult.current.scrollIntoView = vi.fn();
  return {
    root,
    rail,
    buttons,
    key,
    input: searchInput.current!,
    result: firstSearchResult.current!,
    onOpenCategory,
    onQueryChange,
  };
}

it("follows actual horizontal/vertical rail layout after a resize without activating a category", async () => {
  const f = await mount();
  try {
    f.rail.style.flexDirection = "column";
    f.buttons[0]!.focus();
    expect((await f.key(f.buttons[0]!, "ArrowRight")).defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(f.buttons[0]);
    expect((await f.key(f.buttons[0]!, "ArrowDown")).defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(f.buttons[1]);
    f.rail.style.flexDirection = "row";
    expect((await f.key(f.buttons[1]!, "ArrowDown")).defaultPrevented).toBe(false);
    await f.key(f.buttons[1]!, "ArrowRight");
    expect(document.activeElement).toBe(f.buttons[2]);
    await f.key(f.buttons[2]!, "Home");
    expect(document.activeElement).toBe(f.buttons[0]);
    await f.key(f.buttons[0]!, "ArrowLeft");
    expect(document.activeElement).toBe(f.buttons.at(-1));
    expect(f.onOpenCategory).not.toHaveBeenCalled();
    await act(async () => f.buttons.at(-1)!.click());
    expect(f.onOpenCategory).toHaveBeenCalledTimes(1);
  } finally {
    await act(async () => f.root.unmount());
  }
});

it("preserves search editing/results focus and modified category chords in either rail layout", async () => {
  const f = await mount(true);
  try {
    for (const direction of ["row", "column"]) {
      f.rail.style.flexDirection = direction;
      f.input.focus();
      expect((await f.key(f.input, "ArrowLeft")).defaultPrevented).toBe(false);
      expect(document.activeElement).toBe(f.input);
      await f.key(f.input, "ArrowDown");
      expect(document.activeElement).toBe(f.result);
      await f.key(f.result, "ArrowUp");
      expect(document.activeElement).toBe(f.input);
      await f.key(f.input, "ArrowDown");
      await f.key(f.result, "Escape");
      expect(document.activeElement).toBe(f.input);
      expect(f.onQueryChange).toHaveBeenLastCalledWith("");
      f.buttons[0]!.focus();
      expect(
        (await f.key(f.buttons[0]!, direction === "row" ? "ArrowRight" : "ArrowDown", { metaKey: true }))
          .defaultPrevented,
      ).toBe(false);
      expect(document.activeElement).toBe(f.buttons[0]);
    }
    expect(f.onOpenCategory).not.toHaveBeenCalled();
  } finally {
    await act(async () => f.root.unmount());
  }
});
