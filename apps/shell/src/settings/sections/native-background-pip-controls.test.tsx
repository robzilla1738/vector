// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  privateMode: false,
  windowId: "window-a",
  native: true,
  preview: false,
  background: vi.fn(),
  pip: vi.fn(),
}));
vi.mock("../../bridge", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../bridge")>()),
  bridge: {
    ...(await importOriginal<typeof import("../../bridge")>()).bridge,
    get privateMode() {
      return mocks.privateMode;
    },
    get windowId() {
      return mocks.windowId;
    },
    windowKind: "normal",
    keepRuntimeInBackground: mocks.background,
    automaticPictureInPicture: mocks.pip,
  },
  get inNativeHost() {
    return mocks.native;
  },
  get inMock() {
    return mocks.preview;
  },
}));
import { BackgroundRuntimeSetting } from "./BackgroundRuntime";
import { PictureInPictureSetting } from "./PictureInPicture";
import { dispatchShortcut, executeCommand } from "../../commands";
import { COMMANDS } from "@aux/contracts";
const surfaces = [
  {
    name: "background",
    Component: BackgroundRuntimeSetting,
    producer: mocks.background,
    command: "toggle-background-runtime",
    retry: "retry-background-runtime",
    input: "input",
    arg: true,
    initial: { enabled: false, available: true, managed: false },
    changed: { enabled: true, available: true, managed: false },
  },
  {
    name: "picture in picture",
    Component: PictureInPictureSetting,
    producer: mocks.pip,
    command: "set-auto-picture-in-picture",
    retry: "retry-auto-picture-in-picture",
    input: "select",
    arg: "block",
    initial: { mode: "ask", managed: false },
    changed: { mode: "block", managed: false },
  },
] as const;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  mocks.privateMode = false;
  mocks.windowId = "window-a";
  mocks.native = true;
  mocks.preview = false;
  mocks.background.mockReset().mockImplementation(async (enabled?: boolean) => ({
    enabled: enabled ?? false,
    available: true,
    managed: false,
  }));
  mocks.pip
    .mockReset()
    .mockImplementation(async (mode?: string) => ({ mode: mode ?? "ask", managed: false }));
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 10, height: 10 } as DOMRect,
  ] as unknown as DOMRectList);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function held<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
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
  const control = (host: HTMLElement) =>
    host.querySelector<HTMLInputElement | HTMLSelectElement>(spec.input)!;
  async function change(host: HTMLElement) {
    await act(async () => {
      const node = control(host);
      if (node instanceof HTMLSelectElement) {
        node.value = "block";
        node.dispatchEvent(new Event("change", { bubbles: true }));
      } else node.click();
    });
  }
  it(`${spec.name} retains actual input producer arguments and original native ACK`, async () => {
    spec.producer.mockResolvedValueOnce(spec.initial).mockResolvedValueOnce(spec.changed);
    await view(async (host) => {
      expect(spec.producer.mock.calls).toEqual([[]]);
      await change(host);
      expect(spec.producer.mock.calls).toEqual([[], [spec.arg]]);
      expect(spec.input === "input" ? (control(host) as HTMLInputElement).checked : control(host).value).toBe(
        spec.input === "input" ? true : "block",
      );
    });
    spec.producer.mockResolvedValueOnce(spec.initial).mockResolvedValueOnce(spec.changed);
    await view(async (host) => {
      control(host).focus();
      if (spec.input === "select") control(host).value = "block";
      await act(async () => expect(await executeCommand(spec.command)).toBe(spec.changed));
    });
  });
  it(`${spec.name} preserves original rejection and focused native Retry`, async () => {
    const reason = new Error("original native refusal");
    spec.producer
      .mockResolvedValueOnce(spec.initial)
      .mockRejectedValueOnce(reason)
      .mockResolvedValueOnce(spec.changed);
    await view(async (host) => {
      control(host).focus();
      if (spec.input === "select") control(host).value = "block";
      await act(async () => expect(executeCommand(spec.command)).rejects.toBe(reason));
      expect(control(host).disabled).toBe(false);
      expect(host.textContent).toContain(reason.message);
      host.querySelector("button")!.focus();
      await act(async () => expect(await executeCommand(spec.retry)).toBe(spec.changed));
      expect(host.querySelector('[role="alert"]')).toBeNull();
    });
  });
  for (const retirement of ["Private", "window"] as const)
    it(`${spec.name} retires held reply across ${retirement} A→B→A`, async () => {
      const pending = held<unknown>();
      spec.producer
        .mockResolvedValueOnce(spec.initial)
        .mockReturnValueOnce(pending.promise)
        .mockResolvedValue(spec.initial);
      await view(async (host, render) => {
        await change(host);
        if (retirement === "Private") mocks.privateMode = true;
        else mocks.windowId = "other-window";
        await render();
        mocks.privateMode = false;
        mocks.windowId = "window-a";
        await render();
        await act(async () => pending.resolve(spec.changed));
        expect(
          spec.input === "input" ? (control(host) as HTMLInputElement).checked : control(host).value,
        ).toBe(spec.input === "input" ? false : "ask");
      });
    });
  it(`${spec.name} protects fresh pending operation from old finally`, async () => {
    const old = held<unknown>(),
      fresh = held<unknown>();
    spec.producer
      .mockResolvedValueOnce(spec.initial)
      .mockReturnValueOnce(old.promise)
      .mockResolvedValueOnce(spec.initial)
      .mockReturnValueOnce(fresh.promise);
    await view(async (host, render) => {
      await change(host);
      await render(false);
      await render();
      await change(host);
      await act(async () => old.resolve(spec.changed));
      expect(control(host).disabled).toBe(true);
      await act(async () => fresh.resolve(spec.changed));
      expect(control(host).disabled).toBe(false);
    });
  });
  it(`${spec.name} refuses managed, hidden and unfocused controls`, async () => {
    spec.producer.mockResolvedValue({ ...spec.initial, managed: true });
    await view(async (host) => {
      control(host).focus();
      expect(control(host).disabled).toBe(true);
      await expect(executeCommand(spec.command)).rejects.toThrow();
      expect(spec.producer.mock.calls.every((args) => args.length === 0)).toBe(true);
    });
    spec.producer.mockResolvedValue(spec.initial);
    await view(async (host) => {
      await expect(executeCommand(spec.command)).rejects.toThrow();
      control(host).focus();
      host.hidden = true;
      await expect(executeCommand(spec.command)).rejects.toThrow();
      expect(spec.producer.mock.calls.every((args) => args.length === 0)).toBe(true);
    });
  });
  it(`${spec.name} settles synchronous read/write failure and keeps remapped controls usable`, async () => {
    const reason = new Error("sync preference transport");
    spec.producer
      .mockImplementationOnce(() => {
        throw reason;
      })
      .mockResolvedValueOnce(spec.initial)
      .mockImplementationOnce(() => {
        throw reason;
      })
      .mockResolvedValueOnce(spec.changed);
    await view(async (host) => {
      const retry = host.querySelector("button")!;
      expect(retry.disabled).toBe(false);
      retry.focus();
      await act(async () => expect(await executeCommand(spec.retry)).toBe(spec.initial));
      control(host).focus();
      if (spec.input === "select") control(host).value = "block";
      await act(async () => expect(executeCommand(spec.command)).rejects.toBe(reason));
      expect(control(host).disabled).toBe(false);
      if (spec.input === "select") control(host).value = "block";
      await act(async () =>
        expect(
          dispatchShortcut({ commandId: spec.command, key: "p", meta: true, shift: true, alt: false }),
        ).toBe(true),
      );
      expect(spec.producer).toHaveBeenLastCalledWith(spec.arg);
    });
  });
  it(`${spec.name} retains native/preview capability and Private refusal`, async () => {
    mocks.native = false;
    mocks.preview = false;
    await view(async (host) => {
      expect(host.textContent).toContain("Available in the Aux desktop app.");
      expect(spec.producer).not.toHaveBeenCalled();
    });
    mocks.preview = true;
    await view(async (host) => expect(control(host)).not.toBeNull());
    mocks.privateMode = true;
    await view(async (host) => {
      expect(control(host)).toBeNull();
      expect(host.textContent).toContain("cannot be changed in Private mode");
    });
  });
}
it("background unavailable state remains nonwritable", async () => {
  mocks.background.mockResolvedValue({ enabled: false, available: false, managed: false });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<BackgroundRuntimeSetting active />));
    const input = host.querySelector("input")!;
    expect(input.disabled).toBe(true);
    expect(host.textContent).toContain("Browser background mode is disabled.");
    input.focus();
    await expect(executeCommand("toggle-background-runtime")).rejects.toThrow();
    expect(mocks.background.mock.calls).toEqual([[]]);
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
it("PiP keeps original explicit Ask/Block/Allow enum and all four rows are scoped/remappable", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<PictureInPictureSetting active />));
    expect([...host.querySelector("select")!.options].map((option) => [option.value, option.text])).toEqual([
      ["ask", "Ask each site"],
      ["block", "Block automatic picture in picture"],
      ["allow", "Allow on all sites"],
    ]);
    for (const id of [
      "toggle-background-runtime",
      "retry-background-runtime",
      "set-auto-picture-in-picture",
      "retry-auto-picture-in-picture",
    ])
      expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
        windows: ["normal"],
        palette: false,
        bindings: [],
        intercept: true,
      });
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
