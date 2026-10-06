// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { NavigationButtons } from "./NavigationButtons";

it("uses shell history while Settings is open without a guest page", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const back = vi.spyOn(window.history, "back").mockImplementation(() => {});
  const forward = vi.spyOn(window.history, "forward").mockImplementation(() => {});
  const refresh = vi.fn();
  window.addEventListener("aux-settings-refresh", refresh);
  const container = document.createElement("div");
  const root = createRoot(container);
  try {
    await act(async () => root.render(<NavigationButtons settingsRoute />));
    const button = (label: string) =>
      container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
    expect(button("Back").disabled).toBe(false);
    expect(button("Forward").disabled).toBe(false);
    expect(button("Reload").disabled).toBe(false);
    await act(async () => {
      button("Back").click();
      button("Forward").click();
      button("Reload").click();
    });
    expect(back).toHaveBeenCalledOnce();
    expect(forward).toHaveBeenCalledOnce();
    expect(refresh).toHaveBeenCalledOnce();
  } finally {
    await act(async () => root.unmount());
    window.removeEventListener("aux-settings-refresh", refresh);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
