// @vitest-environment jsdom
import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { lazySection } from "./LazySettingsSection";

it("loads only on first visit and preserves an edited form through hidden visits", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const load = vi.fn(async () => Form);
  function Form({ active }: { active: boolean }) {
    const [draft, setDraft] = useState("Original");
    return (
      <section hidden={!active}>
        <input aria-label="Draft" value={draft} onChange={(event) => setDraft(event.target.value)} />
      </section>
    );
  }
  const Section = lazySection(load);
  try {
    await act(async () => root.render(<Section active={false} />));
    expect(load).not.toHaveBeenCalled();
    await act(async () => root.render(<Section active />));
    const field = host.querySelector("input")!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(field, "Unsaved");
      field.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => root.render(<Section active={false} />));
    expect(host.querySelector("section")!.hidden).toBe(true);
    await act(async () => root.render(<Section active />));
    expect(host.querySelector("input")).toBe(field);
    expect(field.value).toBe("Unsaved");
    expect(load).toHaveBeenCalledOnce();
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
});
