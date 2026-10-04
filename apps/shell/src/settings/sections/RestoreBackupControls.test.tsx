// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  privateMode: false,
  windowId: "one",
  kind: "normal",
  status: vi.fn(),
  choose: vi.fn(),
  cancel: vi.fn(),
  call: vi.fn(),
}));
vi.mock("../../bridge", async (original) => ({
  ...(await original<typeof import("../../bridge")>()),
  inMock: true,
  inNativeHost: false,
  bridge: {
    ...(await original<typeof import("../../bridge")>()).bridge,
    get privateMode() {
      return mocks.privateMode;
    },
    get windowId() {
      return mocks.windowId;
    },
    get windowKind() {
      return mocks.kind;
    },
    runtimeRestoreStatus: mocks.status,
    stageRuntimeRestore: mocks.choose,
    cancelRuntimeRestore: mocks.cancel,
  },
}));
vi.mock("../../store", async (original) => ({
  ...(await original<typeof import("../../store")>()),
  call: mocks.call,
}));
import { RestoreBackupControls } from "./RestoreBackupControls";
import { GeneralSettings } from "./General";
import { executeCommand, dispatchShortcut } from "../../commands";
import { COMMANDS } from "@aux/contracts";
const status = { pending: false, managedRecovery: { generation: 1, freshBackupIssued: true } },
  item = {
    path: "/managed/aux-runtime-one",
    name: "aux-runtime-one",
    sha256: "a".repeat(64),
    createdAt: 1,
    bytes: 32,
    schemaVersion: 1,
    artifactFiles: 1,
    missingArtifacts: 0,
    restorable: true,
  };
const result = {
  staged: true as const,
  schemaVersion: 1,
  bytes: 32,
  sha256: "b".repeat(64),
  artifactFiles: 1,
  missingArtifacts: 0,
  source: { path: item.path, name: item.name, sha256: item.sha256 },
};
function held<T>() {
  let resolve!: (value: T) => void, reject!: (reason: unknown) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  mocks.privateMode = false;
  mocks.windowId = "one";
  mocks.kind = "normal";
  mocks.status.mockReset().mockResolvedValue(status);
  mocks.choose.mockReset().mockResolvedValue(result);
  mocks.cancel.mockReset().mockResolvedValue({ cancelled: true });
  mocks.call
    .mockReset()
    .mockImplementation(async (method: string) =>
      method === "installation.listBackups"
        ? [item]
        : method === "installation.backupRetention"
          ? { keep: 10 }
          : result,
    );
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 10, height: 10 },
  ] as unknown as DOMRectList);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function view(
  test: (
    host: HTMLElement,
    render: (active?: boolean, refresh?: number, source?: typeof item) => Promise<void>,
    operation: ReturnType<typeof vi.fn>,
  ) => Promise<void>,
) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host),
    operation = vi.fn();
  const render = async (active = true, refreshVersion = 0, source = item) =>
    act(async () =>
      root.render(
        <RestoreBackupControls
          active={active}
          refreshVersion={refreshVersion}
          externalBusy={false}
          onOperation={operation}
        >
          {(control) => (
            <>
              {control.actions}
              {control.listed(source, false)}
              {control.statusView}
            </>
          )}
        </RestoreBackupControls>,
      ),
    );
  try {
    await render();
    await test(host, render, operation);
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
}
const button = (host: HTMLElement, id: string) =>
  host.querySelector<HTMLButtonElement>(`[data-command-id="${id}"]`)!;
async function invoke(host: HTMLElement, id: string) {
  button(host, id).focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = executeCommand(id);
  });
  return completion;
}
it("normal remappable original chooser preserves exact stage and cancel ACKs", async () =>
  view(async (host) => {
    for (const id of [
      "choose-runtime-restore",
      "cancel-pending-runtime-restore",
      "refresh-runtime-restore-status",
      "restore-reviewed-local-backup",
    ])
      expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
        windows: ["normal"],
        palette: false,
        bindings: [],
        intercept: true,
      });
    expect(await invoke(host, "choose-runtime-restore")).toBe(result);
    expect(mocks.choose.mock.calls).toEqual([[]]);
    expect(host.textContent).toContain("A restore is staged");
    const cancelled = { cancelled: true };
    mocks.cancel.mockResolvedValue(cancelled);
    expect(await invoke(host, "cancel-pending-runtime-restore")).toBe(cancelled);
    expect(host.textContent).toContain("Pending restore cancelled.");
  }));
it("cancelled system chooser does not manufacture staged status", async () =>
  view(async (host) => {
    mocks.choose.mockResolvedValue(null);
    expect(await invoke(host, "choose-runtime-restore")).toBeNull();
    expect(host.textContent).toContain("Restore cancelled.");
    expect(host.textContent).not.toContain("A restore is staged");
  }));
