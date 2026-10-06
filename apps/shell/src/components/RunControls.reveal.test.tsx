import { normalizePages } from "../store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { PageTarget } from "@aux/contracts";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

vi.mock("../bridge", async (original) => ({
  ...(await original<typeof import("../bridge")>()),
  inNativeHost: true,
  inMock: false,
}));
vi.mock("./surfaces", () => ({ Conversation: () => <p>Task conversation</p>, MockPage: null }));

import { bridge } from "../bridge";
import { useStore } from "../store";
import { emptyLayout } from "../workspace";
import { makeRun } from "../mock/fixtures";
import { RunControls } from "./RunControls";
import { Stage } from "./Stage";

const initial = useStore.getState();
const page = (pageId: string, runId?: string, windowId = bridge.windowId): PageTarget => ({
  pageId,
  windowId,
  backend: "aux",
  targetId: `atab-${pageId}`,
  url: `https://example.test/${pageId}`,
  title: pageId,
  documentEpoch: 1,
  lastRevision: 0,
  viewStatus: runId ? "background" : "visible",
  controller: runId ? "agent" : "none",
  controllerEpoch: 4,
  ownedByRuntime: !!runId,
  createdAt: 1,
  lastActiveAt: 1,
  ...(runId
    ? {
        agentIsolation: {
          isolationId: `isolation-${pageId}`,
          runId,
          taskRevision: 0,
          inMemory: true,
          cookies: "empty",
        },
      }
    : {}),
});

beforeEach(() => {
  // jsdom has no layout; model the mounted visible controls explicitly.
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100, height: 30 },
  ] as unknown as DOMRectList);
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(bridge, "overlay").mockResolvedValue(true);
  vi.spyOn(bridge, "invoke").mockRejectedValue(new Error("Reveal must not issue a runtime control RPC"));
  vi.spyOn(bridge, "tabCommand").mockResolvedValue({
    commandId: "focus",
    status: "applied",
    catalogVersion: 1,
  });
  vi.spyOn(bridge, "surfaceContentId").mockResolvedValue("native-task-surface");
  useStore.setState(
    {
      ...initial,
      layout: emptyLayout(),
      mode: "conversation",
      overlay: "tasks",
      activePageId: "owner",
      restoringTabs: false,
      pendingRestoreIds: [],
      confirmation: null,
      runs: [makeRun({ runId: "run", status: "running", pageIds: ["controlled"] })],
      pages: normalizePages([page("owner"), page("another-run", "other"), page("controlled", "run")]),
    },
    true,
  );
});
afterEach(() => {
  vi.restoreAllMocks();
  useStore.setState(initial, true);
  vi.unstubAllGlobals();
});

it("reveals the exact isolated native surface from the task scrim without taking control", async () => {
  const node = document.createElement("div");
  document.body.append(node);
  const root = createRoot(node);
  const originalPages = useStore.getState().pages;
  const originalRuns = useStore.getState().runs;
  try {
    await act(async () =>
      root.render(
        <>
          <RunControls runId="run" />
          <Stage />
        </>,
      ),
    );
    expect(node.querySelector("embed")).toBeNull();
    const open = [...node.querySelectorAll("button")].find(
      (button) => button.textContent === "Open temporary tab",
    )!;
    await act(async () => {
      await import("./PageSurface");
      open.click();
    });
    expect(node.querySelector("embed")?.getAttribute("data-content-id")).toBe("native-task-surface");
    expect(useStore.getState()).toMatchObject({ activePageId: "controlled", mode: "focus", overlay: null });
    expect(bridge.tabCommand).toHaveBeenCalledExactlyOnceWith(
      { kind: "activate", pageId: "controlled" },
      undefined,
    );
    expect(bridge.surfaceContentId).toHaveBeenCalledWith("controlled");
    expect(node.querySelector("embed")?.getAttribute("aria-label")).toBe("controlled");
    expect(useStore.getState().pages).toBe(originalPages);
    expect(useStore.getState().runs).toBe(originalRuns);
    expect(useStore.getState().pages.byId["controlled"]).toMatchObject({
      controller: "agent",
      controllerEpoch: 4,
    });
    expect(bridge.invoke).not.toHaveBeenCalled();
  } finally {
    await act(async () => root.unmount());
    node.remove();
  }
});

it("does not substitute a different window’s isolated tab or an ordinary owner page", async () => {
  useStore.setState({
    pages: normalizePages([page("owner"), page("controlled", "run", "other-window"), page("other", "other")]),
  });
  const node = document.createElement("div");
  document.body.append(node);
  const root = createRoot(node);
  try {
    await act(async () => root.render(<RunControls runId="run" />));
    const open = [...node.querySelectorAll("button")].find(
      (button) => button.textContent === "Open temporary tab",
    )!;
    expect(open.disabled).toBe(true);
    expect(open.title).toContain("original browser window");
    await act(async () => open.click());
    expect(bridge.tabCommand).not.toHaveBeenCalled();
    expect(bridge.invoke).not.toHaveBeenCalled();
    expect(useStore.getState()).toMatchObject({
      activePageId: "owner",
      mode: "conversation",
      overlay: "tasks",
    });
  } finally {
    await act(async () => root.unmount());
    node.remove();
  }
});

it("surfaces native activation refusal without silently taking control", async () => {
  vi.mocked(bridge.tabCommand).mockResolvedValue({
    commandId: "focus",
    status: "rejected",
    catalogVersion: 1,
    error: { code: "not_found", message: "Tab is not in this window" },
  });
  const node = document.createElement("div");
  document.body.append(node);
  const root = createRoot(node);
  try {
    await act(async () => root.render(<RunControls runId="run" />));
    const open = [...node.querySelectorAll("button")].find(
      (button) => button.textContent === "Open temporary tab",
    )!;
    await act(async () => open.click());
    expect(node.querySelector('[role="alert"]')?.textContent).toContain(
      "Open temporary tab wasn’t confirmed. Tab is not in this window",
    );
    expect(bridge.invoke).not.toHaveBeenCalled();
    expect(useStore.getState().pages.byId["controlled"]?.controller).toBe("agent");
  } finally {
    await act(async () => root.unmount());
    node.remove();
  }
});
