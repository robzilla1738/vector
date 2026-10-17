// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ privateMode: false, windowId: "original", languagePreferences: vi.fn() }));
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
    windowKind: "normal",
    languagePreferences: mocks.languagePreferences,
  },
  inMock: true,
  inNativeHost: false,
}));
import { LanguagesSetting } from "./Languages";
import { executeCommand } from "../../commands";
const initial = { selected: ["en-US", "en"], effective: ["en-US", "en"], forced: [], managed: false };
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  mocks.privateMode = false;
  mocks.windowId = "original";
  mocks.languagePreferences
    .mockReset()
    .mockImplementation(async (next?: string[]) =>
      next ? { ...initial, selected: next, effective: next } : initial,
    );
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 10, height: 10 } as DOMRect,
  ] as unknown as DOMRectList);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function view(
  test: (
    host: HTMLElement,
    render: (active?: boolean) => Promise<void>,
    close: ReturnType<typeof vi.fn>,
  ) => Promise<void>,
) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const close = vi.fn();
  const render = async (active = true) => {
    await act(async () => root.render(<LanguagesSetting active={active} onClose={close} />));
  };
  try {
    await render();
    await test(host, render, close);
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
}
async function click(host: HTMLElement, label: string) {
  const button = [...host.querySelectorAll<HTMLButtonElement>("button")].find(
    (item) => item.getAttribute("aria-label") === label || item.textContent?.trim() === label,
  )!;
  await act(async () => {
    button.focus();
    button.click();
  });
}
async function change(host: HTMLElement, code: string, next: string) {
  await act(async () => {
    const select = host.querySelector<HTMLSelectElement>(`[aria-label="Language ${code}"]`)!;
    select.value = next;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
function held() {
  let resolve!: (value: unknown) => void, reject!: (reason: unknown) => void;
  const promise = new Promise((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
it("edits the numbered list locally and commits the complete ordered draft only on Save", async () => {
  await view(async (host, _render, close) => {
    await click(host, "Add");
    await change(host, "en-GB", "es-ES");
    await click(host, "Move es-ES up");
    await click(host, "Remove en");
    expect(mocks.languagePreferences.mock.calls).toEqual([[]]);
    expect([...host.querySelectorAll("select")].map((item) => item.value)).toEqual(["en-US", "es-ES"]);
    await click(host, "Save");
    expect(mocks.languagePreferences.mock.calls).toEqual([[], [["en-US", "es-ES"]]]);
    expect(close).toHaveBeenCalledOnce();
  });
});
it("Cancel discards edits without native writes", async () => {
  await view(async (host, _render, close) => {
    await click(host, "Remove en");
    await click(host, "Cancel");
    expect(mocks.languagePreferences.mock.calls).toEqual([[]]);
    expect(close).toHaveBeenCalledOnce();
    expect(host.querySelectorAll("select")).toHaveLength(2);
  });
});
it("keyboard reordering preserves the focused row and does not apply preferences", async () => {
  await view(async (host) => {
    const handle = host.querySelector<HTMLButtonElement>('[aria-label="Reorder en"]')!;
    handle.focus();
    await act(async () =>
      handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true })),
    );
    expect([...host.querySelectorAll("select")].map((item) => item.value)).toEqual(["en", "en-US"]);
    expect(document.activeElement).toBe(handle);
    expect(mocks.languagePreferences).toHaveBeenCalledTimes(1);
  });
});
it("retains a failed draft for an explicit retry and closes only on success", async () => {
  const reason = new Error("native write refused");
  mocks.languagePreferences
    .mockResolvedValueOnce(initial)
    .mockRejectedValueOnce(reason)
    .mockResolvedValue({ ...initial, selected: ["en-US"] });
  await view(async (host, _render, close) => {
    await click(host, "Remove en");
    const save = host.querySelector<HTMLButtonElement>('[data-command-id="save-site-languages"]')!;
    save.focus();
    await act(async () => expect(executeCommand("save-site-languages")).rejects.toBe(reason));
    expect(close).not.toHaveBeenCalled();
    expect(host.querySelectorAll("select")).toHaveLength(1);
    expect(host.textContent).toContain(reason.message);
    await click(host, "Save");
    expect(close).toHaveBeenCalledOnce();
  });
});
for (const retirement of ["Private", "window", "inactive"] as const)
  it(`retires pending saves across ${retirement} A→B→A without changing or closing the fresh draft`, async () => {
    const old = held();
    mocks.languagePreferences
      .mockResolvedValueOnce(initial)
      .mockReturnValueOnce(old.promise)
      .mockResolvedValue(initial);
    await view(async (host, render, close) => {
      await click(host, "Remove en");
      await click(host, "Save");
      if (retirement === "Private") mocks.privateMode = true;
      else if (retirement === "window") mocks.windowId = "foreign";
      await render(retirement !== "inactive");
      mocks.privateMode = false;
      mocks.windowId = "original";
      await render();
      await click(host, "Add");
      await act(async () => old.resolve({ ...initial, selected: ["en-US"] }));
      expect(close).not.toHaveBeenCalled();
      expect(host.querySelectorAll("select")).toHaveLength(3);
      expect(host.textContent).not.toContain("retired");
    });
  });
it("rejects hidden, unfocused, managed and private native writes", async () => {
  await view(async (host) => {
    await click(host, "Remove en");
    host.tabIndex = -1;
    host.focus();
    await expect(executeCommand("save-site-languages")).rejects.toThrow();
    host.hidden = true;
    host.querySelector<HTMLButtonElement>('[data-command-id="save-site-languages"]')!.focus();
    await expect(executeCommand("save-site-languages")).rejects.toThrow();
    expect(mocks.languagePreferences).toHaveBeenCalledTimes(1);
  });
  mocks.languagePreferences.mockResolvedValue({ ...initial, managed: true });
  await view(async (host) => {
    expect([...host.querySelectorAll("select")].every((item) => item.disabled)).toBe(true);
    expect(host.textContent).toContain("Managed");
  });
  mocks.privateMode = true;
  mocks.languagePreferences.mockClear();
  await view(async (host) => {
    expect(host.querySelector("select")).toBeNull();
    expect(mocks.languagePreferences).not.toHaveBeenCalled();
  });
});
it("preserves arbitrary valid language codes and refuses duplicates or malformed input", async () => {
  await view(async (host) => {
    const input = host.querySelector<HTMLInputElement>('[aria-label="Language code"]')!;
    const type = async (text: string) =>
      act(async () => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, text);
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
    const submit = async () =>
      act(async () =>
        host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
      );
    await type("EN-us");
    await submit();
    expect(host.textContent).toContain("already listed");
    await type("not_a_code");
    await submit();
    expect(host.textContent).toContain("Enter a language code");
    await type("eo");
    await submit();
    expect([...host.querySelectorAll("select")].map((item) => item.value)).toContain("eo");
    expect(mocks.languagePreferences).toHaveBeenCalledTimes(1);
    await click(host, "Save");
    expect(mocks.languagePreferences).toHaveBeenLastCalledWith(["en-US", "en", "eo"]);
  });
});
it("enforces one to twenty languages and retains forced policy information", async () => {
  mocks.languagePreferences.mockResolvedValue({ ...initial, selected: ["en-US"], forced: ["fr"] });
  await view(async (host) => {
    expect(host.querySelector<HTMLButtonElement>('[aria-label="Remove en-US"]')!.disabled).toBe(true);
    expect(host.textContent).toContain("Required by policy");
  });
  mocks.languagePreferences.mockResolvedValue({
    ...initial,
    selected: Array.from({ length: 20 }, (_, i) => `en-${i + 10}`),
  });
  await view(async (host) => {
    expect(
      [...host.querySelectorAll<HTMLButtonElement>("button")].find(
        (item) => item.textContent?.trim() === "Add",
      )!.disabled,
    ).toBe(true);
  });
});
it("keeps a fresh pending save when a retired completion finally arrives", async () => {
  const old = held(),
    fresh = held();
  mocks.languagePreferences
    .mockResolvedValueOnce(initial)
    .mockReturnValueOnce(old.promise)
    .mockResolvedValueOnce(initial)
    .mockReturnValueOnce(fresh.promise);
  await view(async (host, render, close) => {
    await click(host, "Remove en");
    await click(host, "Save");
    await render(false);
    await render();
    await click(host, "Remove en");
    await click(host, "Save");
    await act(async () => old.reject(new Error("retired failure")));
    expect(host.querySelector<HTMLSelectElement>("select")!.disabled).toBe(true);
    expect(close).not.toHaveBeenCalled();
    expect(host.textContent).not.toContain("retired failure");
    await act(async () => fresh.resolve({ ...initial, selected: ["en-US"] }));
    expect(close).toHaveBeenCalledOnce();
  });
});
it("reports synchronous native refusal and keeps the draft editable", async () => {
  const reason = new Error("sync native refusal");
  mocks.languagePreferences.mockResolvedValueOnce(initial).mockImplementationOnce(() => {
    throw reason;
  });
  await view(async (host, _render, close) => {
    await click(host, "Remove en");
    host.querySelector<HTMLButtonElement>('[data-command-id="save-site-languages"]')!.focus();
    await act(async () => expect(executeCommand("save-site-languages")).rejects.toBe(reason));
    expect(close).not.toHaveBeenCalled();
    expect(host.querySelector<HTMLSelectElement>("select")!.disabled).toBe(false);
    expect(host.textContent).toContain(reason.message);
  });
});
it("retries a failed native read without treating an empty view as an editable draft", async () => {
  mocks.languagePreferences
    .mockRejectedValueOnce(new Error("language read unavailable"))
    .mockResolvedValueOnce(initial);
  await view(async (host) => {
    expect(host.querySelector("select")).toBeNull();
    await click(host, "Retry");
    expect(host.querySelectorAll("select")).toHaveLength(2);
    expect(host.textContent).not.toContain("unavailable");
  });
});
