import { normalizePages } from "../store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { PageTarget } from "@aux/contracts";
import { PageRecovery } from "./PageRecovery";
import { invokeScopedControl } from "../scoped-control-commands";
const native = vi.hoisted(() => ({
  windowId: "main",
  windowKind: "normal",
  privateMode: false,
  useHttp: vi.fn(),
  proceedInsecure: vi.fn(),
}));
const rpc = vi.hoisted(() => vi.fn());
const errors = vi.hoisted(() => vi.fn());
const focus = vi.hoisted(() => vi.fn());
let state: any, page: PageTarget, host: HTMLDivElement, root: ReturnType<typeof createRoot>;
vi.mock("../bridge", () => ({ bridge: native }));
vi.mock("../store", () => ({ call: rpc, errToast: errors, useStore: { getState: () => state } }));
vi.mock("../commands", () => ({
  executeCommand: (id: string, invocation: any) => {
    try {
      return Promise.resolve(invokeScopedControl(id, invocation));
    } catch (reason) {
      return Promise.reject(reason);
    }
  },
}));
const held = <T,>() => {
  let resolve!: (v: T) => void, reject!: (e: unknown) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
};
const button = (label: string) =>
  [...host.querySelectorAll<HTMLButtonElement>("button")].find((b) => b.textContent === label)!;
