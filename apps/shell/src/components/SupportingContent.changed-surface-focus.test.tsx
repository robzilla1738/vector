// @vitest-environment jsdom
import { act, useRef } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { SupportingContent } from "./SupportingContent";

it("owns narrow preview focus while its viewer loads and preserves a newer external focus owner", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => { fn(0); return 1; });
  const width = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(800);
  const host = document.createElement("div"), opener = document.createElement("button");
  opener.textContent = "Preview"; document.body.append(opener, host); opener.focus();
  const root = createRoot(host);
  function Parent({ loaded }: { loaded: boolean }) {
    const container = useRef<HTMLElement>(null);
    return <section ref={container}><textarea defaultValue="Retained question" />
      <SupportingContent container={container} title="Image preview" viewer initiallyExpanded onClose={() => {}}>
        {loaded ? <div><button>Fit</button></div> : <section><button>Close loading preview</button><p>Loading image…</p></section>}
      </SupportingContent></section>;
  }
  try {
    await act(async () => root.render(<Parent loaded={false} />));
    const panel = document.querySelector<HTMLDialogElement>('dialog[aria-label="Image preview"]')!;
    expect(document.activeElement?.textContent).toBe("Close loading preview");
    const draft = host.querySelector("textarea")!;
    await act(async () => root.render(<Parent loaded />));
    expect(document.activeElement?.textContent).toBe("Fit"); expect(panel.open).toBe(true); expect(host.querySelector("textarea")).toBe(draft);
    expect(draft.value).toBe("Retained question");
    const newer = document.createElement("input"); document.body.append(newer); newer.focus();
    await act(async () => root.unmount()); expect(document.activeElement).toBe(newer); newer.remove();
  } finally { await act(async () => root.unmount()); host.remove(); opener.remove(); width.mockRestore(); vi.unstubAllGlobals(); }
});
