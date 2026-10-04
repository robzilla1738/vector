// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { COMMANDS } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { executeCommand, dispatchShortcut } from "../commands";
import { Library } from "./Library";
vi.mock("../use-feature", async (original) => ({
  ...(await original<typeof import("../use-feature")>()),
  useFeature: () => true,
}));
const initial = useStore.getState(),
  originalWindow = bridge.windowId,
  originalPrivate = bridge.privateMode,
  originalKind = bridge.windowKind;
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const ids = {
  view: "select-library-view",
  range: "select-library-history-range",
  retry: "retry-library-load",
  more: "load-more-library-history",
  close: "close-library",
};
const visits = (prefix: string, count = 100) =>
  Array.from({ length: count }, (_, i) => ({
    url: `https://fixture.invalid/${prefix}/${i}`,
    title: `${prefix} ${i}`,
    visitedAt: 100000 - i,
  }));
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  useStore.setState({ ...initial, connected: false, bookmarks: [], toasts: [], overlay: "bookmarks" }, true);
  bridge.windowId = "original-window";
  bridge.privateMode = false;
  bridge.windowKind = "normal";
  vi.spyOn(bridge, "invoke").mockResolvedValue([] as never);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  bridge.windowId = originalWindow;
  bridge.privateMode = originalPrivate;
  bridge.windowKind = originalKind;
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
async function render(view: "bookmarks" | "history" = "history", onClose?: () => void) {
  await act(async () => root.render(<Library initialView={view} onClose={onClose} />));
}
async function tick(time = 1) {
  await act(async () => {
    vi.advanceTimersByTime(time);
    await Promise.resolve();
  });
}
function button(id: string, index = 0) {
  return host.querySelectorAll<HTMLElement>(`[data-command-id="${id}"]`)[index]!;
}
async function command(id: string, node = button(id)) {
  let completion!: Promise<unknown>;
  await act(async () => {
    node.focus();
    completion = executeCommand(id);
    void completion.catch(() => {});
  });
  return { completion };
}
it("five scoped commands preserve original normal and Private Library policy", async () => {
  for (const id of Object.values(ids))
    expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
      windows: ["normal", "private"],
      palette: false,
      bindings: [],
    });
  bridge.privateMode = true;
  await render("bookmarks");
  expect(host.querySelector<HTMLElement>("#library-reading")).toBeNull();
  expect(host.querySelector<HTMLElement>("#library-archived")).toBeNull();
  await command(ids.view, host.querySelector<HTMLElement>("#library-history")!);
  expect(host.querySelector('[aria-label="Search history"]')).not.toBeNull();
  expect(useStore.getState().connected).toBe(false);
});
it("original arrow tab cycle resets query and retains exact next focus", async () => {
  await render("bookmarks");
  const tab = host.querySelector<HTMLButtonElement>("#library-bookmarks")!;
  const event = new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true });
  await act(async () => {
    tab.focus();
    tab.dispatchEvent(event);
  });
  expect(event.defaultPrevented).toBe(true);
  expect(document.activeElement).toBe(host.querySelector<HTMLElement>("#library-reading"));
  expect(host.querySelector('[aria-label="Search reading list"]')).not.toBeNull();
});
it("original initial failure Retry enters actual dispatcher and retains diagnostic", async () => {
  const reason = new Error("Raw original history diagnostic");
  vi.mocked(bridge.invoke)
    .mockRejectedValueOnce(reason)
    .mockResolvedValueOnce(visits("Recovered", 1) as never);
  await render();
  await tick();
  expect(host.querySelector('[role="alert"]')?.textContent).toContain(String(reason));
  expect(button(ids.retry)).toBeTruthy();
  await command(ids.retry);
  await tick();
  expect(host.textContent).toContain("Recovered 0");
  expect(bridge.invoke).toHaveBeenNthCalledWith(1, "history.list", { limit: 100 });
  expect(bridge.invoke).toHaveBeenNthCalledWith(2, "history.list", { limit: 100 });
});
it("real remapped range and Retry preserve exact date filter request", async () => {
  vi.mocked(bridge.invoke)
    .mockRejectedValueOnce(new Error("Failed range"))
    .mockResolvedValue([] as never);
  await render();
  await tick();
  await act(async () =>
    useStore.setState({
      settings: {
        shortcutOverrides: {
          [ids.retry]: [{ key: "r", command: true, alt: true }],
          [ids.range]: [{ key: "d", command: true, alt: true }],
        },
      },
    }),
  );
  await act(async () => {
    button(ids.retry).focus();
    expect(dispatchShortcut({ key: "r", meta: true, alt: true, shift: false })).toBe(true);
  });
  await tick();
  const today = button(ids.range, 1);
  await act(async () => {
    today.focus();
    expect(dispatchShortcut({ key: "d", meta: true, alt: true, shift: false })).toBe(true);
  });
  await tick();
  expect(today.getAttribute("aria-pressed")).toBe("true");
  expect(bridge.invoke).toHaveBeenLastCalledWith("history.list", { limit: 100, since: expect.any(Number) });
});
it("actual pagination cursor and more Retry remain original and serial", async () => {
  const first = visits("First");
  vi.mocked(bridge.invoke)
    .mockResolvedValueOnce(first as never)
    .mockRejectedValueOnce(new Error("Older failed"))
    .mockResolvedValueOnce(visits("Older", 1) as never);
  await render();
  await tick();
  await command(ids.more);
  expect(host.textContent).toContain("Older failed");
  await command(ids.retry);
  expect(host.textContent).toContain("Older 0");
  expect(bridge.invoke).toHaveBeenNthCalledWith(2, "history.list", {
    limit: 100,
    before: { visitedAt: 99901, url: "https://fixture.invalid/First/99" },
  });
  expect(bridge.invoke).toHaveBeenNthCalledWith(3, "history.list", {
    limit: 100,
    before: { visitedAt: 99901, url: "https://fixture.invalid/First/99" },
  });
  expect(host.querySelectorAll(".library-open")).toHaveLength(101);
});
it("held initial read failure after observed foreign window ABA cannot publish", async () => {
  let reject!: (reason: unknown) => void;
  vi.mocked(bridge.invoke).mockImplementation(
    () =>
      new Promise((_, fail) => {
        reject = fail;
      }),
  );
  await render();
  await tick();
  bridge.windowId = "foreign";
  await act(async () => host.querySelector<HTMLButtonElement>("#library-history")!.click());
  bridge.windowId = "original-window";
  await act(async () => reject(new Error("Retired original diagnostic")));
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(useStore.getState().toasts).toEqual([]);
});
it("held bookmark read after observed foreign owner cannot publish global saved pages", async () => {
  let resolve!: (value: unknown) => void;
  vi.mocked(bridge.invoke).mockImplementation((method) =>
    method === "bookmarks.list"
      ? new Promise((yes) => {
          resolve = yes;
        })
      : Promise.resolve([]),
  );
  await render("bookmarks");
  await tick();
  bridge.windowId = "foreign";
  await act(async () => host.querySelector<HTMLButtonElement>("#library-history")!.click());
  bridge.windowId = "original-window";
  await act(async () => resolve([{ url: "https://fixture.invalid/retired", title: "Retired bookmark" }]));
  expect(useStore.getState().bookmarks).toEqual([]);
});
it("held older visits after view transition cannot overwrite new history or pending state", async () => {
  let resolve!: (value: unknown) => void;
  vi.mocked(bridge.invoke)
    .mockResolvedValueOnce(visits("First") as never)
    .mockImplementationOnce(
      () =>
        new Promise((yes) => {
          resolve = yes;
        }),
    )
    .mockResolvedValue([] as never);
  await render();
  await tick();
  await command(ids.more);
  await command(ids.view, host.querySelector<HTMLElement>("#library-bookmarks")!);
  await tick();
  await act(async () => resolve(visits("Retired", 1)));
  expect(host.textContent).not.toContain("Retired 0");
  expect(host.querySelector('[aria-label="Search bookmarks"]')).not.toBeNull();
  expect(host.querySelector('[role="alert"]')).toBeNull();
});
it("queued read refuses retired owner before producing native request", async () => {
  await render();
  bridge.windowId = "foreign";
  await act(async () => host.querySelector<HTMLButtonElement>("#library-history")!.click());
  bridge.windowId = "original-window";
  await tick();
  expect(bridge.invoke).not.toHaveBeenCalled();
});
it("close button, backdrop and Escape retain actual local callback, remap owner", async () => {
  const close = vi.fn();
  await render("bookmarks", close);
  await act(async () => button(ids.close).click());
  expect(close).toHaveBeenCalledTimes(1);
  await act(async () =>
    host
      .querySelector<HTMLElement>(".overlay-scrim")!
      .dispatchEvent(new MouseEvent("mousedown", { bubbles: true })),
  );
  expect(close).toHaveBeenCalledTimes(2);
  await act(async () =>
    host
      .querySelector<HTMLElement>('[role="dialog"]')!
      .dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })),
  );
  expect(close).toHaveBeenCalledTimes(3);
  await act(async () =>
    useStore.setState({
      settings: { shortcutOverrides: { [ids.close]: [{ key: "l", command: true, alt: true }] } },
    }),
  );
  await act(async () => {
    button(ids.close).focus();
    expect(dispatchShortcut({ key: "l", meta: true, alt: true, shift: false })).toBe(true);
  });
  expect(close).toHaveBeenCalledTimes(4);
  bridge.windowId = "foreign";
  await act(async () => button(ids.close).click());
  expect(close).toHaveBeenCalledTimes(4);
});

