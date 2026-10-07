// @vitest-environment jsdom
import { CopilotSetupSchema } from "@aux/contracts/copilot-auth";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ModelsSettings } from "./Models";
import { invokeScopedControl } from "../../scoped-control-commands";
import { reportCommandCompletionFailure } from "../../command-completion";
import { ModelProviderSchema } from "@aux/contracts";
const fixture = vi.hoisted(() => ({
  windowId: "models-original-window",
  windowKind: "normal",
  privateMode: false,
}));
const call = vi.hoisted(() => vi.fn());
vi.mock("../../bridge", () => ({ bridge: fixture, inNativeHost: false, inMock: true }));

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

vi.mock("../../store", () => ({ call }));
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
let root: ReturnType<typeof createRoot>, host: HTMLDivElement;
const settings = {
  modelProvider: "openai-compatible",
  compatibleEndpoint: "http://127.0.0.1:12345",
  plannerModel: "synthetic-loopback-model",
};
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  Object.assign(fixture, { windowId: "models-original-window", windowKind: "normal", privateMode: false });
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
const keyField = () => host.querySelector<HTMLInputElement>('[aria-label="Provider API key"]')!;
const button = (text: string) =>
  [...host.querySelectorAll<HTMLButtonElement>("button")].find((node) => node.textContent === text)!;
