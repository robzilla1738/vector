// @vitest-environment jsdom
import { CopilotSetupSchema } from "@aux/contracts/copilot-auth";
import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ModelProviderSchema, IMAGE_MODELS } from "@aux/contracts";
import { ModelsSettings } from "./Models";
import { collectSettingsFields } from "../search";

const call = vi.hoisted(() => vi.fn());
const toast = vi.hoisted(() => vi.fn());
const errToast = vi.hoisted(() => vi.fn());

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
  if (method === "models.copilot.setup") return copilotSetup;
  if (method === "models.copilot.accounts") return [];
  if (method === "settings.cloud.status") return { configured: false, revision: 0 };
  if (method === "models.list") return { models: [] };
  throw new Error(`Unexpected model producer ${method}`);
}

vi.mock("../../store", () => ({ call, toast, errToast }));
let root: ReturnType<typeof createRoot>, host: HTMLDivElement;
const save = vi.fn();
const status = ModelProviderSchema.options.map((provider) => ({
  provider,
  selected: provider === "gateway",
  enabled: true,
  credentialSource: provider === "gateway" ? "saved" : "none",
  credentialUnavailable: false,
  localEndpoint: false,
}));
function Fixture({ patch = {} }: { patch?: Record<string, unknown> }) {
  const [settings, setSettings] = useState<Record<string, unknown>>({
    modelProvider: "gateway",
    modelConnections: status,
    gatewayApiKey: "••••••••",
    modelApiKey: "••••••••",
    modelCredentialSource: "saved",
    imageModel: null,
    ...patch,
  });
  return (
    <ModelsSettings
      active
      settings={settings}
      onSave={async (change) => {
        const ok = await save(change);
        if (!ok) return false;
        setSettings((current) => ({
          ...current,
          ...change,
          ...(change.modelConnection
            ? {
                modelConnections: (current.modelConnections as typeof status).map((item) =>
                  item.provider === (change.modelConnection as { provider: string }).provider
                    ? { ...item, enabled: (change.modelConnection as { enabled: boolean }).enabled }
                    : item,
                ),
              }
            : {}),
        }));
        return true;
      }}
    />
  );
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  toast.mockReset();
  errToast.mockReset();
  save.mockReset().mockResolvedValue(true);
  call.mockReset().mockImplementation(async (method) => modelRead(method));
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const button = (label: string) =>
  [...document.querySelectorAll<HTMLButtonElement>("button")].find(
    (node) => node.textContent?.trim() === label,
  )!;
async function menu(name = "Vercel AI Gateway") {
  await act(async () => host.querySelector<HTMLButtonElement>(`[aria-label="Manage ${name}"]`)!.click());
}
async function chooseAction(label: string) {
  await act(async () => button(label).click());
}

it("shows only masked connection status and performs explicit disconnect/reconnect without a request", async () => {
  await act(async () => root.render(<Fixture />));
  expect(call).toHaveBeenCalledWith("models.list");
  call.mockClear();
  expect(call).not.toHaveBeenCalled();
  expect(save).not.toHaveBeenCalled();
  expect(collectSettingsFields(host).map((field) => field.label)).toEqual(
    expect.arrayContaining(["Provider connections", "Image-generation model"]),
  );
  await menu();
  await chooseAction("Disconnect");
  expect(save).toHaveBeenCalledWith({ modelConnection: { provider: "gateway", enabled: false } });
  expect(host.textContent).toContain("is disconnected");
  await menu();
  await chooseAction("Reconnect");
  expect(save).toHaveBeenLastCalledWith({ modelConnection: { provider: "gateway", enabled: true } });
  expect(call).not.toHaveBeenCalled();
});

it("selects the exact provider and focuses its empty key editor for reauthentication", async () => {
  await act(async () => root.render(<Fixture />));
  expect(call).toHaveBeenCalledWith("models.list");
  call.mockClear();
  await menu("Anthropic");
  await chooseAction("Reauthenticate");
  expect(save).toHaveBeenCalledWith({ modelProvider: "anthropic" });
  const key = host.querySelector<HTMLInputElement>('[aria-label="Provider API key"]')!;
  expect(document.activeElement).toBe(key);
  expect(key.value).toBe("");
  // Active Anthropic selection enumerates configured IDs only; no probe/request action.
  expect(call.mock.calls.map(([method]) => method)).toEqual(["models.list"]);
});

it("keeps a failed credential replacement editable and does not claim success", async () => {
  await act(async () => root.render(<Fixture />));
  expect(call).toHaveBeenCalledWith("models.list");
  call.mockClear();
  save.mockRejectedValueOnce(new Error("Synthetic storage failure"));
  const key = host.querySelector<HTMLInputElement>('[aria-label="Provider API key"]')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(key, "synthetic-key");
    key.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await chooseAction("Save key");
  expect(key.value).toBe("synthetic-key");
  expect(host.querySelector('[role="alert"]')?.textContent).toContain("not saved");
  expect(button("Save key").disabled).toBe(false);
});

it("requires confirmation to remove a saved key and combines removal with disconnect", async () => {
  await act(async () => root.render(<Fixture />));
  expect(call).toHaveBeenCalledWith("models.list");
  call.mockClear();
  await menu();
  await chooseAction("Remove saved key");
  expect(save).not.toHaveBeenCalled();
  const dialog = document.querySelector('[role="alertdialog"]')!;
  expect(dialog.textContent).toContain("Environment credentials remain unused");
  await act(async () =>
    [...dialog.querySelectorAll<HTMLButtonElement>("button")]
      .find((node) => node.textContent === "Remove saved key")!
      .click(),
  );
  expect(save).toHaveBeenCalledWith({
    modelCredential: { provider: "gateway", key: "" },
    modelConnection: { provider: "gateway", enabled: false },
  });
});

it("saves the exact image selection or Off without a provider request and displays the spend-cap limit", async () => {
  await act(async () => root.render(<Fixture />));
  expect(call).toHaveBeenCalledWith("models.list");
  call.mockClear();
  const select = host.querySelector<HTMLSelectElement>('[aria-label="Image-generation model"]')!;
  expect(select.value).toBe("off");
  await act(async () => {
    select.value = IMAGE_MODELS[0].id;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(save).toHaveBeenLastCalledWith({ imageModel: IMAGE_MODELS[0].id });
  expect(call).not.toHaveBeenCalled();
  await act(async () => {
    select.value = "off";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(save).toHaveBeenLastCalledWith({ imageModel: null });
  expect(host.textContent).toContain("unavailable while a run, day or routine spend cap is set");
});

it("does not expose unavailable provider management as functional controls", async () => {
  await act(async () => root.render(<ModelsSettings active settings={{}} onSave={save} />));
  expect(host.querySelector('[aria-label="Manage Vercel AI Gateway"]')).toBeNull();
  expect(host.querySelector<HTMLSelectElement>('[aria-label="Image-generation model"]')!.disabled).toBe(true);
});

it("clears an unsaved credential and stale readiness when another window changes the provider", async () => {
  await act(async () =>
    root.render(
      <ModelsSettings
        active
        settings={{ modelProvider: "gateway", modelProbe: { ok: true, modelId: "fixture" } }}
        onSave={save}
      />,
    ),
  );
  const input = host.querySelector<HTMLInputElement>('[aria-label="Provider API key"]')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(
      input,
      "synthetic-gateway-only",
    );
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () =>
    root.render(<ModelsSettings active settings={{ modelProvider: "anthropic" }} onSave={save} />),
  );
  expect(input.value).toBe("");
  expect(host.textContent).not.toContain("is ready.");
  expect(button("Save key").disabled).toBe(true);
  expect(save).not.toHaveBeenCalled();
});

it("undoes an acknowledged disconnect once without deleting its saved credential", async () => {
  await act(async () => root.render(<Fixture />));
  await menu();
  await chooseAction("Disconnect");
  const undo = toast.mock.calls.at(-1)![2].run;
  await act(async () => undo());
  expect(save).toHaveBeenLastCalledWith({ modelConnection: { provider: "gateway", enabled: true } });
  expect(save.mock.calls.every(([patch]) => patch.modelCredential === undefined)).toBe(true);
  const count = save.mock.calls.length;
  await act(async () => undo());
  expect(save).toHaveBeenCalledTimes(count);
  expect(errToast).toHaveBeenCalled();
});
it("retires the old Undo after another connection action or section unmount", async () => {
  await act(async () => root.render(<Fixture />));
  await menu();
  await chooseAction("Disconnect");
  const oldUndo = toast.mock.calls.at(-1)![2].run;
  await menu();
  await chooseAction("Reconnect");
  const currentUndo = toast.mock.calls.at(-1)![2].run;
  const count = save.mock.calls.length;
  await act(async () => oldUndo());
  expect(save).toHaveBeenCalledTimes(count);
  await act(async () => root.render(null));
  await act(async () => currentUndo());
  expect(save).toHaveBeenCalledTimes(count);
});
