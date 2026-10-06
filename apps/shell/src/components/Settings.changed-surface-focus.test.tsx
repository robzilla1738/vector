// @vitest-environment jsdom
import { act, useLayoutEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { Settings } from "./Settings";
vi.mock("../use-feature", () => ({ useFeature: () => false, featureAvailable: () => false }));
vi.mock("../bridge", () => ({ inNativeHost: false, bridge: { privateMode: false } }));
vi.mock("../store", () => {
  const state = { settingsCategory: "Models", settings: {}, setOverlay: () => {} };
  return {
    useStore: Object.assign((selector: (value: typeof state) => unknown) => selector(state), {
      getState: () => state,
    }),
    call: vi.fn(),
    errToast: vi.fn(),
  };
});
vi.mock("../features/registry", () => ({
  featureSettingsAvailable: (category: string) => category === "Connections",
  FeatureSettings: ({ category }: { category: string | null }) => (
    <div hidden={category !== "Connections"}>GitHub connection</div>
  ),
}));
vi.mock("./MemorySettings", () => ({ MemorySettings: () => null }));
vi.mock("./ExternalAgents", () => ({ ExternalAgents: () => null }));
vi.mock("./PluginsPanel", () => ({ PluginsPanel: () => null }));
vi.mock("./Extensions", () => ({ Extensions: () => null }));
vi.mock("./VaultSettings", () => ({ VaultSettings: () => null }));
vi.mock("./CalendarConnections", () => ({ CalendarConnections: () => null }));
vi.mock("./OutboundMcpSettings", () => ({ OutboundMcpSettings: () => null }));
vi.mock("./ReviewedConnectors", () => ({ ReviewedConnectors: () => null }));
vi.mock("../settings/sections/Appearance", () => ({ AppearanceSettings: () => null }));
vi.mock("../settings/sections/Permissions", () => ({ PermissionsSettings: () => null }));
vi.mock("../settings/sections/PrivacySecurity", () => ({ PrivacySecuritySettings: () => null }));
vi.mock("../settings/sections/PasswordsAutofill", () => ({ PasswordsAutofillSettings: () => null }));
vi.mock("../settings/sections/Models", () => ({ ModelsSettings: () => null }));
vi.mock("../settings/sections/UsageBudgets", () => ({ UsageBudgetsSettings: () => null }));
vi.mock("../settings/sections/Automations", () => ({ AutomationsSettings: () => null }));
vi.mock("../settings/sections/Workspaces", () => ({ WorkspacesSettings: () => null }));
vi.mock("../settings/sections/QuickAsk", () => ({ QuickAskSettings: () => null }));
vi.mock("../settings/sections/SelectionCapture", () => ({ SelectionCaptureSettings: () => null }));
vi.mock("../settings/sections/ArchivedChats", () => ({ ArchivedChatsSettings: () => null }));
vi.mock("../settings/sections/General", () => ({ GeneralSettings: () => null }));
vi.mock("../settings/sections/Profiles", () => ({ ProfilesSettings: () => null }));
function Chat() {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    ref.current?.focus();
  }, []);
  return <textarea ref={ref} aria-label="New chat draft" />;
}
it("shows feature-only Services in its own tab and preserves new-chat focus on Settings retirement", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
    fn(0);
    return 1;
  });
  const host = document.createElement("div"),
    opener = document.createElement("button");
  opener.textContent = "Settings";
  document.body.append(opener, host);
  opener.focus();
  const root = createRoot(host);
  window.history.replaceState(null, "", "/");
  try {
    await act(async () => root.render(<Settings />));
    const github = [...host.querySelectorAll<HTMLElement>("div")]
      .filter((node) => node.textContent === "GitHub connection")
      .at(-1)!;
    expect(github.hidden).toBe(true);
    const services = [...host.querySelectorAll<HTMLButtonElement>("button")].find(
      (node) => node.textContent === "Services",
    )!;
    expect(services).toBeTruthy();
    await act(async () => services.click());
    expect(github.hidden).toBe(false);
    await act(async () => root.render(<Chat />));
    expect(document.activeElement).toBe(host.querySelector("textarea"));
    expect(document.activeElement).not.toBe(opener);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    opener.remove();
    vi.unstubAllGlobals();
  }
});
