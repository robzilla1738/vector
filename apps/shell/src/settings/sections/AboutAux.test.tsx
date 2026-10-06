// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { COMMANDS } from "@aux/contracts";

const { capabilities } = vi.hoisted(() => ({
  capabilities: vi.fn(async () => ({
    buildId: "154.0.8037.58+abcdef012345+123456789abc",
    sourceCommit: "123456789abcdef0123456789abcdef012345678",
  })),
}));
const mocks = vi.hoisted(() => ({
  windowId: "about-A",
  privateMode: false,
  kind: "normal",
  producer: undefined as undefined | typeof capabilities,
}));
vi.mock("../../bridge", () => ({
  bridge: {
    get capabilities() {
      return mocks.producer ?? capabilities;
    },
    get windowId() {
      return mocks.windowId;
    },
    get privateMode() {
      return mocks.privateMode;
    },
    get windowKind() {
      return mocks.kind;
    },
  },
  inMock: true,
  inNativeHost: false,
}));
vi.mock("../../commands", async () => {
  const { invokeScopedControl } = await import("../../scoped-control-commands");
  return {
    executeCommand: vi.fn((command, context) => {
      try {
        return Promise.resolve(invokeScopedControl(command, context));
      } catch (reason) {
        return Promise.reject(reason);
      }
    }),
  };
});

import { AboutAuxSetting } from "./AboutAux";

it("shows the installed Chromium version and build identity", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  const root = createRoot(container);
  try {
    await act(async () => root.render(<AboutAuxSetting active />));
    expect(capabilities).toHaveBeenCalledOnce();
    expect(container.textContent).toContain("Chromium 154.0.8037.58");
    expect(container.textContent).toContain("Build abcdef01");
    expect(container.textContent).toContain("Source 12345678");
  } finally {
    await act(async () => root.unmount());
    vi.unstubAllGlobals();
  }
});

const installed = {
  buildId: "154.0.8037.58+abcdef012345+123456789abc",
  sourceCommit: "123456789abcdef0123456789abcdef012345678",
};
let host: HTMLDivElement, currentRoot: ReturnType<typeof createRoot>;
beforeEach(() => {
  capabilities.mockReset();
  capabilities.mockResolvedValue(installed);
  mocks.windowId = "about-A";
  mocks.privateMode = false;
  mocks.kind = "normal";
  mocks.producer = undefined;
});
afterEach(async () => {
  if (currentRoot) await act(async () => currentRoot.unmount());
  host?.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function mount() {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 36, height: 36 } as DOMRect,
  ] as unknown as DOMRectList);
  host = document.createElement("div");
  document.body.append(host);
  currentRoot = createRoot(host);
  await act(async () => currentRoot.render(<AboutAuxSetting active />));
}
function held<T>() {
  let resolve!: (value: T) => void, reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
it("recovers from an original synchronous read failure, safely discloses full diagnostics and retries", async () => {
  const failure = new Error("native <script>diagnostic</script>\n" + "UnbrokenDiagnostic".repeat(30));
  failure.stack = failure.message;
  capabilities.mockImplementationOnce(() => {
    throw failure;
  });
  await mount();
  expect(host.textContent).toContain("Could not read the installed build.");
  const details = host.querySelector("details")!;
  const summary = host.querySelector<HTMLElement>("summary")!;
  expect(details.open).toBe(false);
  expect(host.querySelector("pre")!.textContent).toBe(failure.stack);
  expect(host.querySelector("script")).toBeNull();
  expect(host.querySelector("pre")!.style.whiteSpace).toBe("pre-wrap");
  expect(host.querySelector("pre")!.style.overflowWrap).toBe("anywhere");
  summary.focus();
  await act(async () => summary.click());
  expect(details.open).toBe(true);
  expect(document.activeElement).toBe(summary);
  await act(async () => summary.click());
  expect(details.open).toBe(false);
  const retry = host.querySelector<HTMLButtonElement>('button[data-command-id="retry-installed-build"]')!;
  retry.focus();
  await act(async () => retry.click());
  expect(capabilities).toHaveBeenCalledTimes(2);
  expect(host.textContent).toContain("Build abcdef01");
  expect(host.querySelector('[role="alert"]')).toBeNull();
});
it("feature availability remains a registered original disclosure without another native read", async () => {
  await mount();
  const summary = host.querySelector<HTMLElement>("summary")!,
    details = host.querySelector("details")!;
  summary.focus();
  await act(async () => summary.click());
  expect(details.open).toBe(true);
  await act(async () => summary.click());
  expect(details.open).toBe(false);
  expect(capabilities).toHaveBeenCalledOnce();
  expect(host.querySelector('[aria-label="Installed feature availability"]')).not.toBeNull();
  for (const id of [
    "retry-installed-build",
    "toggle-installed-build-error-details",
    "toggle-installed-feature-availability",
  ] as const) {
    const command = COMMANDS.find((item) => item.id === id)!;
    expect(command.handler).toBe("shell");
    expect("palette" in command && command.palette).toBe(false);
    expect(command.bindings).toEqual([]);
  }
});
it.each(["window", "private", "incarnation", "active"])(
  "irreversibly retires a held original read through %s ABA",
  async (field) => {
    const original = held<typeof installed>();
    capabilities.mockImplementationOnce(() => original.promise);
    await mount();
    if (field === "window") mocks.windowId = "about-B";
    if (field === "private") mocks.privateMode = true;
    if (field === "incarnation")
      mocks.producer = vi.fn(async () => ({ ...installed, buildId: "154+new-incarnation" }));
    await act(async () => currentRoot.render(<AboutAuxSetting active={field !== "active"} />));
    mocks.windowId = "about-A";
    mocks.privateMode = false;
    mocks.producer = undefined;
    await act(async () => currentRoot.render(<AboutAuxSetting active />));
    await act(async () => original.resolve({ ...installed, buildId: "154+retired-original" }));
    expect(host.textContent).not.toContain("retired");
    expect(host.textContent).toContain("Build abcdef01");
  },
);
it("retired original rejection cannot disclose protected diagnostics in the new owner", async () => {
  const original = held<typeof installed>();
  capabilities.mockImplementationOnce(() => original.promise);
  await mount();
  mocks.windowId = "about-B";
  await act(async () => currentRoot.render(<AboutAuxSetting active />));
  await act(async () => original.reject(new Error("retired protected diagnostic")));
  expect(host.textContent).not.toContain("protected");
  expect(host.textContent).toContain("Build abcdef01");
});
it("same-tick Retry reserves the original read once while preserving asynchronous recovery", async () => {
  capabilities.mockRejectedValueOnce(new Error("native rejection"));
  await mount();
  const next = held<typeof installed>();
  capabilities.mockImplementationOnce(() => next.promise);
  const retry = host.querySelector<HTMLButtonElement>("button")!;
  retry.focus();
  await act(async () => {
    retry.click();
    retry.click();
  });
  expect(capabilities).toHaveBeenCalledTimes(2);
  expect(host.textContent).toContain("Reading installed build");
  await act(async () => next.resolve(installed));
  expect(host.textContent).toContain("Build abcdef01");
});
