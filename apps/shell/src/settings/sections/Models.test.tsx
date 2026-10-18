// @vitest-environment jsdom
import { CopilotSetupSchema } from "@aux/contracts/copilot-auth";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { collectSettingsFields } from "../search";
import { call } from "../../store";
import { ModelsSettings } from "./Models";

vi.mock("../../bridge", () => ({
  bridge: { windowId: "models-fixture", windowKind: "normal", privateMode: false },
  inNativeHost: false,
  inMock: true,
}));
vi.mock("../../commands", async () => {
  const { invokeScopedControl } = await import("../../scoped-control-commands");
  return {
    executeCommand: (command: string, context: Parameters<typeof invokeScopedControl>[1]) => {
      try {
        return Promise.resolve(invokeScopedControl(command, context));
      } catch (reason) {
        return Promise.reject(reason);
      }
    },
  };
});

const copilotSetup = CopilotSetupSchema.parse({
  registrationConfigured: false,
  runtimeInstalled: false,
  runtimeSupported: false,
  catalogOnly: true,
});
function modelRead(method: string) {
  if (method === "models.transcription.list") return { models: [], available: false, configuredModel: null };
  if (method === "models.copilot.setup") return copilotSetup;
  if (method === "models.copilot.accounts") return [];
  if (method === "settings.cloud.status") return { configured: false, revision: 0 };
  if (method === "models.list") return { models: [] };
  throw new Error(`Unexpected model producer ${method}`);
}

vi.mock("../../store", () => ({
  call: vi.fn(),
  toast: vi.fn(),
}));

it("keeps an unsaved provider key in the editor and indexes model controls", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const rects = vi
    .spyOn(HTMLElement.prototype, "getClientRects")
    .mockReturnValue([{}] as unknown as DOMRectList);
  const container = document.createElement("div");
  const root = createRoot(container);
  vi.mocked(call).mockImplementation(async (method) => modelRead(method));
  const onSave = vi.fn(async () => false);
  try {
    document.body.append(container);
    await act(async () =>
      root.render(<ModelsSettings active settings={{ modelProvider: "gateway" }} onSave={onSave} />),
    );
    const fields = collectSettingsFields(container);
    expect(fields.some((field) => field.category === "Models" && field.label === "Planner model")).toBe(true);
    expect(fields.some((field) => field.category === "Models" && field.label === "Model provider")).toBe(
      true,
    );

    const key = container.querySelector<HTMLInputElement>('input[aria-label="Provider API key"]')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(key, "test-key");
      key.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const save = [...container.querySelectorAll("button")].find(
      (button) => button.textContent === "Save key",
    )!;
    await act(async () => save.click());
    expect(onSave).toHaveBeenCalledWith({ modelCredential: { provider: "gateway", key: "test-key" } });
    expect(key.value).toBe("test-key");
    expect(container.querySelector('[role="alert"]')?.textContent).toContain("not saved");
  } finally {
    await act(async () => root.unmount());
    container.remove();
    rects.mockRestore();
    vi.unstubAllGlobals();
  }
});

it("resets one model role to Automatic without dropping another override", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const rects = vi
    .spyOn(HTMLElement.prototype, "getClientRects")
    .mockReturnValue([{}] as unknown as DOMRectList);
  const container = document.createElement("div");
  const root = createRoot(container);
  vi.mocked(call).mockImplementation(async (method) => modelRead(method));
  const onSave = vi.fn(async () => true);
  const fast = { modelId: "fixture-fast", reasoning: "low" } as const;
  const deep = [
    { modelId: "fixture-deep", reasoning: "xhigh" as const },
    { modelId: "fixture-backup", reasoning: "low" as const },
  ];
  try {
    document.body.append(container);
    await act(async () =>
      root.render(
        <ModelsSettings
          active
          settings={{
            modelProvider: "gateway",
            agentModelRoutes: { fast, deep: deep[0] },
            agentModelRouteOverrides: { fast, deep },
          }}
          onSave={onSave}
        />,
      ),
    );
    const fastField = [...container.querySelectorAll("[data-settings-field]")].find(
      (field) => field.getAttribute("data-settings-field") === "Fast model",
    )!;
    const automatic = [...fastField.querySelectorAll("button")].find(
      (button) => button.textContent === "Automatic",
    )!;
    await act(async () => automatic.click());
    expect(onSave).toHaveBeenCalledWith({ agentModelRoutes: { deep } });
  } finally {
    await act(async () => root.unmount());
    container.remove();
    rects.mockRestore();
    vi.unstubAllGlobals();
  }
});
