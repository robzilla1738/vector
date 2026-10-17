// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { BookmarkFolderSnapshot } from "@aux/contracts/bookmark-folder-methods";
import { BookmarkFolderNavigation } from "./BookmarkFolderNavigation";

const snapshot: BookmarkFolderSnapshot = {
  rootId: "1",
  editable: true,
  folders: [
    {
      nodeId: "1",
      parentId: null,
      index: 0,
      title: "Bookmarks",
      path: [],
      permanent: true,
      childIds: ["2", "3"],
    },
    {
      nodeId: "2",
      parentId: "1",
      index: 0,
      title: "Research",
      path: ["Research"],
      permanent: false,
      childIds: ["4"],
    },
    {
      nodeId: "3",
      parentId: "1",
      index: 1,
      title: "Research",
      path: ["Research"],
      permanent: false,
      childIds: [],
    },
    {
      nodeId: "4",
      parentId: "2",
      index: 0,
      title: "Sources",
      path: ["Research", "Sources"],
      permanent: false,
      childIds: [],
    },
  ],
};
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});
it("keeps same-named folders distinct and reveals a selected descendant after navigation elsewhere", async () => {
  const select = vi.fn();
  const render = async (selectedId: string) =>
    act(async () =>
      root.render(
        <BookmarkFolderNavigation
          snapshot={snapshot}
          selectedId={selectedId}
          disabled={false}
          onSelect={select}
        />,
      ),
    );
  await render("3");
  const destinations = [...host.querySelectorAll<HTMLButtonElement>(".library-folder-destination")];
  const sameNames = destinations.filter((node) => node.textContent === "Research");
  expect(sameNames).toHaveLength(2);
  expect(sameNames[0]!.hasAttribute("aria-current")).toBe(false);
  expect(sameNames[1]!.getAttribute("aria-current")).toBe("location");
  await act(async () => sameNames[0]!.click());
  expect(select).toHaveBeenCalledWith("2");
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Collapse Research"]')!.click());
  expect(host.querySelector("ul ul")?.hasAttribute("hidden")).toBe(true);
  await render("4");
  expect(host.querySelector("ul ul")?.hasAttribute("hidden")).toBe(false);
  expect(host.querySelector('[aria-current="location"]')?.textContent).toBe("Sources");
});
it("does not navigate while a bookmark mutation is pending", async () => {
  const select = vi.fn();
  await act(async () =>
    root.render(<BookmarkFolderNavigation snapshot={snapshot} selectedId="1" disabled onSelect={select} />),
  );
  for (const button of host.querySelectorAll<HTMLButtonElement>("button")) {
    expect(button.disabled).toBe(true);
    button.click();
  }
  expect(select).not.toHaveBeenCalled();
});
