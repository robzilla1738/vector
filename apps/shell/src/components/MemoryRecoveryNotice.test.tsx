// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { COMMANDS, effectiveShortcuts, matchShortcut, type HostMethodResult } from "@aux/contracts";
import { useStore } from "../store";
import { executeCommand } from "../commands";
import { MemoryRecoveryNotice } from "./MemoryRecoveryNotice";
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), private: false, chooser: vi.fn() }));
vi.mock("../store", async (original) => ({
  ...(await original<typeof import("../store")>()),
  call: mocks.rpc,
}));
vi.mock("../bridge", async (original) => {
  const actual = await original<typeof import("../bridge")>();
  return {
    ...actual,
    bridge: {
      ...actual.bridge,
      windowKind: "normal",
      get privateMode() {
        return mocks.private;
      },
      exportRuntimeBackup: mocks.chooser,
    },
  };
});
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const initial = useStore.getState();
const status = (issued: boolean) => ({ managedRecovery: { generation: 2, freshBackupIssued: issued } });
const receipt: NonNullable<HostMethodResult<"exportRuntimeBackup">> = {
  path: "/owned/synthetic/backup.aux",
  bytes: 100,
  sha256: "a".repeat(64),
  artifactFiles: 0,
  missingArtifacts: 0,
};
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
async function render(possible = false) {
  await act(async () => root.render(<MemoryRecoveryNotice possible={possible} />));
}
function button(id: string) {
  return host.querySelector<HTMLButtonElement>(`[data-command-id="${id}"]`)!;
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockImplementation(
    () => [{ width: 100 }] as unknown as DOMRectList,
  );
  mocks.private = false;
  mocks.rpc.mockReset();
  mocks.rpc.mockResolvedValue(status(false));
  mocks.chooser.mockReset();
  mocks.chooser.mockResolvedValue(null);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it("shows issued recovery and opens an explicit new offline export after Forget", async () => {
  mocks.rpc.mockResolvedValue(status(true));
  const openSettings = vi.spyOn(useStore.getState(), "setOverlay").mockImplementation(() => {}),
    setState = vi.spyOn(useStore, "setState");
  await render();
  expect(host.textContent).toContain("Fresh Aux-managed task-data backup issued after Forget");
  expect(host.textContent).toContain("Protected Space and page memory need a new encrypted offline package");
  expect(host.textContent).toContain("Copies and phrases outside Aux cannot be revoked");
  await act(async () => button("open-memory-offline-recovery").click());
  expect(setState).toHaveBeenCalledWith({ settingsCategory: "General" });
  expect(openSettings).toHaveBeenCalledWith("settings");
});
it.each(["create-memory-local-backup", "open-memory-offline-recovery"] as const)(
  "registers %s with original focused remapping",
  (id) => {
    expect(COMMANDS.filter((row) => row.id === id)).toHaveLength(1);
    expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
      handler: "shell",
      windows: ["normal"],
      palette: false,
      bindings: [],
      intercept: true,
    });
    expect(
      matchShortcut(effectiveShortcuts({ [id]: [{ key: "b", command: true, alt: true }] }), {
        key: "b",
        meta: true,
        alt: true,
        shift: false,
      })?.id,
    ).toBe(id);
  },
);
it("requires explicit chooser input and preserves cancellation without a follow-up status read", async () => {
  await render();
  expect(mocks.chooser).not.toHaveBeenCalled();
  await act(async () => button("create-memory-local-backup").click());
  expect(mocks.chooser).toHaveBeenCalledTimes(1);
  expect(mocks.rpc).toHaveBeenCalledTimes(1);
  expect(host.textContent).toContain("Backup cancelled; create one when ready.");
  expect(button("create-memory-local-backup").disabled).toBe(false);
});
it("retains the actual chooser receipt and confirms fresh status only for its original owner", async () => {
  mocks.chooser.mockResolvedValue(receipt);
  await render();
  mocks.rpc.mockResolvedValue(status(true));
  button("create-memory-local-backup").focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = executeCommand("create-memory-local-backup");
    expect(await completion).toBe(receipt);
  });
  expect(mocks.chooser).toHaveBeenCalledTimes(1);
  expect(mocks.rpc).toHaveBeenCalledTimes(2);
  expect(host.textContent).toContain("Fresh Aux-managed task-data backup issued after Forget");
});
it.each(["Private", "unmount", "notice"])(
  "retains chooser ACK without post-retirement read/publication (%s)",
  async (kind) => {
    const hold = deferred<typeof receipt>();
    mocks.chooser.mockReturnValue(hold.promise);
    await render();
    button("create-memory-local-backup").focus();
    let completion!: Promise<unknown>;
    await act(async () => {
      completion = executeCommand("create-memory-local-backup");
    });
    if (kind === "Private") {
      mocks.private = true;
      await render();
      mocks.private = false;
      await render();
    }
    if (kind === "unmount") await act(async () => root.render(null));
    if (kind === "notice") await render(true);
    const reads = mocks.rpc.mock.calls.length;
    await act(async () => {
      hold.resolve(receipt);
      expect(await completion).toBe(receipt);
    });
    expect(mocks.rpc).toHaveBeenCalledTimes(reads);
    expect(host.textContent).not.toContain("Fresh Aux-managed task-data backup issued");
  },
);
it("a retired chooser rejection remains exact and is not delivered into a fresh Private owner", async () => {
  const hold = deferred<typeof receipt>();
  mocks.chooser.mockReturnValue(hold.promise);
  await render();
  button("create-memory-local-backup").focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = executeCommand("create-memory-local-backup");
  });
  const observed = completion.then(
    (value) => ({ value }),
    (reason) => ({ reason }),
  );
  mocks.private = true;
  await render();
  mocks.private = false;
  await render();
  const reason = new Error("Original private backup refusal");
  await act(async () => {
    hold.reject(reason);
    const result = await observed;
    expect("reason" in result && result.reason).toBe(reason);
  });
  expect(host.textContent).not.toContain(reason.message);
  expect(button("create-memory-local-backup").disabled).toBe(false);
});
it("active chooser rejection reaches only the original control and permits explicit retry", async () => {
  const reason = new Error("Original chooser refusal");
  mocks.chooser.mockRejectedValue(reason);
  await render();
  await act(async () => button("create-memory-local-backup").click());
  expect(host.textContent).toContain(reason.message);
  expect(button("create-memory-local-backup").disabled).toBe(false);
  mocks.chooser.mockResolvedValue(null);
  await act(async () => button("create-memory-local-backup").click());
  expect(mocks.chooser).toHaveBeenCalledTimes(2);
  expect(host.textContent).not.toContain(reason.message);
});
it("newest status observation wins over an older fulfilled poll", async () => {
  const hold = deferred<ReturnType<typeof status>>();
  mocks.rpc.mockReturnValueOnce(hold.promise).mockResolvedValue(status(true));
  await render();
  await act(async () => vi.advanceTimersByTimeAsync(5000));
  expect(host.textContent).toContain("Fresh Aux-managed task-data backup issued");
  await act(async () => hold.resolve(status(false)));
  expect(host.textContent).toContain("Fresh Aux-managed task-data backup issued");
});
it("Private has no chooser/status controls and unowned shortcuts cannot open a chooser", async () => {
  mocks.private = true;
  await render();
  expect(mocks.rpc).not.toHaveBeenCalled();
  expect(host.querySelector("button")).toBeNull();
  await expect(executeCommand("create-memory-local-backup")).rejects.toThrow("focused");
  expect(mocks.chooser).not.toHaveBeenCalled();
});
it("retired post-chooser status cannot publish and still retains the exact completed chooser ACK", async () => {
  const hold = deferred<ReturnType<typeof status>>();
  mocks.chooser.mockResolvedValue(receipt);
  mocks.rpc
    .mockResolvedValueOnce(status(false))
    .mockReturnValueOnce(hold.promise)
    .mockResolvedValue(status(false));
  await render();
  button("create-memory-local-backup").focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = executeCommand("create-memory-local-backup");
  });
  expect(mocks.rpc).toHaveBeenCalledTimes(2);
  mocks.private = true;
  await render();
  mocks.private = false;
  await render();
  await act(async () => {
    hold.resolve(status(true));
    expect(await completion).toBe(receipt);
  });
  expect(host.textContent).not.toContain("Fresh Aux-managed task-data backup issued");
  expect(button("create-memory-local-backup").disabled).toBe(false);
});
it.each([false, true])(
  "retains successful chooser ACK after post-chooser status failure (retired %s)",
  async (retired) => {
    const hold = deferred<ReturnType<typeof status>>();
    mocks.chooser.mockResolvedValue(receipt);
    mocks.rpc
      .mockResolvedValueOnce(status(false))
      .mockReturnValueOnce(hold.promise)
      .mockResolvedValue(status(false));
    await render();
    button("create-memory-local-backup").focus();
    let completion!: Promise<unknown>;
    await act(async () => {
      completion = executeCommand("create-memory-local-backup");
    });
    const observed = completion.then(
      (value) => ({ value }),
      (reason) => ({ reason }),
    );
    if (retired) {
      mocks.private = true;
      await render();
      mocks.private = false;
      await render();
    }
    const reads = mocks.rpc.mock.calls.length;
    await act(async () => {
      hold.reject(new Error("Original status readback failure"));
      const result = await observed;
      expect("value" in result && result.value).toBe(receipt);
    });
    expect(mocks.rpc).toHaveBeenCalledTimes(reads);
    expect(host.textContent?.includes("Backup was saved, but a fresh backup has not been confirmed.")).toBe(
      !retired,
    );
    expect(host.textContent).not.toContain("Original status readback failure");
    expect(button("create-memory-local-backup").disabled).toBe(false);
  },
);
