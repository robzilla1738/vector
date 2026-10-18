import { normalizePages } from "../store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { OnboardingState, PageTarget } from "@aux/contracts";
import { OnboardingFlow } from "./OnboardingFlow";
import OnboardingHost from "./OnboardingHost";
import { requestOnboardingReplay } from "./replay";

vi.mock("../commands", async () => {
  const { invokeScopedControl } = await import("../scoped-control-commands");
  return {
    executeCommand: (command: string, invocation: any) => {
      try {
        return Promise.resolve(invokeScopedControl(command, invocation));
      } catch (reason) {
        return Promise.reject(reason);
      }
    },
  };
});
const rpc = vi.hoisted(() => vi.fn());
const openConversation = vi.hoisted(() => vi.fn());
const openPage = vi.hoisted(() => vi.fn());
const activate = vi.hoisted(() => vi.fn());
const native = vi.hoisted(() => ({
  privateMode: false,
  windowKind: "normal",
  windowId: "main",
  defaultBrowser: vi.fn(async () => ({ isDefault: false })),
  setDefaultBrowser: vi.fn(async () => ({ isDefault: true })),
  runtimeRestoreStatus: vi.fn(async () => {
    throw new Error("onboarding must read installation.restoreStatus");
  }),
  onEvent: vi.fn(() => () => {}),
  overlay: vi.fn(async () => {}),
  lockSidebar: vi.fn(async () => {}),
}));
let workspace: any;
vi.mock("../bridge", () => ({ inNativeHost: true, bridge: native }));
vi.mock("../store", () => ({
  call: rpc,
  toast: vi.fn(),
  errToast: vi.fn(),
  useStore: Object.assign((selector: (state: any) => unknown) => selector(workspace), {
    getState: () => workspace,
    setState: (update: any) => {
      workspace = { ...workspace, ...(typeof update === "function" ? update(workspace) : update) };
    },
  }),
}));
const initial = (step: OnboardingState["step"]): OnboardingState => ({
  version: 2,
  revision: 0,
  status: "active",
  step,
  visited: [],
  skipped: [],
});
const source: PageTarget = {
  pageId: "reviewed",
  windowId: "main",
  backend: "aux",
  targetId: "reviewed",
  url: "https://fixture.example/article",
  title: "Fixture article",
  documentEpoch: 1,
  sessionId: "session",
  lastRevision: 0,
  viewStatus: "visible",
  controller: "none",
  controllerEpoch: 0,
  ownedByRuntime: false,
  createdAt: 1,
  lastActiveAt: 1,
};
let current: OnboardingState;
let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
const close = vi.fn();
const button = (text: string) =>
  [...document.querySelectorAll<HTMLButtonElement>("button")].find((node) => node.textContent === text)!;
