// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { call } from "../../store";
import { ModelsSettings } from "./Models";

vi.mock("../../bridge", () => ({ bridge: { windowId: "models-fixture", windowKind: "normal", privateMode: false }, inNativeHost: false, inMock: true }));
vi.mock("../../commands", async () => {
  const { invokeScopedControl } = await import("../../scoped-control-commands");
  return { executeCommand: (command: string, context: Parameters<typeof invokeScopedControl>[1]) => {
    try { return Promise.resolve(invokeScopedControl(command, context)); } catch (reason) { return Promise.reject(reason); }
  } };
});
vi.mock("../../store", () => ({ call: vi.fn(), toast: vi.fn() }));
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  vi.mocked(call).mockReset().mockResolvedValue({ models: [] });
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks(); vi.unstubAllGlobals();
});
function button(text: string) {
  return [...host.querySelectorAll<HTMLButtonElement>("button")].find((item) => item.textContent === text)!;
}
function keyField() {
  return host.querySelector<HTMLInputElement>('[aria-label="Provider API key"]')!;
}
async function type(value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(keyField(), value);
    keyField().dispatchEvent(new Event("input", { bubbles: true }));
  });
}
function settings(provider: string) {
  return {
    modelProvider: provider,
    compatibleEndpoint: "http://127.0.0.1:12345",
    plannerModel: "fixture-model",
  };
}
it.each(["success", "false-ack", "rejection"])(
  "retired A key save cannot erase B draft or clear B pending (%s)",
  async (outcome) => {
    const completions: { resolve(value: boolean): void; reject(reason: Error): void }[] = [];
    const save = vi.fn(
      () => new Promise<boolean>((resolve, reject) => completions.push({ resolve, reject })),
    );
    await act(async () =>
      root.render(<ModelsSettings active settings={settings("gateway")} onSave={save} />),
    );
    await type("synthetic-A-not-a-credential");
    await act(async () => {
      button("Save key").click();
      button("Save key").click();
    });
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, {
      modelCredential: { provider: "gateway", key: "synthetic-A-not-a-credential" },
    });
    await act(async () =>
      root.render(<ModelsSettings active settings={settings("openai-compatible")} onSave={save} />),
    );
    await type("synthetic-B-kept-draft");
    await act(async () => button("Save key").click());
    expect(save).toHaveBeenCalledTimes(2);
    expect(keyField().disabled).toBe(true);
    await act(async () =>
      outcome === "rejection"
        ? completions[0]!.reject(new Error("Original A-only key failure"))
        : completions[0]!.resolve(outcome === "success"),
    );
    expect(keyField().value).toBe("synthetic-B-kept-draft");
    expect(keyField().disabled).toBe(true);
    expect(host.querySelector('[role="alert"]')).toBeNull();
    await act(async () => completions[1]!.resolve(false));
    expect(keyField().value).toBe("synthetic-B-kept-draft");
    expect(keyField().disabled).toBe(false);
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      "The key was not saved. Your entry is still here",
    );
  },
);
it("inactive roundtrip retires original probe without clearing a fresh pending connection test", async () => {
  const completions: { resolve(value: unknown): void; reject(reason: Error): void }[] = [];
  vi.mocked(call).mockImplementation((method) =>
    method === "models.list"
      ? Promise.resolve({ models: [] })
      : new Promise((resolve, reject) => completions.push({ resolve, reject })),
  );
  const props = { settings: settings("openai-compatible"), onSave: vi.fn(async () => true) };
  await act(async () => root.render(<ModelsSettings active {...props} />));
  await act(async () => button("Test connection").click());
  await act(async () => root.render(<ModelsSettings active={false} {...props} />));
  await act(async () => root.render(<ModelsSettings active {...props} />));
  expect(button("Test connection").disabled).toBe(false);
  await act(async () => button("Test connection").click());
  await act(async () => completions[0]!.reject(new Error("Original retired probe failure")));
  expect(host.textContent).not.toContain("Original retired probe failure");
  expect(button("Testing…").disabled).toBe(true);
  await act(async () => completions[1]!.resolve({ ok: true, modelId: "fixture-model", latencyMs: 12 }));
  expect(host.querySelector(".model-probe-status")?.textContent).toContain("Connection tested");
  expect(button("Test connection").disabled).toBe(false);
});

it("does not revive a held original A save after provider A→B→A", async () => {
  let resolve!: (value: boolean) => void;
  const save = vi.fn(
    () =>
      new Promise<boolean>((done) => {
        resolve = done;
      }),
  );
  await act(async () => root.render(<ModelsSettings active settings={settings("gateway")} onSave={save} />));
  await type("synthetic-original-A");
  await act(async () => button("Save key").click());
  await act(async () =>
    root.render(<ModelsSettings active settings={settings("openai-compatible")} onSave={save} />),
  );
  await act(async () => root.render(<ModelsSettings active settings={settings("gateway")} onSave={save} />));
  await type("synthetic-fresh-A");
  await act(async () => resolve(true));
  expect(keyField().value).toBe("synthetic-fresh-A");
  expect(button("Save key").disabled).toBe(false);
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(save).toHaveBeenCalledTimes(1);
});
