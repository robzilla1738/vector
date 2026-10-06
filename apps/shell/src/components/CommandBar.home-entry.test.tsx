// @vitest-environment jsdom
import { act, type ReactNode, type RefObject } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { CommandBar } from "./CommandBar";
import { dispatchShortcut, executeCommand } from "../commands";

// Keep actual CommandBar and HomeAsk mode/state wiring; omit unrelated chat RPCs.
vi.mock("./Conversation", () => ({
  Conversation: ({
    entryControls,
    composerRef,
  }: {
    entryControls?: ReactNode;
    composerRef: RefObject<HTMLTextAreaElement | null>;
  }) => (
    <section>
      <textarea aria-label="Home conversation draft" ref={composerRef} />
      {entryControls}
    </section>
  ),
}));
const initial = useStore.getState(),
  originalPrivate = bridge.privateMode;
const legacyKey = "aux.home.entry-mode.v1";
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
let values: Map<string, string>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  values = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  });
  Element.prototype.scrollIntoView ??= () => {};
  bridge.privateMode = false;
  useStore.setState(
    { ...initial, settings: {}, railOpen: false, agentDraft: "", conversationId: null, toasts: [] },
    true,
  );
  vi.spyOn(bridge, "focusShell").mockResolvedValue(undefined);
  vi.spyOn(bridge, "invoke").mockResolvedValue({} as never);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  bridge.privateMode = originalPrivate;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function render(hero = true) {
  // Resolve the actual lazy component, rather than guessing a module-load delay.
  await act(async () => {
    await import("./HomeAsk");
    root.render(<CommandBar hero={hero} />);
  });
}
function modeButton(label: string) {
  return [...host.querySelectorAll<HTMLButtonElement>("button")].find(
    (button) => button.textContent === label,
  )!;
}

it("opens fresh regular Home in the reference Search entry", async () => {
  await render();
  expect(host.querySelector(".cmdbar input")).not.toBeNull();
  expect(modeButton("Search").getAttribute("aria-pressed")).toBe("true");
  expect(bridge.invoke).not.toHaveBeenCalledWith("settings.set", expect.anything());
});
it.each([
  { mode: "search", selector: ".cmdbar input", other: "ask" },
  { mode: "ask", selector: ".home-ask textarea", other: "search" },
] as const)(
  "retains explicit $mode ahead of opposite legacy preference",
  async ({ mode, selector, other }) => {
    values.set(legacyKey, other);
    useStore.setState({ settings: { homeEntryMode: mode, dataDir: "/disposable" } });
    await render();
    expect(host.querySelector(selector)).not.toBeNull();
    expect(modeButton(mode === "ask" ? "Ask" : "Search").getAttribute("aria-pressed")).toBe("true");
    expect(bridge.invoke).not.toHaveBeenCalledWith("settings.set", expect.anything());
  },
);
it.each([
  { mode: "search", selector: ".cmdbar input" },
  { mode: "ask", selector: ".home-ask textarea" },
] as const)(
  "migrates legacy $mode only after real preference ACK while retaining its entry choice",
  async ({ mode, selector }) => {
    values.set(legacyKey, mode);
    useStore.setState({ settings: { dataDir: "/disposable" } });
    let resolve!: (value: unknown) => void;
    vi.mocked(bridge.invoke).mockImplementation((method) =>
      method === "settings.set"
        ? (new Promise((r) => {
            resolve = r;
          }) as never)
        : (Promise.resolve({}) as never),
    );
    await render();
    expect(host.querySelector(selector)).not.toBeNull();
    expect(bridge.invoke).toHaveBeenCalledWith("settings.set", { homeEntryMode: mode });
    expect(values.get(legacyKey)).toBe(mode);
    await act(async () => resolve({}));
    expect(values.has(legacyKey)).toBe(false);
  },
);
it("restores explicit Ask after switching to Search fails", async () => {
  useStore.setState({ settings: { homeEntryMode: "ask" } });
  await render();
  vi.mocked(bridge.invoke).mockRejectedValueOnce(new Error("Preference save failed"));
  await act(async () => modeButton("Search").click());
  expect(host.querySelector(".home-ask textarea")).not.toBeNull();
  expect(bridge.invoke).toHaveBeenCalledWith("settings.set", { homeEntryMode: "search" });
});
it("restores explicit Search after switching to Ask fails", async () => {
  useStore.setState({ settings: { homeEntryMode: "search" } });
  await render();
  vi.mocked(bridge.invoke).mockRejectedValueOnce(new Error("Preference save failed"));
  await act(async () => modeButton("Ask").click());
  expect(host.querySelector(".cmdbar input")).not.toBeNull();
  expect(bridge.invoke).toHaveBeenCalledWith("settings.set", { homeEntryMode: "ask" });
});
it("retains legacy Search when its migration save rejects", async () => {
  values.set(legacyKey, "search");
  useStore.setState({ settings: { dataDir: "/disposable" } });
  vi.mocked(bridge.invoke).mockRejectedValueOnce(new Error("Migration failed"));
  await render();
  expect(host.querySelector(".cmdbar input")).not.toBeNull();
  expect(values.get(legacyKey)).toBe("search");
});
it("uses fresh Search even when optional legacy storage is unavailable", async () => {
  vi.stubGlobal("localStorage", {
    getItem: () => {
      throw new Error("Storage unavailable");
    },
    removeItem: () => {},
  });
  await render();
  expect(host.querySelector(".cmdbar input")).not.toBeNull();
});
it.each([
  { name: "private Home", hero: true, privateMode: true },
  { name: "address", hero: false, privateMode: false },
] as const)(
  "keeps $name on existing Search policy without migrating legacy Ask",
  async ({ hero, privateMode }) => {
    bridge.privateMode = privateMode;
    values.set(legacyKey, "ask");
    useStore.setState({ settings: { homeEntryMode: "ask", dataDir: "/disposable" } });
    await render(hero);
    expect(host.querySelector(".cmdbar input")).not.toBeNull();
    expect(host.querySelector(".home-ask")).toBeNull();
    expect(bridge.invoke).not.toHaveBeenCalledWith("settings.set", expect.anything());
  },
);