async function render(state: OnboardingState) {
  current = state;
  await act(async () => root.render(<OnboardingFlow initialState={state} onClose={close} />));
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{ width: 100, height: 36 }] as any);
  rpc.mockReset();
  close.mockReset();
  openConversation.mockReset();
  openPage.mockReset();
  native.privateMode = false;
  native.windowKind = "normal";
  native.setDefaultBrowser.mockClear();
  native.runtimeRestoreStatus.mockRejectedValue(new Error("onboarding must read installation.restoreStatus"));
  workspace = {
    connected: true,
    settings: { modelConfigured: true },
    pages: normalizePages([source] as never),
    runs: [],
    layout: {
      activeSpaceId: "space",
      spaces: [{ id: "space", name: "Personal", color: "slate", grain: 0, workspaceId: "workspace" }],
    },
    openConversation,
    activate,
    openBackgroundTab: openPage,
  };
  rpc.mockImplementation(async (method: string, params: any) => {
    if (method === "onboarding.get") return current;
    if (method === "onboarding.update") {
      current = {
        ...current,
        revision: current.revision + 1,
        ...(params.action === "replay" ? { status: "active", step: "welcome" } : {}),
        ...(params.action === "later" ? { status: "later" } : {}),
        ...(params.action === "finish" ? { status: "complete" } : {}),
        ...(params.action === "visit" ? { step: params.step } : {}),
      };
      return current;
    }
    if (method === "import.status") throw Object.assign(new Error("No import"), { code: "not_found" });
    if (method === "settings.set") {
      workspace.settings = {
        ...workspace.settings,
        ...params,
        agentPolicyRevision: (workspace.settings.agentPolicyRevision ?? 0) + 1,
      };
      return { ok: true };
    }
    if (method === "settings.get") return workspace.settings;
    if (method === "models.list") return { models: [] };
    if (method === "connectors.catalog") return { entries: [], access: [], bindings: {} };
    if (method === "installation.restoreStatus") return { pending: false };
    throw new Error(`Unexpected ${method}`);
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it("Cmd+Enter saves Finish later and restore focus without starting work", async () => {
  const trigger = document.createElement("button");
  trigger.textContent = "Setup";
  document.body.append(trigger);
  trigger.focus();
  await render(initial("welcome"));
  expect(document.activeElement?.textContent).toBe("Welcome to Aux");
  await act(async () =>
    document
      .querySelector("h1")!
      .dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", metaKey: true, bubbles: true, cancelable: true }),
      ),
  );
  expect(rpc).toHaveBeenCalledWith("onboarding.update", { revision: 0, action: "later" });
  expect(close).toHaveBeenCalledOnce();
  expect(
    rpc.mock.calls.every(
      ([method]) => method === "installation.restoreStatus" || String(method).startsWith("onboarding."),
    ),
  ).toBe(true);
  await act(async () => root.render(null));
  expect(document.activeElement).toBe(trigger);
  trigger.remove();
});

it("moves the step heading without scrolling the rail or footer out of the card", async () => {
  const focus = vi.spyOn(HTMLElement.prototype, "focus");
  await render(initial("model"));
  const scroller = document.querySelector(".onboarding-scroll");
  expect(scroller?.contains(document.querySelector("h1"))).toBe(true);
  expect(scroller?.contains(button("Continue"))).toBe(false);
  expect(scroller?.contains(button("3"))).toBe(false);
  expect(focus.mock.calls.every(([options]) => options?.preventScroll === true)).toBe(true);
  focus.mockClear();
  await act(async () => button("4").click());
  await act(async () => button("Finish setup").click());
  expect(current).toMatchObject({ status: "complete", step: "appearance" });
  expect(close).toHaveBeenCalledOnce();
  expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  focus.mockRestore();
});

it("shows model setup immediately and keeps data use optional without sending a model request", async () => {
  await render(initial("model"));
  expect(
    document.querySelector(".models-settings") ?? document.querySelector('[aria-label="Model provider"]'),
  ).toBeTruthy();
  expect(button("I’ve reviewed model data use")).toBeUndefined();
  expect(document.querySelector("details summary")?.textContent).toBe("Model data use and costs");
  expect(document.querySelector("details")?.open).toBe(false);
  expect(rpc.mock.calls.some(([method]) => method === "models.probe" || method === "runs.start")).toBe(false);
  expect(rpc).not.toHaveBeenCalledWith("installation.restoreStatus", {});
});

it("checks recovery only when opened and never blocks finishing setup", async () => {
  const previous = rpc.getMockImplementation()!;
  rpc.mockImplementation(async (method, params) => {
    if (method === "installation.restoreStatus") throw new Error("Unavailable");
    return previous(method, params);
  });
  await render(initial("welcome"));
  expect(rpc).not.toHaveBeenCalledWith("installation.restoreStatus", {});
  await act(async () => button("Recover an existing Aux Profile").click());
  expect(rpc).toHaveBeenCalledWith("installation.restoreStatus", {});
  expect(document.body.textContent).toContain("Recovery status is unavailable");
  await act(async () => button("4").click());
  expect(button("Finish setup").disabled).toBe(false);
  await act(async () => button("Finish setup").click());
  expect(close).toHaveBeenCalledOnce();
});

it("replays only through an explicit event and stays absent from private or disabled windows", async () => {
  current = { ...initial("welcome"), status: "later" };
  await act(async () => root.render(<OnboardingHost />));
  expect(document.querySelector("dialog")).toBeNull();
  await act(async () => requestOnboardingReplay());
  expect(document.querySelector('dialog[aria-label="Set up Aux"]')).toBeTruthy();
  await act(async () => root.render(<OnboardingHost enabled={false} />));
  expect(document.querySelector("dialog")).toBeNull();
  rpc.mockClear();
  native.privateMode = true;
  await act(async () => root.render(<OnboardingHost />));
  await act(async () => requestOnboardingReplay());
  expect(rpc).not.toHaveBeenCalled();
});

it("Escape leaves any setup step with resumable progress", async () => {
  await render(initial("model"));
  await act(async () =>
    document
      .querySelector("dialog")!
      .dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })),
  );
  expect(rpc).toHaveBeenCalledWith("onboarding.update", { revision: 0, action: "later" });
  expect(current.step).toBe("model");
  expect(close).toHaveBeenCalledOnce();
});

