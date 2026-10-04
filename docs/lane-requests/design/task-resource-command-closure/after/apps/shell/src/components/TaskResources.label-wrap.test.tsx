// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
vi.mock("../use-feature", () => ({useFeature:()=>true,featureStage:()=>"on"}));
import { TaskSchema } from "@aux/contracts";
import { TaskResources } from "./TaskResources";
import { useStore } from "../store";

it("keeps complete resource label, reference policy and rename cancellation while wrapping", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype,"getClientRects").mockReturnValue([{width:100}] as unknown as DOMRectList);
  const initial = useStore.getState();
  useStore.setState({ pages: [] });
  const task = TaskSchema.parse({
    taskId: "original",
    workspaceId: "workspace",
    revision: 1,
    state: "open",
    createdAt: 1,
    updatedAt: 1,
    title: "Original task",
    objective: "Keep original references",
    criteria: [{ criterionId: "one", description: "Original", verification: "manual" }],
    resources: [
      {
        resourceId: "original-resource",
        kind: "file",
        locator: "/original/reference-only/document.txt",
        label: "Resource" + "R".repeat(192),
        access: "reference",
      },
    ],
  });
  const host = document.createElement("div"),
    style = document.createElement("style"),
    root = createRoot(host);
  style.textContent =
    readFileSync("apps/shell/src/styles/workspace.css", "utf8").match(
      /\.task-resource\s*>\s*strong\s*\{[^}]+\}/,
    )?.[0] ?? "";
  document.body.append(host);
  document.head.append(style);
  const update = vi.fn(async () => true);
  try {
    await act(async () =>
      root.render(<TaskResources task={task} activePageId={null} attached={false} update={update} />),
    );
    const article = host.querySelector<HTMLElement>(".task-resource")!,
      title = article.querySelector("strong")!,
      rename = [...article.querySelectorAll("button")].find((button) => button.textContent === "Rename")!;
    expect(article.getAttribute("aria-label")).toBe(task.resources[0]!.label);
    expect(title.textContent).toBe(task.resources[0]!.label);
    expect(getComputedStyle(title).overflowWrap).toBe("anywhere");
    expect(article.textContent).toContain("/original/reference-only/document.txt");
    expect(article.textContent).toContain("reference");
    rename.focus();
    expect(document.activeElement).toBe(rename);
    await act(async () => rename.click());
    const input = article.querySelector<HTMLInputElement>('[aria-label="Resource label"]')!;
    input.focus();
    input.setSelectionRange(170, 180);
    expect(input.value).toBe(task.resources[0]!.label);
    expect(input.maxLength).toBe(200);
    expect(input.selectionStart).toBe(170);
    expect(input.selectionEnd).toBe(180);
    const cancel = [...article.querySelectorAll("button")].find((button) => button.textContent === "Cancel")!;
    cancel.focus();
    expect(document.activeElement).toBe(cancel);
    await act(async () => cancel.click());
    expect(article.querySelector("strong")!.textContent).toBe(task.resources[0]!.label);
    expect(update).not.toHaveBeenCalled();
    const originalRename = [...article.querySelectorAll("button")].find(
      (button) => button.textContent === "Rename",
    )!;
    originalRename.focus();
    expect(document.activeElement).toBe(originalRename);
    const unrelated = document.createElement("strong");
    host.append(unrelated);
    expect(getComputedStyle(unrelated).overflowWrap).not.toBe("anywhere");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    style.remove();
    useStore.setState(initial, true);
    vi.restoreAllMocks();
  vi.unstubAllGlobals();
  }
});
