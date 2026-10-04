// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
vi.mock("../use-feature", () => ({useFeature:()=>true,featureStage:()=>"on"}));
import type { Task } from "@aux/contracts";
import { makePage } from "../mock/fixtures";
import { useStore } from "../store";
import { TaskResources } from "./TaskResources";

const initial = useStore.getState();
let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype,"getClientRects").mockReturnValue([{width:100}] as unknown as DOMRectList);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("keeps a page resource current and attaches the latest active tab details", async () => {
  const task: Task = { taskId: "task", workspaceId: "workspace", revision: 1, state: "open", createdAt: 1, updatedAt: 1,
    title: "Inspect source", objective: "Review the page", criteria: [{ criterionId: "done", description: "Reviewed", verification: "manual" }],
    resources: [{ resourceId: "source", kind: "page", locator: "page", label: "Source page" }] };
  const page = makePage(0, { pageId: "page", title: "First title", url: "https://example.com/first" });
  useStore.setState({ pages: [page] });
  const update = vi.fn(async () => true);
  await act(async () => root.render(<TaskResources task={task} activePageId="page" attached={false} update={update} />));
  expect(host.textContent).toContain("https://example.com/first");

  await act(async () => useStore.setState({ pages: [{ ...page, title: "Latest title", url: "https://example.com/latest" }] }));
  expect(host.textContent).toContain("https://example.com/latest");
  expect(host.textContent).not.toContain("https://example.com/first");

  const attach = [...host.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent === "Attach current tab")!;
  await act(async () => attach.click());
  expect(update).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({
    kind: "page", locator: "page", label: "Latest title",
  })]));
});
