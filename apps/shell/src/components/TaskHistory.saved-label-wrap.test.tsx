// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { TaskSchema, TaskReceiptSchema } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { TaskHistory } from "./TaskHistory";

it("wraps complete saved task title/resource names after original Retry and keeps Back focus", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const initial = useStore.getState(),
    originalWindow = bridge.windowId,
    originalKind = bridge.windowKind,
    originalPrivate = bridge.privateMode,
    scrollDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
  bridge.windowId = "history-diagnostic-original";
  bridge.windowKind = "normal";
  bridge.privateMode = false;
  const visible = vi
    .spyOn(HTMLElement.prototype, "getClientRects")
    .mockReturnValue([{}] as unknown as DOMRectList);
  HTMLElement.prototype.scrollIntoView = vi.fn();
  const reason = new Error("https://history.fixture.invalid/" + "diagnostic".repeat(100));
  const task = TaskSchema.parse({
    taskId: "saved",
    revision: 1,
    workspaceId: "workspace",
    title: "Task" + "T".repeat(196),
    objective: "Original objective",
    criteria: [{ criterionId: "one", description: "Original", verification: "manual" }],
    resources: [
      {
        resourceId: "resource",
        kind: "file",
        locator: "/original/reference-only/document.txt",
        label: "Resource" + "R".repeat(192),
      },
    ],
    state: "open",
    createdAt: 1,
    updatedAt: 1,
  });
  const receipt = TaskReceiptSchema.parse({
    taskId: "saved",
    taskRevision: 1,
    objective: "Original objective",
    generatedAt: 1,
    status: "needs_review",
    criteria: [],
    unresolvedActions: [],
    runs: [],
    modelCalls: 0,
    knownCostUsd: 0,
    costComplete: true,
  });
  let attempts = 0;
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "tasks.get") {
      if (++attempts === 1) throw reason;
      return { task, revisions: [task], runs: [], children: [] } as never;
    }
    if (method === "tasks.receipt") return receipt as never;
    throw new Error("Unexpected source call");
  });
  const host = document.createElement("div"),
    style = document.createElement("style");
  host.className = "task-content";
  document.body.append(host);
  document.head.append(style);
  const css = readFileSync("apps/shell/src/components/Tasks.css", "utf8");
  style.textContent =
    (css.match(/\.task-history\s+\[role="alert"\]\s*>\s*p\s*\{[^}]+\}/)?.[0] ?? "") +
    (css.match(/\.task-history-definition\s+:is\(h3,\s*strong\)\s*\{[^}]+\}/)?.[0] ?? "");
  const root = createRoot(host);
  const close = vi.fn();
  try {
    await act(async () => root.render(<TaskHistory taskId="saved" onClose={close} />));
    const text = host.querySelector<HTMLElement>('[role="alert"] > p')!,
      retry = host.querySelector<HTMLButtonElement>('[data-command-id="retry-task-history"]')!;
    expect(text.textContent).toBe(String(reason));
    expect(text.textContent!.length).toBeGreaterThan(900);
    expect(getComputedStyle(text).overflowWrap).toBe("anywhere");
    expect(text.querySelector("script")).toBeNull();
    expect(retry.disabled).toBe(false);
    retry.focus();
    expect(document.activeElement).toBe(retry);
    await act(async () => retry.click());
    expect(attempts).toBe(2);
    expect(host.querySelector('[role="alert"]')).toBeNull();
    const title = host.querySelector<HTMLElement>(".task-history-definition h3")!,
      resource = host.querySelector<HTMLElement>(".task-history-definition strong")!;
    expect(title.textContent).toBe(task.title);
    expect(resource.textContent).toBe(task.resources[0]!.label);
    expect(getComputedStyle(title).overflowWrap).toBe("anywhere");
    expect(getComputedStyle(resource).overflowWrap).toBe("anywhere");
    expect(host.textContent).toContain("Original objective");
    expect(invoke).toHaveBeenCalledWith("tasks.receipt", { taskId: "saved", revision: 1 });
    const back = host.querySelector<HTMLButtonElement>('[data-command-id="close-task-history"]')!;
    back.focus();
    expect(document.activeElement).toBe(back);
    await act(async () => back.click());
    expect(close).toHaveBeenCalledOnce();
    const unrelated = document.createElement("p");
    host.append(unrelated);
    expect(getComputedStyle(unrelated).overflowWrap).not.toBe("anywhere");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    style.remove();
    invoke.mockRestore();
    visible.mockRestore();
    if (scrollDescriptor) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", scrollDescriptor);
    else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
    bridge.windowId = originalWindow;
    bridge.windowKind = originalKind;
    bridge.privateMode = originalPrivate;
    useStore.setState(initial, true);
    vi.unstubAllGlobals();
  }
});
