// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  privateMode: false,
  windowId: "one",
  kind: "normal",
  native: true,
  call: vi.fn(),
  choose: vi.fn(),
  reveal: vi.fn(),
}));
vi.mock("../../bridge", async (original) => ({
  ...(await original<typeof import("../../bridge")>()),
  get inNativeHost() {
    return mocks.native;
  },
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
    openFile: mocks.choose,
    revealPath: mocks.reveal,
  },
}));
vi.mock("../../store", async (original) => ({
  ...(await original<typeof import("../../store")>()),
  call: mocks.call,
}));
import { RecoveryPackage } from "./RecoveryPackage";
import { executeCommand } from "../../commands";
import { COMMANDS } from "@aux/contracts";
const review = {
    sha256: "a".repeat(64),
    reviewToken: "11111111-1111-4111-8111-111111111111",
    manifest: {
      createdAt: 1,
      artifactIds: ["fixture"],
      pageMemoryCount: 1,
      spaceMemory: [],
      sqliteTables: ["tasks"],
      excluded: ["credentials"],
    },
  },
  stage = { staged: true, artifactFiles: 1, spaceCount: 0, pageMemoryCount: 1 };
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
  mocks.native = true;
  mocks.call
    .mockReset()
    .mockImplementation(async (method: string) =>
      method === "installation.inspectRecovery"
        ? review
        : method === "installation.exportRecovery"
          ? { path: "/synthetic/package" }
          : stage,
    );
  mocks.choose.mockReset().mockResolvedValue("/synthetic/package");
  mocks.reveal.mockReset().mockResolvedValue(undefined);
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
    render: (active?: boolean, refresh?: number, pending?: boolean) => Promise<void>,
    staged: ReturnType<typeof vi.fn>,
  ) => Promise<void>,
) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host),
    staged = vi.fn();
  const render = async (active = true, refreshVersion = 0, pending = false) =>
    act(async () =>
      root.render(
        <RecoveryPackage
          active={active}
          refreshVersion={refreshVersion}
          pending={pending}
          onStaged={staged}
        />,
      ),
    );
  try {
    await render();
    await test(host, render, staged);
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
}
const button = (host: HTMLElement, id: string) =>
  host.querySelector<HTMLButtonElement>(`[data-command-id="${id}"]`)!;
