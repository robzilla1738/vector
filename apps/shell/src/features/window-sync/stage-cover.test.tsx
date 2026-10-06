import { normalizePages } from "../../store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import type { PageTarget } from "@aux/contracts";
const fixture = vi.hoisted(() => ({ enabled: true, state: {} as Record<string, unknown>, resolve: vi.fn() }));
vi.mock("../../bridge", () => ({
  inNativeHost: true,
  inMock: false,
  bridge: {
    windowId: "own",
    windowKind: "normal",
    privateMode: false,
    surfaceContentId: fixture.resolve,
    setStageVisible: vi.fn(async () => {}),
  },
}));
vi.mock("../../store", () => ({
  useStore: Object.assign((selector: (state: unknown) => unknown) => selector(fixture.state), {
    getState: () => fixture.state,
    subscribe: () => () => {},
  }),
  call: vi.fn(),
  errToast: vi.fn(),
}));
vi.mock("../../use-feature", () => ({
  useFeature: () => fixture.enabled,
  featureStage: () => (fixture.enabled ? "on" : "off"),
}));
vi.mock("../../components/TranslationBar", () => ({ TranslationBar: () => null }));
vi.mock("../../components/StartPage", () => ({ StartPage: () => null }));
vi.mock("../../agent/AgentOverlay", () => ({ AgentOverlay: () => null }));
vi.mock("../../components/surfaces", () => ({ MockPage: null, Conversation: () => null }));
import { Stage } from "../../components/Stage";
import { emptyLayout } from "../../workspace";
import { MovedTabPlaceholder } from "../../components/MovedTabPlaceholder";
import { rememberMovedSelection } from "./moved-selection";
const page = (
  pageId: string,
  windowId: string,
  controller: PageTarget["controller"] = "none",
): PageTarget => ({
  pageId,
  windowId,
  backend: "aux",
  targetId: pageId,
  url: `https://example.test/${pageId}`,
  title: pageId,
  documentEpoch: 1,
  lastRevision: 0,
  viewStatus: "visible",
  controller,
  controllerEpoch: 0,
  ownedByRuntime: false,
  createdAt: 1,
  lastActiveAt: 1,
});
afterEach(() => {
  rememberMovedSelection(null);
  fixture.resolve.mockReset();
  vi.unstubAllGlobals();
});
it("removes the native guest for a working remote card and restores the same guest after dismissing it; disabled feature retains the guest", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  fixture.enabled = true;
  fixture.resolve.mockResolvedValue("existing-native-content");
  fixture.state = {
    pages: normalizePages([page("local", "own"), page("remote", "other", "agent")] as never),
    activePageId: "local",
    layout: emptyLayout(),
    mode: "focus",
    splitPageId: null,
    overlay: null,
    confirmation: null,
  };
  const node = document.createElement("div");
  node.className = "stage-wrap";
  document.body.append(node);
  const root = createRoot(node);
  const render = () =>
    root.render(
      <>
        <Stage />
        {fixture.enabled && <MovedTabPlaceholder />}
      </>,
    );
  try {
    await act(async () => {
      render();
    });
    // Await the actual lazy PageSurface import and its native-content lookup.
    for (let attempt = 0; !node.querySelector("embed") && attempt < 100; attempt++) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
    }
    expect(node.querySelector("embed")?.getAttribute("data-content-id")).toBe("existing-native-content");
    await act(async () => {
      rememberMovedSelection({ pageId: "remote", windowId: "other" });
    });
    expect(node.textContent).toContain("Aux is working in this tab in Window other");
    expect(node.querySelector("embed")).toBeNull();
    expect([...node.querySelectorAll("button")].map((button) => button.textContent)).toContain("Show window");
    expect(node.textContent).not.toContain("Bring it back");
    await act(async () => {
      rememberMovedSelection(null);
    });
    expect(node.querySelector("embed")?.getAttribute("data-content-id")).toBe("existing-native-content");
    await act(async () => {
      rememberMovedSelection({ pageId: "remote", windowId: "other" });
      fixture.enabled = false;
      render();
    });
    expect(node.querySelector("embed")?.getAttribute("data-content-id")).toBe("existing-native-content");
    expect(node.querySelector(".moved-tab-placeholder")).toBeNull();
    expect(fixture.resolve.mock.calls.every(([id]) => id === "local")).toBe(true);
  } finally {
    await act(async () => root.unmount());
    node.remove();
  }
});
