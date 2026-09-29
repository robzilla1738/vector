// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { Tooltip } from "./tooltip";

it("describes a focused trigger, closes on Escape, and leaves focus in place", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<Tooltip content="Export conversation as Markdown">{id =>
      <button aria-label="Export" aria-describedby={id}>Export</button>}
    </Tooltip>));
    const button = host.querySelector("button")!;
    await act(async () => button.focus());
    const tip = document.querySelector<HTMLElement>('[role="tooltip"]')!;
    expect(tip.textContent).toBe("Export conversation as Markdown");
    expect(button.getAttribute("aria-describedby")).toBe(tip.id);
    await act(async () => button.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    expect(document.activeElement).toBe(button);
    await act(async () => button.dispatchEvent(new Event("pointerover", { bubbles: true })));
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    await act(async () => button.dispatchEvent(new Event("pointerout", { bubbles: true })));
    await act(async () => button.blur());
    await act(async () => button.focus());
    expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
  } finally { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); }
});