it("reuses four-browser review without discovering or importing on step entry", async () => {
  const previous = rpc.getMockImplementation()!;
  rpc.mockImplementation(async (method, params) => {
    if (method === "import.status") return null;
    if (method === "import.preview")
      return {
        sources: ["chrome", "arc", "safari", "firefox"].map((id) => ({
          id,
          label: id,
          profiles: ["Fixture"],
          categories: [],
          profileCategories: [
            { profileId: "Fixture", categories: [{ category: "history", available: true }] },
          ],
        })),
      };
    return previous(method, params);
  });
  await render(initial("import"));
  expect(rpc).toHaveBeenCalledWith("import.status", {});
  expect(rpc.mock.calls.some(([method]) => method === "import.preview" || method === "import.run")).toBe(
    false,
  );
  await act(async () => button("See what can be imported").click());
  const options = [...document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
  expect(options).toHaveLength(1);
  expect(options.every((input) => !input.checked)).toBe(true);
  const picker = document.querySelector<HTMLSelectElement>('[aria-label="Detected browser"]')!;
  expect([...picker.options].map((item) => item.value)).toEqual(["chrome", "arc", "safari", "firefox"]);
  for (const id of ["arc", "safari", "firefox"]) {
    await act(async () => {
      picker.value = id;
      picker.dispatchEvent(new Event("change", { bubbles: true }));
    });
    const choices = [...document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
    expect(choices).toHaveLength(1);
    expect(choices[0]!.checked).toBe(false);
  }
  expect(document.body.textContent).toContain("Keychain");
  expect(rpc.mock.calls.some(([method]) => method === "import.run")).toBe(false);
});

it("offers pasted Memory from the AI step without automatic capture or ingestion", async () => {
  await render(initial("model"));
  await act(async () => button("Import notes from another assistant").click());
  expect(document.querySelector('section[aria-label="Import pasted assistant notes"]')).toBeTruthy();
  expect(document.querySelector("textarea")?.value).toBe("");
  expect(rpc.mock.calls.some(([method]) => String(method).startsWith("memory."))).toBe(false);
});

it("replays an already open flow using the new saved revision and welcome step", async () => {
  current = initial("model");
  await act(async () => root.render(<OnboardingHost />));
  expect(document.querySelector("h1")?.textContent).toBe("Choose your AI model");
  await act(async () => requestOnboardingReplay());
  expect(document.querySelector("h1")?.textContent).toBe("Welcome to Aux");
  await act(async () => button("Continue").click());
  expect(rpc).toHaveBeenLastCalledWith("import.status", {});
  expect(rpc).toHaveBeenCalledWith("onboarding.update", { revision: 1, action: "visit", step: "import" });
});

it("coalesces repeated replay requests while loading progress", async () => {
  current = { ...initial("welcome"), status: "later" };
  await act(async () => root.render(<OnboardingHost />));
  let finish!: (value: OnboardingState) => void;
  const previous = rpc.getMockImplementation()!;
  rpc.mockImplementation((method, params) =>
    method === "onboarding.get"
      ? new Promise((resolve) => {
          finish = resolve;
        })
      : previous(method, params),
  );
  rpc.mockClear();
  await act(async () => {
    requestOnboardingReplay();
    requestOnboardingReplay();
  });
  expect(rpc.mock.calls).toEqual([["onboarding.get"]]);
  await act(async () => finish(current));
  expect(rpc.mock.calls.filter(([method]) => method === "onboarding.update")).toHaveLength(1);
  expect(document.querySelector("h1")?.textContent).toBe("Welcome to Aux");
});

it("ignores a stale startup response after an explicit replay has opened newer progress", async () => {
  current = { ...initial("welcome"), status: "later" };
  let finish!: (value: OnboardingState) => void;
  rpc.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await act(async () => root.render(<OnboardingHost />));
  await act(async () => requestOnboardingReplay());
  await act(async () => finish(initial("model")));
  expect(document.querySelector("h1")?.textContent).toBe("Welcome to Aux");
  expect(current.revision).toBe(1);
});

it("lets disconnected setup close without mutating saved progress or reopening on reconnect", async () => {
  current = initial("model");
  await act(async () => root.render(<OnboardingHost />));
  workspace.connected = false;
  await act(async () => root.render(<OnboardingHost />));
  expect(document.body.textContent).toContain("Aux is disconnected");
  rpc.mockClear();
  await act(async () => button("Finish later").click());
  expect(rpc).not.toHaveBeenCalled();
  workspace.connected = true;
  await act(async () => root.render(<OnboardingHost />));
  expect(document.querySelector("dialog")).toBeNull();
  expect(rpc).not.toHaveBeenCalled();
});

it.each(["quick-ask", "little"])(
  "never reads setup or replays it in a %s utility window",
  async (windowKind) => {
    native.windowKind = windowKind;
    await act(async () => root.render(<OnboardingHost />));
    await act(async () => requestOnboardingReplay());
    expect(rpc).not.toHaveBeenCalled();
  },
);

it("keeps import confirmation, exclusions, keychain and retry disclosures with concise progress copy", async () => {
  await render(initial("import"));
  const importer = document.querySelector(".import-setting")!;
  expect(importer.querySelectorAll(":scope > p")).toHaveLength(2);
  expect(importer.textContent?.replace(/\s+/g, " ")).toContain("Nothing is imported until you confirm.");
  expect(importer.textContent?.replace(/\s+/g, " ")).toContain(
    "Passwords transfer inside the native browser. Extensions reinstall from the Chrome Web Store with their own permission prompts. Cookies and agent permissions are not copied.",
  );
  for (const text of ["Folders and retries", "Keychain and macOS access"]) {
    const summary = [...importer.querySelectorAll("summary")].find((item) => item.textContent === text)!;
    expect(summary.closest("details")!.open).toBe(false);
    await act(async () => summary.click());
    expect(summary.closest("details")!.open).toBe(true);
  }
  expect(importer.textContent?.replace(/\s+/g, " ")).toContain(
    "Password or encrypted-tab import may ask macOS to unlock the source browser’s Safe Storage key.",
  );
  expect(importer.textContent?.replace(/\s+/g, " ")).toContain(
    "Check the app and purpose in the system prompt; you can cancel it. Keys and password text stay in the native browser.",
  );
  expect(importer.textContent?.replace(/\s+/g, " ")).toContain(
    "Existing bookmarks are not overwritten. A fresh import can add duplicate bookmarks or tabs.",
  );
  expect(document.body.textContent?.replace(/\s+/g, " ")).toContain(
    "Imports continue if you leave. Check progress here before retrying.",
  );
  expect(rpc.mock.calls.some(([method]) => method === "import.preview" || method === "import.run")).toBe(
    false,
  );
});

it("wraps the complete original diagnostic while keeping setup recovery usable", async () => {
  const diagnostic = "Owned source unavailable: /" + "x".repeat(500);
  const originalRpc = rpc.getMockImplementation()!;
  rpc.mockImplementation(async (method: string, params: any) => {
    if (method === "onboarding.update") throw new Error(diagnostic);
    return originalRpc(method, params);
  });
  await render(initial("welcome"));
  const step = document.querySelector<HTMLButtonElement>('button[aria-label="2. import"]')!;
  expect(step).not.toBeNull();
  await act(async () => step.click());
  const alert = [...document.querySelectorAll<HTMLElement>('[role="alert"]')].find((node) =>
    node.textContent?.includes(diagnostic),
  )!;
  expect(alert.querySelector("p")!.textContent).toBe(diagnostic);
  expect(alert.parentElement!.classList.contains("onboarding-scroll")).toBe(true);
  const require = createRequire(import.meta.url);
  const postcss = createRequire(require.resolve("vite"))("postcss");
  const css = postcss.parse(readFileSync(new URL("./onboarding.css", new URL(import.meta.url)), "utf8"));
  const rule = css.nodes
    .find((node: any) => node.name === "layer")
    .nodes.find((node: any) => node.selector?.includes('.onboarding-scroll > [role="alert"]'));
  expect(rule).toBeDefined();
  const style = document.createElement("style");
  style.textContent = rule.toString();
  document.head.append(style);
  try {
    expect(getComputedStyle(alert).minWidth).toBe("0");
    expect(getComputedStyle(alert).overflowWrap).toBe("anywhere");
    const retry = button("Reload setup progress");
    expect(retry.disabled).toBe(false);
    retry.focus();
    expect(document.activeElement).toBe(retry);
    await act(async () => retry.click());
    expect(document.querySelector('[role="alert"]')).toBeNull();
    expect(current.step).toBe("welcome");
    expect(current.revision).toBe(0);
    expect(close).not.toHaveBeenCalled();
    expect(openPage).not.toHaveBeenCalled();
    expect(openConversation).not.toHaveBeenCalled();
  } finally {
    style.remove();
  }
});

it("offers the real Auto mode in the AI step and saves only the original policy revision", async () => {
  workspace.settings = {
    ...workspace.settings,
    agentMode: "auto",
    agentPolicyRevision: 8,
    agentPolicies: [],
  };
  await render(initial("model"));
  expect(
    document.querySelector<HTMLSelectElement>('select[aria-label="Agent mode"]')!.selectedOptions[0]!
      .textContent,
  ).toBe("Auto");
  expect(document.body.textContent).toContain("Ask first is the default");
  expect(document.querySelector('button[aria-label*="permissions"]')).toBeNull();
  await act(async () => {
    const mode = document.querySelector<HTMLSelectElement>('select[aria-label="Agent mode"]')!;
    mode.value = "ask";
    mode.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(rpc).toHaveBeenCalledWith("settings.set", { agentMode: "ask", agentPolicyRevision: 8 });
  expect(rpc.mock.calls.some(([method]) => method === "models.probe" || method === "runs.start")).toBe(false);
});
