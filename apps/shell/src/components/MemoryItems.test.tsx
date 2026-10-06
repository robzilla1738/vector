// @vitest-environment jsdom
import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { WorkspaceMemory } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { MemoryItems } from "./MemoryItems";
let host: HTMLDivElement,
  root: ReturnType<typeof createRoot>,
  priorLayout: ReturnType<typeof useStore.getState>["layout"];
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  priorLayout = useStore.getState().layout;
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState({ layout: priorLayout });
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("inspects recorded provenance, filters excluded notes and saves the exact note revision", async () => {
  const memory: WorkspaceMemory = {
    workspaceId: "space-a",
    revision: 7,
    content: "Overview",
    excludedOrigins: ["https://excluded.example"],
    items: [
      {
        itemId: "one",
        content: "Keep explanations concise",
        sourceUrl: "https://source.example/article",
        enabled: true,
        createdAt: 1,
        updatedAt: 2,
      },
      {
        itemId: "two",
        content: "Excluded source note",
        sourceUrl: "https://excluded.example/page",
        enabled: true,
        createdAt: 1,
        updatedAt: 2,
      },
    ],
  };
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method, params) => {
    if (method !== "workspaces.memory.set") throw new Error(`Unexpected ${method}`);
    return { ...memory, items: (params as { items: WorkspaceMemory["items"] }).items, revision: 8 } as never;
  });
  useStore.setState({
    layout: {
      ...priorLayout,
      spaces: [...priorLayout.spaces, { id: "owned-fixture", workspaceId: "space-a" } as never],
    },
  });
  function Harness() {
    const [value, setValue] = useState(memory);
    return <MemoryItems memory={value} disabled={false} onSaved={setValue} />;
  }
  await act(async () => root.render(<Harness />));
  await act(async () =>
    [...host.querySelectorAll<HTMLButtonElement>("button")]
      .find((button) => button.textContent?.includes("Keep explanations concise"))!
      .click(),
  );
  expect(host.querySelector(".memory-note-metadata")?.textContent).toContain(
    "https://source.example/article",
  );
  expect(host.querySelector(".memory-note-metadata")?.textContent).toContain("This Space");
  const filter = host.querySelector<HTMLSelectElement>('[aria-label="Filter memory notes"]')!;
  await act(async () => {
    filter.value = "excluded";
    filter.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(host.querySelector(".memory-items-list")?.textContent).toContain("Excluded source note");
  expect(host.querySelector(".memory-items-list")?.textContent).not.toContain("Keep explanations concise");
  await act(async () => {
    filter.value = "all";
    filter.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await act(async () =>
    host.querySelector<HTMLInputElement>('[aria-label="Use note: Keep explanations concise"]')!.click(),
  );
  expect(invoke).toHaveBeenCalledWith(
    "workspaces.memory.set",
    expect.objectContaining({
      workspaceId: "space-a",
      expectedRevision: 7,
      content: "Overview",
      items: expect.arrayContaining([
        expect.objectContaining({
          itemId: "one",
          enabled: false,
          sourceUrl: "https://source.example/article",
        }),
      ]),
    }),
  );
  expect(host.querySelector(".memory-items-list")?.textContent).toContain("Paused");
});
