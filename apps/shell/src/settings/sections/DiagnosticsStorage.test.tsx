// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  available: true,
  privateMode: false,
  windowId: "original",
  windowKind: "normal" as "normal" | "private",
  dataDir: vi.fn(),
  health: vi.fn(),
  clear: vi.fn(),
  report: vi.fn(),
  reveal: vi.fn(),
}));
vi.mock("../../bridge", async (original) => ({
  ...(await original<typeof import("../../bridge")>()),
  bridge: {
    ...(await original<typeof import("../../bridge")>()).bridge,
    get privateMode() {
      return mocks.privateMode;
    },
    get windowId() {
      return mocks.windowId;
    },
    get windowKind() {
      return mocks.windowKind;
    },
    dataDir: mocks.dataDir,
    healthSummary: mocks.health,
    clearHealth: mocks.clear,
    exportDiagnostics: mocks.report,
    revealPath: mocks.reveal,
  },
  get inMock() { return mocks.available; },
  inNativeHost: false,
}));
import { GeneralSettings } from "./General";
import { DiagnosticsStorage } from "./DiagnosticsStorage";
import { emptyBrowserHealthSummary } from "../../bridge";
import { COMMANDS } from "@aux/contracts";
import { dispatchShortcut, executeCommand } from "../../commands";
const health = () => ({
  ...emptyBrowserHealthSummary(),
  samples: 10,
  spanDays: 1,
  observedMinutes: 60,
  sessions: 1,
});
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  mocks.available = true;
  mocks.privateMode = false;
  mocks.windowId = "original";
  mocks.windowKind = "normal";
  mocks.dataDir.mockReset().mockResolvedValue("/owned/runtime");
  mocks.health.mockReset().mockResolvedValue(health());
  mocks.clear.mockReset().mockResolvedValue(emptyBrowserHealthSummary());
  mocks.report.mockReset().mockResolvedValue("/owned/support.json");
  mocks.reveal.mockReset().mockResolvedValue(true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockImplementation(function (this: HTMLElement) {
    const details = this.closest("details");
    return details && !details.open && this.tagName !== "SUMMARY"
      ? ([] as unknown as DOMRectList)
      : ([{ width: 10, height: 10 } as DOMRect] as unknown as DOMRectList);
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function held<T>() {
  let resolve!: (v: T) => void, reject!: (v: unknown) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
async function view(
  test: (
    host: HTMLDivElement,
    render: (active?: boolean, refreshVersion?: number) => Promise<void>,
  ) => Promise<void>,
) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host),
    onIndexChange = vi.fn();
  const render = async (active = true, refreshVersion = 0) => {
    await act(async () =>
      root.render(
        <DiagnosticsStorage active={active} refreshVersion={refreshVersion} onIndexChange={onIndexChange} />,
      ),
    );
  };
  try {
    await render();
    await test(host, render);
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
}
const open = async (host: HTMLElement) => act(async () => host.querySelector("summary")!.click());
const button = (host: HTMLElement, id: string) =>
  host.querySelector<HTMLButtonElement>(`button[data-command-id="${id}"]`)!;
it("registers original disclosure and preserves original diagnostics labels/hints", async () => {
  await view(async (host) => {
    expect(host.querySelector("details")!.open).toBe(false);
    await open(host);
    expect(host.querySelector("details")!.open).toBe(true);
    host.querySelector("summary")!.focus();
    await act(async () =>
      expect(
        dispatchShortcut({
          commandId: "toggle-diagnostics-storage",
          key: "d",
          meta: true,
          alt: false,
          shift: true,
        }),
      ).toBe(true),
    );
    expect(host.querySelector("details")!.open).toBe(false);
    expect(host.textContent).toContain(
      "Samples and counts stay on this device and contain no URLs or page content.",
    );
    expect(host.textContent).toContain(
      "It excludes credentials, URLs, browsing history, task text, account identity, local paths, and content.",
    );
    expect(mocks.dataDir.mock.calls).toEqual([[]]);
    expect(mocks.health.mock.calls).toEqual([[]]);
  });
});
it("reveals only actual original native data path and returns exact true ACK", async () => {
  await view(async (host) => {
    await open(host);
    button(host, "reveal-runtime-data-directory").focus();
    await act(async () => expect(await executeCommand("reveal-runtime-data-directory")).toBe(true));
    expect(mocks.reveal.mock.calls).toEqual([["/owned/runtime"]]);
  });
});
it("false reveal ACK refuses with original actionable diagnostic", async () => {
  mocks.reveal.mockResolvedValue(false);
  await view(async (host) => {
    await open(host);
    button(host, "reveal-runtime-data-directory").focus();
    await act(async () =>
      expect(executeCommand("reveal-runtime-data-directory")).rejects.toThrow(
        "The data directory is unavailable. Try again after the runtime starts.",
      ),
    );
    expect(host.textContent).toContain("The data directory is unavailable");
  });
});
it("clear returns actual native summary and prevents a second clear from old measured state", async () => {
  const ack = emptyBrowserHealthSummary();
  mocks.clear.mockResolvedValue(ack);
  await view(async (host) => {
    await open(host);
    button(host, "clear-browser-health").focus();
    await act(async () => expect(await executeCommand("clear-browser-health")).toBe(ack));
    expect(button(host, "clear-browser-health").disabled).toBe(true);
    expect(host.textContent).toContain("Recording begins during this session.");
    expect(mocks.clear.mock.calls).toEqual([[]]);
  });
});
it("report preserves actual path and chooser cancellation ACK without inventing success", async () => {
  await view(async (host) => {
    await open(host);
    button(host, "export-support-report").focus();
    await act(async () => expect(await executeCommand("export-support-report")).toBe("/owned/support.json"));
    expect(host.textContent).toContain("Support report saved.");
    mocks.report.mockResolvedValue(null);
    await act(async () => expect(await executeCommand("export-support-report")).toBeNull());
    expect(host.textContent).toContain("Export cancelled.");
  });
});
for (const action of [
  "reveal-runtime-data-directory",
  "clear-browser-health",
  "export-support-report",
] as const)
  it(`${action} retains exact synchronous rejection and recovers original busy owner`, async () => {
    const reason = new Error("original synchronous native failure"),
      producer =
        action === "reveal-runtime-data-directory"
          ? mocks.reveal
          : action === "clear-browser-health"
            ? mocks.clear
            : mocks.report;
    producer.mockImplementationOnce(() => {
      throw reason;
    });
    await view(async (host) => {
      await open(host);
      button(host, action).focus();
      await act(async () => expect(executeCommand(action)).rejects.toBe(reason));
      expect(host.textContent).toContain(reason.message);
      expect(button(host, action).disabled).toBe(false);
    });
  });
for (const retirement of ["Private", "window", "inactive", "refresh"] as const)
  it(`retires original report delivery across ${retirement} A→B→A`, async () => {
    const old = held<string>();
    mocks.report.mockReturnValueOnce(old.promise);
    await view(async (host, render) => {
      await open(host);
      await act(async () => button(host, "export-support-report").click());
      if (retirement === "Private") mocks.privateMode = true;
      else if (retirement === "window") mocks.windowId = "other";
      await render(retirement !== "inactive", retirement === "refresh" ? 1 : 0);
      mocks.privateMode = false;
      mocks.windowId = "original";
      await render();
      await act(async () => old.resolve("/original/support.json"));
      expect(host.textContent).not.toContain("Support report saved.");
      expect(button(host, "export-support-report").disabled).toBe(false);
    });
  });
it("old completion cannot clear fresh report busy state or publish retired failure", async () => {
  const old = held<string>(),
    fresh = held<string>();
  mocks.report.mockReturnValueOnce(old.promise).mockReturnValueOnce(fresh.promise);
  await view(async (host, render) => {
    await open(host);
    await act(async () => button(host, "export-support-report").click());
    await render(false);
    await render();
    await open(host);
    await act(async () => button(host, "export-support-report").click());
    await act(async () => old.reject(new Error("retired failure")));
    expect(button(host, "export-support-report").disabled).toBe(true);
    expect(host.textContent).not.toContain("retired failure");
    await act(async () => fresh.resolve("/fresh/support.json"));
    expect(button(host, "export-support-report").disabled).toBe(false);
    expect(host.textContent).toContain("Support report saved.");
  });
});
it("Private skips forbidden regular dataDir while retaining actual private clear/report policy", async () => {
  mocks.privateMode = true;
  mocks.windowKind = "private";
  await view(async (host) => {
    await open(host);
    expect(mocks.dataDir).not.toHaveBeenCalled();
    expect(mocks.health.mock.calls).toEqual([[]]);
    expect(host.textContent).not.toContain("Data directory");
    const ack = emptyBrowserHealthSummary();
    mocks.clear.mockResolvedValue(ack);
    button(host, "clear-browser-health").focus();
    await act(async () => expect(await executeCommand("clear-browser-health")).toBe(ack));
    expect(mocks.clear.mock.calls).toEqual([[]]);
    button(host, "export-support-report").focus();
    await act(async () => expect(await executeCommand("export-support-report")).toBe("/owned/support.json"));
  });
});
it("closed hidden and unfocused controls cannot dispatch native methods", async () => {
  await view(async (host) => {
    button(host, "export-support-report").focus();
    await expect(executeCommand("export-support-report")).rejects.toThrow();
    await open(host);
    host.querySelector("summary")!.focus();
    await expect(executeCommand("export-support-report")).rejects.toThrow();
    host.hidden = true;
    button(host, "export-support-report").focus();
    await expect(executeCommand("export-support-report")).rejects.toThrow();
    expect(mocks.report).not.toHaveBeenCalled();
  });
});
it("all four scoped rows retain normal remappable routing", () => {
  for (const id of [
    "toggle-diagnostics-storage",
    "reveal-runtime-data-directory",
    "clear-browser-health",
    "export-support-report",
  ])
    expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
      palette: false,
      bindings: [],
      intercept: true,
      windows: id === "reveal-runtime-data-directory" ? ["normal"] : ["normal", "private"],
    });
});

for (const retirement of ["Private", "window", "inactive", "refresh"] as const)
  it(`actual General retires held report across ${retirement} A→B→A`, async () => {
    const old = held<string>();
    mocks.report.mockReturnValueOnce(old.promise);
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const props = {
      searching: false,
      subview: null,
      settings: {},
      onSave: vi.fn(async () => true),
      onOpenEditor: vi.fn(),
      editorViews: { current: new Map<string, HTMLElement>() },
      onIndexChange: vi.fn(),
    };
    const render = async (active = true, refreshVersion = 0) => {
      await act(async () =>
        root.render(<GeneralSettings {...props} active={active} refreshVersion={refreshVersion} />),
      );
    };
    try {
      await render();
      await act(async () => host.querySelector<HTMLElement>(".settings-advanced summary")!.click());
      const report = [...host.querySelectorAll("button")].find(
        (element) => element.textContent === "Export support report…",
      )!;
      await act(async () => report.click());
      expect(mocks.report.mock.calls).toEqual([[]]);
      if (retirement === "Private") mocks.privateMode = true;
      else if (retirement === "window") mocks.windowId = "foreign";
      await render(retirement !== "inactive", retirement === "refresh" ? 1 : 0);
      mocks.privateMode = false;
      mocks.windowId = "original";
      await render();
      await act(async () => old.resolve("/old/support.json"));
      expect(host.textContent).not.toContain("Support report saved.");
    } finally {
      await act(async () => root.unmount());
      host.remove();
    }
  });

it("refuses delivery and new dispatch when native capability disappears without a render", async () => {
  const pending = held<string | null>();
  mocks.report.mockReturnValue(pending.promise);
  await view(async (host) => {
    await open(host);
    button(host, "export-support-report").focus();
    let completion!: ReturnType<typeof executeCommand>;
    await act(async () => { completion = executeCommand("export-support-report"); });
    mocks.available = false;
    host.querySelector("summary")!.focus();
    await expect(executeCommand("toggle-diagnostics-storage")).rejects.toThrow("current diagnostics disclosure");
    await act(async () => pending.resolve("/owned/actual-report.json"));
    expect(await completion).toBe("/owned/actual-report.json");
    expect(host.textContent).not.toContain("Support report saved.");
    await expect(executeCommand("export-support-report")).rejects.toThrow("original focused control");
    expect(mocks.report).toHaveBeenCalledTimes(1);
  });
});
