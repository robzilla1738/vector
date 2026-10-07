// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { RunOptions } from "./RunOptions";
let host: HTMLDivElement, root: Root;
const initial = useStore.getState();
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  useStore.setState({ composerPreferences: {} });
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function mount(key = "new", locked = false, privateTask = false) {
  return act(async () =>
    root.render(
      <RunOptions draftKey={key} privateTask={privateTask} privateTaskLocked={locked} disabled={false} />,
    ),
  );
}
function select(label: string, value: string) {
  const element = host.querySelector<HTMLSelectElement>(`select[aria-label="${label}"]`)!;
  act(() => {
    element.value = value;
    element.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
it("loads only the actual catalog on demand and preserves Auto as absence", async () => {
  const rpc = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "packages.list") return { packages: [], defaults: [] } as never;
    if (method === "workspaces.folders.list") return [] as never;
    return { models: [{ id: "fixture/exact", name: "Fixture model" }], source: "configured" } as never;
  });
  await mount();
  expect(rpc).not.toHaveBeenCalledWith("models.list");
  await act(async () =>
    host.querySelector<HTMLSelectElement>('select[aria-label="Composer model"]')!.focus(),
  );
  expect(rpc).toHaveBeenCalledWith("models.list");
  expect(host.textContent).toContain("Fixture model");
  select("Composer model", "fixture/exact");
  select("Thinking level", "high");
  expect(useStore.getState().composerPreferences.new).toEqual({
    privateTask: false,
    modelId: "fixture/exact",
    reasoning: "high",
  });
  select("Composer model", "");
  select("Thinking level", "");
  expect(useStore.getState().composerPreferences.new?.modelId).toBeUndefined();
  expect(useStore.getState().composerPreferences.new?.reasoning).toBeUndefined();
  let refresh!: (value: unknown) => void;
  rpc.mockImplementation(
    () =>
      new Promise((resolve) => {
        refresh = resolve;
      }),
  );
  await act(async () =>
    useStore.setState({ settings: { ...useStore.getState().settings, modelProvider: "changed-fixture" } }),
  );
  expect(host.querySelector('option[value="fixture/exact"]')).toBeNull();
  await act(async () =>
    refresh({ models: [{ id: "fixture/new", name: "Current model" }], source: "configured" }),
  );
  expect(host.querySelector('option[value="fixture/new"]')).not.toBeNull();
});
it("captures a newchat private choice while existingchat mode stays immutable", async () => {
  await mount();
  const toggle = host.querySelector<HTMLInputElement>('input[aria-label="Private task"]')!;
  expect(toggle.checked).toBe(false);
  await act(async () => toggle.click());
  expect(useStore.getState().composerPreferences.new?.privateTask).toBe(true);
  await mount("chat:existing", true, true);
  const saved = host.querySelector<HTMLInputElement>('input[aria-label="Private task"]')!;
  expect(saved.checked).toBe(true);
  expect(saved.disabled).toBe(true);
  await mount();
  expect(useStore.getState().composerPreferences.new?.privateTask).toBe(true);
});
