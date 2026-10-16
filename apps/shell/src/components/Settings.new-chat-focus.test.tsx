import { normalizePages, orderedPages } from "../store/pages";
// @vitest-environment jsdom
import { act, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Conversation } from "./Conversation";
import { Settings } from "./Settings";
import { deferSurface } from "./DeferredSurface";
const DeferredSettings = deferSurface(async () => ({ default: Settings }), "Settings");
import { executeCommand } from "../commands";
import { bridge } from "../bridge";
import { useStore } from "../store";
vi.mock("../features/registry", async (original) => ({
  ...(await original<typeof import("../features/registry")>()),
  featureSettingsAvailable: () => false,
  FeatureSettings: () => null,
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
vi.mock("../settings/sections/Routines", () => ({ RoutinesSettings: () => null }));
vi.mock("../settings/sections/Workspaces", () => ({ WorkspacesSettings: () => null }));
vi.mock("../settings/sections/QuickAsk", () => ({ QuickAskSettings: () => null }));
vi.mock("../settings/sections/SelectionCapture", () => ({ SelectionCaptureSettings: () => null }));
vi.mock("../settings/sections/ArchivedChats", () => ({ ArchivedChatsSettings: () => null }));
vi.mock("../settings/sections/General", () => ({ GeneralSettings: () => null }));
vi.mock("../settings/sections/Profiles", () => ({ ProfilesSettings: () => null }));
const initial = useStore.getState();
const modal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal"),
  close = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "close"),
  scroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
let host: HTMLDivElement, root: ReturnType<typeof createRoot>, style: HTMLStyleElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = true;
      this.querySelector<HTMLElement>("button,input")?.focus();
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = false;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  useStore.setState({
    agentDraft: "Original page-free question",
    railOpen: false,
    runs: [],
    pendingTurns: [],
    pages: normalizePages([]),
    connected: true,
    conversationId: null,
  });
  vi.spyOn(bridge, "focusShell").mockResolvedValue(null);
  vi.spyOn(bridge, "overlay").mockResolvedValue(true);
  vi.spyOn(bridge, "dictationStatus").mockResolvedValue({ available: true });
  vi.spyOn(bridge, "startDictation");
  vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.list" || method === "conversations.list" || method === "runs.messages.list")
      return [] as never;
    if (method === "conversations.get") return { title: "Archived original", archived: true } as never;
    if (method === "conversations.artifacts.get") return { artifacts: [] } as never;
    if (method === "conversations.images.get") return { images: [] } as never;
    if (method === "conversations.attachments.get") return { attachments: [] } as never;
    if (method === "conversations.sources.get") return { sources: [] } as never;
    if (method === "runs.context.get") return { entries: [], historyEnabled: true } as never;
    return { workspace: null, memory: null } as never;
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  style = document.createElement("style");
  document.head.append(style);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  style.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  for (const [prototype, key, descriptor] of [
    [HTMLDialogElement.prototype, "showModal", modal],
    [HTMLDialogElement.prototype, "close", close],
    [HTMLElement.prototype, "scrollIntoView", scroll],
  ] as const) {
    if (descriptor) Object.defineProperty(prototype, key, descriptor);
    else Reflect.deleteProperty(prototype, key);
  }
});

