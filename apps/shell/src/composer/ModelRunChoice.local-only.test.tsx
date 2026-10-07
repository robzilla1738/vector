// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { MethodSchemas } from "@aux/contracts";
import { ModelRunChoice } from "./ModelRunChoice";
const rpc = vi.hoisted(() => vi.fn());
const state = vi.hoisted(() => ({ settings: { localModelsOnly: false } }));
vi.mock("../bridge", () => ({ bridge: { windowId: "original", windowKind: "main", privateMode: false } }));
vi.mock("../store", () => ({
  call: rpc,
  useStore: Object.assign((select: (value: typeof state) => unknown) => select(state), { getState: () => state }),
}));
it("shows Local only from actual Settings without catalog requests and accepts only a typed mode change", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  const root = createRoot(host);
  const render = () => act(() => root.render(<ModelRunChoice value={{}} disabled={false} onChange={vi.fn()} />));
  try {
    expect(MethodSchemas["settings.set"].parse({ localModelsOnly: true })).toEqual({ localModelsOnly: true });
    expect(MethodSchemas["settings.set"].safeParse({ localModelsOnly: "true" }).success).toBe(false);
    await render();
    expect(host.textContent).not.toContain("Local only");
    state.settings.localModelsOnly = true;
    await render();
    expect(host.querySelector('[aria-label="Local models only"]')?.textContent).toBe("Local only");
    state.settings.localModelsOnly = false;
    await render();
    expect(host.textContent).not.toContain("Local only");
    expect(rpc).not.toHaveBeenCalled();
  } finally {
    act(() => root.unmount());
    state.settings.localModelsOnly = false;
    vi.unstubAllGlobals();
  }
});
