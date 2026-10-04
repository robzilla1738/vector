// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { Popover } from "./popover";

it("keeps the original trigger unavailable, restores enabled interaction, and closes on disable", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const content = (disabled: boolean) => (
    <Popover label="Choose context" trigger={<span>Additional tabs</span>} disabled={disabled}>
      {() => <input aria-label="Find tabs" />}
    </Popover>
  );
  try {
    await act(async () => root.render(content(true)));
    const trigger = host.querySelector<HTMLButtonElement>("button")!;
    await act(async () => trigger.click());
    expect(trigger.disabled).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.querySelector("dialog")).toBeNull();
    await act(async () => root.render(content(false)));
    expect(host.querySelector("button")).toBe(trigger);
    trigger.focus();
    await act(async () => trigger.click());
    const panel = document.querySelector<HTMLDialogElement>("dialog")!;
    expect(document.activeElement).toBe(panel.querySelector("input"));
    const css = readFileSync(resolve(process.cwd(), "apps/shell/src/ui/popover.css"), "utf8");
    const selector = css
      .match(/([^{}]+)\{\s*background: var\(--bg-hover\);\s*color: var\(--ink-0\);\s*\}/)![1]!
      .trim();
    expect(trigger.matches(selector)).toBe(true);
    // Selector matching proves disabled expanded controls cannot receive this rule.
    // It does not simulate hover paint or qualify native appearance.
    trigger.disabled = true;
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.matches(selector)).toBe(false);
    trigger.disabled = false;
    await act(async () => root.render(content(true)));
    expect(host.querySelector("button")).toBe(trigger);
    expect(trigger.disabled).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.querySelector("dialog")).toBeNull();
    expect(document.activeElement).not.toBe(trigger);
    await act(async () => root.render(content(false)));
    trigger.focus();
    await act(async () => trigger.click());
    await act(async () =>
      document
        .querySelector("dialog")!
        .dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })),
    );
    expect(document.querySelector("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
});