it("held query A to B to A read cannot deliver its old failure over newest matching request", async () => {
  const pending: { resolve(value: unknown): void; reject(reason: unknown): void }[] = [];
  vi.mocked(bridge.invoke).mockImplementation(
    () => new Promise((resolve, reject) => pending.push({ resolve, reject })),
  );
  await render();
  await tick();
  async function type(value: string) {
    const input = host.querySelector<HTMLInputElement>('[aria-label="Search history"]')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await tick(120);
  }
  await type("Needle");
  await type("");
  expect(pending).toHaveLength(3);
  await act(async () => pending[2]!.resolve(visits("Latest", 1)));
  await act(async () => pending[0]!.reject(new Error("Old query diagnostic")));
  await act(async () => pending[1]!.resolve(visits("Retired needle", 1)));
  expect(host.textContent).toContain("Latest 0");
  expect(host.textContent).not.toContain("Retired needle");
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(host.querySelector<HTMLInputElement>('[aria-label="Search history"]')!.value).toBe("");
  expect(bridge.invoke).toHaveBeenNthCalledWith(2, "history.list", { query: "Needle", limit: 100 });
});

it("new committed window read remains usable while original held callback stays retired", async () => {
  const pending: { resolve(value: unknown): void; reject(reason: unknown): void }[] = [];
  vi.mocked(bridge.invoke).mockImplementation(
    () => new Promise((resolve, reject) => pending.push({ resolve, reject })),
  );
  await render();
  await tick();
  bridge.windowId = "new-window";
  await render();
  await tick();
  expect(pending).toHaveLength(2);
  await act(async () => pending[1]!.resolve(visits("Current window", 1)));
  await act(async () => pending[0]!.reject(new Error("Original window error")));
  expect(host.textContent).toContain("Current window 0");
  expect(host.querySelector('[role="alert"]')).toBeNull();
  await command(ids.range, button(ids.range, 1));
  await tick();
  expect(pending).toHaveLength(3);
  await act(async () => pending[2]!.resolve(visits("Current range", 1)));
  expect(host.textContent).toContain("Current range 0");
});
