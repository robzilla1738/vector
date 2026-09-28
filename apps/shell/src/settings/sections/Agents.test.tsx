// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { AgentsSettings } from "./Agents";

it("turns off a broad grant without dropping mandatory read or retaining the wildcard", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  const root = createRoot(container);
  const onSave = vi.fn(async () => true);
  try {
    await act(async () => root.render(<AgentsSettings active settings={{ effectGrants: ["effect:*"] }} onSave={onSave} />));
    const read = [...container.querySelectorAll("button")].find(button => button.textContent === "Read")!;
    const write = [...container.querySelectorAll("button")].find(button => button.textContent === "Write")!;
    expect(read.disabled).toBe(true);
    await act(async () => write.click());
    expect(onSave).toHaveBeenCalledWith({ effectGrants: ["effect:read"] });
  } finally {
    await act(async () => root.unmount());
    vi.unstubAllGlobals();
  }
});
