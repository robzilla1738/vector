// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { PluginsPanel } from "./PluginsPanel";
vi.mock("../use-feature", () => ({ useFeature: () => true }));
vi.mock("../bridge", () => ({ bridge: { invoke: vi.fn(async () => []) } }));
vi.mock("./AuxPackages", () => ({ AuxPackages: () => <p>Packages</p> }));
vi.mock("./OutboundMcpSettings", () => ({
  OutboundMcpSettings: ({ active }: { active: boolean }) => (
    <input aria-label="MCP draft" disabled={!active} />
  ),
}));

it("routes search to MCP, retains its draft across keyboard tab switches and retires inactive controls", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const tabs = () => [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  try {
    await act(async () => root.render(<PluginsPanel destination="MCP servers" active />));
    expect(tabs()[1]!.getAttribute("aria-selected")).toBe("true");
    const draft = host.querySelector<HTMLInputElement>('[aria-label="MCP draft"]')!;
    draft.value = "Unsent local draft";
    await act(async () =>
      tabs()[1]!.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true })),
    );
    expect(document.activeElement).toBe(tabs()[0]);
    expect(draft.closest<HTMLElement>('[role="tabpanel"]')!.hidden).toBe(true);
    await act(async () =>
      tabs()[0]!.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true })),
    );
    expect(document.activeElement).toBe(tabs()[1]);
    expect(draft.value).toBe("Unsent local draft");
    await act(async () => root.render(<PluginsPanel active={false} />));
    expect(draft.disabled).toBe(true);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
});
