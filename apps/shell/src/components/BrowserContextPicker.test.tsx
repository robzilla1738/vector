// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import type { PageTarget } from "@aux/contracts";
import { useStore } from "../store";
import { BrowserContextPicker } from "./BrowserContextPicker";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function page(pageId: string, url: string): PageTarget {
  return { pageId, backend: "aux", targetId: pageId, url, title: pageId, documentEpoch: 1, lastRevision: 0,
    viewStatus: "visible", controller: "human", controllerEpoch: 0, ownedByRuntime: false, createdAt: 1, lastActiveAt: 1 };
}

it("offers website context and a page-free choice while an internal tab is active", async () => {
  const initial = useStore.getState();
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  useStore.setState({ activePageId: "internal", pages: [page("internal", "chrome://newtab"), page("blank", "about:blank"), page("website", "https://example.test/")] });
  try {
    await act(async () => root.render(<BrowserContextPicker value="active" onChange={() => {}} />));
    const trigger = host.querySelector<HTMLButtonElement>('[aria-label="Browser context"]')!;
    expect(trigger.textContent).toContain("Current tab: no website");
    await act(async () => trigger.click());
    const choices = Array.from(document.querySelectorAll(".context-choice"), node => node.textContent);
    expect(choices).toContain("No browser contextChat without attaching a tab");
    expect(choices.some(text => text?.includes("website"))).toBe(true);
    expect(choices.some(text => text?.includes("internal") || text?.includes("blank"))).toBe(false);
  } finally { await act(async () => root.unmount()); host.remove(); useStore.setState(initial, true); }
});

it("keeps a closed explicit selection actionable until the person removes or replaces it", async () => {
  const initial = useStore.getState();
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  useStore.setState({ activePageId: "website", pages: [page("website", "https://example.test/")] });
  const selections: string[] = [];
  try {
    await act(async () => root.render(<BrowserContextPicker value="closed" onChange={value => selections.push(value)} />));
    const trigger = host.querySelector<HTMLButtonElement>('[aria-label="Browser context"]')!;
    expect(trigger.textContent).toContain("Selected tab unavailable — choose another");
    expect(selections).toEqual([]);
    await act(async () => trigger.click());
    const remove = Array.from(document.querySelectorAll<HTMLButtonElement>(".context-choice")).find(node => node.textContent?.startsWith("No browser context"))!;
    await act(async () => remove.click());
    expect(selections).toEqual(["none"]);
  } finally { await act(async () => root.unmount()); host.remove(); useStore.setState(initial, true); }
});
