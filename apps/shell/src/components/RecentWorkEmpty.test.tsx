// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { RecentWorkEmpty } from "./RecentWorkEmpty";

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
it("keeps the empty home chat secondary without a competing new-chat action", () => {
  act(() => root.render(<RecentWorkEmpty view="chats" />));
  expect(container.textContent).toBe("Your conversations will appear here.");
  expect(container.querySelector("button")).toBeNull();
});
it("shows the routine explanation after switching from the empty chat view", () => {
  act(() => root.render(<RecentWorkEmpty view="chats" />));
  act(() => root.render(<RecentWorkEmpty view="routines" />));
  expect(container.querySelector("h3")?.textContent).toBe("No routines");
  expect(container.textContent).toContain("Let Aux handle the tasks you do on repeat.");
});