async function typeKey(value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(keyField(), value);
    keyField().dispatchEvent(new Event("input", { bubbles: true }));
  });
}
it("input Enter and remapped focused Save share one actual registration and original boolean ACK", async () => {
  const save = vi.fn(async () => true);
  await act(async () => root.render(<ModelsSettings active settings={settings} onSave={save} />));
  await typeKey("synthetic-not-a-credential");
  await act(async () =>
    keyField().dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })),
  );
  expect(save).toHaveBeenCalledTimes(1);
  expect(keyField().value).toBe("");
  await typeKey("synthetic-second-entry");
  let completion!: Promise<boolean>;
  await act(async () => {
    button("Save key").focus();
    completion = invokeScopedControl("save-provider-model-key") as Promise<boolean>;
  });
  await expect(completion).resolves.toBe(true);
  expect(save).toHaveBeenCalledTimes(2);
});
it("same-tick duplicate invocation refuses without issuing a second credential write", async () => {
  let resolve!: (ack: boolean) => void;
  const save = vi.fn(
    () =>
      new Promise<boolean>((done) => {
        resolve = done;
      }),
  );
  await act(async () => root.render(<ModelsSettings active settings={settings} onSave={save} />));
  await typeKey("synthetic-reserved-entry");
  let first!: Promise<boolean>, second!: Promise<unknown>;
  await act(async () => {
    button("Save key").focus();
    first = invokeScopedControl("save-provider-model-key") as Promise<boolean>;
    second = invokeScopedControl("save-provider-model-key") as Promise<unknown>;
    second.catch(() => {});
  });
  expect(save).toHaveBeenCalledTimes(1);
  await expect(second).rejects.toThrow("current model key draft");
  await act(async () => resolve(true));
  await expect(first).resolves.toBe(true);
});
it("committed native Private ABA retires original result/error delivery without clearing a fresh pending draft", async () => {
  const completions: { resolve(ack: boolean): void; reject(reason: unknown): void }[] = [];
  const save = vi.fn(() => new Promise<boolean>((resolve, reject) => completions.push({ resolve, reject })));
  const mount = () => root.render(<ModelsSettings active settings={settings} onSave={save} />);
  await act(async () => mount());
  await typeKey("synthetic-original-entry");
  let original!: Promise<boolean>;
  await act(async () => {
    button("Save key").focus();
    original = invokeScopedControl("save-provider-model-key") as Promise<boolean>;
    original.catch(() => {});
  });
  fixture.privateMode = true;
  await act(async () => mount());
  fixture.privateMode = false;
  await act(async () => mount());
  await typeKey("synthetic-fresh-entry");
  let fresh!: Promise<boolean>;
  await act(async () => {
    button("Save key").focus();
    fresh = invokeScopedControl("save-provider-model-key") as Promise<boolean>;
  });
  const reason = new Error("original-retired-rejection");
  await act(async () => completions[0]!.reject(reason));
  await expect(original).rejects.toBe(reason);
  const report = vi.fn();
  reportCommandCompletionFailure(original, reason, report);
  expect(report).not.toHaveBeenCalled();
  expect(keyField().value).toBe("synthetic-fresh-entry");
  expect(keyField().disabled).toBe(true);
  await act(async () => completions[1]!.resolve(false));
  await expect(fresh).resolves.toBe(false);
  expect(keyField().value).toBe("synthetic-fresh-entry");
});
it("draft ABA cannot revive original key clearing after the genuine write ACK", async () => {
  let resolve!: (ack: boolean) => void;
  const save = vi.fn(
    () =>
      new Promise<boolean>((done) => {
        resolve = done;
      }),
  );
  await act(async () => root.render(<ModelsSettings active settings={settings} onSave={save} />));
  await typeKey("synthetic-A");
  let completion!: Promise<boolean>;
  await act(async () => {
    button("Save key").focus();
    completion = invokeScopedControl("save-provider-model-key") as Promise<boolean>;
  });
  await typeKey("synthetic-B");
  await typeKey("synthetic-A");
  await act(async () => resolve(true));
  await expect(completion).resolves.toBe(true);
  expect(keyField().value).toBe("synthetic-A");
});
it("hidden/inactive and foreign focused owners cannot issue actual model producers", async () => {
  const save = vi.fn(async () => true);
  await act(async () => root.render(<ModelsSettings active={false} settings={settings} onSave={save} />));
  await typeKey("synthetic-hidden-entry");
  button("Save key").focus();
  expect(() => invokeScopedControl("save-provider-model-key")).toThrow();
  expect(save).not.toHaveBeenCalled();
  expect(call.mock.calls.every(([method]) => method === "settings.cloud.status")).toBe(true);
  expect(call.mock.calls.some(([method]) => method === "models.probe")).toBe(false);
  await act(async () => root.render(<ModelsSettings active settings={settings} onSave={save} />));
  const foreign = document.createElement("button");
  document.body.append(foreign);
  foreign.focus();
  expect(() => invokeScopedControl("save-provider-model-key")).toThrow();
  foreign.remove();
  expect(save).not.toHaveBeenCalled();
  expect(
    call.mock.calls.every(
      ([method]) =>
        method === "settings.cloud.status" ||
        method === "models.list" ||
        method === "models.copilot.setup" ||
        method === "models.copilot.accounts",
    ),
  ).toBe(true);
  expect(call.mock.calls.some(([method]) => method === "models.probe")).toBe(false);
});
it("retired connection review cannot remove a saved key, while its original Cancel remains usable", async () => {
  const save = vi.fn(async () => true);
  const status = ModelProviderSchema.options.map((provider) => ({
    provider,
    selected: provider === "gateway",
    enabled: true,
    credentialSource: provider === "gateway" ? "saved" : "none",
    credentialUnavailable: false,
    localEndpoint: false,
  }));
  const props = { modelProvider: "gateway", modelConnections: status };
  await act(async () => root.render(<ModelsSettings active settings={props} onSave={save} />));
  await act(async () =>
    host.querySelector<HTMLButtonElement>('[aria-label="Manage Vercel AI Gateway"]')!.click(),
  );
  await act(async () =>
    [...document.querySelectorAll<HTMLButtonElement>("button")]
      .find((node) => node.textContent?.trim() === "Remove saved key")!
      .click(),
  );
  expect(document.querySelector('[role="alertdialog"]')).not.toBeNull();
  await act(async () =>
    root.render(
      <ModelsSettings
        active
        settings={{ ...props, modelConnections: status.map((row) => ({ ...row, enabled: false })) }}
        onSave={save}
      />,
    ),
  );
  await act(async () => document.querySelector<HTMLButtonElement>('[role="alertdialog"] .danger')!.click());
  expect(save).not.toHaveBeenCalled();
  await act(async () =>
    [...document.querySelectorAll<HTMLButtonElement>('[role="alertdialog"] button')]
      .find((node) => node.textContent === "Cancel")!
      .click(),
  );
  expect(document.querySelector('[role="alertdialog"]')).toBeNull();
  expect(save).not.toHaveBeenCalled();
});
it("retains the original endpoint rejection but suppresses reporting into a newer committed draft", async () => {
  let reject!: (reason: unknown) => void;
  const save = vi.fn(
    () =>
      new Promise<boolean>((_, fail) => {
        reject = fail;
      }),
  );
  await act(async () => root.render(<ModelsSettings active settings={settings} onSave={save} />));
  const endpoint = host.querySelector<HTMLInputElement>('[aria-label="OpenAI-compatible endpoint"]')!;
  const edit = async (value: string) =>
    act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(endpoint, value);
      endpoint.dispatchEvent(new Event("input", { bubbles: true }));
    });
  await edit("http://127.0.0.1:12346");
  let original!: Promise<boolean>;
  await act(async () => {
    endpoint.focus();
    original = invokeScopedControl("save-model-endpoint") as Promise<boolean>;
    original.catch(() => {});
  });
  await edit("http://127.0.0.1:12347");
  const reason = new Error("original endpoint rejection");
  await act(async () => reject(reason));
  await expect(original).rejects.toBe(reason);
  const report = vi.fn();
  reportCommandCompletionFailure(original, reason, report);
  expect(report).not.toHaveBeenCalled();
  expect(endpoint.value).toBe("http://127.0.0.1:12347");
  expect(save).toHaveBeenCalledTimes(1);
});
it("late provider selection ACK cannot clear a newer draft after an external provider ABA", async () => {
  let resolve!: (ack: boolean) => void;
  const save = vi.fn(
    () =>
      new Promise<boolean>((done) => {
        resolve = done;
      }),
  );
  await act(async () => root.render(<ModelsSettings active settings={settings} onSave={save} />));
  const select = host.querySelector<HTMLSelectElement>('[data-command-id="select-model-provider"]')!;
  select.value = "anthropic";
  let original!: Promise<void>;
  await act(async () => {
    select.focus();
    original = invokeScopedControl("select-model-provider") as Promise<void>;
  });
  await act(async () =>
    root.render(<ModelsSettings active settings={{ ...settings, modelProvider: "gateway" }} onSave={save} />),
  );
  await act(async () => root.render(<ModelsSettings active settings={settings} onSave={save} />));
  await typeKey("synthetic-new-draft");
  await act(async () => resolve(true));
  await expect(original).resolves.toBeUndefined();
  expect(keyField().value).toBe("synthetic-new-draft");
  expect(save).toHaveBeenCalledTimes(1);
});
it("an observed native mismatch permanently retires the original callback even without a render", async () => {
  const save = vi.fn(async () => true);
  await act(async () => root.render(<ModelsSettings active settings={settings} onSave={save} />));
  await typeKey("synthetic-original-entry");
  button("Save key").focus();
  fixture.privateMode = true;
  expect(() => invokeScopedControl("save-provider-model-key")).toThrow("original current model draft");
  fixture.privateMode = false;
  expect(() => invokeScopedControl("save-provider-model-key")).toThrow("original current model draft");
  expect(save).not.toHaveBeenCalled();
  expect(keyField().value).toBe("synthetic-original-entry");
});
it("retiring the native review window cancels only its original removal and never writes", async () => {
  const save = vi.fn(async () => true);
  const status = ModelProviderSchema.options.map((provider) => ({
    provider,
    selected: provider === "gateway",
    enabled: true,
    credentialSource: "saved",
    credentialUnavailable: false,
    localEndpoint: false,
  }));
  const props = { modelProvider: "gateway", modelConnections: status };
  await act(async () => root.render(<ModelsSettings active settings={props} onSave={save} />));
  await act(async () =>
    host.querySelector<HTMLButtonElement>('[aria-label="Manage Vercel AI Gateway"]')!.click(),
  );
  await act(async () =>
    [...document.querySelectorAll<HTMLButtonElement>("button")]
      .find((node) => node.textContent?.trim() === "Remove saved key")!
      .click(),
  );
  expect(document.querySelector('[role="alertdialog"]')).not.toBeNull();
  fixture.windowId = "foreign-native-window";
  await act(async () => root.render(<ModelsSettings active settings={props} onSave={save} />));
  expect(document.querySelector('[role="alertdialog"]')).toBeNull();
  expect(save).not.toHaveBeenCalled();
});

