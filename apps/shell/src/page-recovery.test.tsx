import { normalizePages } from "./store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { PageTarget } from "@aux/contracts";
import { expect, it, vi } from "vitest";
import { bridge } from "./bridge";
import { PageRecovery } from "./components/PageRecovery";

let originalPage: PageTarget;
vi.mock("./store", () => ({
  call: vi.fn(),
  errToast: vi.fn(),
  useStore: {
    getState: () => ({
      mode: "focus",
      pages: normalizePages([originalPage] as never),
      activePageId: originalPage.pageId,
    }),
  },
}));
vi.mock("./commands", async () => {
  const { invokeScopedControl } = await import("./scoped-control-commands");
  return {
    executeCommand: (id: string, invocation: any) => {
      try {
        return Promise.resolve(invokeScopedControl(id, invocation));
      } catch (reason) {
        return Promise.reject(reason);
      }
    },
  };
});

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it.each([
  {
    label: "Continue over HTTP",
    error: {
      url: "https://example.test/",
      code: -7,
      message: "Connection failed",
      upgradedFrom: "http://example.test/",
    },
    method: "useHttp",
    args: ["site", "http://example.test/"],
    detail: "HTTP fallback was not accepted",
  },
  {
    label: "Proceed anyway (unsafe)",
    error: { url: "https://example.test/", code: -200, message: "ERR_CERT_COMMON_NAME_INVALID" },
    method: "proceedInsecure",
    args: ["site", "https://example.test/"],
    detail: "certificate exception was not accepted",
  },
] as const)("shows a rejected $method response", async ({ label, error, method, args, detail }) => {
  const rejected = vi.spyOn(bridge, method).mockResolvedValue(false);
  const host = document.createElement("div");
  document.body.append(host);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{ width: 100, height: 36 }] as any);
  const root = createRoot(host);
  const page = {
    pageId: "site",
    url: error.url,
    backend: "aux",
    viewStatus: "visible",
    canGoBack: false,
    navigationError: error,
  } as PageTarget;
  originalPage = {
    ...page,
    windowId: bridge.windowId,
    documentEpoch: 1,
    targetId: "target",
    sessionId: "session",
    ownedByRuntime: false,
  };
  try {
    await act(async () => root.render(<PageRecovery page={originalPage} />));
    const proceed = Array.from(host.querySelectorAll("button")).find(
      (button) => button.textContent === label,
    );
    expect(proceed).toBeDefined();
    await act(async () => proceed!.click());
    expect(rejected).toHaveBeenCalledTimes(1);
    expect(rejected).toHaveBeenCalledWith(...args);
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(detail);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
  }
});
