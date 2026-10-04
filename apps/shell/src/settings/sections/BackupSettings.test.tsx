// @vitest-environment jsdom
import { act } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  privateMode: false,
  windowId: "one",
  kind: "normal",
  call: vi.fn(),
  create: vi.fn(),
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
    exportRuntimeBackup: mocks.create,
  },
}));
vi.mock("../../store", async (original) => ({
  ...(await original<typeof import("../../store")>()),
  call: mocks.call,
}));
import { BackupSettings } from "./BackupSettings";
import { executeCommand, dispatchShortcut } from "../../commands";
import { COMMANDS } from "@aux/contracts";
const item = {
  path: "/owned/aux-runtime-one",
  name: "aux-runtime-one",
  sha256: "a".repeat(64),
  createdAt: 1,
  bytes: 32,
  schemaVersion: 1,
  artifactFiles: 1,
  missingArtifacts: 0,
  restorable: true,
};
const ack = { path: item.path, sha256: item.sha256, artifactFiles: 1, missingArtifacts: 0, bytes: 32 };
function held<T>() {
  let resolve!: (v: T) => void, reject!: (r: unknown) => void;
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
  mocks.create.mockReset().mockResolvedValue(ack);
  mocks.call
    .mockReset()
    .mockImplementation(async (method: string, params: { keep?: number }) =>
      method === "installation.listBackups"
        ? [item]
        : method === "installation.backupRetention"
          ? { keep: 10 }
          : method === "installation.setBackupRetention"
            ? { keep: params.keep }
            : { deleted: true },
    );
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockImplementation(function (this: HTMLElement) {
    const d = this.closest("details");
    return (d && !d.open && this.tagName !== "SUMMARY"
      ? []
      : [{ width: 10, height: 10 }]) as unknown as DOMRectList;
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function view(
  test: (
    host: HTMLElement,
    render: (active?: boolean, refresh?: number) => Promise<void>,
    operation: ReturnType<typeof vi.fn>,
  ) => Promise<void>,
) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host),
    operation = vi.fn();
  const render = async (active = true, refreshVersion = 0) =>
    act(async () =>
      root.render(
        <BackupSettings
          active={active}
          refreshVersion={refreshVersion}
          externalBusy={false}
          restorePending={false}
          onOperation={operation}
          attended={(busy) => <button disabled={busy}>Original restore</button>}
          restore={() => null}
        />,
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
  let p!: Promise<unknown>;
  await act(async () => {
    p = executeCommand(id);
  });
  return p;
}
it("keeps exact normal remappable rows and original scoped creation ACK", async () =>
  view(async (host) => {
    for (const id of [
      "create-local-runtime-backup",
      "set-runtime-backup-retention",
      "toggle-local-backups",
      "refresh-local-backups",
      "review-local-backup-deletion",
      "delete-reviewed-local-backup",
      "cancel-local-backup-deletion",
    ]) {
      expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
        palette: false,
        windows: ["normal"],
        bindings: [],
        intercept: true,
      });
    }
    button(host, "create-local-runtime-backup").focus();
    let p!: Promise<unknown>;
    await act(async () => {
      p = executeCommand("create-local-runtime-backup");
    });
    expect(await p).toBe(ack);
    expect(mocks.create.mock.calls).toEqual([[]]);
    expect(host.textContent).toContain("Backup saved");
  }));
it("retains original creation ACK when followup inventory fails", async () =>
  view(async (host) => {
    const reason = new Error("inventory unavailable");
    mocks.call.mockImplementation(async () => {
      throw reason;
    });
    expect(await invoke(host, "create-local-runtime-backup")).toBe(ack);
    expect(host.textContent).toContain("operation completed");
    expect(mocks.create).toHaveBeenCalledTimes(1);
  }));
it.each(["Private", "window", "inactive", "refresh"])(
  "retires held creation across %s ABA, retains real ACK and exact busy token",
  async (kind) =>
    view(async (host, render, operation) => {
      const pending = held<typeof ack>();
      mocks.create.mockReturnValue(pending.promise);
      button(host, "create-local-runtime-backup").focus();
      let p!: Promise<unknown>;
      await act(async () => {
        p = executeCommand("create-local-runtime-backup");
      });
      expect(host.querySelector<HTMLButtonElement>("button:last-child")?.disabled).toBe(true);
      if (kind === "Private") mocks.privateMode = true;
      if (kind === "window") mocks.windowId = "two";
      await render(kind !== "inactive", kind === "refresh" ? 1 : 0);
      mocks.privateMode = false;
      mocks.windowId = "one";
      await render();
      await act(async () => pending.resolve(ack));
      expect(await p).toBe(ack);
      expect(host.textContent).not.toContain("Backup saved");
      expect(operation.mock.calls[0]![0]).toBe(operation.mock.calls.at(-1)![0]);
      expect(operation.mock.calls.at(-1)![1]).toBe(false);
    }),
);
it("synchronous transport failure retains reason and releases actual operation for retry", async () =>
  view(async (host, _render, operation) => {
    const reason = new Error("sync transport");
    mocks.create.mockImplementationOnce(() => {
      throw reason;
    });
    button(host, "create-local-runtime-backup").focus();
    let p!: Promise<unknown>;
    await act(async () => {
      p = executeCommand("create-local-runtime-backup");
      await expect(p).rejects.toBe(reason);
    });
    expect(operation.mock.calls.at(-1)![1]).toBe(false);
    expect(button(host, "create-local-runtime-backup").disabled).toBe(false);
    expect(await invoke(host, "create-local-runtime-backup")).toBe(ack);
  }));
it("uses exact original reviewed name and hash, and retains deletion ACK", async () =>
  view(async (host) => {
    await act(async () => host.querySelector("summary")!.click());
    await invoke(host, "review-local-backup-deletion");
    expect(mocks.call.mock.calls.some(([method]) => method === "installation.deleteBackup")).toBe(false);
    const deletion = { deleted: true };
    mocks.call.mockImplementation(async (method: string) =>
      method === "installation.deleteBackup"
        ? deletion
        : method === "installation.listBackups"
          ? []
          : { keep: 10 },
    );
    expect(await invoke(host, "delete-reviewed-local-backup")).toBe(deletion);
    expect(mocks.call).toHaveBeenCalledWith("installation.deleteBackup", {
      name: item.name,
      expectedSha256: item.sha256,
    });
    expect(host.textContent).toContain("Local backup deleted.");
  }));
it("fresh inventory retires old explicit confirmation", async () =>
  view(async (host) => {
    await act(async () => host.querySelector("summary")!.click());
    await invoke(host, "review-local-backup-deletion");
    await invoke(host, "refresh-local-backups");
    expect(host.textContent).not.toContain("Delete this local backup?");
    expect(mocks.call.mock.calls.some(([method]) => method === "installation.deleteBackup")).toBe(false);
  }));
it("actual retention input and focused remap use only fixed supported keep values", async () =>
  view(async (host) => {
    const select = host.querySelector<HTMLSelectElement>("select")!;
    select.focus();
    await act(async () => {
      select.value = "5";
      expect(
        dispatchShortcut({
          commandId: "set-runtime-backup-retention",
          key: "r",
          meta: true,
          alt: false,
          shift: false,
        }),
      ).toBe(true);
    });
    expect(mocks.call).toHaveBeenCalledWith("installation.setBackupRetention", { keep: 5 });
    expect(select.value).toBe("5");
  }));

import { GeneralSettings } from "./General";
it.each(["Private", "inactive", "window"])(
  "actual General refuses retired backup delivery across %s ABA",
  async (kind) => {
    const pending = held<typeof ack>();
    mocks.create.mockReturnValue(pending.promise);
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
      const create = Array.from(host.querySelectorAll("button")).find(
        (button) => button.textContent === "Create backup…",
      )!;
      await act(async () => create.click());
      expect(mocks.create).toHaveBeenCalledTimes(1);
      if (kind === "Private") mocks.privateMode = true;
      if (kind === "window") mocks.windowId = "two";
      await render(kind !== "inactive");
      mocks.privateMode = false;
      mocks.windowId = "one";
      await render();
      await act(async () => pending.resolve(ack));
      expect(host.textContent).not.toContain("Backup saved");
    } finally {
      await act(async () => root.unmount());
      host.remove();
    }
  },
);