async function input(host: HTMLElement, index: number, value: string) {
  const node = host.querySelectorAll<HTMLInputElement>("input")[index]!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(node, value);
    node.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
function invoke(host: HTMLElement, id: string) {
  button(host, id).focus();
  return executeCommand(id);
}
it("registers original protected controls as normal remappable focused actions", async () =>
  view(async (host) => {
    for (const id of [
      "create-protected-recovery",
      "choose-protected-recovery",
      "review-protected-recovery",
      "stage-protected-recovery",
    ]) {
      const row = COMMANDS.find((row) => row.id === id);
      expect(row).toMatchObject({ palette: false, windows: ["normal"], bindings: [] });
    }
    expect(button(host, "create-protected-recovery").disabled).toBe(true);
  }));
it("retains original chooser and reviewed hash/token at explicit stage", async () =>
  view(async (host, _render, staged) => {
    await input(host, 0, "synthetic long phrase");
    let completion!: Promise<unknown>;
    await act(async () => {
      completion = invoke(host, "choose-protected-recovery");
      await completion;
    });
    expect(await completion).toBe("/synthetic/package");
    await act(async () => {
      await invoke(host, "review-protected-recovery");
    });
    expect(host.textContent).toContain("Package authenticated");
    await act(async () => {
      completion = invoke(host, "stage-protected-recovery");
      await completion;
    });
    expect(await completion).toBe(stage);
    expect(mocks.call).toHaveBeenLastCalledWith("installation.stageRecovery", {
      path: "/synthetic/package",
      phrase: "synthetic long phrase",
      expectedSha256: review.sha256,
      reviewToken: review.reviewToken,
    });
    expect(staged).toHaveBeenCalledTimes(1);
    expect(host.querySelector<HTMLInputElement>('input[type="password"]')!.value).toBe("");
  }));
it.each(["private", "window", "inactive", "revision"])(
  "retains original held export ACK without %s ABA publication",
  async (transition) =>
    view(async (host, render) => {
      await input(host, 0, "synthetic long phrase");
      const work = held<{ path: string }>();
      mocks.call.mockReturnValueOnce(work.promise);
      let completion!: Promise<unknown>;
      await act(async () => {
        completion = invoke(host, "create-protected-recovery");
      });
      if (transition === "private") mocks.privateMode = true;
      if (transition === "window") mocks.windowId = "two";
      await render(transition !== "inactive", transition === "revision" ? 1 : 0);
      mocks.privateMode = false;
      mocks.windowId = "one";
      await render();
      const ack = { path: "/synthetic/retired" };
      await act(async () => {
        work.resolve(ack);
        expect(await completion).toBe(ack);
      });
      expect(host.textContent).not.toContain("/synthetic/retired");
      expect(mocks.reveal).not.toHaveBeenCalled();
    }),
);
it("retired review cannot revive after original path changes and returns", async () =>
  view(async (host) => {
    await input(host, 0, "synthetic long phrase");
    await input(host, 1, "/synthetic/a");
    const work = held<typeof review>();
    mocks.call.mockReturnValueOnce(work.promise);
    let completion!: Promise<unknown>;
    await act(async () => {
      completion = invoke(host, "review-protected-recovery");
    });
    await input(host, 1, "/synthetic/b");
    await input(host, 1, "/synthetic/a");
    await act(async () => {
      work.resolve(review);
      expect(await completion).toBe(review);
    });
    expect(host.querySelector('[aria-label="Recovery package review"]')).toBeNull();
  }));
it("original synchronous chooser rejection releases busy and keeps identical error", async () =>
  view(async (host) => {
    const reason = new Error("original chooser failure");
    mocks.choose.mockImplementationOnce(() => {
      throw reason;
    });
    await act(async () => {
      await expect(invoke(host, "choose-protected-recovery")).rejects.toBe(reason);
    });
    expect(host.textContent).toContain(reason.message);
    expect(button(host, "choose-protected-recovery").disabled).toBe(false);
    await act(async () => {
      await invoke(host, "choose-protected-recovery");
    });
    expect(mocks.choose).toHaveBeenCalledTimes(2);
  }));
it("current export preserves its genuine ACK when optional reveal rejects", async () =>
  view(async (host) => {
    await input(host, 0, "synthetic long phrase");
    mocks.reveal.mockRejectedValueOnce(new Error("reveal refused"));
    await act(async () => {
      expect(await invoke(host, "create-protected-recovery")).toEqual({ path: "/synthetic/package" });
    });
    expect(host.textContent).toContain("Encrypted package created");
    expect(mocks.reveal).toHaveBeenCalledWith("/synthetic/package");
  }));
it("Private/native capability loss refuses before any authentication producer", async () =>
  view(async (host, render) => {
    await input(host, 0, "synthetic long phrase");
    mocks.privateMode = true;
    await render();
    await act(async () => {
      await expect(invoke(host, "create-protected-recovery")).rejects.toThrow();
    });
    expect(mocks.call).not.toHaveBeenCalled();
    mocks.privateMode = false;
    await render();
    mocks.native = false;
    await act(async () => {
      await expect(invoke(host, "choose-protected-recovery")).rejects.toThrow();
    });
    expect(mocks.choose).not.toHaveBeenCalled();
  }));
it.each(["private", "window", "inactive"])(
  "original clicked export refuses late %s owner delivery",
  async (transition) =>
    view(async (host, render) => {
      await input(host, 0, "synthetic long phrase");
      const work = held<{ path: string }>();
      mocks.call.mockReturnValueOnce(work.promise);
      await act(async () => {
        host.querySelector<HTMLButtonElement>("button")!.click();
      });
      expect(mocks.call).toHaveBeenCalledWith("installation.exportRecovery", {
        phrase: "synthetic long phrase",
      });
      if (transition === "private") mocks.privateMode = true;
      if (transition === "window") mocks.windowId = "two";
      await render(transition !== "inactive");
      mocks.privateMode = false;
      mocks.windowId = "one";
      await render();
      await act(async () => {
        work.resolve({ path: "/synthetic/retired-export" });
        await work.promise;
      });
      expect(host.textContent).not.toContain("/synthetic/retired-export");
      expect(mocks.reveal).not.toHaveBeenCalled();
    }),
);
it("held stage preserves native ACK without retired callback or phrase reuse", async () =>
  view(async (host, render, staged) => {
    await input(host, 0, "synthetic long phrase");
    await input(host, 1, "/synthetic/package");
    await act(async () => {
      await invoke(host, "review-protected-recovery");
    });
    const work = held<typeof stage>();
    mocks.call.mockReturnValueOnce(work.promise);
    let completion!: Promise<unknown>;
    await act(async () => {
      completion = invoke(host, "stage-protected-recovery");
    });
    await render(true, 0, true);
    await render();
    await act(async () => {
      work.resolve(stage);
      expect(await completion).toBe(stage);
    });
    expect(staged).not.toHaveBeenCalled();
    expect(host.textContent).not.toContain("Recovery staged:");
    expect(host.querySelector<HTMLInputElement>('input[type="password"]')!.value).toBe("");
  }));
