// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
vi.mock("./bridge", async importOriginal => ({ ...await importOriginal<typeof import("./bridge")>(), inElectron: true }));
import { bridge } from "./bridge";
import { Palette } from "./components/Palette";
import { useStore } from "./store";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
Element.prototype.scrollIntoView ??= () => {};

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });

it("shows local history while slower saved-work sources are still pending", async () => {
  useStore.setState({ pages: [], activePageId: null, bookmarks: [], closedTabs: [], runs: [], sets: [], sessions: [],
    conversationDrafts: [], settings: {}, paletteSeed: "" } as never);
  const pending = new Promise<never>(() => {});
  vi.spyOn(bridge, "invoke").mockImplementation(async (method: string) => {
    if (method === "conversations.prepared") return [] as never;
    if (method === "history.list") return [{ url: "https://needle.example.test/", title: "Needle source", visitedAt: Date.now() }] as never;
    return pending;
  });
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<Palette />));
    const input = host.querySelector<HTMLInputElement>('input[role="combobox"]')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "needle");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => new Promise(resolve => setTimeout(resolve, 130)));
    expect(host.querySelector(".pal-item.history .t")?.textContent ?? host.textContent).toContain("Needle source");
    expect(host.textContent).toContain("Searching saved work");
  } finally { await act(async () => root.unmount()); }
});
