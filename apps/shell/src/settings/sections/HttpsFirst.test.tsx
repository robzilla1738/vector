// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bridge } from "../../bridge";
import { HttpsFirstSetting } from "./HttpsFirst";

vi.mock("../../bridge", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../bridge")>()),
  inNativeHost: true,
}));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("reads and confirms the saved HTTPS-first preference", async () => {
  const read = vi
    .spyOn(bridge, "httpsUpgrade")
    .mockResolvedValueOnce({ enabled: false, available: true, managed: false })
    .mockResolvedValueOnce({ enabled: true, available: true, managed: false });
  const save = vi.spyOn(bridge, "setHttpsUpgrade").mockResolvedValue(true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<HttpsFirstSetting active />));
    const control = host.querySelector<HTMLInputElement>(
      'input[aria-label="Automatically upgrade eligible HTTP pages"]',
    )!;
    expect(control.checked).toBe(false);
    await act(async () => {
      control.click();
    });
    expect(save).toHaveBeenCalledWith(true);
    expect(read).toHaveBeenCalledTimes(2);
    expect(control.checked).toBe(true);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
  }
});

it("keeps a policy-blocked HTTPS-first preference unavailable", async () => {
  vi.spyOn(bridge, "httpsUpgrade").mockResolvedValue({ enabled: false, available: false, managed: true });
  const save = vi.spyOn(bridge, "setHttpsUpgrade");
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<HttpsFirstSetting active />));
    const control = host.querySelector<HTMLInputElement>(
      'input[aria-label="Automatically upgrade eligible HTTP pages"]',
    )!;
    expect(control.disabled).toBe(true);
    expect(host.textContent).toContain("Disabled by your organization");
    expect(save).not.toHaveBeenCalled();
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
  }
});

import { dispatchShortcut, executeCommand } from "../../commands";
import { COMMANDS } from "@aux/contracts";
const originalPrivate = bridge.privateMode,
  originalWindow = bridge.windowId;