it("a retired role save does not disable a newly active role or clear its pending work", async () => {
  const completions: ((ack: boolean) => void)[] = [];
  const save = vi.fn(() => new Promise<boolean>((resolve) => completions.push(resolve)));
  const mount = (active: boolean) =>
    root.render(<ModelsSettings active={active} settings={settings} onSave={save} />);
  const roleButton = () =>
    host
      .querySelector<HTMLInputElement>('[aria-label="Fast model ID"]')!
      .parentElement!.querySelector<HTMLButtonElement>('[data-command-id="save-model-role"]')!;
  await act(async () => mount(true));
  let original!: Promise<boolean>;
  await act(async () => {
    roleButton().focus();
    original = invokeScopedControl("save-model-role") as Promise<boolean>;
  });
  expect(roleButton().disabled).toBe(true);
  await act(async () => mount(false));
  await act(async () => mount(true));
  expect(roleButton().disabled).toBe(false);
  let fresh!: Promise<boolean>;
  await act(async () => {
    roleButton().focus();
    fresh = invokeScopedControl("save-model-role") as Promise<boolean>;
  });
  expect(save).toHaveBeenCalledTimes(2);
  await act(async () => completions[0]!(true));
  await expect(original).resolves.toBe(true);
  expect(roleButton().disabled).toBe(true);
  await act(async () => completions[1]!(false));
  await expect(fresh).resolves.toBe(false);
  expect(roleButton().disabled).toBe(false);
});
