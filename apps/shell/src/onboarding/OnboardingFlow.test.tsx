// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { OnboardingState, PageTarget } from "@aux/contracts";
import { OnboardingFlow } from "./OnboardingFlow";
import OnboardingHost from "./OnboardingHost";
import { requestOnboardingReplay } from "./replay";

const rpc = vi.hoisted(() => vi.fn());
const openConversation = vi.hoisted(() => vi.fn());
const openPage = vi.hoisted(() => vi.fn());
const activate = vi.hoisted(() => vi.fn());
const native = vi.hoisted(() => ({
  privateMode: false,
  quickAskMode: false,
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
  useStore: Object.assign((selector: (state: any) => unknown) => selector(workspace), {
    getState: () => workspace,
    setState: (update: any) => {
      workspace = { ...workspace, ...(typeof update === "function" ? update(workspace) : update) };
    },
  }),
}));
const initial = (step: OnboardingState["step"]): OnboardingState => ({
  version: 1,
  revision: 0,
  status: "active",
  step,
  visited: [],
  skipped: [],
  disclosureVersion: 1,
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
async function choosePage() {
  const select = [...document.querySelectorAll("select")].find((node) =>
    [...node.options].some((option) => option.value === source.pageId),
  )!;
  await act(async () => {
    select.value = source.pageId;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  rpc.mockReset();
  close.mockReset();
  openConversation.mockReset();
  openPage.mockReset();
  native.privateMode = false;
  native.quickAskMode = false;
  native.setDefaultBrowser.mockClear();
  native.runtimeRestoreStatus.mockRejectedValue(new Error("onboarding must read installation.restoreStatus"));
  workspace = {
    connected: true,
    settings: { modelConfigured: true },
    pages: [source],
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
        ...(params.action === "disclosure" ? { disclosureVersion: 1 } : {}),
        ...(params.action === "replay" ? { status: "active", step: "welcome" } : {}),
        ...(params.action === "later" ? { status: "later" } : {}),
        ...(params.action === "visit" ? { step: params.step } : {}),
      };
      return current;
    }
    if (method === "import.status") throw Object.assign(new Error("No import"), { code: "not_found" });
    if (method === "models.list") return { models: [] };
    if (method === "connectors.catalog") return { entries: [], access: [] };
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
});

it("Cmd+Enter saves Finish later and restore focus without starting work", async () => {
  const trigger = document.createElement("button");
  trigger.textContent = "Setup";
  document.body.append(trigger);
  trigger.focus();
  await render(initial("welcome"));
  expect(document.activeElement?.textContent).toBe("A browser for what comes next");
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
  await render(initial("permissions"));
  const scroller = document.querySelector(".onboarding-scroll");
  expect(scroller?.contains(document.querySelector("h1"))).toBe(true);
  expect(scroller?.contains(button("Continue"))).toBe(false);
  expect(scroller?.contains(button("6"))).toBe(false);
  expect(focus.mock.calls.every(([options]) => options?.preventScroll === true)).toBe(true);
  focus.mockClear();
  await act(async () => button("7").click());
  expect(document.querySelector("h1")?.textContent).toBe("Start with one useful question");
  expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  focus.mockRestore();
});

it("shows data use before mounting model setup and makes no model request on acknowledgment", async () => {
  await render({ ...initial("model"), disclosureVersion: 0 });
  expect(document.body.textContent).toContain("Meta use prompts and completions");
  expect(rpc).not.toHaveBeenCalledWith("models.list", expect.anything());
  await act(async () => button("I’ve reviewed model data use").click());
  expect(rpc).toHaveBeenCalledWith("onboarding.update", { revision: 0, action: "disclosure" });
  expect(rpc.mock.calls.some(([method]) => method === "models.probe" || method === "onboarding.start")).toBe(
    false,
  );
  expect(document.body.textContent).toContain("connection test sends a model request only");
});

it("requires explicit exact-page review and dispatches a double-click once into the first chat", async () => {
  await render(initial("postcard"));
  expect(button("Start this chat").disabled).toBe(true);
  await choosePage();
  expect(button("Start this chat").disabled).toBe(true);
  await act(async () => document.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
  expect(button("Start this chat").disabled).toBe(false);
  let finish!: () => void;
  const previous = rpc.getMockImplementation()!;
  rpc.mockImplementation(async (method, params) => {
    if (method !== "onboarding.start") return previous(method, params);
    await new Promise<void>((resolve) => {
      finish = resolve;
    });
    return {
      state: { ...current, status: "complete" },
      run: { runId: "first-run", config: { chatId: "first-chat" } },
    };
  });
  const start = button("Start this chat");
  await act(async () => {
    start.click();
    start.click();
  });
  expect(rpc.mock.calls.filter(([method]) => method === "onboarding.start")).toHaveLength(1);
  expect(rpc).toHaveBeenCalledWith("onboarding.start", {
    revision: 0,
    postcardId: "understand",
    page: {
      pageId: source.pageId,
      url: source.url,
      documentEpoch: 1,
      sessionId: "session",
    },
  });
  await act(async () => finish());
  expect(openConversation).toHaveBeenCalledWith("first-run");
  expect(close).toHaveBeenCalledOnce();
});

it("clears the page review after navigation and refuses a postcard when recovery is staged", async () => {
  const previous = rpc.getMockImplementation()!;
  rpc.mockImplementation(async (method, params) => {
    if (method === "installation.restoreStatus") return { pending: true };
    return previous(method, params);
  });
  await render(initial("postcard"));
  await choosePage();
  await act(async () => document.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
  expect(button("Start this chat").disabled).toBe(true);
  workspace.pages = [{ ...source, documentEpoch: 2 }];
  await act(async () => root.render(<OnboardingFlow initialState={current} onClose={close} />));
  expect(document.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked).toBe(false);
  expect(document.body.textContent).toContain("Recovery is staged");
});

it("keeps cooldown on replay and never automatically invokes the native default-browser prompt", async () => {
  await render({ ...initial("default"), defaultBrowserPromptedAt: Date.now() });
  expect(button("Make Aux the default browser").disabled).toBe(true);
  expect(native.setDefaultBrowser).not.toHaveBeenCalled();
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
  await render(initial("permissions"));
  await act(async () =>
    document
      .querySelector("dialog")!
      .dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })),
  );
  expect(rpc).toHaveBeenCalledWith("onboarding.update", { revision: 0, action: "later" });
  expect(current.step).toBe("permissions");
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
  expect(options).toHaveLength(4);
  expect(options.every((input) => !input.checked)).toBe(true);
  expect(document.body.textContent).toContain("Keychain");
  expect(rpc.mock.calls.some(([method]) => method === "import.run")).toBe(false);
});

it("lets the owner view the selected page before committing its context", async () => {
  await render(initial("postcard"));
  await choosePage();
  await act(async () => button("View selected page; finish setup later").click());
  expect(activate).toHaveBeenCalledWith(source.pageId);
  expect(current).toMatchObject({ status: "later", step: "postcard" });
  expect(close).toHaveBeenCalledOnce();
  expect(rpc.mock.calls.some(([method]) => method === "onboarding.start")).toBe(false);
});

it("offers pasted Memory from permissions without automatic capture or ingestion", async () => {
  await render(initial("permissions"));
  await act(async () => button("Import notes from another assistant").click());
  expect(document.querySelector('section[aria-label="Import pasted assistant notes"]')).toBeTruthy();
  expect(document.querySelector("textarea")?.value).toBe("");
  expect(rpc.mock.calls.some(([method]) => String(method).startsWith("memory."))).toBe(false);
});

it("replays an already open flow using the new saved revision and welcome step", async () => {
  current = initial("permissions");
  await act(async () => root.render(<OnboardingHost />));
  expect(document.querySelector("h1")?.textContent).toBe("You stay in charge");
  await act(async () => requestOnboardingReplay());
  expect(document.querySelector("h1")?.textContent).toBe("A browser for what comes next");
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
  expect(document.querySelector("h1")?.textContent).toBe("A browser for what comes next");
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
  await act(async () => finish(initial("permissions")));
  expect(document.querySelector("h1")?.textContent).toBe("A browser for what comes next");
  expect(current.revision).toBe(1);
});

it("lets disconnected setup close without mutating saved progress or reopening on reconnect", async () => {
  current = initial("permissions");
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

it("never reads setup or replays it in a Quick Ask utility window", async () => {
  native.quickAskMode = true;
  await act(async () => root.render(<OnboardingHost />));
  await act(async () => requestOnboardingReplay());
  expect(rpc).not.toHaveBeenCalled();
});

it("requires recovery readiness and rechecks the selected window before first-chat dispatch", async () => {
  const previous = rpc.getMockImplementation()!;
  const restores = [
    async () => {
      throw new Error("native status unavailable");
    },
    async () => ({ pending: false }),
    async () => {
      workspace.pages = [{ ...source, windowId: "other-window" }];
      return { pending: false };
    },
  ];
  rpc.mockImplementation(async (method, params) => {
    if (method === "installation.restoreStatus") {
      const next = restores.shift();
      if (!next) throw new Error("unexpected restore status read");
      return next();
    }
    return previous(method, params);
  });
  await render(initial("postcard"));
  await choosePage();
  await act(async () => document.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
  expect(button("Start this chat").disabled).toBe(true);
  expect(document.body.textContent).toContain("Recovery readiness is unavailable");
  await act(async () => button("Retry recovery check").click());
  expect(button("Start this chat").disabled).toBe(false);
  await act(async () => button("Start this chat").click());
  expect(rpc.mock.calls.some(([method]) => method === "onboarding.start")).toBe(false);
  expect(document.body.textContent).toContain("selected page changed during review");
});

it("offers only idle owner pages in this window for explicit review", async () => {
  workspace.pages = [
    source,
    { ...source, pageId: "other-window", windowId: "other" },
    { ...source, pageId: "loading", loading: true },
    { ...source, pageId: "agent", controller: "agent" },
  ];
  await render(initial("postcard"));
  const select = [...document.querySelectorAll("select")].find((node) =>
    [...node.options].some((option) => option.value === source.pageId),
  )!;
  expect([...select.options].map((option) => option.value)).toEqual(["", source.pageId]);
});
