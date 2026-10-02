// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { bridge } from "../../bridge";
import { useStore } from "../../store";
import { AgentsSettings } from "./Agents";

vi.mock("../../bridge", async importOriginal => ({ ...await importOriginal<typeof import("../../bridge")>(), inMock: true }));

it("turns off a broad grant without dropping mandatory read or retaining the wildcard", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  const root = createRoot(container);
  const original = useStore.getState();
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async method => method === "safety.originPolicies.list" ? { revision: 0, rules: [] } : method === "safety.grants.list" ? [] : { ok: true });
  vi.spyOn(bridge, "browserProfiles").mockResolvedValue([{ id: "default", name: "Personal", current: true }]);
  vi.spyOn(bridge, "focusShell").mockResolvedValue(undefined);
  const onSave = vi.fn(async () => true);
  try {
    await act(async () => root.render(<AgentsSettings active settings={{ effectGrants: ["effect:*"] }} onSave={onSave} />));
    const read = [...container.querySelectorAll("button")].find(button => button.textContent === "Read")!;
    const write = [...container.querySelectorAll("button")].find(button => button.textContent === "Write")!;
    expect(read.disabled).toBe(true);
    await act(async () => write.click());
    expect(invoke).toHaveBeenCalledWith("settings.set", { effectGrants: ["effect:read"] });
    expect(onSave).not.toHaveBeenCalled();
    expect(useStore.getState().settings.effectGrants).toEqual(["effect:read"]);
  } finally {
    await act(async () => root.unmount());
    useStore.setState(original, true);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
