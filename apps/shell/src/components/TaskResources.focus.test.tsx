// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
vi.mock("../use-feature", () => ({useFeature:()=>true,featureStage:()=>"on"}));
import { TaskSchema } from "@aux/contracts";
import { TaskResources } from "./TaskResources";
import { useStore } from "../store";
const initial = useStore.getState();
const task = TaskSchema.parse({
  taskId: "original",
  workspaceId: "workspace",
  revision: 1,
  state: "open",
  createdAt: 1,
  updatedAt: 1,
  title: "Original",
  objective: "Original reference",
  criteria: [{ criterionId: "one", description: "Original", verification: "manual" }],
  resources: [
    {
      resourceId: "reference",
      kind: "file",
      locator: "/original/reference-only.txt",
      label: "Resource" + "R".repeat(192),
      access: "reference",
    },
  ],
});
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const update = vi.fn(async () => true);
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype,"getClientRects").mockReturnValue([{width:100}] as unknown as DOMRectList);
  useStore.setState({ pages: [] });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  update.mockClear();
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const button = (text: string) =>
  [...host.querySelectorAll<HTMLButtonElement>("button")].find((node) => node.textContent === text)!;
async function open() {
  await act(async () =>
    root.render(<TaskResources task={task} activePageId={null} attached={false} update={update} />),
  );
  button("Rename").focus();
  await act(async () => button("Rename").click());
  return host.querySelector<HTMLInputElement>('[aria-label="Resource label"]')!;
}
it.each(["input", "cancel"])(
  "Cancel returns original Rename focus when removing its focused %s",
  async (focus) => {
    const input = await open(),
      rename = button("Rename"),
      cancel = button("Cancel");
    (focus === "input" ? input : cancel).focus();
    await act(async () => cancel.click());
    expect(document.activeElement).toBe(rename);
    expect(rename.isConnected).toBe(true);
    expect(input.isConnected).toBe(false);
    expect(host.querySelector(".task-resource strong")!.textContent).toBe(task.resources[0]!.label);
    expect(update).not.toHaveBeenCalled();
  },
);
it.each(["outside", "dialog"])("Cancel preserves a newer %s focus owner", async (kind) => {
  const input = await open(),
    cancel = button("Cancel"),
    outer = document.createElement(kind === "dialog" ? "dialog" : "div"),
    target = document.createElement("button");
  outer.setAttribute("open", "");
  target.textContent = "Original newer focus";
  outer.append(target);
  document.body.append(outer);
  try {
    target.focus();
    await act(async () => cancel.click());
    expect(document.activeElement).toBe(target);
    expect(input.isConnected).toBe(false);
    expect(host.querySelector(".task-resource strong")!.textContent).toBe(task.resources[0]!.label);
    expect(update).not.toHaveBeenCalled();
  } finally {
    outer.remove();
  }
});
it("Cancel does not focus an inert original Rename", async () => {
  const input = await open(),
    cancel = button("Cancel");
  input.focus();
  button("Rename").inert = true;
  button("Rename").setAttribute("inert", "");
  await act(async () => cancel.click());
  expect(document.activeElement).not.toBe(button("Rename"));
  expect(input.isConnected).toBe(false);
  expect(update).not.toHaveBeenCalled();
});
