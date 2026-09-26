// @vitest-environment jsdom
import { act, memo } from "react";
import { createRoot } from "react-dom/client";
import type { PageTarget } from "@aux/contracts";
import { afterEach, expect, it, vi } from "vitest";
import { useStore } from "./store";
import { useTabMembership } from "./use-tab-membership";

const originalPages = useStore.getState().pages;
const page = (pageId: string, title: string) =>
  ({ pageId, title, viewStatus: "visible", ownedByRuntime: false }) as PageTarget;

afterEach(() => {
  act(() => useStore.setState({ pages: originalPages }));
  vi.unstubAllGlobals();
});

it("updates only the changed tab row for page metadata, then updates list membership on close", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const renders = { list: vi.fn(), first: vi.fn(), second: vi.fn() };
  const Row = memo(({ id }: { id: string }) => {
    const tab = useStore((state) => state.pages.find((item) => item.pageId === id));
    renders[id === "first" ? "first" : "second"]();
    return <span>{tab?.title}</span>;
  });
  function List() {
    const tabs = useTabMembership();
    renders.list();
    return (
      <>
        {tabs.map((tab) => (
          <Row key={tab.pageId} id={tab.pageId} />
        ))}
      </>
    );
  }
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    act(() => useStore.setState({ pages: [page("first", "First"), page("second", "Second")] }));
    act(() => root.render(<List />));
    expect(renders.list).toHaveBeenCalledTimes(1);
    expect(renders.first).toHaveBeenCalledTimes(1);
    expect(renders.second).toHaveBeenCalledTimes(1);

    act(() =>
      useStore.setState((state) => ({
        pages: state.pages.map((tab) => (tab.pageId === "second" ? { ...tab, title: "Renamed" } : tab)),
      })),
    );
    expect(host.textContent).toBe("FirstRenamed");
    expect(renders.list).toHaveBeenCalledTimes(1);
    expect(renders.first).toHaveBeenCalledTimes(1);
    expect(renders.second).toHaveBeenCalledTimes(2);

    act(() =>
      useStore.setState((state) => ({ pages: state.pages.filter((tab) => tab.pageId !== "second") })),
    );
    expect(host.textContent).toBe("First");
    expect(renders.list).toHaveBeenCalledTimes(2);
  } finally {
    act(() => root.unmount());
  }
});