function Shell() {
  const overlay = useStore((state) => state.overlay);
  return (
    <>
      <button aria-label="Original Settings opener" onClick={() => void executeCommand("settings")}>
        Settings
      </button>
      <button aria-label="Original New chat" onClick={() => void executeCommand("new-chat")}>
        New chat
      </button>
      <button aria-label="External newer owner">External newer owner</button>
      <div inert={overlay === "settings"}>
        <Conversation />
      </div>
      {overlay === "settings" && <DeferredSettings />}
    </>
  );
}
async function mount() {
  useStore.setState({
    mode: "conversation",
    overlay: null,
    focusRequest: 0,
    focusSlot: "toolbar",
    settingsCategory: "General",
    runs: [],
    pendingTurns: [],
    conversationId: null,
  });
  await act(async () => root.render(<Shell />));
}
const input = () => host.querySelector<HTMLTextAreaElement>('textarea[aria-label="Reply to conversation"]')!;
const opener = () => host.querySelector<HTMLButtonElement>('[aria-label="Original Settings opener"]')!;
async function openSettings() {
  opener().focus();
  await act(async () => opener().click());
}
it("the actual New chat dispatcher focuses the retained composer after Settings retires", async () => {
  await mount();
  const original = input();
  expect(document.activeElement).toBe(original);
  await openSettings();
  expect(host.querySelector('[aria-label="Settings"]')).not.toBeNull();
  expect(document.activeElement).not.toBe(original);
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Original New chat"]')!.click());
  expect(input()).toBe(original);
  expect(useStore.getState().overlay).toBeNull();
  expect(useStore.getState().focusRequest).toBe(1);
  expect(useStore.getState().focusSlot).toBe("hero");
  expect(document.activeElement).toBe(original);
  expect(original.value).toBe("Original page-free question");
  expect(orderedPages(useStore.getState().pages)).toEqual([]);
});
it("ordinary Settings close restores its original opener without refocusing the covered chat", async () => {
  await mount();
  await openSettings();
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Close settings"]')!.click());
  expect(document.activeElement).toBe(opener());
  expect(useStore.getState().focusRequest).toBe(0);
});
it("Settings retirement retains a newer outside focus owner", async () => {
  await mount();
  await openSettings();
  const external = host.querySelector<HTMLButtonElement>('[aria-label="External newer owner"]')!;
  await act(async () => {
    external.focus();
    useStore.getState().setOverlay(null);
  });
  expect(document.activeElement).toBe(external);
});
it("toolbar focus requests do not pull focus back to the conversation", async () => {
  await mount();
  const external = host.querySelector<HTMLButtonElement>('[aria-label="External newer owner"]')!;
  await act(async () => {
    external.focus();
    useStore.getState().focusCommandBar("toolbar");
  });
  expect(document.activeElement).toBe(external);
});

it("deferred Settings teardown preserves a still-connected newer modal focus owner", async () => {
  await mount();
  await openSettings();
  const dialog = document.createElement("dialog"),
    button = document.createElement("button");
  button.textContent = "Original newer modal";
  dialog.append(button);
  document.body.append(dialog);
  try {
    await act(async () => {
      dialog.showModal();
      useStore.getState().setOverlay(null);
    });
    expect(document.activeElement).toBe(button);
    expect(dialog.isConnected).toBe(true);
  } finally {
    dialog.close();
    dialog.remove();
  }
});
it.each(["loading", "error"] as const)(
  "deferred %s teardown restores only physically retired focus",
  async (state) => {
    const opener = document.createElement("button");
    opener.textContent = "Original deferred opener";
    document.body.append(opener);
    opener.focus();
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const Surface = deferSurface(
      () =>
        state === "error"
          ? Promise.reject<{ default: ComponentType<object> }>(new Error("Original failed module"))
          : new Promise<{ default: ComponentType<object> }>(() => {}),
      "Original surface",
    );
    try {
      await act(async () => root.render(<Surface />));
      const original = document.activeElement;
      expect(host.contains(original)).toBe(true);
      expect(original?.isConnected).toBe(true);
      expect(host.textContent?.includes("Original failed module")).toBe(state === "error");
      await act(async () => root.render(null));
      expect(original?.isConnected).toBe(false);
      expect(document.activeElement).toBe(opener);
    } finally {
      errors.mockRestore();
      opener.remove();
    }
  },
);
it("deferred teardown does not interpret an unrelated BODY focus as owned removal", async () => {
  const opener = document.createElement("button");
  document.body.append(opener);
  opener.focus();
  const Surface = deferSurface(
    () => new Promise<{ default: ComponentType<object> }>(() => {}),
    "Original surface",
  );
  try {
    await act(async () => root.render(<Surface />));
    (document.activeElement as HTMLElement).blur();
    expect(document.activeElement).toBe(document.body);
    await act(async () => root.render(null));
    expect(document.activeElement).toBe(document.body);
  } finally {
    opener.remove();
  }
});
