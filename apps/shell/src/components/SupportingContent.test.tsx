// @vitest-environment jsdom
import { act, useRef } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { SupportingContent } from "./SupportingContent";

it("observes the mounted conversation, preserves its draft across breakpoints, and returns overlay focus", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
    fn(0);
    return 1;
  });
  let resize!: () => void,
    width = 1100;
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => width);
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
    this.querySelector<HTMLButtonElement>("button")?.focus();
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  function Fixture() {
    const ref = useRef<HTMLElement>(null);
    return (
      <section ref={ref}>
        <textarea aria-label="Draft" defaultValue="Keep this draft" />
        <SupportingContent container={ref} title="Evidence" onClose={() => {}}>
          <p>Recorded evidence</p>
        </SupportingContent>
      </section>
    );
  }
  try {
    await act(async () => root.render(<Fixture />));
    const draft = host.querySelector("textarea")!;
    expect(host.querySelector(".supporting-content")).not.toBeNull();
    const resizeHandle = host.querySelector('[role="separator"]')!;
    await act(async () =>
      resizeHandle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true })),
    );
    expect(resizeHandle.getAttribute("aria-valuenow")).toBe("336");
    await act(async () => {
      width = 800;
      resize();
    });
    expect(host.querySelector(".supporting-content")).toBeNull();
    const chip = host.querySelector<HTMLButtonElement>(".supporting-chip")!;
    await act(async () => {
      chip.focus();
      chip.click();
    });
    expect(document.querySelector("dialog[open]")?.textContent).toContain("Recorded evidence");
    await act(async () =>
      document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })),
    );
    expect(document.querySelector("dialog")).toBeNull();
    expect(document.activeElement).toBe(chip);
    expect(host.querySelector("textarea")).toBe(draft);
    expect(draft.value).toBe("Keep this draft");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