it("does not remove a newer legacy choice when original migration ACK arrives", async () => {
  values.set(legacyKey, "search");
  useStore.setState({ settings: { dataDir: "/disposable" } });
  let resolve!: (value: unknown) => void;
  vi.mocked(bridge.invoke).mockImplementation((method) =>
    method === "settings.set"
      ? (new Promise((r) => {
          resolve = r;
        }) as never)
      : (Promise.resolve({}) as never),
  );
  await render();
  values.set(legacyKey, "ask");
  await act(async () => resolve({}));
  expect(values.get(legacyKey)).toBe("ask");
});
it("keeps a newer acknowledged preference when an older mode save rejects", async () => {
  useStore.setState({ settings: { homeEntryMode: "search" } });
  await render();
  let reject!: (error: unknown) => void;
  vi.mocked(bridge.invoke).mockImplementation((method) =>
    method === "settings.set"
      ? (new Promise((_, r) => {
          reject = r;
        }) as never)
      : (Promise.resolve({}) as never),
  );
  await act(async () => modeButton("Ask").click());
  await act(async () => useStore.setState({ settings: { homeEntryMode: "ask" } }));
  await act(async () => reject(new Error("Old save failed")));
  expect(host.querySelector(".home-ask textarea")).not.toBeNull();
});

