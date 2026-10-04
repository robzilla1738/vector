// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { Library } from "./Library";
import { bridge } from "../bridge";
import { useStore } from "../store";
vi.mock("../use-feature", async (original) => ({
  ...(await original<typeof import("../use-feature")>()),
  useFeature: () => true,
}));
it("preserves complete failed history diagnostics, focused Retry and original successful recovery", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  const initial = useStore.getState(),
    reason = new Error("https://library.fixture.invalid/" + "diagnostic".repeat(90));
  let attempts = 0;
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "history.list") {
      if (++attempts === 1) throw reason;
      return [] as never;
    }
    return [] as never;
  });
  const host = document.createElement("div"),
    style = document.createElement("style");
  document.body.append(host);
  document.head.append(style);
  const root = createRoot(host);
  const rule = readFileSync("apps/shell/src/components/Library.css", "utf8").match(
    /\.library-message\s*\{[^}]+\}/,
  )?.[0];
  expect(rule).toBeTruthy();
  style.textContent = rule!;
  try {
    await act(async () => root.render(<Library initialView="history" />));
    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });
    const alert = host.querySelector<HTMLElement>('[role="alert"].library-message')!,
      retry = alert.querySelector("button")!;
    expect(alert.firstChild!.textContent).toBe(String(reason));
    expect(alert.textContent).toContain("Retry");
    expect(getComputedStyle(alert).overflowWrap).toBe("anywhere");
    expect(getComputedStyle(alert).minWidth).toBe("0");
    expect(alert.querySelector("script")).toBeNull();
    expect(retry.disabled).toBe(false);
    retry.focus();
    expect(document.activeElement).toBe(retry);
    await act(async () => retry.click());
    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });
    expect(attempts).toBe(2);
    expect(host.querySelector('[role="alert"].library-message')).toBeNull();
    expect(host.textContent).toContain("Pages you visit will appear here.");
    const unrelated = document.createElement("p");
    host.append(unrelated);
    expect(getComputedStyle(unrelated).overflowWrap).not.toBe("anywhere");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    style.remove();
    invoke.mockRestore();
    useStore.setState(initial, true);
    vi.useRealTimers();
    vi.unstubAllGlobals();
  }
});
