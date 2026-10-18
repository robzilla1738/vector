// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { ModelChoice } from "./model-choice";

async function mountChoice(pending = false, width = 853) {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("innerWidth", width);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    return this.matches(".settings-content") ? new DOMRect(280, 0, width - 280, 700) : new DOMRect();
  });
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  const host = document.createElement("div");
  host.className = "settings-content";
  document.body.append(host);
  const root = createRoot(host);
  const changed = vi.fn(async () => true);
  await act(async () =>
    root.render(
      <ModelChoice
        label="Fast"
        hint="Actual model setting"
        value="anthropic/first"
        options={[{ id: "anthropic/first", name: "First model", provider: "Anthropic" }]}
        disabled={false}
        pending={pending}
        loading={false}
        onChange={changed}
      />,
    ),
  );
  const trigger = host.querySelector<HTMLButtonElement>('[aria-label="Fast selection"]')!;
  const open = async () => {
    await act(async () => trigger.click());
    const dialog = document.querySelector<HTMLDialogElement>('dialog[aria-label="Fast selection"]')!;
    return {
      dialog,
      provider: dialog.querySelector<HTMLButtonElement>("[data-model-root]")!,
      search: dialog.querySelector<HTMLInputElement>("input")!,
    };
  };
  return {
    open,
    trigger,
    changed,
    dispose: async () => {
      await act(async () => root.unmount());
      host.remove();
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    },
  };
}

it("keeps composing and modified search arrows in the input while ordinary arrows enter models", async () => {
  const f = await mountChoice();
  try {
    const { dialog, search, provider } = await f.open();
    for (const state of [
      { isComposing: true },
      { keyCode: 229 },
      { altKey: true },
      { ctrlKey: true },
      { metaKey: true },
      { shiftKey: true },
    ]) {
      for (const key of "isComposing" in state || "keyCode" in state
        ? ["ArrowDown", "Escape"]
        : ["ArrowDown"]) {
        const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...state });
        await act(async () => search.dispatchEvent(event));
        expect(dialog.isConnected).toBe(true);
        expect(document.activeElement).toBe(search);
        expect(event.defaultPrevented).toBe(false);
      }
    }
    await act(async () =>
      search.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })),
    );
    expect(document.activeElement).toBe(provider);
    expect(f.changed).not.toHaveBeenCalled();
  } finally {
    await f.dispose();
  }
});

it.each([853, 1280])("keeps pending provider choices escapable at window width %i", async (width) => {
  const f = await mountChoice(true, width);
  try {
    const { dialog, provider } = await f.open();
    await act(async () => {
      provider.focus();
      provider.click();
    });
    const panel = dialog.querySelector<HTMLElement>(".composer-model-submenu")!;
    const back = panel.querySelector<HTMLButtonElement>('[aria-label="Back to model providers"]');
    expect(document.activeElement).toBe(back ?? panel);
    expect(panel.querySelector<HTMLButtonElement>('[role="menuitemradio"]')!.disabled).toBe(true);
    await act(async () =>
      document.activeElement!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
      ),
    );
    expect(dialog.isConnected).toBe(true);
    expect(dialog.querySelector(".composer-model-submenu")).toBeNull();
    expect(document.activeElement).toBe(provider);
    expect(f.changed).not.toHaveBeenCalled();
  } finally {
    await f.dispose();
  }
});

it("reopens at model search after the owning dialog is canceled from a nested provider", async () => {
  const f = await mountChoice();
  try {
    const first = await f.open();
    await act(async () => first.provider.click());
    expect(first.dialog.querySelector(".composer-model-submenu")).not.toBeNull();
    await act(async () => first.dialog.dispatchEvent(new Event("cancel", { cancelable: true })));
    expect(first.dialog.isConnected).toBe(false);
    expect(document.activeElement).toBe(f.trigger);
    const second = await f.open();
    expect(second.dialog.querySelector(".composer-model-submenu")).toBeNull();
    expect(second.provider.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(second.search);
    expect(f.changed).not.toHaveBeenCalled();
  } finally {
    await f.dispose();
  }
});

it("does not let a completed save from a canceled opening close a newer model picker", async () => {
  const f = await mountChoice();
  try {
    let finish!: (saved: boolean) => void;
    f.changed.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const first = await f.open();
    await act(async () => first.provider.click());
    await act(async () => first.dialog.querySelector<HTMLButtonElement>('[role="menuitemradio"]')!.click());
    expect(f.changed).toHaveBeenCalledWith("anthropic/first");
    await act(async () => first.dialog.dispatchEvent(new Event("cancel", { cancelable: true })));
    const second = await f.open();
    await act(async () => finish(true));
    expect(second.dialog.isConnected).toBe(true);
    expect(document.activeElement).toBe(second.search);
    expect(f.changed).toHaveBeenCalledTimes(1);
  } finally {
    await f.dispose();
  }
});

it("uses its real Settings trigger/region and original save callback through nested Back and model selection", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("innerWidth", 853);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    return this.matches(".settings-content") ? new DOMRect(280, 0, 573, 700) : new DOMRect();
  });
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  const host = document.createElement("div");
  host.className = "settings-content";
  document.body.append(host);
  const root = createRoot(host);
  const changed = vi.fn(async () => false);
  try {
    await act(async () =>
      root.render(
        <ModelChoice
          label="Fast"
          hint="Actual model setting"
          value="anthropic/first"
          options={[
            { id: "anthropic/first", name: "First model", provider: "Anthropic" },
            { id: "anthropic/second", name: "Second model", provider: "Anthropic" },
          ]}
          disabled={false}
          loading={false}
          onChange={changed}
        />,
      ),
    );
    const trigger = host.querySelector<HTMLButtonElement>('[aria-label="Fast selection"]')!;
    await act(async () => trigger.click());
    const dialog = document.querySelector<HTMLDialogElement>('dialog[aria-label="Fast selection"]')!;
    const provider = dialog.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]')!;
    await act(async () => provider.click());
    let submenu = dialog.querySelector<HTMLElement>(".composer-model-submenu")!;
    expect(submenu.parentElement?.classList.contains("model-choice-picker")).toBe(true);
    expect(dialog.querySelector<HTMLElement>(".settings-model-search")!.hidden).toBe(true);
    await act(async () =>
      submenu.querySelector<HTMLButtonElement>('[aria-label="Back to model providers"]')!.click(),
    );
    expect(document.activeElement).toBe(provider);
    expect(dialog.querySelector<HTMLElement>(".settings-model-search")!.hidden).toBe(false);
    await act(async () => provider.click());
    submenu = dialog.querySelector<HTMLElement>(".composer-model-submenu")!;
    const model = [...submenu.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')].find(
      (row) => row.textContent === "Second model",
    )!;
    await act(async () => model.click());
    expect(changed).toHaveBeenLastCalledWith("anthropic/second");
    expect(dialog.isConnected).toBe(true);
    expect(dialog.contains(model)).toBe(true);
    changed.mockResolvedValue(true);
    await act(async () => model.click());
    expect(changed).toHaveBeenCalledTimes(2);
    expect(dialog.isConnected).toBe(false);
    expect(document.activeElement).toBe(trigger);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
