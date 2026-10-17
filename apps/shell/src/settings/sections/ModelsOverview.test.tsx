// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ModelsOverview } from "./ModelsOverview";
const rpc = vi.hoisted(() => vi.fn());
vi.mock("../../bridge", () => ({
  bridge: { windowId: "models-review", windowKind: "normal", privateMode: false },
  inMock: true,
  inNativeHost: false,
}));
vi.mock("../../store", () => ({ call: rpc, toast: vi.fn(), errToast: vi.fn() }));
vi.mock("./Models", () => ({
  ModelsSettings: () => (
    <section data-settings-section="Models">
      <div tabIndex={-1} data-setting="Model provider">
        Provider editor
      </div>
    </section>
  ),
}));
vi.mock("../../commands", async () => {
  const { invokeScopedControl } = await import("../../scoped-control-commands");
  return {
    executeCommand: (command: string, context: Parameters<typeof invokeScopedControl>[1]) =>
      Promise.resolve(invokeScopedControl(command, context)),
  };
});
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  rpc.mockResolvedValue({
    models: [{ id: "local-review", name: "Local review", textGeneration: true }],
    source: "configured",
  });
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const settings = {
  modelProvider: "openai-compatible",
  plannerModel: "current-model",
  modelConnections: [
    {
      provider: "openai-compatible",
      selected: true,
      enabled: true,
      credentialSource: "none",
      credentialUnavailable: false,
      localEndpoint: true,
    },
  ],
};
it("saves a selected task model and keeps detailed setup behind its dialog", async () => {
  const save = vi.fn().mockResolvedValue(true);
  await act(async () => root.render(<ModelsOverview active settings={settings} onSave={save} />));
  expect(document.body.textContent).not.toContain("Provider editor");
  const fast = host.querySelector<HTMLButtonElement>('[aria-label="Fast selection"]')!;
  await act(async () => fast.click());
  const model = [...document.querySelectorAll<HTMLButtonElement>("dialog button")].find(
    (node) => node.textContent === "Local review",
  )!;
  await act(async () => model.click());
  expect(save).toHaveBeenCalledWith({
    agentModelRoutes: { fast: { modelId: "local-review", reasoning: "low" } },
  });
  const connect = [...host.querySelectorAll<HTMLButtonElement>("button")].find(
    (node) => node.textContent === "Connect",
  )!;
  await act(async () => connect.click());
  const provider = [...document.querySelectorAll<HTMLButtonElement>("dialog button")].find(
    (node) => node.textContent === "OpenAI-compatible",
  )!;
  await act(async () => provider.click());
  expect(document.querySelector('dialog[aria-label="Model settings"]')?.textContent).toContain(
    "Provider editor",
  );
  await act(async () =>
    document
      .querySelector('dialog[aria-label="Model settings"]')!
      .dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })),
  );
  expect(document.body.textContent).not.toContain("Provider editor");
});
it("opens and focuses detailed settings reached through search", async () => {
  const handled = vi.fn();
  await act(async () =>
    root.render(
      <ModelsOverview
        active
        settings={settings}
        onSave={vi.fn()}
        destination={{
          category: "Models",
          target: "Model provider",
          label: "Model provider",
          description: "Provider settings",
        }}
        onDestinationHandled={handled}
      />,
    ),
  );
  expect(document.activeElement?.getAttribute("data-setting")).toBe("Model provider");
  expect(handled).toHaveBeenCalled();
});

it("updates one role's reasoning without replacing other routes and can restore automatic routing", async () => {
  const save = vi.fn().mockResolvedValue(true);
  const current = {
    ...settings,
    agentModelRoutes: {
      fast: { modelId: "local-review", reasoning: "medium" },
      deep: { modelId: "deep-review", reasoning: "high" },
    },
    agentModelRouteOverrides: {
      fast: { modelId: "local-review", reasoning: "medium" },
      deep: { modelId: "deep-review", reasoning: "high" },
    },
  };
  await act(async () => root.render(<ModelsOverview active settings={current} onSave={save} />));
  const openOptions = () => host.querySelector<HTMLButtonElement>('[aria-label="Fast options"]')!.click();
  await act(async () => openOptions());
  const action = (label: string) =>
    [...document.querySelectorAll<HTMLButtonElement>("dialog button")].find(
      (node) => node.textContent === label,
    )!;
  await act(async () => action("High reasoning").click());
  expect(save).toHaveBeenLastCalledWith({
    agentModelRoutes: {
      fast: { modelId: "local-review", reasoning: "high" },
      deep: current.agentModelRouteOverrides.deep,
    },
  });
  await act(async () => openOptions());
  await act(async () => action("Use automatic route").click());
  expect(save).toHaveBeenLastCalledWith({
    agentModelRoutes: { deep: current.agentModelRouteOverrides.deep },
  });
});

it("searches image models and retains the picker on a rejected save", async () => {
  const save = vi.fn().mockResolvedValue(false);
  await act(async () => root.render(<ModelsOverview active settings={settings} onSave={save} />));
  await act(async () =>
    host.querySelector<HTMLButtonElement>('[aria-label="Image-generation model selection"]')!.click(),
  );
  const input = document.querySelector<HTMLInputElement>(
    '[aria-label="Search models for image-generation model"]',
  )!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "GPT");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  const image = [...document.querySelectorAll<HTMLButtonElement>("dialog button")].find(
    (node) => node.textContent === "GPT Image 2",
  )!;
  await act(async () => image.click());
  expect(save).toHaveBeenLastCalledWith({ imageModel: "openai/gpt-image-2" });
  expect(document.querySelector('[aria-label="Search models for image-generation model"]')).not.toBeNull();
  save.mockResolvedValue(true);
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "Off");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  const off = [...document.querySelectorAll<HTMLButtonElement>("dialog button")].find(
    (node) => node.textContent === "Off",
  )!;
  await act(async () => off.click());
  expect(save).toHaveBeenLastCalledWith({ imageModel: null });
  expect(document.querySelector('[aria-label="Search models for image-generation model"]')).toBeNull();
});
