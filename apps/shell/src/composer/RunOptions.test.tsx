// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { ComposerModelControls } from "./ComposerModelControls";
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
      <>
        <ComposerModelControls draftKey={key} disabled={false} />
        <RunOptions draftKey={key} privateTask={privateTask} privateTaskLocked={locked} disabled={false} />
      </>,
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
const modelMenu = () => document.querySelector<HTMLDialogElement>('[aria-label="Choose a model"]')!;
const modelOption = (value: string) =>
  [...modelMenu().querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')].find(
    (button) => button.value === value,
  );
async function openModels() {
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Composer model"]')!.click());
}
async function chooseModel(value: string) {
  if (!modelMenu()) await openModels();
  await act(async () => modelOption(value)!.click());
}
it("loads only the actual catalog on demand and preserves Auto as absence", async () => {
  const rpc = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "packages.list") return { packages: [], defaults: [] } as never;
    if (method === "workspaces.folders.list") return [] as never;
    return { models: [{ id: "fixture/exact", name: "Fixture model" }], source: "configured" } as never;
  });
  await mount();
  expect(rpc).not.toHaveBeenCalledWith("models.list");
  await openModels();
  expect(rpc).toHaveBeenCalledWith("models.list");
  expect(modelMenu().textContent).toContain("Fixture model");
  await chooseModel("fixture/exact");
  select("Thinking level", "high");
  expect(useStore.getState().composerPreferences.new).toEqual({
    privateTask: false,
    modelId: "fixture/exact",
    reasoning: "high",
  });
  await chooseModel("");
  select("Thinking level", "");
  expect(useStore.getState().composerPreferences.new?.modelId).toBeUndefined();
  expect(useStore.getState().composerPreferences.new?.reasoning).toBeUndefined();
  await openModels();
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
  expect(modelOption("fixture/exact")).toBeUndefined();
  expect(modelMenu().textContent).toContain("Loading models");
  await act(async () =>
    refresh({ models: [{ id: "fixture/new", name: "Current model" }], source: "configured" }),
  );
  expect(modelOption("fixture/new")).toBeDefined();
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

it("offers conversational capabilities while preserving an unsupported saved selection with an honest warning", async () => {
  vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "packages.list") return { packages: [], defaults: [] } as never;
    if (method === "workspaces.folders.list") return [] as never;
    return {
      models: [
        { id: "provider/chat", name: "Chat", modalities: ["text", "image"], streaming: true },
        { id: "provider/new-local", name: "New local" },
        { id: "provider/non-language", name: "Non-language", modalities: ["text"], streaming: false },
        { id: "provider/image", name: "Image output", modalities: ["image"], streaming: true },
        { id: "provider/audio", name: "Audio output", modalities: ["audio"], streaming: true },
      ],
    } as never;
  });
  useStore.setState({
    composerPreferences: { new: { privateTask: false, modelId: "provider/non-language" } },
  });
  await mount();
  await openModels();
  expect(
    [...modelMenu().querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')].map(
      (option) => option.value,
    ),
  ).toEqual(["", "provider/non-language", "provider/chat", "provider/new-local"]);
  expect(modelOption("provider/non-language")?.getAttribute("aria-checked")).toBe("true");
  expect(host.querySelector('[role="alert"]')?.textContent).toContain("not supported for chat");
  expect(modelOption("provider/non-language")?.disabled).toBe(true);
  await chooseModel("provider/chat");
  expect(useStore.getState().composerPreferences.new?.modelId).toBe("provider/chat");
  expect(host.querySelector('[role="alert"]')).toBeNull();
});

it("searches model names, IDs and providers and moves keyboard focus through the filtered choices", async () => {
  vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "packages.list") return { packages: [], defaults: [] } as never;
    return {
      models: [
        { id: "alpha/standard", name: "Standard", provider: "Alpha", reasoning: "supported" },
        { id: "beta/fast", name: "Fast", provider: "Beta", reasoning: "none" },
      ],
    } as never;
  });
  useStore.setState({ composerPreferences: { new: { privateTask: false, reasoning: "high" } } });
  await mount();
  await openModels();
  const search = modelMenu().querySelector<HTMLInputElement>('[aria-label="Search models"]')!;
  expect(document.activeElement).toBe(search);
  const searchFor = async (value: string) =>
    act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(search, value);
      search.dispatchEvent(new Event("input", { bubbles: true }));
    });
  await searchFor("Beta");
  expect(modelOption("alpha/standard")).toBeUndefined();
  expect(modelOption("beta/fast")).toBeDefined();
  await searchFor("missing");
  expect(modelMenu().textContent).toContain("No matching models");
  await searchFor("beta/fast");
  await act(async () =>
    search.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })),
  );
  expect(document.activeElement).toBe(modelOption("beta/fast"));
  await act(async () => (document.activeElement as HTMLButtonElement).click());
  expect(modelMenu()).toBeNull();
  expect(useStore.getState().composerPreferences.new).toMatchObject({
    modelId: "beta/fast",
    reasoning: undefined,
  });
  expect(host.querySelector<HTMLSelectElement>('[aria-label="Thinking level"]')!.disabled).toBe(true);
});

it("keeps an unknown current selection through retry and rejects a catalog response from the previous provider generation", async () => {
  const completions: ((value: unknown) => void)[] = [];
  let attempts = 0;
  vi.spyOn(bridge, "invoke").mockImplementation((method) => {
    if (method === "packages.list") return Promise.resolve({ packages: [], defaults: [] }) as never;
    if (++attempts === 1) return Promise.reject(new Error("Provider unavailable"));
    return new Promise((resolve) => completions.push(resolve)) as never;
  });
  useStore.setState({ composerPreferences: { new: { privateTask: false, modelId: "custom/current" } } });
  await mount();
  await openModels();
  expect(modelMenu().textContent).toContain("Provider unavailable");
  expect(modelOption("custom/current")?.getAttribute("aria-checked")).toBe("true");
  await act(async () => modelMenu().querySelector<HTMLButtonElement>('[role="menuitem"]')!.click());
  expect(modelMenu().textContent).toContain("Loading models");
  await act(async () =>
    useStore.setState({ settings: { ...useStore.getState().settings, modelProvider: "replacement" } }),
  );
  await act(async () => completions[0]!({ models: [{ id: "stale/model", name: "Stale model" }] }));
  expect(modelOption("stale/model")).toBeUndefined();
  expect(modelMenu().textContent).toContain("Loading models");
  await act(async () => completions[1]!({ models: [{ id: "replacement/model", name: "Current model" }] }));
  expect(modelOption("replacement/model")).toBeDefined();
  expect(modelOption("custom/current")?.disabled).toBe(true);
  expect(useStore.getState().composerPreferences.new?.modelId).toBe("custom/current");
  await chooseModel("replacement/model");
  expect(useStore.getState().composerPreferences.new?.modelId).toBe("replacement/model");
});
