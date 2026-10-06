// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const { spellCheck, state } = vi.hoisted(() => {
  let enabled = true;
  return {
    state: { privateMode: false, windowId: "spell-window" },
    spellCheck: vi.fn(async (next?: boolean) => {
      if (next !== undefined) enabled = next;
      return { enabled, managed: false };
    }),
  };
});
vi.mock("../../bridge", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../bridge")>()),
  bridge: {
    ...(await importOriginal<typeof import("../../bridge")>()).bridge,
    get privateMode() {
      return state.privateMode;
    },
    get windowId() {
      return state.windowId;
    },
    windowKind: "normal",
    spellCheck,
  },
  inMock: true,
  inNativeHost: false,
}));

import { SpellCheckSetting } from "./SpellCheck";

it("reads and saves the Profile spell check preference", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => root.render(<SpellCheckSetting active />));
    expect(spellCheck).toHaveBeenCalledWith();
    const control = container.querySelector<HTMLInputElement>(
      'input[aria-label="Check spelling as you type"]',
    )!;
    expect(control.checked).toBe(true);
    await act(async () => {
      control.click();
    });
    expect(spellCheck).toHaveBeenCalledWith(false);
    expect(control.checked).toBe(false);
  } finally {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  }
});

import { executeCommand } from "../../commands";
import { COMMANDS } from "@aux/contracts";
beforeEach(() => {
  state.privateMode = false;
  state.windowId = "spell-window";
  spellCheck
    .mockReset()
    .mockImplementation(async (next?: boolean) => ({ enabled: next ?? true, managed: false }));
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 10, height: 10 } as DOMRect,
  ] as unknown as DOMRectList);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function view(
  test: (host: HTMLDivElement, render: (active?: boolean) => Promise<void>) => Promise<void>,
) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const render = async (active = true) => {
    await act(async () => root.render(<SpellCheckSetting active={active} />));
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
it("returns the exact native ACK and retains the original rejected toggle", async () => {
  const ack = { enabled: false, managed: false },
    reason = new Error("native spelling refusal");
  spellCheck
    .mockResolvedValueOnce({ enabled: true, managed: false })
    .mockResolvedValueOnce(ack)
    .mockRejectedValueOnce(reason);
  await view(async (host) => {
    const input = host.querySelector("input")!;
    input.focus();
    await act(async () => expect(await executeCommand("toggle-spell-check")).toBe(ack));
    await act(async () => expect(executeCommand("toggle-spell-check")).rejects.toBe(reason));
    expect(input.checked).toBe(false);
    expect(input.disabled).toBe(false);
    expect(host.textContent).toContain(reason.message);
  });
});
for (const retirement of ["Private", "window"] as const)
  it(`retires held spelling ACK across ${retirement} A→B→A`, async () => {
    const pending = held<{ enabled: boolean; managed: boolean }>();
    spellCheck
      .mockResolvedValueOnce({ enabled: true, managed: false })
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValue({ enabled: true, managed: false });
    await view(async (host, render) => {
      await act(async () => host.querySelector("input")!.click());
      if (retirement === "Private") state.privateMode = true;
      else state.windowId = "other-window";
      await render();
      state.privateMode = false;
      state.windowId = "spell-window";
      await render();
      await act(async () => pending.resolve({ enabled: false, managed: false }));
      expect(host.querySelector("input")!.checked).toBe(true);
    });
  });
it("refuses managed or hidden spelling controls", async () => {
  spellCheck.mockResolvedValue({ enabled: true, managed: true });
  await view(async (host) => {
    host.querySelector("input")!.focus();
    await expect(executeCommand("toggle-spell-check")).rejects.toThrow();
    expect(spellCheck.mock.calls).toEqual([[]]);
  });
  spellCheck.mockResolvedValue({ enabled: true, managed: false });
  await view(async (host) => {
    host.querySelector("input")!.focus();
    host.hidden = true;
    await expect(executeCommand("toggle-spell-check")).rejects.toThrow();
    expect(spellCheck.mock.calls.every((args) => args.length === 0)).toBe(true);
  });
});
it("recovers synchronous spelling read/write errors through real focused Retry", async () => {
  const reason = new Error("sync spelling");
  spellCheck
    .mockImplementationOnce(() => {
      throw reason;
    })
    .mockResolvedValueOnce({ enabled: true, managed: false });
  await view(async (host) => {
    const retry = host.querySelector("button")!;
    expect(retry.disabled).toBe(false);
    retry.focus();
    await act(async () =>
      expect(await executeCommand("retry-spell-check")).toEqual({ enabled: true, managed: false }),
    );
    spellCheck.mockImplementationOnce(() => {
      throw reason;
    });
    host.querySelector("input")!.focus();
    await act(async () => expect(executeCommand("toggle-spell-check")).rejects.toBe(reason));
    expect(host.querySelector("input")!.disabled).toBe(false);
  });
});
it("keeps spelling commands scoped/remappable and out of the palette", () => {
  for (const id of ["toggle-spell-check", "retry-spell-check"])
    expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
      windows: ["normal"],
      palette: false,
      bindings: [],
      intercept: true,
    });
});
it("old spelling completion cannot clear a fresh owner's pending toggle", async () => {
  const old = held<{ enabled: boolean; managed: boolean }>(),
    fresh = held<{ enabled: boolean; managed: boolean }>();
  spellCheck
    .mockResolvedValueOnce({ enabled: true, managed: false })
    .mockReturnValueOnce(old.promise)
    .mockResolvedValueOnce({ enabled: true, managed: false })
    .mockReturnValueOnce(fresh.promise);
  await view(async (host, render) => {
    await act(async () => host.querySelector("input")!.click());
    await render(false);
    await render();
    await act(async () => host.querySelector("input")!.click());
    await act(async () => old.resolve({ enabled: false, managed: false }));
    expect(host.querySelector("input")!.disabled).toBe(true);
    await act(async () => fresh.resolve({ enabled: false, managed: false }));
    expect(host.querySelector("input")!.disabled).toBe(false);
    expect(host.querySelector("input")!.checked).toBe(false);
  });
});
