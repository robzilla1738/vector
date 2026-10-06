// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { Toast } from "./toast";

it("pauses an info toast while focused and keeps errors until dismissed", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const dismiss = vi.fn();
  try {
    await act(async () => root.render(<Toast id={1} text="Saved" kind="info" onDismiss={dismiss} />));
    await act(async () => vi.advanceTimersByTimeAsync(1500));
    const button = host.querySelector("button")!;
    await act(async () => button.focus());
    await act(async () => vi.advanceTimersByTimeAsync(4000));
    expect(dismiss).not.toHaveBeenCalled();
    await act(async () => button.blur());
    await act(async () => vi.advanceTimersByTimeAsync(3000));
    expect(dismiss).toHaveBeenCalledExactlyOnceWith(1);
    dismiss.mockClear();
    await act(async () => root.render(<Toast id={2} text="Failed" kind="error" onDismiss={dismiss} />));
    await act(async () => vi.advanceTimersByTimeAsync(10_000));
    expect(dismiss).not.toHaveBeenCalled();
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("Failed");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  }
});
