// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  privateMode: false,
  windowId: "original",
  startup: vi.fn(),
  languages: vi.fn(),
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
    windowKind: "normal",
    startupPreferences: mocks.startup,
    languagePreferences: mocks.languages,
  },
  inMock: true,
  inNativeHost: false,
}));
import { StartupSetting } from "./Startup";
import { dispatchShortcut, executeCommand } from "../../commands";
import { COMMANDS } from "@aux/contracts";
const surfaces = [
  {
    name: "startup",
    Component: StartupSetting,
    producer: mocks.startup,
    command: "add-startup-page",
    retry: "retry-startup-preferences",
    input: "new.example",
    normalized: "https://new.example/",
    initial: { mode: "pages", urls: ["https://original.example/"], managed: false },
    changed: { mode: "pages", urls: ["https://original.example/", "https://new.example/"], managed: false },
    args: { mode: "pages", urls: ["https://original.example/", "https://new.example/"] },
  },
] as const;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  mocks.privateMode = false;
  mocks.windowId = "original";
  mocks.startup
    .mockReset()
    .mockImplementation(async (next) => (next ? { ...next, managed: false } : surfaces[0].initial));
  mocks.languages
    .mockReset()
    .mockImplementation(async (next) =>
      next
        ? { selected: next, effective: next, forced: [], managed: false }
        : { selected: ["en-US"], effective: ["en-US"], forced: [], managed: false },
    );
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 10, height: 10 } as DOMRect,
  ] as unknown as DOMRectList);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function held<T>() {
  let resolve!: (value: T) => void, reject!: (reason: unknown) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
const type = async (host: HTMLElement, text: string) =>
  act(async () => {
    const input = host.querySelector<HTMLInputElement>("form input")!;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, text);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
const submit = async (host: HTMLElement) =>
  act(async () => {
    host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
for (const spec of surfaces) {
  async function view(
    test: (host: HTMLDivElement, render: (active?: boolean) => Promise<void>) => Promise<void>,
  ) {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host),
      Component = spec.Component;
    const render = async (active = true) => {
      await act(async () => root.render(<Component active={active} />));
    };
    try {
      await render();
      await test(host, render);
    } finally {
      await act(async () => root.unmount());
      host.remove();
    }
  }
  it(`${spec.name} original form and focused command retain native args and exact ACK`, async () => {
    spec.producer.mockReset().mockResolvedValueOnce(spec.initial).mockResolvedValueOnce(spec.changed);
    await view(async (host) => {
      await type(host, spec.input);
      await submit(host);
      expect(spec.producer.mock.calls).toEqual([[], [spec.args]]);
      expect(host.querySelector<HTMLInputElement>("form input")!.value).toBe("");
      expect(host.textContent).toContain(spec.normalized);
    });
    spec.producer.mockReset().mockResolvedValueOnce(spec.initial).mockResolvedValueOnce(spec.changed);
    await view(async (host) => {
      await type(host, spec.input);
      host.querySelector<HTMLInputElement>("form input")!.focus();
      await act(async () => expect(await executeCommand(spec.command)).toBe(spec.changed));
    });
  });
  it(`${spec.name} rejects exact native failure and retains draft for real Retry`, async () => {
    const reason = new Error("native list write refused");
    spec.producer
      .mockResolvedValueOnce(spec.initial)
      .mockRejectedValueOnce(reason)
      .mockResolvedValueOnce(spec.initial);
    await view(async (host) => {
      await type(host, spec.input);
      host.querySelector<HTMLInputElement>("form input")!.focus();
      await act(async () => expect(executeCommand(spec.command)).rejects.toBe(reason));
      expect(host.querySelector<HTMLInputElement>("form input")!.value).toBe(spec.input);
      expect(host.textContent).toContain(reason.message);
      host.querySelector<HTMLButtonElement>('button[data-command-id="' + spec.retry + '"]')!.focus();
      await act(async () => expect(await executeCommand(spec.retry)).toBe(spec.initial));
      expect(host.querySelector('[role="alert"]')).toBeNull();
    });
  });
  for (const retirement of ["Private", "window", "inactive"] as const)
    it(`${spec.name} retires held save across ${retirement} A→B→A`, async () => {
      const pending = held<unknown>();
      spec.producer
        .mockResolvedValueOnce(spec.initial)
        .mockReturnValueOnce(pending.promise)
        .mockResolvedValue(spec.initial);
      await view(async (host, render) => {
        await type(host, spec.input);
        await submit(host);
        if (retirement === "Private") mocks.privateMode = true;
        else if (retirement === "window") mocks.windowId = "foreign";
        await render(retirement !== "inactive");
        mocks.privateMode = false;
        mocks.windowId = "original";
        await render();
        await type(host, "fr");
        await act(async () => pending.resolve(spec.changed));
        expect(host.querySelector<HTMLInputElement>("form input")!.value).toBe("fr");
        expect(
          host.querySelector(
            `[aria-label="Remove ${spec.name === "startup" ? "startup page " : ""}${spec.normalized}"]`,
          ),
        ).toBeNull();
      });
    });
  it(`${spec.name} keeps fresh pending save after retired old finally`, async () => {
    const old = held<unknown>(),
      fresh = held<unknown>();
    spec.producer
      .mockResolvedValueOnce(spec.initial)
      .mockReturnValueOnce(old.promise)
      .mockResolvedValueOnce(spec.initial)
      .mockReturnValueOnce(fresh.promise);
    await view(async (host, render) => {
      await type(host, spec.input);
      await submit(host);
      await render(false);
      await render();
      await type(host, spec.input);
      await submit(host);
      await act(async () => old.reject(new Error("retired failure")));
      expect(host.querySelector<HTMLInputElement>("form input")!.disabled).toBe(true);
      expect(host.textContent).not.toContain("retired failure");
      await act(async () => fresh.resolve(spec.changed));
      expect(host.querySelector<HTMLInputElement>("form input")!.disabled).toBe(false);
    });
  });
  it(`${spec.name} preserves newer same-text draft and synchronous rejection`, async () => {
    const pending = held<unknown>();
    spec.producer.mockResolvedValueOnce(spec.initial).mockReturnValueOnce(pending.promise);
    await view(async (host) => {
      await type(host, spec.input);
      await submit(host);
      await type(host, "other");
      await type(host, spec.input);
      await act(async () => pending.resolve(spec.changed));
      expect(host.querySelector<HTMLInputElement>("form input")!.value).toBe(spec.input);
    });
    const reason = new Error("sync native refusal");
    spec.producer
      .mockReset()
      .mockResolvedValueOnce(spec.initial)
      .mockImplementationOnce(() => {
        throw reason;
      });
    await view(async (host) => {
      await type(host, spec.input);
      host.querySelector<HTMLInputElement>("form input")!.focus();
      await act(async () => expect(executeCommand(spec.command)).rejects.toBe(reason));
      expect(host.querySelector<HTMLInputElement>("form input")!.disabled).toBe(false);
    });
  });
  it(`${spec.name} refuses managed hidden unfocused and Private original controls`, async () => {
    spec.producer.mockResolvedValue({ ...spec.initial, managed: true });
    await view(async (host) => {
      expect(host.querySelector<HTMLInputElement>("form input")!.disabled).toBe(true);
      host.querySelector<HTMLInputElement>("form input")!.focus();
      await expect(executeCommand(spec.command)).rejects.toThrow();
      expect(spec.producer).toHaveBeenCalledTimes(1);
    });
    spec.producer.mockReset().mockResolvedValue(spec.initial);
    await view(async (host) => {
      await type(host, spec.input);
      await expect(executeCommand(spec.command)).rejects.toThrow();
      host.hidden = true;
      host.querySelector<HTMLInputElement>("form input")!.focus();
      await expect(executeCommand(spec.command)).rejects.toThrow();
      expect(spec.producer).toHaveBeenCalledTimes(1);
    });
    spec.producer.mockClear();
    mocks.privateMode = true;
    await view(async (host) => {
      expect(host.querySelector("form")).toBeNull();
      expect(spec.producer).not.toHaveBeenCalled();
    });
  });
  it(`${spec.name} preserves original duplicate and unsafe draft refusals`, async () => {
    await view(async (host) => {
      await type(host, spec.name === "startup" ? "https://original.example/" : "EN-us");
      await submit(host);
      expect(host.querySelector('[role="alert"]')?.textContent).toContain("already listed");
      await type(host, spec.name === "startup" ? "https://user:secret@example.com" : "not_a_code");
      await submit(host);
      expect(host.querySelector('[role="alert"]')?.textContent).toContain("Enter");
      expect(spec.producer.mock.calls).toEqual([[]]);
    });
  });
  it(`${spec.name} preserves actual20-item native list cap`, async () => {
    spec.producer.mockResolvedValue(
      spec.name === "startup"
        ? {
            ...spec.initial,
            urls: Array.from({ length: 20 }, (_, index) => `https://original${index}.example/`),
          }
        : { ...spec.initial, selected: Array.from({ length: 20 }, (_, index) => `en-${String(index + 10)}`) },
    );
    await view(async (host) => {
      await type(host, spec.input);
      await submit(host);
      expect(host.querySelector('[role="alert"]')?.textContent).toContain("limited to 20");
      expect(spec.producer.mock.calls).toEqual([[]]);
    });
  });
  it(`${spec.name} retry uses remapped focused original button after sync read throw`, async () => {
    spec.producer
      .mockImplementationOnce(() => {
        throw new Error("sync read");
      })
      .mockResolvedValue(spec.initial);
    await view(async (host) => {
      const retry = host.querySelector<HTMLButtonElement>("button")!;
      retry.focus();
      await act(async () =>
        expect(
          dispatchShortcut({ commandId: spec.retry, key: "r", meta: true, shift: false, alt: false }),
        ).toBe(true),
      );
      expect(spec.producer.mock.calls).toEqual([[], []]);
      expect(host.querySelector("form")).not.toBeNull();
    });
  });
}
it("all list actions retain normal remappable scoped metadata", () => {
  for (const id of [
    "set-startup-mode",
    "add-startup-page",
    "remove-startup-page",
    "retry-startup-preferences",
    "add-site-language",
    "set-site-language",
    "save-site-languages",
    "move-site-language-up",
    "move-site-language-down",
    "remove-site-language",
    "retry-language-preferences",
  ])
    expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
      palette: false,
      bindings: [],
      intercept: true,
      windows: ["normal"],
    });
});
