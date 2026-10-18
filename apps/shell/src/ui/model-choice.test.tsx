// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { ModelChoice } from "./model-choice";

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
