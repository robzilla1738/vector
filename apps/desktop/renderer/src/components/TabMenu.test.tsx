// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import type { PageTarget } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { emptyLayout, tabLabel } from "../workspace";
import { TabMenu } from "./TabMenu";

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); document.body.replaceChildren(); });

it("reviews and applies an AI tab label, then restores the page title", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callback(0); return 1; });
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} }));
  const page = { pageId: "p1", url: "https://example.com/report", title: "Quarterly report — Example",
    documentEpoch: 3, viewStatus: "visible", controller: "none", ownedByRuntime: false } as PageTarget;
  useStore.setState({ layout: emptyLayout(), pages: [page], activePageId: page.pageId });
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async method => {
    if (method === "agent.tabName.suggest") return { name: "Quarterly report", pageId: page.pageId, sourceUrl: page.url,
      sourceTitle: page.title, documentEpoch: page.documentEpoch, modelId: "meta/muse-spark-1.3-contributor" };
    throw new Error(`Unexpected ${method}`);
  });
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  const button = (name: string) => [...host.querySelectorAll<HTMLButtonElement>("button")].find(node => node.textContent?.includes(name))!;
  try {
    await act(async () => root.render(<TabMenu page={page} x={0} y={0} onClose={() => {}} />));
    await act(async () => button("Name tab").click());
    expect(host.textContent).toContain("AI sees this page title and site domain");
    await act(async () => button("Suggest with AI").click());
    expect(invoke).toHaveBeenCalledWith("agent.tabName.suggest", { pageId: page.pageId,
      expectedUrl: page.url, expectedDocumentEpoch: page.documentEpoch });
    expect(host.querySelector<HTMLInputElement>('[aria-label="Tab label"]')?.value).toBe("Quarterly report");
    expect(tabLabel(useStore.getState().layout, page)).toBe(page.title);
    await act(async () => button("Save tab label").click());
    expect(tabLabel(useStore.getState().layout, page)).toBe("Quarterly report");
    await act(async () => root.render(<></>));
    await act(async () => root.render(<TabMenu page={page} x={0} y={0} onClose={() => {}} />));
    await act(async () => button("Name tab").click());
    await act(async () => button("Use page title again").click());
    expect(tabLabel(useStore.getState().layout, page)).toBe(page.title);
  } finally { await act(async () => root.unmount()); }
});
