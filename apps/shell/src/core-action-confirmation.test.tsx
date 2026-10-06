import { normalizePages } from "./store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { executeCommand } from "./commands";
import { bridge } from "./bridge";
import { useStore } from "./store";

const stages = vi.hoisted(() => ({ trust: "preview" as "preview" | "off" | "on" }));
vi.mock("./use-feature", () => ({
  featureStage: (feature: string) => (feature === "agentSitePermissions" ? stages.trust : "off"),
  useFeature: (feature: string) => feature === "agentSitePermissions" && stages.trust === "on",
}));
vi.mock("./bridge", async (original) => ({
  ...(await original<typeof import("./bridge")>()),
  inMock: false,
  inNativeHost: true,
}));
let root: ReturnType<typeof createRoot>, original: ReturnType<typeof useStore.getState>;
const confirmation = {
  approvalId: "original-approval",
  turnId: "original-turn",
  threadId: "original-thread",
  instruction: "Allow the explicitly requested destination",
  origin: "http://127.0.0.1:9",
  action: "navigate",
  category: "login" as const,
  confirmation: "action" as const,
  kind: "approval" as const,
  policyCategory: "credentials" as const,
  site: "http://127.0.0.1:9",
};
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  original = useStore.getState();
  root = createRoot(document.createElement("div"));
  useStore.setState({ pages: normalizePages([]), confirmation });
  vi.spyOn(bridge, "overlay").mockResolvedValue(false);
  vi.spyOn(bridge, "focusShell").mockResolvedValue(undefined);
});
afterEach(async () => {
  await act(async () => root.unmount());
  useStore.setState(original, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("refuses changed original approval payloads before RPC", async () => {
  const invoke = vi.spyOn(bridge, "invoke");
  await expect(
    executeCommand("approve-agent-action", {
      payload: { approvalId: "retired", turnId: confirmation.turnId },
    }),
  ).rejects.toThrow("ended or changed");
  await expect(
    executeCommand("deny-agent-action", {
      payload: { approvalId: confirmation.approvalId, turnId: "retired" },
    }),
  ).rejects.toThrow("ended or changed");
  expect(invoke).not.toHaveBeenCalled();
});
it("retains a newer confirmation while an original acceptance response is held", async () => {
  stages.trust = "off";
  let release!: () => void;
  vi.spyOn(bridge, "invoke").mockImplementation(
    () =>
      new Promise((resolve) => {
        release = () => resolve({ ok: true });
      }),
  );
  const pending = executeCommand("approve-agent-action", {
    payload: { approvalId: confirmation.approvalId, turnId: confirmation.turnId },
  });
  const replacement = { ...confirmation, approvalId: "replacement", turnId: "replacement-turn" };
  useStore.setState({ confirmation: replacement });
  release();
  await pending;
  expect(useStore.getState().confirmation).toBe(replacement);
});
it("takes over the original requested page through core dispatch with site permissions off", async () => {
  stages.trust = "off";
  const activate = vi.fn(async () => {}),
    invoke = vi.spyOn(bridge, "invoke").mockResolvedValue({ ok: true });
  useStore.setState({
    activePageId: "other",
    activate,
    confirmation: {
      ...confirmation,
      approvalId: undefined,
      kind: "handoff",
      confirmation: "handoff",
      pageId: "requested",
    },
  });
  await executeCommand("take-over-agent-action", {
    payload: { pageId: "requested", turnId: confirmation.turnId },
  });
  expect(invoke).toHaveBeenCalledExactlyOnceWith("pages.takeover", { pageId: "requested" });
  expect(activate).toHaveBeenCalledExactlyOnceWith("requested");
  expect(useStore.getState().confirmation).toBeNull();
});
