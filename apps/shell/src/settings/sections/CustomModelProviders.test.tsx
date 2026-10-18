// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CustomModelProviderSchema } from "@aux/contracts";
import { CustomModelProviders } from "./CustomModelProviders";

vi.mock("../../bridge", () => ({
  bridge: { windowId: "custom-provider-fixture", windowKind: "normal", privateMode: false },
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
vi.mock("../../store", () => ({ call: vi.fn(), toast: vi.fn(), errToast: vi.fn() }));

let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
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
const provider = CustomModelProviderSchema.parse({
  id: "fixture",
  name: "Fixture Provider",
  api: "anthropic-messages",
  baseUrl: "https://fixture.example.test/v1",
  models: [{ id: "fixture-model", provider: "fixture", source: "configured", modalities: ["text"] }],
});
function configuration(id = provider.id) {
  return JSON.stringify({
    providers: {
      [id]: {
        name: provider.name,
        api: provider.api,
        baseUrl: provider.baseUrl,
        apiKey: "synthetic-dialog-key",
        models: [{ id: "fixture-model", input: ["text"] }],
      },
    },
  });
}
function button(label: string) {
  const found = [...document.querySelectorAll<HTMLButtonElement>("button")].find(
    (node) => node.textContent === label || node.getAttribute("aria-label") === label,
  );
  if (!found) throw new Error(`Missing button: ${label}`);
  return found;
}
async function click(label: string) {
  await act(async () => button(label).click());
}
async function type(value: string) {
  const editor = document.querySelector<HTMLTextAreaElement>('[aria-label="Provider JSON"]');
  if (!editor) throw new Error("Missing provider editor");
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(editor, value);
    editor.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
const settings = { customModelProviders: [provider], modelConnectionRevision: "original" };
it("saves the named configuration and a separate credential from the real dialog control", async () => {
  const save = vi.fn(async () => true);
  await act(async () =>
    root.render(<CustomModelProviders settings={settings} active disabled={false} onSave={save} />),
  );
  await click("Add custom provider");
  await type("{");
  await click("Save");
  expect(save).not.toHaveBeenCalled();
  expect(document.querySelector('[role="alert"]')?.textContent).toContain("valid provider JSON");
  await type(configuration());
  await click("Save");
  expect(save).toHaveBeenCalledExactlyOnceWith({
    customModelProvider: provider,
    customModelProviderId: "fixture",
    modelConnection: { provider: "openai-compatible", enabled: true },
    modelCredential: { provider: "openai-compatible", connectionId: "fixture", key: "synthetic-dialog-key" },
  });
  expect(document.querySelector('[aria-label="Provider JSON"]')).toBeNull();
});
it("keeps edit identity and leaves a failed save available to correct", async () => {
  const save = vi.fn(async () => false);
  await act(async () =>
    root.render(<CustomModelProviders settings={settings} active disabled={false} onSave={save} />),
  );
  await click("Manage Fixture Provider");
  await click("Edit configuration");
  expect(document.querySelector<HTMLTextAreaElement>("textarea")?.value).not.toContain("apiKey");
  await type(configuration("replacement"));
  await click("Save");
  expect(save).not.toHaveBeenCalled();
  expect(document.querySelector('[role="alert"]')?.textContent).toContain("Keep this provider's id");
  await type(configuration());
  await click("Save");
  expect(save).toHaveBeenCalledTimes(1);
  expect(document.querySelector('[role="alert"]')?.textContent).toContain("not saved");
  expect(document.querySelector<HTMLTextAreaElement>("textarea")?.value).toBe(configuration());
});
it("retires a secret draft on connection changes and ignores the old save completion", async () => {
  let complete!: (saved: boolean) => void;
  const save = vi.fn(
    () =>
      new Promise<boolean>((resolve) => {
        complete = resolve;
      }),
  );
  await act(async () =>
    root.render(<CustomModelProviders settings={settings} active disabled={false} onSave={save} />),
  );
  await click("Add custom provider");
  await type(configuration());
  await click("Save");
  expect(save).toHaveBeenCalledTimes(1);
  await act(async () =>
    root.render(
      <CustomModelProviders
        settings={{ ...settings, modelConnectionRevision: "replacement" }}
        active
        disabled={false}
        onSave={save}
      />,
    ),
  );
  expect(document.querySelector("textarea")).toBeNull();
  await click("Add custom provider");
  await type(configuration("fresh"));
  await act(async () => complete(true));
  expect(document.querySelector<HTMLTextAreaElement>("textarea")?.value).toBe(configuration("fresh"));
  expect(button("Save").disabled).toBe(false);
});

it("cancels an original removal review when another window changes the connection", async () => {
  const save = vi.fn(async () => true);
  await act(async () =>
    root.render(<CustomModelProviders settings={settings} active disabled={false} onSave={save} />),
  );
  await click("Manage Fixture Provider");
  await click("Remove provider");
  expect(document.querySelector('[role="alertdialog"]')).not.toBeNull();
  expect(save).not.toHaveBeenCalled();
  await act(async () =>
    root.render(
      <CustomModelProviders
        settings={{ ...settings, modelConnectionRevision: "replacement" }}
        active
        disabled={false}
        onSave={save}
      />,
    ),
  );
  expect(document.querySelector('[role="alertdialog"]')).toBeNull();
  expect(save).not.toHaveBeenCalled();
  await click("Manage Fixture Provider");
  await click("Remove provider");
  await click("Remove provider");
  expect(save).toHaveBeenCalledExactlyOnceWith({ removeCustomModelProviderId: "fixture" });
});
