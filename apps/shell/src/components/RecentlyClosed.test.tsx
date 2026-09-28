// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useStore } from "../store";
import { RecentlyClosed } from "./RecentlyClosed";

const initial = useStore.getState();
let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.unstubAllGlobals();
});

it("updates one closed-tab row while keeping its group action", async () => {
  const spaceId = initial.layout.activeSpaceId;
  const first = { pageId: "closed-one", url: "https://example.com/one", title: "First page", spaceId,
    index: 0, closedAt: Date.now(), groupId: "closed-group" };
  const second = { ...first, pageId: "closed-two", url: "https://example.com/two", title: "Second page", index: 1 };
  useStore.setState({ closedTabs: [first, second], reopeningTab: false });
  await act(async () => root.render(<RecentlyClosed query="" />));
  expect(host.textContent).toContain("Reopen group · 2");
  expect(host.textContent).toContain("Second page");

  await act(async () => useStore.setState({ closedTabs: [first, { ...second, title: "Renamed page" }] }));
  expect(host.textContent).toContain("Renamed page");
  expect(host.textContent).not.toContain("Second page");
  expect(host.textContent).toContain("First page");
});