beforeEach(() => {
  bridge.privateMode = false;
  bridge.windowId = "https-window";
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 10, height: 10 } as DOMRect,
  ] as unknown as DOMRectList);
});
afterEach(() => {
  bridge.privateMode = originalPrivate;
  bridge.windowId = originalWindow;
  vi.restoreAllMocks();
});
async function view(
  test: (host: HTMLDivElement, render: (active?: boolean) => Promise<void>) => Promise<void>,
) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const render = async (active = true) => {
    await act(async () => root.render(<HttpsFirstSetting active={active} />));
  };
  try {
    await render();
    await test(host, render);
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
}
function held<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
it("retains genuine HTTPS setter ACK and original readback rejection", async () => {
  const reason = new Error("readback refused");
  const read = vi
    .spyOn(bridge, "httpsUpgrade")
    .mockResolvedValueOnce({ enabled: false, available: true, managed: false })
    .mockResolvedValueOnce({ enabled: true, available: true, managed: false })
    .mockRejectedValueOnce(reason);
  vi.spyOn(bridge, "setHttpsUpgrade").mockResolvedValueOnce(true).mockResolvedValueOnce(false);
  await view(async (host) => {
    host.querySelector("input")!.focus();
    await act(async () => expect(await executeCommand("toggle-https-first")).toBe(true));
    await act(async () => expect(executeCommand("toggle-https-first")).rejects.toBe(reason));
    expect(host.textContent).toContain(reason.message);
    expect(host.querySelector("input")!.disabled).toBe(false);
    expect(read).toHaveBeenCalledTimes(3);
  });
});
it("rejects mismatched native setter ACK without a fabricated readback", async () => {
  const read = vi
    .spyOn(bridge, "httpsUpgrade")
    .mockResolvedValue({ enabled: false, available: true, managed: false });
  vi.spyOn(bridge, "setHttpsUpgrade").mockResolvedValue(false);
  await view(async (host) => {
    host.querySelector("input")!.focus();
    await act(async () =>
      expect(executeCommand("toggle-https-first")).rejects.toThrow(
        "Chromium did not save the HTTPS-first setting.",
      ),
    );
    expect(read).toHaveBeenCalledTimes(1);
    expect(host.querySelector("input")!.checked).toBe(false);
  });
});
it("retires old HTTPS setter completion before any follow-up read across Private A→B→A", async () => {
  const pending = held<boolean>();
  const read = vi
    .spyOn(bridge, "httpsUpgrade")
    .mockResolvedValue({ enabled: false, available: true, managed: false });
  vi.spyOn(bridge, "setHttpsUpgrade").mockReturnValueOnce(pending.promise);
  await view(async (host, render) => {
    host.querySelector("input")!.focus();
    let completion!: Promise<unknown>;
    await act(async () => {
      completion = executeCommand("toggle-https-first");
    });
    bridge.privateMode = true;
    await render();
    bridge.privateMode = false;
    await render();
    await act(async () => pending.resolve(true));
    expect(await completion).toBe(true);
    expect(read).toHaveBeenCalledTimes(2);
    expect(host.querySelector("input")!.checked).toBe(false);
  });
});
it("retires an in-flight HTTPS readback rather than publishing into a replaced window", async () => {
  const pending = held<{ enabled: boolean; available: boolean; managed: boolean }>();
  vi.spyOn(bridge, "httpsUpgrade")
    .mockResolvedValueOnce({ enabled: false, available: true, managed: false })
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValue({ enabled: false, available: true, managed: false });
  vi.spyOn(bridge, "setHttpsUpgrade").mockResolvedValue(true);
  await view(async (host, render) => {
    await act(async () => host.querySelector("input")!.click());
    bridge.windowId = "other-window";
    await render();
    bridge.windowId = "https-window";
    await render();
    await act(async () => pending.resolve({ enabled: true, available: true, managed: false }));
    expect(host.querySelector("input")!.checked).toBe(false);
  });
});
it("keeps genuine original setter rejection and synchronous transport failures retryable", async () => {
  const reason = new Error("sync HTTPS transport");
  vi.spyOn(bridge, "httpsUpgrade")
    .mockImplementationOnce(() => {
      throw reason;
    })
    .mockResolvedValue({ enabled: false, available: true, managed: false });
  vi.spyOn(bridge, "setHttpsUpgrade").mockImplementation(() => {
    throw reason;
  });
  await view(async (host) => {
    const retry = host.querySelector("button")!;
    retry.focus();
    await act(async () =>
      expect(await executeCommand("retry-https-first")).toEqual({
        enabled: false,
        available: true,
        managed: false,
      }),
    );
    host.querySelector("input")!.focus();
    await act(async () => expect(executeCommand("toggle-https-first")).rejects.toBe(reason));
    expect(host.querySelector("input")!.disabled).toBe(false);
  });
});
it("uses a genuine focused remapped HTTPS control and refuses hidden/managed owners", async () => {
  const read = vi
    .spyOn(bridge, "httpsUpgrade")
    .mockResolvedValueOnce({ enabled: false, available: true, managed: false })
    .mockResolvedValue({ enabled: true, available: true, managed: false });
  const save = vi.spyOn(bridge, "setHttpsUpgrade").mockResolvedValue(true);
  await view(async (host) => {
    host.querySelector("input")!.focus();
    host.hidden = true;
    await expect(executeCommand("toggle-https-first")).rejects.toThrow();
    host.hidden = false;
    await act(async () =>
      expect(
        dispatchShortcut({
          commandId: "toggle-https-first",
          key: "h",
          meta: true,
          ctrl: false,
          shift: true,
          alt: false,
        }),
      ).toBe(true),
    );
    expect(save).toHaveBeenCalledExactlyOnceWith(true);
    expect(read).toHaveBeenCalledTimes(2);
  });
});
it("keeps HTTPS commands normal-window, remappable and unavailable from the palette", () => {
  for (const id of ["toggle-https-first", "retry-https-first"])
    expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
      windows: ["normal"],
      palette: false,
      bindings: [],
      intercept: true,
    });
});
