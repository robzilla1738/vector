// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const fixture = vi.hoisted(() => ({
  privateMode: false,
  connected: true,
  settings: {} as Record<string, unknown>,
  runs: [] as unknown[],
  focus: vi.fn(),
  setState: vi.fn(),
  command: vi.fn(),
}));
vi.mock("../bridge", () => ({
  bridge: {
    get privateMode() {
      return fixture.privateMode;
    },
  },
}));
vi.mock("../store", () => ({
  useStore: Object.assign(
    (selector: (state: unknown) => unknown) =>
      selector({
        connected: fixture.connected,
        settings: fixture.settings,
        runs: fixture.runs,
        focusCommandBar: fixture.focus,
      }),
    { setState: fixture.setState, getState: () => ({ openConversation: vi.fn(), focusRequest: 0 }) },
  ),
}));
vi.mock("../commands", () => ({ runCommand: fixture.command }));
vi.mock("./CommandBar", () => ({
  CommandBar: ({ hero }: { hero?: boolean }) => (
    <input aria-label="Browser search" data-home-entry={String(!!hero)} />
  ),
}));
vi.mock("./AuxMark", () => ({ AuxMark: () => <span aria-hidden="true">Aux</span> }));
vi.mock("./SessionRecovery", () => ({ SessionRecovery: () => null }));
vi.mock("../chat-list/RecentWork", () => ({ RecentWork: () => <section aria-label="Recent work" /> }));
vi.mock("../features/registry", () => ({ FeatureSlots: () => null }));
vi.mock("../agent/RunAttentionFeed", () => ({
  RunAttentionFeed: () => null,
  selectAttentionRuns: (runs: unknown[]) => runs,
}));
vi.mock("../agent/RunNoticeControls", () => ({ RunNoticePreference: () => null }));
import { StartPage } from "./StartPage";
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  fixture.privateMode = false;
  fixture.connected = true;
  fixture.settings = {};
  vi.clearAllMocks();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

it("uses the shared Search/Ask hero without dispatching an action on mount", async () => {
  await act(async () => root.render(<StartPage />));
  expect(host.querySelector('[data-home-entry="true"]')).not.toBeNull();
  expect(host.querySelector('[aria-label="Browser search"]')).not.toBeNull();
  expect(host.querySelector('[aria-label="Recent work"]')).not.toBeNull();
  expect(fixture.focus).not.toHaveBeenCalled();
  expect(fixture.command).not.toHaveBeenCalled();
});
it("does not guess an absent or disconnected model configuration", async () => {
  fixture.connected = false;
  await act(async () => root.render(<StartPage />));
  expect(host.textContent).toContain("Connecting to Aux");
  expect(host.textContent).not.toContain("Connect an AI model");
  expect(fixture.command).not.toHaveBeenCalled();
});
it("offers one explicit registered model-settings action only when configuration is false", async () => {
  fixture.settings = { modelConfigured: false };
  await act(async () => root.render(<StartPage />));
  const button = host.querySelector<HTMLButtonElement>('[data-command-id="settings"]');
  expect(button).not.toBeNull();
  expect(fixture.command).not.toHaveBeenCalled();
  await act(async () => button!.click());
  expect(fixture.setState).toHaveBeenCalledWith({ settingsCategory: "Models" });
  expect(fixture.command).toHaveBeenCalledExactlyOnceWith("settings");
});
it("keeps private browsing separate from saved chats and model setup", async () => {
  fixture.privateMode = true;
  fixture.settings = { modelConfigured: false };
  await act(async () => root.render(<StartPage />));
  expect(host.querySelector('[aria-label="Browser search"]')).not.toBeNull();
  expect(host.querySelector("[data-durable-home-composer]")).toBeNull();
  expect(host.querySelector('[aria-label="Recent work"]')).toBeNull();
  expect(host.textContent).not.toContain("Connect an AI model");
  expect(host.textContent).toContain("Private browsing");
  expect(fixture.focus).toHaveBeenCalledExactlyOnceWith("hero");
});
