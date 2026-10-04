// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const { languagePreferences } = vi.hoisted(() => {
  let selected = ["en-US", "en"];
  return {
    languagePreferences: vi.fn(async (next?: string[]) => {
      selected = next ?? selected;
      return { selected, effective: selected, forced: [], managed: false };
    }),
  };
});
vi.mock("../../bridge", async (original) => ({
  ...(await original<typeof import("../../bridge")>()),
  bridge: {
    ...(await original<typeof import("../../bridge")>()).bridge,
    privateMode: false,
    windowId: "original",
    windowKind: "normal",
    languagePreferences,
  },
  inMock: true,
  inNativeHost: false,
}));
import { LanguagesSetting } from "./Languages";

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 10, height: 10 } as DOMRect,
  ] as unknown as DOMRectList);
});
afterEach(() => vi.restoreAllMocks());

it("adds, reorders and removes selected site languages", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => root.render(<LanguagesSetting active />));
    expect(languagePreferences).toHaveBeenCalledWith();
    const input = container.querySelector<HTMLInputElement>('[aria-label="Language code"]')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "es-ES");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => {
      container
        .querySelector<HTMLFormElement>("form")!
        .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    expect(languagePreferences).toHaveBeenCalledWith(["en-US", "en", "es-ES"]);
    await act(async () => {
      container.querySelector<HTMLButtonElement>('[aria-label="Move es-ES up"]')!.click();
    });
    expect(languagePreferences).toHaveBeenCalledWith(["en-US", "es-ES", "en"]);
    await act(async () => {
      container.querySelector<HTMLButtonElement>('[aria-label="Remove en"]')!.click();
    });
    expect(languagePreferences).toHaveBeenCalledWith(["en-US", "es-ES"]);
  } finally {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  }
});
