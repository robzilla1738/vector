// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { desktopContextDefaults, type DesktopContextSnapshot } from "@aux/contracts/desktop-context";
import { invokeScopedControl } from "../../scoped-control-commands";
import { DesktopContextSettings } from "./DesktopContext";
const fixture = vi.hoisted(() => ({
  call: vi.fn(),
  privateMode: false,
  windowId: "original",
  layout: { spaces: [{ id: "space", workspaceId: "workspace", name: "Synthetic" }] },
}));
vi.mock("../../bridge", () => ({
  bridge: {
    get privateMode() {
      return fixture.privateMode;
    },
    get windowId() {
      return fixture.windowId;
    },
  },
}));
vi.mock("../../store", () => ({
  call: fixture.call,
  useStore: Object.assign((selector: (state: unknown) => unknown) => selector({ layout: fixture.layout }), {
    getState: () => ({ layout: fixture.layout }),
  }),
  errToast: vi.fn(),
}));
vi.mock("../../commands", () => ({
  executeCommand: (command: string, context: Parameters<typeof invokeScopedControl>[1]) =>
    invokeScopedControl(command, context),
}));
vi.mock("../../ui/dialog", () => ({ useConfirm: () => ({ confirm: async () => true, confirmation: null }) }));
let host: HTMLDivElement, root: ReturnType<typeof createRoot>, snapshot: DesktopContextSnapshot;
const button = (label: string) =>
  [...host.querySelectorAll("button")].find((node) => node.textContent === label)!;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  fixture.privateMode = false;
  fixture.windowId = "original";
  snapshot = {
    settings: desktopContextDefaults(),
    status: {
      supported: true,
      phase: "off",
      accessibilityTrusted: false,
      ocrSupported: true,
      pickerGrantActive: false,
      leaseId: null,
      configurationRevision: 0,
      consentRevision: 0,
      dropped: 0,
      reason: "none",
    },
    storedCount: 0,
    storedBytes: 0,
  };
  fixture.call.mockReset().mockImplementation(async (method: string, input: any) => {
    if (method === "desktopContext.settings") return snapshot;
    if (method === "desktopContext.apps")
      return [{ bundleId: "test.editor", displayName: "Synthetic Editor" }];
    if (method === "desktopContext.configure") {
      snapshot = { ...snapshot, settings: { ...input.settings, revision: input.expectedRevision + 1 } };
      return snapshot;
    }
    if (method === "desktopContext.permission") throw new Error("macOS access is not granted");
    throw new Error(`Unexpected ${method}`);
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("renders separate off-by-default capture consent without requesting OS access", async () => {
  await act(async () => root.render(<DesktopContextSettings active />));
  expect((host.querySelector('input[type="checkbox"]') as HTMLInputElement).checked).toBe(false);
  expect(host.textContent).toContain("separate from Memory");
  expect(fixture.call.mock.calls.map(([method]) => method)).toEqual([
    "desktopContext.settings",
    "desktopContext.apps",
  ]);
  await act(async () => (host.querySelector('input[type="checkbox"]') as HTMLInputElement).click());
  expect(fixture.call).toHaveBeenCalledTimes(2);
});
it("saves consent only through the original governed control and exact displayed revision", async () => {
  snapshot.settings = {
    ...snapshot.settings,
    workspaceId: "workspace",
    selectedApps: [{ bundleId: "test.editor", displayName: "Synthetic Editor" }],
  };
  await act(async () => root.render(<DesktopContextSettings active />));
  await act(async () => (host.querySelector('input[type="checkbox"]') as HTMLInputElement).click());
  await act(async () => button("Save desktop context").click());
  expect(fixture.call).toHaveBeenCalledWith(
    "desktopContext.configure",
    expect.objectContaining({
      expectedRevision: 0,
      settings: expect.objectContaining({ enabled: true, workspaceId: "workspace", ocrEnabled: false }),
    }),
  );
  expect(fixture.call.mock.calls.some(([method]) => method === "desktopContext.permission")).toBe(false);
});
it("refuses an old permission control after the native window owner changes", async () => {
  snapshot.settings = {
    ...snapshot.settings,
    enabled: true,
    workspaceId: "workspace",
    selectedApps: [{ bundleId: "test.editor", displayName: "Synthetic Editor" }],
  };
  await act(async () => root.render(<DesktopContextSettings active />));
  fixture.windowId = "replacement";
  await act(async () => button("Request access").click());
  expect(fixture.call.mock.calls.some(([method]) => method === "desktopContext.permission")).toBe(false);
});
it("does not report a granted permission when the system request fails", async () => {
  snapshot.settings = {
    ...snapshot.settings,
    enabled: true,
    workspaceId: "workspace",
    selectedApps: [{ bundleId: "test.editor", displayName: "Synthetic Editor" }],
  };
  await act(async () => root.render(<DesktopContextSettings active />));
  await act(async () => button("Request access").click());
  expect(host.textContent).toContain("macOS access is not granted");
  expect(snapshot.status.accessibilityTrusted).toBe(false);
});
it("renders no surface or source request in a private window", async () => {
  fixture.privateMode = true;
  await act(async () => root.render(<DesktopContextSettings active />));
  expect(host.textContent).toBe("");
  expect(fixture.call).not.toHaveBeenCalled();
});
it("discards a permission response from before hiding and reopening the same Settings surface", async () => {
  snapshot.settings = {
    ...snapshot.settings,
    enabled: true,
    workspaceId: "workspace",
    selectedApps: [{ bundleId: "test.editor", displayName: "Synthetic Editor" }],
  };
  let release!: (value: DesktopContextSnapshot) => void;
  const held = new Promise<DesktopContextSnapshot>((resolve) => {
    release = resolve;
  });
  await act(async () => root.render(<DesktopContextSettings active />));
  fixture.call.mockImplementationOnce(() => held);
  await act(async () => button("Request access").click());
  await act(async () => root.render(<DesktopContextSettings active={false} />));
  await act(async () => root.render(<DesktopContextSettings active />));
  await act(async () =>
    release({
      ...snapshot,
      status: { ...snapshot.status, accessibilityTrusted: true, phase: "running", leaseId: "stale" },
    }),
  );
  expect(host.textContent).toContain("Approve Aux in macOS Accessibility");
  expect(button("Refresh status").disabled).toBe(false);
});
it("restores every unsaved consent choice on Cancel without calling the service", async () => {
  await act(async () => root.render(<DesktopContextSettings active />));
  const capture = host.querySelector<HTMLInputElement>(
      '[aria-label="Allow desktop context for the selected apps"]',
    )!,
    ocr = host.querySelector<HTMLInputElement>(
      '[aria-label="Allow local OCR for a window selected with macOS"]',
    )!,
    app = host.querySelector<HTMLInputElement>('[aria-label="Include Synthetic Editor"]')!,
    space = host.querySelector<HTMLSelectElement>('[aria-label="Desktop context Space"]')!;
  expect(capture.getAttribute("role")).toBe("switch");
  await act(async () => {
    capture.click();
    ocr.click();
    app.click();
  });
  await act(async () => {
    space.value = "workspace";
    space.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(button("Cancel").disabled).toBe(false);
  await act(async () => button("Cancel").click());
  expect(capture.checked).toBe(false);
  expect(ocr.checked).toBe(false);
  expect(app.checked).toBe(false);
  expect(space.value).toBe("");
  expect(button("Save desktop context").disabled).toBe(true);
  expect(fixture.call).toHaveBeenCalledTimes(2);
});
it("keeps system permission controls tied to saved settings rather than unsaved switches", async () => {
  snapshot.settings = {
    ...snapshot.settings,
    workspaceId: "workspace",
    selectedApps: [{ bundleId: "test.editor", displayName: "Synthetic Editor" }],
  };
  await act(async () => root.render(<DesktopContextSettings active />));
  await act(async () =>
    host
      .querySelector<HTMLInputElement>('[aria-label="Allow desktop context for the selected apps"]')!
      .click(),
  );
  await act(async () =>
    host
      .querySelector<HTMLInputElement>('[aria-label="Allow local OCR for a window selected with macOS"]')!
      .click(),
  );
  expect(button("Request access").disabled).toBe(true);
  expect(button("Choose window…").disabled).toBe(true);
  expect(fixture.call).toHaveBeenCalledTimes(2);
  await act(async () => button("Save desktop context").click());
  expect(button("Request access").disabled).toBe(false);
  expect(button("Choose window…").disabled).toBe(false);
  expect(fixture.call.mock.calls.some(([method]) => method === "desktopContext.permission")).toBe(false);
});
it("does not allow saving enabled capture without an explicit destination and selected app", async () => {
  await act(async () => root.render(<DesktopContextSettings active />));
  await act(async () =>
    host
      .querySelector<HTMLInputElement>('[aria-label="Allow desktop context for the selected apps"]')!
      .click(),
  );
  expect(button("Save desktop context").disabled).toBe(true);
  await act(async () =>
    host.querySelector<HTMLInputElement>('[aria-label="Include Synthetic Editor"]')!.click(),
  );
  expect(button("Save desktop context").disabled).toBe(true);
  expect(fixture.call.mock.calls.some(([method]) => method === "desktopContext.configure")).toBe(false);
});
