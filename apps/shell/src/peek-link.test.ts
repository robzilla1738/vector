import { normalizePages, orderedPages } from "./store/pages";
// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { makePage } from "./mock/fixtures";
import { useStore } from "./store";
import { closePeekLink, openPeekLink, promotePeekLink } from "./peek-link";

const initial = useStore.getState();
afterEach(() => {
  useStore.setState(initial, true);
  vi.restoreAllMocks();
});

it("keeps a native link hidden until promoted and activates that same page", async () => {
  const activate = vi.fn(async () => {});
  useStore.setState({
    openBackgroundTab: async (url, _space, _reuse, id) => {
      const page = makePage(0, { pageId: id!, url });
      useStore.setState({ pages: normalizePages([page]) });
      return page;
    },
    activate,
  });
  await openPeekLink("https://example.com/story");
  const id = useStore.getState().peekPageId;
  expect(id).toMatch(/^p_peek_/);
  expect(orderedPages(useStore.getState().pages)[0]?.pageId).toBe(id);
  await promotePeekLink();
  expect(useStore.getState().peekPageId).toBeNull();
  expect(activate).toHaveBeenCalledWith(id);
});

it("closes a dismissed link and rejects unsafe addresses", async () => {
  const closeTab = vi.fn(async (id: string) =>
    useStore.setState((state) => ({
      pages: normalizePages(orderedPages(state.pages).filter((page) => page.pageId !== id)),
    })),
  );
  useStore.setState({
    openBackgroundTab: async (url, _space, _reuse, id) => {
      const page = makePage(0, { pageId: id!, url });
      useStore.setState({ pages: normalizePages([page]) });
      return page;
    },
    closeTab,
  });
  await expect(openPeekLink("javascript:alert(1)")).rejects.toThrow();
  await expect(openPeekLink("https://user:password@example.com/")).rejects.toThrow();
  await openPeekLink("https://example.com/story");
  const id = useStore.getState().peekPageId;
  await closePeekLink();
  expect(closeTab).toHaveBeenCalledWith(id);
  expect(useStore.getState().peekPageId).toBeNull();
});
