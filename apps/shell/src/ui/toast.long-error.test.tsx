// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { Toast } from "./toast";

it("retains the full long error, original actions and focus until explicit dismissal", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const dismiss = vi.fn(),
    action = vi.fn(),
    secondary = vi.fn();
  const text = `Recovery_${"A".repeat(300)} <script>plain diagnostic text</script>`;
  try {
    await act(async () =>
      root.render(
        <div className="toasts">
          <Toast
            id={7}
            text={text}
            kind="error"
            onDismiss={dismiss}
            action={{ label: "Try again", run: action, secondary: { label: "Details", run: secondary } }}
          />
        </div>,
      ),
    );
    const notice = host.querySelector('[role="alert"]')!;
    expect(notice.querySelector(".toast-text")!.textContent).toBe(text);
    expect(notice.querySelector("script")).toBeNull();
    await act(async () => vi.advanceTimersByTime(60_000));
    expect(dismiss).not.toHaveBeenCalled();
    const [retry, details, close] = Array.from(notice.querySelectorAll("button"));
    await act(async () => {
      retry!.focus();
      retry!.click();
    });
    expect(action).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(retry);
    await act(async () => {
      details!.focus();
      details!.click();
    });
    expect(secondary).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(details);
    expect(dismiss).not.toHaveBeenCalled();
    expect(close!.getAttribute("aria-label")).toBe("Dismiss notification");
    await act(async () => {
      close!.focus();
      close!.click();
    });
    expect(dismiss).toHaveBeenCalledExactlyOnceWith(7);
    expect(document.activeElement).toBe(close);
    expect(notice.querySelector(".toast-text")!.textContent).toBe(text);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  }
});

it("allows only the bounded toast text flex item to shrink and wrap without clipping copy or controls", () => {
  const css = readFileSync(resolve(process.cwd(), "apps/shell/src/ui/toast.css"), "utf8");
  const rule = css.match(/([^{}]+)\{\s*min-width:\s*0;\s*overflow-wrap:\s*anywhere;\s*\}/);
  expect(rule).not.toBeNull();
  const notice = document.createElement("div");
  notice.className = "toast";
  const text = document.createElement("span");
  text.className = "toast-text";
  const button = document.createElement("button");
  notice.append(text, button);
  expect(text.matches(rule![1]!.trim())).toBe(true);
  expect(button.matches(rule![1]!.trim())).toBe(false);
  expect(document.createElement("span").matches(rule![1]!.trim())).toBe(false);
  expect(css).toContain("max-width: min(360px, calc(100vw - 2 * var(--space-3)))");
  expect(css).not.toMatch(/text-overflow|line-clamp|overflow:\s*hidden/);
  // This is source flex-minimum/line-break evidence; native pixel layout remains pending.
});
