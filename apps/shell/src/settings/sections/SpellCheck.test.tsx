// @vitest-environment jsdom
import { act, type InputHTMLAttributes } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";

const { spellCheck } = vi.hoisted(() => {
  let enabled = true;
  return {
    spellCheck: vi.fn(async (next?: boolean) => {
      if (next !== undefined) enabled = next;
      return { enabled, managed: false };
    }),
  };
});
vi.mock("../../bridge", () => ({ bridge: { privateMode: false, spellCheck }, inMock: true, inNativeHost: false }));
vi.mock("../../ui", () => ({ Switch: (props: InputHTMLAttributes<HTMLInputElement>) => <input type="checkbox" {...props} /> }));

import { SpellCheckSetting } from "./SpellCheck";

it("reads and saves the Profile spell check preference", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  const root = createRoot(container);
  try {
    await act(async () => root.render(<SpellCheckSetting active />));
    expect(spellCheck).toHaveBeenCalledWith();
    const control = container.querySelector<HTMLInputElement>('input[aria-label="Check spelling as you type"]')!;
    expect(control.checked).toBe(true);
    await act(async () => {
      control.click();
    });
    expect(spellCheck).toHaveBeenCalledWith(false);
    expect(control.checked).toBe(false);
  } finally {
    await act(async () => root.unmount());
    vi.unstubAllGlobals();
  }
});