it("Private never reads or dispatches regular Task data backup producers", async () => {
  mocks.privateMode = true;
  await view(async (host) => {
    expect(mocks.call).not.toHaveBeenCalled();
    expect(button(host, "create-local-runtime-backup").disabled).toBe(true);
    button(host, "create-local-runtime-backup").focus();
    await expect(executeCommand("create-local-runtime-backup")).rejects.toThrow();
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
it("reviewed deletion retains original backend refusal and confirmation for a deliberate retry", async () =>
  view(async (host) => {
    await act(async () => host.querySelector("summary")!.click());
    await invoke(host, "review-local-backup-deletion");
    const reason = new Error("This backup changed or is no longer available. Refresh the list.");
    mocks.call.mockImplementation(async (method: string) => {
      if (method === "installation.deleteBackup") throw reason;
      return method === "installation.listBackups" ? [item] : { keep: 10 };
    });
    button(host, "delete-reviewed-local-backup").focus();
    await act(async () => {
      await expect(executeCommand("delete-reviewed-local-backup")).rejects.toBe(reason);
    });
    expect(host.textContent).toContain(reason.message);
    expect(host.textContent).toContain("Delete this local backup?");
    expect(button(host, "delete-reviewed-local-backup").disabled).toBe(false);
  }));

it("does not start queued passive reads after original component retirement", async()=>{
 const host=document.createElement("div");document.body.append(host);const root=createRoot(host);
 await act(async()=>{
  flushSync(()=>root.render(<BackupSettings active refreshVersion={0} externalBusy={false} restorePending={false} onOperation={vi.fn()} attended={()=>null} restore={()=>null}/>));
  flushSync(()=>root.unmount());
  await Promise.resolve();
 });
 expect(mocks.call).not.toHaveBeenCalled();expect(mocks.create).not.toHaveBeenCalled();host.remove();
});
