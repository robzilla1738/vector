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
  const createTask = vi.fn();
  act(() => root.render(<RecentWorkEmpty view="chats" onCreateTask={createTask} />));
  expect(container.textContent).toBe("Your conversations will appear here.");
  expect(container.querySelector("button")).toBeNull();
  expect(createTask).not.toHaveBeenCalled();
});
it("retains the routine creation action after switching from the empty chat view", () => {
  const createTask = vi.fn();
  act(() => root.render(<RecentWorkEmpty view="chats" onCreateTask={createTask} />));
  act(() => root.render(<RecentWorkEmpty view="routines" onCreateTask={createTask} />));
  const button = container.querySelector("button")!;
  expect(button.textContent).toContain("Create a task");
  act(() => button.click());
  expect(createTask).toHaveBeenCalledOnce();
  expect(container.textContent).toContain("Your saved routines will appear here.");
});
