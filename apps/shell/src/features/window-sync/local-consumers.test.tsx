// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import type { PageTarget } from "@aux/contracts";
const { resolveSurface } = vi.hoisted(() => ({ resolveSurface: vi.fn() }));
vi.mock("../../bridge", () => ({
  inNativeHost: true,
  inMock: false,
  bridge: { windowId: "own", windowKind: "normal", privateMode: false, surfaceContentId: resolveSurface },
}));
vi.mock("../../store", () => ({ useStore: { getState: () => ({}), subscribe: () => () => {} } }));
vi.mock("../../components/surfaces", () => ({ MockPage: null }));
import { PageSurface } from "../../components/PageSurface";
afterEach(() => {
  vi.restoreAllMocks();
  resolveSurface.mockReset();
  vi.unstubAllGlobals();
});
const page = (pageId: string, windowId = "own", fields = {}): PageTarget => ({
  pageId,
  windowId,
  backend: "aux",
  targetId: pageId,
  url: `https://example.test/${pageId}`,
  title: pageId,
  documentEpoch: 1,
  lastRevision: 0,
  viewStatus: "hidden",
  controller: "none",
  controllerEpoch: 0,
  ownedByRuntime: false,
  createdAt: 1,
  lastActiveAt: 1,
  ...fields,
});
it("resolves a surface only after an actual foreign page becomes local and removes it when ownership moves", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  resolveSurface.mockResolvedValue("native-owner-content");
  const node = document.createElement("div");
  document.body.append(node);
  const root = createRoot(node);
  try {
    await act(async () => root.render(<PageSurface page={page("moving", "other")} />));
    expect(resolveSurface).not.toHaveBeenCalled();
    expect(node.querySelector("embed")).toBeNull();
    await act(async () => root.render(<PageSurface page={page("moving")} />));
    expect(resolveSurface).toHaveBeenCalledExactlyOnceWith("moving");
    expect(node.querySelector("embed")?.getAttribute("data-content-id")).toBe("native-owner-content");
    await act(async () => root.render(<PageSurface page={page("moving", "other")} />));
    expect(node.querySelector("embed")).toBeNull();
    expect(resolveSurface).toHaveBeenCalledTimes(1);
  } finally {
    await act(async () => root.unmount());
    node.remove();
  }
});
