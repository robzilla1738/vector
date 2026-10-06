// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
vi.mock("./bridge", async importOriginal => ({ ...await importOriginal<typeof import("./bridge")>(), inNativeHost: true }));
import { bridge } from "./bridge";
import { CommandSurface } from "./components/CommandSurface";
import { useStore } from "./store";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
Element.prototype.scrollIntoView ??= () => {};

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

it("shows local history while slower saved-work sources are still pending", async () => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  useStore.setState({ pages: [], activePageId: null, bookmarks: [], closedTabs: [], runs: [], sets: [], sessions: [],
    conversationDrafts: [], settings: {} } as never);
  const pending = new Promise<never>(() => {});
  vi.spyOn(bridge, "autocomplete").mockResolvedValue([{ id: "needle", type: "history", url: "https://needle.example.test/", title: "Needle source" }]);
  vi.spyOn(bridge, "invoke").mockImplementation(async (method: string) => {
    if (method === "conversations.prepared") return [] as never;
    if (method === "history.list") return [{ url: "https://needle.example.test/", title: "Needle source", visitedAt: Date.now() }] as never;
    return pending;
  });
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  try {
    vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
    await act(async () => root.render(<CommandSurface request={{ mode: "new-tab", sequence: 1 }} executeCommand={vi.fn()} />));
    const input = host.querySelector<HTMLInputElement>('input[role="combobox"]')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "needle");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => { await vi.advanceTimersByTimeAsync(130); });
    expect(host.textContent).toContain("Needle source");
    expect(host.textContent).toContain("Searching saved work");
  } finally { await act(async () => root.unmount()); }
});

it("binds registered command rows to the current surface and query", async () => {
  useStore.setState({ pages: [], activePageId: null, bookmarks: [], closedTabs: [], runs: [], sets: [],
    sessions: [], conversationDrafts: [], settings: {} } as never);
  vi.spyOn(bridge, "autocomplete").mockResolvedValue([]);
  vi.spyOn(bridge, "invoke").mockResolvedValue([] as never);
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  try {
    vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
    await act(async () => root.render(<CommandSurface request={{ mode: "command", sequence: 8 }} executeCommand={vi.fn()} />));
    const input = host.querySelector<HTMLInputElement>('input[role="combobox"]')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "/reload");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const row = host.querySelector<HTMLElement>('[role="option"][data-command-result-source="registry"]')!;
    expect(row).not.toBeNull();
    expect(row.closest<HTMLElement>("[data-command-id]")?.dataset.commandId).toBe("reload");
    expect(row.dataset.commandResultGeneration).toBe(input.dataset.commandValueGeneration);
    expect(host.querySelector('[data-command-surface-sequence="8"]')?.contains(row)).toBe(true);
    await act(async () => root.render(<CommandSurface key={9} request={{ mode: "command", sequence: 9 }} executeCommand={vi.fn()} />));
    expect(host.querySelector('[data-command-surface-sequence="8"]')).toBeNull();
    expect(host.querySelector<HTMLInputElement>('input[role="combobox"]')!.value).toBe("");
    const freshRow = host.querySelector<HTMLElement>('[data-command-result-source="registry"]')!;
    expect(freshRow.dataset.commandResultGeneration).toBe("0");
    expect(freshRow.dataset.commandResultGeneration).not.toBe(row.dataset.commandResultGeneration);
    expect(host.querySelector('[data-command-surface-sequence="9"]')?.contains(freshRow)).toBe(true);
  } finally { await act(async () => root.unmount()); }
});
