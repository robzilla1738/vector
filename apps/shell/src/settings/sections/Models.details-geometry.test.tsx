// @vitest-environment jsdom
import { CopilotSetupSchema } from "@aux/contracts/copilot-auth";
import { readFileSync } from "node:fs";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { call } from "../../store";
import { invokeScopedControl } from "../../scoped-control-commands";
import { ModelsSettings } from "./Models";
vi.mock("../../bridge", () => ({
  bridge: { windowId: "details-fixture", windowKind: "normal", privateMode: false },
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

vi.mock("../../store", () => ({ call: vi.fn(), toast: vi.fn() }));
it("retains failed detail text and focused registered disclosure while enlarging only its target", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const rects = vi
    .spyOn(HTMLElement.prototype, "getClientRects")
    .mockReturnValue([{}] as unknown as DOMRectList);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const style = document.createElement("style");
  const css = readFileSync("apps/shell/src/components/Settings.css", "utf8");
  const rule = css.match(/\.model-probe-details > summary\s*\{[^}]+\}/)?.[0];
  expect(rule).toBeTruthy();
  style.textContent = rule!;
  document.head.append(style);
  const detail =
    "Original failure <script>literal only</script>\n" + "https://fixture.invalid/" + "x".repeat(600);
  const save = vi.fn(async () => true);
  vi.mocked(call).mockImplementation(async (method) =>
    method === "models.probe" ? { ok: false, modelId: "fixture-model", error: detail } : modelRead(method),
  );
  try {
    await act(async () =>
      root.render(
        <ModelsSettings
          active
          settings={{
            modelProvider: "openai-compatible",
            compatibleEndpoint: "http://127.0.0.1:12345",
            plannerModel: "fixture-model",
          }}
          onSave={save}
        />,
      ),
    );
    const test = [...host.querySelectorAll("button")].find((node) => node.textContent === "Test connection")!;
    await act(async () => test.click());
    const details = host.querySelector<HTMLDetailsElement>(".model-probe-details")!,
      summary = details.querySelector("summary")!;
    expect(details.open).toBe(false);
    expect(details.querySelector("p")!.textContent).toBe(detail);
    expect(details.querySelector("script")).toBeNull();
    const computed = getComputedStyle(summary);
    expect(computed.minHeight).toBe("36px");
    expect(computed.height).toBe("auto");
    expect(computed.whiteSpace).toBe("normal");
    expect(computed.overflowWrap).toBe("anywhere");
    expect((style.sheet!.cssRules[0] as CSSStyleRule).style.getPropertyValue("padding")).toBe(
      "var(--space-2) var(--space-3)",
    );
    summary.focus();
    expect(document.activeElement).toBe(summary);
    const enter = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    summary.dispatchEvent(enter);
    expect(enter.defaultPrevented).toBe(false);
    // jsdom has no native Enter default activation. Exercise the actual focused remappable owner, without inventing a native click.
    await act(async () => invokeScopedControl("show-model-probe-details"));
    expect(details.open).toBe(true);
    expect(document.activeElement).toBe(summary);
    await act(async () => summary.click());
    expect(details.open).toBe(false);
    expect(details.querySelector("p")!.textContent).toBe(detail);
    expect(save).not.toHaveBeenCalled();
    const unrelated = document.createElement("summary");
    host.append(unrelated);
    expect(getComputedStyle(unrelated).minHeight).not.toBe("36px");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    style.remove();
    rects.mockRestore();
    vi.unstubAllGlobals();
  }
});