it("moves original search text into the retained draft through the registered Tab input action", async () => {
  useStore.setState({ settings: { homeEntryMode: "search" } });
  await render();
  const input = host.querySelector<HTMLInputElement>(".cmdbar input")!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(
      input,
      "Original page-free question",
    );
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
  await act(async () => input.dispatchEvent(event));
  expect(event.defaultPrevented).toBe(true);
  expect(useStore.getState().agentDraft).toBe("Original page-free question");
  expect(host.querySelector(".home-ask textarea")).not.toBeNull();
  expect(bridge.invoke).toHaveBeenCalledWith("settings.set", { homeEntryMode: "ask" });
  await act(async () => modeButton("Search").click());
  expect(host.querySelector<HTMLInputElement>(".cmdbar input")!.value).toBe("");
  expect(useStore.getState().agentDraft).toBe("Original page-free question");
});
it("routes a focused remapped Home Ask command through its actual original action", async () => {
  useStore.setState({
    settings: {
      homeEntryMode: "search",
      shortcutOverrides: { "select-home-ask": [{ key: "j", command: true, alt: true }] },
    },
  });
  await render();
  modeButton("Ask").focus();
  await act(async () => {
    expect(dispatchShortcut({ key: "j", meta: true, alt: true, shift: false })).toBe(true);
  });
  expect(host.querySelector(".home-ask textarea")).not.toBeNull();
  expect(vi.mocked(bridge.invoke).mock.calls.filter(([method]) => method === "settings.set")).toHaveLength(1);
});
it("preserves original pending preference failure without rollback or toast after observed window retirement", async () => {
  useStore.setState({ settings: { homeEntryMode: "search" } });
  await render();
  let reject!: (reason: Error) => void;
  const fallback = vi.mocked(bridge.invoke).getMockImplementation()!;
  vi.mocked(bridge.invoke).mockImplementation((method, params) =>
    method === "settings.set"
      ? new Promise((_done, fail) => {
          reject = fail;
        })
      : fallback(method, params),
  );
  let completion!: Promise<unknown>;
  await act(async () => {
    modeButton("Ask").focus();
    completion = executeCommand("select-home-ask");
    void completion.catch(() => {});
  });
  modeButton("Search").focus();
  const original = bridge.windowId;
  try {
    bridge.windowId = "foreign";
    await expect(executeCommand("select-home-search")).rejects.toThrow("current Home");
    bridge.windowId = original;
    await expect(executeCommand("select-home-search")).rejects.toThrow("current Home");
    const reason = new Error("Retired original mode rejection");
    await act(async () => {
      reject(reason);
      await expect(completion).rejects.toBe(reason);
    });
    expect(host.querySelector(".home-ask textarea")).not.toBeNull();
    expect(useStore.getState().toasts).toEqual([]);
  } finally {
    bridge.windowId = original;
  }
});
it("keeps newer storage when an original mode ACK arrives after unmount", async () => {
  useStore.setState({ settings: { homeEntryMode: "search" } });
  await render();
  let complete!: (value: unknown) => void;
  vi.mocked(bridge.invoke).mockImplementation((method) =>
    method === "settings.set"
      ? (new Promise((done) => {
          complete = done;
        }) as never)
      : (Promise.resolve({}) as never),
  );
  await act(async () => modeButton("Ask").click());
  await act(async () => root.unmount());
  root = createRoot(host);
  values.set(legacyKey, "search");
  await act(async () => complete({ homeEntryMode: "ask" }));
  expect(values.get(legacyKey)).toBe("search");
  expect(useStore.getState().toasts).toEqual([]);
});
it("refuses hidden or unrelated focused Home commands and retains Private search-only presentation", async () => {
  useStore.setState({ settings: { homeEntryMode: "search" } });
  await render();
  const ask = modeButton("Ask");
  ask.focus();
  ask.hidden = true;
  await expect(executeCommand("select-home-ask")).rejects.toThrow("original focused");
  ask.hidden = false;
  const foreign = document.createElement("button");
  document.body.append(foreign);
  foreign.focus();
  await expect(executeCommand("select-home-ask")).rejects.toThrow("original focused");
  foreign.remove();
  bridge.privateMode = true;
  await render();
  expect(host.querySelector('[aria-label="Search or Ask"]')).toBeNull();
  expect(host.querySelector(".private-search-label")?.textContent).toBe("Private");
  await expect(executeCommand("select-home-ask")).rejects.toThrow();
  expect(vi.mocked(bridge.invoke).mock.calls.filter(([method]) => method === "settings.set")).toEqual([]);
});

it("returns the original preference ACK through the mounted scoped command", async () => {
  await render();
  modeButton("Search").focus();
  const ack = { homeEntryMode: "search" };
  vi.mocked(bridge.invoke).mockResolvedValueOnce(ack as never);
  await act(async () => {
    await expect(executeCommand("select-home-search")).resolves.toBe(ack);
  });
  expect(host.querySelector(".cmdbar input")).not.toBeNull();
});

it("keeps disconnected Home switches usable with original held preference acknowledgments", async () => {
  useStore.setState({ connected: false, settings: { homeEntryMode: "search" } });
  await render();
  const acknowledgments: ((value: unknown) => void)[] = [];
  const fallback = vi.mocked(bridge.invoke).getMockImplementation()!;
  vi.mocked(bridge.invoke).mockImplementation((method, params) =>
    method === "settings.set"
      ? new Promise((resolve) => acknowledgments.push(resolve))
      : fallback(method, params),
  );
  let ask!: Promise<unknown>;
  await act(async () => {
    modeButton("Ask").focus();
    ask = executeCommand("select-home-ask");
  });
  expect(host.querySelector(".home-ask textarea")).not.toBeNull();
  const askAck = { homeEntryMode: "ask" };
  await act(async () => {
    acknowledgments[0]!(askAck);
    await expect(ask).resolves.toBe(askAck);
  });
  let search!: Promise<unknown>;
  await act(async () => {
    modeButton("Search").focus();
    search = executeCommand("select-home-search");
  });
  expect(host.querySelector(".cmdbar input")).not.toBeNull();
  const searchAck = { homeEntryMode: "search" };
  await act(async () => {
    acknowledgments[1]!(searchAck);
    await expect(search).resolves.toBe(searchAck);
  });
  expect(useStore.getState().connected).toBe(false);
  expect(
    vi
      .mocked(bridge.invoke)
      .mock.calls.filter(([method]) => method === "settings.set")
      .map(([, args]) => args),
  ).toEqual([{ homeEntryMode: "ask" }, { homeEntryMode: "search" }]);
});