it.each(["Private", "window", "inactive", "refresh"])(
  "held chooser retains actual ACK but cannot deliver across %s ABA",
  async (kind) =>
    view(async (host, render, operation) => {
      const pending = held<typeof result>();
      mocks.choose.mockReturnValue(pending.promise);
      button(host, "choose-runtime-restore").focus();
      let completion!: Promise<unknown>;
      await act(async () => {
        completion = executeCommand("choose-runtime-restore");
      });
      if (kind === "Private") mocks.privateMode = true;
      if (kind === "window") mocks.windowId = "two";
      await render(kind !== "inactive", kind === "refresh" ? 1 : 0);
      mocks.privateMode = false;
      mocks.windowId = "one";
      await render();
      await act(async () => pending.resolve(result));
      expect(await completion).toBe(result);
      expect(host.textContent).not.toContain("A restore is staged");
      expect(operation.mock.calls[0]![0]).toBe(operation.mock.calls.at(-1)![0]);
      expect(operation.mock.calls.at(-1)![1]).toBe(false);
    }),
);
it("synchronous chooser rejection preserves reason and frees busy for original retry", async () =>
  view(async (host) => {
    const reason = new Error("original synchronous transport");
    mocks.choose.mockImplementationOnce(() => {
      throw reason;
    });
    button(host, "choose-runtime-restore").focus();
    await act(async () => {
      await expect(executeCommand("choose-runtime-restore")).rejects.toBe(reason);
    });
    expect(button(host, "choose-runtime-restore").disabled).toBe(false);
    expect(await invoke(host, "choose-runtime-restore")).toBe(result);
  }));
it("listed restore sends only original managed name/hash and checks genuine source ACK", async () =>
  view(async (host) => {
    expect(await invoke(host, "restore-reviewed-local-backup")).toBe(result);
    expect(mocks.call).toHaveBeenCalledWith("installation.stageListedRestore", {
      name: item.name,
      expectedSha256: item.sha256,
    });
    expect(host.textContent).toContain(`Restore staged from ${item.name}`);
  }));
it("same-path listed item replacement retires original held delivery without losing ACK", async () =>
  view(async (host, render) => {
    const pending = held<typeof result>();
    mocks.call.mockReturnValue(pending.promise);
    button(host, "restore-reviewed-local-backup").focus();
    let completion!: Promise<unknown>;
    await act(async () => {
      completion = executeCommand("restore-reviewed-local-backup");
    });
    await render(true, 0, { ...item, sha256: "c".repeat(64) });
    await render();
    await act(async () => pending.resolve(result));
    expect(await completion).toBe(result);
    expect(host.textContent).not.toContain("A restore is staged");
  }));
it("current mismatched source ACK is refused without presenting staged success", async () =>
  view(async (host) => {
    mocks.call.mockResolvedValue({ ...result, source: { ...result.source, sha256: "c".repeat(64) } });
    button(host, "restore-reviewed-local-backup").focus();
    await act(async () => {
      await expect(executeCommand("restore-reviewed-local-backup")).rejects.toThrow(
        "original reviewed backup",
      );
    });
    expect(host.textContent).not.toContain("A restore is staged");
  }));
it("actual focused remap calls original chooser once", async () =>
  view(async (host) => {
    button(host, "choose-runtime-restore").focus();
    await act(async () => {
      expect(
        dispatchShortcut({
          commandId: "choose-runtime-restore",
          key: "r",
          meta: true,
          alt: false,
          shift: false,
        }),
      ).toBe(true);
    });
    expect(mocks.choose).toHaveBeenCalledTimes(1);
  }));
it.each(["Private", "window", "inactive"])(
  "actual General cannot publish retired system chooser across %s ABA",
  async (kind) => {
    const pending = held<typeof result>();
    mocks.choose.mockReturnValue(pending.promise);
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const render = async (active = true) =>
      act(async () =>
        root.render(
          <GeneralSettings
            active={active}
            searching={false}
            subview="Task data backup"
            settings={{}}
            onSave={vi.fn(async () => true)}
            onOpenEditor={vi.fn()}
            editorViews={{ current: new Map() }}
            refreshVersion={0}
            onIndexChange={vi.fn()}
          />,
        ),
      );
    try {
      await render();
      await act(async () =>
        Array.from(host.querySelectorAll("button"))
          .find((b) => b.textContent === "Restore backup…")!
          .click(),
      );
      expect(mocks.choose).toHaveBeenCalledTimes(1);
      if (kind === "Private") mocks.privateMode = true;
      if (kind === "window") mocks.windowId = "two";
      await render(kind !== "inactive");
      mocks.privateMode = false;
      mocks.windowId = "one";
      await render();
      await act(async () => pending.resolve(result));
      expect(host.textContent).not.toContain("A restore is staged");
    } finally {
      await act(async () => root.unmount());
      host.remove();
    }
  },
);

it("listed source retirement retains original rejection without leaking it into current status", async () =>
  view(async (host, render) => {
    const pending = held<typeof result>();
    mocks.call.mockReturnValue(pending.promise);
    button(host, "restore-reviewed-local-backup").focus();
    let completion!: Promise<unknown>;
    await act(async () => {
      completion = executeCommand("restore-reviewed-local-backup");
    });
    await render(true, 0, { ...item, sha256: "c".repeat(64) });
    const reason = new Error("retired reviewed item failure");
    await act(async () => {
      pending.reject(reason);
      await expect(completion).rejects.toBe(reason);
    });
    expect(host.textContent).not.toContain(reason.message);
  }));
