// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
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
vi.mock("../../store", () => ({ call: vi.fn(), toast: vi.fn() }));
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  vi.mocked(call).mockReset();
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function mount() {
  await act(async () =>
    root.render(
      <ModelsSettings
        active
        settings={{
          modelProvider: "openai-compatible",
          compatibleEndpoint: "http://127.0.0.1:12345",
          plannerModel: "fixture-model",
        }}
        onSave={vi.fn(async () => true)}
      />,
    ),
  );
}
function testConnection() {
  return [...host.querySelectorAll<HTMLButtonElement>("button")].find(
    (button) => button.textContent === "Test connection",
  )!;
}

it("keeps failed backend detail available without placing it in the primary setup status and allows explicit retry", async () => {
  const detail =
    "ProtocolError: fixture stream parser rejected <script>not executed</script>\n" + "x".repeat(500);
  let attempts = 0;
  vi.mocked(call).mockImplementation(async (method) => {
    if (method === "models.list") return { models: [] };
    if (method === "models.probe")
      return ++attempts === 1
        ? { ok: false, modelId: "fixture-model", error: detail }
        : { ok: true, modelId: "fixture-model", latencyMs: 12, vision: true };
    throw new Error(method);
  });
  await mount();
  expect(attempts).toBe(0);
  expect(host.textContent).toContain("may incur provider charges");
  expect(host.textContent).toContain("does not send your open pages");
  expect(testConnection().disabled).toBe(false);
  await act(async () => testConnection().click());
  const status = host.querySelector(".model-probe-status")!;
  expect(status.textContent).toContain("Check your provider settings, then try again.");
  expect(status.textContent).not.toContain("ProtocolError");
  const details = host.querySelector<HTMLDetailsElement>(".model-probe-details")!;
  expect(details.open).toBe(false);
  expect(details.querySelector("summary")!.textContent).toBe("Connection test details");
  expect(details.querySelector("p")!.textContent).toBe(detail);
  expect(details.querySelector("script")).toBeNull();
  expect(host.querySelector<HTMLInputElement>('[aria-label="Planner model"]')!.value).toBe("fixture-model");
  await act(async () => testConnection().click());
  expect(attempts).toBe(2);
  expect(host.querySelector(".model-probe-status")!.textContent).toContain(
    "Connection tested · 12 ms · vision",
  );
  expect(host.querySelector(".model-probe-details")).toBeNull();
});

it("uses an actionable status without undefined or empty disclosure when failure has no detail", async () => {
  vi.mocked(call).mockImplementation(async (method) => {
    if (method === "models.list") return { models: [] };
    if (method === "models.probe") return { ok: false, modelId: "fixture-model" };
    throw new Error(method);
  });
  await mount();
  await act(async () => testConnection().click());
  expect(host.querySelector(".model-probe-status")!.textContent).toContain("Connection test failed.");
  expect(host.querySelector(".model-probe-status")!.textContent).not.toContain("undefined");
  expect(host.querySelector(".model-probe-details")).toBeNull();
});