async function render() {
  await act(async () => root.render(<PageRecovery page={page} />));
}
async function click(label: string) {
  await act(async () => button(label).click());
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{ width: 100, height: 36 }] as any);
  native.windowId = "main";
  native.windowKind = "normal";
  native.privateMode = false;
  native.useHttp.mockReset().mockResolvedValue(true);
  native.proceedInsecure.mockReset().mockResolvedValue(true);
  rpc.mockReset().mockResolvedValue({ actual: "ack" });
  errors.mockReset();
  focus.mockReset();
  page = {
    pageId: "page",
    windowId: "main",
    backend: "aux",
    targetId: "original-target",
    url: "https://fixture.test/",
    title: "Fixture",
    sessionId: "original-session",
    documentEpoch: 1,
    lastRevision: 0,
    viewStatus: "visible",
    controller: "none",
    controllerEpoch: 0,
    ownedByRuntime: false,
    createdAt: 1,
    lastActiveAt: 1,
    canGoBack: true,
    navigationError: { url: "https://fixture.test/", code: -105, message: "ERR_NAME_NOT_RESOLVED" },
  };
  state = {
    mode: "focus",
    pages: normalizePages([page] as never),
    activePageId: page.pageId,
    focusCommandBar: focus,
  };
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
it("uses registered original Retry/Back/Edit and exact native args/ACK", async () => {
  await render();
  button("Try again").focus();
  let ack: any;
  await act(async () => {
    ack = invokeScopedControl("retry-page-recovery");
  });
  expect(await ack).toEqual({ actual: "ack" });
  expect(rpc).toHaveBeenCalledWith("pages.reload", { pageId: "page" });
  await click("Go back");
  expect(rpc).toHaveBeenCalledWith("pages.back", { pageId: "page" });
  await click("Edit address");
  expect(focus).toHaveBeenCalledTimes(1);
});
it("keeps original full recovery and long URL diagnostics in controlled remappable details", async () => {
  page = {
    ...page,
    navigationError: {
      url: "https://fixture.test/" + "long".repeat(150),
      code: -200,
      message: "ERR_CERT_COMMON_NAME_INVALID <full diagnostic>",
    },
  };
  state.pages = normalizePages([page] as never);
  await render();
  const summary = host.querySelector("summary")!;
  expect(host.querySelector("details")!.open).toBe(false);
  summary.focus();
  await act(async () => invokeScopedControl("toggle-page-connection-details"));
  expect(host.querySelector("details")!.open).toBe(true);
  expect(host.querySelector(".selectable")!.textContent).toBe(page.navigationError!.url);
  expect(host.querySelector("details p")!.textContent).toBe(page.navigationError!.message + " (-200)");
  expect(host.querySelector("full")).toBeNull();
  await act(async () => summary.click());
  expect(host.querySelector("details")!.open).toBe(false);
  expect(native.proceedInsecure).not.toHaveBeenCalled();
});
it("preserves separate original HTTP fallback/certificate producers and refuses foreign command purposes", async () => {
  page = {
    ...page,
    navigationError: {
      url: "https://fixture.test/",
      code: -7,
      message: "Connection failed",
      upgradedFrom: "http://fixture.test/",
    },
  };
  state.pages = normalizePages([page] as never);
  await render();
  await click("Continue over HTTP");
  expect(native.useHttp).toHaveBeenCalledWith("page", "http://fixture.test/");
  expect(native.proceedInsecure).not.toHaveBeenCalled();
  expect(() => invokeScopedControl("proceed-page-certificate")).toThrow();
  page = {
    ...page,
    documentEpoch: 2,
    navigationError: { url: "https://fixture.test/", code: -200, message: "ERR_CERT_AUTHORITY_INVALID" },
  };
  state.pages = normalizePages([page] as never);
  await render();
  await click("Proceed anyway (unsafe)");
  expect(native.proceedInsecure).toHaveBeenCalledWith("page", "https://fixture.test/");
  expect(() => invokeScopedControl("continue-page-over-http")).toThrow();
});
it("reserves pending synchronously and delivers actual ACK without clearing a new owner", async () => {
  await render();
  const old = held<any>();
  rpc.mockReturnValueOnce(old.promise);
  button("Try again").focus();
  let completion: any;
  await act(async () => {
    completion = invokeScopedControl("retry-page-recovery");
    expect(() => invokeScopedControl("retry-page-recovery")).toThrow("current");
  });
  page = { ...page, documentEpoch: 2 };
  state.pages = normalizePages([page] as never);
  await render();
  const next = held<any>();
  rpc.mockReturnValueOnce(next.promise);
  await click("Try again");
  await act(async () => old.resolve({ old: "actual ACK" }));
  expect(await completion).toEqual({ old: "actual ACK" });
  expect(button("Trying…").disabled).toBe(true);
  await act(async () => next.resolve({ new: "ACK" }));
  expect(button("Try again").disabled).toBe(false);
});
it("retains original failure and refuses old document/window ABA delivery", async () => {
  await render();
  const old = held<any>();
  rpc.mockReturnValueOnce(old.promise);
  button("Try again").focus();
  let completion: any;
  await act(async () => {
    completion = invokeScopedControl("retry-page-recovery");
  });
  const reason = new Error("original private diagnostic");
  const observed = completion.catch((e: unknown) => e);
  native.privateMode = true;
  await render();
  native.privateMode = false;
  await render();
  await act(async () => old.reject(reason));
  expect(await observed).toBe(reason);
  expect(host.textContent).not.toContain(reason.message);
  expect(errors).not.toHaveBeenCalled();
});
it("refuses missing/duplicate/foreign/current-document changes before any producer dispatch", async () => {
  await render();
  button("Try again").focus();
  state.pages = normalizePages([{ ...page, documentEpoch: 9 }] as never);
  expect(() => invokeScopedControl("retry-page-recovery")).toThrow("current");
  state.pages = normalizePages([page, page] as never);
  expect(() => invokeScopedControl("retry-page-recovery")).toThrow("current");
  state.pages = normalizePages([{ ...page, windowId: "foreign" }] as never);
  expect(() => invokeScopedControl("retry-page-recovery")).toThrow("current");
  state.pages = normalizePages([] as never);
  expect(() => invokeScopedControl("retry-page-recovery")).toThrow("current");
  expect(rpc).not.toHaveBeenCalled();
  expect(native.useHttp).not.toHaveBeenCalled();
});
it("shows active original failed reload diagnostics and retains original rejection identity", async () => {
  await render();
  const reason = new Error("complete <diagnostic>");
  rpc.mockRejectedValueOnce(reason);
  button("Try again").focus();
  let completion: any;
  await act(async () => {
    completion = invokeScopedControl("retry-page-recovery");
    await expect(completion).rejects.toBe(reason);
  });
  expect(host.querySelector('[role="alert"]')!.textContent).toBe(
    "Couldn’t reload this tab. complete <diagnostic>",
  );
  expect(host.querySelector("diagnostic")).toBeNull();
});
it("preserves original recovery DOM order, attributes and registered actual button owners across all states", async () => {
  const cases = [
    {
      error: page.navigationError,
      status: "visible",
      labels: ["Try again", "Edit address", "Go back"],
      ids: ["retry-page-recovery", "edit-page-recovery-address", "back-page-recovery"],
      classes: ["btn primary", "btn", "btn"],
    },
    {
      error: {
        url: "https://fixture.test/",
        code: -107,
        message: "ERR_SSL_PROTOCOL_ERROR",
        upgradedFrom: "http://fixture.test/",
      },
      status: "visible",
      labels: ["Try again", "Edit address", "Go back", "Continue over HTTP"],
      ids: [
        "retry-page-recovery",
        "edit-page-recovery-address",
        "back-page-recovery",
        "continue-page-over-http",
      ],
      classes: ["btn primary", "btn", "btn", "btn"],
    },
    {
      error: { url: "https://fixture.test/", code: -202, message: "ERR_CERT_AUTHORITY_INVALID" },
      status: "visible",
      labels: ["Try again", "Edit address", "Go back", "Proceed anyway (unsafe)"],
      ids: [
        "retry-page-recovery",
        "edit-page-recovery-address",
        "back-page-recovery",
        "proceed-page-certificate",
      ],
      classes: ["btn primary", "btn", "btn", "btn ghost"],
    },
    {
      error: undefined,
      status: "crashed",
      labels: ["Reload", "Edit address", "Go back"],
      ids: ["retry-page-recovery", "edit-page-recovery-address", "back-page-recovery"],
      classes: ["btn primary", "btn", "btn"],
    },
  ];
  for (const row of cases) {
    page = { ...page, navigationError: row.error, viewStatus: row.status } as PageTarget;
    state.pages = normalizePages([page] as never);
    await render();
    const controls = [...host.querySelectorAll<HTMLButtonElement>(".empty-actions > button")];
    expect(controls.map((control) => control.textContent)).toEqual(row.labels);
    expect(controls.map((control) => control.dataset.commandId)).toEqual(row.ids);
    expect(controls.map((control) => control.className)).toEqual(row.classes);
    expect(controls.every((control) => !control.disabled)).toBe(true);
    expect(controls.every((control) => control.parentElement?.className === "empty-actions")).toBe(true);
    expect(host.querySelectorAll("summary")).toHaveLength(row.error ? 1 : 0);
    await click("Edit address");
  }
  expect(focus).toHaveBeenCalledTimes(cases.length);
});
it("keeps the original focused button DOM and disabled state through an actual held Retry completion", async () => {
  const response = held<unknown>();
  rpc.mockReturnValue(response.promise);
  await render();
  const original = button("Try again");
  original.focus();
  await act(async () => {
    original.click();
  });
  expect(button("Trying…")).toBe(original);
  expect(document.activeElement).toBe(original);
  expect(original.disabled).toBe(true);
  expect(button("Edit address").disabled).toBe(false);
  await act(async () => response.resolve({ actual: "original ack" }));
  expect(button("Try again")).toBe(original);
  expect(original.disabled).toBe(false);
});
